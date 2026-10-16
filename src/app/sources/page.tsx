import type { Metadata } from "next";
import Link from "next/link";
import data from "@/data/sources.json";
import { formerPatterns, patterns } from "@/lib/patterns";
import type { Source } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sources and licences",
  description:
    "Every source behind Blue Cottage Mini, with its link, its licence and exactly what was taken from it.",
};

const sources = data.sources as Source[];

const USE_LABEL: Record<Source["use"], string> = {
  excerpt: "Excerpt",
  facts: "Facts",
  embed: "Embed",
  reference: "Reference",
};

export default function SourcesPage() {
  const withNamesake = [...patterns, ...formerPatterns].filter((p) => p.namesake);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-7">
      <header>
        <h1 className="bc-h1">Sources and licences</h1>
        <p className="mt-3 text-[15px] leading-[1.75] text-muted-deep text-pretty">
          Everything on this site comes from open or openly viewable material, and every item is
          credited here. Nothing is copied from a copyrighted manual. Move-by-move sequences are
          left out because no free-licensed source for them exists.
        </p>
      </header>

      <section aria-label="Sources">
        <div className="bc-rule">
          <h2 className="bc-label whitespace-nowrap">Source register</h2>
        </div>
        <ul className="flex flex-col gap-3.5">
          {sources.map((s) => (
            <li key={s.id} className="bc-card">
              <p className="flex items-start justify-between gap-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-[17px] font-bold underline decoration-cottage decoration-2 underline-offset-4"
                >
                  {s.title}
                </a>
                <span className="bc-tag bc-tag-ink shrink-0">{USE_LABEL[s.use]}</span>
              </p>
              <p className="bc-meta mt-1 tracking-[0.1em]">{s.publisher}</p>
              <p className="mt-2 text-[14px] leading-[1.65] text-muted-deep">{s.usedFor}</p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.06em] text-muted-deep">
                Licence:{" "}
                {s.licenseUrl ? (
                  <a
                    href={s.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bc-link text-ink"
                  >
                    {s.license}
                  </a>
                ) : (
                  s.license
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Wikipedia excerpts">
        <div className="bc-rule">
          <h2 className="bc-label whitespace-nowrap">Wikipedia excerpts</h2>
        </div>
        <p className="mb-3.5 text-[14px] leading-[1.65] text-muted-deep">
          Each excerpt is shortened from the article lead and licensed CC BY-SA 4.0 by Wikipedia
          contributors. The link on each row is the article; the history link names the authors.
        </p>
        <ul className="flex flex-col divide-y divide-muted/25 rounded-md border border-muted/40 bg-paper-lift">
          {withNamesake.map((p) =>
            p.namesake ? (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <span className="text-[14px]">
                  <Link href={`/patterns/${p.id}`} className="font-bold">
                    {p.name}
                  </Link>
                  <span className="text-muted-deep"> · </span>
                  <a
                    href={p.namesake.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bc-link text-ink"
                  >
                    {p.namesake.title}
                  </a>
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-muted-deep">
                  <a
                    href={p.namesake.historyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bc-link text-ink"
                  >
                    history
                  </a>{" "}
                  · rev {p.namesake.revision} · {p.namesake.retrieved}
                </span>
              </li>
            ) : null,
          )}
        </ul>
      </section>

      <section aria-label="Videos">
        <div className="bc-rule">
          <h2 className="bc-label whitespace-nowrap">Videos</h2>
        </div>
        <p className="mb-3.5 text-[14px] leading-[1.65] text-muted-deep">
          Videos are not copied or hosted. They play through YouTube&rsquo;s own player when you
          press play, and remain the property of the uploader. Each was confirmed embeddable on
          the date shown.
        </p>
        <ul className="flex flex-col divide-y divide-muted/25 rounded-md border border-muted/40 bg-paper-lift">
          {patterns.map((p) => {
            const [v] = p.videos;
            return v ? (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bc-link text-[14px] text-ink"
                >
                  {v.title}
                </a>
                <span className="font-mono text-[11px] tracking-[0.06em] text-muted-deep">
                  {v.channel} · {v.verified}
                </span>
              </li>
            ) : null;
          })}
        </ul>
      </section>

      <section aria-label="Discrepancies" className="bc-panel">
        <h2 className="bc-label mb-2.5">Known discrepancies</h2>
        <p className="mb-2.5 text-[14px] leading-[1.65] text-muted-deep">
          Public sources disagree in places. These are the conflicts found while cross-checking.
          Confirm anything that matters for a grading with your instructor.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[14px] leading-[1.65]">
          {data.discrepancies.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
