import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeOAuthState } from "@/lib/integrations/oauth-state";
import {
  exchangeGoogleCode,
  getGoogleTokenExpiry,
  normalizeGoogleCredentials,
  GOOGLE_INTEGRATION_KEY,
} from "@/lib/integrations/google";
import { encryptSecret } from "@/lib/security/encryption";

function redirectToDashboard(request: Request, status: string) {
  const url = new URL("/dashboard", request.url);
  url.searchParams.set("google", status);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (!state || error) return redirectToDashboard(request, "cancelled");
  if (!code) return redirectToDashboard(request, "failed");

  try {
    const { accountId, integrationId } = await consumeOAuthState(state);
    const integration = await db.integration.findFirst({
      where: { id: integrationId, key: GOOGLE_INTEGRATION_KEY, status: "ACTIVE" },
      select: { id: true },
    });
    if (!integration) throw new Error("GOOGLE_INTEGRATION_NOT_FOUND");

    const tokens = await exchangeGoogleCode(code);
    const credentials = normalizeGoogleCredentials(tokens);
    const existing = await db.connection.findFirst({
      where: { accountId, integrationId: integration.id },
      select: { id: true, credentialsEncrypted: true },
    });

    const refreshToken = credentials.refreshToken ?? (
      existing?.credentialsEncrypted
        ? (JSON.parse((await import("@/lib/security/encryption")).decryptSecret(existing.credentialsEncrypted)) as { refreshToken?: string }).refreshToken
        : undefined
    );

    const storedCredentials = { ...credentials, refreshToken };

    if (existing) {
      await db.connection.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          credentialsEncrypted: encryptSecret(JSON.stringify(storedCredentials)),
          scopes: [...GOOGLE_INTEGRATION_KEY ? (tokens.scope ? tokens.scope.split(" ") : []) : []],
          expiresAt: getGoogleTokenExpiry(tokens.expires_in),
          lastValidatedAt: new Date(),
        },
      });
    } else {
      await db.connection.create({
        data: {
          accountId,
          integrationId: integration.id,
          status: "ACTIVE",
          credentialsEncrypted: encryptSecret(JSON.stringify(storedCredentials)),
          scopes: tokens.scope ? tokens.scope.split(" ") : [],
          expiresAt: getGoogleTokenExpiry(tokens.expires_in),
          lastValidatedAt: new Date(),
        },
      });
    }

    return redirectToDashboard(request, "connected");
  } catch {
    return redirectToDashboard(request, "failed");
  }
}
