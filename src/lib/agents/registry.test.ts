import { describe, expect, it } from "vitest";
import { BELTS } from "@/lib/belts";
import { patterns } from "@/lib/patterns";
import {
  AGENTS,
  BELT_AGENTS,
  MASTER,
  TUL_AGENTS,
  agentById,
  tulAgent,
} from "@/lib/agents/registry";

describe("the swarm", () => {
  it("is one Master, six belt agents and 24 pattern agents", () => {
    expect(MASTER.kind).toBe("master");
    expect(BELT_AGENTS).toHaveLength(BELTS.length);
    expect(BELT_AGENTS).toHaveLength(6);
    expect(TUL_AGENTS).toHaveLength(24);
    expect(AGENTS).toHaveLength(31);
  });

  it("has unique ids and every reference resolves", () => {
    expect(new Set(AGENTS.map((a) => a.id)).size).toBe(AGENTS.length);
    for (const a of AGENTS) {
      if (a.parent) expect(agentById(a.parent), `${a.id} parent`).toBeDefined();
      for (const c of a.children) expect(agentById(c), `${a.id} child ${c}`).toBeDefined();
    }
  });

  it("forms a tree: Master over belts over patterns", () => {
    expect(MASTER.parent).toBeNull();
    expect(MASTER.children).toHaveLength(6);
    for (const b of BELT_AGENTS) expect(b.parent).toBe("master");
    for (const t of TUL_AGENTS) expect(agentById(t.parent ?? "")?.kind).toBe("belt");
  });

  it("gives every pattern to exactly one belt agent", () => {
    const owned = BELT_AGENTS.flatMap((b) => b.children);
    expect([...owned].sort()).toEqual(TUL_AGENTS.map((t) => t.id).sort());
  });

  it("names each pattern agent after its pattern and tags its scope", () => {
    for (const p of patterns) {
      const a = tulAgent(p.id);
      expect(a?.name).toBe(`${p.name} Agent`);
      expect(a?.tag).toBe(`tul:${p.id}`);
    }
  });

  it("carries the no-invention rules in every persona", () => {
    for (const a of AGENTS) {
      expect(a.persona, a.id).toContain("Answer ONLY from the excerpts");
      expect(a.persona, a.id).toContain("Never invent movements");
    }
  });
});
