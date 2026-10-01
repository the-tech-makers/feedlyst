# Scope 07 — Non-Functional Requirements

## Brief
Cross-cutting requirements that apply to every production phase and cannot be owned by one feature module.

## Security
- Tenant isolation on every authenticated read/write path.
- OAuth state, redirect URI, token refresh, and secret storage must follow secure patterns.
- Secrets encrypted at rest and excluded from logs.
- Public runtime exposes only publication-safe data.
- Rate limiting and abuse controls on public endpoints.

## Reliability
- Provider outages must not remove previously synchronized data.
- Synchronization jobs must be retryable and idempotent.
- Public widgets must fail gracefully without blocking the host page.
- Critical infrastructure failures must be observable and alertable.

## Performance
- Public delivery is optimized independently from dashboard traffic.
- CDN/cache usage is preferred for repeat widget loads.
- Runtime assets require explicit size and latency budgets before launch.
- Dashboard pages should avoid unnecessary blocking network requests.

## Accessibility
- Dashboard target: WCAG 2.2 AA.
- Public widgets must provide keyboard access and meaningful semantics where applicable.
- Focus, contrast, reduced motion, and responsive behavior are first-class requirements.

## Maintainability
- Source and documentation files target under 200–300 lines.
- Provider logic remains isolated from domain/widget logic.
- Persisted configuration schemas are versioned.
- Feature flags are preferred for risky incremental rollouts.
