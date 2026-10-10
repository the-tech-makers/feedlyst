import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn() }, membership: { findUnique: vi.fn() } },
}));

const { auth } = await import("@/auth");
const { db } = await import("@/lib/db");
const { requireUser, requireAccountMembership } = await import("./auth");

const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

describe("server authorization helpers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects requests without a session", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("rejects suspended users even when a session exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", status: "SUSPENDED",
    } as never);
    await expect(requireUser()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("returns only active authenticated users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", status: "ACTIVE",
    } as never);
    await expect(requireUser()).resolves.toEqual({
      id: "user-1", email: "user@example.com", name: "User", status: "ACTIVE",
    });
  });

  it("rejects non-members before account-scoped access", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", status: "ACTIVE",
    } as never);
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(requireAccountMembership("account-2")).rejects.toThrow("FORBIDDEN");
  });
});
