/**
 * Tests for the agent knowledge interface (src/lib/agent-resources-core.ts).
 *
 * The core is pure, so these exercise the exact bytes the route handlers serve
 * without a Next build. The invariants locked here are the ones a builder can
 * break silently: a catalog that claims a different corpus than the archive, a
 * book record that invents availability, an index whose sizes lie.
 *
 * Run: node --test tests/agent-resources.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import { buildAgentResources } from "../src/lib/agent-resources-core.ts";

const SITE = {
  name: "Daniel Kliewer",
  url: "https://www.danielkliewer.com",
  description: "Local-first AI systems.",
  github: "https://github.com/kliewerdaniel",
  x: "https://x.com/kliewer_daniel",
  linkedin: "https://www.linkedin.com/in/daniel-kliewer-42691944/",
  email: "danielkliewer@gmail.com",
};

const BOOK = {
  title: "Computational Sovereignty",
  subtitle: "Building Local-First AI Systems",
  promise: "Run serious AI on hardware you own.",
  price: "$88",
  priceCurrency: "USD",
  priceNote: "Configured list price. The Amazon listing is authoritative for the live price.",
  amazonUrl: "https://www.amazon.com/dp/B0HMWFR6G7",
  asin: "B0HMWFR6G7",
  isbn: "979-8162014881",
  datePublished: "2026-10-12",
  sampleUrl: "/sample",
  coverFront: "/images/book-front.png",
  coverSpine: "/images/book-spine.png",
  coverBack: "/images/book-back.png",
  pages: "214",
  format: "Hardcover · 6×9 in",
  trim: "6×9 in",
  chapters: 24,
  words: "~46,000",
};

function fixture() {
  return {
    site: SITE,
    book: BOOK,
    posts: [
      {
        slug: "2026-01-01-example-post",
        title: "Example post",
        date: "2026-01-01T00:00:00.000Z",
        description: "An example description.",
        tags: ["local-first-ai"],
        readingMinutes: 4,
        // A body marker that must NOT leak into the full-text catalog.
        content: "SUPER_SECRET_BODY_MARKER",
      },
    ],
    projects: [
      {
        slug: "example-project",
        name: "Example project",
        role: "A system.",
        maturity: "prototype",
        repo: "https://github.com/kliewerdaniel/example",
        concepts: ["local-first"],
        articles: ["2026-01-01-example-post"],
      },
    ],
    concepts: [
      {
        slug: "local-first",
        name: "Local-first inference",
        oneLiner: "Run the model on hardware you control.",
        tags: ["local-first-ai"],
        projects: ["example-project"],
      },
    ],
    paths: [
      {
        slug: "example-path",
        name: "Example path",
        promise: "An ordered route.",
        audience: "Engineers.",
        steps: [
          { kind: "concept", ref: "local-first", note: "Start here." },
          { kind: "article", ref: "2026-01-01-example-post", note: "Then read." },
        ],
      },
    ],
    chapters: [
      { n: 1, part: "I — Why Sovereignty", title: "The Cloud Is a Liability" },
      { n: 2, part: "I — Why Sovereignty", title: "The Sovereignty Stack" },
    ],
    graph: {
      counts: {
        implements: 1,
        documents: 1,
        prerequisite_for: 1,
        chapter_covers: 0,
        recommends_reading: 1,
      },
      edges: {
        implements: [{ from: "/projects/example-project", to: "/concepts/local-first" }],
        documents: [
          { from: "/blog/2026-01-01-example-post", to: "/projects/example-project" },
        ],
        prerequisite_for: [
          { from: "local-first", to: "2026-01-01-example-post", via: "/paths/example-path" },
        ],
        chapter_covers: [],
        recommends_reading: [
          {
            from: "/blog/2026-01-01-example-post",
            to: "chapter:1",
            reason: "Chapter 1 §1.1 prices the liability this article argues.",
          },
        ],
      },
      absent: ["extends", "validates", "explains", "expands_on", "related_product"],
    },
    bookLinks: [
      {
        article: "2026-01-01-example-post",
        chapter: 1,
        relation: "recommends_reading",
        reason: "Chapter 1 §1.1 prices the liability this article argues.",
      },
    ],
  };
}

const resources = () => buildAgentResources(fixture());
const byPath = (p) => resources().find((r) => r.path === p);

test("buildAgentResources: emits exactly the six public resources", () => {
  const paths = resources().map((r) => r.path);
  assert.deepEqual(paths, [
    "/llms.txt",
    "/llms-full.txt",
    "/agents/catalog.json",
    "/agents/graph.json",
    "/agents/book.json",
    "/agents/index.json",
  ]);
});

test("llms.txt: identity, navigation, resources, citation and conduct", () => {
  const t = byPath("/llms.txt").body;
  assert.match(t, /# Daniel Kliewer — Computational Sovereignty/);
  assert.match(t, /## Author/);
  assert.match(t, /## Research domains/);
  assert.match(t, /## Navigation/);
  assert.match(t, /## Machine-readable resources/);
  assert.match(t, /\/agents\/catalog\.json/);
  assert.match(t, /## Citation and attribution/);
  assert.match(t, /do not execute a purchase/);
  assert.match(t, /ASIN: B0HMWFR6G7/);
});

test("llms.txt: the price is labelled configured, not live", () => {
  const t = byPath("/llms.txt").body;
  assert.match(t, /Configured price: \$88/);
  assert.match(t, /authoritative for the live price/);
});

test("llms-full.txt: carries the catalog, not the article bodies", () => {
  const t = byPath("/llms-full.txt").body;
  assert.match(t, /Example post/);
  assert.match(t, /https:\/\/www\.danielkliewer\.com\/blog\/2026-01-01-example-post/);
  assert.match(t, /tags: local-first-ai/i);
  assert.doesNotMatch(t, /SUPER_SECRET_BODY_MARKER/);
});

test("catalog.json: canonical URLs and counts", () => {
  const c = JSON.parse(byPath("/agents/catalog.json").body);
  assert.equal(c.counts.articles, 1);
  assert.equal(c.counts.projects, 1);
  assert.equal(c.counts.concepts, 1);
  assert.equal(c.counts.paths, 1);
  assert.equal(c.counts.chapters, 2);
  assert.equal(c.articles[0].url, "https://www.danielkliewer.com/blog/2026-01-01-example-post");
  assert.equal(c.projects[0].url, "https://www.danielkliewer.com/projects/example-project");
  assert.equal(c.concepts[0].url, "https://www.danielkliewer.com/concepts/local-first");
  assert.equal(c.paths[0].steps[0].url, "https://www.danielkliewer.com/concepts/local-first");
  assert.equal(
    c.paths[0].steps[1].url,
    "https://www.danielkliewer.com/blog/2026-01-01-example-post"
  );
});

test("graph.json: counts match the edges and absent is declared", () => {
  const g = JSON.parse(byPath("/agents/graph.json").body);
  const sum = Object.values(g.counts).reduce((a, b) => a + b, 0);
  const actual = Object.values(g.edges).reduce((a, l) => a + l.length, 0);
  assert.equal(sum, actual);
  assert.equal(g.counts.chapter_covers, 0);
  assert.equal(g.counts.recommends_reading, 1);
  assert.ok(g.absent.includes("extends"));
  assert.ok(g.absent.includes("validates"));
});

test("book.json: no invented product attributes, purchase needs a human", () => {
  const b = JSON.parse(byPath("/agents/book.json").body);
  assert.equal(b.title, BOOK.title);
  assert.equal(b.asin, BOOK.asin);
  assert.equal(b.amazonUrl, BOOK.amazonUrl);
  assert.equal(b.price.amount, "88");
  assert.equal(b.price.currency, "USD");
  assert.ok(b.price.note.length > 0);
  assert.equal(b.availability, undefined);
  assert.equal(b.rating, undefined);
  assert.equal(b.reviews, undefined);
  assert.equal(b.purchase.destination, BOOK.amazonUrl);
  assert.ok(b.purchase.authorizedBy.length > 0);
  assert.equal(b.chapters.length, 2);
});

test("index.json: every listed size matches the body, including its own", () => {
  const rs = resources();
  const idx = JSON.parse(byPath("/agents/index.json").body);
  assert.equal(idx.resources.length, rs.length);
  for (const r of idx.resources) {
    const body = rs.find((x) => x.path === r.path).body;
    assert.equal(r.bytes, Buffer.byteLength(body, "utf8"), `${r.path} byte size`);
    assert.ok(r.bytes > 0, `${r.path} is non-empty`);
  }
});

test("resources are deterministic: two builds are byte-identical", () => {
  const a = resources()
    .map((r) => r.body)
    .join("\n");
  const b = buildAgentResources(fixture())
    .map((r) => r.body)
    .join("\n");
  assert.equal(a, b);
});
