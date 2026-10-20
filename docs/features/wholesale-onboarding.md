# Wholesale onboarding form

Status: **implemented (Phase 0)** at `/wholesale`. The staff review queue comes in Phase 2.

The paper "Wholesale Customer Onboarding Sheet" (`docs/reference/wholesale-form.png`) as a web
form. Anyone can apply; no account is needed. Approval later creates a wholesale account and
invites the applicant to sign up (with ID verification).

## Field mapping

| Sheet section           | Form field(s)                                                                           | Validation                                                              | Column(s)                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1. Contact information  | Full name, Title / role, Phone, Email                                                   | name, phone (10+ digits), email required                                | `full_name`, `title_role`, `phone`, `email`                                                     |
| 2. Business information | Business name, address (2 lines), City, State, ZIP, Resale / sales tax license #        | all but line 2 and license required; ZIP 5 or 9 digits; state from list | `business_name`, `address_line1/2`, `city`, `state`, `postal_code`, `resale_certificate_number` |
| 3. Business type        | 10 checkboxes incl. Other + text                                                        | at least one; "Other" needs text                                        | `business_types[]`, `business_type_other`                                                       |
| 4. Business details     | Number of locations, Years in business, Current suppliers                               | whole numbers when given                                                | `number_of_locations`, `years_in_business`, `current_suppliers`                                 |
| 5. Products of interest | 9 checkboxes incl. Other + text                                                         | at least one; "Other" needs text                                        | `products_of_interest[]`, `products_of_interest_other`                                          |
| 6. Additional notes     | Specific products, strains, sizes, brands                                               | ≤ 2,000 characters                                                      | `product_notes`                                                                                 |
| 7. Purchase plans       | Order frequency (radio + Other), Estimated volume, Preferred method (pickup / shipping) | "Other" needs text                                                      | `order_frequency(_other)`, `estimated_order_volume`, `fulfillment_preferences[]`                |
| 8. Goals & priorities   | 6 checkboxes incl. Other + text                                                         | "Other" needs text                                                      | `goals[]`, `goals_other`                                                                        |
| 9. Next steps           | 6 checkboxes incl. Other + text                                                         | "Other" needs text                                                      | `next_steps[]`, `next_steps_other`                                                              |
| 10. Eastside follow-up  | not on the public form (staff only)                                                     | —                                                                       | `follow_up_date`, `assigned_to`, `internal_notes`                                               |
| (new) Attestation       | "I am 21 or older and authorized…" checkbox                                             | required                                                                | validated only, not stored                                                                      |

Answer choices live in `src/features/wholesale/options.ts`. Stored values are codes
(`kava_bar`, `bulk_kava`, …). Add new options freely, but never rename stored codes.

## Behavior

- Server Action `submitWholesaleApplication` validates with `wholesaleApplicationSchema` (shared
  with the client) and returns field errors and the submitted values, so the form keeps its input.
- Anti-spam: hidden honeypot field (silently accepted, nothing stored) and at most 3 applications
  per hour per IP hash.
- On success: row + `audit_events` (`wholesale_application.submitted`) in one transaction, then an
  email to `SALES_INBOX_EMAIL` laid out by sheet section, with Reply-To set to the applicant.
  Email failures are logged and `notified_at` stays empty.

## Next (Phase 2)

- Staff queue: filter by status, edit section 10 fields, approve or reject.
- Approval creates a `wholesale_accounts` row (terms, price list, tax exemption) and emails a
  sign-up invite. Optional upload of the resale certificate (PDF) to private storage.
