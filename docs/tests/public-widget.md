# Test Plan — Public Widget Runtime

## Brief
Validate the highest-risk path: anonymous visitors loading widgets on external websites.

## Cases
- First load.
- Cached load.
- Slow network.
- API timeout.
- Invalid widget ID.
- Unpublished widget.
- Deleted source.
- Empty data.
- Partial data.
- Malformed configuration.
- Mobile viewport.
- Multiple widgets on one page.
- Multiple widgets using one source.
- Browser refresh.
- SPA route change where supported.

## Security
- No provider secrets in network payloads.
- Origin/domain enforcement.
- Public endpoints expose only publication-safe data.
- Abuse/rate-limit controls.

## Performance
Track:
- script size;
- time to bootstrap;
- API latency;
- cache hit ratio;
- render completion;
- error rate.

## Acceptance
A public widget remains isolated from dashboard credentials and fails gracefully without breaking the host page.
