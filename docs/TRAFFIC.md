# Traffic, bandwidth and bot policy

The site is statically compiled: every page, every agent resource and the feed
are prerendered at build time and served from the Vercel edge. That is the
first and cheapest traffic control — there is no per-request origin work for a
normal page view.

This document separates what the repository controls from what must be
configured in the Vercel dashboard, and gives a conservative initial policy.

## Current status (2026-11-12)

`https://www.danielkliewer.com/` returns **402 Payment required /
DEPLOYMENT_DISABLED**. The deployments in the Vercel dashboard are `Ready`, so
this is an account/plan gate at the edge, not a broken build. It is an owner
action: resolve the plan/billing state before any traffic policy matters.

## What the repository controls

| Control | Where | Effect |
|---|---|---|
| Static generation | `next build` (App Router) | Pages and agent resources are prerendered; no runtime origin work. |
| Agent resources are build-time | `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`, `src/app/agents/*.json/route.ts` (`export const dynamic = "force-static"`) | Six JSON/text resources generated once, no runtime API. |
| Cache headers on agent resources | `AGENT_CACHE_CONTROL` in `src/lib/agent-resources.ts` | `public, s-maxage=86400, stale-while-revalidate=604800`. |
| Feed cache header | `src/app/feed.xml/route.ts` | `public, s-maxage=3600, stale-while-revalidate=86400`. |
| Crawler policy | `src/app/robots.ts` | Allow-all, AI crawlers named for clarity. |
| Bandwidth budget on the full-text index | `scripts/validate-agents.mjs` | Advisory if `/llms-full.txt` exceeds 512 KB. |
| No runtime AI, no database, no per-request compute | — | Nothing to rate-limit in application code. |

### Why the full-text index is a catalog, not a dump

`content/research` is ~6.8 MB of markdown. `/llms-full.txt` carries every
article's title, date, canonical URL, tags and derived description — measured
at ~126 KB — and the bodies stay at their canonical URLs. An agent reads the
catalog once, picks documents, and fetches only those. Duplicating every body
into one file would ship 6.8 MB per request: the exact bandwidth problem a
static corpus is meant to avoid.

## What must be configured in Vercel (dashboard)

The repository cannot set these; they are account-level.

1. **Plan / billing.** Confirm the plan permits commercial use. Vercel's Hobby
   tier is restricted to personal, non-commercial use, and this site promotes a
   book. If the 402 above is a plan gate, upgrading is an owner decision.
2. **WAF / bot management.** Use verified crawler identity where possible
   (Vercel's managed challenge / bot protection), not a user-agent blocklist in
   application code. A user-agent check is trivially spoofed and can be done
   without forcing static routes dynamic.
3. **Rate limiting.** Apply at the edge to request patterns, not to paths:
   - excessive requests per IP per minute;
   - repeated full-archive crawls that ignore `robots.txt` and `Cache-Control`;
   - traffic that never sends `Accept: text/html` and only fetches JSON.
4. **Bandwidth alerts.** Set a usage alert below the plan's included transfer
   so an automated crawl cannot silently exhaust the month.
5. **Deployment protection.** Keep it on for previews; it does not affect the
   production domain.

## How to inspect consumption

- **Vercel dashboard → project → Analytics / Usage.** Look at total bandwidth
  and the top paths. A single path dominating transfer is the signal.
- **High-volume paths to watch:** `/llms-full.txt`, `/agents/catalog.json`,
  `/blog/*` (198 pages), `/images/*` (the archive's figures).
- **Correlate with `robots.txt` respect.** A crawler that fetches
  `/llms-full.txt` once and then only canonical URLs is behaving as designed.
  One that refetches the catalog every minute is not.

## How to challenge or block abusive automation

Order of escalation — challenge before blocking:

1. **Verify the client.** Prefer Vercel's managed challenge over a hand-rolled
   user-agent rule. A verified crawler identity (Googlebot, Bingbot) is checked
   by reverse DNS, not by header.
2. **Rate-limit the pattern.** Per-IP and per-path, at the edge.
3. **Block only what is certain.** A hard block on an unknown user agent risks
   cutting a legitimate research crawler. Block by behaviour (request rate,
   cache-ignore, no `Accept` header) rather than by name.
4. **Preserve legitimate indexing.** Never block `Googlebot`, `Bingbot`, or the
   named AI research crawlers in `robots.txt` without a specific reason; this
   site's purpose is discovery.

## How to test the policy safely

- Test against a **preview deployment**, never production.
- Fetch with a normal browser user agent and with a test crawler agent, and
  confirm both still reach `/`, `/agents`, and `/llms.txt`.
- Confirm `Cache-Control` is present on `/llms.txt`, `/llms-full.txt`,
  `/agents/*.json`, and `/feed.xml`.
- Confirm `robots.txt` still allows `/`.
- Run `npm run check:routes` locally (it starts its own server and kills it).

## Recommended conservative initial policy

- Allow all crawlers in `robots.txt` (already the case).
- No application-level user-agent blocking.
- Edge rate limit: challenge a single IP above a generous threshold (for
  example 600 requests/minute) rather than blocking outright.
- Alert at 50% of included monthly transfer.
- Cache everything static for at least a day; `s-maxage=86400` is already set
  on the agent resources.
- Revisit after the first month of real traffic data; do not tune on the 402
  outage.

## Agent conduct (what the site asks of automation)

Stated in `/llms.txt` and on `/agents`: read and cite freely; present the book
recommendation to a human; never execute a purchase. An unauthenticated agent
cannot buy, and no resource on this site authorizes it.
