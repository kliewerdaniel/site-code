/**
 * Tests for the graph explorer core (src/lib/explorer-core.ts).
 *
 * Pure functions: no React, no build. Run: node --test tests/graph-explorer.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExplorerData,
  computeLayout,
  defaultSelection,
  filterEdges,
  filterNodes,
  neighborhood,
} from "../src/lib/explorer-core.ts";

const INPUT = {
  articles: [
    { slug: "a1", title: "Article one", url: "https://x.test/blog/a1" },
    { slug: "a2", title: "Article two", url: "https://x.test/blog/a2" },
    { slug: "a3", title: "Article three", url: "https://x.test/blog/a3" },
  ],
  projects: [{ slug: "p1", name: "Project one", url: "https://x.test/projects/p1" }],
  concepts: [
    { slug: "c1", name: "Concept one", url: "https://x.test/concepts/c1" },
    { slug: "c2", name: "Concept two", url: "https://x.test/concepts/c2" },
  ],
  paths: [{ slug: "path1", name: "Path one", url: "https://x.test/paths/path1" }],
  chapters: [{ n: 1, title: "Chapter one", url: "https://x.test/book" }],
  edges: [
    {
      id: "implements:/projects/p1->/concepts/c1",
      from: "/projects/p1",
      to: "/concepts/c1",
      type: "implements",
      status: "declared",
      verification: "verified",
      provenance: { source: "taxonomy.ts", fingerprint: "a" },
    },
    {
      id: "documents:/blog/a1->/projects/p1",
      from: "/blog/a1",
      to: "/projects/p1",
      type: "documents",
      status: "declared",
      verification: "verified",
      provenance: { source: "taxonomy.ts", fingerprint: "b" },
    },
    {
      // raw refs, as the learning-path edges use
      id: "prerequisite_for:c1->a2",
      from: "c1",
      to: "a2",
      type: "prerequisite_for",
      status: "declared",
      verification: "verified",
      provenance: { source: "taxonomy.ts", fingerprint: "c" },
    },
    {
      id: "recommends_reading:/blog/a3->chapter:1",
      from: "/blog/a3",
      to: "chapter:1",
      type: "recommends_reading",
      status: "curated",
      verification: "curated",
      provenance: { source: "book-links.ts", fingerprint: "d" },
    },
    {
      id: "related_to:/blog/a1->/blog/a2",
      from: "/blog/a1",
      to: "/blog/a2",
      type: "related_to",
      status: "proposed",
      verification: "proposed",
      provenance: { source: "propose.ts", fingerprint: "e" },
    },
  ],
};

test("buildExplorerData: nodes, edges and raw-ref normalization", () => {
  const data = buildExplorerData(INPUT);
  assert.equal(data.nodes.length, 3 + 1 + 2 + 1 + 1);
  assert.equal(data.edges.length, 5);

  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  assert.equal(byId.get("/blog/a2")?.type, "article");
  assert.equal(byId.get("/concepts/c1")?.type, "concept");
  assert.equal(byId.get("chapter:1")?.type, "chapter");
  // the raw prerequisite_for refs resolved to canonical node ids
  const prereq = data.edges.find((e) => e.type === "prerequisite_for");
  assert.equal(prereq.from, "/concepts/c1");
  assert.equal(prereq.to, "/blog/a2");

  // degrees
  assert.equal(byId.get("/projects/p1")?.degree, 2);
  assert.equal(byId.get("/blog/a1")?.degree, 2);
});

test("buildExplorerData: an unknown ref becomes an external node", () => {
  const data = buildExplorerData({
    ...INPUT,
    edges: [
      {
        id: "x:/blog/a1->/blog/missing",
        from: "/blog/a1",
        to: "/blog/missing",
        type: "documents",
        status: "declared",
        verification: "verified",
      },
    ],
  });
  const node = data.nodes.find((n) => n.id === "/blog/missing");
  assert.equal(node?.type, "article");
  assert.equal(node?.label, "/blog/missing");
});

test("defaultSelection: the highest-degree concept", () => {
  const data = buildExplorerData(INPUT);
  assert.equal(defaultSelection(data), "/concepts/c1");
});

test("neighborhood: bounded, undirected, and reports truncation", () => {
  const data = buildExplorerData(INPUT);
  const edges = data.edges;
  const nb = neighborhood("/projects/p1", edges, 2);
  assert.ok(nb.nodeIds.includes("/concepts/c1"));
  assert.ok(nb.nodeIds.includes("/blog/a1"));
  assert.ok(nb.nodeIds.includes("/blog/a2"));
  assert.equal(nb.truncated, false);

  const tiny = neighborhood("/projects/p1", edges, 2, 2);
  assert.equal(tiny.nodeIds.length, 2);
  assert.equal(tiny.truncated, true);
});

test("computeLayout: deterministic positions for the selection and its ring", () => {
  const data = buildExplorerData(INPUT);
  const a = computeLayout("/projects/p1", data.nodes, data.edges, 1);
  const b = computeLayout("/projects/p1", data.nodes, data.edges, 1);
  assert.deepEqual(a, b);

  assert.equal(a.positions["/projects/p1"].depth, 0);
  assert.equal(a.positions["/projects/p1"].x, 360);
  assert.equal(a.positions["/projects/p1"].y, 280);
  assert.equal(a.positions["/concepts/c1"].depth, 1);
  assert.ok(a.edges.length >= 2);
});

test("filterNodes/filterEdges: query, type and relation filters", () => {
  const data = buildExplorerData(INPUT);
  const articles = filterNodes(data.nodes, "", new Set(["article"]));
  assert.equal(articles.length, 3);

  const searched = filterNodes(data.nodes, "concept one", new Set());
  assert.equal(searched.length, 1);

  const visible = new Set(["/projects/p1", "/concepts/c1"]);
  const edges = filterEdges(data.edges, new Set(["implements"]), visible);
  assert.equal(edges.length, 1);
  assert.equal(edges[0].type, "implements");

  // an empty relation set means all types
  const all = filterEdges(data.edges, new Set(), visible);
  assert.equal(all.length, 1);
});
