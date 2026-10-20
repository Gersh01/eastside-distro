# One-time AWS and GitHub setup

Do these once per AWS account, in order. Commands run from the repo root with AWS credentials for
an administrator (`aws sts get-caller-identity` shows the account).

## 1. GitHub repository

The deploy role trusts `Gersh01/eastside-distro` (change `SHARED.githubRepository` in
`infra/lib/config.ts` if different).

```bash
gh repo create Gersh01/eastside-distro --private --source . --push
```

## 2. Bootstrap CDK

```bash
npm --prefix infra ci
npm --prefix infra run cdk -- bootstrap aws://<ACCOUNT_ID>/us-east-1
```

## 3. Shared stack (deploy role + SES identity)

```bash
npm --prefix infra run cdk -- deploy EastsideShared
```

Outputs:

- `DeployRoleArn`: put it in GitHub (step 5).
- `DkimRecord1..3`: add these three CNAME records at the DNS provider for eastsidedistro.com
  (skipped automatically if `SHARED.emailHostedZone` points at a Route 53 zone).

If the account already has a GitHub OIDC provider, set `SHARED.existingGithubOidcProviderArn`
first (AWS allows only one per account).

## 4. SES production access

New SES accounts are in the sandbox (verified recipients only). In the SES console, request
production access for transactional email (order confirmations, contact-form notifications),
and describe the opt-in and bounce handling. Until approved, verify `sales@eastsidedistro.com` as
a recipient identity for testing.

## 5. GitHub environments

Settings → Environments:

- **staging**: deployment branches = `main`. Variables: `AWS_DEPLOY_ROLE_ARN` (from step 3),
  `AWS_REGION` = `us-east-1`.
- **production**: same variables, **required reviewers** = the owner(s), deployment branches =
  `main`.

Branch protection on `main`: require the CI checks (app, e2e, infra, docker) to pass.

## 6. Custom domain (before launch; needed for sign-in in Phase 1)

1. Host the domain's DNS in Route 53, or create a hosted zone for a subdomain such as
   `staging.eastsidedistro.com`.
2. Set `domain` for the environment in `infra/lib/config.ts`:
   `{ name: 'staging.eastsidedistro.com', hostedZone: { hostedZoneId: 'Z…', zoneName: 'eastsidedistro.com' } }`.
3. Merge. The stack creates a DNS-validated certificate, HTTPS listener and HTTP→HTTPS redirect,
   and enables browser uploads to the identity-documents bucket (CORS).

## 7. First deploy

Merge to `main` (or run the **Deploy** workflow manually for `staging`). The workflow diffs,
deploys, and smoke-tests `/api/health`. The site URL is the stack output `AppUrl`.
