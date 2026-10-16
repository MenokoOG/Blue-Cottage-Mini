import teul from "@/data/teul.json";
import movementText from "@/data/movements.json";
import type { Movement, Pattern, PatternSummary, TulRecord } from "@/lib/types";

/**
 * Movement text, keyed by pattern id. Empty until the instructor supplies it:
 * there is no free-licensed source for move-by-move sequences, so none is
 * shipped. Drop an array of `{ number, text, note? }` under a pattern id in
 * src/data/movements.json and the stepper and quiz pick it up.
 */
const MOVEMENTS = movementText as unknown as Record<string, readonly Movement[]>;

function withMovements(r: TulRecord): Pattern {
  return { ...r, movements: MOVEMENTS[r.id] ?? [] };
}

const records = teul as unknown as TulRecord[];

/** The 24 patterns of the current curriculum, in order. */
export const patterns: readonly Pattern[] = records
  .filter((r) => r.status === "current")
  .map(withMovements);

/** Patterns that exist but are not in the 24, e.g. Ko-Dang. */
export const formerPatterns: readonly Pattern[] = records
  .filter((r) => r.status === "former")
  .map(withMovements);

const everything: readonly Pattern[] = [...patterns, ...formerPatterns];

export function slugOf(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function bySlug(slug: string): Pattern | undefined {
  return everything.find((p) => p.id === slug);
}

function summarise(p: Pattern): PatternSummary {
  return {
    slug: p.id,
    name: p.name,
    rank: p.rank,
    belt: p.belt,
    movementCount: p.movementCount,
  };
}

export function summaries(): PatternSummary[] {
  return patterns.map(summarise);
}

/** Groups in curriculum order, one group per rank. */
export function groupedByRank(): { rank: string; items: PatternSummary[] }[] {
  const groups: { rank: string; items: PatternSummary[] }[] = [];
  for (const s of summaries()) {
    const last = groups[groups.length - 1];
    if (last && last.rank === s.rank) last.items.push(s);
    else groups.push({ rank: s.rank, items: [s] });
  }
  return groups;
}

/** Every pattern page that should exist, former ones included. */
export function allSlugs(): string[] {
  return everything.map((p) => p.id);
}
