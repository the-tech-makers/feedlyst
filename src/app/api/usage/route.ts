import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getUsageStatus } from "@/lib/usage/service";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const membership = await db.membership.findFirst({ where: { userId: user.id }, select: { accountId: true } });
    if (!membership) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
    return NextResponse.json(await getUsageStatus(membership.accountId));
  } catch {
    return NextResponse.json({ error: "Unable to load usage" }, { status: 500 });
  }
}
