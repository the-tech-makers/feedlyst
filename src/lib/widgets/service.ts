import "server-only";

/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma transaction callback typing is supplied by the generated client. */
import { db } from "@/lib/db";
import {
  DEFAULT_REVIEW_WIDGET_CONFIGURATION,
  REVIEW_WIDGET_SCHEMA_VERSION,
  validateReviewWidgetConfiguration,
} from "@/lib/widgets/config";

async function requireProjectAccess(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      status: "ACTIVE",
      account: { memberships: { some: { userId } } },
    },
    select: { id: true, accountId: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return project;
}

export async function createReviewWidget(input: {
  projectId: string;
  userId: string;
  name: string;
  sourceIds?: readonly string[];
  configuration?: unknown;
}) {
  const project = await requireProjectAccess(input.projectId, input.userId);
  const configuration = validateReviewWidgetConfiguration(
    input.configuration ?? DEFAULT_REVIEW_WIDGET_CONFIGURATION,
  );

  const sources = input.sourceIds?.length
    ? await db.source.findMany({
        where: {
          id: { in: [...input.sourceIds] },
          connection: { accountId: project.accountId },
          status: "ACTIVE",
        },
        select: { id: true },
      })
    : [];

  if (input.sourceIds?.length && sources.length !== input.sourceIds.length) {
    throw new Error("SOURCE_NOT_FOUND");
  }

  return db.widget.create({
    data: {
      accountId: project.accountId,
      projectId: project.id,
      type: "review",
      name: input.name.trim(),
      sources: {
        create: sources.map((source, index) => ({ sourceId: source.id, sortOrder: index })),
      },
      versions: {
        create: {
          state: "DRAFT",
          versionNumber: 1,
          schemaVersion: REVIEW_WIDGET_SCHEMA_VERSION,
          configuration,
          createdBy: input.userId,
        },
      },
    },
    include: {
      sources: { select: { sourceId: true, sortOrder: true } },
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });
}

export async function updateReviewWidgetDraft(input: {
  widgetId: string;
  userId: string;
  name?: string;
  sourceIds?: readonly string[];
  configuration?: unknown;
}) {
  const widget = await db.widget.findFirst({
    where: {
      id: input.widgetId,
      type: "review",
      project: { account: { memberships: { some: { userId: input.userId } } } },
    },
    select: { id: true, accountId: true },
  });
  if (!widget) throw new Error("WIDGET_NOT_FOUND");

  const sources = input.sourceIds
    ? await db.source.findMany({
        where: {
          id: { in: [...input.sourceIds] },
          connection: { accountId: widget.accountId },
          status: "ACTIVE",
        },
        select: { id: true },
      })
    : null;
  if (sources && sources.length !== input.sourceIds!.length) throw new Error("SOURCE_NOT_FOUND");

  const draft = await db.widgetVersion.findFirst({
    where: { widgetId: widget.id, state: "DRAFT" },
    orderBy: { versionNumber: "desc" },
  });
  if (!draft) throw new Error("WIDGET_DRAFT_NOT_FOUND");

  const configuration = input.configuration === undefined
    ? draft.configuration
    : validateReviewWidgetConfiguration(input.configuration);

  return db.$transaction(async (tx) => {
    if (sources) {
      await tx.widgetSource.deleteMany({ where: { widgetId: widget.id } });
      if (sources.length) {
        await tx.widgetSource.createMany({
          data: sources.map((source, index) => ({
            widgetId: widget.id,
            sourceId: source.id,
            sortOrder: index,
          })),
        });
      }
    }

    if (input.name !== undefined) {
      await tx.widget.update({
        where: { id: widget.id },
        data: { name: input.name.trim() },
      });
    }

    return tx.widgetVersion.update({
      where: { id: draft.id },
      data: { configuration: configuration as unknown as typeof draft.configuration },
      include: { widget: true },
    });
  });
}

export async function publishReviewWidget(widgetId: string, userId: string) {
  const widget = await db.widget.findFirst({
    where: {
      id: widgetId,
      type: "review",
      project: { account: { memberships: { some: { userId } } } },
    },
    select: { id: true },
  });
  if (!widget) throw new Error("WIDGET_NOT_FOUND");

  const draft = await db.widgetVersion.findUnique({
    where: { widgetId_state: { widgetId, state: "DRAFT" } },
  });
  if (!draft) throw new Error("WIDGET_DRAFT_NOT_FOUND");

  return db.$transaction(async (tx) => {
    await tx.widgetVersion.deleteMany({
      where: { widgetId, state: "PUBLISHED" },
    });

    const published = await tx.widgetVersion.update({
      where: { id: draft.id },
      data: { state: "PUBLISHED" },
    });

    const nextVersionNumber = draft.versionNumber + 1;
    await tx.widgetVersion.create({
      data: {
        widgetId,
        state: "DRAFT",
        versionNumber: nextVersionNumber,
        schemaVersion: draft.schemaVersion,
        configuration: draft.configuration as unknown as typeof draft.configuration,
        createdBy: userId,
      },
    });

    await tx.widget.update({
      where: { id: widgetId },
      data: { status: "ACTIVE" },
    });

    return published;
  });
}
