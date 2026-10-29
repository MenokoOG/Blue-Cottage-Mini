# 3. Human sign-off and audit: what exists, what doesn't

Recorded: 2026-10-29.

## Status

Partly built. One human gate exists (the movement text data file). Run-time sign-off and audit records are **not built**. The "Proposed" section is a plan, not a feature.

## Context

The coach answers students about a martial art, and the project lead is the named instructor. A review of the code on 2026-10-29 looked for places where a person approves something, and for records of what the system did.

## What exists

- **Content gate by data file.** Move-by-move text can enter only through `src/data/movements.json`, which the instructor fills in. It's empty (`{}`), so nothing unreviewed ships. This is a manual gate, enforced by the absence of a source and the code review of any change to that file.
- **Source citation on every answer** (ADR 0002). A reader can check where the excerpts came from.
- **Access control.** Only signed-in users can ask the coach, with 20 questions per 5 minutes per account.
- **Persona rules.** Each agent is told to send students to a qualified instructor when the excerpts don't answer.

## What doesn't exist

- No approval step for answers, data regeneration or rank. Rank is chosen by the student, and `practiced` means "reached the last movement in the stepper".
- No audit record. The only logging is `console.error` for failures (`route.ts`, `progress.ts`, `AuthContext.tsx`). A successful question leaves no trace of who asked, what was asked, which agent led, or which sources were used.
- No stored feedback from students or the instructor on answer quality.
- No check that an answer stays inside its excerpts.

## Decision

1. Don't claim sign-off or audit in the README, the case study or any résumé wording. The accurate statement is "one manual content gate; no run-time approval; no audit log".
2. Treat the items below as the next design, to be built and tested before the docs say otherwise.

## Proposed (not built)

- **Answer log.** For each coach call, store uid, timestamp, question hash or text (privacy decision needed), lead and consulted agent ids, chunk ids used, model name, token usage, status code. The route already holds every one of these values. Where to store them (Firestore with owner-blind rules, or a log drain) is open.
- **Flag and review.** A student can flag an answer. The instructor reviews flagged answers and either marks the answer acceptable or fixes the corpus. This needs an instructor role, which Firestore rules and the auth layer don't have yet.
- **Regeneration review.** A pull request that changes `teul.json` already needs a diff read. A checklist in the PR template would make that gate explicit.
- **Golden questions.** A fixed set of questions with expected sources, run in CI against a stubbed model, so routing and retrieval regressions fail the build.

## Consequences

- The project can't yet show an approval trail. That is a gap against any standard that expects human review of AI output, and it's recorded in the gap list kept outside this repository.
- Adding the answer log changes privacy exposure (questions are student text). That needs its own decision before the code.
