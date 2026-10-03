import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function authenticateCredentials(emailInput: unknown, passwordInput: unknown) {
  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (!email || !password) return null;

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || user.status !== "ACTIVE") return null;
  if (!(await bcrypt.compare(password, user.passwordHash))) return null;

  return { id: user.id, email: user.email, name: user.name, image: user.imageUrl };
}
