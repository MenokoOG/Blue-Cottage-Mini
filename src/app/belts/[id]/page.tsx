import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BELTS, beltById } from "@/lib/belts";
import { patterns } from "@/lib/patterns";
import { agentById } from "@/lib/agents/registry";

export function generateStaticParams() {
  return BELTS.map((b) => ({ id: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const belt = beltById(id);
  return belt ? { title: `${belt.name} Belt Agent` } : {};
}

export default async function BeltPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const belt = beltById(id);
  const agent = agentById(`belt-${id}`);
  if (!belt || !agent) notFound();

  const mine = patterns.filter((p) => p.belt === belt.name);

  return (
    <div>
      <header className="bc-cover px-6 py-8">
        <span className="bc-cover-glow -bottom-24 -left-10 h-60 w-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cottage">
            <span
              className="inline-block h-3 w-3 rounded-full border border-paper/60"
              style={{ backgroundColor: belt.swatch }}
              aria-hidden="true"
            />
            Belt agent
          </p>
          <h1 className="bc-h1 bc-glow-text mt-3">{agent.name}</h1>
          <p className="mt-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-on-ink">
            {belt.ranks.join(" · ")}
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-6">
        <p className="text-[15px] leading-[1.75] text-muted-deep text-pretty">{agent.role}</p>

        <Link href={`/coach?agent=${agent.id}`} className="bc-btn bc-btn-cottage w-full">
          Ask the {agent.name}
        </Link>

        <section aria-label="Patterns">
          <div className="bc-rule">
            <h2 className="bc-label whitespace-nowrap">Patterns on this belt</h2>
          </div>
          {mine.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {mine.map((p) => (
                <li key={p.id}>
                  <Link href={`/patterns/${p.id}`} className="bc-row">
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[19px] font-bold">
                        {p.name}
                      </span>
                      <span className="bc-meta block tracking-[0.12em]">{p.rank}</span>
                    </span>
                    <span className="bc-meta shrink-0 tracking-[0.12em]">{p.movementCount} mv</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bc-ghost text-[15px] leading-[1.7] text-muted-deep">
              No pattern is introduced at white belt. Chon-Ji is the first, at 9th gup.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
