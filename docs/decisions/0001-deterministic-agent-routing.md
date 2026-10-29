# 1. Route questions with a deterministic router, and keep agents as data

Recorded: 2026-10-29. Decided: 2026-10-16 (release 0.2.0, commit `e9124b0`).

## Status

Accepted. Built and tested.

## Context

The app has a Master Instructor, 6 belt agents and 24 pattern agents. A question can name one pattern, several patterns, a belt, a rank or nothing. Something has to decide who leads and who is consulted.

Two options were open: ask a model to pick the agent, or pick with code. A model router adds a paid call (or a slower first call) to every question, and its choice can't be tested without spending credit. The app also wanted to show the student the route before any paid call happens.

## Decision

1. Routing is regex matching in [`router.ts`](../../src/lib/agents/router.ts). It makes no model call.
2. Agents are data built from the pattern and belt lists ([`registry.ts`](../../src/lib/agents/registry.ts)). An agent is an id, a parent, a corpus tag and a persona string. Adding a pattern adds an agent with no code change.
3. A routed question makes one model call over the union of the convened agents' corpus scopes. Consulting three agents costs the same as asking one.
4. The Master consults at most 3 patterns (`MAX_CONSULTED`), so an answer stays focused.
5. Every route carries a `reason` string shown to the student.

## Alternatives considered

- **Model-based router.** Handles odd phrasing better. Costs a call per question, isn't free to preview, and needs live credit to test. Rejected for this corpus size.
- **One call per consulted agent, then merge.** Closer to a real multi-agent system. Multiplies cost by the number of agents. Rejected.

## Consequences

- Routing is free, instant and covered by 13 tests in `router.test.ts`.
- Misspelled or unusual names fall through to the next rule. The alias table covers 9 patterns with common spelling variants; anything else routes to the focus page, the chosen agent, or the Master.
- The agents don't act. They can't call tools or hand work to each other. This is a scoped-prompt design, and the docs and README shouldn't call it autonomous.
- If the corpus grows, retrieval is lexical TF-IDF and would be the first thing to replace. Callers wouldn't change.
