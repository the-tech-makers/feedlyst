import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
