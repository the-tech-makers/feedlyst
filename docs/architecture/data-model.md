# Architecture — Core Data Model

## Brief
Defines the platform entities and their ownership boundaries before implementation begins.

## Entities

### Account
Authenticated customer/tenant boundary. Owns projects, connections, widgets, usage, and billing state.

### Project
Represents a website/client workspace. Contains widgets and project-scoped configuration.

### Connection
Encrypted authorization state for an external provider. Never exposed to public widget delivery.

### Source
A provider entity selected through a connection, such as a Google Business location. A connection may expose multiple sources.

### Widget
Reusable presentation configuration referencing one or more supported sources. Stores draft and published configuration versions.

### Publication
Public delivery state for a widget, including stable public identifier, active version, domain policy, and publication status.

### Normalized Data
Provider-independent records such as Review. Provider adapters own mapping into normalized models.

### Usage Event
Immutable metering event used to calculate billable/limited consumption such as widget views.

## Relationship
Account → Projects → Widgets → Publications
Account → Connections → Sources
Sources → Normalized Data → Widgets
Widgets → Usage Events

## Invariants
- Every tenant-owned record is tenant-scoped.
- Public delivery cannot traverse through Account credentials.
- Provider IDs remain available for reconciliation.
- Normalized records must support idempotent synchronization.
- Published configuration is immutable by version; new edits create a new draft/version.
