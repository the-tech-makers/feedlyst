"use client";

import { useState } from "react";

export function SubscriptionActions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function cancel() {
    if (!window.confirm("Cancel auto-renewal at the end of the current billing period?")) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atCycleEnd: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to cancel subscription");
      setMessage("Auto-renewal has been cancelled. Your plan remains active through the current billing period.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to cancel subscription");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mt-4">
    <button type="button" disabled={loading} onClick={cancel} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">
      {loading ? "Cancelling…" : "Cancel auto-renewal"}
    </button>
    {message && <p className="mt-2 text-xs text-slate-500" role="status">{message}</p>}
  </div>;
}
