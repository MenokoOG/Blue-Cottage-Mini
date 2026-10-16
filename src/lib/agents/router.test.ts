import { describe, expect, it } from "vitest";
import { MAX_CONSULTED, route } from "@/lib/agents/router";

describe("route", () => {
  it("sends a question about one pattern to that pattern's agent", () => {
    const r = route("How many movements does Yul-Gok have?");
    expect(r.lead.id).toBe("tul-yul-gok");
    expect(r.consulted).toEqual([]);
  });

  it("matches hyphen, space and no separator, any case", () => {
    for (const q of ["tell me about Chon-Ji", "tell me about chon ji", "tell me about CHONJI"]) {
      expect(route(q).lead.id, q).toBe("tul-chon-ji");
    }
  });

  it("matches common alternate spellings", () => {
    expect(route("what is Chung-Mu?").lead.id).toBe("tul-choong-moo");
    expect(route("who was Gyebaek").lead.id).toBe("tul-ge-baek");
  });

  it("does not match a pattern name inside another word", () => {
    expect(route("how do sanitary rules work?").lead.id).toBe("master");
    expect(route("any dosage advice").lead.id).toBe("master");
  });

  it("makes the Master lead and consults each named pattern when several are named", () => {
    const r = route("Compare Dan-Gun and Do-San");
    expect(r.lead.id).toBe("master");
    expect(r.consulted.map((a) => a.id)).toEqual(["tul-dan-gun", "tul-do-san"]);
  });

  it("caps how many agents are consulted", () => {
    const r = route("Compare Chon-Ji, Dan-Gun, Do-San, Won-Hyo and Yul-Gok");
    expect(r.lead.id).toBe("master");
    expect(r.consulted).toHaveLength(MAX_CONSULTED);
    expect(r.reason).toContain("not consulted");
  });

  it("consults the belt agent when a pattern and a belt are both named", () => {
    const r = route("Is Toi-Gye a red belt pattern?");
    expect(r.lead.id).toBe("tul-toi-gye");
    expect(r.consulted.map((a) => a.id)).toEqual(["belt-red"]);
  });

  it("routes a belt colour to that belt's agent", () => {
    expect(route("what do I learn at yellow belt?").lead.id).toBe("belt-yellow");
  });

  it("routes a rank to the belt that holds it", () => {
    expect(route("what comes at 7th gup?").lead.id).toBe("belt-green");
    expect(route("what comes at 4th gup?").lead.id).toBe("belt-blue");
    expect(route("requirements for 3rd dan").lead.id).toBe("belt-black");
    expect(route("what is 1st gup").lead.id).toBe("belt-red");
  });

  it("does not treat colour words alone as a belt", () => {
    expect(route("why is the sky blue and the sea red").lead.id).toBe("master");
  });

  it("falls back to the page the student is on, then a chosen agent, then the Master", () => {
    expect(route("what is the history of this?", "do-san").lead.id).toBe("tul-do-san");
    expect(route("what is the history of this?", undefined, "belt-green").lead.id).toBe(
      "belt-green",
    );
    expect(route("what is the history of this?").lead.id).toBe("master");
  });

  it("lets a named pattern beat the page focus", () => {
    expect(route("what about Sam-Il?", "chon-ji").lead.id).toBe("tul-sam-il");
  });

  it("always explains itself", () => {
    expect(route("hello").reason.length).toBeGreaterThan(10);
  });
});
