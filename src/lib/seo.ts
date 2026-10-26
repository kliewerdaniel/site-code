import type { Metadata } from "next";
import { SITE, BOOK, SOCIAL } from "@/config";
import {
  DEFAULT_OG_IMAGE,
  FEED_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  absoluteImage,
  buildMetadata,
  canonicalFor,
  resolveUpdated,
  jsonLd,
  type OgType,
} from "./seo-core";

/* The pure half of this layer (asset constants, the metadata merge, JSON-LD
   escaping, `updated` fallback, RSS rendering) lives in `./seo-core` so
   `node --test` can exercise it without a Next build. Re-exported here so the
   pages and validators have one import site. */
export {
  DEFAULT_OG_IMAGE,
  FEED_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  jsonLd,
};

/* ── Canonical ───────────────────────────────────────────────────────────────
   Every page gets a self-referential canonical so search engines consolidate
   signals on the URL that actually serves the content. `path` is the route
   (e.g. "/about" or "/blog/foo"); for dynamic query variants pass the full
   canonical path the crawler sees, e.g. "/research?page=3".                */
export function canonical(path: string): string {
  return canonicalFor(path, SITE.url);
}

export interface SeoInput {
  title: string;
  description: string;
  /** Route path used to build the self-referential canonical. */
  path: string;
  /** `og:type` (website / article / profile / book). Defaults to website. */
  type?: OgType;
  /** Image override for this page. Defaults to /images/og-home.jpg. */
  image?: string;
  /** Alt text for the OG image. Defaults to the page title. */
  imageAlt?: string;
  /**
   * Set true when `title` is already a complete, self-sufficient title (e.g. a
   * blog headline over 50 chars). It emits `title: { absolute: ... }`, which
   * skips the `"%s — Daniel Kliewer"` layout template instead of appending the
   * brand to a headline that is already longer than a search result slot.
   */
  absoluteTitle?: boolean;
  /** Optional overrides that merge over the title/description defaults. */
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
  robots?: Metadata["robots"];
}

/* Build page metadata with a self-referential canonical, complete Open Graph /
   Twitter defaults, and the RSS alternate link. Pages call this instead of
   hand-rolling a metadata block. The merge is what keeps `og:site_name`,
   `og:url` and `og:image` present on pages that only override the title.     */
export function seo(input: SeoInput): Metadata {
  return buildMetadata(input, SITE);
}

/* Organization + WebSite graph, emitted once on the home page. */
export const orgWebsiteGraph = () =>
  jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        founder: { "@id": `${SITE.url}/#daniel` },
        sameAs: [SOCIAL.github, SOCIAL.x, SOCIAL.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "Person",
        "@id": `${SITE.url}/#daniel`,
        name: SITE.name,
        url: SITE.url,
        sameAs: [SOCIAL.github, SOCIAL.x, SOCIAL.linkedin],
        jobTitle: "Author & Systems Engineer",
        knowsAbout: [
          "Local-first AI systems",
          "Computational sovereignty",
          "Knowledge compilation",
          "Governed AI agents",
        ],
      },
    ],
  });

/* BlogPosting (Article) schema for a research post. `updated` falls back to
   `date` when the post carries no `updated` frontmatter, and the image falls
   back to the shared OG card so the headline is never schema-only.           */
export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  image?: string;
}): string {
  const url = canonical(`/blog/${post.slug}`);
  const image = absoluteImage(post.image, SITE.url) ?? canonical(DEFAULT_OG_IMAGE);
  const modified = resolveUpdated(post.date, post.updated);
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.date,
    dateModified: modified,
    mainEntityOfPage: url,
    image: [image],
    author: { "@id": `${SITE.url}/#daniel`, "@type": "Person", name: SITE.name },
    publisher: { "@id": `${SITE.url}/#organization` },
    isPartOf: { "@id": `${SITE.url}/#website` },
    inLanguage: "en",
  });
}

/* SoftwareSourceCode for a project. Only facts already in taxonomy.ts are
   emitted: name, role (description), repo URL, an unambiguous programming
   language from `stack`, and the author reference. No version, rating, download
   count or date is invented; `signals.lastCommit` is a dated repository
   snapshot and is deliberately not asserted as a schema date.               */
const KNOWN_LANGUAGES = ["Python", "Rust", "TypeScript"] as const;

export function softwareSourceCodeSchema(project: {
  slug: string;
  name: string;
  role: string;
  stack: string[];
  repo?: string;
}): string {
  const url = canonical(`/projects/${project.slug}`);
  const language = project.stack.find((s) =>
    (KNOWN_LANGUAGES as readonly string[]).includes(s)
  );
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": url,
    name: project.name,
    description: project.role,
    url,
    ...(project.repo ? { codeRepository: project.repo } : {}),
    ...(language ? { programmingLanguage: language } : {}),
    author: { "@id": `${SITE.url}/#daniel` },
    isPartOf: { "@id": `${SITE.url}/#website` },
    inLanguage: "en",
  });
}

/* ProfilePage for /about — mainEntity reuses the home page's #daniel Person
   node instead of redefining the entity, so the graph has one identity.     */
export function profilePageSchema(): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": canonical("/about"),
    url: canonical("/about"),
    mainEntity: { "@id": `${SITE.url}/#daniel` },
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "en",
  });
}

/* CollectionPage for /research — the archive is a collection of articles.    */
export function collectionPageSchema(): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonical("/research"),
    url: canonical("/research"),
    name: "Research",
    description:
      "The full research archive — local-first AI systems, deterministic pipelines, and computational sovereignty.",
    isPartOf: { "@id": `${SITE.url}/#website` },
    inLanguage: "en",
  });
}

/* Book / Product schema for the book page. */
export function bookSchema(): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": canonical("/book"),
    name: `${BOOK.title}: ${BOOK.subtitle}`,
    url: canonical("/book"),
    description: BOOK.promise,
    author: { "@id": `${SITE.url}/#daniel`, "@type": "Person", name: SITE.name },
    publisher: { "@id": `${SITE.url}/#organization` },
    isbn: "979-8162014881",
    datePublished: "2026-10-12",
    bookFormat: "https://schema.org/Hardcover",
    offers: {
      "@type": "Offer",
      url: BOOK.amazonUrl,
      priceCurrency: "USD",
      price: BOOK.price.replace("$", ""),
      availability: "https://schema.org/InStock",
    },
  });
}

/* BreadcrumbList schema for a page with a visible breadcrumb trail. The
   `path` of the final crumb is omitted so it matches the page's own canonical
   (a self-referencing crumb is valid but adds noise).                       */
export function breadcrumbSchema(
  crumbs: { name: string; path: string }[]
): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(i < crumbs.length - 1 ? { item: canonical(c.path) } : {}),
    })),
  });
}
