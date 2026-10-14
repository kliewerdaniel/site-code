import type { Metadata } from "next";
import { SITE, BOOK, SOCIAL } from "@/config";

/* ── Canonical ───────────────────────────────────────────────────────────────
   Every page gets a self-referential canonical so search engines consolidate
   signals on the URL that actually serves the content. `path` is the route
   (e.g. "/about" or "/blog/foo"); for dynamic query variants pass the full
   canonical path the crawler sees.                                            */
export function canonical(path: string): string {
  return path === "/" ? SITE.url : `${SITE.url}${path}`;
}

/* Deep-merge two Metadata objects. Next.js spreads metadata shallowly, so a
   page that sets `openGraph` would drop the layout's `openGraph`. This keeps
   one level of nesting (openGraph / twitter) merged, child-most wins. */
type Any = Record<string, unknown>;

function mergeMeta(a: Metadata, b: Metadata): Metadata {
  const out: Any = { ...a, ...b };
  for (const key of ["openGraph", "twitter"] as const) {
    const av = a[key] as Any | undefined;
    const bv = b[key] as Any | undefined;
    if (av && bv) out[key] = { ...av, ...bv };
  }
  return out as Metadata;
}

export interface SeoInput {
  title: string;
  description: string;
  /** Route path used to build the self-referential canonical. */
  path: string;
  /** Optional overrides that merge over the title/description defaults. */
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
}

/* Build page metadata with a self-referential canonical + sensible Open Graph /
   Twitter defaults baked in. Pages call this instead of hand-rolling a
   metadata block.                                                            */
export function seo(input: SeoInput): Metadata {
  const base: Metadata = {
    title: input.title,
    description: input.description,
    alternates: { canonical: canonical(input.path) },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical(input.path),
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
    ...(input.openGraph ? { openGraph: input.openGraph } : {}),
    ...(input.twitter ? { twitter: input.twitter } : {}),
  };
  return mergeMeta(base, base);
}

/* ── JSON-LD ───────────────────────────────────────────────────────────────
   Serialized into a <script type="application/ld+json"> the page renders.    */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data);
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

/* BlogPosting (Article) schema for a research post. */
export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
}): string {
  const url = canonical(`/blog/${post.slug}`);
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    image: post.image ? [canonical(post.image)] : undefined,
    author: { "@id": `${SITE.url}/#daniel`, "@type": "Person", name: SITE.name },
    publisher: { "@id": `${SITE.url}/#organization` },
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
    numberOfPages: Number(BOOK.pages),
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

/* BreadcrumbList schema for a page with a visible breadcrumb trail. */
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
      item: canonical(c.path),
    })),
  });
}
