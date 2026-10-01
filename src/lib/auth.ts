import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("UNAUTHENTICATED");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAccountMembership(accountId: string) {
  const user = await requireUser();
  const membership = await db.membership.findUnique({
    where: { accountId_userId: { accountId, userId: user.id } },
    select: { accountId: true, userId: true, role: true },
  });
  if (!membership) throw new Error("FORBIDDEN");
  return membership;
}
