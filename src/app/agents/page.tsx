import type { Metadata } from "next";
import Link from "next/link";
import { BELTS } from "@/lib/belts";
import { BELT_AGENTS, MASTER, TUL_AGENTS, agentById } from "@/lib/agents/registry";
import RoutePreview from "@/components/RoutePreview";

export const metadata: Metadata = {
  title: "The agents",
  description:
    "One Master Instructor, six belt agents and 24 pattern agents, and how a question finds the right one.",
};

export default function AgentsPage() {
  return (
    <div>
      <header className="bc-cover px-6 py-8">
        <span className="bc-cover-glow -right-16 -top-20 h-56 w-56" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cottage">
            1 + {BELT_AGENTS.length} + {TUL_AGENTS.length} agents
          </p>
          <h1 className="bc-h1 bc-glow-text mt-3">The swarm</h1>
          <p className="mt-3.5 max-w-[380px] text-[15px] leading-relaxed text-on-ink">
            The Master Instructor leads belt agents, and each belt agent leads the pattern agents
            for that belt. A question goes to the agent that knows the most about it.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-7">
        <RoutePreview />

        <section aria-label="Master Instructor" className="bc-card border-cottage">
          <p className="bc-label mb-1.5">Master</p>
          <h2 className="font-display text-[22px] font-bold">{MASTER.name}</h2>
          <p className="mt-1.5 text-[15px] leading-[1.7] text-muted-deep">{MASTER.role}</p>
          <Link href="/coach" className="bc-btn bc-btn-ink mt-4 w-full">
            Ask the Master
          </Link>
        </section>

        {BELTS.map((belt) => {
          const agent = agentById(`belt-${belt.id}`);
          const kids = TUL_AGENTS.filter((t) => t.parent === `belt-${belt.id}`);
          if (!agent) return null;
          return (
            <section key={belt.id} aria-label={agent.name}>
              <div className="bc-rule">
                <h2 className="bc-label flex items-center gap-2 whitespace-nowrap">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-ink/40"
                    style={{ backgroundColor: belt.swatch }}
                    aria-hidden="true"
                  />
                  {agent.name}
                </h2>
              </div>
              <p className="mb-3 text-[14px] leading-[1.65] text-muted-deep">{agent.role}</p>
              {kids.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2.5">
                  {kids.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/patterns/${t.id.replace("tul-", "")}`}
                        className="bc-row !px-3.5 !py-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-display text-[16px] font-bold">
                            {t.name.replace(" Agent", "")}
                          </span>
                          <span className="bc-meta block tracking-[0.1em]">Agent</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="bc-ghost text-[14px] leading-[1.65] text-muted-deep">
                  No pattern is introduced at this belt. This agent can point you to Chon-Ji, the
                  first pattern.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
