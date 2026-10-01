# Test Strategy

## Brief
Quality is verified at multiple levels. No production phase is complete based only on manual browser testing.

## Test Layers
1. **Unit** — pure business rules, schemas, adapters, formatters.
2. **Integration** — database, OAuth, provider APIs, queues.
3. **API/Contract** — request/response and authorization behavior.
4. **Component** — dashboard/editor UI behavior.
5. **End-to-End** — critical user journeys.
6. **Widget Runtime** — external-site loading and rendering.
7. **Security** — tenant isolation, secret handling, OAuth security.
8. **Performance** — dashboard and public delivery.
9. **Resilience** — provider outage, retries, stale cache.
10. **Regression** — release-critical suite.

## Required Release Journeys
- Sign up → project → integration → source → widget → publish → embed.
- Disconnect/reconnect integration.
- Provider API failure and recovery.
- Widget configuration update.
- Usage limit reached.
- Unauthorized project access.
- Public widget load from a real external origin.

## Quality Gate
A release requires passing automated tests, lint/type checks, security checks, and critical E2E journeys.
