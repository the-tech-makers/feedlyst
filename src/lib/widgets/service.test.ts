import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const db = {
  project: { findFirst: vi.fn() },
  source: { findMany: vi.fn() },
  widget: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  widgetVersion: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  widgetSource: { deleteMany: vi.fn(), createMany: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("@/lib/db", () => ({ db }));

const { createReviewWidget, updateReviewWidgetDraft, publishReviewWidget } =
  await import("./service");

describe("review widget service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a widget only from sources owned by the project account", async () => {
    db.project.findFirst.mockResolvedValue({ id: "project-1", accountId: "account-1" });
    db.source.findMany.mockResolvedValue([{ id: "source-1" }]);
    db.widget.create.mockResolvedValue({ id: "widget-1" });

    await createReviewWidget({
      projectId: "project-1",
      userId: "user-1",
      name: "Reviews",
      sourceIds: ["source-1"],
    });

    expect(db.source.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["source-1"] },
        connection: { accountId: "account-1" },
        status: "ACTIVE",
      },
      select: { id: true },
    });
    expect(db.widget.create).toHaveBeenCalled();
  });

  it("rejects a source outside the account boundary", async () => {
    db.project.findFirst.mockResolvedValue({ id: "project-1", accountId: "account-1" });
    db.source.findMany.mockResolvedValue([]);

    await expect(
      createReviewWidget({
        projectId: "project-1",
        userId: "user-1",
        name: "Reviews",
        sourceIds: ["other-account-source"],
      }),
    ).rejects.toThrow("SOURCE_NOT_FOUND");

    expect(db.widget.create).not.toHaveBeenCalled();
  });

  it("updates the draft and replaces selected sources atomically", async () => {
    db.widget.findFirst.mockResolvedValue({ id: "widget-1", accountId: "account-1" });
    db.source.findMany.mockResolvedValue([{ id: "source-1" }, { id: "source-2" }]);
    db.widgetVersion.findFirst.mockResolvedValue({
      id: "draft-1",
      configuration: { layout: "grid", theme: "light" },
      versionNumber: 1,
    });

    const tx = {
      widgetSource: { deleteMany: vi.fn(), createMany: vi.fn() },
      widget: { update: vi.fn() },
      widgetVersion: { update: vi.fn().mockResolvedValue({ id: "draft-1" }) },
    };
    db.$transaction.mockImplementation(async (callback: any) => callback(tx));

    await updateReviewWidgetDraft({
      widgetId: "widget-1",
      userId: "user-1",
      name: "Updated reviews",
      sourceIds: ["source-1", "source-2"],
      configuration: {
        layout: "list",
        theme: "dark",
        showRating: true,
        showAuthor: true,
        showDate: true,
        showAvatar: false,
        maxReviews: 4,
        minRating: 4,
      },
    });

    expect(tx.widgetSource.deleteMany).toHaveBeenCalledWith({ where: { widgetId: "widget-1" } });
    expect(tx.widgetSource.createMany).toHaveBeenCalledWith({
      data: [
        { widgetId: "widget-1", sourceId: "source-1", sortOrder: 0 },
        { widgetId: "widget-1", sourceId: "source-2", sortOrder: 1 },
      ],
    });
    expect(tx.widget.update).toHaveBeenCalledWith({
      where: { id: "widget-1" },
      data: { name: "Updated reviews" },
    });
    expect(tx.widgetVersion.update).toHaveBeenCalled();
  });

  it("publishes the draft and creates the next draft version", async () => {
    db.widget.findFirst.mockResolvedValue({ id: "widget-1" });
    db.widgetVersion.findUnique.mockResolvedValue({
      id: "draft-2",
      versionNumber: 2,
      schemaVersion: 1,
      configuration: { layout: "grid" },
    });

    const tx = {
      widgetVersion: {
        deleteMany: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: "draft-2", state: "PUBLISHED" }),
        create: vi.fn(),
      },
      widget: { update: vi.fn() },
    };
    db.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const published = await publishReviewWidget("widget-1", "user-1");

    expect(published).toEqual({ id: "draft-2", state: "PUBLISHED" });
    expect(tx.widgetVersion.deleteMany).toHaveBeenCalledWith({
      where: { widgetId: "widget-1", state: "PUBLISHED" },
    });
    expect(tx.widgetVersion.create).toHaveBeenCalledWith({
      data: {
        widgetId: "widget-1",
        state: "DRAFT",
        versionNumber: 3,
        schemaVersion: 1,
        configuration: { layout: "grid" },
        createdBy: "user-1",
      },
    });
    expect(tx.widget.update).toHaveBeenCalledWith({
      where: { id: "widget-1" },
      data: { status: "ACTIVE" },
    });
  });
});
