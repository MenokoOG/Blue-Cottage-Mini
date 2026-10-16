import { RANKS, type RankId } from "@/lib/rank";

/**
 * The six belt colour families of the ITF ladder. Each one is a belt agent in
 * the swarm (see lib/agents), so this is the single place that says which
 * ranks belong to which belt.
 *
 * Ranks are grouped the way the grading ladder reads: two gup grades per
 * colour (a tip, then the full belt), white alone at the bottom, and the six
 * dan degrees together under black. 1st gup is the senior red belt.
 */
export interface Belt {
  readonly id: "white" | "yellow" | "green" | "blue" | "red" | "black";
  readonly name: string;
  readonly ranks: readonly RankId[];
  /** Belt colour for UI swatches; not a brand colour. */
  readonly swatch: string;
}

export const BELTS: readonly Belt[] = [
  { id: "white", name: "White", ranks: ["10th gup"], swatch: "#f4f1ea" },
  { id: "yellow", name: "Yellow", ranks: ["9th gup", "8th gup"], swatch: "#e8c547" },
  { id: "green", name: "Green", ranks: ["7th gup", "6th gup"], swatch: "#5d9a62" },
  { id: "blue", name: "Blue", ranks: ["5th gup", "4th gup"], swatch: "#3f6fb0" },
  { id: "red", name: "Red", ranks: ["3rd gup", "2nd gup", "1st gup"], swatch: "#b9453f" },
  {
    id: "black",
    name: "Black",
    ranks: ["1st dan", "2nd dan", "3rd dan", "4th dan", "5th dan", "6th dan"],
    swatch: "#16222f",
  },
];

export function beltOfRank(rank: RankId): Belt {
  const belt = BELTS.find((b) => b.ranks.includes(rank));
  if (!belt) throw new Error(`rank ${rank} belongs to no belt`);
  return belt;
}

export function beltById(id: string): Belt | undefined {
  return BELTS.find((b) => b.id === id);
}

/** Belt for a pattern's rank label, or undefined if the label is not a rank. */
export function beltOfLabel(label: string): Belt | undefined {
  const tail = label.split("/").pop()?.trim().toLowerCase() ?? "";
  return (RANKS as readonly string[]).includes(tail)
    ? beltOfRank(tail as RankId)
    : undefined;
}
