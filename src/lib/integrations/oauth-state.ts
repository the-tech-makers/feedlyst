import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

const STATE_TTL_MS = 10 * 60 * 1000;

function hashState(state: string) {
  return createHash("sha256").update(state).digest("hex");
}

export async function createOAuthState(accountId: string, integrationId: string) {
  const state = randomBytes(32).toString("base64url");
  await db.oAuthState.create({
    data: {
      accountId,
      integrationId,
      stateHash: hashState(state),
      expiresAt: new Date(Date.now() + STATE_TTL_MS),
    },
  });
  return state;
}

export async function consumeOAuthState(state: string) {
  const now = new Date();
  const record = await db.oAuthState.findUnique({
    where: { stateHash: hashState(state) },
    select: { id: true, accountId: true, integrationId: true, expiresAt: true, status: true },
  });

  if (!record || record.status !== "ACTIVE" || record.expiresAt <= now) {
    throw new Error("INVALID_OAUTH_STATE");
  }

  const consumed = await db.oAuthState.updateMany({
    where: {
      id: record.id,
      status: "ACTIVE",
      expiresAt: { gt: now },
    },
    data: {
      status: "CONSUMED",
      consumedAt: now,
    },
  });

  if (consumed.count !== 1) throw new Error("INVALID_OAUTH_STATE");

  return { accountId: record.accountId, integrationId: record.integrationId };
}
