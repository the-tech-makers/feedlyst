import "server-only";
import {
  buildOAuthAuthorizationUrl,
  exchangeOAuthCode,
  refreshOAuthToken,
  type OAuthClientConfig,
  type OAuthTokenResponse,
} from "@/lib/integrations/oauth";

export const GOOGLE_INTEGRATION_KEY = "google-business-profile";

export const GOOGLE_BUSINESS_PROFILE_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
] as const;

function getGoogleConfig(): OAuthClientConfig {
  return {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "",
    scopes: GOOGLE_BUSINESS_PROFILE_SCOPES,
  };
}

export function buildGoogleAuthorizationUrl(state: string) {
  const config = getGoogleConfig();
  const url = buildOAuthAuthorizationUrl(config, state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url;
}

export function exchangeGoogleCode(code: string) {
  return exchangeOAuthCode(getGoogleConfig(), code);
}

export function refreshGoogleToken(refreshToken: string) {
  return refreshOAuthToken(getGoogleConfig(), refreshToken);
}

export function getGoogleTokenExpiry(expiresIn?: number) {
  return expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
}

export function normalizeGoogleCredentials(tokens: OAuthTokenResponse) {
  if (!tokens.access_token) throw new Error("GOOGLE_ACCESS_TOKEN_MISSING");
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenType: tokens.token_type,
    scope: tokens.scope,
    idToken: tokens.id_token,
  };
}
