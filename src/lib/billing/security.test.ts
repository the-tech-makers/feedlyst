import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyRazorpayWebhookSignature } from "./security";

describe("Razorpay webhook security", () => {
  it("accepts an HMAC generated from the exact raw body", () => {
    const body = JSON.stringify({ id: "evt_1", event: "payment.captured" });
    const secret = "test-webhook-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyRazorpayWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a modified body or signature", () => {
    const body = JSON.stringify({ id: "evt_1", event: "payment.captured" });
    const secret = "test-webhook-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyRazorpayWebhookSignature(body + " ", signature, secret)).toBe(false);
    expect(verifyRazorpayWebhookSignature(body, signature.slice(0, -1) + "0", secret)).toBe(false);
  });
});
