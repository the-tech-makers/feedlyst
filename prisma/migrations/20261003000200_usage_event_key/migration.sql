ALTER TABLE "usage_events" ADD COLUMN "event_key" VARCHAR(128);
UPDATE "usage_events" SET "event_key" = encode(gen_random_bytes(16), 'hex') WHERE "event_key" IS NULL;
ALTER TABLE "usage_events" ALTER COLUMN "event_key" SET NOT NULL;
CREATE UNIQUE INDEX "usage_events_event_key_key" ON "usage_events"("event_key");
