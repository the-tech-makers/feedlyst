# Data Model — Usage & Billing

## Brief
Defines usage and commercial state while keeping the core domain independent of Razorpay-specific objects.

## Plan
Commercial plan definition.

Fields:
- id
- key
- name
- status
- limits/configuration
- price metadata
- createdAt
- updatedAt

## Subscription
Account's commercial entitlement state.

Fields:
- id
- accountId
- planId
- status
- provider
- providerSubscriptionId
- currentPeriodStart
- currentPeriodEnd
- cancelAt
- createdAt
- updatedAt

Razorpay identifiers stay inside payment-provider integration fields.

## Payment
Payment transaction.

Fields:
- id
- accountId
- subscriptionId (optional)
- provider
- providerPaymentId
- amount
- currency
- status
- paidAt
- metadata
- createdAt
- updatedAt

Constraint: provider + providerPaymentId must be unique.

## UsageEvent
Immutable metering event.

Fields:
- id
- accountId
- projectId (optional)
- widgetId (optional)
- publicationId (optional)
- eventType
- quantity
- occurredAt
- metadata

Usage events are append-only.

## Usage Aggregate
Optional derived daily/monthly totals for high-volume metrics.

Possible key:
- accountId
- metric
- periodStart
- periodEnd
- quantity

Aggregates can be rebuilt from events.

## Entitlement
Effective features and limits available to an Account.

Examples:
- maximum projects
- maximum published widgets
- monthly widget views
- enabled integrations
- collaboration seats

For the MVP, Entitlement may be derived from Plan + Subscription rather than stored separately.

## Billing Boundary
Application services use Plan, Subscription, Payment, Usage and Entitlement concepts. Razorpay-specific API objects remain inside a provider adapter.
