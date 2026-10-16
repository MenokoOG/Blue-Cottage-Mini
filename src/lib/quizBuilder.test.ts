import { describe, expect, it } from "vitest";
import { patterns } from "@/lib/patterns";
import { buildQuestions, shuffle } from "@/lib/quizBuilder";
import type { Pattern } from "@/lib/types";

/** A seedable generator so shuffles are repeatable. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("buildQuestions", () => {
  it("builds well-formed questions for every pattern", () => {
    for (const p of patterns) {
      const qs = buildQuestions(p, seeded(7));
      expect(qs.length, p.name).toBeGreaterThanOrEqual(5);
      for (const q of qs) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size, `${p.name}: ${q.prompt}`).toBe(q.options.length);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it("marks the true count as the answer to the count question", () => {
    const chonJi = patterns.find((p) => p.id === "chon-ji") as Pattern;
    const q = buildQuestions(chonJi, seeded(1)).find((x) => x.prompt.startsWith("How many"));
    expect(q?.options[q.answer]).toBe("19");
  });

  it("answers the rank and belt questions from the data", () => {
    const dan = patterns.find((p) => p.id === "dan-gun") as Pattern;
    const qs = buildQuestions(dan, seeded(2));
    const rank = qs.find((x) => x.prompt.startsWith("At which rank"));
    const belt = qs.find((x) => x.prompt.startsWith("Which belt colour"));
    expect(rank?.options[rank.answer]).toBe("8th gup");
    expect(belt?.options[belt.answer]).toBe("Yellow");
  });

  it("asks what follows a pattern, but not for the last one", () => {
    const first = buildQuestions(patterns[0] as Pattern, seeded(3));
    const next = first.find((x) => x.prompt.includes("right after"));
    expect(next?.options[next.answer]).toBe("Dan-Gun");

    const last = buildQuestions(patterns[23] as Pattern, seeded(3));
    expect(last.some((x) => x.prompt.includes("right after"))).toBe(false);
  });

  it("adds what-comes-next questions only once movement text exists", () => {
    const base = patterns.find((p) => p.id === "chon-ji") as Pattern;
    expect(buildQuestions(base, seeded(4)).some((q) => q.prompt.includes("what comes next"))).toBe(
      false,
    );

    const withText: Pattern = {
      ...base,
      movements: Array.from({ length: 8 }, (_, i) => ({ number: i + 1, text: `step ${i + 1}` })),
    };
    expect(
      buildQuestions(withText, seeded(4)).some((q) => q.prompt.includes("what comes next")),
    ).toBe(true);
  });
});

describe("shuffle", () => {
  it("keeps every element and leaves the input alone", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seeded(9));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
