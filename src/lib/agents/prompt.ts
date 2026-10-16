import { baseline, retrieve, type Chunk } from "@/lib/retrieval";
import type { Route } from "@/lib/agents/types";

/**
 * Turns a routed question into the grounded prompt for one model call.
 *
 * Pure and offline: it decides which excerpts the swarm may see (the union of
 * the lead's and the consulted agents' scopes, plus the global roster) and
 * writes the instructions. The Master reads everything.
 */

export interface AgentPrompt {
  readonly instructions: string;
  readonly input: string;
  readonly chunks: readonly Chunk[];
}

/** Tags an agent set may read. A Master-led question sees the whole corpus. */
export function scopeOf(route: Route): ReadonlySet<string> | undefined {
  if (route.lead.kind === "master" && route.consulted.length === 0) return undefined;
  const tags = new Set<string>(["global"]);
  for (const a of [route.lead, ...route.consulted]) tags.add(a.tag);
  if (route.lead.kind === "master") tags.add("master");
  return tags;
}

export function buildPrompt(route: Route, question: string, focus?: string): AgentPrompt {
  const scope = scopeOf(route);
  const query = focus ? `${focus} ${question}` : question;
  let chunks = retrieve(query, 8, scope);
  if (chunks.length === 0 && scope) chunks = baseline(scope);

  const team =
    route.consulted.length > 0
      ? ` Agents consulted: ${route.consulted.map((a) => a.name).join(", ")}. ` +
        "Their knowledge is in the excerpts."
      : "";
  const context = chunks.map((c) => `[${c.id}] ${c.text}`).join("\n");

  return {
    instructions: `${route.lead.persona}${team}`,
    input: `Excerpts:\n${context || "(no matching excerpts)"}\n\nStudent question: ${question}`,
    chunks,
  };
}
