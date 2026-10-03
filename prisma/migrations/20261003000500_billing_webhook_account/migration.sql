ALTER TABLE "billing_webhook_events"
  ADD COLUMN "account_id" UUID;

ALTER TABLE "billing_webhook_events"
  ADD CONSTRAINT "billing_webhook_events_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "billing_webhook_events_account_id_idx"
  ON "billing_webhook_events"("account_id");