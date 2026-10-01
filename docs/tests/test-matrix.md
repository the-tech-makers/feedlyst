# Test Matrix

## Brief
Maps product modules to the minimum verification required before release.

| Area | Unit | Integration | E2E | Security | Performance |
|---|---:|---:|---:|---:|---:|
| Authentication | ✓ | ✓ | ✓ | ✓ | — |
| Tenant isolation | ✓ | ✓ | ✓ | ✓ | — |
| Projects | ✓ | ✓ | ✓ | ✓ | — |
| OAuth connections | ✓ | ✓ | ✓ | ✓ | — |
| Source discovery | ✓ | ✓ | ✓ | ✓ | — |
| Sync workers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Normalization | ✓ | ✓ | — | — | — |
| Widget config | ✓ | ✓ | ✓ | ✓ | — |
| Widget editor | ✓ | ✓ | ✓ | ✓ | — |
| Public runtime | ✓ | ✓ | ✓ | ✓ | ✓ |
| Domain controls | ✓ | ✓ | ✓ | ✓ | — |
| Usage metering | ✓ | ✓ | ✓ | ✓ | ✓ |
| Billing | ✓ | ✓ | ✓ | ✓ | — |

## Release-Critical Journeys
1. Sign up → create project → connect source → create widget → publish → embed.
2. Reconnect an expired provider connection.
3. Provider outage → retry → recovery without corrupting stored data.
4. Update a widget draft → publish → verify public output.
5. Attempt cross-tenant access and mutation.
6. Exceed usage limit and verify defined product behavior.

## Browser Matrix
Support the current major versions of Chrome, Edge, Safari, and Firefox unless a later compatibility decision narrows the matrix.

## Accessibility
Automated checks plus keyboard-only and screen-reader spot checks for critical flows.

## Performance
Set measurable budgets before public launch for runtime script size, bootstrap latency, API latency, cache hit ratio, and error rate.
