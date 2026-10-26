import type { NextConfig } from "next";

/**
 * Legacy short-slug redirects.
 * Older post bodies link /blog/<short-slug> (no date prefix); the canonical
 * scheme is /blog/YYYY-MM-DD-slug. These redirects keep those in-body links —
 * and any old inbound links — working without editing post content.
 * The last two entries fix truncated/off-by-one slugs that were already
 * broken on the previous site (unambiguous unique near-matches).
 */
const LEGACY_SLUG_REDIRECTS: [string, string][] = [
  ["/blog/architecture-as-autonomy", "/blog/2026-03-28-architecture-as-autonomy"],
  ["/blog/autonomous-ai-agents-developer-portfolio", "/blog/2026-01-12-autonomous-ai-agents-developer-portfolio"],
  ["/blog/autonomous-architectures", "/blog/2026-01-03-autonomous-architectures"],
  ["/blog/building-this-blog", "/blog/2026-02-15-building-this-blog"],
  ["/blog/deerflow-2-building-sovereign-ai-agent-systems", "/blog/2026-03-26-deerflow-2-building-sovereign-ai-agent-systems"],
  ["/blog/document-driven-development-nextjs-blog", "/blog/2025-11-03-document-driven-development-nextjs-blog"],
  ["/blog/getting-started-sovereign-ai", "/blog/2026-07-05-getting-started-sovereign-ai"],
  ["/blog/how-to-vibe-code-a-nextjs-boilerplate-repo", "/blog/2025-10-20-how-to-vibe-code-a-nextjs-boilerplate-repo"],
  ["/blog/large-scale-agent-architecture", "/blog/2025-03-25-large-scale-agent-architecture"],
  ["/blog/local-ai-architecture-synthesis", "/blog/2026-07-05-local-ai-architecture-synthesis"],
  ["/blog/opendesign-opencode-local-first-design-operating-system", "/blog/2026-06-08-opendesign-opencode-local-first-design-operating-system"],
  ["/blog/retrieval-architecture-synthesis", "/blog/2026-07-05-retrieval-architecture-synthesis"],
  ["/blog/sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems", "/blog/2026-06-14-sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems"],
  ["/blog/sovereignspec-local-first-spec-driven-development", "/blog/2026-06-12-sovereignspec-local-first-spec-driven-development"],
  ["/blog/sovereignty-manifesto", "/blog/2026-03-28-sovereignty-manifesto"],
  ["/blog/specgen-deterministic-ai-powered-code-generation-from-naturals-language", "/blog/2026-01-07-specgen-deterministic-ai-powered-code-generation-from-naturals-language"],
  ["/blog/tech-company-orchestrator", "/blog/2024-11-29-tech-company-orchestrator"],
  ["/blog/2026-07-02-building-autonomous-sovereign-ai", "/blog/2026-07-02-building-autonomous-sovereign-ai-with-autoresearch-loops-and-fine-tuned-expert-models"],
  ["/blog/2026-07-05-sovereign-ai-benchmarks-performance-results", "/blog/2026-07-06-sovereign-ai-benchmarks-performance-results"],
  ["/blog/the-model-is-not-the-product", "/blog/2026-07-03-the-model-is-not-the-product"],
  ["/blog/the-rented-sovereign-agent-agency-stack", "/blog/2026-09-04-the-rented-sovereign-agent-agency-stack"],
  ["/blog/vibe-coding-janitor-session", "/blog/2025-10-19-vibe-coding-janitor-session"],
];

/**
 * Removed sections.
 *
 * These five routes were deleted on request. They are redirected rather than
 * left to 404 because they had inbound links: /fleet was linked from /paper and
 * /mission, /press from /contact, and all four are in Google's index. A 301
 * preserves what link equity exists and sends readers to the surviving page
 * that now carries the content.
 *
 * /fleet's eight domains were consolidated into /concepts, which had become a
 * second taxonomy covering the same ideas under different names. Each domain
 * maps to the concept that absorbed it.
 */
const REMOVED_SECTION_REDIRECTS: [string, string][] = [
  ["/paper", "/book"],
  ["/mission", "/about"],
  ["/press", "/about"],
  ["/fleet", "/concepts"],
  ["/fleet/knowledge-compilation", "/concepts/knowledge-compilation"],
  ["/fleet/compile-time-ai", "/concepts/knowledge-compilation"],
  ["/fleet/scientific-knowledge-systems", "/concepts/knowledge-compilation"],
  ["/fleet/local-first-ai", "/concepts/local-first"],
  ["/fleet/cognitive-memory", "/concepts/graph-retrieval"],
  ["/fleet/research-automation", "/concepts/creative-automation"],
  ["/fleet/knowledge-representation", "/concepts/provenance"],
  ["/fleet/decision-graphs", "/concepts/graph-retrieval"],
];

/* ── Content-Security-Policy ────────────────────────────────────────────────
   Built from what this site actually loads, not from a template:

   - `script-src 'self' 'unsafe-inline'` — 'self' covers the Turbopack chunks
     and Vercel Analytics (which loads `/_vercel/insights/script.js`
     same-origin in production). `'unsafe-inline'` is required because Next
     injects the RSC flight payload as inline `self.__next_f.push(...)`
     bootstrap scripts (4 inline script tags on `/` alone). A nonce would mean
     rendering that payload per request, which turns every static page dynamic
     and destroys the CDN cache — so the trade is inline scripts accepted, in
     exchange for `object-src 'none'`, `base-uri 'self'`, `frame-ancestors
     'none'` and a locked-down `default-src`. The JSON-LD
     `<script type="application/ld+json">` blocks are not executable and are
     unaffected by script-src.
   - `img-src 'self' data: blob:` — next/image emits a base64 `data:` blur
     placeholder; `blob:` covers WebGL/canvas textures. Plus exactly the two
     remote hosts markdown images reference (see the grep below).
   - `media-src 'self'` — the only real `<video>`/`<source>` elements are
     HeroFilm's own hero loops under /images/hero/. Raw `<video>` and
     `<iframe>` tags inside post markdown are NOT rendered: there is no
     rehype-raw plugin, so react-markdown escapes them, and the YouTube/Vimeo
     embeds in posts render as visible text.
   - `frame-src` is deliberately unset, so it falls back to `default-src
     'self'` and no third-party frame can load.

   Verified by grepping content/ for remote image hosts: i.imgur.com (8) and
   img.shields.io (6) are the only ones. Re-run that grep before shipping a
   host here that no post uses. */
const CSP = [
  "default-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.imgur.com https://img.shields.io",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  /* ── Security headers ────────────────────────────────────────────────────
     There was no `headers()` and no `poweredByHeader: false`, so responses
     carried `X-Powered-By: Next.js` and none of the browser-side hardening
     headers. Everything below is safe to enforce on its own; the CSP is built
     from what this site actually loads (see the constant above).

     HSTS is deliberately NOT set here: Vercel adds it at the edge, and
     hard-coding `max-age` in the app config cannot be verified from the repo.
     See docs/SECURITY.md. */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },

  // Keep defaults; images served from /public/images (same-origin).
  async redirects() {
    return [...LEGACY_SLUG_REDIRECTS, ...REMOVED_SECTION_REDIRECTS].map(
      ([source, destination]) => ({
        source,
        destination,
        permanent: true,
      }),
    );
  },
};

export default nextConfig;
