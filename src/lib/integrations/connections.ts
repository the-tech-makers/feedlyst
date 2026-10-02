import "server-only";
import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import type { connection_status } from "@/generated/prisma/enums";

type ConnectionCredentials = Record<string, unknown>;

export async function createConnection(input: {
  accountId: string;
  integrationId: string;
  credentials: ConnectionCredentials;
  providerPrincipalId?: string;
  scopes?: readonly string[];
  expiresAt?: Date;
}) {
  return db.connection.create({
    data: {
      accountId: input.accountId,
      integrationId: input.integrationId,
      status: "ACTIVE",
      providerPrincipalId: input.providerPrincipalId,
      credentialsEncrypted: encryptSecret(JSON.stringify(input.credentials)),
      scopes: [...(input.scopes ?? [])],
      expiresAt: input.expiresAt,
    },
    select: {
      id: true, accountId: true, integrationId: true, status: true,
      providerPrincipalId: true, scopes: true, expiresAt: true,
      lastValidatedAt: true, createdAt: true, updatedAt: true,
    },
  });
}

export async function getConnectionCredentials(connectionId: string) {
  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    select: { credentialsEncrypted: true },
  });
  if (!connection?.credentialsEncrypted) throw new Error("CONNECTION_CREDENTIALS_MISSING");
  return JSON.parse(decryptSecret(connection.credentialsEncrypted)) as ConnectionCredentials;
}

export async function updateConnectionCredentials(
  connectionId: string,
  credentials: ConnectionCredentials,
  input?: { scopes?: readonly string[]; expiresAt?: Date; providerPrincipalId?: string },
) {
  return db.connection.update({
    where: { id: connectionId },
    data: {
      credentialsEncrypted: encryptSecret(JSON.stringify(credentials)),
      scopes: input?.scopes ? [...input.scopes] : undefined,
      expiresAt: input?.expiresAt,
      providerPrincipalId: input?.providerPrincipalId,
      status: "ACTIVE",
      lastValidatedAt: new Date(),
    },
    select: {
      id: true, accountId: true, integrationId: true, status: true,
      providerPrincipalId: true, scopes: true, expiresAt: true,
      lastValidatedAt: true, updatedAt: true,
    },
  });
}

export async function setConnectionStatus(connectionId: string, status: connection_status) {
  return db.connection.update({
    where: { id: connectionId },
    data: { status },
    select: { id: true, accountId: true, integrationId: true, status: true },
  });
}

export async function disconnectConnection(connectionId: string) {
  return db.connection.update({
    where: { id: connectionId },
    data: { status: "REVOKED", credentialsEncrypted: null },
    select: { id: true, accountId: true, integrationId: true, status: true },
  });
}
