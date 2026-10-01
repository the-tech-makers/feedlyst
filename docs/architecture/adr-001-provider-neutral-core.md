# ADR-001 — Provider-Neutral Integration Core

## Status
ACCEPTED

## Decision
Feedlyst will isolate provider-specific authentication, API calls, pagination, rate-limit handling, and payload mapping inside integration adapters. Widgets consume normalized domain data and must not depend on provider SDKs or response formats.

## Context
The product is intended to support multiple external data sources. Coupling widgets directly to provider APIs would make every new integration expensive and would expose provider-specific behavior throughout the application.

## Consequences
Positive:
- New providers can reuse existing widget capabilities.
- Provider failures are isolated.
- Public rendering does not require provider credentials.
- Normalized data can be cached and tested independently.

Trade-offs:
- Each provider needs an adapter and mapping layer.
- Some provider-specific features cannot be represented by the common model and may require explicit capabilities/extensions.

## Rejected Alternative
Implement each integration as a self-contained widget with its own data model. This is simpler initially but creates duplicated synchronization, configuration, testing, and runtime logic.
