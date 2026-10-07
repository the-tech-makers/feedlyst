import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    account: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

const { db } = await import("@/lib/db");
const { POST } = await import("./route");

describe("registration API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates required registration fields", async () => {
    const response = await POST(new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "short" }),
    }));
    expect(response.status).toBe(400);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects duplicate email addresses", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "existing" } as never);
    const response = await POST(new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ email: "USER@example.com", password: "password123", accountName: "Workspace" }),
    }));
    expect(response.status).toBe(409);
  });

  it("creates a user with a salted password hash and owner membership", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.account.findUnique).mockResolvedValue(null);
    const tx = {
      user: { create: vi.fn().mockResolvedValue({ id: "user-1" }) },
      account: { create: vi.fn().mockResolvedValue({ id: "account-1" }) },
      membership: { create: vi.fn() },
      project: { create: vi.fn() },
    };
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) => callback(tx));

    const response = await POST(new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: " USER@example.com ",
        password: "password123",
        name: " User ",
        accountName: "My Workspace",
      }),
    }));

    expect(response.status).toBe(201);
    const userData = tx.user.create.mock.calls[0][0].data;
    expect(userData.email).toBe("user@example.com");
    expect(userData.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(userData.passwordHash).not.toBe("password123");
    expect(tx.membership.create).toHaveBeenCalledWith({
      data: { accountId: "account-1", userId: "user-1", role: "OWNER" },
    });
    expect(tx.project.create).toHaveBeenCalled();
  });
});
