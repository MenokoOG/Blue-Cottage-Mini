# Blue Cottage Mini: A Tour of ITF Taekwon-Do

A mobile-first Next.js app that tours the 24 ITF (Chang-Hon) patterns. A Master
Instructor leads a swarm of 6 belt agents and 24 pattern agents; each pattern
has its meaning, namesake, a demonstration video and a quiz, and **every fact
carries its source and licence**. Directed by Master Lawrence Jefferson, 7th
Degree, International Master Instructor ([TITF registry](https://dafydhaase.wixsite.com/titf/verify-ranks)).

> **STATUS: PROTOTYPE (declared spike).** Runs locally; not hardened for
> student handoff. See [CHANGELOG.md](CHANGELOG.md) for what exists and
> [Known limits](#known-limits) for what does not.

> **Formerly "ITF Patterns Trainer".** The handbook-derived pattern and
> syllabus data were removed in 0.2.0 and replaced with open, cited sources.

---

## Quick start

```bash
git clone https://github.com/MenokoOG/itf-patterns-trainer.git
cd itf-patterns-trainer   # repository name unchanged
npm ci
npm run dev
```

Open <http://localhost:3000>.

**The app runs with no API keys at all.** Sign-in hides itself, progress goes
to `localStorage`, and the coach returns a clear 503. To enable the optional
features, see [Configuration](#configuration).

---

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | `>=20.9.0` | Developed and verified on **24.19.0** (see `.nvmrc`) |
| npm | `>=10.0.0` | npm 11.x recommended |

`engine-strict=true` is set in `.npmrc`, so an unsupported Node version fails
the install immediately with a clear message instead of a confusing build error.

Using [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 24.19.0
```

---

## Install

Use `npm ci`, it installs the exact tree recorded in `package-lock.json` and
is the only supported install path:

```bash
npm ci
```

Use `npm install` **only** when you intend to change dependencies; it may
update the lockfile, which must then be committed.

Direct dependencies are pinned to exact versions (no `^`) and the lockfile is
committed, so every clone resolves to a byte-identical tree.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on <http://localhost:3000> |
| `npm run build` | Production build |
| `npm start` | Serve the production build (run `build` first) |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm run lint` | ESLint flat config, non-interactive |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm test` | Vitest, unit tests for the pure logic |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:rules` | Executes `firestore.rules` against the Firestore emulator (needs Java + Firebase CLI; not in CI) |
| `npm run verify` | `typecheck` + `lint` + `test` + `build`, run before pushing |

To use a different port:

```bash
npm run dev -- -p 3001
```

---

## Configuration

All configuration is via environment variables. Copy the template and fill in
what you need:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored, **never commit it**. Restart the dev server after
editing it.

### Variables

| Variable | Required | Enables | Notes |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | No | The `/api/coach` RAG coach | Server-side only, never sent to the browser. Without it the coach returns HTTP 503. `OPEN_AI_KEY` is accepted as an alias, that is the name the Netlify environment uses. |
| `OPENAI_MODEL` | No |, | Defaults to `gpt-5-mini`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Google sign-in + cloud progress | Client-side. `NEXT_PUBLIC_*` values are embedded in the browser bundle, expected for Firebase web config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Google sign-in + cloud progress | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | Google sign-in + cloud progress | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Google sign-in + cloud progress | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Google sign-in + cloud progress | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | Google sign-in + cloud progress | |

Firebase activates only when `API_KEY`, `PROJECT_ID`, and `APP_ID` are all
present; otherwise every Firebase export is `null` and progress falls back to
`localStorage`.

### Getting an OpenAI key

1. Open the [OpenAI API keys page](https://platform.openai.com/api-keys).
2. Create a secret key for the project you want billed.
3. Put it in `.env.local` as `OPENAI_API_KEY=...`.

The coach is metered per question, so the project needs a positive credit
balance. If it runs dry the endpoint returns 503 with a message telling the
student to contact their instructor, see `isQuotaExhausted` in
`src/lib/coachErrors.ts`.

### Firebase setup (one-time, optional)

1. Create a project at the [Firebase console](https://console.firebase.google.com/).
2. **Authentication** → enable the **Google** provider.
3. **Firestore** → create a database.
4. **Project settings → Your apps → Web app** → copy the config values into
   the `NEXT_PUBLIC_FIREBASE_*` vars above.
5. Firestore rules live in [`firestore.rules`](firestore.rules), do not write
   them by hand in the console, or the next deploy will overwrite your edit.
   They scope `users/{uid}` to its owner, deny `list` and `delete`, validate the
   document down to a `progress` map and a `rank` from the 16 known ranks, and
   deny everything else. Deploy them with:

   ```bash
   firebase deploy --only firestore:rules --dry-run   # check first
   firebase deploy --only firestore:rules
   ```

   The rank list is duplicated in the rules because rules cannot import JSON;
   `npm test` fails if it drifts from `src/lib/rank.ts`.

---

## Verifying your setup

```bash
npm run verify
```

Then, with the dev server running:

```bash
curl -i -X POST http://localhost:3000/api/coach -H "Content-Type: application/json" -d "{\"question\":\"How many movements are in Chon-Ji?\"}"
```

- **503** with `"Coach is not configured"` → no `OPENAI_API_KEY` (expected default).
- **401** with `"Sign in to ask the coach."` → the key is set, but the coach requires a verified Firebase ID token. Send one as `-H "Authorization: Bearer <ID token>"`.
- **429** → more than 20 questions in 5 minutes from one account.
- **200** with an `answer` and `sources` → the coach is live.

---

## Architecture

```
src/
  app/
    page.tsx                  home: Master Instructor card, patterns by belt
    patterns/[slug]/page.tsx  one pattern: meaning, video, cited namesake
    belts/[id]/page.tsx       one belt agent and its patterns
    agents/page.tsx           the swarm, with a free live route preview
    quiz/[slug]/page.tsx      quiz built from the cited facts
    progress/page.tsx         student progress dashboard
    coach/page.tsx            ask the agents (chat)
    sources/page.tsx          every source, licence and discrepancy
    about/page.tsx            instructor credential and how it is made
    opengraph-image.tsx       link-preview card
    api/coach/route.ts        routed, grounded generation (server-only)
  components/                 VideoEmbed, NamesakePanel, RoutePreview, CoachChat,
                              Quiz, MovementStepper, ProgressDashboard, ...
  data/
    teul.json                 the 24 patterns (+ Ko-Dang), generated, cited
    sources.json              the source register and known discrepancies
    movements.json            move-by-move text; EMPTY until the instructor supplies it
  lib/
    agents/                   registry (31 agents), router, prompt builder
    belts.ts                  the six belt colour families and their ranks
    patterns.ts               pattern lookup (teul.json + movements.json)
    rank.ts                   16-rank vocabulary, shared with firestore.rules
    corpus.ts                 what the agents may answer from, one source per chunk
    retrieval.ts              TF-IDF retrieval, optionally scoped to an agent
    quizBuilder.ts            pure quiz generation
    ...                       auth, progress, rate limit, retry, error mapping
tools/build_open_data.mjs     rebuilds teul.json from Wikipedia + YouTube oEmbed
tools/capture_screenshots.mjs marketing screenshots via Chrome DevTools
marketing/screenshots/        publish-ready images (see marketing/README.md)
```

### The agent swarm

```
Master Instructor
  |- White / Yellow / Green / Blue / Red / Black belt agents   (6)
  '- one pattern agent per pattern, under its belt             (24)
```

Agents are data, not processes: each is a scope (which corpus chunks it may
read) plus a persona. `lib/agents/router.ts` routes a question
deterministically (a named pattern goes to that pattern's agent, two or more
make the Master lead and consult each, a belt or rank goes to the belt agent),
so routing is free and the Agents page previews it live. `/api/coach` then
makes **one** model call over the union of the convened agents' scopes, so a
swarm answer costs the same as a single one. Every persona forbids inventing
movements, and every answer lists the sources of the excerpts it used.

### Where the content comes from

| What | Source | Licence |
| --- | --- | --- |
| The 24 patterns, periods, history | [Wikipedia: Teul](https://en.wikipedia.org/wiki/Teul) | CC BY-SA 4.0 |
| Namesake excerpts | Wikipedia articles, fetched with revision id | CC BY-SA 4.0 |
| Counts, ranks (cross-checked) | [itftaekwondo.com/patterns](https://itftaekwondo.com/patterns/) | facts only, paraphrased |
| Videos | [ITFtuls on YouTube](https://www.youtube.com/channel/UCIK4F11SJr7OTpBeSa1-JHA), embedded not copied | uploader's copyright |

The full register is on `/sources`. Regenerate the data with
`node tools/build_open_data.mjs`; it re-fetches every excerpt and re-verifies
every video through YouTube's oEmbed endpoint.

**Move-by-move sequences are deliberately not included.** No free-licensed
source exists, and the published sequences are copyrighted. To add your own,
put an array of `{ "number": 1, "text": "...", "note": "..." }` under a
pattern id in `src/data/movements.json`; the stepper, the quiz and the agents
pick it up with no code change.

**Conventions:** one responsibility per file; strict TypeScript everywhere
(`strict` plus `noUncheckedIndexedAccess`); every external call has an explicit
timeout, and the coach's one paid call retries transient failures only inside its
25s budget; failures degrade to local state rather than throwing
into the UI.

**RAG design:** retrieval is deterministic and offline (lexical TF-IDF over
per-pattern chunks), so it can be swapped for embeddings later without
changing callers. Generation is OpenAI, grounded strictly on retrieved chunks,
within a 25s total budget (up to 3 attempts), with structured error JSON. The
coach needs a signed-in account and allows 20 questions per 5 minutes per account.

**Marketing screenshots:** with the app running (`npx next start -p 3100`),
`node tools/capture_screenshots.mjs` rewrites `marketing/screenshots/`.

---

## Troubleshooting

**`npm install` pulls different versions than a teammate, or a fresh clone
breaks.**
Use `npm ci`, not `npm install`. If the lockfile is missing or stale, run
`rm -rf node_modules package-lock.json && npm install`, then commit the
regenerated `package-lock.json`.

**`Unsupported engine` on install.**
Your Node is below 20.9.0. Install the version in `.nvmrc` (24.19.0).

**`npm run lint` opens an interactive prompt and hangs.**
Fixed, the project now uses an ESLint flat config (`eslint.config.mjs`) and
runs `eslint .` directly. The old `next lint` prompted for setup and hung CI.
If you still see this, you are on a stale checkout.

**Coach always returns 503.**
`OPENAI_API_KEY` (or `OPEN_AI_KEY`) is unset, or `.env.local` was added after
the server started. Restart the dev server. A 503 that mentions a usage
allowance is a different problem: the OpenAI project is out of credit.

**Sign-in button does not appear.**
Expected when the Firebase vars are absent. Add all of `API_KEY`,
`PROJECT_ID`, and `APP_ID` to turn it on.

**Port 3000 is already in use.**
`npm run dev -- -p 3001`.

**Stale build artifacts.**
`rm -rf .next && npm run dev`.

---

## Known limits

- **Prototype, not production.** No service worker / offline support.
- **Partial test coverage.** Vitest covers the pure logic, progress merging,
  the rank join, the rank vocabulary shared with `firestore.rules`, and
  `npm run test:rules` executes the rules themselves against the Firestore
  emulator. There are still no component or end-to-end tests. The rules suite
  needs Java and the Firebase CLI, so it is deliberately outside `npm test`
  and does not run in CI; run it by hand when you touch `firestore.rules`.
- **TypeScript majors are pinned.** `typescript` is held at 6.x and Dependabot
  is told to skip its majors, because `typescript-eslint` declares
  `typescript: ">=4.8.4 <6.1.0"` and no release yet accepts TypeScript 7. A
  grouped bump to 7.0.2 produced a lockfile `npm ci` refused to install, which
  broke CI and the Netlify deploy. Lift the pin when typescript-eslint
  supports it.
- **Install scripts are denied by default.** The `allowScripts` field in
  `package.json` explicitly denies the install scripts of `@firebase/util`,
  `@google/genai`, and `protobufjs`. All three were reviewed and are no-ops
  for this project: `@firebase/util` only acts on the `FIREBASE_WEBAPP_CONFIG`
  env var (unset here), `protobufjs` only emits a version-scheme warning, and
  `@google/genai` is a literal `echo`.
- **No move-by-move text, no rank syllabus.** The agents answer from open facts only: meanings, namesakes, periods, counts and belts. The grading requirements for each rank (stances, techniques, theory) are not in the app.
- **Counts and belts are cross-checked, not free-licensed.** Public sources disagree in places; see the discrepancies on `/sources`.
- **Videos are third-party.** They are embedded through YouTube, not hosted, so one can disappear; `tools/build_open_data.mjs` re-verifies them.
- **The rate limiter lives in process memory.** It resets on cold start and is not shared across serverless instances, so it slows one account and is not a hard cap.
- Quiz distractors are drawn from the other patterns and the rank and belt lists.
- **Rank is self-declared.** A student picks their own rank; nothing verifies
  it against an instructor. `practiced` counts reaching the last movement in
  the stepper, which is not the same as having practised well, and the
  dashboard tracks patterns only, stances, sparring, self-defense and theory
  are shown as reference and are not measured.
- `saveProgress` reads the whole user document and writes the whole map back,
  so a save racing the sign-in merge can clobber. Dot-path `updateDoc` would
  remove the read-modify-write.

---

## Contributing

1. Branch from `main`.
2. `npm run verify` must pass before you push. CI runs the same steps on
   every PR via `npm ci`.
3. If you change dependencies, commit the updated `package-lock.json` in the
   same commit.
4. Update [CHANGELOG.md](CHANGELOG.md), the project follows
   [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semver.

## License

MIT. See [`LICENSE`](LICENSE).
