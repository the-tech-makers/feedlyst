ALTER TABLE "plans" ADD COLUMN "provider_plan_id" VARCHAR(255);

CREATE TABLE "billing_webhook_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider" VARCHAR(32) NOT NULL,
  "provider_event_id" VARCHAR(255) NOT NULL,
  "event_type" VARCHAR(128) NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "processed_at" TIMESTAMPTZ(6),
  "error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "billing_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_webhook_events_provider_provider_event_id_key"
  ON "billing_webhook_events"("provider","provider_event_id");

CREATE INDEX "billing_webhook_events_provider_created_at_idx"
  ON "billing_webhook_events"("provider","created_at" DESC);

CREATE INDEX "billing_webhook_events_processed_at_idx"
  ON "billing_webhook_events"("processed_at");

CREATE INDEX "plans_provider_plan_id_idx" ON "plans"("provider_plan_id");