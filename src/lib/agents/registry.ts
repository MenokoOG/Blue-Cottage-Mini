import { BELTS } from "@/lib/belts";
import { patterns } from "@/lib/patterns";
import type { Agent } from "@/lib/agents/types";

/**
 * Builds the swarm from the data, so adding a pattern or a belt grows the
 * roster without anyone editing a list of agents by hand.
 *
 * Every persona carries the same three rules, because they are the app's
 * promises rather than flavour: answer only from the excerpts, never invent a
 * movement, and say plainly when movement sequences are not on file.
 */

const RULES =
  "Answer ONLY from the excerpts you are given. If they do not contain the answer, say " +
  "so and suggest asking a qualified instructor. Never invent movements, stances or " +
  "grading requirements. This app does not include move-by-move sequences, so if asked " +
  "for one, say that and point to the embedded video and to the student's instructor. " +
  "Be brief, warm and encouraging. This is study help, not a substitute for the dojang.";

const MASTER_ID = "master";

function buildMaster(): Agent {
  return {
    id: MASTER_ID,
    kind: "master",
    name: "Master Instructor",
    role: "Leads the swarm and answers questions that span patterns or belts.",
    parent: null,
    children: BELTS.map((b) => `belt-${b.id}`),
    tag: "master",
    persona:
      "You are the Master Instructor of Blue Cottage Mini, a study guide to ITF Taekwon-Do. " +
      `You lead ${BELTS.length} belt agents and ${patterns.length} pattern agents, and you answer ` +
      "questions that span several patterns, several belts, or the whole curriculum. " +
      "When pattern agents were consulted, draw on what they contributed. " +
      RULES,
  };
}

function buildBelt(belt: (typeof BELTS)[number]): Agent {
  const ranks = belt.ranks.join(", ");
  return {
    id: `belt-${belt.id}`,
    kind: "belt",
    name: `${belt.name} Belt Agent`,
    role: `Knows the ${belt.name.toLowerCase()} belt ladder (${ranks}) and the patterns learned on it.`,
    parent: MASTER_ID,
    children: patterns.filter((p) => p.belt === belt.name).map((p) => `tul-${p.id}`),
    tag: `belt:${belt.id}`,
    persona:
      `You are the ${belt.name} Belt Agent of Blue Cottage Mini. You cover ${ranks}, and you ` +
      "know which patterns are learned at each rank and how many movements they have. " +
      "For questions about one pattern in depth, point the student to that pattern's agent. " +
      RULES,
  };
}

function buildTul(p: (typeof patterns)[number]): Agent {
  return {
    id: `tul-${p.id}`,
    kind: "tul",
    name: `${p.name} Agent`,
    role: `Pattern ${p.order} of ${patterns.length}. ${p.movementCount} movements, taught at ${p.rank}.`,
    parent: `belt-${p.belt.toLowerCase()}`,
    children: [],
    tag: `tul:${p.id}`,
    persona:
      `You are the ${p.name} Agent of Blue Cottage Mini, and you know one pattern: ${p.name}, ` +
      `pattern ${p.order} of ${patterns.length}, taught at ${p.rank}. You know its meaning, its ` +
      "namesake and its place in Korean history. For questions about other patterns, say so " +
      "and suggest the Master Instructor. " +
      RULES,
  };
}

export const MASTER: Agent = buildMaster();
export const BELT_AGENTS: readonly Agent[] = BELTS.map(buildBelt);
export const TUL_AGENTS: readonly Agent[] = patterns.map(buildTul);

/** The whole swarm, Master first, then belts, then patterns in order. */
export const AGENTS: readonly Agent[] = [MASTER, ...BELT_AGENTS, ...TUL_AGENTS];

const BY_ID = new Map(AGENTS.map((a) => [a.id, a]));

export function agentById(id: string): Agent | undefined {
  return BY_ID.get(id);
}

/** The pattern agent for a pattern id, e.g. "chon-ji". */
export function tulAgent(patternId: string): Agent | undefined {
  return BY_ID.get(`tul-${patternId}`);
}
