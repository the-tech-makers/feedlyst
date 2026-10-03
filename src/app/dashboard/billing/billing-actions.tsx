"use client";

import { useState } from "react";

export function BillingActions({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to start checkout");
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
      else throw new Error("Payment checkout URL was not returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return <div className="mt-6">
    <button
      type="button"
      disabled={loading}
      onClick={subscribe}
      className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Opening checkout…" : "Choose plan"}
    </button>
    {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
  </div>;
}
