import "server-only";

export type OAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

export type OAuthClientConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: readonly string[];
  redirectUri: string;
};

function requireValue(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function buildOAuthAuthorizationUrl(config: OAuthClientConfig, state: string) {
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", requireValue("OAuth client ID", config.clientId));
  url.searchParams.set("redirect_uri", requireValue("OAuth redirect URI", config.redirectUri));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeOAuthCode(config: OAuthClientConfig, code: string) {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireValue("OAuth client ID", config.clientId),
      client_secret: requireValue("OAuth client secret", config.clientSecret),
      code,
      redirect_uri: requireValue("OAuth redirect URI", config.redirectUri),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OAUTH_TOKEN_EXCHANGE_FAILED:${response.status}`);
  }

  return (await response.json()) as OAuthTokenResponse;
}

export async function refreshOAuthToken(config: OAuthClientConfig, refreshToken: string) {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireValue("OAuth client ID", config.clientId),
      client_secret: requireValue("OAuth client secret", config.clientSecret),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OAUTH_TOKEN_REFRESH_FAILED:${response.status}`);
  }

  return (await response.json()) as OAuthTokenResponse;
}
