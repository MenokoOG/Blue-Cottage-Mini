/**
 * The agent swarm: one Master Instructor, a belt agent per colour family, and
 * a pattern agent for each of the 24 patterns.
 *
 * Agents are data, not processes. Each one is a scope (which corpus chunks it
 * may read) plus a persona (how it speaks). A question is routed to a lead
 * agent, any other agents it names are consulted, and a single grounded model
 * call answers from the union of their scopes. That keeps the swarm legible
 * and cheap: one paid call per question, however many agents are convened.
 */

export type AgentKind = "master" | "belt" | "tul";

export interface Agent {
  /** "master", "belt-yellow" or "tul-chon-ji". */
  readonly id: string;
  readonly kind: AgentKind;
  readonly name: string;
  /** One line shown under the name on the roster. */
  readonly role: string;
  /** Id of the agent this one reports to; null for the Master. */
  readonly parent: string | null;
  /** Ids of the agents that report to this one. */
  readonly children: readonly string[];
  /** Corpus tag this agent reads, e.g. "tul:chon-ji". The Master reads all. */
  readonly tag: string;
  /** How the agent speaks and what it must not do. */
  readonly persona: string;
}

/** Who answers a question and who was consulted on the way. */
export interface Route {
  readonly lead: Agent;
  readonly consulted: readonly Agent[];
  /** Plain-language account of why, shown to the student. */
  readonly reason: string;
}
