import { describe, expect, it, vi, afterEach } from "vitest";
import {
  listGoogleAccounts,
  listGoogleLocations,
  listGoogleReviews,
  normalizeGoogleRating,
} from "@/lib/integrations/google-business-profile";

describe("Google Business Profile adapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps Google star ratings to normalized numeric ratings", () => {
    expect(normalizeGoogleRating("ONE")).toBe(1);
    expect(normalizeGoogleRating("THREE")).toBe(3);
    expect(normalizeGoogleRating("FIVE")).toBe(5);
    expect(normalizeGoogleRating("UNKNOWN")).toBe(0);
  });

  it("lists accounts using the provider API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accounts: [{ name: "accounts/123" }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await listGoogleAccounts({ accessToken: "access" });

    expect(result).toEqual([{ name: "accounts/123" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      expect.objectContaining({
        headers: { Authorization: "Bearer access" },
      }),
    );
  });

  it("does not place access tokens in provider request URLs", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ locations: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reviews: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const credentials = { accessToken: "super-secret-access-token" };
    await listGoogleLocations(credentials, "accounts/123");
    await listGoogleReviews(credentials, "accounts/123/locations/456");

    for (const call of fetchMock.mock.calls) {
      expect(call[0]).not.toContain("super-secret-access-token");
    }
  });
});
