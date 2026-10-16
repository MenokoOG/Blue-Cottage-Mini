import type { Namesake } from "@/lib/types";

/**
 * A Wikipedia excerpt shown the way CC BY-SA 4.0 requires: named author
 * (Wikipedia contributors, via the history link), the licence with a link, the
 * article it came from, and a note that it was shortened.
 */
export default function NamesakePanel({ namesake }: { namesake: Namesake }) {
  return (
    <section aria-label="Namesake" className="bc-panel">
      <h2 className="bc-label mb-2.5">Namesake</h2>
      <p className="text-[15px] leading-[1.75] text-pretty">{namesake.excerpt}</p>
      <p className="mt-3.5 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted-deep">
        Excerpt, shortened, from{" "}
        <a href={namesake.url} target="_blank" rel="noopener noreferrer" className="bc-link text-ink">
          “{namesake.title}” on Wikipedia
        </a>{" "}
        by{" "}
        <a
          href={namesake.historyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bc-link text-ink"
        >
          Wikipedia contributors
        </a>
        , revision {namesake.revision}, retrieved {namesake.retrieved}. Licensed{" "}
        <a
          href={namesake.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bc-link text-ink"
        >
          {namesake.license}
        </a>
        .
      </p>
    </section>
  );
}
