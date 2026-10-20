import * as path from 'node:path';
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  Validations,
  type StackProps,
} from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import type { Construct } from 'constructs';
import { SHARED, type EnvironmentConfig } from './config';

export type EastsideStackProps = StackProps & {
  config: EnvironmentConfig;
  /** Git SHA baked into the image (Next.js `deploymentId`); passed as `-c deploymentVersion=…`. */
  deploymentVersion: string;
};

/**
 * One environment of the site: network, Postgres, identity-document storage, and the Next.js
 * container on ECS Fargate behind an Application Load Balancer.
 *
 * Logical IDs are part of the contract: renaming a construct replaces the resource
 * (for the database, that means data loss). Run `npm run diff` before every change.
 */
export class EastsideStack extends Stack {
  constructor(scope: Construct, id: string, props: EastsideStackProps) {
    super(scope, id, props);
    const { config } = props;
    const retainInProduction = config.isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;

    // ── Network ────────────────────────────────────────────────────────────────
    // Public subnets for the load balancer and tasks (no NAT gateway: saves ~$32/month per AZ),
    // isolated subnets for the database. Tasks accept traffic only from the load balancer.
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'data', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
      gatewayEndpoints: { S3: { service: ec2.GatewayVpcEndpointAwsService.S3 } },
      flowLogs: {
        rejected: {
          destination: ec2.FlowLogDestination.toCloudWatchLogs(
            new logs.LogGroup(this, 'VpcFlowLogs', {
              retention: config.logRetentionDays,
              removalPolicy: RemovalPolicy.DESTROY,
            }),
          ),
          trafficType: ec2.FlowLogTrafficType.REJECT,
        },
      },
    });

    // ── Database ───────────────────────────────────────────────────────────────
    const instanceIdentifier = `eastside-${config.name}`;
    // Created up front (instead of `cloudwatchLogsRetention`) so retention needs no helper Lambda.
    const databaseLogs = new logs.LogGroup(this, 'DatabaseLogs', {
      logGroupName: `/aws/rds/instance/${instanceIdentifier}/postgresql`,
      retention: config.logRetentionDays,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const database = new rds.DatabaseInstance(this, 'Database', {
      instanceIdentifier,
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_17 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, config.databaseInstanceSize),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromGeneratedSecret('eastside'),
      databaseName: 'eastside',
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: config.databaseMultiAz,
      backupRetention: Duration.days(config.backupRetentionDays),
      deletionProtection: config.isProduction,
      removalPolicy: config.isProduction ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,
      cloudwatchLogsExports: ['postgresql'],
      caCertificate: rds.CaCertificate.RDS_CA_RSA2048_G1,
      autoMinorVersionUpgrade: true,
      publiclyAccessible: false,
    });
    database.node.addDependency(databaseLogs);
    const databaseSecret = database.secret;
    if (!databaseSecret) throw new Error('Expected a generated database secret');

    // Application secrets generated at deploy time. Phase 1 adds BETTER_AUTH_SECRET here.
    const appSecrets = new secretsmanager.Secret(this, 'AppSecrets', {
      description: `East Side Distro ${config.name} application secrets`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'IP_HASH_SECRET',
        passwordLength: 48,
        excludePunctuation: true,
      },
    });

    // ── Logs bucket (S3 server access logs + load balancer access logs) ───────
    const accessLogs = new s3.Bucket(this, 'AccessLogs', {
      encryption: s3.BucketEncryption.S3_MANAGED, // load balancer logs require SSE-S3
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      lifecycleRules: [{ expiration: Duration.days(config.logRetentionDays) }],
      removalPolicy: retainInProduction,
      autoDeleteObjects: !config.isProduction,
    });

    // ── Web service ────────────────────────────────────────────────────────────
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    const hostedZone = config.domain
      ? route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', config.domain.hostedZone)
      : undefined;
    const certificate =
      config.domain && hostedZone
        ? new acm.Certificate(this, 'Certificate', {
            domainName: config.domain.name,
            validation: acm.CertificateValidation.fromDns(hostedZone),
          })
        : undefined;

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Web', {
      cluster,
      cpu: config.cpu,
      memoryLimitMiB: config.memoryMiB,
      desiredCount: config.desiredCount,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
      publicLoadBalancer: true,
      // Tasks sit in public subnets with public IPs (outbound to SES/AWS APIs without NAT);
      // their security group only admits the load balancer.
      assignPublicIp: true,
      taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      circuitBreaker: { enable: true, rollback: true },
      // Boot runs migrations and the catalog sync before the server listens.
      healthCheckGracePeriod: Duration.seconds(120),
      ...(config.domain && hostedZone && certificate
        ? {
            domainName: config.domain.name,
            domainZone: hostedZone,
            certificate,
            protocol: elbv2.ApplicationProtocol.HTTPS,
            redirectHTTP: true,
            sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
          }
        : {}),
      taskImageOptions: {
        containerName: 'web',
        containerPort: 3000,
        image: ecs.ContainerImage.fromAsset(path.join(__dirname, '..', '..'), {
          platform: Platform.LINUX_AMD64,
          buildArgs: { DEPLOYMENT_VERSION: props.deploymentVersion },
        }),
        environment: {
          NODE_ENV: 'production',
          AWS_REGION: this.region,
          EMAIL_DRIVER: 'ses',
          EMAIL_FROM: SHARED.emailFrom,
          SALES_INBOX_EMAIL: SHARED.salesInbox,
          PGSSLMODE: 'verify-full',
          RUN_MIGRATIONS_ON_BOOT: 'true',
          RUN_CATALOG_SYNC_ON_BOOT: 'true',
        },
        secrets: {
          PGHOST: ecs.Secret.fromSecretsManager(databaseSecret, 'host'),
          PGPORT: ecs.Secret.fromSecretsManager(databaseSecret, 'port'),
          PGUSER: ecs.Secret.fromSecretsManager(databaseSecret, 'username'),
          PGPASSWORD: ecs.Secret.fromSecretsManager(databaseSecret, 'password'),
          PGDATABASE: ecs.Secret.fromSecretsManager(databaseSecret, 'dbname'),
          IP_HASH_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'IP_HASH_SECRET'),
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'web',
          logGroup: new logs.LogGroup(this, 'WebLogs', {
            retention: config.logRetentionDays,
            removalPolicy: RemovalPolicy.DESTROY,
          }),
        }),
      },
    });

    const appUrl = config.domain
      ? `https://${config.domain.name}`
      : `http://${service.loadBalancer.loadBalancerDnsName}`;
    const container = service.taskDefinition.defaultContainer;
    if (!container) throw new Error('Expected the web container');
    container.addEnvironment('APP_URL', appUrl);

    service.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyHttpCodes: '200',
      interval: Duration.seconds(30),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });
    service.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '30');
    service.loadBalancer.setAttribute('routing.http.drop_invalid_header_fields.enabled', 'true');
    service.loadBalancer.logAccessLogs(accessLogs, 'alb');

    database.connections.allowDefaultPortFrom(service.service, 'Web tasks to Postgres');

    service.service
      .autoScaleTaskCount({ minCapacity: config.desiredCount, maxCapacity: config.maxCount })
      .scaleOnCpuUtilization('Cpu', { targetUtilizationPercent: 60 });

    // ── Identity documents (age verification uploads, Phase 1) ─────────────────
    // Private, KMS-encrypted, never public. The browser uploads with short-lived presigned URLs;
    // staff view through presigned GETs. The lifecycle rule is a backstop to the app's own purge.
    const documentsKey = new kms.Key(this, 'IdentityDocumentsKey', {
      description: `East Side Distro ${config.name}: identity document encryption`,
      enableKeyRotation: true,
      removalPolicy: retainInProduction,
    });
    const documents = new s3.Bucket(this, 'IdentityDocuments', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: documentsKey,
      bucketKeyEnabled: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      enforceSSL: true,
      versioned: false, // deletes must be final for personal data
      serverAccessLogsBucket: accessLogs,
      serverAccessLogsPrefix: 'identity-documents/',
      lifecycleRules: [
        {
          id: 'expire-identity-documents',
          expiration: Duration.days(config.identityDocumentRetentionDays),
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
      ],
      // Browser uploads need the site's HTTPS origin, so CORS exists only once a domain is set.
      // (Referencing the load balancer DNS name here would also create a dependency cycle.)
      cors: config.domain
        ? [
            {
              allowedMethods: [s3.HttpMethods.PUT],
              allowedOrigins: [appUrl],
              allowedHeaders: ['content-type'],
              maxAge: 3000,
            },
          ]
        : undefined,
      removalPolicy: retainInProduction,
      autoDeleteObjects: !config.isProduction,
    });
    container.addEnvironment('ID_DOCUMENTS_BUCKET', documents.bucketName);
    // Least privilege: object read/write/delete only, plus the KMS calls SSE-KMS needs.
    const taskRole = service.taskDefinition.taskRole;
    taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
        resources: [documents.arnForObjects('*')],
      }),
    );
    documentsKey.grant(taskRole, 'kms:Decrypt', 'kms:GenerateDataKey');

    // ── Email (SES identity lives in the shared stack) ─────────────────────────
    service.taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: [
          this.formatArn({
            service: 'ses',
            resource: 'identity',
            resourceName: SHARED.emailDomain,
          }),
        ],
      }),
    );

    // ── Outputs (the deploy workflow reads AppUrl for its smoke test) ──────────
    new CfnOutput(this, 'AppUrl', { value: appUrl });
    new CfnOutput(this, 'DatabaseEndpoint', { value: database.dbInstanceEndpointAddress });
    new CfnOutput(this, 'IdentityDocumentsBucket', { value: documents.bucketName });

    this.acknowledgeNagFindings({ config, database, appSecrets, accessLogs, service, documents });
  }

  /**
   * cdk-nag (AwsSolutions) findings accepted on purpose. Each needs a reason; anything new
   * fails `npm run synth` until it is fixed or acknowledged here.
   */
  private acknowledgeNagFindings(parts: {
    config: EnvironmentConfig;
    database: rds.DatabaseInstance;
    appSecrets: secretsmanager.Secret;
    accessLogs: s3.Bucket;
    service: ecsPatterns.ApplicationLoadBalancedFargateService;
    documents: s3.Bucket;
  }) {
    const { config, database, appSecrets, accessLogs, service, documents } = parts;
    const ack = (scope: Construct, id: string, reason: string) =>
      Validations.of(scope).acknowledge({ id, reason });

    ack(accessLogs, 'AwsSolutions-S1', 'This is the access-log bucket; it does not log to itself.');
    ack(
      database,
      'AwsSolutions-RDS3',
      config.databaseMultiAz
        ? 'Multi-AZ is enabled.'
        : 'Single-AZ with automated backups is acceptable at current scale; enable databaseMultiAz in config.ts when downtime tolerance drops.',
    );
    ack(
      database,
      'AwsSolutions-RDS6',
      'The app authenticates with a Secrets Manager password over verified TLS; IAM auth adds token refresh for little gain.',
    );
    ack(
      database,
      'AwsSolutions-RDS11',
      'Default port is fine: the instance is in isolated subnets and only the web tasks security group can reach it.',
    );
    if (!config.isProduction) {
      ack(
        database,
        'AwsSolutions-RDS10',
        'Staging data is disposable; production enables deletion protection.',
      );
    }
    // On the instance (not `database.secret`, which is the attachment) to reach Database/Secret.
    ack(
      database,
      'AwsSolutions-SMG4',
      'Rotation needs a Lambda with a network path to Secrets Manager (NAT or an interface endpoint); planned in docs/roadmap.md.',
    );
    ack(
      appSecrets,
      'AwsSolutions-SMG4',
      'IP_HASH_SECRET only keys rate-limit hashes; it is rotated manually.',
    );
    const executionRole = service.taskDefinition.executionRole;
    if (executionRole) {
      ack(
        executionRole,
        'AwsSolutions-IAM5[Resource::*]',
        'ecr:GetAuthorizationToken only supports Resource "*"; image pulls are scoped to the asset repository.',
      );
    }
    const documentsLogicalId = this.resolve(
      (documents.node.defaultChild as s3.CfnBucket).logicalId,
    );
    ack(
      service.taskDefinition.taskRole,
      `AwsSolutions-IAM5[Resource::<${documentsLogicalId}.Arn>/*]`,
      'Object-level access inside the identity documents bucket only (put/get/delete).',
    );
    ack(
      service.loadBalancer,
      'AwsSolutions-EC23',
      'Public website: the load balancer must accept HTTP(S) from anywhere.',
    );
    ack(
      service.taskDefinition,
      'AwsSolutions-ECS2',
      'Environment variables hold non-secret configuration only; secrets are injected from Secrets Manager.',
    );
  }
}
