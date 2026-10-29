# 4. Model and hosting: OpenAI, Firebase, Netlify

Recorded: 2026-10-29. Decided: 2026-08-29 (OpenAI switch, commit `396611f`, merged in PR #20).

## Status

Accepted. Built and running as a prototype. **No AWS service is used.**

## Context

The coach first generated with Google Gemini on a free tier. The history in `CHANGELOG.md` and the commit log shows what that cost:

- The free tier allowed 20 requests per day per model. The changelog says one class used that up before lunch, so the endpoint mostly served a "come back tomorrow" message (`d6e31b8`).
- A pinned model name was retired, and the API answered 404. The route turned every error into a generic 502, which took a debugging session to find (`9010df7`).
- Transient 503s from the API failed whole requests until retry was added (`1c81e21`).

## Decision

1. **Generation:** OpenAI Responses API, default model `gpt-5-mini`, overridable with `OPENAI_MODEL`. Reasoning effort `low`, `max_output_tokens` 4000. `maxRetries: 0` on the SDK, because `withRetry` owns the retry policy. Otherwise the defaults would multiply into nine upstream calls.
2. **Sign-in and progress:** Firebase Auth (Google) and Firestore, with rules in the repo. The server verifies ID tokens with `jose` against Google's public keys, so no service-account private key is needed.
3. **Hosting:** Netlify. Its synchronous function limit is 60 s, so the coach's 25 s budget stays the binding limit.
4. **CI:** GitHub Actions.
5. **Failure messages follow cause.** Out of credit, overloaded, misconfigured and timeout each return a different status and message (`coachErrors.ts`). A retry prompt that can never work is worse than "tell your instructor".

## Alternatives considered

- **Stay on Gemini's free tier.** Rejected after the quota and retired-model failures above.
- **Amazon Bedrock, Lambda, API Gateway.** Not evaluated in code and not used. The project has no AWS account wiring, no IaC and no AWS SDK dependency. If the project moves, this ADR would be superseded, and the new one should record the cost, latency and quality comparison with real measurements.
- **firebase-admin for token checks.** Rejected to avoid provisioning a service-account private key.

## Consequences

- The model and key are a single point of failure and of cost. The key lives only in the Netlify environment, server-side.
- Model names get retired. `OPENAI_MODEL` has to be kept in step wherever the app is deployed, and a 404 maps to "needs attention".
- The rate limiter is in memory per instance (see ADR 0005).
- Serverless hosting means cold starts reset the limiter and the module-level key cache.
- Dependency choices carry cost too. On 2026-08-29 a grouped Dependabot bump to TypeScript 7.0.2 broke `npm ci` because `typescript-eslint` accepted only `>=4.8.4 <6.1.0`. CI was red and Netlify couldn't install. TypeScript is now pinned at 6.0.3 (`da45c8a`).
