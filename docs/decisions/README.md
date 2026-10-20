# Architecture decision records

Short records of decisions that are expensive to reverse. Add one when you make such a choice
(copy `template.md`, next number). Don't rewrite old records: supersede them.

| #    | Decision                                                                                    | Status   |
| ---- | ------------------------------------------------------------------------------------------- | -------- |
| 0001 | [Next.js monolith with feature modules](0001-nextjs-monolith.md)                            | Accepted |
| 0002 | [AWS: ECS Fargate, RDS, S3/KMS, SES, via CDK with GitHub OIDC](0002-aws-ecs-fargate-cdk.md) | Accepted |
| 0003 | [PostgreSQL + Drizzle; migrations at boot](0003-postgres-drizzle-boot-migrations.md)        | Accepted |
| 0004 | [Catalog as code until an admin UI exists](0004-catalog-as-code.md)                         | Accepted |
| 0005 | [Compliance rules as code, failing closed](0005-compliance-rules-as-code.md)                | Accepted |
| 0006 | [Payments behind a gateway adapter; no Stripe](0006-payments-gateway-adapter.md)            | Accepted |
| 0007 | [Better Auth and manual ID review first](0007-auth-and-id-verification.md)                  | Proposed |
| 0008 | [Cache Components rendering; no database at build time](0008-cache-components.md)           | Accepted |
