# Task — Subscriptions

## Brief
Implementation contract for the Subscriptions module in M5.

## Status
REVIEW

## Objective
Provide production-ready subscription and payment lifecycle management behind a provider-neutral local billing model.

## Implemented
- Active plan catalog and current subscription lookup.
- Usage limits derived from the active subscription plan.
- Razorpay subscription checkout with server-created provider plans.
- Hosted Razorpay checkout URL; card/UPI credentials never enter Feedlyst storage.
- Idempotent payment records keyed by provider + provider payment ID.
- Signed Razorpay webhook verification using the raw request body.
- Idempotent webhook event storage and replay protection.
- Subscription lifecycle reconciliation for active, pending, paused, cancelled, completed and expired states.
- Payment reconciliation from the provider transaction feed.
- Scheduled reconciliation through `/api/cron/billing`.
- Subscription cancellation at the end of the billing cycle.
- Tenant isolation through authenticated account membership.

## API
- `GET /api/billing` — plans and current subscription.
- `POST /api/billing/checkout` — create a Razorpay subscription checkout for an active plan.
- `POST /api/billing/cancel` — cancel the current Razorpay subscription; defaults to cycle-end cancellation.
- `POST /api/billing/webhook` — signed Razorpay webhook receiver.
- `GET /api/cron/billing` — protected provider reconciliation worker.

## Environment
Set these server-side in Vercel:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CRON_SECRET`

Configure the Razorpay webhook URL as:
`https://<production-host>/api/billing/webhook`

Subscribe to the payment/subscription lifecycle events required by the integration, including successful/failed payments and subscription state changes.

## Reconciliation
Webhooks are the primary event path. The scheduled worker periodically fetches provider subscription state and subscription transactions to repair missed or delayed webhook deliveries. Razorpay recommends webhooks for automation and API fetching as a fallback for critical status verification. citeturn1search6turn1search3

## Tests
- Webhook HMAC accepts the exact raw body and rejects tampered payloads.
- Database idempotency is enforced by provider event/payment identifiers.
- Subscription and payment reconciliation are implemented behind the provider adapter.

## Acceptance
- No payment secret is exposed to client code.
- Checkout is initiated only for an authenticated account member.
- Webhooks are rejected unless their signature is valid.
- Duplicate webhook delivery does not duplicate payment/subscription state.
- Provider state can repair local state through scheduled reconciliation.
- Subscription cancellation is reflected locally and through the provider.

## Operational note
Razorpay credentials and webhook secrets must be configured before checkout can be used. The code is deployed-safe without credentials; checkout returns a configuration error until the provider is configured.
