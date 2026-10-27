# Placement orders

Status: **spec, Phase 2.5**. Depends on Phase 1 (verified accounts) and Phase 2 (wholesale
accounts, prices). Does not need the payment gateway, so it can ship before Phase 3. Build with
`/feature placement-orders`.

## Goal

The owner's other business (a store that resells East Side Distro products) restocks through the
site. Its managers place orders at their own prices with no card payment; staff approve each order
before it is packed and delivered. Every line still passes the compliance rules.

## User flows

1. **Set up (staff):** create or convert a wholesale account with type `affiliate`, its own price
   list, payment terms `internal_invoice`, and one or more delivery addresses. Invite the store's
   managers as members (`owner` or `buyer`).
2. **Place an order** (`/orders/new`, affiliate members only): add variants in their wholesale
   packs (case, half case, bulk), pick a delivery address or pickup, a requested delivery date, and
   an optional PO reference and note. Submit: no payment step.
3. **Reorder:** "Reorder" on a past order copies its lines into a new draft. Lines that are no
   longer active or no longer allowed are dropped with the reason shown.
4. **Staff review** (`/staff/placement-orders`): queue of submitted orders, oldest requested date
   first. Staff can change quantities, approve, or reject with a reason. Every change and decision
   writes an `audit_events` row with the staff member.
5. **Fulfil:** `approved` → `processing` → `ready_for_pickup` or `out_for_delivery` → `completed`;
   `cancelled` from any state before `completed`.
6. **Emails:** order received (to the store and sales), approved or rejected (to the store), and an
   invoice or packing slip when completed.

## Technical design

- **Accounts:** `wholesale_accounts.account_type` (`standard` | `affiliate`) and a payment term
  `internal_invoice`. Only affiliate accounts can place placement orders; only staff can set the
  type.
- **Orders:** this feature creates the `orders` and `order_items` tables that Phase 3 extends.
  `orders.channel` (`retail` | `wholesale` | `placement`), plus `requested_delivery_date` (date),
  `po_reference` (text) and the statuses `submitted` and `approved` alongside the Phase 3 flow.
  Order numbers share the `ESD-10001` sequence. Order items snapshot product name, SKU, pack and
  price in cents.
- **Server Actions** in `src/features/placement-orders/actions.ts`: `submitPlacementOrder`,
  `updatePlacementOrderLines`, `approvePlacementOrder`, `rejectPlacementOrder`,
  `advancePlacementOrder`. Each authorizes first: the submitter must be a member of an active
  affiliate account and pass `requireVerifiedBuyer()`; review and status actions require the
  `staff` or `admin` role.
- **Prices** come from the account's price list on the server. Client-sent prices are ignored. A
  variant with no price on that list can't be ordered.
- **Compliance:** `evaluate(ingredients, destinationState, businessDate())` for every line on
  submit and again on approve (rules can change in between, for example hemp THC on 2026-12-11).
  Blocked lines are refused with the rule summary. Store the evaluated rule ids and date on the
  order.
- **Writes:** submit, approve, reject and status changes are each one transaction plus an
  `audit_events` row (ids only, no PII). Emails go out after the commit; failures are logged.
- **Cache:** order lists are per-user data, read inside `<Suspense>` after the session; tag
  `placement-orders` and call `updateTag` after each write.
- **Stock:** none yet. When inventory tracking lands, approval reserves stock and completion
  deducts it.

## Acceptance criteria

- A user who isn't a member of an affiliate account can't submit a placement order, by UI or by
  calling the action directly (unit + e2e tests).
- Only staff can approve, reject, edit lines or change status.
- Prices and totals are computed on the server from the account's price list.
- A hemp THC line can't be submitted or approved on or after 2026-12-11; a kratom line can't be
  sent to a state that bans it.
- Every decision is in `audit_events` with the actor and timestamp.

## Open questions for the business

- Billing between the two businesses: invoice at a transfer price, cost, or record-only? Who pays
  and on what terms?
- Sales tax: is the store a separate legal entity? If so, a resale certificate on file is needed
  for tax-exempt orders (check with the accountant).
- Does every order need staff approval, or can orders under a set amount skip review?
- Delivery: does the distro deliver to the store on set days, or does the store pick up?
- One store or several locations?
