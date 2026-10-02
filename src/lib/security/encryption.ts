import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const value = process.env.CONNECTION_ENCRYPTION_KEY;
  if (!value) throw new Error("CONNECTION_ENCRYPTION_KEY is not configured");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("CONNECTION_ENCRYPTION_KEY must be 32 bytes in base64");
  return key;
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(payload: string) {
  const [ivValue, tagValue, encryptedValue] = payload.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted secret");

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
