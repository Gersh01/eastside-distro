# 0006. Payments behind a gateway adapter; no Stripe

- Status: Accepted (gateway choice pending)
- Date: 2026-10-19

## Context

Stripe's prohibited-business list includes "substances designed to mimic illegal drugs, including
kava" and restricts CBD/THC products; kratom merchants are generally treated as high-risk by
mainstream processors. Wholesale customers also pay by ACH, check, or invoice with Net 15/30 terms.

## Decision

- Define a `PaymentGateway` interface in `src/server/payments/`: create a hosted payment session
  or tokenize, capture, refund, and verify webhooks.
- First implementation: the gateway behind the business's **high-risk merchant account**
  (typically Authorize.net or NMI). Use the gateway's hosted page or hosted fields so card data
  never touches our servers (PCI SAQ A or A-EP).
- "Pay by invoice" for approved wholesale accounts is a separate method that creates an invoice
  instead of a charge.

## Consequences

- Switching processors (a common event for high-risk merchants) is one adapter, not a rewrite.
- No Stripe-only conveniences (Stripe Tax, Stripe Identity); tax and ID verification get their own
  adapters.

## Open question

Which merchant account and gateway does the business have, or want? This decides the first
adapter.
