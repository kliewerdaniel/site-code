// agent-resources.ts — the bound half of the agent knowledge interface.
//
// Reads the same sources the pages do (config, the markdown archive, the
// taxonomy, the chapter manifest) and turns them into the six public
// machine-readable resources. `agent-resources-core.ts` holds the pure
// builders so the `node --test` suites can exercise the exact bytes.

import { SITE, BOOK, SOCIAL } from "@/config";
import { getAllPosts } from "./posts";
import { PROJECTS, CONCEPTS, PATHS, conceptsForPost, projectsForPost } from "./taxonomy";
import { CHAPTERS } from "./chapters";
import { BOOK_LINKS } from "./book-links";
import { relationGraph } from "./relations";
import { buildClaimsAndEvidence, buildProposals } from "./claim-evidence";
import {
  buildAgentResources,
  buildMarkdownMirrors,
  markdownPath,
  type AgentCorpus,
  type AgentResource,
} from "./agent-resources-core";

export { buildAgentResources, buildMarkdownMirrors } from "./agent-resources-core";
export type { AgentCorpus, AgentResource } from "./agent-resources-core";

let cache: AgentResource[] | null = null;

function corpus(): AgentCorpus {
  return {
    site: {
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      github: SOCIAL.github,
      x: SOCIAL.x,
      linkedin: SOCIAL.linkedin,
      email: SOCIAL.email,
    },
    book: {
      title: BOOK.title,
      subtitle: BOOK.subtitle,
      promise: BOOK.promise,
      price: BOOK.price,
      priceCurrency: "USD",
      priceNote: BOOK.priceNote,
      amazonUrl: BOOK.amazonUrl,
      asin: BOOK.asin,
      isbn: BOOK.isbn,
      datePublished: BOOK.datePublished,
      sampleUrl: BOOK.sampleUrl,
      coverFront: BOOK.coverFront,
      coverSpine: BOOK.coverSpine,
      coverBack: BOOK.coverBack,
      pages: BOOK.pages,
      format: BOOK.format,
      trim: BOOK.trim,
      chapters: BOOK.chapters,
      words: BOOK.words,
    },
    posts: getAllPosts().map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      ...(p.updated ? { updated: p.updated } : {}),
      description: p.description,
      tags: p.tags,
      readingMinutes: p.readingMinutes,
      content: p.content,
      concepts: conceptsForPost(p).map((c) => c.slug),
      projects: projectsForPost(p.slug).map((pr) => pr.slug),
    })),
    projects: PROJECTS.map((p) => ({
      slug: p.slug,
      name: p.name,
      role: p.role,
      maturity: p.maturity,
      ...(p.repo ? { repo: p.repo } : {}),
      ...(p.site ? { site: p.site } : {}),
      concepts: p.concepts,
      articles: p.articles,
    })),
    concepts: CONCEPTS.map((c) => ({
      slug: c.slug,
      name: c.name,
      oneLiner: c.oneLiner,
      tags: c.tags,
      projects: c.projects,
    })),
    paths: PATHS.map((p) => ({
      slug: p.slug,
      name: p.name,
      promise: p.promise,
      audience: p.audience,
      steps: p.steps.map((s) => ({ kind: s.kind, ref: s.ref, note: s.note })),
    })),
    chapters: CHAPTERS.map((c) => ({ n: c.n, part: c.part, title: c.title })),
    graph: relationGraph(),
    bookLinks: BOOK_LINKS.map((l) => ({
      article: l.article,
      chapter: l.chapter,
      relation: l.relation,
      reason: l.reason,
    })),
    ...(() => {
      const { claims, evidence } = buildClaimsAndEvidence();
      return { claims, evidence, proposals: buildProposals() };
    })(),
  };
}

/** All six resources, built once. Deterministic: no clock, no randomness. */
export function getAgentResources(): AgentResource[] {
  if (!cache) cache = buildAgentResources(corpus());
  return cache;
}

export function getAgentResource(path: string): AgentResource | undefined {
  return getAgentResources().find((r) => r.path === path);
}

let mirrorCache: AgentResource[] | null = null;

/** Every canonical Markdown mirror, built once. Deterministic. */
export function getMarkdownMirrors(): AgentResource[] {
  if (!mirrorCache) mirrorCache = buildMarkdownMirrors(corpus());
  return mirrorCache;
}

/** One Markdown mirror by post slug, or undefined for a draft/unknown slug. */
export function getMarkdownMirror(slug: string): AgentResource | undefined {
  return getMarkdownMirrors().find((r) => r.path === markdownPath(slug));
}

/** Cache policy for a build-time resource: long edge cache, serve stale while
 *  revalidating. Vercel purges the cache on deploy, so a stale window is safe. */
export const AGENT_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";
