"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourceSyncButton({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sync() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/integrations/google/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; sources?: number; reviews?: number };
      if (!response.ok) {
        setMessage(body.error ?? "Sync failed. Please try again.");
        return;
      }
      setMessage(`Synced ${body.sources ?? 0} source(s).`);
      router.refresh();
    } catch {
      setMessage("Unable to sync right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex flex-col items-start gap-2 sm:items-end"><button type="button" onClick={sync} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">{busy ? "Syncing…" : "Sync reviews ↻"}</button>{message ? <p role="status" className="max-w-xs text-xs text-slate-500 sm:text-right">{message}</p> : null}</div>;
}
