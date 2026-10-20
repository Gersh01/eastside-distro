# Contact

Status: **implemented (Phase 0)** at `/contact`.

- Fields: name, email, phone (optional), topic (general, wholesale & pricing, product question,
  existing order, other), message (10–5,000 characters).
- Linked from product pages as `/contact?product=<slug>`: the form shows "Asking about <product>",
  preselects the product topic and stores `product_slug`.
- Server Action `sendContactMessage`: zod validation, honeypot, at most 5 messages per hour per IP
  hash, row + `audit_events` in one transaction, then an email to sales with **Reply-To set to the
  sender**, so staff answer straight from their inbox.
- No auto-reply to the sender (avoids the form being used to send email to arbitrary addresses).
  Add one after CAPTCHA or account sign-in exists.

Next (Phase 2): an inbox in the staff area with statuses `new`, `replied` and `closed`.
