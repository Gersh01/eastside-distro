import { InstanceSize } from 'aws-cdk-lib/aws-ec2';

/**
 * Deployment settings. Everything environment-specific lives here, so stacks stay declarative.
 * Changing a value and merging to `main` deploys it (staging); production deploys are manual.
 */

export type HostedZoneRef = {
  /** Route 53 hosted zone id, e.g. Z0123456789ABCDEFGHIJ. */
  hostedZoneId: string;
  zoneName: string;
};

export type EnvironmentConfig = {
  name: 'staging' | 'production';
  stackName: string;
  isProduction: boolean;
  /**
   * Custom domain with HTTPS. Leave undefined to serve over the load balancer's own HTTP DNS name
   * (fine for a first staging deploy; required before launch because sign-in cookies need HTTPS).
   */
  domain?: { name: string; hostedZone: HostedZoneRef };
  cpu: 256 | 512 | 1024 | 2048;
  memoryMiB: number;
  desiredCount: number;
  maxCount: number;
  databaseInstanceSize: InstanceSize;
  databaseMultiAz: boolean;
  backupRetentionDays: number;
  /** Hard ceiling for keeping uploaded ID images; the app deletes them sooner after review. */
  identityDocumentRetentionDays: number;
  logRetentionDays: 30 | 90 | 180 | 365;
};

export const SHARED = {
  /** us-east-1: closest region to Orlando with full SES support. */
  region: 'us-east-1',
  /** GitHub repository allowed to deploy through OIDC ("owner/name"). */
  githubRepository: 'Gersh01/eastside-distro',
  /** Set if the account already has the GitHub OIDC provider (only one is allowed per account). */
  existingGithubOidcProviderArn: undefined as string | undefined,
  /** Domain that sends email through SES (DKIM records must be published in its DNS). */
  emailDomain: 'eastsidedistro.com',
  /** If the email domain's DNS is in Route 53, CDK publishes the DKIM records automatically. */
  emailHostedZone: undefined as HostedZoneRef | undefined,
  emailFrom: 'East Side Distro <no-reply@eastsidedistro.com>',
  salesInbox: 'sales@eastsidedistro.com',
} as const;

export const ENVIRONMENTS: EnvironmentConfig[] = [
  {
    name: 'staging',
    stackName: 'EastsideStaging',
    isProduction: false,
    domain: undefined,
    cpu: 512,
    memoryMiB: 1024,
    desiredCount: 1,
    maxCount: 2,
    databaseInstanceSize: InstanceSize.MICRO,
    databaseMultiAz: false,
    backupRetentionDays: 3,
    identityDocumentRetentionDays: 30,
    logRetentionDays: 30,
  },
  {
    name: 'production',
    stackName: 'EastsideProduction',
    isProduction: true,
    domain: undefined, // e.g. { name: 'eastsidedistro.com', hostedZone: { hostedZoneId: '…', zoneName: 'eastsidedistro.com' } }
    cpu: 512,
    memoryMiB: 1024,
    desiredCount: 2,
    maxCount: 4,
    databaseInstanceSize: InstanceSize.SMALL,
    databaseMultiAz: false,
    backupRetentionDays: 14,
    identityDocumentRetentionDays: 90,
    logRetentionDays: 90,
  },
];
