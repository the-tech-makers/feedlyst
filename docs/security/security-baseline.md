# Security Baseline

## Brief
Minimum security controls required before production exposure. This document complements feature-specific security tests.

## Identity & Authorization
- Authenticate all dashboard requests.
- Authorize at tenant and resource level server-side.
- Never trust tenant/project identifiers supplied by the client.
- Use secure session cookies or equivalent protected session mechanism.

## OAuth & Secrets
- Validate OAuth state and redirect URI.
- Encrypt access/refresh tokens at rest.
- Rotate or refresh credentials according to provider requirements.
- Never return provider tokens to widget runtime.
- Redact secrets from logs, traces, errors, and analytics.

## Data Protection
- Minimize stored provider data.
- Define retention/deletion behavior for disconnected sources.
- Use parameterized database access.
- Validate external provider payloads before persistence.

## Public Runtime
- Public endpoints return only published widget data.
- Enforce publication/domain policy where enabled.
- Apply rate limits and abuse monitoring.
- Treat widget configuration as untrusted input during rendering.

## Release Gate
Security review is required for authentication, OAuth, billing, public runtime, and tenant-boundary changes.
