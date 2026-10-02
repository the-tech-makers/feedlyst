import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeOAuthState } from "@/lib/integrations/oauth-state";
import {
  exchangeGoogleCode,
  getGoogleTokenExpiry,
  normalizeGoogleCredentials,
  GOOGLE_INTEGRATION_KEY,
} from "@/lib/integrations/google";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";

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

    let previousRefreshToken: string | undefined;
    if (existing?.credentialsEncrypted) {
      const previous = JSON.parse(decryptSecret(existing.credentialsEncrypted)) as { refreshToken?: string };
      previousRefreshToken = previous.refreshToken;
    }

    const storedCredentials = {
      ...credentials,
      refreshToken: credentials.refreshToken ?? previousRefreshToken,
    };
    const scopes = tokens.scope ? tokens.scope.split(" ").filter(Boolean) : [];

    if (existing) {
      await db.connection.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          credentialsEncrypted: encryptSecret(JSON.stringify(storedCredentials)),
          scopes,
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
          scopes,
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
