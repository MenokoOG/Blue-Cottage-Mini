/** Domain types for the 24 ITF patterns (teul) and the student's progress. */

export interface Movement {
  readonly number: number;
  readonly text: string;
  /** Execution note, e.g. "Perform 2 and 3 in a fast motion." */
  readonly note?: string;
}

/** A Wikipedia excerpt, kept with everything CC BY-SA needs to reuse it. */
export interface Namesake {
  readonly title: string;
  readonly excerpt: string;
  readonly url: string;
  readonly historyUrl: string;
  readonly revision: string;
  readonly license: string;
  readonly licenseUrl: string;
  /** ISO date the excerpt was fetched. */
  readonly retrieved: string;
}

/** An embeddable video, checked against YouTube's oEmbed endpoint at build time. */
export interface Video {
  readonly id: string;
  readonly title: string;
  readonly channel: string;
  readonly url: string;
  readonly channelUrl: string;
  /** ISO date the video was last confirmed to exist and be embeddable. */
  readonly verified: string;
}

/** Raw record in src/data/teul.json, written by tools/build_open_data.mjs. */
export interface TulRecord {
  readonly id: string;
  /** 1 to 24 for the current curriculum; later for former patterns. */
  readonly order: number;
  readonly name: string;
  readonly status: "current" | "former";
  /** Rank vocabulary of rank.ts, e.g. "9th gup" or "3rd dan". */
  readonly rank: string;
  /** Belt colour family, e.g. "Yellow". */
  readonly belt: string;
  readonly movementCount: number;
  /** Historical period the pattern's namesake belongs to. */
  readonly period: string;
  readonly meaning: string;
  /** Why the pattern has this many movements, where the tradition says so. */
  readonly numberNote?: string;
  readonly namesake: Namesake | null;
  readonly videos: readonly Video[];
}

/** A pattern as the app uses it: the record plus any movement text on file. */
export interface Pattern extends TulRecord {
  /** Empty until movement text is supplied in src/data/movements.json. */
  readonly movements: readonly Movement[];
}

export interface PatternSummary {
  readonly slug: string;
  readonly name: string;
  readonly rank: string;
  readonly belt: string;
  readonly movementCount: number;
}

export interface PatternProgress {
  practiced: number;
  quizBest: number;
  updatedAt: number;
}

export type ProgressMap = Record<string, PatternProgress>;

/** One entry in the public source register, src/data/sources.json. */
export interface Source {
  readonly id: string;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  readonly license: string;
  readonly licenseUrl?: string;
  /** What this app takes from it. */
  readonly usedFor: string;
  /** How it is reused: "excerpt", "facts", "embed" or "reference". */
  readonly use: "excerpt" | "facts" | "embed" | "reference";
}
