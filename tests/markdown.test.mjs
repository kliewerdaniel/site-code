/**
 * Tests for the canonical Markdown mirrors (src/lib/markdown-core.ts) and the
 * draft-exclusion rule in src/lib/posts.ts.
 *
 * The invariants locked here are the ones a mirror can break silently: a hash
 * that does not match the emitted bytes, a body that is not the article body,
 * a draft that reaches the corpus, or a title that does not survive YAML.
 *
 * Run: node --test tests/markdown.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  MARKDOWN_CONTENT_TYPE,
  canonicalBody,
  markdownDocId,
  markdownPath,
  parseMarkdownMirror,
  renderMarkdownMirror,
  sha256Hex,
  verifyMarkdownMirror,
} from "../src/lib/markdown-core.ts";
import { buildMarkdownMirrors } from "../src/lib/agent-resources-core.ts";
import { getAllPosts, getAllPostsIncludingDrafts } from "../src/lib/posts.ts";

const SITE = "https://www.danielkliewer.com";

const BODY = `# Heading One

Some paragraph with [a link](https://example.com) and \`inline code\`.

## Heading Two

- item one
- item two

\`\`\`ts
const x = 1;
\`\`\`

| A | B |
|---|---|
| 1 | 2 |
`;

function post(overrides = {}) {
  return {
    slug: "2026-01-01-example-post",
    title: 'Example: a title with "quotes", a colon, and a # hash',
    date: "2026-01-01T00:00:00.000Z",
    concepts: ["local-first", "provenance"],
    projects: ["example-project"],
    content: BODY,
    ...overrides,
  };
}

test("markdownPath / markdownDocId: stable, URL-independent identifiers", () => {
  assert.equal(markdownPath("2026-01-01-example-post"), "/research/2026-01-01-example-post.md");
  assert.equal(
    markdownDocId("2026-01-01-example-post"),
    "danielkliewer.com/article/2026-01-01-example-post"
  );
});

test("renderMarkdownMirror: emits every required metadata field", () => {
  const doc = renderMarkdownMirror(SITE, post({ updated: "2026-02-02T00:00:00.000Z" }));
  const { meta } = parseMarkdownMirror(doc);

  assert.equal(meta.docId, "danielkliewer.com/article/2026-01-01-example-post");
  assert.equal(meta.canonicalUrl, "https://www.danielkliewer.com/blog/2026-01-01-example-post");
  assert.equal(meta.title, 'Example: a title with "quotes", a colon, and a # hash');
  assert.equal(meta.published, "2026-01-01T00:00:00.000Z");
  assert.equal(meta.modified, "2026-02-02T00:00:00.000Z");
  assert.equal(meta.type, "article");
  assert.deepEqual(meta.concepts, ["local-first", "provenance"]);
  assert.deepEqual(meta.projects, ["example-project"]);
  assert.equal(meta.provenance.source, "content/research/2026-01-01-example-post.md");
  assert.equal(meta.provenance.generator, "src/lib/markdown-core.ts");
  assert.equal(meta.provenance.site, SITE);
});

test("renderMarkdownMirror: modified falls back to published", () => {
  const { meta } = parseMarkdownMirror(renderMarkdownMirror(SITE, post()));
  assert.equal(meta.modified, meta.published);
});

test("renderMarkdownMirror: hash and byte count match the emitted body", () => {
  const doc = renderMarkdownMirror(SITE, post());
  const { meta, body } = parseMarkdownMirror(doc);

  assert.equal(meta.contentHash, sha256Hex(body));
  assert.equal(meta.bytes, Buffer.byteLength(body, "utf8"));
  assert.equal(verifyMarkdownMirror(doc).ok, true);
  assert.deepEqual(verifyMarkdownMirror(doc).problems, []);
});

test("renderMarkdownMirror: the body is the article body, verbatim", () => {
  const doc = renderMarkdownMirror(SITE, post());
  const { body } = parseMarkdownMirror(doc);

  assert.equal(body, canonicalBody(BODY));
  assert.match(body, /^# Heading One/);
  assert.match(body, /## Heading Two/);
  assert.match(body, /- item one/);
  assert.match(body, /```ts\nconst x = 1;\n```/);
  assert.match(body, /\[a link\]\(https:\/\/example\.com\)/);
  assert.match(body, /\| A \| B \|/);
});

test("renderMarkdownMirror: contains no navigation or presentation chrome", () => {
  const doc = renderMarkdownMirror(SITE, post());
  assert.doesNotMatch(doc, /<html/i);
  assert.doesNotMatch(doc, /<nav/i);
  assert.doesNotMatch(doc, /SiteHeader|SiteFooter|AmazonCta/);
  assert.ok(doc.startsWith("---\n"));
});

test("renderMarkdownMirror: deterministic across calls", () => {
  const a = renderMarkdownMirror(SITE, post());
  const b = renderMarkdownMirror(SITE, post());
  assert.equal(a, b);
});

test("verifyMarkdownMirror: a tampered body is caught by the hash", () => {
  const doc = renderMarkdownMirror(SITE, post());
  const tampered = doc.replace("Some paragraph", "A different paragraph");
  const res = verifyMarkdownMirror(tampered);
  assert.equal(res.ok, false);
  assert.match(res.problems.join("\n"), /content_hash/);
});

test("verifyMarkdownMirror: a tampered byte count is caught", () => {
  const doc = renderMarkdownMirror(SITE, post());
  const tampered = doc.replace(/bytes: \d+/, "bytes: 1");
  const res = verifyMarkdownMirror(tampered);
  assert.equal(res.ok, false);
  assert.match(res.problems.join("\n"), /bytes/);
});

test("verifyMarkdownMirror: a body that differs from the source is caught", () => {
  const doc = renderMarkdownMirror(SITE, post());
  const res = verifyMarkdownMirror(doc, "a different source body");
  assert.equal(res.ok, false);
  assert.match(res.problems.join("\n"), /does not match the source/);
});

test("verifyMarkdownMirror: a missing frontmatter delimiter is refused", () => {
  const res = verifyMarkdownMirror("# not a mirror");
  assert.equal(res.ok, false);
  assert.match(res.problems.join("\n"), /frontmatter/);
});

test("canonicalBody: normalises leading blank lines and trailing whitespace", () => {
  assert.equal(canonicalBody("\n\n# Hi\n\n"), "# Hi\n");
  assert.equal(canonicalBody("  \n# Hi\n\n\n"), "# Hi\n");
  assert.equal(canonicalBody(""), "\n");
});

test("buildMarkdownMirrors: one mirror per published post, none for drafts", () => {
  const mirrors = buildMarkdownMirrors({
    site: {
      name: "Daniel Kliewer",
      url: SITE,
      description: "",
      github: "",
      x: "",
      linkedin: "",
      email: "",
    },
    book: {},
    posts: [
      {
        slug: "2026-01-01-a",
        title: "A",
        date: "2026-01-01T00:00:00.000Z",
        description: "",
        tags: [],
        readingMinutes: 1,
        content: "# A\n",
        concepts: [],
        projects: [],
      },
    ],
    projects: [],
    concepts: [],
    paths: [],
    chapters: [],
    graph: { counts: {}, edges: {}, absent: [] },
    bookLinks: [],
  });
  assert.equal(mirrors.length, 1);
  assert.equal(mirrors[0].path, "/research/2026-01-01-a.md");
  assert.equal(mirrors[0].contentType, MARKDOWN_CONTENT_TYPE);
  assert.equal(verifyMarkdownMirror(mirrors[0].body).ok, true);
});

test("posts: drafts are excluded from the published corpus but accounted for", () => {
  const published = getAllPosts();
  const all = getAllPostsIncludingDrafts();
  const draftSlugs = all.filter((p) => p.draft).map((p) => p.slug);

  assert.ok(draftSlugs.length > 0, "the fixture archive still contains drafts");
  assert.equal(published.length, all.length - draftSlugs.length);
  for (const slug of draftSlugs) {
    assert.equal(published.some((p) => p.slug === slug), false, `${slug} leaked`);
  }
  // The two known drafts from the 2026-11-13 audit.
  assert.equal(
    published.some((p) => p.slug === "2026-07-22-if-the-loop-is-the-product"),
    false
  );
  assert.equal(
    published.some((p) => p.slug === "2026-07-23-building-the-scientific-question-compiler"),
    false
  );
});

test("posts: the real archive renders a verifiable mirror for a real post", () => {
  const posts = getAllPosts();
  assert.ok(posts.length > 100);
  const sample = posts[0];
  const doc = renderMarkdownMirror(SITE, {
    slug: sample.slug,
    title: sample.title,
    date: sample.date,
    updated: sample.updated,
    concepts: [],
    projects: [],
    content: sample.content,
  });
  const res = verifyMarkdownMirror(doc, sample.content);
  assert.equal(res.ok, true, res.problems.join("\n"));
  assert.equal(Buffer.byteLength(fs.readFileSync(`content/research/${sample.slug}.md`, "utf8"), "utf8") > 0, true);
});
