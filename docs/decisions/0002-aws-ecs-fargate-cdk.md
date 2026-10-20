# 0002. AWS: ECS Fargate, RDS, S3/KMS, SES, via CDK with GitHub OIDC

- Status: Accepted
- Date: 2026-10-19

## Context

The owner chose AWS. The app needs a private Postgres database, encrypted storage for identity
documents, transactional email, HTTPS, and automated deploys from GitHub.

## Decision

- **Compute:** the Next.js standalone server in Docker on **ECS Fargate** behind an Application
  Load Balancer (`ApplicationLoadBalancedFargateService`), with a circuit breaker and rollback.
- **Network:** a VPC with public subnets (load balancer and tasks with public IPs, no NAT gateway)
  and isolated subnets (database). Task and database security groups admit only their caller.
- **Data:** RDS PostgreSQL 17 (gp3, encrypted, backups, deletion protection in production),
  credentials in Secrets Manager, TLS verified with the RDS CA bundle.
- **Files:** S3 bucket with a customer-managed KMS key for identity documents.
- **Email:** Amazon SES (domain identity with DKIM).
- **Infrastructure as code:** AWS CDK (TypeScript) in `infra/`, cdk-nag (AWS Solutions) on every
  synth, assertion tests for security properties.
- **Deploys:** GitHub Actions with OIDC. The deploy role can only assume the CDK bootstrap roles.
  Staging deploys automatically; production is manual with approval.

## Consequences

- Any Next.js version runs (no platform adapter lag), and the database stays private.
- Roughly $60–130/month per environment at low traffic (see architecture.md).
- No NAT means tasks have public IPs. Inbound is still limited to the load balancer. Adding
  outbound controls later means NAT or VPC endpoints.
- Preview environments per pull request are not automatic (unlike Vercel); staging plays that
  role.

## Alternatives considered

- **AWS Amplify Hosting:** simplest Git-based hosting, but its compute can't reach a private RDS
  instance in a VPC, and Next.js version support lags.
- **AWS App Runner:** closed to new customers as of April 30, 2026.
- **ECS Express Mode:** promising, but the classic CDK pattern is mature and fully supported by L2
  constructs. Revisit later.
- **Lambda (OpenNext):** cheaper at idle, but more moving parts and the same VPC/NAT trade-offs.
- **Vercel + Neon:** fastest developer experience; not chosen because the owner prefers AWS.
