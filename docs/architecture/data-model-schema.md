# Data Model — MVP PostgreSQL Schema Contract

## Brief
Exact initial table, column, key and index contract for Feedlyst. This is the design source for the first Prisma schema and migrations.

## Conventions
- Database: PostgreSQL.
- Primary keys: UUID.
- Time: TIMESTAMPTZ, stored and handled in UTC.
- Short identifiers/names: VARCHAR with explicit limits.
- Long content/errors: TEXT.
- Flexible configuration/metadata: JSONB.
- Money: BIGINT in the smallest currency unit; never floating point.
- Counts: INTEGER.
- Ratings: SMALLINT.
- Booleans: BOOLEAN.
- All tables use created_at; mutable domain tables also use updated_at.
- Table names use snake_case.
- Foreign keys use {referenced_table_singular}_id.

## 1. users
Human identity in Feedlyst.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| email | VARCHAR(320) | NO | UNIQUE |
| name | VARCHAR(160) | YES | |
| image_url | TEXT | YES | |
| email_verified_at | TIMESTAMPTZ | YES | |
| status | user_status | NO | DEFAULT ACTIVE |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(email), status, created_at.

## 2. accounts
Customer/tenant/workspace boundary.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| name | VARCHAR(160) | NO | |
| slug | VARCHAR(80) | NO | UNIQUE |
| status | account_status | NO | DEFAULT ACTIVE |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(slug), status.

## 3. memberships
User membership in an Account.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| user_id | UUID | NO | FK users.id |
| role | membership_role | NO | DEFAULT MEMBER |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(account_id, user_id).

Indexes: user_id; account_id, role.

Delete behavior: normal user/account operations must not accidentally cascade business data.

## 4. auth_accounts
External authentication identities used by Auth.js. This is deliberately distinct from Feedlyst accounts.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| user_id | UUID | NO | FK users.id |
| provider | VARCHAR(64) | NO | |
| provider_account_id | VARCHAR(255) | NO | |
| access_token_encrypted | TEXT | YES | |
| refresh_token_encrypted | TEXT | YES | |
| access_token_expires_at | TIMESTAMPTZ | YES | |
| scope | TEXT | YES | |
| token_type | VARCHAR(32) | YES | |
| id_token_encrypted | TEXT | YES | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(provider, provider_account_id).

Indexes: user_id.

Security: token fields encrypted at rest and never logged.

## 5. sessions
Only required if database-backed Auth.js sessions are selected.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| user_id | UUID | NO | FK users.id |
| session_token | VARCHAR(255) | NO | UNIQUE |
| expires_at | TIMESTAMPTZ | NO | |
| created_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(session_token); user_id; expires_at.

## 6. projects
Website/client workspace.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| name | VARCHAR(160) | NO | |
| slug | VARCHAR(80) | NO | |
| website_url | TEXT | YES | |
| status | project_status | NO | DEFAULT ACTIVE |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(account_id, slug).

Indexes: account_id; account_id, status.

## 7. integrations
Static provider catalog.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| key | VARCHAR(80) | NO | UNIQUE |
| name | VARCHAR(120) | NO | |
| status | integration_status | NO | DEFAULT ACTIVE |
| capabilities | JSONB | NO | DEFAULT {} |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(key); status.

## 8. connections
Account authorization with an Integration.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| integration_id | UUID | NO | FK integrations.id |
| status | connection_status | NO | |
| provider_principal_id | VARCHAR(255) | YES | |
| credentials_encrypted | TEXT | YES | |
| scopes | JSONB | NO | DEFAULT [] |
| expires_at | TIMESTAMPTZ | YES | |
| last_validated_at | TIMESTAMPTZ | YES | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: account_id; account_id, integration_id; integration_id, status; provider_principal_id.

Credentials must never be returned by public APIs.

## 9. sources
Provider entity selected through a Connection.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| connection_id | UUID | NO | FK connections.id |
| external_id | VARCHAR(512) | NO | |
| name | VARCHAR(255) | NO | |
| metadata | JSONB | NO | DEFAULT {} |
| status | source_status | NO | DEFAULT ACTIVE |
| last_synced_at | TIMESTAMPTZ | YES | |
| sync_cursor | TEXT | YES | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(connection_id, external_id).

Indexes: connection_id; connection_id, status; status, last_synced_at.

## 10. reviews
Provider-neutral normalized review records.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| source_id | UUID | NO | FK sources.id |
| external_id | VARCHAR(512) | NO | |
| author_name | VARCHAR(255) | NO | |
| author_image_url | TEXT | YES | |
| rating | SMALLINT | NO | normalized range validated in application |
| title | VARCHAR(500) | YES | |
| body | TEXT | YES | |
| published_at | TIMESTAMPTZ | YES | |
| provider_updated_at | TIMESTAMPTZ | YES | |
| provider_metadata | JSONB | NO | DEFAULT {} |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(source_id, external_id).

Indexes: source_id, published_at DESC; source_id, rating; source_id, provider_updated_at.

## 11. sync_jobs
MVP PostgreSQL-backed queue.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| source_id | UUID | YES | FK sources.id |
| type | VARCHAR(64) | NO | |
| status | sync_job_status | NO | DEFAULT PENDING |
| priority | SMALLINT | NO | DEFAULT 100 |
| attempts | INTEGER | NO | DEFAULT 0 |
| max_attempts | SMALLINT | NO | DEFAULT 5 |
| scheduled_at | TIMESTAMPTZ | NO | |
| started_at | TIMESTAMPTZ | YES | |
| completed_at | TIMESTAMPTZ | YES | |
| locked_at | TIMESTAMPTZ | YES | |
| last_error | TEXT | YES | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: status, scheduled_at, priority; source_id, status; status, locked_at.

Worker rule: claim eligible jobs transactionally with row locking/skip-locked behavior. Jobs must be retry-safe.

## 12. sync_runs
History of synchronization executions.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| source_id | UUID | NO | FK sources.id |
| job_id | UUID | YES | FK sync_jobs.id |
| status | sync_run_status | NO | |
| started_at | TIMESTAMPTZ | NO | |
| completed_at | TIMESTAMPTZ | YES | |
| records_read | INTEGER | NO | DEFAULT 0 |
| records_created | INTEGER | NO | DEFAULT 0 |
| records_updated | INTEGER | NO | DEFAULT 0 |
| error | TEXT | YES | |
| created_at | TIMESTAMPTZ | NO | |

Indexes: source_id, started_at DESC; job_id; status, started_at DESC.

## 13. widgets
Editable widget definition.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| project_id | UUID | NO | FK projects.id |
| type | VARCHAR(80) | NO | |
| name | VARCHAR(160) | NO | |
| status | widget_status | NO | DEFAULT DRAFT |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: account_id, project_id; project_id, status; account_id, type.

## 14. widget_sources
Many-to-many Widget ↔ Source relation.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| widget_id | UUID | NO | FK widgets.id |
| source_id | UUID | NO | FK sources.id |
| sort_order | INTEGER | NO | DEFAULT 0 |
| created_at | TIMESTAMPTZ | NO | |

Primary key: (widget_id, source_id).

Indexes: source_id, widget_id; widget_id, sort_order.

Application rule: source and widget must belong to the same Account.

## 15. widget_versions
Immutable widget configuration snapshots.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| widget_id | UUID | NO | FK widgets.id |
| version | INTEGER | NO | |
| schema_version | INTEGER | NO | |
| configuration | JSONB | NO | |
| created_by | UUID | NO | FK users.id |
| created_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(widget_id, version).

Indexes: widget_id, version DESC; created_by.

## 16. publications
Public delivery endpoint.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| widget_id | UUID | NO | FK widgets.id |
| public_key | VARCHAR(64) | NO | UNIQUE |
| status | publication_status | NO | DEFAULT UNPUBLISHED |
| active_version_id | UUID | YES | FK widget_versions.id |
| allowed_domains | JSONB | NO | DEFAULT [] |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(public_key); widget_id; status; active_version_id.

Public key is an identifier, not a secret credential.

## 17. usage_events
Append-only metering events.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| project_id | UUID | YES | FK projects.id |
| widget_id | UUID | YES | FK widgets.id |
| publication_id | UUID | YES | FK publications.id |
| event_type | VARCHAR(64) | NO | |
| quantity | INTEGER | NO | DEFAULT 1 |
| occurred_at | TIMESTAMPTZ | NO | |
| metadata | JSONB | NO | DEFAULT {} |
| created_at | TIMESTAMPTZ | NO | |

Indexes: account_id, occurred_at DESC; publication_id, occurred_at DESC; widget_id, occurred_at DESC; account_id, event_type, occurred_at DESC.

## 18. plans
Commercial plan catalog.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| key | VARCHAR(80) | NO | UNIQUE |
| name | VARCHAR(120) | NO | |
| status | plan_status | NO | |
| limits | JSONB | NO | DEFAULT {} |
| price_minor | BIGINT | NO | |
| currency | CHAR(3) | NO | |
| billing_interval | billing_interval | NO | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: UNIQUE(key); status.

## 19. subscriptions
Account billing subscription.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| plan_id | UUID | NO | FK plans.id |
| provider | VARCHAR(32) | NO | |
| provider_subscription_id | VARCHAR(255) | YES | |
| status | subscription_status | NO | |
| current_period_start | TIMESTAMPTZ | YES | |
| current_period_end | TIMESTAMPTZ | YES | |
| cancel_at | TIMESTAMPTZ | YES | |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Indexes: account_id, status; provider, provider_subscription_id; current_period_end.

Unique: provider + provider_subscription_id when provider_subscription_id is present.

## 20. payments
Payment transactions.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | NO | PK |
| account_id | UUID | NO | FK accounts.id |
| subscription_id | UUID | YES | FK subscriptions.id |
| provider | VARCHAR(32) | NO | |
| provider_payment_id | VARCHAR(255) | NO | |
| amount_minor | BIGINT | NO | |
| currency | CHAR(3) | NO | |
| status | payment_status | NO | |
| paid_at | TIMESTAMPTZ | YES | |
| metadata | JSONB | NO | DEFAULT {} |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

Constraints: UNIQUE(provider, provider_payment_id).

Indexes: account_id, created_at DESC; subscription_id, created_at DESC; provider, provider_payment_id.

## 21. verification_tokens
Email verification/passwordless token storage if required by the selected Auth.js flow.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| identifier | VARCHAR(320) | NO | |
| token_hash | VARCHAR(255) | NO | UNIQUE |
| expires_at | TIMESTAMPTZ | NO | |

Constraint: UNIQUE(identifier, token_hash).

Indexes: identifier, expires_at; expires_at.

## Foreign-Key Delete Policy
Default to RESTRICT for business data so deletion cannot silently destroy history.

Recommended:
- Auth Account → User: CASCADE.
- Session → User: CASCADE.
- WidgetSource → Widget/Source: CASCADE.
- SyncRun → SyncJob: SET NULL.
- UsageEvent optional project/widget/publication references: SET NULL where historical metering must survive.
- Account deletion: explicit controlled lifecycle, not accidental cascade.

## Enum Set
- user_status: ACTIVE, SUSPENDED, DELETED
- account_status: ACTIVE, SUSPENDED, DELETED
- membership_role: OWNER, MEMBER
- project_status: ACTIVE, ARCHIVED
- integration_status: ACTIVE, DISABLED
- connection_status: ACTIVE, EXPIRED, REVOKED, ERROR
- source_status: ACTIVE, DISABLED, ERROR
- sync_job_status: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
- sync_run_status: RUNNING, COMPLETED, FAILED
- widget_status: DRAFT, ACTIVE, ARCHIVED
- publication_status: UNPUBLISHED, PUBLISHED, DISABLED
- plan_status: ACTIVE, ARCHIVED
- billing_interval: MONTHLY, YEARLY
- subscription_status: TRIALING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED
- payment_status: PENDING, SUCCEEDED, FAILED, REFUNDED

## MFA / 2FA — Deferred to Phase 2
Do not add MFA tables to the MVP migration unless the selected authentication flow requires them.

Phase 2 proposed tables:
- two_factor_methods — TOTP/email method enrollment and status.
- two_factor_challenges — short-lived one-time authentication challenges.
- recovery_codes — hashed, one-time recovery codes.

TOTP secrets must be encrypted. Recovery codes should be hashed. OTP challenges require expiry, attempt limits, single-use semantics and rate limiting.

## Important Integrity Rule
For relations crossing multiple tenant-owned tables, application services must validate that both sides resolve to the same Account. Foreign keys alone do not enforce this tenant invariant.

## Indexing Rule
Do not index every column. Index foreign keys and real dashboard/runtime query paths. Composite indexes should follow actual predicates and ordering. Prisma supports primary keys, unique constraints and database indexes directly in the schema. citeturn0search1turn0search2

## Migration Rule
The Prisma schema and migration files are version-controlled. Production schema changes must be applied through migrations, never by ad-hoc schema pushes.
