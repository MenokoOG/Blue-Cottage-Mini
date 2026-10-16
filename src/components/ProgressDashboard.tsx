"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loadUserDoc, saveRank } from "@/lib/progress";
import {
  RANKS,
  patternsBeforeRank,
  patternsForRank,
  rankIndex,
  type RankId,
} from "@/lib/rank";
import { beltOfRank } from "@/lib/belts";
import { summaries } from "@/lib/patterns";
import type { PatternSummary, ProgressMap } from "@/lib/types";

/**
 * Where a student stands on the patterns for their own rank.
 *
 * Two honesty constraints shape this view:
 *
 * 1. Rank is chosen by the student, never inferred from progress. An examiner
 *    grants rank; practising a pattern does not.
 * 2. The app has data on patterns only. It knows nothing about a student's
 *    stances, sparring, self-defense or theory, so it shows no completion bar
 *    for the grading as a whole. A bar over requirements nothing measures
 *    would be a lie.
 */

function PatternRow({ p, entry }: { p: PatternSummary; entry?: ProgressMap[string] }) {
  const practiced = entry?.practiced ?? 0;
  const quizBest = entry?.quizBest ?? 0;
  const untouched = !entry || (practiced === 0 && quizBest === 0);

  return (
    <li>
      <Link
        href={`/patterns/${p.slug}`}
        className={
          untouched
            ? "flex items-center justify-between gap-3 rounded-md border border-dashed border-muted/70 px-4 py-3.5 transition duration-200 hover:border-cottage"
            : "bc-row"
        }
      >
        <span className="min-w-0">
          <span className="block truncate font-display text-[19px] font-bold">{p.name}</span>
          <span className="bc-meta block tracking-[0.12em]">{p.movementCount} mv</span>
        </span>
        {untouched ? (
          <span className="bc-tag bc-tag-outline shrink-0">Not started</span>
        ) : (
          <span className="flex shrink-0 gap-1.5">
            <span
              className="bc-tag bc-tag-ink"
              title="Completed run-throughs in the stepper"
            >
              {practiced}× practised
            </span>
            <span
              className={
                quizBest >= 80
                  ? "bc-tag bc-tag-cottage"
                  : quizBest > 0
                    ? "bc-tag border border-cottage/70 text-muted-deep"
                    : "bc-tag bc-tag-outline"
              }
              title="Best quiz score"
            >
              {quizBest > 0 ? `${quizBest}%` : "No quiz"}
            </span>
          </span>
        )}
      </Link>
    </li>
  );
}

export default function ProgressDashboard() {
  const { user, enabled, ready } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [rank, setRank] = useState<RankId | null>(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid ?? null;

  useEffect(() => {
    // Wait for any sign-in merge to finish, or this reads a half-merged account.
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const docData = await loadUserDoc(uid);
      if (cancelled) return;
      setProgress(docData.progress);
      setRank(docData.rank);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, uid]);

  async function onPickRank(next: RankId): Promise<void> {
    setRank(next);
    await saveRank(uid, next);
  }

  if (loading || !ready) {
    return <p className="bc-meta">Loading your progress…</p>;
  }

  const belt = rank ? beltOfRank(rank) : undefined;
  const promotesTo = rank ? RANKS[rankIndex(rank) + 1] : undefined;
  const current = rank ? patternsForRank(rank) : [];
  const earlier = rank ? patternsBeforeRank(rank) : [];
  // Only patterns that still exist: slugs saved against older data are ignored.
  const known = new Set(summaries().map((p) => p.slug));
  const started = Object.keys(progress).filter((slug) => known.has(slug)).length;

  return (
    <div className="flex flex-col gap-7">
      <section
        aria-label="Rank"
        className="bc-cover flex flex-col gap-3.5 rounded-lg px-5 py-5.5"
      >
        <span className="bc-cover-glow -right-16 -top-20 h-52 w-52" aria-hidden="true" />
        <label
          htmlFor="rank"
          className="relative font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cottage"
        >
          My rank
        </label>
        <select
          id="rank"
          value={rank ?? ""}
          onChange={(e) => void onPickRank(e.target.value as RankId)}
          className="bc-select relative"
        >
          <option value="" disabled>
            Choose your rank…
          </option>
          {RANKS.map((r) => (
            <option key={r} value={r} className="text-ink">
              {r}, {beltOfRank(r).name} belt
            </option>
          ))}
        </select>
        {belt ? (
          <p className="relative text-[15px] leading-[1.7] text-on-ink">
            {belt.name} belt
            {promotesTo ? (
              <>
                , working toward <strong className="text-cottage">{promotesTo}</strong>
              </>
            ) : (
              ", the top of this ladder"
            )}
            .
          </p>
        ) : (
          <p className="relative text-[15px] leading-[1.7] text-on-ink">
            Pick your rank to see the patterns for it. Your instructor sets your
            rank, this is just so the app knows what to show you.
          </p>
        )}
        {!enabled && (
          <p className="relative font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted">
            Saved on this device only. Sign-in is not configured.
          </p>
        )}
        {enabled && !user && (
          <p className="relative font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted">
            Saved on this device. Sign in to keep it across devices, your
            existing progress comes with you.
          </p>
        )}
      </section>

      {!rank && started > 0 && (
        <p className="text-[15px] leading-[1.7] text-muted-deep">
          You have progress on {started} pattern{started === 1 ? "" : "s"} so far.
        </p>
      )}

      {rank && belt && (
        <>
          <section aria-label={`Patterns for ${rank}`}>
            <div className="bc-rule">
              <h2 className="bc-label whitespace-nowrap">Patterns for {rank}</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {current.map((p) => (
                <PatternRow key={p.slug} p={p} entry={progress[p.slug]} />
              ))}
            </ul>
          </section>

          <section aria-label="Your belt agent" className="bc-card">
            <h2 className="bc-label mb-2">Your belt agent</h2>
            <p className="text-[15px] leading-[1.7]">
              The {belt.name} Belt Agent knows the patterns for {belt.ranks.join(", ")}. Only
              patterns are tracked here; everything else on a grading is between you and
              your instructor.
            </p>
            <Link
              href={`/coach?agent=belt-${belt.id}`}
              className="bc-btn bc-btn-cottage mt-3.5 w-full"
            >
              Ask the {belt.name} Belt Agent
            </Link>
          </section>

          {earlier.length > 0 && (
            <details className="bc-panel">
              <summary className="bc-label cursor-pointer">
                Earlier patterns ({earlier.length})
              </summary>
              <p className="mb-3 mt-2.5 text-[13px] leading-[1.65] text-muted-deep">
                Grading tests what you already hold, not only the new material.
              </p>
              <ul className="flex flex-col gap-3">
                {earlier.map((p) => (
                  <PatternRow key={p.slug} p={p} entry={progress[p.slug]} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
