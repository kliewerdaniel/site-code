/**
 * Tests for the relation graph (src/lib/relations-core.ts, book-links.ts).
 *
 * The graph is the trust layer for `/agents/graph.json`, so the invariants that
 * matter are: every edge resolves, relation types with no data source are
 * declared absent rather than fabricated, and the strong `chapter_covers`
 * claim is only made when it can be evidenced.
 *
 * Run: node --test tests/relations.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildRelationGraph,
  danglingEdges,
  chapterNode,
  ABSENT_RELATIONS,
} from "../src/lib/relations-core.ts";
import { BOOK_LINKS, linksForArticle, linksForChapter } from "../src/lib/book-links.ts";
import { CHAPTERS } from "../src/lib/chapters.ts";

const POSTS = new Set(
  fs
    .readdirSync("content/research")
    .filter((f) => f.endsWith(".md") && f !== "temp.md")
    .map((f) => f.replace(/\.md$/, ""))
);

function known() {
  return {
    posts: POSTS,
    projects: new Set(["example-project"]),
    concepts: new Set(["local-first"]),
    chapters: new Set(CHAPTERS.map((c) => c.n)),
  };
}

test("book-links: every entry names a real chapter, a reason, and a well-formed article", () => {
  for (const l of BOOK_LINKS) {
    assert.ok(CHAPTERS.some((c) => c.n === l.chapter), `unknown chapter ${l.chapter}`);
    assert.ok(l.article.length > 0, "article slug is empty");
    assert.ok(l.reason.trim().length > 0, `${l.article} states no reason`);
    assert.ok(
      l.relation === "recommends_reading" || l.relation === "chapter_covers",
      `unexpected relation ${l.relation}`
    );
  }
});

test("book-links: chapter_covers is empty — the manuscript does not reproduce articles", () => {
  // The strong claim is withheld rather than inferred from keyword overlap.
  // If someone adds one, they must also add the evidence in book-links.ts.
  assert.equal(
    BOOK_LINKS.filter((l) => l.relation === "chapter_covers").length,
    0
  );
});

test("book-links: the reverse indexes agree with the manifest", () => {
  for (const l of BOOK_LINKS) {
    assert.ok(linksForArticle(l.article).some((x) => x.chapter === l.chapter));
    assert.ok(linksForChapter(l.chapter).some((x) => x.article === l.article));
  }
});

test("buildRelationGraph: implements, documents, prerequisite_for and reading links", () => {
  const g = buildRelationGraph({
    projects: [
      { slug: "example-project", concepts: ["local-first"], articles: ["2026-01-01-a"] },
    ],
    concepts: [{ slug: "local-first" }],
    paths: [
      {
        slug: "p",
        steps: [
          { kind: "concept", ref: "local-first" },
          { kind: "article", ref: "2026-01-01-a" },
        ],
      },
    ],
    bookLinks: [
      {
        article: "2026-01-01-a",
        chapter: 1,
        relation: "recommends_reading",
        reason: "Chapter 1 §1.1.",
      },
    ],
  });
  assert.equal(g.counts.implements, 1);
  assert.equal(g.counts.documents, 1);
  assert.equal(g.counts.prerequisite_for, 1);
  assert.equal(g.counts.chapter_covers, 0);
  assert.equal(g.counts.recommends_reading, 1);
  assert.deepEqual(g.edges.recommends_reading[0].to, chapterNode(1));
  assert.ok(g.absent.includes("extends"));
  assert.ok(g.absent.includes("validates"));
});

test("danglingEdges: a fabricated slug is caught", () => {
  const g = buildRelationGraph({
    projects: [{ slug: "example-project", concepts: ["ghost-concept"], articles: ["ghost-post"] }],
    concepts: [{ slug: "local-first" }],
    paths: [{ slug: "p", steps: [{ kind: "article", ref: "ghost-post" }] }],
    bookLinks: [
      {
        article: "ghost-post",
        chapter: 99,
        relation: "recommends_reading",
        reason: "x",
      },
    ],
  });
  const d = danglingEdges(g, known());
  const why = d.map((x) => x.why).join("\n");
  assert.match(why, /unknown concept/);
  assert.match(why, /unknown post/);
  assert.match(why, /unknown chapter/);
});

test("ABSENT_RELATIONS: an absent type is declared but carries no edges", () => {
  const g = buildRelationGraph({ projects: [], concepts: [], paths: [], bookLinks: [] });
  for (const t of ABSENT_RELATIONS) {
    assert.equal(g.counts[t], 0);
    assert.equal(g.edges[t].length, 0);
  }
});
