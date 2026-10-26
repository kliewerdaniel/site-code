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

const nextConfig: NextConfig = {
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
