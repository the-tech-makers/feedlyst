# Task — Connections

## Brief
Implementation contract for the Connections module in M2.

## Status
IN PROGRESS

## Objective
Implement secure provider connection lifecycle.

## Scope
OAuth initiation/callback, state validation, encrypted tokens, refresh, disconnect, status and reauthorization.

## Dependencies
Integration registry and authentication.

## Acceptance Criteria
- No provider secret is returned to browser or written to logs.
- OAuth state is generated server-side, hashed at rest, expires, and is single-use.
- Provider adapters exchange and refresh tokens server-side.
- Provider credentials are encrypted before persistence.

## Tests
- OAuth success/failure; token refresh; invalid state; disconnect; secret scanning.
- Google authorization URL and credential normalization.

## Completion
Connection encryption, OAuth state persistence/consumption, connection lifecycle services, generic OAuth client, and Google Business Profile OAuth adapter are implemented. Callback persistence, refresh orchestration, provider API validation, and full integration tests remain.
