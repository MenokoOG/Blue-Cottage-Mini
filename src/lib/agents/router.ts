import { BELTS, beltOfRank } from "@/lib/belts";
import { patterns } from "@/lib/patterns";
import { MASTER, agentById } from "@/lib/agents/registry";
import type { Agent, Route } from "@/lib/agents/types";
import type { RankId } from "@/lib/rank";

/**
 * Decides who answers. Deterministic and offline, so routing is free,
 * testable, and shown to the student before any paid call is made.
 *
 * Rules, in order:
 *   1. Several patterns named (2 or more): the Master leads and each named
 *      pattern agent is consulted, up to MAX_CONSULTED.
 *   2. One pattern named: that pattern's agent leads; a belt or rank named in
 *      the same question is consulted too.
 *   3. A belt or rank named, no pattern: that belt's agent leads.
 *   4. Otherwise a `focus` pattern (the page the student asked from) leads.
 *   5. Otherwise the `preferred` agent (the one the student chose to ask) leads.
 *   6. Otherwise the Master.
 */

export const MAX_CONSULTED = 3;

/** Spellings students actually type that differ from the canonical name. */
const ALIASES: Record<string, string[]> = {
  "chon-ji": ["cheon-ji", "chun-ji"],
  "dan-gun": ["tan-gun"],
  "choong-moo": ["chung-mu", "chung-moo", "choong-mu"],
  "yoo-sin": ["yu-sin"],
  "yon-gae": ["yeon-gae"],
  "joong-gun": ["jung-gun", "joong-geun"],
  "ge-baek": ["gye-baek", "kye-baek"],
  "kwang-gae": ["gwang-gae"],
  "moon-moo": ["mun-mu"],
};

interface Mention {
  readonly agentId: string;
  readonly at: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * "Do-San" matches "Do-San", "do san" and "dosan" but not "do sanitary": the
 * syllables may be joined by a hyphen, a space or nothing, and the whole name
 * must sit on word boundaries.
 */
function nameRegex(name: string): RegExp {
  const parts = name.split("-").map((x) => escapeRegex(x.toLowerCase()));
  return new RegExp(`\\b${parts.join("[-\\s]?")}\\b`, "i");
}

function patternMentions(question: string): Mention[] {
  const found: Mention[] = [];
  for (const p of patterns) {
    const forms = [nameRegex(p.name), ...(ALIASES[p.id] ?? []).map((a) => nameRegex(a))];
    const hits = forms.map((re) => question.search(re)).filter((i) => i >= 0);
    if (hits.length > 0) found.push({ agentId: `tul-${p.id}`, at: Math.min(...hits) });
  }
  return found.sort((a, b) => a.at - b.at);
}

const RANK_RE = /\b(10|[1-9])(?:st|nd|rd|th)\s+(gup|geup|kup|dan)\b/gi;
const BELT_RE = /\b(white|yellow|green|blue|red|black)\s+(?:belt|tip|stripe)s?\b/gi;

function beltMentions(question: string): string[] {
  const ids: string[] = [];
  for (const m of question.matchAll(BELT_RE)) {
    ids.push(`belt-${(m[1] ?? "").toLowerCase()}`);
  }
  for (const m of question.matchAll(RANK_RE)) {
    const kind = (m[2] ?? "").toLowerCase();
    const rank = `${m[1]}${ordinal(Number(m[1]))} ${kind === "dan" ? "dan" : "gup"}`;
    const belt = BELTS.find((b) => (b.ranks as readonly string[]).includes(rank));
    if (belt) ids.push(`belt-${belt.id}`);
  }
  return [...new Set(ids)];
}

function ordinal(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}

function resolve(ids: readonly string[]): Agent[] {
  return ids.flatMap((id) => {
    const a = agentById(id);
    return a ? [a] : [];
  });
}

/**
 * Routes a question. `focus` is a pattern id the student is already looking
 * at; `preferred` is an agent id the student chose to ask directly.
 */
export function route(question: string, focus?: string, preferred?: string): Route {
  const tuls = resolve(patternMentions(question).map((m) => m.agentId));
  const belts = resolve(beltMentions(question));

  if (tuls.length >= 2) {
    const consulted = tuls.slice(0, MAX_CONSULTED);
    const extra = tuls.length - consulted.length;
    return {
      lead: MASTER,
      consulted,
      reason:
        `You named ${tuls.length} patterns, so the Master Instructor is leading and consulting ` +
        `${consulted.map((a) => a.name).join(", ")}` +
        (extra > 0 ? ` (${extra} more not consulted, to keep answers focused)` : "") +
        ".",
    };
  }

  const [onlyTul] = tuls;
  if (onlyTul) {
    const alsoBelt = belts.slice(0, 1);
    return {
      lead: onlyTul,
      consulted: alsoBelt,
      reason:
        `You named ${onlyTul.name.replace(" Agent", "")}, so its agent answers` +
        (alsoBelt[0] ? ` with help from the ${alsoBelt[0].name}.` : "."),
    };
  }

  const [firstBelt] = belts;
  if (firstBelt) {
    return {
      lead: firstBelt,
      consulted: [],
      reason: `You asked about a belt or rank, so the ${firstBelt.name} answers.`,
    };
  }

  const focused = focus ? agentById(`tul-${focus}`) : undefined;
  if (focused) {
    return {
      lead: focused,
      consulted: [],
      reason: `You are on ${focused.name.replace(" Agent", "")}, so its agent answers.`,
    };
  }

  const chosen = preferred ? agentById(preferred) : undefined;
  if (chosen && chosen.kind !== "master") {
    return {
      lead: chosen,
      consulted: [],
      reason: `You chose to ask the ${chosen.name}.`,
    };
  }

  return {
    lead: MASTER,
    consulted: [],
    reason: "No pattern or belt was named, so the Master Instructor answers.",
  };
}

/** Belt agent for a rank, used when a student has chosen their rank. */
export function beltAgentForRank(rank: RankId): Agent | undefined {
  return agentById(`belt-${beltOfRank(rank).id}`);
}
