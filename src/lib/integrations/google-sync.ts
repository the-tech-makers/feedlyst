import "server-only";
import { db } from "@/lib/db";
import { getConnectionCredentials, updateConnectionCredentials } from "@/lib/integrations/connections";
import { refreshGoogleToken, getGoogleTokenExpiry } from "@/lib/integrations/google";
import {
  listGoogleAccounts,
  listGoogleLocations,
  listGoogleReviews,
  normalizeGoogleRating,
  type GoogleCredentials,
} from "@/lib/integrations/google-business-profile";

const REFRESH_BUFFER_MS = 60_000;

async function getValidGoogleCredentials(connectionId: string): Promise<GoogleCredentials> {
  const credentials = await getConnectionCredentials(connectionId) as GoogleCredentials;
  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    select: { expiresAt: true },
  });

  if (
    connection?.expiresAt &&
    connection.expiresAt.getTime() - Date.now() <= REFRESH_BUFFER_MS &&
    credentials.refreshToken
  ) {
    const tokens = await refreshGoogleToken(credentials.refreshToken);
    const refreshed: GoogleCredentials = {
      ...credentials,
      accessToken: tokens.access_token ?? credentials.accessToken,
      refreshToken: tokens.refresh_token ?? credentials.refreshToken,
      tokenType: tokens.token_type ?? credentials.tokenType,
      scope: tokens.scope ?? credentials.scope,
    };
    await updateConnectionCredentials(connectionId, refreshed, {
      scopes: refreshed.scope?.split(" ").filter(Boolean),
      expiresAt: getGoogleTokenExpiry(tokens.expires_in),
    });
    return refreshed;
  }

  return credentials;
}

export async function discoverGoogleSources(connectionId: string) {
  const credentials = await getValidGoogleCredentials(connectionId);
  const accounts = await listGoogleAccounts(credentials);
  const discovered: { externalId: string; name: string; metadata: unknown }[] = [];

  for (const account of accounts) {
    if (!account.name) continue;
    const locations = await listGoogleLocations(credentials, account.name);
    for (const location of locations) {
      if (!location.name) continue;
      discovered.push({
        externalId: location.name,
        name: location.title?.trim() || location.name,
        metadata: { account, location },
      });
    }
  }

  return discovered;
}

export async function syncGoogleSource(sourceId: string) {
  const source = await db.source.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      connectionId: true,
      externalId: true,
      status: true,
    },
  });
  if (!source) throw new Error("SOURCE_NOT_FOUND");
  if (source.status !== "ACTIVE") throw new Error("SOURCE_NOT_ACTIVE");

  const run = await db.syncRun.create({
    data: {
      sourceId,
      status: "RUNNING",
      startedAt: new Date(),
    },
    select: { id: true },
  });

  try {
    const credentials = await getValidGoogleCredentials(source.connectionId);
    const reviews = await listGoogleReviews(credentials, source.externalId);
    let created = 0;
    let updated = 0;

    for (const review of reviews) {
      if (!review.name) continue;
      const data = {
        authorName: review.reviewer?.displayName?.trim() || "Google user",
        authorImageUrl: review.reviewer?.profilePhotoUrl ?? null,
        rating: normalizeGoogleRating(review.starRating),
        title: null,
        body: review.comment?.trim() || null,
        publishedAt: review.createTime ? new Date(review.createTime) : null,
        providerUpdatedAt: review.updateTime ? new Date(review.updateTime) : null,
        providerMetadata: review as object,
      };

      const existing = await db.review.findUnique({
        where: { sourceId_externalId: { sourceId, externalId: review.name } },
        select: { id: true },
      });

      if (existing) {
        await db.review.update({ where: { id: existing.id }, data });
        updated += 1;
      } else {
        await db.review.create({
          data: { sourceId, externalId: review.name, ...data },
        });
        created += 1;
      }
    }

    await db.source.update({
      where: { id: sourceId },
      data: { lastSyncedAt: new Date(), status: "ACTIVE" },
    });
    await db.syncRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        recordsRead: reviews.length,
        recordsCreated: created,
        recordsUpdated: updated,
      },
    });

    return { recordsRead: reviews.length, created, updated };
  } catch (error) {
    await db.syncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: error instanceof Error ? error.message : "SYNC_FAILED",
      },
    });
    await db.source.update({
      where: { id: sourceId },
      data: { status: "ERROR" },
    });
    throw error;
  }
}

export async function syncGoogleConnection(connectionId: string) {
  const discovered = await discoverGoogleSources(connectionId);

  for (const source of discovered) {
    await db.source.upsert({
      where: {
        connectionId_externalId: {
          connectionId,
          externalId: source.externalId,
        },
      },
      create: {
        connectionId,
        externalId: source.externalId,
        name: source.name,
        metadata: source.metadata as object,
      },
      update: {
        name: source.name,
        metadata: source.metadata as object,
        status: "ACTIVE",
      },
    });
  }

  const sources = await db.source.findMany({
    where: { connectionId, status: "ACTIVE" },
    select: { id: true },
  });

  const results = [];
  for (const source of sources) results.push(await syncGoogleSource(source.id));
  return { sources: sources.length, results };
}
