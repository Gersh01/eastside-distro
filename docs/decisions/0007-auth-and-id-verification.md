# 0007. Better Auth and manual ID review first

- Status: Proposed (implement in Phase 1)
- Date: 2026-10-19

## Context

Customers need accounts, and every buyer must prove they are 21+ with a government ID at sign-up.
The app already runs Postgres and SES.

## Decision

- **Better Auth** with the Drizzle adapter: sessions and users in our Postgres, email + password,
  email verification through our SES sender, roles via a `role` column. (The Auth.js project now
  points new apps to Better Auth.)
- **ID verification behind an `IdentityVerifier` interface**, starting with manual staff review of
  uploaded images (presigned S3 uploads, KMS-encrypted, deleted after review). An automated vendor
  (document + selfie check) can be added later without changing the flow.

## Consequences

- No per-user auth fees and no external identity provider to configure. Local dev and CI run the
  real auth stack.
- Manual review costs staff time and delays first orders (target: same business day).
- Requires HTTPS (custom domain) on staging before testing sign-in end to end.

## Alternatives considered

- **Amazon Cognito:** managed and AWS-native, but local dev and e2e tests need a real user pool,
  custom sign-up steps (DOB, ID upload) fight the hosted UI, and profile data would be split
  between Cognito and Postgres.
- **ID vendor from day one:** faster decisions, but $1–3 per check and a vendor contract before
  launch. Keep it as the upgrade path.
