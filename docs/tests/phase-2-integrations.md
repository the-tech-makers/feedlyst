# Test Plan — Phase 2 Integration Engine

## Brief
Validate provider connection lifecycle, synchronization, normalization, and failure recovery.

## Cases
- OAuth success.
- OAuth denial.
- Invalid state.
- Expired access token.
- Refresh failure.
- Source discovery.
- Source selection.
- Pagination.
- Duplicate records.
- Deleted/changed provider records.
- Rate-limit response.
- Provider outage.
- Retry exhaustion.
- Partial synchronization.
- Manual resynchronization.

## Data Integrity
- Stable external IDs.
- Idempotent upsert.
- Correct timestamps.
- Correct source ownership.
- No credential leakage.

## Acceptance
A provider failure does not corrupt existing normalized data and the system reports synchronization health accurately.
