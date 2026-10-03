-- Create the initial Feedlyst database schema.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE "membership_role" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "project_status" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "integration_status" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "connection_status" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR');
CREATE TYPE "oauth_state_status" AS ENUM ('ACTIVE', 'CONSUMED', 'EXPIRED');
CREATE TYPE "source_status" AS ENUM ('ACTIVE', 'DISABLED', 'ERROR');
CREATE TYPE "sync_job_status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "sync_run_status" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "widget_status" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "widget_version_state" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "publication_status" AS ENUM ('UNPUBLISHED', 'PUBLISHED', 'DISABLED');
CREATE TYPE "plan_status" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "billing_interval" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "subscription_status" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "password_hash" TEXT,
  "name" VARCHAR(160),
  "image_url" TEXT,
  "email_verified_at" TIMESTAMPTZ(6),
  "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

CREATE TABLE "accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(80) NOT NULL,
  "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_slug_key" ON "accounts"("slug");
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

CREATE TABLE "memberships" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "membership_role" NOT NULL DEFAULT 'MEMBER',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "memberships_account_id_user_id_key" ON "memberships"("account_id","user_id");
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");
CREATE INDEX "memberships_account_id_role_idx" ON "memberships"("account_id","role");

CREATE TABLE "auth_accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(64) NOT NULL,
  "provider_account_id" VARCHAR(255) NOT NULL,
  "access_token_encrypted" TEXT,
  "refresh_token_encrypted" TEXT,
  "access_token_expires_at" TIMESTAMPTZ(6),
  "scope" TEXT,
  "token_type" VARCHAR(32),
  "id_token_encrypted" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "auth_accounts_provider_provider_account_id_key" ON "auth_accounts"("provider","provider_account_id");
CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts"("user_id");

CREATE TABLE "sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "session_token" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

CREATE TABLE "projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(80) NOT NULL,
  "website_url" TEXT,
  "status" "project_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "projects_account_id_slug_key" ON "projects"("account_id","slug");
CREATE INDEX "projects_account_id_idx" ON "projects"("account_id");
CREATE INDEX "projects_account_id_status_idx" ON "projects"("account_id","status");

CREATE TABLE "integrations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(80) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "status" "integration_status" NOT NULL DEFAULT 'ACTIVE',
  "capabilities" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "integrations_key_key" ON "integrations"("key");
CREATE INDEX "integrations_status_idx" ON "integrations"("status");

CREATE TABLE "oauth_states" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "integration_id" UUID NOT NULL,
  "state_hash" VARCHAR(128) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "status" "oauth_state_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consumed_at" TIMESTAMPTZ(6),
  CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "oauth_states_state_hash_key" ON "oauth_states"("state_hash");
CREATE INDEX "oauth_states_account_id_integration_id_idx" ON "oauth_states"("account_id","integration_id");
CREATE INDEX "oauth_states_expires_at_status_idx" ON "oauth_states"("expires_at","status");

CREATE TABLE "connections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "integration_id" UUID NOT NULL,
  "status" "connection_status" NOT NULL,
  "provider_principal_id" VARCHAR(255),
  "credentials_encrypted" TEXT,
  "scopes" JSONB NOT NULL DEFAULT '[]',
  "expires_at" TIMESTAMPTZ(6),
  "last_validated_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "connections_account_id_idx" ON "connections"("account_id");
CREATE INDEX "connections_account_id_integration_id_idx" ON "connections"("account_id","integration_id");
CREATE INDEX "connections_integration_id_status_idx" ON "connections"("integration_id","status");
CREATE INDEX "connections_provider_principal_id_idx" ON "connections"("provider_principal_id");

CREATE TABLE "sources" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "connection_id" UUID NOT NULL,
  "external_id" VARCHAR(512) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "status" "source_status" NOT NULL DEFAULT 'ACTIVE',
  "last_synced_at" TIMESTAMPTZ(6),
  "sync_cursor" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sources_connection_id_external_id_key" ON "sources"("connection_id","external_id");
CREATE INDEX "sources_connection_id_idx" ON "sources"("connection_id");
CREATE INDEX "sources_connection_id_status_idx" ON "sources"("connection_id","status");
CREATE INDEX "sources_status_last_synced_at_idx" ON "sources"("status","last_synced_at");

CREATE TABLE "reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL,
  "external_id" VARCHAR(512) NOT NULL,
  "author_name" VARCHAR(255) NOT NULL,
  "author_image_url" TEXT,
  "rating" SMALLINT NOT NULL,
  "title" VARCHAR(500),
  "body" TEXT,
  "published_at" TIMESTAMPTZ(6),
  "provider_updated_at" TIMESTAMPTZ(6),
  "provider_metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "reviews_source_id_external_id_key" ON "reviews"("source_id","external_id");
CREATE INDEX "reviews_source_id_published_at_idx" ON "reviews"("source_id","published_at" DESC);
CREATE INDEX "reviews_source_id_rating_idx" ON "reviews"("source_id","rating");
CREATE INDEX "reviews_source_id_provider_updated_at_idx" ON "reviews"("source_id","provider_updated_at");

CREATE TABLE "sync_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_id" UUID,
  "type" VARCHAR(64) NOT NULL,
  "status" "sync_job_status" NOT NULL DEFAULT 'PENDING',
  "priority" SMALLINT NOT NULL DEFAULT 100,
  "attempts" SMALLINT NOT NULL DEFAULT 0,
  "max_attempts" SMALLINT NOT NULL DEFAULT 5,
  "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
  "started_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "locked_at" TIMESTAMPTZ(6),
  "last_error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "sync_jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "sync_jobs_status_scheduled_at_priority_idx" ON "sync_jobs"("status","scheduled_at","priority");
CREATE INDEX "sync_jobs_source_id_status_idx" ON "sync_jobs"("source_id","status");
CREATE INDEX "sync_jobs_status_locked_at_idx" ON "sync_jobs"("status","locked_at");

CREATE TABLE "sync_runs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL,
  "job_id" UUID,
  "status" "sync_run_status" NOT NULL,
  "started_at" TIMESTAMPTZ(6) NOT NULL,
  "completed_at" TIMESTAMPTZ(6),
  "records_read" INTEGER NOT NULL DEFAULT 0,
  "records_created" INTEGER NOT NULL DEFAULT 0,
  "records_updated" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "sync_runs_source_id_started_at_idx" ON "sync_runs"("source_id","started_at" DESC);
CREATE INDEX "sync_runs_job_id_idx" ON "sync_runs"("job_id");
CREATE INDEX "sync_runs_status_started_at_idx" ON "sync_runs"("status","started_at" DESC);

CREATE TABLE "widgets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "type" VARCHAR(80) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "status" "widget_status" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "widgets_account_id_project_id_idx" ON "widgets"("account_id","project_id");
CREATE INDEX "widgets_project_id_status_idx" ON "widgets"("project_id","status");
CREATE INDEX "widgets_account_id_type_idx" ON "widgets"("account_id","type");

CREATE TABLE "widget_sources" (
  "widget_id" UUID NOT NULL,
  "source_id" UUID NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "widget_sources_pkey" PRIMARY KEY ("widget_id","source_id")
);
CREATE INDEX "widget_sources_source_id_widget_id_idx" ON "widget_sources"("source_id","widget_id");
CREATE INDEX "widget_sources_widget_id_sort_order_idx" ON "widget_sources"("widget_id","sort_order");

CREATE TABLE "widget_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "widget_id" UUID NOT NULL,
  "state" "widget_version_state" NOT NULL,
  "version_number" INTEGER NOT NULL,
  "schema_version" INTEGER NOT NULL,
  "configuration" JSONB NOT NULL,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "widget_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "widget_versions_widget_id_state_key" ON "widget_versions"("widget_id","state");
CREATE UNIQUE INDEX "widget_versions_widget_id_version_number_key" ON "widget_versions"("widget_id","version_number");
CREATE INDEX "widget_versions_widget_id_state_idx" ON "widget_versions"("widget_id","state");
CREATE INDEX "widget_versions_widget_id_version_number_idx" ON "widget_versions"("widget_id","version_number" DESC);

CREATE TABLE "publications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "widget_id" UUID NOT NULL,
  "public_key" VARCHAR(64) NOT NULL,
  "status" "publication_status" NOT NULL DEFAULT 'UNPUBLISHED',
  "active_version_id" UUID,
  "allowed_domains" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "publications_widget_id_key" ON "publications"("widget_id");
CREATE UNIQUE INDEX "publications_public_key_key" ON "publications"("public_key");
CREATE UNIQUE INDEX "publications_active_version_id_key" ON "publications"("active_version_id");
CREATE INDEX "publications_status_idx" ON "publications"("status");
CREATE INDEX "publications_active_version_id_idx" ON "publications"("active_version_id");

CREATE TABLE "usage_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "project_id" UUID,
  "widget_id" UUID,
  "publication_id" UUID,
  "event_type" VARCHAR(64) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "usage_events_account_id_occurred_at_idx" ON "usage_events"("account_id","occurred_at" DESC);
CREATE INDEX "usage_events_publication_id_occurred_at_idx" ON "usage_events"("publication_id","occurred_at" DESC);
CREATE INDEX "usage_events_widget_id_occurred_at_idx" ON "usage_events"("widget_id","occurred_at" DESC);
CREATE INDEX "usage_events_account_id_event_type_occurred_at_idx" ON "usage_events"("account_id","event_type","occurred_at" DESC);

CREATE TABLE "plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(80) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "status" "plan_status" NOT NULL,
  "limits" JSONB NOT NULL DEFAULT '{}',
  "price_minor" BIGINT NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "billing_interval" "billing_interval" NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "plans_key_key" ON "plans"("key");
CREATE INDEX "plans_status_idx" ON "plans"("status");

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "plan_id" UUID NOT NULL,
  "provider" VARCHAR(32) NOT NULL,
  "provider_subscription_id" VARCHAR(255),
  "status" "subscription_status" NOT NULL,
  "current_period_start" TIMESTAMPTZ(6),
  "current_period_end" TIMESTAMPTZ(6),
  "cancel_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "subscriptions_account_id_status_idx" ON "subscriptions"("account_id","status");
CREATE INDEX "subscriptions_provider_provider_subscription_id_idx" ON "subscriptions"("provider","provider_subscription_id");
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

CREATE TABLE "payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "subscription_id" UUID,
  "provider" VARCHAR(32) NOT NULL,
  "provider_payment_id" VARCHAR(255) NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "status" "payment_status" NOT NULL,
  "paid_at" TIMESTAMPTZ(6),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payments_provider_provider_payment_id_key" ON "payments"("provider","provider_payment_id");
CREATE INDEX "payments_account_id_created_at_idx" ON "payments"("account_id","created_at" DESC);
CREATE INDEX "payments_subscription_id_created_at_idx" ON "payments"("subscription_id","created_at" DESC);

CREATE TABLE "verification_tokens" (
  "identifier" VARCHAR(320) NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token_hash")
);
CREATE UNIQUE INDEX "verification_tokens_token_hash_key" ON "verification_tokens"("token_hash");
CREATE INDEX "verification_tokens_identifier_expires_at_idx" ON "verification_tokens"("identifier","expires_at");
CREATE INDEX "verification_tokens_expires_at_idx" ON "verification_tokens"("expires_at");

ALTER TABLE "memberships" ADD CONSTRAINT "memberships_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects" ADD CONSTRAINT "projects_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_integration_id_fkey"
  FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "connections" ADD CONSTRAINT "connections_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "connections" ADD CONSTRAINT "connections_integration_id_fkey"
  FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sources" ADD CONSTRAINT "sources_connection_id_fkey"
  FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_source_id_fkey"
  FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_source_id_fkey"
  FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_source_id_fkey"
  FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "sync_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "widgets" ADD CONSTRAINT "widgets_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "widget_sources" ADD CONSTRAINT "widget_sources_widget_id_fkey"
  FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widget_sources" ADD CONSTRAINT "widget_sources_source_id_fkey"
  FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "widget_versions" ADD CONSTRAINT "widget_versions_widget_id_fkey"
  FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widget_versions" ADD CONSTRAINT "widget_versions_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "publications" ADD CONSTRAINT "publications_widget_id_fkey"
  FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "publications" ADD CONSTRAINT "publications_active_version_id_fkey"
  FOREIGN KEY ("active_version_id") REFERENCES "widget_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_widget_id_fkey"
  FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_publication_id_fkey"
  FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey"
  FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
