# Case study: Blue Cottage Mini

A prototype study guide to the 24 ITF Taekwon-Do patterns, built as a routed, source-cited question-answering system. This page covers the problem, the constraints, the design, what broke, what changed, and the evidence. Every number has a source in the table at the end. Where no number exists, the page says so.

Status: **prototype (declared spike).** It runs locally and on Netlify. It isn't hardened for student handoff.

## Problem

Students learning the 24 ITF patterns need quick, correct answers about each pattern: its meaning, namesake, period, belt, rank and movement count. A general chatbot answers fluently and sometimes wrongly. In a training app, a wrong technique does harm. The goal was a coach that answers only from sources a reader can check, and says so when it can't.

## Constraints

- **Copyright.** Move-by-move sequences are copyrighted and no free-licensed source exists. The app ships none (ADR 0002).
- **Cost.** Generation is the only metered part, and a class of students can exhaust a free tier fast (ADR 0004).
- **One developer, no ops team.** No always-on server, no database beyond Firebase, no secrets beyond one model key.
- **Source disagreement.** Public pattern listings disagree on some movement counts. The app publishes the disagreements instead of picking silently.

## Design

Full detail is in [ARCHITECTURE.md](ARCHITECTURE.md). In short:

- 31 agents built from data: a Master Instructor, 6 belt agents, 24 pattern agents. Each is a corpus scope plus a persona (ADR 0001).
- A deterministic router picks the lead and who is consulted. It makes no model call, so the UI previews the route for free.
- Retrieval is TF-IDF over a 57-chunk corpus. Each chunk carries its source, and every answer lists the sources of the excerpts it used (ADR 0002).
- One OpenAI call answers each question, however many agents were convened. Output is capped at 4000 tokens, with a 25 s total budget (ADR 0004, ADR 0005).
- Firebase sign-in gates the coach, the server verifies the ID token, and Firestore rules keep each student's progress private.

## What failed

Each item is from the commit log or `CHANGELOG.md`.

| Date | What went wrong | Source |
| --- | --- | --- |
| 2026-08-29 | The coach endpoint had no auth and no rate limit, and spent money on every call. Anyone who found it could drain the quota. | `CHANGELOG.md` (Security), `9a40e04` |
| until 2026-08-29 | Firestore ran on the console's default open rules. Any client, signed in or not, could read and write every document, with a hard expiry on 2026-09-26. Owner-scoped rules landed that day. | `CHANGELOG.md` (Security), `8076152` |
| 2026-08-29 | The pinned Gemini model was retired. The API answered 404 and the route turned every error into a generic 502 that hid the cause. | `9010df7` |
| 2026-08-29 | Transient 503s from the model API failed whole requests, because there was no retry. | `1c81e21` |
| 2026-08-29 | The Gemini free tier allowed 20 requests per day per model. One class used it up before lunch, and the message told students to come back tomorrow. | `CHANGELOG.md` (Changed), `d6e31b8` |
| 2026-08-29 | A grouped dependency bump to TypeScript 7.0.2 broke `npm ci` on every clean checkout. CI was red and Netlify couldn't install. | `da45c8a` |
| before 0.2.0 | `practiced` was pinned at 1 forever, because the save assigned instead of adding. | `CHANGELOG.md` (Changed) |
| before 0.2.0 | Signing in threw away progress made while signed out. | `CHANGELOG.md` (Fixed) |

## What I changed

- **Auth and rate limit.** The endpoint now requires a verified Firebase ID token and allows 20 questions per 5 minutes per account. Token checks use `jose` and Google's public keys, so no service-account private key is needed.
- **Firestore rules.** Rules now scope `users/{uid}` to its owner, deny list and delete, validate the document shape and rank, and deny everything else. They have their own emulator test (`npm run test:rules`), 12 tests per the `9010df7` commit message. I didn't re-run them for this page.
- **Error classes.** `coachErrors.ts` separates out-of-credit, overloaded, misconfigured and timeout, so each gets the right status and the right advice. 20 unit tests cover it.
- **Bounded retry.** `retry.ts` takes an injected clock and sleep, so the policy is tested without spending credit. It allows 3 attempts, backs off 500 ms then 1500 ms, and never runs past the 25 s deadline. 9 tests.
- **Model provider.** Moved from the Gemini free tier to OpenAI `gpt-5-mini` at low reasoning effort (ADR 0004).
- **Open, cited data.** Replaced the handbook-derived data with Wikipedia (with revision ids) and cross-checked facts, and published the known discrepancies on `/sources`.
- **Progress fixes.** `practiced` now adds. Sign-in folds local progress into the account with a per-field max, so a retry can't double-count.
- **Dependency pin.** TypeScript is held at 6.0.3, and Dependabot skips its majors until `typescript-eslint` supports 7.

## What it doesn't do

Stated plainly, so the page can be trusted:

- No human approval of answers at run time, and no audit log of questions or answers (ADR 0003).
- No guardrails, prompt-injection defence or evaluation of answers.
- No token or cost recording (ADR 0005).
- The agents don't call tools or each other. The "swarm" is routing plus one scoped prompt.
- Move-by-move text, the rank syllabus, component tests and end-to-end tests are absent.
- No AWS service is used.

## Evidence

Run on 2026-10-29 in a clean worktree of `origin/main` at commit `c8d68e4`, Node 24.19.0, npm 11.17.0.

| Check | Result | How to reproduce |
| --- | --- | --- |
| Unit tests | 9 files, 95 tests passed (vitest 5.0.4) | `npm test` |
| Lint | No findings | `npm run lint` |
| Typecheck | No errors | `npm run typecheck` |
| Production build | Not run for this page | `npm run build` |
| Firestore rules tests | Not run for this page (needs Java and the emulator) | `npm run test:rules` |

Tests per file: `coachErrors` 20, `patterns` 14, `router` 13, `rank` 10, `retry` 9, `mergeProgress` 9, `prompt` 8, `registry` 6, `quizBuilder` 6.

| Figure | Value | Source |
| --- | --- | --- |
| Agents | 31 (1 Master, 6 belt, 24 pattern) | `registry.ts`, `registry.test.ts` |
| Corpus chunks | 57 (24 facts, 23 namesakes, 6 belt overviews, 4 global or master) | counted from `src/data/teul.json` and `corpus.ts` on 2026-10-29 |
| Model calls per question | 1 | `route.ts` |
| Output cap | 4000 tokens | `route.ts` |
| Time budget, attempts, backoff | 25 s, 3 attempts, 500 ms then 1500 ms | `route.ts` |
| Rate limit | 20 questions per 5 minutes per account, in memory | `route.ts`, `rateLimit.ts` |
| Question length cap | 1000 characters | `route.ts` |
| Chunks per prompt | at most 8 | `prompt.ts` |
| Gemini token measurement | about 650 to 950 thinking tokens against about 100 to 130 answer tokens on one representative prompt | commit `9010df7` (Gemini, not the current model) |

**Cost:** no spend figure exists. The app doesn't record token usage, and I have not added an OpenAI billing export to the repository. Any cost number added here needs the export, its date range and the model name.

**Traces:** none exist. The app records no request traces, and the only logs are failure messages.

## What I'd build next

In this order, each as its own tested change:

1. Log `usage`, model, lead agent, consulted agents and chunk ids for every coach call, after deciding what to do with student question text (ADR 0003, ADR 0005).
2. A golden-question suite run against a stubbed model in CI, so routing and retrieval regressions fail the build.
3. A flag-and-review path for answers, with an instructor role.
4. A durable rate limiter and a daily call ceiling.
