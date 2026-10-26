/**
 * seo-core.ts — the alias-free, side-effect-free half of the SEO layer.
 *
 * `src/lib/seo.ts` binds these helpers to the site config (`@/config`) and
 * Next's `Metadata` types. Keeping the pure logic here means it can be
 * imported directly by `tests/*.test.mjs` under `node --test` (Node 22 strips
 * TypeScript types natively), instead of being reachable only through a build.
 * Nothing in this file may import from `@/config` or read the filesystem.
 */
import type { Metadata } from "next";

/* ── Shared assets ───────────────────────────────────────────────────────────
   The default social card. `public/images/og-home.jpg` is 1200×630 (92 KB), a
   real 1.91:1 card — the book cover is 1837×3050 portrait and crops badly, so
   it is used only where the book is the deliberate subject (/book).        */
export const DEFAULT_OG_IMAGE = "/images/og-home.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Feed URL advertised to every page via `<link rel="alternate">`. */
export const FEED_URL = "/feed.xml";

/** The og:type values this site actually uses. */
export type OgType = "website" | "article" | "profile" | "book";

type Any = Record<string, unknown>;

/** Absolute canonical URL for a path. Pure: the site origin is a parameter. */
export function canonicalFor(path: string, siteUrl: string): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}

/* Deep-merge two Metadata objects. Next.js spreads metadata shallowly, so a
   page that sets `openGraph` would drop the layout's `openGraph` — and a page
   that sets `openGraph.title` would otherwise drop `url`/`siteName`/`images`.
   This keeps one level of nesting (openGraph / twitter) merged, child-most
   wins, so every page keeps the defaults it does not explicitly override. */
export function mergeMeta(a: Metadata, b: Metadata): Metadata {
  const out: Any = { ...a };
  for (const key of ["openGraph", "twitter"] as const) {
    const av = a[key] as Any | undefined;
    const bv = b[key] as Any | undefined;
    if (av && bv) out[key] = { ...av, ...bv };
    else if (bv) out[key] = bv;
  }
  // Copy the remaining top-level overrides (robots, alternates, ...) that are
  // actually present. `undefined` must not clobber a default: `{...a, ...b}`
  // alone would, because b carries the caller's absent keys as explicit
  // undefined values.
  for (const [key, value] of Object.entries(b)) {
    if (value !== undefined && key !== "openGraph" && key !== "twitter") {
      out[key] = value;
    }
  }
  return out as Metadata;
}

/** An OG image descriptor with the dimensions the card is actually served at. */
export function ogImageDescriptor(
  url: string,
  alt: string,
  width: number = OG_IMAGE_WIDTH,
  height: number = OG_IMAGE_HEIGHT
): { url: string; width: number; height: number; alt: string } {
  return { url, width, height, alt };
}

export interface SeoInputCore {
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

/**
 * Build page metadata with a self-referential canonical, complete Open Graph /
 * Twitter defaults, and the RSS alternate link. Pages call this instead of
 * hand-rolling a metadata block. The merge is what keeps `og:site_name`,
 * `og:url` and `og:image` present on pages that only override the title.
 *
 * Pure: the site identity is a parameter, so the tests exercise exactly the
 * object the pages receive.
 */
export function buildMetadata(
  input: SeoInputCore,
  site: { name: string; url: string }
): Metadata {
  const url = canonicalFor(input.path, site.url);
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const base: Metadata = {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": FEED_URL },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: site.name,
      type: input.type ?? "website",
      images: [ogImageDescriptor(image, input.imageAlt ?? input.title)],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
  return mergeMeta(base, {
    openGraph: input.openGraph,
    twitter: input.twitter,
    robots: input.robots,
  });
}

/**
 * `updated` frontmatter, normalised like `date`, falling back to `date`.
 * Shared by the sitemap's lastmod, articleSchema's dateModified, and the
 * article `article:modified_time`, so the three never disagree.
 */
export function resolveUpdated(date: string, updated?: string): string {
  return updated && updated.length > 0 ? updated : date;
}

/* ── JSON-LD ───────────────────────────────────────────────────────────────
   Serialized into a <script type="application/ld+json"> the page renders.
   `<`, `>`, `&`, U+2028 and U+2029 are escaped even though they are valid
   JSON, because the block is injected with dangerouslySetInnerHTML inside a
   `<script>` element: a literal `</script>` in any string value (a post title
   or description from frontmatter) would terminate the element early and let
   the remainder execute. Escaping to \uXXXX is valid JSON, parses to the same
   value, and cannot form `</script>`.                                       */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Resolve an image path/URL to the absolute URL JSON-LD expects. */
export function absoluteImage(image: string | undefined, siteUrl: string): string | undefined {
  if (!image) return undefined;
  if (/^https?:\/\//.test(image)) return image;
  return canonicalFor(image, siteUrl);
}

/* ── RSS ─────────────────────────────────────────────────────────────────── */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  /** RFC 822 date string. */
  pubDate: string;
  /** Author display name for `<dc:creator>`. */
  creator: string;
  /** Tag display names for `<category>` elements. */
  categories: string[];
}

/**
 * Render one `<item>`. The `<guid isPermaLink="true">` equals the item link so
 * existing subscribers see no duplicate items when the feed is re-read; the
 * `<atom:link rel="self">` and `<lastBuildDate>` live on the channel, not here.
 */
export function feedItemXml(item: FeedItem): string {
  const categories = item.categories
    .map((c) => `      <category>${escapeXml(c)}</category>`)
    .join("\n");
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${escapeXml(item.pubDate)}</pubDate>
      <description>${escapeXml(item.description)}</description>
      <dc:creator>${escapeXml(item.creator)}</dc:creator>
${categories}
    </item>`;
}

/**
 * Render the full RSS 2.0 document. `lastBuildDate` is the newest item date
 * (or the supplied fallback), which is the truthful freshness signal for a
 * feed whose items are a static archive.
 */
export function feedXml(channel: {
  title: string;
  link: string;
  description: string;
  items: FeedItem[];
  lastBuildDate: string;
}): string {
  const items = channel.items.map(feedItemXml).join("\n");
  // The self link is the origin + /feed.xml, not the channel link with the
  // filename concatenated — appending it raw produced "...danielkliewer.comfeed.xml".
  const feedHref = `${channel.link.replace(/\/+$/, "")}/feed.xml`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(channel.lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(feedHref)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
