import { BELTS } from "@/lib/belts";
import { patterns } from "@/lib/patterns";

/**
 * The retrievable corpus: everything the agents are allowed to answer from.
 *
 * Every chunk carries the source it came from, so an answer can always say
 * where its facts are from. Chunks are tagged by who may read them:
 *
 *   - "tul:<id>"   read by that pattern's agent
 *   - "belt:<id>"  read by that belt's agent
 *   - "master"     read only when the Master Instructor leads
 *   - "global"     read by everyone: the roster, so any agent can place its
 *                  own pattern in the whole
 *
 * Movement text is chunked one movement per chunk, but only exists once
 * src/data/movements.json has been filled in; until then the corpus holds
 * facts, namesakes and history, and the agents say so rather than guess.
 */

export interface Chunk {
  readonly id: string;
  /**
   * Name the chunk is known by -- a pattern or belt. Retrieval boosts a chunk
   * when the query names it outright.
   */
  readonly label: string;
  readonly text: string;
  readonly tags: readonly string[];
  readonly source: { readonly label: string; readonly url: string };
}

const TEUL_URL = "https://en.wikipedia.org/wiki/Teul";
const ITF_URL = "https://itftaekwondo.com/patterns/";

function patternChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const p of patterns) {
    const beltTag = `belt:${p.belt.toLowerCase()}`;
    const tags = [`tul:${p.id}`, beltTag];
    chunks.push({
      id: `${p.id}:facts`,
      label: p.name,
      tags,
      source: { label: "itftaekwondo.com/patterns and Wikipedia: Teul", url: ITF_URL },
      text:
        `${p.name} is pattern ${p.order} of ${patterns.length}, taught at ${p.rank} (${p.belt} belt). ` +
        `It has ${p.movementCount} movements. Period: ${p.period}. Meaning: ${p.meaning}` +
        (p.numberNote ? ` ${p.numberNote}` : ""),
    });
    if (p.namesake) {
      chunks.push({
        id: `${p.id}:namesake`,
        label: p.name,
        tags,
        source: { label: `Wikipedia: ${p.namesake.title} (CC BY-SA 4.0)`, url: p.namesake.url },
        text: `About the namesake of ${p.name}: ${p.namesake.excerpt}`,
      });
    }
    for (const m of p.movements) {
      chunks.push({
        id: `${p.id}:${m.number}`,
        label: p.name,
        tags,
        source: { label: "Movement text supplied by the instructor", url: "/about" },
        text: `${p.name} movement ${m.number}: ${m.text}${m.note ? ` (${m.note})` : ""}`,
      });
    }
  }
  return chunks;
}

function beltChunks(): Chunk[] {
  return BELTS.map((b) => {
    const mine = patterns.filter((p) => p.belt === b.name);
    const list = mine.length
      ? mine.map((p) => `${p.name} (${p.rank}, ${p.movementCount} movements)`).join("; ")
      : "no patterns of its own";
    return {
      id: `belt-${b.id}:overview`,
      label: `${b.name} belt`,
      tags: [`belt:${b.id}`],
      source: { label: "itftaekwondo.com/patterns", url: ITF_URL },
      text:
        `The ${b.name} belt covers ${b.ranks.join(", ")}. ` +
        `Patterns learned on it: ${list}.`,
    };
  });
}

function globalChunks(): Chunk[] {
  const roster = patterns
    .map((p) => `${p.order}. ${p.name} (${p.rank}, ${p.movementCount} movements)`)
    .join("; ");
  return [
    {
      id: "master:roster",
      label: "roster",
      tags: ["global"],
      source: { label: "Wikipedia: Teul", url: TEUL_URL },
      text: `The 24 ITF patterns in curriculum order: ${roster}.`,
    },
    {
      id: "master:history",
      label: "history of the patterns",
      tags: ["master"],
      source: { label: "Wikipedia: Teul (CC BY-SA 4.0)", url: TEUL_URL },
      text:
        "General Choi Hong Hi designed the patterns, based on karate kata, in four eras. " +
        "1955 to 1959: the first patterns, then called hyung, among them Hwa-Rang and Choong-Moo. " +
        "1961 to 1964: sixteen more, including Chon-Ji, Dan-Gun and Tong-Il, when the name changed to teul. " +
        "1968: Eui-Am, Yon-Gae, Moon-Moo and So-San. " +
        "1981 to 1983: Juche replaced Ko-Dang. Together the 24 patterns are meant to represent the whole of Korean history.",
    },
    {
      id: "master:principles",
      label: "how to practise a pattern",
      tags: ["master"],
      source: { label: "Wikipedia: Teul (CC BY-SA 4.0)", url: TEUL_URL },
      text:
        "General Choi's points for performing a pattern: begin and end on exactly the same spot; " +
        "keep correct posture and facing; tense or relax the muscles at the proper moments; " +
        "move rhythmically without stiffness; accelerate or decelerate as instructed; " +
        "perfect each pattern before the next; know the purpose of each movement; " +
        "perform each movement with realism; and spread attacks and defences evenly between right and left.",
    },
    {
      id: "master:program",
      label: "Blue Cottage Mini",
      tags: ["master"],
      source: { label: "Blue Cottage Mini: About", url: "/about" },
      text:
        "Blue Cottage Mini is a study guide to ITF Taekwon-Do. It has a Master Instructor, " +
        `${BELTS.length} belt agents (${BELTS.map((b) => b.name).join(", ")}) and ${patterns.length} pattern agents. ` +
        "Each pattern page shows its meaning, namesake and a demonstration video, with every source cited. " +
        "Move-by-move sequences are not included; they are taught by a qualified instructor.",
    },
  ];
}

export const CHUNKS: readonly Chunk[] = [...patternChunks(), ...beltChunks(), ...globalChunks()];
