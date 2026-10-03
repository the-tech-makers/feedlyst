import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { project: { findFirst: vi.fn(), update: vi.fn() } },
}));

const { requireUser } = await import("@/lib/auth");
const { db } = await import("@/lib/db");
const { GET, PATCH } = await import("./route");

describe("project detail API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for an unauthenticated project lookup", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("UNAUTHENTICATED"));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("hides projects belonging to another tenant", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.project.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "other-project" }),
    });

    expect(response.status).toBe(404);
    expect(db.project.findFirst).toHaveBeenCalledWith({
      where: { id: "other-project", account: { memberships: { some: { userId: "user-1" } } } },
    });
  });

  it("updates an authorized project and supports archiving", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.project.findFirst).mockResolvedValue({ id: "project-1", accountId: "account-1" } as never);
    vi.mocked(db.project.update).mockResolvedValue({ id: "project-1", status: "ARCHIVED" } as never);

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "  Archived Site ", slug: " ARCHIVED-SITE ", status: "ARCHIVED" }),
      }),
      { params: Promise.resolve({ projectId: "project-1" }) },
    );

    expect(response.status).toBe(200);
    expect(db.project.update).toHaveBeenCalledWith({
      where: { id: "project-1" },
      data: { name: "Archived Site", slug: "archived-site", status: "ARCHIVED" },
    });
  });

  it("does not update a project outside the user's tenant", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "u@example.com", name: "User", status: "ACTIVE" });
    vi.mocked(db.project.findFirst).mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "Hijack" }),
      }),
      { params: Promise.resolve({ projectId: "other-project" }) },
    );

    expect(response.status).toBe(404);
    expect(db.project.update).not.toHaveBeenCalled();
  });
});
