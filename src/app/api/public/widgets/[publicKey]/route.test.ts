import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const db = {
  publication: { findUnique: vi.fn() },
  review: { findMany: vi.fn() },
};
vi.mock("@/lib/db", () => ({ db }));

const { GET } = await import("./route");

describe("public widget runtime", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns published widget data without dashboard auth", async () => {
    db.publication.findUnique.mockResolvedValue({
      id: "publication-1", status: "PUBLISHED", allowedDomains: [],
      widget: { id: "widget-1", type: "REVIEW", name: "Reviews", sources: [{ sourceId: "source-1", sortOrder: 0 }] },
      activeVersion: { configuration: { layout: "grid" }, schemaVersion: 1, versionNumber: 2 },
    });
    db.review.findMany.mockResolvedValue([]);

    const response = await GET(new Request("https://feedlyst.example/api/public/widgets/key"), {
      params: Promise.resolve({ publicKey: "key" }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).widget.id).toBe("widget-1");
  });

  it("rejects disallowed origins", async () => {
    db.publication.findUnique.mockResolvedValue({
      id: "publication-1", status: "PUBLISHED", allowedDomains: ["example.com"],
      widget: { id: "widget-1", type: "REVIEW", name: "Reviews", sources: [] },
      activeVersion: { configuration: {}, schemaVersion: 1, versionNumber: 1 },
    });

    const response = await GET(new Request("https://feedlyst.example/api/public/widgets/key", {
      headers: { origin: "https://evil.com" },
    }), { params: Promise.resolve({ publicKey: "key" }) });

    expect(response.status).toBe(403);
  });
});
