# Data Model — Integrations & Synchronization

## Brief
Defines provider-neutral integration persistence and synchronization state.

## Integration
Static catalog entry for a supported provider.

Fields:
- id
- key
- name
- status
- capabilities
- createdAt
- updatedAt

Examples: google-reviews, instagram, facebook.

Integration records are not customer credentials.

## Connection
An Account's authorization with an Integration.

Fields:
- id
- accountId
- integrationId
- status
- providerPrincipalId (optional)
- encrypted credential reference/material
- scopes
- expiresAt
- lastValidatedAt
- createdAt
- updatedAt

Credentials must never be exposed through public APIs.

## Source
A selectable provider entity obtained through a Connection.

Google Reviews example: a Google Business location.

Fields:
- id
- connectionId
- externalId
- name
- metadata
- status
- lastSyncedAt
- syncCursor/checkpoint
- createdAt
- updatedAt

Constraint: connectionId + externalId must be unique.

## Sync Job
PostgreSQL-backed queue record.

Fields:
- id
- sourceId
- type
- status
- attempts
- scheduledAt
- startedAt
- completedAt
- lastError
- createdAt
- updatedAt

The worker claims eligible jobs transactionally. Jobs must be safe to retry.

## Sync Run
Operational history for a synchronization attempt.

Fields:
- id
- sourceId
- jobId (optional)
- status
- startedAt
- completedAt
- recordsRead
- recordsCreated
- recordsUpdated
- error

Keeping job scheduling separate from run history prevents the queue from becoming an audit log.

## Synchronization Invariants
- Provider external IDs are retained.
- Repeated sync does not create duplicates.
- Provider failures and rate limits remain inside adapters.
- Public rendering uses stored normalized data only.
