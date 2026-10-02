import "server-only";
import { db } from "@/lib/db";
import { syncGoogleSource } from "@/lib/integrations/google-sync";
import { GOOGLE_INTEGRATION_KEY } from "@/lib/integrations/google";

const LOCK_TTL_MS = 10 * 60 * 1000;

export async function enqueueActiveGoogleSources() {
  const connections = await db.connection.findMany({
    where: {
      status: "ACTIVE",
      integration: { key: GOOGLE_INTEGRATION_KEY, status: "ACTIVE" },
    },
    select: { id: true, sources: { where: { status: "ACTIVE" }, select: { id: true } } },
  });

  let enqueued = 0;
  for (const connection of connections) {
    for (const source of connection.sources) {
      const existing = await db.syncJob.findFirst({
        where: {
          sourceId: source.id,
          status: { in: ["PENDING", "RUNNING"] },
        },
        select: { id: true },
      });
      if (existing) continue;

      await db.syncJob.create({
        data: {
          sourceId: source.id,
          type: "reviews",
          status: "PENDING",
          scheduledAt: new Date(),
        },
      });
      enqueued += 1;
    }
  }

  return enqueued;
}

export async function processSyncJobs(limit = 10) {
  const staleBefore = new Date(Date.now() - LOCK_TTL_MS);
  await db.syncJob.updateMany({
    where: { status: "RUNNING", lockedAt: { lt: staleBefore } },
    data: { status: "PENDING", lockedAt: null, startedAt: null },
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  while (processed < limit) {
    const job = await db.syncJob.findFirst({
      where: {
        status: "PENDING",
        scheduledAt: { lte: new Date() },
        attempts: { lt: { not: undefined } as never },
      },
      orderBy: [{ priority: "asc" }, { scheduledAt: "asc" }],
      select: { id: true, sourceId: true, attempts: true, maxAttempts: true },
    });
    if (!job) break;

    const claimed = await db.syncJob.updateMany({
      where: {
        id: job.id,
        status: "PENDING",
        attempts: job.attempts,
      },
      data: {
        status: "RUNNING",
        attempts: { increment: 1 },
        startedAt: new Date(),
        lockedAt: new Date(),
      },
    });
    if (claimed.count !== 1) continue;

    processed += 1;
    try {
      if (!job.sourceId) throw new Error("SYNC_SOURCE_REQUIRED");
      await syncGoogleSource(job.sourceId);
      await db.syncJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          lockedAt: null,
        },
      });
      succeeded += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const retry = attempts < job.maxAttempts;
      await db.syncJob.update({
        where: { id: job.id },
        data: {
          status: retry ? "PENDING" : "FAILED",
          scheduledAt: retry ? new Date(Date.now() + Math.min(60_000 * 2 ** (attempts - 1), 3_600_000)) : undefined,
          completedAt: retry ? null : new Date(),
          lockedAt: null,
          lastError: error instanceof Error ? error.message : "SYNC_FAILED",
        },
      });
      failed += 1;
    }
  }

  return { processed, succeeded, failed };
}
