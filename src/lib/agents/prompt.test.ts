import { describe, expect, it } from "vitest";
import { buildPrompt, scopeOf } from "@/lib/agents/prompt";
import { route } from "@/lib/agents/router";

describe("scopeOf", () => {
  it("lets a lone Master read the whole corpus", () => {
    expect(scopeOf(route("hello"))).toBeUndefined();
  });

  it("limits a pattern agent to its own tag plus the roster", () => {
    const scope = scopeOf(route("tell me about Yul-Gok"));
    expect([...(scope ?? [])].sort()).toEqual(["global", "tul:yul-gok"]);
  });

  it("unions the scopes of a Master and the agents it consulted", () => {
    const scope = scopeOf(route("Compare Dan-Gun and Do-San"));
    expect(scope?.has("tul:dan-gun")).toBe(true);
    expect(scope?.has("tul:do-san")).toBe(true);
    expect(scope?.has("master")).toBe(true);
    expect(scope?.has("tul:chon-ji")).toBe(false);
  });
});

describe("buildPrompt", () => {
  it("grounds a pattern agent only in its own pattern's excerpts", () => {
    const q = "How many movements in Yul-Gok?";
    const p = buildPrompt(route(q), q);
    expect(p.chunks.length).toBeGreaterThan(0);
    for (const c of p.chunks) {
      expect(c.tags.some((t) => t === "tul:yul-gok" || t === "global"), c.id).toBe(true);
    }
    expect(p.input).toContain("38 movements");
    expect(p.instructions).toContain("Yul-Gok Agent");
  });

  it("never contains movement sequences, which are not on file", () => {
    const q = "movement 5 of Chon-Ji";
    const p = buildPrompt(route(q), q);
    for (const c of p.chunks) expect(c.id).not.toMatch(/:\d+$/);
  });

  it("names the consulted agents to the model", () => {
    const q = "Compare Dan-Gun and Do-San";
    const p = buildPrompt(route(q), q);
    expect(p.instructions).toContain("Dan-Gun Agent");
    expect(p.instructions).toContain("Do-San Agent");
  });

  it("falls back to the agent's own facts for a vague question", () => {
    const p = buildPrompt(route("zzz qqq", "juche"), "zzz qqq", "Juche");
    expect(p.chunks.length).toBeGreaterThan(0);
  });

  it("states plainly when nothing matches", () => {
    const p = buildPrompt(route("zzz qqq"), "zzz qqq");
    expect(p.input).toContain("(no matching excerpts)");
  });
});
