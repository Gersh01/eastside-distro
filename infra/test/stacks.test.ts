import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ENVIRONMENTS, SHARED } from '../lib/config';
import { EastsideStack } from '../lib/eastside-stack';
import { EastsideSharedStack } from '../lib/shared-stack';

// Security properties the infrastructure must keep. Run with `npm test` in infra/.

const env = { region: SHARED.region };

function synthEnvironment(name: 'staging' | 'production') {
  const config = ENVIRONMENTS.find((environment) => environment.name === name);
  assert.ok(config, `missing ${name} config`);
  const stack = new EastsideStack(new App(), config.stackName, {
    env,
    config,
    deploymentVersion: 'test',
  });
  return Template.fromStack(stack);
}

type ContainerDefinition = {
  Environment: { Name: string; Value: unknown }[];
  Secrets: { Name: string }[];
};

describe('production', () => {
  const template = synthEnvironment('production');

  test('identity documents bucket is private, KMS-encrypted and expires objects', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          Match.objectLike({
            ServerSideEncryptionByDefault: Match.objectLike({ SSEAlgorithm: 'aws:kms' }),
          }),
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      LifecycleConfiguration: {
        Rules: Match.arrayWith([Match.objectLike({ ExpirationInDays: 90, Status: 'Enabled' })]),
      },
    });
  });

  test('database is encrypted, private, deletion-protected and snapshotted on delete', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', {
      Engine: 'postgres',
      StorageEncrypted: true,
      PubliclyAccessible: false,
      DeletionProtection: true,
      BackupRetentionPeriod: 14,
    });
    template.hasResource('AWS::RDS::DBInstance', {
      DeletionPolicy: 'Snapshot',
      UpdateReplacePolicy: 'Snapshot',
    });
  });

  test('database credentials reach the container as secrets, never plain environment variables', () => {
    const [taskDefinition] = Object.values(template.findResources('AWS::ECS::TaskDefinition'));
    const container = taskDefinition?.Properties.ContainerDefinitions[0] as ContainerDefinition;
    const environment = container.Environment.map((variable) => variable.Name);
    for (const name of ['PGPASSWORD', 'PGUSER', 'IP_HASH_SECRET']) {
      assert.ok(!environment.includes(name), `${name} must not be a plain env var`);
    }
    assert.deepEqual(container.Secrets.map((secret) => secret.Name).sort(), [
      'IP_HASH_SECRET',
      'PGDATABASE',
      'PGHOST',
      'PGPASSWORD',
      'PGPORT',
      'PGUSER',
    ]);
    const value = (name: string) => container.Environment.find((v) => v.Name === name)?.Value;
    assert.equal(value('PGSSLMODE'), 'verify-full');
    assert.equal(value('RUN_MIGRATIONS_ON_BOOT'), 'true');
    assert.equal(value('EMAIL_DRIVER'), 'ses');
  });

  test('Postgres admits only the web tasks, and the tasks admit only the load balancer', () => {
    const ingress = Object.values(template.findResources('AWS::EC2::SecurityGroupIngress'));
    const into = (groupPrefix: string) =>
      ingress.filter((rule) =>
        String(rule.Properties.GroupId?.['Fn::GetAtt']?.[0] ?? '').startsWith(groupPrefix),
      );
    const sourceOf = (rule: (typeof ingress)[number] | undefined) =>
      String(rule?.Properties.SourceSecurityGroupId?.['Fn::GetAtt']?.[0] ?? '');

    const databaseRules = into('DatabaseSecurityGroup');
    assert.equal(databaseRules.length, 1);
    assert.ok(sourceOf(databaseRules[0]).startsWith('WebServiceSecurityGroup'));
    assert.equal(databaseRules[0]?.Properties.CidrIp, undefined);

    const taskRules = into('WebServiceSecurityGroup');
    assert.equal(taskRules.length, 1);
    assert.ok(sourceOf(taskRules[0]).startsWith('WebLBSecurityGroup'));
    assert.equal(taskRules[0]?.Properties.FromPort, 3000);
  });

  test('deployments roll back automatically when tasks fail health checks', () => {
    template.hasResourceProperties('AWS::ECS::Service', {
      DeploymentConfiguration: Match.objectLike({
        DeploymentCircuitBreaker: { Enable: true, Rollback: true },
        MinimumHealthyPercent: 100,
      }),
    });
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      HealthCheckPath: '/api/health',
    });
  });
});

describe('staging', () => {
  const template = synthEnvironment('staging');

  test('database can be torn down', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', { DeletionProtection: false });
    template.hasResource('AWS::RDS::DBInstance', { DeletionPolicy: 'Delete' });
  });
});

describe('shared', () => {
  const template = Template.fromStack(
    new EastsideSharedStack(new App(), 'EastsideShared', { env }),
  );

  test('deploy role trusts only this repository’s GitHub environments', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
              StringLike: {
                'token.actions.githubusercontent.com:sub': ENVIRONMENTS.map(
                  (environment) =>
                    `repo:${SHARED.githubRepository}:environment:${environment.name}`,
                ),
              },
            },
          }),
        ],
      },
    });
  });

  test('deploy role can only assume the CDK bootstrap roles', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [Match.objectLike({ Action: 'sts:AssumeRole', Effect: 'Allow' })],
      },
    });
  });
});
