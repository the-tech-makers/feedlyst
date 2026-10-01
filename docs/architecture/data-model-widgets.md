# Data Model — Normalized Data, Widgets & Publishing

## Brief
Defines the data consumed by widgets and the immutable public delivery model.

## Review
Provider-neutral representation of a review.

Fields:
- id
- sourceId
- externalId
- authorName
- authorImageUrl
- rating
- title (optional)
- body
- publishedAt
- updatedAt
- providerMetadata
- createdAt
- updatedAt

Constraint: sourceId + externalId must be unique.

Common fields stay relational. Provider-specific fields may live in providerMetadata when they are not part of the common contract.

## Widget
Reusable customer configuration.

Fields:
- id
- accountId
- projectId
- type
- name
- status
- createdAt
- updatedAt

## WidgetSource
Join record connecting a Widget to one or more Sources.

Fields:
- widgetId
- sourceId
- display/order metadata where required

Constraint: widgetId + sourceId must be unique.

One Source may power many Widgets.

## WidgetVersion
Immutable configuration snapshot.

Fields:
- id
- widgetId
- version
- configuration
- schemaVersion
- createdAt
- createdBy

Constraint: widgetId + version must be unique.

Configuration must be schema-versioned so future editor changes can migrate old configurations.

## Publication
Public delivery endpoint for a Widget.

Fields:
- id
- widgetId
- publicKey
- status
- activeVersionId
- domain policy
- createdAt
- updatedAt

publicKey must be globally unique.

## Public Runtime Rules
- Public requests identify a Publication using a non-secret public key.
- Runtime reads the active immutable version and normalized data.
- Runtime never receives OAuth credentials.
- Runtime never exposes Account, Connection or credential data.
- A published configuration remains stable until another version is explicitly published.

## Future Extensions
The model should remain extensible for preview URLs, scheduled publishing, device/page targeting, domain verification and publication analytics without adding these fields to the MVP prematurely.
