# 5. Cost: bound each call, gate the endpoint, and say what isn't measured

Recorded: 2026-10-29.

## Status

Controls are built. **Cost measurement is not built.** No spend figure for this project is recorded anywhere in the repository.

## Context

`/api/coach` is the only part of the app that costs money per use. Until commit `9a40e04` (2026-08-29) the endpoint had no auth and no rate limit, so anyone who found it could drain the model quota (`CHANGELOG.md`, Security).

## Decision

Controls in the code:

1. **One model call per question,** regardless of how many agents are convened (ADR 0001).
2. **Routing and retrieval are local and free.** Only generation is metered.
3. **Bounded output.** `max_output_tokens` is 4000 and reasoning effort is `low`. Reasoning tokens count against the output cap, and grounded recall over a few short excerpts needs little reasoning.
4. **Bounded input.** Questions are limited to 1000 characters. Retrieval returns at most 8 chunks.
5. **Sign-in required** (verified Firebase ID token) and **20 questions per 5 minutes per account**.
6. **Bounded time and retries.** A 25 s wall-clock budget, at most 3 attempts, and only for 5xx and dropped connections. Quota errors and 429s aren't retried.
7. **Truthful out-of-credit message.** The student is told the coach needs topping up, so nobody retries something that can't succeed.

## What the controls don't give you

- The limiter is in process memory, so it resets on cold start and doesn't span instances. It slows one account. It isn't a hard cap.
- Nothing stores token usage. The response carries `usage`, and the route logs it only when the answer is empty.
- No budget alert and no per-day ceiling in code. The only hard ceiling is the credit balance on the OpenAI project, which the app can't see.
- No cost per question or per student exists. A cost figure in any document must name its source (an OpenAI billing export with dates), because the repository has none.

One measurement exists from the Gemini period. Commit `9010df7` records that on a representative coach prompt with 8 retrieved chunks, that model spent about 650 to 950 thinking tokens for about 100 to 130 answer tokens. That was Gemini, not the current model, and it's the only token measurement in the history.

## Proposed (not built)

- Log `usage` and model name for every call (shares the answer log in ADR 0003).
- Cache answers to repeated questions on the same scope. Hit-rate unknown until questions are logged.
- A durable limiter (Firestore counter or Redis) if the app runs on more than one instance.
- A daily call ceiling that returns 503 before spend.
