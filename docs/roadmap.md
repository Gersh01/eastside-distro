# Roadmap

Each phase ships on its own. Start an item with `/feature <item>`; specs live in
[features/](features/).

## Phase 0: Foundation ✅ (done)

- [x] Next.js 16 app, TypeScript strict, Tailwind brand system from the 2026 catalogue
- [x] Postgres schema + migrations; catalog (32 products, 240 SKUs) transcribed from the PDF and synced from code
- [x] Paginated catalogue by category, product pages with live state availability
- [x] Compliance rules engine (kratom state bans, FL 21+, hemp THC federal date) with tests
- [x] Wholesale onboarding form (paper sheet sections 1–9) → database + email to sales
- [x] Contact form → database + email to sales (Reply-To the sender)
- [x] Unit tests (Vitest), end-to-end tests (Playwright), CI, Docker image
- [x] AWS infrastructure (CDK) with cdk-nag, staging/production deploy pipeline with OIDC
- [x] CLAUDE.md, skills, review agents, hooks, docs

## Phase 1: Accounts and age verification

Spec: [features/accounts-and-age-verification.md](features/accounts-and-age-verification.md)

- [ ] Better Auth (email + password, email verification, sessions in Postgres, roles)
- [ ] Sign-up wizard: account → date of birth → ID upload (front/back) → pending
- [ ] Presigned uploads to the identity-documents bucket; image type/size limits
- [ ] Staff review queue: view images with short-lived links, approve/reject with reason, audit trail
- [ ] Emails: verify email, ID approved, ID rejected
- [ ] Purge ID images after a decision (scheduled job) plus the S3 lifecycle backstop
- [ ] Site-wide 21+ age gate interstitial
- [ ] Custom domain + HTTPS on staging and production (required for secure cookies)

## Phase 2: Staff tools and wholesale accounts

- [ ] Staff area with role checks
- [ ] Wholesale application queue with section 10 fields (follow-up date, assignee, notes); approve → wholesale account + invite
- [ ] Wholesale accounts with members, resale certificate and expiry, payment terms, price list
- [ ] Contact message inbox (status: new / replied / closed)
- [ ] Prices: enter retail and wholesale prices (admin screen or `catalog-update` skill), volume breaks
- [ ] Show prices: retail publicly, wholesale to signed-in approved buyers

## Phase 3: Online ordering

Spec: [features/checkout.md](features/checkout.md)

- [ ] Cart (retail packs vs wholesale cases/half cases, minimums)
- [ ] Checkout with server-side compliance (`evaluate()` per line for the destination) and ID gate
- [ ] Fulfillment: ship (UPS/FedEx rates), Orlando pickup, same-day Florida delivery
- [ ] Florida sales tax; resale-certificate exemption for wholesale; tax service adapter for other states
- [ ] Payment adapter + high-risk gateway (card, ACH); pay by invoice for Net 15/30 accounts
- [ ] Order confirmation and status emails; order history; staff order management
- [ ] Address-level checks for city/county kratom bans

## Phase 4: Launch readiness

- [ ] SES production access; DKIM/SPF/DMARC for eastsidedistro.com
- [ ] AWS WAF (managed rules + rate limiting), Content-Security-Policy with nonces
- [ ] CloudWatch alarms (5xx, unhealthy hosts, RDS CPU/storage) → email/SMS
- [ ] Database secret rotation (needs an interface endpoint or NAT)
- [ ] Restore test from an RDS snapshot; document RPO/RTO
- [ ] Privacy policy, terms, shipping/returns pages; counsel review of compliance rules and copy
- [ ] Accessibility audit (WCAG 2.2 AA), sitemap, structured data, analytics

## Later

- Inventory tracking (shared base units across case/half-case), low-stock alerts
- Quick reorder for wholesale, saved carts, PDF invoices
- COA (lab certificate) downloads per batch
- Product image uploads in the admin; CloudFront for static assets
- Multi-AZ database for production when downtime tolerance drops
