# Marketing assets

Publish-ready screenshots of **Blue Cottage Mini: A Tour of ITF Taekwon-Do**,
captured from the production build with `node tools/capture_screenshots.mjs`
(see the main README). Re-run it after any visual change.

Desktop images are 1440 px wide at 2x (2880 px). Phone images are 390 px wide at
3x (1170 px) using real device emulation.

| File | Use it for | Suggested caption |
| --- | --- | --- |
| `og-card-1200x630.png` | Link previews, social cards | The shipped Open Graph card |
| `desktop-01-home.png` | Hero image, store listing | Walk the 24 patterns, white belt to 6th degree |
| `desktop-02-agents.png` | Feature graphic | One Master Instructor, 6 belt agents, 24 pattern agents |
| `desktop-03-pattern-chon-ji.png` | Feature graphic | Every pattern: meaning, video, and where each fact came from |
| `desktop-04-pattern-yul-gok.png` | Feature graphic (shows the cited Wikipedia namesake) | Sources shown, licences respected |
| `desktop-05-belt-yellow.png` | Secondary | A belt agent and its patterns |
| `desktop-06-quiz.png` | Secondary | Quiz yourself on counts, ranks, belts and history |
| `desktop-07-sources.png` | Trust and credibility | Every source, licence and known discrepancy |
| `desktop-08-about.png` | Credibility | Directed by a TITF-registered 7th degree Master Instructor |
| `mobile-01-home.png` | App listing, social | Mobile first |
| `mobile-02-agents.png` | App listing | The swarm in your pocket |
| `mobile-03-pattern-chon-ji.png` | App listing | A pattern, from the phone |
| `mobile-04-quiz.png` | App listing | Quick quizzes |

## Before you publish

- The pattern videos in the screenshots are third-party (ITFtuls on YouTube).
  The poster frames show a performer. If an image is used in paid marketing,
  consider a version without the video poster, or get the uploader's permission.
- The screenshots show the **Sign in** button because Firebase is configured in
  the capture environment. Capture without it by building with no
  `NEXT_PUBLIC_FIREBASE_*` variables if you want a button-free header.
- Credential wording ("7th Degree, International Master Instructor") is taken from
  the [TITF Black Belt Registry](https://dafydhaase.wixsite.com/titf/verify-ranks).
