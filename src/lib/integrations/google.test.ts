import { describe, expect, it, vi, afterEach } from "vitest";
import {
  buildGoogleAuthorizationUrl,
  getGoogleTokenExpiry,
  normalizeGoogleCredentials,
} from "@/lib/integrations/google";

describe("Google OAuth adapter", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("builds a state-bound authorization URL without exposing a secret", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "super-secret");
    vi.stubEnv("GOOGLE_OAUTH_REDIRECT_URI", "https://feedlyst.example/api/integrations/google/callback");

    const url = buildGoogleAuthorizationUrl("state-value");

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("scope")).toContain("business.manage");
    expect(url.toString()).not.toContain("super-secret");
  });

  it("normalizes token credentials without logging or returning client secrets", () => {
    const credentials = normalizeGoogleCredentials({
      access_token: "access",
      refresh_token: "refresh",
      token_type: "Bearer",
      scope: "scope",
      id_token: "id-token",
      expires_in: 3600,
    });

    expect(credentials).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      tokenType: "Bearer",
      scope: "scope",
      idToken: "id-token",
    });
    expect(credentials).not.toHaveProperty("clientSecret");
  });

  it("calculates token expiry from expires_in", () => {
    const before = Date.now();
    const expiry = getGoogleTokenExpiry(3600);
    const after = Date.now();

    expect(expiry).toBeInstanceOf(Date);
    expect(expiry!.getTime()).toBeGreaterThanOrEqual(before + 3600 * 1000);
    expect(expiry!.getTime()).toBeLessThanOrEqual(after + 3600 * 1000);
  });
});
