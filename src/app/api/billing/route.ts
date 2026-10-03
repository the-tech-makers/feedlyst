import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentSubscription, listActivePlans } from "@/lib/billing/service";

async function accountForUser(userId: string) {
  return db.membership.findFirst({ where: { userId }, select: { accountId: true } });
}

export async function GET() {
  try {
    const user = await requireUser();
    const membership = await accountForUser(user.id);
    if (!membership) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
    const [plans, subscription] = await Promise.all([
      listActivePlans(),
      getCurrentSubscription(membership.accountId),
    ]);
    return NextResponse.json({ plans, subscription });
  } catch {
    return NextResponse.json({ error: "Unable to load billing" }, { status: 500 });
  }
}
