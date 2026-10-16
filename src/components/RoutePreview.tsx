"use client";

import { useState } from "react";
import Link from "next/link";
import { route } from "@/lib/agents/router";

/**
 * Shows which agents a question would reach, before anything is sent.
 * Routing is local and free, so this runs on every keystroke with no sign-in.
 */
export default function RoutePreview() {
  const [q, setQ] = useState("Compare Dan-Gun and Do-San");
  const r = q.trim() ? route(q) : null;

  return (
    <div className="bc-panel flex flex-col gap-3.5">
      <label htmlFor="route-q" className="bc-label">
        Try a question
      </label>
      <input
        id="route-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={200}
        placeholder="e.g. Which belt learns Toi-Gye?"
        className="bc-input"
      />
      <div aria-live="polite" className="flex flex-col gap-2.5">
        {r ? (
          <>
            <p className="flex flex-wrap items-center gap-2">
              <span className="bc-tag bc-tag-ink">Leads: {r.lead.name}</span>
              {r.consulted.map((a) => (
                <span key={a.id} className="bc-tag bc-tag-outline">
                  Consulted: {a.name}
                </span>
              ))}
            </p>
            <p className="text-[14px] leading-[1.65] text-muted-deep">{r.reason}</p>
            <Link
              href={`/coach?q=${encodeURIComponent(q)}`}
              className="bc-btn bc-btn-cottage self-start"
            >
              Ask the coach
            </Link>
          </>
        ) : (
          <p className="text-[14px] text-muted-deep">Type a question to see who would answer.</p>
        )}
      </div>
    </div>
  );
}
