"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { agentById } from "@/lib/agents/registry";
import { bySlug } from "@/lib/patterns";

interface AgentRef {
  id: string;
  name: string;
}

interface Turn {
  role: "student" | "coach";
  text: string;
  /** Who answered, who was consulted, and where the facts came from. */
  agent?: AgentRef;
  consulted?: AgentRef[];
  reason?: string;
  sources?: { label: string; url: string }[];
}

interface CoachReply {
  answer?: string;
  error?: string;
  agent?: AgentRef;
  consulted?: AgentRef[];
  reason?: string;
  sources?: { label: string; url: string }[];
}

export default function CoachChat({
  pattern,
  agent,
  initialQuestion = "",
}: {
  /** Id of the pattern page the student came from. */
  pattern?: string;
  /** Id of an agent the student chose to ask directly. */
  agent?: string;
  initialQuestion?: string;
}) {
  const { user, enabled, signIn } = useAuth();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState(initialQuestion);
  const focusName = pattern ? bySlug(pattern)?.name : undefined;
  const chosen = agent ? agentById(agent) : undefined;
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function ask(): Promise<void> {
    const question = input.trim();
    if (!question || busy || !user) return;
    setInput("");
    setTurns((t) => [...t, { role: "student", text: question }]);
    setBusy(true);
    try {
      // Sent on every request: tokens are short-lived, and the SDK refreshes
      // from cache, so this is cheap and avoids replaying a stale token.
      const token = await user.getIdToken();
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, pattern, agent }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = (await res.json()) as CoachReply;
      if (res.ok && data.answer) {
        setTurns((t) => [
          ...t,
          {
            role: "coach",
            text: data.answer ?? "",
            agent: data.agent,
            consulted: data.consulted,
            reason: data.reason,
            sources: data.sources,
          },
        ]);
      } else {
        setTurns((t) => [...t, { role: "coach", text: data.error ?? "Something went wrong." }]);
      }
    } catch {
      setTurns((t) => [...t, { role: "coach", text: "Network problem, try again." }]);
    } finally {
      setBusy(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {(focusName || chosen) && (
        <p className="bc-meta tracking-[0.16em]">
          {chosen && !focusName ? "Asking " : "Focused on "}
          <span className="border-b border-cottage text-ink">{focusName ?? chosen?.name}</span>
        </p>
      )}
      <div className="flex flex-col gap-3.5" aria-live="polite">
        {turns.length === 0 && (
          <p className="bc-ghost text-[15px] leading-[1.7] text-muted-deep">
            Ask about the patterns, “How many movements does Yul-Gok have?”,
            “Compare Dan-Gun and Do-San”, or “What do I learn at green belt?”.
            The right agent answers, and every answer shows its sources.
          </p>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            className={
              t.role === "student"
                ? "max-w-[82%] self-end rounded-[16px_16px_4px_16px] bg-ink px-4 py-3.5 text-[15px] leading-[1.65] text-paper"
                : "max-w-[88%] self-start whitespace-pre-wrap rounded-[16px_16px_16px_4px] border border-muted/55 bg-paper-lift px-4 py-3.5 text-[15px] leading-[1.7] shadow-[0_6px_18px_rgba(18,38,58,0.1)]"
            }
          >
            {t.role === "coach" && t.agent && (
              <p className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="bc-tag bc-tag-ink">{t.agent.name}</span>
                {t.consulted?.map((a) => (
                  <span key={a.id} className="bc-tag bc-tag-outline">
                    + {a.name}
                  </span>
                ))}
              </p>
            )}
            {t.text}
            {t.role === "coach" && t.sources && t.sources.length > 0 && (
              <p className="mt-3 border-t border-muted/30 pt-2.5 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-muted-deep">
                Sources:{" "}
                {t.sources.map((src, n) => (
                  <span key={src.url}>
                    {n > 0 && " · "}
                    <a
                      href={src.url}
                      {...(src.url.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="bc-link text-ink"
                    >
                      {src.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        ))}
        {busy && <p className="bc-meta tracking-[0.16em]">The agents are thinking…</p>}
        <div ref={bottomRef} />
      </div>
      {!enabled ? (
        <p className="bc-panel text-[15px] leading-[1.7] text-muted-deep">
          The coach is unavailable because sign-in is not configured.
        </p>
      ) : !user ? (
        <div className="bc-panel text-[15px] leading-[1.7] text-muted-deep">
          <p>Sign in to ask the coach. The rest of the trainer works without an account.</p>
          <button
            type="button"
            onClick={() => void signIn()}
            className="bc-btn bc-btn-ink mt-3.5"
          >
            Sign in
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask();
          }}
          className="sticky bottom-0 flex gap-2.5 bg-paper py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agents…"
            aria-label="Question for the agents"
            maxLength={1000}
            className="bc-input min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="bc-btn bc-btn-cottage"
          >
            Ask
          </button>
        </form>
      )}
    </div>
  );
}
