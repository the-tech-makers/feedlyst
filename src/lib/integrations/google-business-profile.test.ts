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
      new Response(JSON.stringify({ accounts: [{ name: "accounts/123" }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await listGoogleAccounts({ accessToken: "access" });
    expect(result).toEqual([{ name: "accounts/123" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      expect.objectContaining({ headers: { Authorization: "Bearer access" } }),
    );
  });

  it("uses the complete account/location resource for reviews and fetches all pages", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        reviews: [{ name: "accounts/123/locations/456/reviews/1" }],
        nextPageToken: "next-page",
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        reviews: [{ name: "accounts/123/locations/456/reviews/2" }],
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await listGoogleReviews(
      { accessToken: "super-secret-access-token" },
      "locations/456",
      "accounts/123",
    );
    expect(result).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews?pageSize=50",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews?pageSize=50&pageToken=next-page",
    );
    for (const call of fetchMock.mock.calls) expect(call[0]).not.toContain("super-secret-access-token");
  });

  it("does not double-prefix a complete location resource name", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ reviews: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await listGoogleReviews({ accessToken: "access" }, "accounts/123/locations/456", "accounts/123");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews?pageSize=50",
    );
  });

  it("does not place access tokens in provider request URLs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ locations: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await listGoogleLocations({ accessToken: "super-secret-access-token" }, "accounts/123");
    for (const call of fetchMock.mock.calls) expect(call[0]).not.toContain("super-secret-access-token");
  });
});
