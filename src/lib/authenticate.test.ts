import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn() } },
}));

const { db } = await import("@/lib/db");
const { authenticateCredentials } = await import("./authenticate");

describe("credential authentication", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes email and authenticates a valid active user", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      imageUrl: null,
      passwordHash: "$2b$12$2b2b2b2b2b2b2b2b2b2b2u5cJ9VJv0G8nH6mZ0x7qVQ4fQvVwJ4O",
      status: "ACTIVE",
    } as never);
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("password123", 4);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", imageUrl: null, passwordHash: hash, status: "ACTIVE",
    } as never);

    await expect(authenticateCredentials(" USER@example.com ", "password123")).resolves.toEqual({
      id: "user-1", email: "user@example.com", name: "User", image: null,
    });
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
  });

  it("rejects invalid passwords and inactive users", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("password123", 4);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", imageUrl: null, passwordHash: hash, status: "ACTIVE",
    } as never);
    await expect(authenticateCredentials("user@example.com", "wrong")).resolves.toBeNull();

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1", email: "user@example.com", name: "User", imageUrl: null, passwordHash: hash, status: "SUSPENDED",
    } as never);
    await expect(authenticateCredentials("user@example.com", "password123")).resolves.toBeNull();
  });

  it("rejects missing credentials", async () => {
    await expect(authenticateCredentials("", "")).resolves.toBeNull();
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
});
