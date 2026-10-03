import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getCurrentMonthUsage } from "@/lib/usage/service";

export async function GET() {
  try {
    const user = await requireUser();
    const membership = await getCurrentMonthUsageForUser(user.id);
    return NextResponse.json(membership);
  } catch {
    return NextResponse.json({ error: "Unable to load usage" }, { status: 500 });
  }
}

async function getCurrentMonthUsageForUser(userId: string) {
  const { db } = await import("@/lib/db");
  const membership = await db.membership.findFirst({ where: { userId }, select: { accountId: true } });
  if (!membership) throw new Error("ACCOUNT_NOT_FOUND");
  return getCurrentMonthUsage(membership.accountId);
}
