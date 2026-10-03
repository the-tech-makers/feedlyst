import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const input = body as { email?: unknown; password?: unknown; name?: unknown; accountName?: unknown };
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const name = typeof input.name === "string" ? input.name.trim() : null;
  const accountName = typeof input.accountName === "string" ? input.accountName.trim() : "";

  if (!email || !email.includes("@")) return jsonError("Valid email is required", 400);
  if (password.length < 8) return jsonError("Password must be at least 8 characters", 400);
  if (!accountName) return jsonError("Account name is required", 400);

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return jsonError("An account already exists for this email", 409);

  const slugBase = accountName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "workspace";
  let slug = slugBase;
  for (let suffix = 2; await db.account.findUnique({ where: { slug } }); suffix++) {
    slug = `${slugBase}-${suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let account;
  try {
    account = await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, name, passwordHash } });
    const createdAccount = await tx.account.create({ data: { name: accountName, slug } });
    await tx.membership.create({ data: { accountId: createdAccount.id, userId: user.id, role: "OWNER" } });
    await tx.project.create({ data: { accountId: createdAccount.id, name: accountName, slug: "default" } });
      return createdAccount;
    });
  } catch (error) {
    console.error("Registration failed", error);
    return jsonError("Registration is temporarily unavailable. Please try again later.", 503);
  }

  return NextResponse.json({ accountId: account.id }, { status: 201 });
}
