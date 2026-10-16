import Link from "next/link";
import { BELTS } from "@/lib/belts";
import { formerPatterns, patterns } from "@/lib/patterns";

export default function HomePage() {
  return (
    <div>
      <section className="bc-cover px-6 pb-10 pt-9">
        <span className="bc-cover-glow -right-16 -top-20 h-60 w-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cottage">
            {patterns.length} patterns · Chang-Hon · ITF
          </p>
          <h1 className="bc-h1 bc-glow-text mt-4">
            Blue Cottage Mini
            <br />
            <span className="text-cottage-lift">A Tour of ITF Taekwon-Do</span>
          </h1>
          <div
            className="mt-4 h-[3px] w-16 bg-cottage"
            style={{ boxShadow: "0 0 14px rgba(131,168,202,0.6)" }}
            aria-hidden="true"
          />
          <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-on-ink">
            Walk the {patterns.length} patterns from white belt to 6th degree. Each one has a
            guide, a demonstration video and a story, and every fact shows where it came from.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/patterns/chon-ji" className="bc-btn bc-btn-cottage">
              Start with Chon-Ji
            </Link>
            <Link
              href="/agents"
              className="bc-btn border border-paper/55 text-paper hover:bg-paper/10"
            >
              Meet the agents
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-2xl flex-col gap-9 px-4 pt-8">
        <section aria-label="Master Instructor" className="bc-panel">
          <p className="bc-label mb-2">Your guide</p>
          <h2 className="font-display text-[22px] font-bold">The Master Instructor</h2>
          <p className="mt-2 text-[15px] leading-[1.75] text-muted-deep text-pretty">
            Leads a swarm of {BELTS.length} belt agents and {patterns.length} pattern agents. Ask a
            question and the right agent answers, or the Master convenes several when you compare
            patterns.
          </p>
          <Link href="/agents" className="bc-link mt-3 inline-block text-ink">
            See how the swarm is organised
          </Link>
        </section>

        {BELTS.map((belt) => {
          const mine = patterns.filter((p) => p.belt === belt.name);
          if (mine.length === 0) return null;
          return (
            <section key={belt.id} aria-label={`${belt.name} belt`}>
              <div className="bc-rule">
                <h2 className="bc-label flex items-center gap-2 whitespace-nowrap">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-ink/40"
                    style={{ backgroundColor: belt.swatch }}
                    aria-hidden="true"
                  />
                  {belt.name} belt
                </h2>
                <Link href={`/belts/${belt.id}`} className="bc-link order-last text-ink">
                  Belt agent
                </Link>
              </div>
              <ul className="flex flex-col gap-3">
                {mine.map((p) => (
                  <li key={p.id}>
                    <Link href={`/patterns/${p.id}`} className="bc-row">
                      <span className="min-w-0">
                        <span className="block truncate font-display text-[19px] font-bold">
                          <span className="mr-2.5 font-mono text-xs font-normal text-muted">
                            {String(p.order).padStart(2, "0")}
                          </span>
                          {p.name}
                        </span>
                        <span className="bc-meta block tracking-[0.12em]">{p.rank}</span>
                      </span>
                      <span className="bc-meta shrink-0 tracking-[0.12em]">
                        {p.movementCount} mv
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {formerPatterns.length > 0 && (
          <section aria-label="Former patterns">
            <div className="bc-rule">
              <h2 className="bc-label whitespace-nowrap">Former patterns</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {formerPatterns.map((p) => (
                <li key={p.id}>
                  <Link href={`/patterns/${p.id}`} className="bc-row">
                    <span className="font-display text-[19px] font-bold">{p.name}</span>
                    <span className="bc-meta tracking-[0.12em]">not in the 24</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
