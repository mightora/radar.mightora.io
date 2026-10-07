---
name: agent-optimization
description: 'Use when improving AI-agent discoverability, answer-engine optimization (AEO), machine-readable product information, llms.txt, or agent-friendly documentation for this static Technology Radar site. Not for optimizing the coding agent, automating third-party agents, or search ranking metadata alone.'
---

# Agent optimization

Help AI assistants and other automated readers find accurate, public information about the Technology Radar Live Editor. Discovery is not guaranteed by any particular file format or crawler.

## Workflow

1. Read `AGENTS.md`, `architecture/features/build-plan.md` (especially S01 and its decisions), and `architecture/solution-pattern.md`. Check the actual app and guide before describing their features; do not present planned features as released.
2. Identify questions an agent should answer: what the tool does, how to start, what the CSV columns and radar terms mean, how sharing works, and what happens to user data. Use the public guide as the canonical source of explanatory text. Never expose user CSV or private link fragments to crawlers.
3. Make public, crawlable HTML useful without JavaScript: descriptive headings, concise definitions, direct FAQ answers, and links to the app and guide. Keep factual claims consistent with the working product and `public/config/radar-definition.yaml`.
4. If S01 calls for it, add a short root `llms.txt` that links to the canonical app, guide, and relevant FAQ sections; avoid duplicating the whole guide. Treat it as an optional discovery aid, not a standard that guarantees ingestion. Add structured data only when it accurately reflects visible content; use the site's SEO skill for shared metadata and sitemap work.
5. Keep everything compatible with static GitHub Pages: no agent-only hidden content, fabricated endorsements, third-party trackers, credential exposure, backend, or write-capable agent endpoints. Avoid promising that AI platforms will cite or index the site.
6. Update `scripts/build.mjs` for any new public files. Verify the built artifact contains them, links resolve, structured data parses when present, and agent-facing claims match visible text. Run the applicable checks (`npm run check`, `npm test`, `npm run build`, `npm run test:e2e`); record results and remaining live-host checks in the baseline and build plan. Do not deploy without authorization.

## Output

Report changed public URLs, source-of-truth references, checks performed, and anything that still needs a deployed-site check. Do not mark S01 verified or released based solely on local files.