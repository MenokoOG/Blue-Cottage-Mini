import { describe, expect, it } from "vitest";
import sources from "@/data/sources.json";
import { BELTS, beltOfLabel, beltOfRank } from "@/lib/belts";
import { allSlugs, bySlug, formerPatterns, groupedByRank, patterns } from "@/lib/patterns";
import { RANKS, isRank, rankIndex, type RankId } from "@/lib/rank";

describe("the 24 patterns", () => {
  it("are exactly 24, numbered 1 to 24 in order", () => {
    expect(patterns).toHaveLength(24);
    expect(patterns.map((p) => p.order)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it("have unique ids and names, and slugs that resolve", () => {
    expect(new Set(patterns.map((p) => p.id)).size).toBe(24);
    expect(new Set(patterns.map((p) => p.name)).size).toBe(24);
    for (const p of patterns) expect(bySlug(p.id)?.name).toBe(p.name);
  });

  it("each sit at a real rank, never moving down the ladder", () => {
    let last = -1;
    for (const p of patterns) {
      expect(isRank(p.rank), `${p.name}: ${p.rank}`).toBe(true);
      const at = rankIndex(p.rank as RankId);
      expect(at, `${p.name} is below the previous pattern`).toBeGreaterThanOrEqual(last);
      last = at;
    }
  });

  it("agree with the belt ladder on their belt colour", () => {
    for (const p of patterns) {
      expect(p.belt, p.name).toBe(beltOfRank(p.rank as RankId).name);
    }
  });

  it("carry a count, a period and a meaning", () => {
    for (const p of patterns) {
      expect(p.movementCount, p.name).toBeGreaterThan(0);
      expect(p.period.length, p.name).toBeGreaterThan(0);
      expect(p.meaning.length, p.name).toBeGreaterThan(10);
    }
  });

  it("have a verified demonstration video", () => {
    for (const p of patterns) {
      const [v] = p.videos;
      expect(v, `${p.name} has no video`).toBeDefined();
      expect(v?.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v?.url).toBe(`https://www.youtube.com/watch?v=${v?.id}`);
      expect(v?.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("cite Wikipedia, with licence and revision, wherever a namesake is shown", () => {
    for (const p of patterns) {
      if (p.name === "Chon-Ji") {
        // A concept, not a person: there is no article to excerpt.
        expect(p.namesake).toBeNull();
        continue;
      }
      const n = p.namesake;
      expect(n, `${p.name} namesake`).not.toBeNull();
      expect(n?.url).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
      expect(n?.historyUrl).toContain("action=history");
      expect(n?.license).toBe("CC BY-SA 4.0");
      expect(n?.revision).toMatch(/^\d+$/);
      expect(n?.excerpt.length).toBeGreaterThan(30);
    }
  });
});

describe("former patterns", () => {
  it("keeps Ko-Dang out of the 24 but reachable", () => {
    expect(formerPatterns.map((p) => p.name)).toEqual(["Ko-Dang"]);
    expect(patterns.some((p) => p.name === "Ko-Dang")).toBe(false);
    expect(allSlugs()).toContain("ko-dang");
    expect(bySlug("ko-dang")?.status).toBe("former");
  });
});

describe("movements", () => {
  it("are empty until supplied, so the app never shows invented sequences", () => {
    for (const p of patterns) expect(p.movements, p.name).toEqual([]);
  });
});

describe("grouping and belts", () => {
  it("groups every pattern exactly once", () => {
    expect(groupedByRank().flatMap((g) => g.items)).toHaveLength(24);
  });

  it("puts every rank on exactly one belt", () => {
    const seen = BELTS.flatMap((b) => b.ranks);
    expect([...seen].sort()).toEqual([...RANKS].sort());
  });

  it("reads a belt from a rank label", () => {
    expect(beltOfLabel("Yellow Tip / 9th Gup")?.id).toBe("yellow");
    expect(beltOfLabel("3rd dan")?.id).toBe("black");
    expect(beltOfLabel("nonsense")).toBeUndefined();
  });
});

describe("source register", () => {
  it("lists https sources with a licence and a stated use", () => {
    expect(sources.sources.length).toBeGreaterThan(0);
    for (const s of sources.sources) {
      expect(s.url, s.id).toMatch(/^https:\/\//);
      expect(s.license.length, s.id).toBeGreaterThan(0);
      expect(s.usedFor.length, s.id).toBeGreaterThan(20);
    }
  });

  it("states the known discrepancies instead of hiding them", () => {
    expect(sources.discrepancies.join(" ")).toContain("Tong-Il");
  });
});
