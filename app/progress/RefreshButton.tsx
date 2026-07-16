"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState("");
  const refreshStarted = useRef(false);

  useEffect(() => {
    if (refreshStarted.current && !isRefreshing) {
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      refreshStarted.current = false;
    }
  }, [isRefreshing]);

  function refresh() {
    refreshStarted.current = true;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        className="button secondary disabled:cursor-wait disabled:opacity-60"
        disabled={isRefreshing}
        onClick={refresh}
        type="button"
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
      <span aria-live="polite" className="text-sm text-slate-500">
        {lastUpdated ? `Updated at ${lastUpdated}` : ""}
      </span>
    </div>
  );
}
