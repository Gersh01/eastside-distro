# Accounts and age verification

Status: **spec, Phase 1**. Build with `/feature accounts-and-age-verification`.

## Goal

Every customer signs up and uploads a government ID. Staff confirm the person is 21+ before the
first order. ID images are kept only as long as needed.

## User flows

1. **Sign up** (`/sign-up`): name, email, password, date of birth, state. Accept terms and
   confirm "I am 21 or older". Anyone under 21 by DOB is stopped here (no account created).
2. **Verify email** (link from SES). Signing in works before verification, but ordering doesn't.
3. **Upload ID** (`/account/verify`, required to finish sign-up): document type (driver's license,
   state ID, passport); front image (and back for license/ID). On phones, `accept="image/*"` with
   camera capture. The status page then shows **Pending review**.
4. **Staff review** (`/staff/verifications`): queue oldest first. Images open through presigned GET
   URLs valid for 5 minutes. Staff compare name and DOB, confirm the ID isn't expired, and approve
   or reject with a reason (unreadable, expired, under 21, mismatch, other). Every decision writes
   an `audit_events` row with the reviewer.
5. **Outcome email**: approved (can order) or rejected (reason + re-upload link).
6. **Re-verification**: when an ID expires before an order, or after a rejection.

## Technical design

- **Better Auth** with the Drizzle adapter: email + password, email verification (send through the
  existing `sendEmail`), database sessions, rate-limited auth endpoints. Add `role` and
  `dateOfBirth` to the user. Read sessions only inside `<Suspense>`, following
  `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- **Uploads:** a Server Action `createIdUploadUrls` authorizes the user, then returns presigned PUTs
  (`@aws-sdk/s3-request-presigner`) for keys `id-documents/<userId>/<verificationId>/<front|back>`,
  with `Content-Type` pinned to jpeg, png or heic, a maximum size of 10 MB, and 5-minute expiry.
  The browser uploads straight to S3. A second action confirms with `HeadObject` and creates the
  `id_verifications` row.
- **Storage:** the identity-documents bucket from `infra/` (private, KMS, TLS-only, unversioned).
  CORS for the site origin exists only when a custom domain is configured, so set the domain
  first.
- **Retention:** a scheduled job deletes images 30 days after a decision and sets
  `images_deleted_at`. The S3 lifecycle rule (30 days staging / 90 production) is the backstop.
  Keep the decision, DOB, document type and reviewer.
- **Gate:** `requireVerifiedBuyer()` in the data access layer. Checkout and any "buy" action call
  it. The client never decides.
- **Vendor option:** wrap review in an `IdentityVerifier` interface. `ManualReviewVerifier` comes
  first; an automated vendor (document + selfie checks) can be added later without schema
  changes beyond a `provider` column.
- **Age gate:** a site-wide 21+ interstitial (cookie) for anonymous visitors. It is a courtesy, not
  verification.

## Acceptance criteria

- Under-21 DOB can't create an account; the server rejects it even if the UI is bypassed.
- ID images can't be fetched without a fresh presigned URL; bucket policy denies non-TLS and public
  access.
- A customer without an approved verification can't place an order (server check, e2e test).
- Every review decision is in `audit_events` with reviewer and timestamp.
- Images are gone after the retention window (job test plus lifecycle rule).
- No ID image keys, DOBs or names appear in logs (spot-check in CloudWatch).

## Open questions for the business

- Retention period for ID images after approval: 30 days is proposed (confirm with counsel).
- Do wholesale buyers each need personal ID verification, or one per business? Proposed: each
  person who orders.
- Manual review turnaround commitment (same business day?).
