---
name: search-engine-optimization
description: 'Use when improving SEO, search-engine indexing, crawlability, canonical URLs, titles, descriptions, social previews, structured data, robots.txt, or sitemaps for the static Technology Radar site. Not for analytics, paid search, or AI-agent-specific content alone.'
---

# Search engine optimization

Make the public app and guide understandable to search crawlers without changing the editor's behavior or collecting visitor data.

## Workflow

1. Read `AGENTS.md`, `architecture/features/build-plan.md` (S01 and D-01), and `architecture/solution-pattern.md`. Inspect `index.html`, the actual guide if it exists, `scripts/build.mjs`, and built output; do not assume planned pages have shipped.
2. Inventory indexable URLs and check that each has a distinct, descriptive title and meta description, a stable heading and useful static text, appropriate `lang` and robots directives, and a canonical URL. Use the approved root origin `https://radar.mightora.io/`; do not index per-user fragment URLs or fabricate guide URLs before the guide exists.
3. Add Open Graph/Twitter metadata and a real accessible preview image when required. Keep descriptions accurate to visible content; avoid keyword stuffing, hidden text, and claims about guaranteed rankings.
4. Add only relevant JSON-LD whose properties match visible app or guide content. In S01 this means `WebApplication` on the app and, once the guide exists, `HowTo`, `FAQPage`, and `BreadcrumbList` where the visible page supports them. Do not invent reviews, ratings, or unsupported rich-result eligibility.
5. Publish `robots.txt` and a sitemap with canonical public URLs, link to the sitemap from robots, and include any new root assets in `scripts/build.mjs`. Robots directives are crawl hints, not access controls. Coordinate FAQ wording and optional `llms.txt` with the agent-optimization skill.
6. Build and inspect `dist` for metadata, valid JSON-LD, resolved links/assets, and matching canonicals and sitemap URLs. Run `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` as applicable; record exact outcomes and pending deployed-site checks in the baseline and build plan. Search Console submission, live rich-result tests, and social previews require the deployed URL and user authorization where relevant.

## Output

Summarize indexable URLs, changes, verification evidence, and live-host limitations. Do not equate a local build with indexing, search visibility, or release.