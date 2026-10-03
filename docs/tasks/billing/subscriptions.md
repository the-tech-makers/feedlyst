# Task — Subscriptions

## Brief
Implementation contract for the Subscriptions module in M5.

## Status
IN PROGRESS

## Objective
Implement provider-neutral plan and subscription state management.

## Scope
Plans, current subscription lookup, payment idempotency, status transitions, usage-limit integration, billing dashboard, and provider adapter boundary.

## Dependencies
Usage metering and selected payment provider.

## Acceptance Criteria
- Dashboard exposes the account's current subscription and active plan catalog.
- Subscription state remains independent of a payment provider.
- Payment records are idempotent by provider and provider payment ID.
- Usage limits derive from the active plan.
- Tenant access is enforced through account membership.

## Tests
- Plan lookup; active subscription lookup; payment idempotency; status transitions; usage-limit lookup; tenant isolation.

## Completion
Provider-neutral billing foundation is implemented. Checkout/customer portal, signed webhook reconciliation, trial automation, and plan-change flows remain pending.
