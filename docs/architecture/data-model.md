# Architecture — Data Model Overview

## Brief
Defines Feedlyst's database boundaries, ownership rules, and core relationships. This is the conceptual contract; domain-specific database documents define table-level structures.

## Database Strategy
- PostgreSQL is the system of record.
- Prisma ORM is the application data-access/modeling layer.
- Foreign keys and database constraints enforce referential integrity.
- Tenant-owned records are scoped through the Account boundary.
- JSON/JSONB is used only for intentionally flexible configuration/provider metadata; core queryable business fields remain relational.
- Database migrations are version-controlled and reviewed with application changes.

## Core Domains
1. Identity & tenancy — User, Account, Membership and authentication records.
2. Projects — websites/client workspaces.
3. Integrations — Integration, Connection, Source and synchronization state.
4. Normalized data — provider-independent records such as Review.
5. Widgets — Widget, WidgetSource and immutable WidgetVersion.
6. Publishing — Publication and public delivery configuration.
7. Usage & billing — UsageEvent, Plan, Subscription, Payment and Entitlement.

## Primary Relationship
Account → Projects → Widgets → Publications

Account → Connections → Sources → Normalized Data

Widget → Widget Sources → Sources

Widget → Widget Versions → Publication → Public Runtime

Account → Usage Events → Billing / Entitlements

## Identity Boundary
Feedlyst has two different concepts that must not be confused:
- Account: the Feedlyst customer/tenant.
- Auth Account: an external authentication identity linked to a User.

The Prisma/application names and database mappings must keep these concepts distinct.

## Tenant Isolation
Every customer-owned record must be traceable to an Account, directly or through an Account-owned parent. Application queries must apply tenant scope before returning or mutating data.

## Versioning Rule
Published Widget Versions are immutable. Editing affects draft state; publishing creates or activates a new immutable version.

## Data Ownership Rules
- Provider adapters own provider-specific API behavior and mapping.
- Normalized domain records are provider-neutral.
- Widgets consume normalized data, not provider SDK responses.
- Public runtime consumes Publication-safe data only.
- OAuth credentials never belong in Widget or Publication records.

## Key Database Principles
- Use UUIDs for application identifiers.
- Store timestamps in UTC.
- Prefer explicit foreign keys.
- Index tenant scope, foreign keys, lookup keys, status and scheduling fields.
- Enforce business uniqueness with database constraints.
- Use soft deletion only where recovery/audit requirements justify it.

## Detailed Models
- data-model-identity.md — users, accounts, memberships and authentication.
- data-model-integrations.md — integrations, connections, sources and synchronization.
- data-model-widgets.md — normalized reviews, widgets, versions and publications.
- data-model-billing.md — usage, plans, subscriptions, payments and entitlements.
