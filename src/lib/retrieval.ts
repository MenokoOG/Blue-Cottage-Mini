import { CHUNKS, type Chunk } from "@/lib/corpus";

/**
 * Lightweight lexical retrieval over the corpus (RAG retrieval stage).
 * TF-IDF-weighted token overlap; no external calls, deterministic.
 * Prototype note: swap for embedding search later without changing callers.
 *
 * Retrieval can be scoped to a set of tags, which is how an agent sees only
 * its own part of the corpus (see lib/agents).
 */

export type { Chunk };

const STOP = new Set(
  "a an and the to with while of in on for is it as at by or be this that".split(" "),
);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const DF: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const c of CHUNKS) {
    for (const t of new Set(tokenize(c.text))) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return df;
})();

/**
 * @param scope tags the caller may read; a chunk is eligible if it carries at
 *   least one. Omit to search the whole corpus.
 */
export function retrieve(query: string, k = 8, scope?: ReadonlySet<string>): Chunk[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const n = CHUNKS.length;
  const lowered = query.toLowerCase();
  const eligible = scope ? CHUNKS.filter((c) => c.tags.some((t) => scope.has(t))) : CHUNKS;
  const scored = eligible.map((c) => {
    const cTokens = new Set(tokenize(c.text));
    let score = 0;
    for (const t of qTokens) {
      if (cTokens.has(t)) score += Math.log(1 + n / (DF.get(t) ?? 1));
    }
    // Normalise by chunk length so long chunks do not win on token count alone.
    score /= Math.sqrt(cTokens.size || 1);
    // strong boost when the query names the pattern or belt outright
    if (lowered.includes(c.label.toLowerCase())) score += 6;
    return { c, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.c);
}

/**
 * Chunks to fall back on when scored retrieval finds nothing: a scoped agent
 * asked something vague ("tell me about this pattern") should still be handed
 * its own facts rather than an empty prompt.
 */
export function baseline(scope: ReadonlySet<string>, k = 4): Chunk[] {
  return CHUNKS.filter((c) => c.tags.some((t) => scope.has(t))).slice(0, k);
}
