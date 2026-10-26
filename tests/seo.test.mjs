/**
 * Tests for the pure SEO layer (src/lib/seo-core.ts).
 *
 * These lock the two contracts that were broken before the fix:
 *   1. `seo()` must MERGE an override over the defaults, never replace the
 *      whole `openGraph` object (which silently dropped og:site_name, og:url
 *      and og:image on 202 pages).
 *   2. `jsonLd()` must escape `<` so a frontmatter title containing
 *      `</script>` cannot terminate the injected element early.
 *
 * Run: node --test tests/        (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_OG_IMAGE,
  FEED_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  absoluteImage,
  buildMetadata,
  canonicalFor,
  jsonLd,
  mergeMeta,
  resolveUpdated,
} from "../src/lib/seo-core.ts";

const SITE = { name: "Daniel Kliewer", url: "https://www.danielkliewer.com" };

// ---- canonical -----------------------------------------------------------

test("canonicalFor: root is the bare origin, other paths are origin + path", () => {
  assert.equal(canonicalFor("/", SITE.url), SITE.url);
  assert.equal(canonicalFor("/about", SITE.url), `${SITE.url}/about`);
  // Query variants must survive verbatim — they are distinct canonical URLs.
  assert.equal(
    canonicalFor("/research?page=3", SITE.url),
    `${SITE.url}/research?page=3`
  );
});

// ---- metadata defaults + merge (the F4 regression) ------------------------

test("buildMetadata: every page carries canonical, og:url, og:site_name, og:image, twitter:image", () => {
  const md = buildMetadata(
    { title: "About", description: "d", path: "/about" },
    SITE
  );
  assert.equal(md.alternates.canonical, `${SITE.url}/about`);
  assert.equal(md.openGraph.url, `${SITE.url}/about`);
  assert.equal(md.openGraph.siteName, SITE.name);
  assert.equal(md.openGraph.title, "About");
  assert.equal(md.openGraph.type, "website");
  assert.equal(md.openGraph.images[0].url, DEFAULT_OG_IMAGE);
  assert.equal(md.openGraph.images[0].width, OG_IMAGE_WIDTH);
  assert.equal(md.openGraph.images[0].height, OG_IMAGE_HEIGHT);
  assert.deepEqual(md.twitter.images, [DEFAULT_OG_IMAGE]);
  assert.equal(md.twitter.card, "summary_large_image");
});

test("buildMetadata: an openGraph override MERGES, it does not replace the defaults", () => {
  // This is the exact shape the blog template sends: it sets title/description
  // and no url/siteName/images. Before the fix the whole openGraph object was
  // replaced, so og:site_name, og:url and og:image all disappeared.
  const md = buildMetadata(
    {
      title: "A post title",
      description: "d",
      path: "/blog/a-post-title",
      type: "article",
      openGraph: {
        title: "A post title",
        description: "d",
        type: "article",
        publishedTime: "2026-01-01T00:00:00.000Z",
        tags: ["rag"],
      },
    },
    SITE
  );
  const og = md.openGraph;
  assert.equal(og.url, `${SITE.url}/blog/a-post-title`, "og:url must survive");
  assert.equal(og.siteName, SITE.name, "og:site_name must survive");
  assert.ok(og.images?.length, "og:image must survive");
  assert.equal(og.type, "article");
  assert.equal(og.publishedTime, "2026-01-01T00:00:00.000Z");
});

test("buildMetadata: a twitter override merges, keeping card and images", () => {
  const md = buildMetadata(
    {
      title: "T",
      description: "d",
      path: "/x",
      twitter: { card: "summary_large_image", title: "T", description: "d" },
    },
    SITE
  );
  assert.equal(md.twitter.title, "T");
  assert.deepEqual(md.twitter.images, [DEFAULT_OG_IMAGE]);
});

test("buildMetadata: an explicit image override replaces only the image", () => {
  const md = buildMetadata(
    {
      title: "Book",
      description: "d",
      path: "/book",
      image: "/images/book-front.png",
      openGraph: { title: "Book — the stack", description: "d", type: "website" },
    },
    SITE
  );
  assert.equal(md.openGraph.images[0].url, "/images/book-front.png");
  assert.equal(md.openGraph.url, `${SITE.url}/book`);
  assert.equal(md.openGraph.siteName, SITE.name);
  assert.equal(md.openGraph.title, "Book — the stack");
});

test("buildMetadata: imageAlt defaults to the title and is overridable", () => {
  const a = buildMetadata({ title: "T", description: "d", path: "/a" }, SITE);
  assert.equal(a.openGraph.images[0].alt, "T");
  const b = buildMetadata(
    { title: "T", description: "d", path: "/b", imageAlt: "custom" },
    SITE
  );
  assert.equal(b.openGraph.images[0].alt, "custom");
});

test("buildMetadata: absoluteTitle skips the layout title template", () => {
  const md = buildMetadata(
    { title: "A very long headline", description: "d", path: "/p", absoluteTitle: true },
    SITE
  );
  assert.deepEqual(md.title, { absolute: "A very long headline" });
  const normal = buildMetadata({ title: "Short", description: "d", path: "/q" }, SITE);
  assert.equal(normal.title, "Short");
});

test("buildMetadata: the RSS alternate link is present on every page", () => {
  const md = buildMetadata({ title: "T", description: "d", path: "/" }, SITE);
  assert.equal(md.alternates.types["application/rss+xml"], FEED_URL);
});

test("buildMetadata: robots pass through", () => {
  const md = buildMetadata(
    { title: "T", description: "d", path: "/nope", robots: { index: false, follow: true } },
    SITE
  );
  assert.equal(md.robots.index, false);
  assert.equal(md.robots.follow, true);
});

// ---- JSON-LD escaping (the F2 hardening) ---------------------------------

test("jsonLd: escapes < > & so a </script> in a title cannot break out", () => {
  const evil = '</script><img src=x onerror=alert(1)>';
  const out = jsonLd({ "@type": "BlogPosting", headline: evil });
  assert.ok(!out.includes("</script>"), "literal </script> must not appear");
  assert.ok(!out.includes("<img"), "literal tag must not appear");
  // And the escaped form is still valid JSON that round-trips to the original.
  assert.equal(JSON.parse(out).headline, evil);
});

test("jsonLd: escapes U+2028 and U+2029 (valid JSON, invalid JS)", () => {
  const out = jsonLd({ name: "a\u2028b\u2029c" });
  assert.ok(!out.includes("\u2028"));
  assert.ok(!out.includes("\u2029"));
  assert.equal(JSON.parse(out).name, "a\u2028b\u2029c");
});

test("jsonLd: plain values are unchanged", () => {
  assert.equal(jsonLd({ a: 1, b: "two" }), '{"a":1,"b":"two"}');
  assert.deepEqual(JSON.parse(jsonLd({ a: 1, b: "two" })), { a: 1, b: "two" });
});

// ---- updated fallback (the F6 contract) ----------------------------------

test("resolveUpdated: falls back to date, and prefers a real updated value", () => {
  assert.equal(resolveUpdated("2026-01-01T00:00:00.000Z"), "2026-01-01T00:00:00.000Z");
  assert.equal(
    resolveUpdated("2026-01-01T00:00:00.000Z", "2026-03-01T00:00:00.000Z"),
    "2026-03-01T00:00:00.000Z"
  );
  // An empty string is treated as absent — a blank frontmatter key must not
  // blank out dateModified.
  assert.equal(
    resolveUpdated("2026-01-01T00:00:00.000Z", ""),
    "2026-01-01T00:00:00.000Z"
  );
});

// ---- mergeMeta (the actual F4 root cause) --------------------------------

test("mergeMeta: merges one level deep so an override cannot drop a default", () => {
  // `mergeMeta(base, base)` was the original bug — merging the object with
  // itself, a no-op that meant the deep-merge never happened.
  const a = { openGraph: { title: "A", url: "u", images: ["i"] }, robots: { index: false } };
  const b = { openGraph: { title: "B" }, robots: undefined };
  const out = mergeMeta(a, b);
  assert.deepEqual(out.openGraph, { title: "B", url: "u", images: ["i"] });
  // `undefined` must not clobber a default: a caller's absent keys arrive as
  // explicit undefined and `{...a, ...b}` alone would wipe them.
  assert.deepEqual(out.robots, { index: false });
});

test("mergeMeta: replaces, not merges, non-nested top-level keys", () => {
  const out = mergeMeta({ title: "A" }, { title: "B" });
  assert.equal(out.title, "B");
});

// ---- absoluteImage -------------------------------------------------------

test("absoluteImage: relative paths become canonical, absolute pass through, undefined stays undefined", () => {
  assert.equal(absoluteImage(undefined, SITE.url), undefined);
  assert.equal(absoluteImage("/images/a.png", SITE.url), `${SITE.url}/images/a.png`);
  assert.equal(
    absoluteImage("https://i.imgur.com/a.png", SITE.url),
    "https://i.imgur.com/a.png"
  );
});
