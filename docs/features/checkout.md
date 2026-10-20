# Cart, checkout and orders

Status: **spec, Phase 3**. Depends on Phase 1 (verified accounts) and Phase 2 (prices, wholesale
accounts).

## Channels

|             | Retail                                                 | Wholesale                                      |
| ----------- | ------------------------------------------------------ | ---------------------------------------------- |
| Who         | Any verified 21+ customer                              | Members of an approved wholesale account       |
| Price list  | `retail`                                               | Account's price list (`wholesale` or a tier)   |
| Packs       | Per Phase 2 decision (singles/packs or the same cases) | Cases and half cases, bulk sizes               |
| Tax         | Florida sales tax on FL deliveries and pickup          | Exempt with a valid resale certificate on file |
| Payment     | Card                                                   | Card, ACH, or invoice with Net 15/30 terms     |
| Fulfillment | Ship, Orlando pickup                                   | Ship, pickup, same-day Florida delivery        |

## Checkout steps

1. **Cart**: variants and quantities. Enforce pack rules and minimums (for example "1 pouch
   minimum"). Quote-only products can't be added.
2. **Fulfillment**: shipping address (state required), or pickup at 6148 Hanging Moss Rd
   (destination FL), or Florida same-day delivery.
3. **Compliance check (server)**: `evaluate(ingredients, destinationState, businessDate())` for every
   line. Blocked lines are removed with the rule summary shown. Require an approved ID at or above
   the highest `minimumAge`. Store the evaluated rule ids and date on the order.
4. **Totals**: subtotal, shipping (rate table or carrier API), tax (Florida first, behind a
   `TaxCalculator` interface so a tax service can replace it), discounts. All integer cents.
5. **Payment**: through the `PaymentGateway` adapter
   ([ADR 0006](../decisions/0006-payments-gateway-adapter.md)), using the gateway's hosted fields
   or page so card data never touches our servers. Invoice terms skip the card step.
6. **Order**: number like `ESD-10001`. Status flow: `pending_payment` → `paid` → `processing` →
   `ready_for_pickup` or `shipped` → `completed` (plus `cancelled` and `refunded`). Snapshot
   product names, SKUs and prices on the lines.
7. **Emails**: confirmation, ready for pickup / shipped with tracking, invoice for terms accounts.

## Acceptance criteria

- A kratom product can't be ordered for delivery to Alabama, by API or UI (e2e + unit tests).
- Hemp THC can't be ordered at all on or after 2026-12-11.
- Prices, tax and totals are computed on the server only. Tampered client prices are ignored.
- Payments are idempotent (retries don't double-charge); gateway webhooks are verified.
- Every order records the compliance decision it was placed under.

## Open questions

- Payment gateway and merchant account (Authorize.net, NMI, other?). Is one already in place?
- Shipping: carrier accounts, flat rates vs live rates, free-shipping threshold.
- Sales tax outside Florida: economic-nexus review with the accountant.
- Local delivery area and cutoff time for same-day delivery.
