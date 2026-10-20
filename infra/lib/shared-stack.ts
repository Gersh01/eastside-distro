import { Aws, CfnOutput, Duration, Stack, Validations, type StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ses from 'aws-cdk-lib/aws-ses';
import type { Construct } from 'constructs';
import { ENVIRONMENTS, SHARED } from './config';

/**
 * Account-level resources shared by every environment, deployed once by hand
 * (see docs/runbooks/aws-setup.md):
 * - the GitHub Actions OIDC provider and the role the Deploy workflow assumes, and
 * - the SES domain identity used to send email.
 */
export class EastsideSharedStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const provider = SHARED.existingGithubOidcProviderArn
      ? iam.OidcProviderNative.fromOidcProviderArn(
          this,
          'GitHubOidc',
          SHARED.existingGithubOidcProviderArn,
        )
      : new iam.OidcProviderNative(this, 'GitHubOidc', {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        });

    // Only workflow jobs bound to a GitHub *environment* of this repository can assume the role,
    // so production deploys inherit that environment's required reviewers.
    const deployRole = new iam.Role(this, 'GitHubDeployRole', {
      roleName: 'eastside-github-deploy',
      description: 'Assumed by GitHub Actions (OIDC) to deploy East Side Distro with CDK',
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.oidcProviderArn, {
        StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
        StringLike: {
          'token.actions.githubusercontent.com:sub': ENVIRONMENTS.map(
            (environment) => `repo:${SHARED.githubRepository}:environment:${environment.name}`,
          ),
        },
      }),
    });
    // Least privilege for CDK: the role may only assume the bootstrap roles, which hold the
    // actual deploy, asset-publishing and lookup permissions.
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        // Pseudo-parameters keep the template identical with or without local AWS credentials.
        resources: [`arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-hnb659fds-*`],
      }),
    );
    Validations.of(deployRole).acknowledge({
      id: `AwsSolutions-IAM5[Resource::arn:<AWS::Partition>:iam::<AWS::AccountId>:role/cdk-hnb659fds-*]`,
      reason: 'Matches only the CDK bootstrap roles (deploy, file/image publishing, lookup).',
    });

    const emailZone = SHARED.emailHostedZone
      ? route53.PublicHostedZone.fromHostedZoneAttributes(this, 'EmailZone', SHARED.emailHostedZone)
      : undefined;
    const emailIdentity = new ses.EmailIdentity(this, 'EmailDomain', {
      identity: emailZone
        ? ses.Identity.publicHostedZone(emailZone)
        : ses.Identity.domain(SHARED.emailDomain),
    });

    new CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
      description: 'Set as the AWS_DEPLOY_ROLE_ARN variable on the GitHub environments',
    });
    if (!emailZone) {
      // Publish these three CNAME records at your DNS provider to verify the domain with SES.
      emailIdentity.dkimRecords.forEach((record, index) => {
        new CfnOutput(this, `DkimRecord${index + 1}`, {
          value: `${record.name} CNAME ${record.value}`,
        });
      });
    }
  }
}
