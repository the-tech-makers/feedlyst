import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    membership: { findUnique: vi.fn() },
  },
}));

const { requireUser } = await import("@/lib/auth");
const { db } = await import("@/lib/db");
const { GET, POST } = await import("./route");

describe("projects collection API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists only projects belonging to accounts the user is a member of", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.project.findMany).mockResolvedValue([{ id: "project-1" }] as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ projects: [{ id: "project-1" }] });
    expect(db.project.findMany).toHaveBeenCalledWith({
      where: { account: { memberships: { some: { userId: "user-1" } } } },
      orderBy: { createdAt: "asc" },
    });
  });

  it("rejects unauthenticated project listing", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("UNAUTHENTICATED"));

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("rejects project creation without membership", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ accountId: "account-2", name: "Other", slug: "other" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(db.project.create).not.toHaveBeenCalled();
  });

  it("creates a project for a member and normalizes name, slug and website URL", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.membership.findUnique).mockResolvedValue({ accountId: "account-1", userId: "user-1", role: "OWNER" } as never);
    vi.mocked(db.project.create).mockResolvedValue({ id: "project-1" } as never);

    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          accountId: "account-1",
          name: "  My Site  ",
          slug: "  MY-SITE  ",
          websiteUrl: "  https://example.com  ",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(db.project.create).toHaveBeenCalledWith({
      data: {
        accountId: "account-1",
        name: "My Site",
        slug: "my-site",
        websiteUrl: "https://example.com",
      },
    });
  });

  it("rejects invalid project creation input", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });

    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ accountId: "account-1", name: "Missing slug" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(db.membership.findUnique).not.toHaveBeenCalled();
  });
});
