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
  const record = await db.oAuthState.findUnique({
    where: { stateHash: hashState(state) },
  });

  if (!record || record.status !== "ACTIVE" || record.expiresAt <= new Date()) {
    throw new Error("INVALID_OAUTH_STATE");
  }

  await db.oAuthState.update({
    where: { id: record.id },
    data: { status: "CONSUMED", consumedAt: new Date() },
  });

  return { accountId: record.accountId, integrationId: record.integrationId };
}
