import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSlugs, bySlug, patterns } from "@/lib/patterns";
import { agentById, tulAgent } from "@/lib/agents/registry";
import MovementStepper from "@/components/MovementStepper";
import NamesakePanel from "@/components/NamesakePanel";
import VideoEmbed from "@/components/VideoEmbed";
import BeltChip from "@/components/BeltChip";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name}: ${p.rank} pattern`,
    description: `${p.name}, ${p.movementCount} movements, taught at ${p.rank}. ${p.meaning}`,
  };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = bySlug(slug);
  if (!pattern) notFound();

  const current = pattern.status === "current";
  const agent = tulAgent(pattern.id);
  const belt = agent?.parent ? agentById(agent.parent) : undefined;
  const idx = patterns.findIndex((p) => p.id === pattern.id);
  const prev = idx > 0 ? patterns[idx - 1] : undefined;
  const next = idx >= 0 ? patterns[idx + 1] : undefined;
  const [video] = pattern.videos;

  return (
    <article>
      <header className="bc-cover px-6 py-7">
        <span className="bc-cover-glow -bottom-28 -left-12 h-64 w-64" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cottage">
            {current ? `Pattern ${pattern.order} of ${patterns.length}` : "Former pattern"}
          </p>
          <h1 className="bc-h1 bc-glow-text mt-3">{pattern.name}</h1>
          <p className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-cottage">
            <BeltChip belt={pattern.belt} />
            <span>
              {pattern.rank} · {pattern.movementCount} movements
            </span>
            <span className="text-on-ink">{pattern.period}</span>
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-6">
        {!current && (
          <p className="bc-ghost text-[15px] leading-[1.7] text-muted-deep">
            {pattern.name} is not one of the 24 patterns in the current curriculum. It is shown
            here for reference because some organisations still practise it.
          </p>
        )}

        <section aria-label="Meaning" className="bc-panel">
          <h2 className="bc-label mb-2.5">Meaning</h2>
          <p className="text-[15px] leading-[1.75] text-pretty">{pattern.meaning}</p>
          {pattern.numberNote && (
            <p className="mt-2.5 text-[15px] leading-[1.75] text-muted-deep text-pretty">
              {pattern.numberNote}
            </p>
          )}
        </section>

        <div className="flex gap-3">
          <Link href={`/quiz/${slug}`} className="bc-btn bc-btn-cottage flex-1">
            Quiz me
          </Link>
          <Link
            href={`/coach?pattern=${encodeURIComponent(pattern.id)}`}
            className="bc-btn bc-btn-outline flex-1"
          >
            Ask {agent ? "its agent" : "the Master"}
          </Link>
        </div>

        {video && (
          <section aria-label="Demonstration video" className="flex flex-col gap-3">
            <h2 className="bc-label">Watch</h2>
            <VideoEmbed video={video} label={`${pattern.name} demonstration`} />
          </section>
        )}

        {pattern.namesake && <NamesakePanel namesake={pattern.namesake} />}

        {pattern.movements.length > 0 ? (
          <MovementStepper pattern={pattern} slug={slug} />
        ) : (
          <section aria-label="Movements" className="bc-ghost flex flex-col gap-2.5">
            <h2 className="bc-label">Movements</h2>
            <p className="text-[15px] leading-[1.7] text-muted-deep">
              The move-by-move sequence for {pattern.name} is not included. No free-licensed
              source for it exists, and the published sequences are copyrighted. Learn it from
              your instructor, and use the video above to see the {pattern.movementCount}{" "}
              movements performed.
            </p>
          </section>
        )}

        {agent && belt && (
          <section aria-label="Agent" className="bc-card">
            <h2 className="bc-label mb-2">Your guide</h2>
            <p className="text-[15px] leading-[1.7]">
              <strong>{agent.name}</strong> reports to the{" "}
              <Link href={`/belts/${belt.id.replace("belt-", "")}`} className="bc-link text-ink">
                {belt.name}
              </Link>
              , who reports to the{" "}
              <Link href="/agents" className="bc-link text-ink">
                Master Instructor
              </Link>
              .
            </p>
          </section>
        )}

        <nav aria-label="Neighbouring patterns" className="flex gap-3">
          {prev ? (
            <Link href={`/patterns/${prev.id}`} className="bc-row flex-1">
              <span className="min-w-0">
                <span className="bc-meta block">Previous</span>
                <span className="block truncate font-display text-base font-bold">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link href={`/patterns/${next.id}`} className="bc-row flex-1 text-right">
              <span className="min-w-0 flex-1">
                <span className="bc-meta block">Next</span>
                <span className="block truncate font-display text-base font-bold">{next.name}</span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>

        <p className="font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted-deep">
          Facts from{" "}
          <a
            href="https://en.wikipedia.org/wiki/Teul"
            target="_blank"
            rel="noopener noreferrer"
            className="bc-link text-ink"
          >
            Wikipedia: Teul
          </a>{" "}
          and{" "}
          <a
            href="https://itftaekwondo.com/patterns/"
            target="_blank"
            rel="noopener noreferrer"
            className="bc-link text-ink"
          >
            itftaekwondo.com
          </a>
          . <Link href="/sources" className="bc-link text-ink">All sources and licences</Link>.
        </p>
      </div>
    </article>
  );
}
