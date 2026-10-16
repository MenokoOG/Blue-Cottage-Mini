import { BELTS } from "@/lib/belts";
import { patterns } from "@/lib/patterns";
import { RANKS } from "@/lib/rank";
import type { Pattern } from "@/lib/types";

/**
 * Builds a quiz for one pattern from the open facts in the data (movement
 * count, rank, belt, period, meaning, curriculum order). When movement text
 * has been supplied, "what comes next" questions are added.
 *
 * Pure apart from the shuffle, which takes an injectable `random` so tests
 * are deterministic.
 */

export interface Question {
  prompt: string;
  options: string[];
  answer: number; // index into options
}

type Random = () => number;

export function shuffle<T>(arr: readonly T[], random: Random = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const ai = a[i] as T;
    a[i] = a[j] as T;
    a[j] = ai;
  }
  return a;
}

/** Builds one question: the correct answer among up to three distinct distractors. */
function pick(
  prompt: string,
  correct: string,
  pool: readonly string[],
  random: Random,
): Question | null {
  const distractors = shuffle(
    [...new Set(pool)].filter((x) => x !== correct),
    random,
  ).slice(0, 3);
  if (distractors.length < 2) return null;
  const options = shuffle([correct, ...distractors], random);
  return { prompt, options, answer: options.indexOf(correct) };
}

export function buildQuestions(pattern: Pattern, random: Random = Math.random): Question[] {
  const others = patterns.filter((p) => p.id !== pattern.id);
  const qs: (Question | null)[] = [];

  qs.push(
    pick(
      `How many movements does ${pattern.name} have?`,
      String(pattern.movementCount),
      others.map((p) => String(p.movementCount)),
      random,
    ),
  );

  qs.push(
    pick(
      `At which rank is ${pattern.name} taught?`,
      pattern.rank,
      RANKS.filter((r) => r !== pattern.rank),
      random,
    ),
  );

  qs.push(
    pick(
      `Which belt colour learns ${pattern.name}?`,
      pattern.belt,
      BELTS.map((b) => b.name),
      random,
    ),
  );

  qs.push(
    pick(
      `${pattern.name} is named for a person or idea from which period of Korean history?`,
      pattern.period,
      others.map((p) => p.period),
      random,
    ),
  );

  qs.push(
    pick(
      `Which of these is the meaning of ${pattern.name}?`,
      pattern.meaning,
      others.map((p) => p.meaning),
      random,
    ),
  );

  const idx = patterns.findIndex((p) => p.id === pattern.id);
  const following = idx >= 0 ? patterns[idx + 1] : undefined;
  if (following) {
    qs.push(
      pick(
        `Which pattern comes right after ${pattern.name} in the curriculum?`,
        following.name,
        others.map((p) => p.name),
        random,
      ),
    );
  }

  // "what comes next" questions, only once movement text is on file
  const mvs = pattern.movements;
  if (mvs.length >= 5) {
    const starts = shuffle(
      mvs.slice(0, -1).map((m) => m.number),
      random,
    ).slice(0, 3);
    for (const n of starts) {
      const correct = mvs.find((m) => m.number === n + 1);
      const current = mvs.find((m) => m.number === n);
      if (!correct || !current) continue;
      qs.push(
        pick(
          `Movement ${n} is: “${current.text}”, what comes next?`,
          correct.text,
          mvs.filter((m) => m.number !== n + 1 && m.number !== n).map((m) => m.text),
          random,
        ),
      );
    }
  }

  return shuffle(
    qs.filter((q): q is Question => q !== null),
    random,
  );
}
