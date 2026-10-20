# infra/: AWS CDK (TypeScript)

Separate npm package; run commands from the repo root with `npm --prefix infra …`.

| Task                     | Command                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| Install                  | `npm --prefix infra ci`                                                  |
| Typecheck                | `npm --prefix infra run typecheck`                                       |
| Security property tests  | `npm --prefix infra test`                                                |
| Synth + cdk-nag (strict) | `npm --prefix infra run synth`                                           |
| Diff against AWS         | `npm --prefix infra run diff -- EastsideStaging` (needs AWS credentials) |

## Stacks (`bin/eastside.ts`, settings in `lib/config.ts`)

- `EastsideShared`: GitHub Actions OIDC provider + deploy role, SES domain identity. Deployed once
  by hand (`docs/runbooks/aws-setup.md`).
- `EastsideStaging` / `EastsideProduction` (`lib/eastside-stack.ts`): VPC (public + isolated
  subnets, no NAT), RDS PostgreSQL 17, KMS-encrypted identity-documents bucket, ECS Fargate
  service behind an ALB, built from `../Dockerfile`.

## Rules

- Never run `cdk deploy` or `cdk destroy` without the user's explicit go-ahead; deploys go through
  `.github/workflows/deploy.yml`.
- **Construct IDs are part of the contract.** Renaming or moving a construct replaces the resource
  (for the database, that means data loss). Review `npm --prefix infra run diff` for
  "replace" before merging.
- Fix cdk-nag findings, or acknowledge one with
  `Validations.of(construct).acknowledge({ id, reason })` and a real reason.
- No context lookups: synth must work without AWS credentials (CI). Use `fromXxxAttributes`.
- Build ARNs with pseudo-parameters (`Aws.ACCOUNT_ID`, `Aws.PARTITION`) so templates don't change
  when someone synthesizes with local credentials.
- Production keeps stateful resources (`RETAIN` / `SNAPSHOT`, deletion protection on).
- Secrets reach containers through ECS `secrets` (Secrets Manager), never `environment`.
- Add a test in `test/stacks.test.ts` for every security property you rely on.
