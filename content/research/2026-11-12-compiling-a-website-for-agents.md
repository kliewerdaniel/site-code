---
author: Daniel Kliewer
canonical_url: /blog/2026-11-12-compiling-a-website-for-agents
date: 11-12-2026
description: "The expensive part of serving knowledge to machines is rarely the knowledge. It is the format and the access pattern. Compile the structure once, publish it as plain cacheable files, state what you can prove and what you cannot, and the marginal cost of the next thousand readers, human or otherwise, drops to nearly nothing."
image: /images/ComfyUI_00200_.png
layout: post
title: "Compiling a Website for Agents: A Static Knowledge Corpus on Next.js"
tags:
  - blog
  
---
# Compiling a Website for Agents: A Static Knowledge Corpus on Next.js

danielkliewer.com now ships its 198 articles, 12 systems, 8 concepts, 3 learning paths and a 98-edge typed relation graph as six static files generated at build time, so an agent fetches one compact catalog instead of crawling the site.

## The problem: agents read the archive, and bandwidth is the bill

Automated agents found the archive useful, and their traffic used up my entire monthly Vercel free-tier bandwidth allowance. Blocking them was the obvious fix and the wrong one: the same readers who cost me bandwidth are the readers I want citing the work.

The real defect was the shape of the interface. An agent that wants one answer has to crawl HTML pages, each carrying navigation, scripts and styles, to find the few documents that matter. Every crawl repeats that cost. So the design question became: what is the cheapest interface that lets an agent find the right document and fetch only that one?

I set five constraints before writing any code:

1. **No runtime cost per agent request.** No database, no inference, no serverless function that does work per call. Everything is a static file on the CDN.
2. **One source of truth.** The human pages and the machine files are generated from the same registry, so they cannot disagree.
3. **Selective retrieval.** An agent fetches a compact index, picks documents, and fetches only those canonical URLs.
4. **No fabricated structure.** A relationship exists in the graph only if the build can prove it. Missing data is reported as missing.
5. **Public by default.** All research stays free to read, quote and cite; the commercial layer points to the book without gating anything.

### The arithmetic

The article bodies total 6.8 MB. A single resource that inlined them would cost 6.8 MB per fetch, which reproduces the problem. The compiled corpus instead separates the index from the bodies:

| Resource | Size | Role |
| --- | --- | --- |
| `/llms.txt` | 3.0 KB | Entry point and pointers |
| `/agents/index.json` | 2.5 KB | Master index of resources |
| `/agents/graph.json` | 18.6 KB | Typed relation graph |
| `/agents/book.json` | 17.7 KB | Book as a product record |
| `/llms-full.txt` | 126.0 KB | Full catalog as text, no bodies |
| `/agents/catalog.json` | 182.8 KB | Full catalog as structured data |

An agent that reads `catalog.json` and `graph.json` pays about 201 KB. Article bodies average roughly 34 KB each (6.8 MB over 198 articles), so a session that reads the catalog, the graph and five articles costs about 373 KB. A full crawl of the bodies costs 6.8 MB, about 18 times more, and that ratio is illustrative: real sessions vary. The point is that the expensive operation, reading bodies, becomes a deliberate choice instead of the default.

A useful way to keep yourself honest is to compute this from the build output instead of by hand. The script below prints the budget for any set of generated files:

```ts
// scripts/budget.ts
import { statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = ".next/server/app"; // adjust to where your static output lands
const files = [
  "llms.txt",
  "llms-full.txt",
  "agents/catalog.json",
  "agents/graph.json",
  "agents/book.json",
  "agents/index.json",
];

const kb = (n: number) => (n / 1024).toFixed(1);

let indexBytes = 0;
for (const f of files) {
  const size = statSync(join(OUT, f)).size;
  console.log(`${f.padEnd(24)} ${kb(size).padStart(8)} KB`);
  if (f.endsWith("catalog.json") || f.endsWith("graph.json")) indexBytes += size;
}

// Article bodies live in the rendered pages; sum the content source instead.
const bodyBytes = readdirSync("content/articles")
  .filter((f) => f.endsWith(".mdx"))
  .reduce((n, f) => n + statSync(join("content/articles", f)).size, 0);

const avg = bodyBytes / readdirSync("content/articles").length;
console.log(`\nindex (catalog+graph): ${kb(indexBytes)} KB`);
console.log(`bodies total:           ${kb(bodyBytes)} KB`);
console.log(`selective session (index + 5 articles): ${kb(indexBytes + 5 * avg)} KB`);
console.log(`full-body crawl:        ${kb(bodyBytes)} KB`);
```

## Architecture: one registry, six static files

&#91;embedded content: build pipeline and agent path · 4 stages\]

Source content is validated into one typed registry, the relation graph is resolved, and pure emitters write six static files that the CDN serves. An agent fetches the catalog first, picks documents, and requests only those pages. The human pages render from the same registry, so the two views cannot disagree.

## The source of truth: one typed registry

Every emitted file and every human page reads from a single in-memory registry built once per build. If the registry is wrong, the build fails; if it is right, the files and the pages cannot drift apart. This is the same compile-time pattern I use elsewhere: do the expensive, deterministic work once, ship the result as plain artifacts.

### Layout

```text
content/
  articles/*.mdx          # 198 articles, frontmatter + body
  projects.json           # 12 systems
  concepts.json           # 8 concepts, each defined by tags
  paths.json              # 3 learning paths with step dependencies
  book/
    book.config.json      # central product config (title, ISBN/ASIN, price)
    chapters.json         # 24 chapters and their sections
    recommendations.json  # curated article <-> chapter reading edges
lib/corpus/
  schema.ts               # zod schemas + types
  load.ts                 # reads content/, validates, builds the registry
  graph.ts                # derives and resolves edges (next section)
  emit.ts                 # pure functions: registry -> file contents
```

### Schemas

The schemas are the contract. Anything that does not parse stops the build, which is cheaper than discovering a malformed record from an agent's error report.

```ts
// lib/corpus/schema.ts
import { z } from "zod";

export const SITE = "https://www.danielkliewer.com";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "ISO date");

export const ArticleFrontmatter = z.object({
  title: z.string().min(1),
  date: isoDate,
  updated: isoDate.optional(),
  description: z.string().min(1).max(320),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

export const Concept = z.object({
  id: slug,
  name: z.string(),
  summary: z.string(),
  // A concept is DEFINED by tags. Its articles are computed, never listed by hand.
  tags: z.array(z.string().min(1)).min(1),
});

export const Project = z.object({
  id: slug,
  name: z.string(),
  summary: z.string(),
  repo: z.string().url().optional(),
  concepts: z.array(slug),   // project -> concept
  articles: z.array(slug),   // curated article -> project, validated against real slugs
});

export const PathStep = z.object({
  id: slug,
  kind: z.enum(["article", "project"]),
  ref: slug,
  requires: z.array(slug).default([]), // other step ids in the same path
});
export const LearningPath = z.object({
  id: slug,
  title: z.string(),
  audience: z.string(),
  steps: z.array(PathStep).min(1),
});

export const Chapter = z.object({
  number: z.number().int().positive(),
  id: slug,
  title: z.string(),
  sections: z.array(z.object({ id: slug, title: z.string() })),
});

export const Recommendation = z.object({
  article: slug,
  chapter: slug,
  section: slug,        // the chapter section the recommendation rests on
  rationale: z.string().min(1),
});

export type ArticleFM = z.infer<typeof ArticleFrontmatter>;
export type Concept = z.infer<typeof Concept>;
export type Project = z.infer<typeof Project>;
export type LearningPath = z.infer<typeof LearningPath>;
export type Chapter = z.infer<typeof Chapter>;
export type Recommendation = z.infer<typeof Recommendation>;

export interface Article extends ArticleFM {
  slug: string;
  url: string;          // canonical URL
  bytes: number;        // body size, used for retrieval budgeting
}

export interface Corpus {
  articles: Article[];
  concepts: Concept[];
  projects: Project[];
  paths: LearningPath[];
  chapters: Chapter[];
  recommendations: Recommendation[];
  version: string;      // content hash, see below
}
```

The `bytes` field is easy to overlook and worth keeping. It lets an agent budget its own fetches from the catalog before it requests a single article.

### The loader

Two properties matter here: output is **deterministic** (stable sort, no wall-clock timestamps in the payload) and the registry carries a **content hash**. Deterministic output means a rebuild with no content change produces byte-identical files, which keeps CDN caches and conditional requests effective.

```ts
// lib/corpus/load.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { z } from "zod";
import {
  SITE, ArticleFrontmatter, Concept, Project, LearningPath,
  Chapter, Recommendation, type Corpus, type Article,
} from "./schema";

const ROOT = process.cwd();
const readJson = <T>(rel: string, schema: z.ZodType<T>): T => {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid ${rel}:\n${parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  return parsed.data;
};

function loadArticles(): Article[] {
  const dir = path.join(ROOT, "content/articles");
  const out: Article[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fm = ArticleFrontmatter.parse(data);
    if (fm.draft) continue; // drafts never reach the corpus
    out.push({
      ...fm,
      slug,
      url: `${SITE}/research/${slug}`,
      bytes: Buffer.byteLength(content, "utf8"),
    });
  }
  // Stable order: newest first, slug as tiebreaker.
  return out.sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date));
}

let cache: Corpus | undefined;

export function loadCorpus(): Corpus {
  if (cache) return cache;

  const articles = loadArticles();
  const concepts = readJson("content/concepts.json", z.array(Concept));
  const projects = readJson("content/projects.json", z.array(Project));
  const paths = readJson("content/paths.json", z.array(LearningPath));
  const chapters = readJson("content/book/chapters.json", z.array(Chapter));
  const recommendations = readJson("content/book/recommendations.json", z.array(Recommendation));

  const body = { articles, concepts, projects, paths, chapters, recommendations };
  const version = crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex")
    .slice(0, 16);

  cache = { ...body, version };
  return cache;
}
```

The URL pattern (`/research/<slug>`) is a placeholder for whatever your canonical article route is. The important rule is that it is built in exactly one place, so a canonical URL in `catalog.json` can never differ from the one in the page's JSON-LD or `<link rel="canonical">`.

## The typed relation graph: derive, resolve, fail loudly

The graph carries 98 edges in four types: 27 project to concept, 16 article to project, 12 path-step dependencies and 43 article to chapter reading recommendations. Each type has one rule for where its edges come from, and one rule for what happens when an edge does not resolve.

| Relation | Count | Source of truth | Dangling edge |
| --- | --- | --- | --- |
| `project_concept` | 27 | `projects.json` `concepts[]` | Build error |
| `article_project` | 16 | `projects.json` `articles[]` | Build error |
| `path_requires` | 12 | `paths.json` step `requires[]` | Build error |
| `recommends_reading` | 43 | `recommendations.json`, each naming a chapter section | Build error |

Concept to article links are not stored. They are **computed from tags**: a concept lists tags, and its articles are exactly the articles carrying one of those tags. A concept therefore cannot claim writing that does not exist, because there is no list to get out of sync.

### Edge model

An edge carries its provenance, so a consumer can tell a computed edge from a curated one and see why it exists.

```ts
// lib/corpus/graph.ts
import type { Corpus } from "./schema";

export type NodeKind = "article" | "project" | "concept" | "path" | "chapter";
export type Relation =
  | "project_concept"
  | "article_project"
  | "path_requires"
  | "recommends_reading";

export interface Edge {
  relation: Relation;
  from: { kind: NodeKind; id: string };
  to: { kind: NodeKind; id: string };
  provenance: "declared" | "curated";
  // For curated edges: where the claim rests.
  evidence?: { chapter: string; section: string; rationale: string };
}

export interface Graph {
  version: string;
  edges: Edge[];
  /** Relation types that were proposed but have no data source. Reported, never faked. */
  absent: { relation: string; reason: string }[];
}
```

### Resolving edges

Every endpoint is checked against the registry. Instead of throwing on the first problem, the builder collects all of them, so one build run shows every defect at once.

```ts
export function buildGraph(c: Corpus): Graph {
  const articleIds = new Set(c.articles.map((a) => a.slug));
  const projectIds = new Set(c.projects.map((p) => p.id));
  const conceptIds = new Set(c.concepts.map((x) => x.id));
  const chapterIds = new Set(c.chapters.map((x) => x.id));
  const sectionsByChapter = new Map(
    c.chapters.map((ch) => [ch.id, new Set(ch.sections.map((s) => s.id))]),
  );

  const edges: Edge[] = [];
  const errors: string[] = [];
  const need = (ok: boolean, msg: string) => { if (!ok) errors.push(msg); };

  for (const p of c.projects) {
    for (const cid of p.concepts) {
      need(conceptIds.has(cid), `project ${p.id}: unknown concept '${cid}'`);
      edges.push({
        relation: "project_concept", provenance: "declared",
        from: { kind: "project", id: p.id }, to: { kind: "concept", id: cid },
      });
    }
    for (const slug of p.articles) {
      need(articleIds.has(slug), `project ${p.id}: unknown article '${slug}'`);
      edges.push({
        relation: "article_project", provenance: "declared",
        from: { kind: "article", id: slug }, to: { kind: "project", id: p.id },
      });
    }
  }

  for (const path of c.paths) {
    const stepIds = new Set(path.steps.map((s) => s.id));
    for (const step of path.steps) {
      const refOk = step.kind === "article" ? articleIds.has(step.ref) : projectIds.has(step.ref);
      need(refOk, `path ${path.id} step ${step.id}: unknown ${step.kind} '${step.ref}'`);
      for (const req of step.requires) {
        need(stepIds.has(req), `path ${path.id} step ${step.id}: requires unknown step '${req}'`);
        edges.push({
          relation: "path_requires", provenance: "declared",
          from: { kind: "path", id: `${path.id}/${step.id}` },
          to: { kind: "path", id: `${path.id}/${req}` },
        });
      }
    }
    detectCycle(path.id, path.steps, errors);
  }

  for (const r of c.recommendations) {
    need(articleIds.has(r.article), `recommendation: unknown article '${r.article}'`);
    need(chapterIds.has(r.chapter), `recommendation: unknown chapter '${r.chapter}'`);
    need(
      sectionsByChapter.get(r.chapter)?.has(r.section) ?? false,
      `recommendation ${r.article} -> ${r.chapter}: chapter has no section '${r.section}'`,
    );
    edges.push({
      relation: "recommends_reading", provenance: "curated",
      from: { kind: "article", id: r.article }, to: { kind: "chapter", id: r.chapter },
      evidence: { chapter: r.chapter, section: r.section, rationale: r.rationale },
    });
  }

  if (errors.length) {
    throw new Error(`Relation graph has ${errors.length} defect(s):\n` +
      errors.map((e) => `  - ${e}`).join("\n"));
  }

  edges.sort((a, b) =>
    (a.relation + a.from.id + a.to.id).localeCompare(b.relation + b.from.id + b.to.id));

  return { version: c.version, edges, absent: ABSENT_RELATIONS };
}

// Path steps must form a DAG, otherwise "requires" is meaningless.
function detectCycle(
  pathId: string,
  steps: { id: string; requires: string[] }[],
  errors: string[],
) {
  const deps = new Map(steps.map((s) => [s.id, s.requires]));
  const state = new Map<string, 1 | 2>(); // 1 = visiting, 2 = done
  const visit = (id: string, trail: string[]) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      errors.push(`path ${pathId}: dependency cycle ${[...trail, id].join(" -> ")}`);
      return;
    }
    state.set(id, 1);
    for (const d of deps.get(id) ?? []) visit(d, [...trail, id]);
    state.set(id, 2);
  };
  for (const s of steps) visit(s.id, []);
}
```

### Computing concept membership

Concept to article is derived at read time from tags. It never enters `edges`, so there is nothing to validate and nothing to go stale.

```ts
export function articlesForConcept(c: Corpus, conceptId: string): string[] {
  const concept = c.concepts.find((x) => x.id === conceptId);
  if (!concept) return [];
  const tags = new Set(concept.tags.map((t) => t.toLowerCase()));
  return c.articles
    .filter((a) => a.tags.some((t) => tags.has(t.toLowerCase())))
    .map((a) => a.slug);
}
```

Two details are easy to get wrong. Compare tags case-insensitively, or a stray capital letter silently removes an article from a concept. And treat a concept that resolves to zero articles as an error in CI, because an empty concept is almost always a tag typo.

## The emitters: pure functions, served as static route handlers

The emitters are pure functions from the registry to a string. They do no I/O of their own, which makes them trivial to unit test and guarantees that the page, the file and the test all see the same facts. Each is then exposed through a one-line Next.js route handler marked `force-static`, so Next renders it once at build time and Vercel serves it from the CDN with no function invocation.

### The output registry

A single table lists every file, its path, its content type and its builder. Route handlers, the index file and the verification scripts all read this one table.

```ts
// lib/corpus/emit.ts
import crypto from "node:crypto";
import { SITE, type Corpus } from "./schema";
import { buildGraph, articlesForConcept } from "./graph";
import { emitBook } from "./book";

export interface Output {
  path: string;
  type: string;
  build: (c: Corpus) => string;
}

const TEXT = "text/plain; charset=utf-8";
const JSON_TYPE = "application/json; charset=utf-8";
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

export const OUTPUTS: Output[] = [
  { path: "/llms.txt",             type: TEXT,      build: emitLlmsTxt },
  { path: "/llms-full.txt",        type: TEXT,      build: emitLlmsFull },
  { path: "/agents/catalog.json",  type: JSON_TYPE, build: (c) => json(emitCatalog(c)) },
  { path: "/agents/graph.json",    type: JSON_TYPE, build: (c) => json(buildGraph(c)) },
  { path: "/agents/book.json",     type: JSON_TYPE, build: (c) => json(emitBook(c)) },
  { path: "/agents/index.json",    type: JSON_TYPE, build: (c) => json(emitIndex(c)) },
];

export const sha = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
```

### `llms.txt`: the entry point

The file follows the `llms.txt` convention: an H1 with the site name, a blockquote summary, then sections of links. It is deliberately small. Its job is to say who this is, what is here, and where the structured catalogs live, not to list 198 articles.

```ts
function emitLlmsTxt(c: Corpus): string {
  const n = { a: c.articles.length, p: c.projects.length, k: c.concepts.length, l: c.paths.length };
  return [
    `# Daniel Kliewer`,
    ``,
    `> Research on local-first AI, computational sovereignty, systems architecture and agent governance.`,
    `> ${n.a} articles, ${n.p} systems, ${n.k} concepts, ${n.l} learning paths.`,
    `> All content is free to read, quote and cite. Cite the canonical URL and attribute Daniel Kliewer.`,
    ``,
    `## Retrieve efficiently`,
    ``,
    `1. Fetch ${SITE}/agents/catalog.json once. It is the whole corpus, without article bodies.`,
    `2. Select the documents that answer the question.`,
    `3. Fetch only those canonical URLs.`,
    `4. Follow typed edges in ${SITE}/agents/graph.json instead of re-reading the archive.`,
    ``,
    `## Machine-readable resources`,
    ``,
    `- [Catalog](${SITE}/agents/catalog.json): articles, projects, concepts, paths, chapters`,
    `- [Relation graph](${SITE}/agents/graph.json): typed edges with provenance`,
    `- [Full text catalog](${SITE}/llms-full.txt): every article with URL, date, tags, description`,
    `- [Book record](${SITE}/agents/book.json): the book as a product record`,
    `- [Index](${SITE}/agents/index.json): every resource with byte size and content type`,
    ``,
    `## Human entry points`,
    ``,
    `- [Research](${SITE}/research)`,
    `- [Concepts](${SITE}/concepts)`,
    `- [Learning paths](${SITE}/paths)`,
    `- [Book](${SITE}/book)`,
    ``,
  ].join("\n");
}
```

Note the absolute URLs. A frequent defect in `llms.txt` files is relative links, because the file is often read detached from the page it came from.

### `llms-full.txt`: a catalog, not a dump

The name invites a mistake: concatenating every article body. That is exactly the 6.8 MB response this design exists to avoid. `llms-full.txt` instead lists every article with its canonical URL, date, tags and description. It is a text-mode catalog for agents that prefer plain text to JSON.

```ts
function emitLlmsFull(c: Corpus): string {
  const lines: string[] = [
    `# Daniel Kliewer: full catalog`,
    ``,
    `> One entry per article. Bodies are not included; fetch the canonical URL for the body.`,
    `> Catalog version: ${c.version}`,
    ``,
  ];
  for (const a of c.articles) {
    lines.push(
      `## ${a.title}`,
      `- url: ${a.url}`,
      `- published: ${a.date}${a.updated ? `  updated: ${a.updated}` : ""}`,
      `- tags: ${a.tags.join(", ") || "(none)"}`,
      `- size: ${a.bytes} bytes`,
      ``,
      a.description,
      ``,
    );
  }
  return lines.join("\n");
}
```

### `catalog.json`: the structured corpus

The catalog is the file an agent fetches once. It carries each article's size, and for each article the concepts and projects it belongs to, so most selection can happen without opening the graph at all.

```ts
function emitCatalog(c: Corpus) {
  const conceptsOf = new Map<string, string[]>();
  for (const k of c.concepts) {
    for (const slug of articlesForConcept(c, k.id)) {
      conceptsOf.set(slug, [...(conceptsOf.get(slug) ?? []), k.id]);
    }
  }
  const projectsOf = new Map<string, string[]>();
  for (const p of c.projects) {
    for (const slug of p.articles) {
      projectsOf.set(slug, [...(projectsOf.get(slug) ?? []), p.id]);
    }
  }

  return {
    schema: "danielkliewer.com/catalog@1",
    version: c.version,
    site: SITE,
    attribution: "Daniel Kliewer",
    counts: {
      articles: c.articles.length, projects: c.projects.length,
      concepts: c.concepts.length, paths: c.paths.length, chapters: c.chapters.length,
    },
    articles: c.articles.map((a) => ({
      slug: a.slug, url: a.url, title: a.title,
      published: a.date, updated: a.updated ?? a.date,
      description: a.description, tags: a.tags, bytes: a.bytes,
      concepts: conceptsOf.get(a.slug) ?? [],
      projects: projectsOf.get(a.slug) ?? [],
    })),
    projects: c.projects.map((p) => ({
      id: p.id, name: p.name, summary: p.summary, repo: p.repo ?? null,
      concepts: p.concepts, articles: p.articles,
    })),
    concepts: c.concepts.map((k) => ({
      id: k.id, name: k.name, summary: k.summary, tags: k.tags,
      articles: articlesForConcept(c, k.id),
    })),
    paths: c.paths,
    chapters: c.chapters.map((ch) => ({
      number: ch.number, id: ch.id, title: ch.title,
      sections: ch.sections,
    })),
  };
}
```

### `index.json`: self-describing

The index lists every other resource with its size and content type, and a content hash an agent can compare against a copy it already holds. It excludes itself to avoid a circular definition.

```ts
function emitIndex(c: Corpus) {
  return {
    schema: "danielkliewer.com/index@1",
    version: c.version,
    resources: OUTPUTS.filter((o) => o.path !== "/agents/index.json").map((o) => {
      const body = o.build(c);
      return {
        path: o.path,
        url: `${SITE}${o.path}`,
        type: o.type.split(";")[0],
        bytes: Buffer.byteLength(body, "utf8"),
        sha256_16: sha(body),
      };
    }),
  };
}
```

Because sizes are measured from the built strings and never typed by hand, the numbers on the `/agents` page and in `index.json` are correct by construction.

### Route handlers

One shared helper serves every file. In the App Router, a folder named `llms.txt` containing `route.ts` serves the path `/llms.txt`, and `force-static` makes Next generate the response once at build.

```ts
// lib/corpus/serve.ts
import { loadCorpus } from "./load";
import { OUTPUTS, sha } from "./emit";

export function serve(path: string) {
  const out = OUTPUTS.find((o) => o.path === path);
  if (!out) throw new Error(`No output registered for ${path}`);
  return async function GET() {
    const body = out.build(loadCorpus());
    return new Response(body, {
      headers: {
        "Content-Type": out.type,
        ETag: `"${sha(body)}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}
```

```ts
// app/llms.txt/route.ts
import { serve } from "@/lib/corpus/serve";
export const dynamic = "force-static";
export const GET = serve("/llms.txt");
```

```ts
// app/agents/catalog.json/route.ts
import { serve } from "@/lib/corpus/serve";
export const dynamic = "force-static";
export const GET = serve("/agents/catalog.json");
```

The other four files follow the same two-line pattern. Cache lifetime headers are set once for all of them at the platform level, covered in the caching section below, so the handlers stay free of policy.

## Provenance: what the graph refuses to claim

A knowledge graph that agents consume is a set of claims, and a claim with no evidence behind it is the failure mode that makes machine-readable sites untrustworthy. So the graph has a second job beyond carrying edges: it must be explicit about the edges it does not have.

I sorted every proposed relation into three states.

| State | Relations | How it is represented |
| --- | --- | --- |
| Present, computed or declared | `project_concept`, `article_project`, `path_requires` | Edges with `provenance: "declared"`, validated at build |
| Present, curated with evidence | `recommends_reading` | Edges with `provenance: "curated"` and an `evidence` block naming a chapter section |
| Absent: no data source | `extends`, `validates`, `explains`, `expands_on`, `related_product` | Listed under `absent` with a reason, no edges |
| Empty by evidence | `chapter_covers` | Listed under `empty_by_evidence`, zero edges |

### Absent versus empty

The two lower rows look similar and mean different things. An **absent** relation is one nobody has produced data for, so the graph could only fill it by guessing. An **empty-by-evidence** relation is one where I checked and the answer is no.

`chapter_covers` is the strong claim that a specific chapter covers a specific article. The book manuscript is a synthesized treatment, not a collection of reproduced articles, so no such mapping can be verified. Publishing guessed `chapter_covers` edges would have been easy and would have made the graph look richer. It would also have been wrong in a way an agent could repeat to a human as fact. The weaker relation, `recommends_reading`, makes a claim I can stand behind: this article is useful background for this chapter section, with the section named.

```ts
// lib/corpus/graph.ts (additions)
export interface Graph {
  version: string;
  edges: Edge[];
  /** Proposed relation types with no data source. Reported, never faked. */
  absent: { relation: string; reason: string }[];
  /** Relations checked and found to have no verifiable instances. */
  empty_by_evidence: { relation: string; reason: string }[];
}

export const ABSENT_RELATIONS = [
  { relation: "extends",       reason: "No source of truth records which work extends another." },
  { relation: "validates",     reason: "No source of truth records validation relationships." },
  { relation: "explains",      reason: "No source of truth records explanatory relationships." },
  { relation: "expands_on",    reason: "No source of truth records expansion relationships." },
  { relation: "related_product", reason: "Only one product exists; no relation data to derive." },
];

export const EMPTY_BY_EVIDENCE = [
  {
    relation: "chapter_covers",
    reason:
      "The manuscript is a synthesized treatment that does not reproduce individual " +
      "articles, so no chapter-to-article coverage claim can be verified.",
  },
];
```

Then return both lists from `buildGraph`: `return { version: c.version, edges, absent: ABSENT_RELATIONS, empty_by_evidence: EMPTY_BY_EVIDENCE }`.

### Guarding the curated edges

Curated edges are the one place a human can sneak an overclaim in. Three rules keep them honest, enforced in code instead of left to discipline:

1. The named chapter **section must exist** (already checked in `buildGraph`).
2. The rationale must be present and substantive.
3. The rationale must not use coverage language. If it says a chapter "covers" or "reproduces" an article, it is making the `chapter_covers` claim through the back door.

```ts
// lib/corpus/lint.ts
import type { Recommendation } from "./schema";

const COVERAGE_WORDS = /\b(covers?|reproduces?|contains?|includes?|is based on|adapted from)\b/i;

export function lintRecommendations(recs: Recommendation[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const r of recs) {
    const key = `${r.article}|${r.chapter}|${r.section}`;
    if (seen.has(key)) problems.push(`duplicate recommendation: ${key}`);
    seen.add(key);

    if (r.rationale.trim().length < 40) {
      problems.push(`${key}: rationale too short to be evidence`);
    }
    if (COVERAGE_WORDS.test(r.rationale)) {
      problems.push(
        `${key}: rationale uses coverage language; recommends_reading ` +
        `must not imply chapter_covers`,
      );
    }
  }
  return problems;
}
```

A curated record then looks like this, with the claim and its basis side by side:

```json
{
  "article": "example-article-slug",
  "chapter": "example-chapter-id",
  "section": "example-section-id",
  "rationale": "Gives hands-on background for the section's discussion of local inference trade-offs."
}
```

### Why this matters for agents

An agent that reads `empty_by_evidence` learns something concrete: the site does not claim that relationship, so it should not infer one. An agent that sees only a missing field cannot tell "no data" from "not checked". Making absence explicit is cheap and it is the difference between a corpus that can be cited and one that can only be scraped.

## The book: a product record, a reading map and a conduct contract

The research stays free. The commercial layer adds one thing: an explicit, verifiable link between the research and *Computational Sovereignty: Building Local-First AI Systems*, so that an agent whose operator is working on a related problem can recognize the book as relevant reading and hand the human a purchase link. The book is one artifact inside the program, not the program itself.

Three separate pieces carry this, and keeping them separate is the design:

- **A product record** that states facts from a central config and nothing else.
- **A reading map** that connects articles to chapter sections, built from the curated edges above.
- **A conduct contract** that says what an agent may and may not do, expressed as data.

### One config, many consumers

The book's title, format, page count, purchase URL and list price live in one file. The `/book` page, `book.json`, the JSON-LD on that page and the `/agents` page all read it. Change the price once and everything follows.

```json
// content/book/book.config.json
{
  "title": "Computational Sovereignty: Building Local-First AI Systems",
  "author": "Daniel Kliewer",
  "format": "hardcover",
  "pages": 214,
  "chapters": 24,
  "approx_words": 46000,
  "purchase_url": "https://www.amazon.com/dp/B0HMWFR6G7",
  "list_price": { "amount": 88, "currency": "USD", "checked": "2026-11-12" },
  "sample_url": "https://www.danielkliewer.com/sample",
  "summary": "Run serious AI on hardware you own: full applications, no cloud, no exfiltration."
}
```

The `checked` date is a value I set by hand when I verify the price, not a build timestamp. A build timestamp would claim freshness the build cannot know.

### Emitting `book.json`

The emitter states what is known and lists what it deliberately does not provide. There is no `availability` field, no rating and no reviews, because none of those can be known from a static build and inventing them would be the exact fabrication this design avoids.

```ts
// lib/corpus/book.ts
import fs from "node:fs";
import path from "node:path";
import { SITE, type Corpus } from "./schema";

const config = () =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/book/book.config.json"), "utf8"));

export function emitBook(c: Corpus) {
  const cfg = config();
  const chapterById = new Map(c.chapters.map((ch) => [ch.id, ch]));
  const articleBySlug = new Map(c.articles.map((a) => [a.slug, a]));

  // article slug -> where the book is relevant, with the stated basis
  const readingMap: Record<string, unknown[]> = {};
  for (const r of c.recommendations) {
    const ch = chapterById.get(r.chapter)!;
    const sec = ch.sections.find((s) => s.id === r.section)!;
    (readingMap[r.article] ??= []).push({
      chapter: { number: ch.number, id: ch.id, title: ch.title },
      section: { id: sec.id, title: sec.title },
      rationale: r.rationale,
      article_url: articleBySlug.get(r.article)!.url,
    });
  }

  return {
    schema: "danielkliewer.com/book@1",
    version: c.version,
    title: cfg.title,
    author: cfg.author,
    format: cfg.format,
    pages: cfg.pages,
    chapters: cfg.chapters,
    approx_words: cfg.approx_words,
    summary: cfg.summary,
    purchase: {
      url: cfg.purchase_url,
      list_price: cfg.list_price,
      authority:
        "The retailer listing is the only authoritative source for live price and availability.",
    },
    free_sample: cfg.sample_url,
    chapter_outline: c.chapters.map((ch) => ({
      number: ch.number, id: ch.id, title: ch.title,
      sections: ch.sections,
    })),
    reading_map: readingMap,
    not_provided: ["availability", "ratings", "reviews", "chapter_covers"],
    conduct: CONDUCT,
    page: `${SITE}/book`,
  };
}

const CONDUCT = {
  content_access: "All site content is free to read, quote and cite with attribution.",
  recommend_when:
    "The operator's task overlaps a chapter or section listed in chapter_outline or reading_map.",
  do_not: [
    "Execute, initiate or complete a purchase on behalf of a human.",
    "State price or availability as current; defer to the retailer listing.",
    "Claim that a chapter reproduces or covers a specific article.",
  ],
  authorization:
    "No resource on this site authorizes a purchase. A human operator must decide and buy.",
};
```

Putting the conduct rules in `book.json` as data, as well as in prose on the `/agents` page, is deliberate. An agent framework that parses JSON can act on `do_not` directly. Imperative prose aimed at a model is more likely to be treated as untrusted page content or ignored, so the structured form travels further.

### Structured data on the human page

The `/book` page carries the same facts as schema.org JSON-LD, generated from the same config. It includes an offer with a price but no availability claim and no aggregate rating.

```tsx
// app/book/page.tsx (excerpt)
import fs from "node:fs";
import path from "node:path";

const cfg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content/book/book.config.json"), "utf8"),
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: cfg.title,
  author: { "@type": "Person", name: cfg.author },
  bookFormat: "https://schema.org/Hardcover",
  numberOfPages: cfg.pages,
  description: cfg.summary,
  offers: {
    "@type": "Offer",
    url: cfg.purchase_url,
    price: cfg.list_price.amount,
    priceCurrency: cfg.list_price.currency,
    // Deliberately no `availability`: a static build cannot know it.
  },
};

export default function BookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* page content */}
    </>
  );
}
```

### What an agent can do with this

Given an article it has already read, an agent can look up `reading_map[slug]` and learn which chapter section is relevant and why, then tell its operator something specific such as "chapter 9, section on local inference trade-offs, is relevant background; here is the retailer link." That is a recommendation tied to evidence. A generic "you might like this book" is easy to ignore, and I would rather the agent say nothing than say that.

## Caching and bot policy: making the cheap path the cheap one

Static files only save bandwidth if they are cached well and if agents are actually steered toward them. Both are configuration, not code, and both are easy to get slightly wrong.

### Cache headers

The corpus files change only when the content changes, and every build produces byte-identical output for identical content. That allows a policy of short browser lifetimes with long edge lifetimes plus validators: edges serve from cache, and a client that already holds a copy revalidates with `If-None-Match` and gets a tiny `304` instead of the body.

```ts
// next.config.ts
import type { NextConfig } from "next";

const corpusCache = [
  {
    key: "Cache-Control",
    // Browsers/agents may reuse for an hour; the CDN holds for a day and may serve
    // a stale copy for another day while it revalidates in the background.
    value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Lets browser-based agents and tools read the corpus cross-origin.
  { key: "Access-Control-Allow-Origin", value: "*" },
];

const config: NextConfig = {
  async headers() {
    return [
      { source: "/llms.txt",         headers: corpusCache },
      { source: "/llms-full.txt",    headers: corpusCache },
      { source: "/agents/:file(catalog|graph|book|index).json", headers: corpusCache },
    ];
  },
};

export default config;
```

The `ETag` is set in the route handler (the `serve` helper above) from a hash of the body. Because output is deterministic, the ETag only changes when the content does. Two properties to confirm after every deploy:

```bash
# 1. The CDN is serving from cache, not re-running anything
curl -sI https://www.danielkliewer.com/agents/catalog.json | grep -iE 'cache-control|etag|x-vercel-cache|content-encoding'

# 2. Conditional requests work: this should return 304 with no body
ETAG=$(curl -sI https://www.danielkliewer.com/agents/catalog.json | awk -F': ' 'tolower($1)=="etag"{print $2}' | tr -d '\r')
curl -s -o /dev/null -w '%{http_code}\n' -H "If-None-Match: $ETAG" https://www.danielkliewer.com/agents/catalog.json
```

Check `content-encoding` too. The sizes quoted earlier are uncompressed; JSON and text compress well on the wire, so measure transfer size from your platform's logs rather than from file sizes.

### Letting agents skip the download entirely

`index.json` already carries a `version` and a per-file `sha256_16`. A polite agent can fetch the 2.5 KB index, compare the hash against the catalog it cached last time, and skip the 183 KB fetch when nothing changed. That makes the steady-state cost of a repeat visit close to zero, which is the property that matters most for an agent that returns daily.

### Advertise the machine entry points

Agents that land on an HTML page should be able to discover the machine files from it. Add alternates to the root layout metadata so every page carries them in its head:

```tsx
// app/layout.tsx (excerpt)
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    types: {
      "text/plain": [{ url: "/llms.txt", title: "llms.txt" }],
      "application/json": [{ url: "/agents/catalog.json", title: "Corpus catalog" }],
    },
  },
};
```

### robots.txt and the limits of politeness

`robots.txt` is advisory. Well-behaved crawlers honor it and many agents do not, so treat it as a signal, not enforcement. It is still worth stating your preference clearly: point crawlers at the compiled resources and the sitemap.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/agents/"],
      },
    ],
    sitemap: "https://www.danielkliewer.com/sitemap.xml",
    host: "https://www.danielkliewer.com",
  };
}
```

For traffic that ignores the signal, enforcement belongs at the platform edge, not in your application. Rate-limit or challenge by user agent or request rate on the HTML routes using your host's firewall rules, if your plan includes them. Two cautions from the design constraints above:

- **Avoid middleware on the hot path.** Next.js middleware runs per request and can itself consume invocations. A firewall rule evaluates before your code runs.
- **Never rate-limit the corpus files.** They are the cheap path. Throttling them pushes agents back to crawling HTML, which defeats the whole design.

The result is a deliberate asymmetry: the compiled files are fast, cacheable and unrestricted, and the expensive HTML routes are the ones you may choose to meter.

## The `/agents` page: documentation generated from the same registry

The `/agents` page is the human-readable front door to the machine interface: counts, the list of files with their sizes, the retrieval recipe, the provenance statement and the conduct rules. Its defining property is that it contains no hand-typed facts. Counts, sizes and edge totals are computed from the same registry and the same `OUTPUTS` table the files come from, so the page cannot go stale relative to the files it describes.

### Computing the page's facts

```ts
// lib/corpus/stats.ts
import { loadCorpus } from "./load";
import { OUTPUTS, sha } from "./emit";
import { buildGraph } from "./graph";
import { SITE } from "./schema";

export function agentPageData() {
  const c = loadCorpus();
  const graph = buildGraph(c);

  const edgesByRelation = graph.edges.reduce<Record<string, number>>((acc, e) => {
    acc[e.relation] = (acc[e.relation] ?? 0) + 1;
    return acc;
  }, {});

  const files = OUTPUTS.map((o) => {
    const body = o.build(c);
    return {
      path: o.path,
      url: `${SITE}${o.path}`,
      type: o.type.split(";")[0],
      bytes: Buffer.byteLength(body, "utf8"),
      hash: sha(body),
    };
  });

  return {
    counts: {
      articles: c.articles.length,
      projects: c.projects.length,
      concepts: c.concepts.length,
      paths: c.paths.length,
      chapters: c.chapters.length,
      edges: graph.edges.length,
    },
    edgesByRelation,
    files,
    absent: graph.absent,
    emptyByEvidence: graph.empty_by_evidence,
    version: c.version,
  };
}

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`;
```

### The page

The page is a server component with no client JavaScript required. It is statically generated, so serving it costs the same as any other file.

```tsx
// app/agents/page.tsx
import type { Metadata } from "next";
import { agentPageData, formatBytes } from "@/lib/corpus/stats";
import { SITE } from "@/lib/corpus/schema";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "For agents",
  description:
    "A statically compiled research corpus: machine-readable resources, a typed relation graph, and how to cite it.",
  alternates: { canonical: `${SITE}/agents` },
};

export default function AgentsPage() {
  const d = agentPageData();

  // schema.org Dataset: each file is a distribution with its real size and type
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "danielkliewer.com research corpus",
    creator: { "@type": "Person", name: "Daniel Kliewer" },
    url: `${SITE}/agents`,
    version: d.version,
    isAccessibleForFree: true,
    distribution: d.files.map((f) => ({
      "@type": "DataDownload",
      contentUrl: f.url,
      encodingFormat: f.type,
      contentSize: `${f.bytes} B`,
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>The corpus, compiled</h1>
      <p>
        {d.counts.articles} articles, {d.counts.projects} systems, {d.counts.concepts} concepts and{" "}
        {d.counts.paths} learning paths, bound by {d.counts.edges} typed edges.
      </p>

      <h2>Machine-readable resources</h2>
      <ul>
        {d.files.map((f) => (
          <li key={f.path}>
            <a href={f.path}>{f.path}</a> · {formatBytes(f.bytes)} · {f.type}
          </li>
        ))}
      </ul>

      <h2>What the graph claims, and what it refuses to</h2>
      <p>
        {d.absent.length} proposed relation types have no data source and are reported as absent:{" "}
        {d.absent.map((a) => a.relation).join(", ")}.
      </p>
      {d.emptyByEvidence.map((e) => (
        <p key={e.relation}>
          <code>{e.relation}</code> is empty by evidence. {e.reason}
        </p>
      ))}
    </main>
  );
}
```

The `Dataset` JSON-LD is worth the few lines. It gives tooling that does not know the `llms.txt` convention a standard, widely understood description of what is downloadable, with real sizes and media types, derived from the same table.

## Verification: build gates, contract tests, and measuring the outcome

A compiled corpus is only trustworthy if broken output cannot ship. There are two separate questions to verify: is the output **correct**, and did it **work**, meaning did agent traffic actually move onto the cheap path.

### The build gate

One script runs before every build. It loads the registry, builds the graph, builds every output twice and checks a short list of invariants. Any failure exits non-zero, so a bad corpus never reaches Vercel.

```ts
// scripts/verify-corpus.ts
import { loadCorpus } from "../lib/corpus/load";
import { buildGraph, articlesForConcept } from "../lib/corpus/graph";
import { lintRecommendations } from "../lib/corpus/lint";
import { OUTPUTS, sha } from "../lib/corpus/emit";
import { SITE } from "../lib/corpus/schema";

const problems: string[] = [];
const fail = (m: string) => problems.push(m);

const c = loadCorpus();

// 1. Graph resolves (buildGraph throws with every defect listed)
let graph;
try { graph = buildGraph(c); } catch (e) { fail(String((e as Error).message)); }

// 2. Curated edges are honest
for (const p of lintRecommendations(c.recommendations)) fail(p);

// 3. No concept resolves to zero articles (usually a tag typo)
for (const k of c.concepts) {
  if (articlesForConcept(c, k.id).length === 0) fail(`concept '${k.id}' has no articles`);
}

// 4. Slugs and canonical URLs are unique
const slugs = new Set<string>();
for (const a of c.articles) {
  if (slugs.has(a.slug)) fail(`duplicate slug '${a.slug}'`);
  slugs.add(a.slug);
  if (!a.url.startsWith(`${SITE}/`)) fail(`non-canonical url for '${a.slug}': ${a.url}`);
}

// 5. Outputs: deterministic, absolute URLs only, within budget
const BUDGET: Record<string, number> = {
  "/llms.txt": 8 * 1024,            // entry point must stay small
  "/agents/index.json": 8 * 1024,
  "/agents/graph.json": 64 * 1024,
  "/llms-full.txt": 256 * 1024,
  "/agents/catalog.json": 384 * 1024,
  "/agents/book.json": 64 * 1024,
};

for (const o of OUTPUTS) {
  const a = o.build(c);
  const b = o.build(c);
  if (sha(a) !== sha(b)) fail(`${o.path}: output is not deterministic`);

  const bytes = Buffer.byteLength(a, "utf8");
  const limit = BUDGET[o.path];
  if (limit && bytes > limit) fail(`${o.path}: ${bytes} B exceeds budget ${limit} B`);

  // Every URL in the output must be absolute and on this host
  for (const m of a.matchAll(/\]\((\/[^)\s]*)\)|"url":\s*"(\/[^"]*)"/g)) {
    fail(`${o.path}: relative URL ${m[1] ?? m[2]}`);
  }

  if (o.type.startsWith("application/json")) {
    try { JSON.parse(a); } catch { fail(`${o.path}: invalid JSON`); }
  }
}

// 6. The graph contains only relations we allow
const ALLOWED = new Set(["project_concept", "article_project", "path_requires", "recommends_reading"]);
for (const e of graph?.edges ?? []) {
  if (!ALLOWED.has(e.relation)) fail(`unexpected relation '${e.relation}'`);
}

if (problems.length) {
  console.error(`corpus verification failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`corpus ok: ${c.articles.length} articles, ${graph!.edges.length} edges, version ${c.version}`);
```

The size budgets are the important regression guard. They are what stops a future change, such as someone adding article bodies to the catalog for convenience, from silently turning a 183 KB file into a multi-megabyte one. The budget gives headroom above current sizes, so normal growth passes and a structural change fails loudly.

Wire it into the build so it cannot be skipped:

```json
{
  "scripts": {
    "verify:corpus": "tsx scripts/verify-corpus.ts",
    "prebuild": "npm run verify:corpus",
    "test": "vitest run"
  }
}
```

### Contract tests

The gate catches defects in content. Tests catch defects in the emitters themselves, using a tiny fixture corpus so failures are easy to read.

```ts
// lib/corpus/__tests__/graph.test.ts
import { describe, it, expect } from "vitest";
import { buildGraph } from "../graph";
import { fixture } from "./fixture";

describe("buildGraph", () => {
  it("rejects an edge to an article that does not exist", () => {
    const c = fixture({ projects: [{ id: "p", articles: ["ghost"] }] });
    expect(() => buildGraph(c)).toThrow(/unknown article 'ghost'/);
  });

  it("rejects a recommendation naming a missing chapter section", () => {
    const c = fixture({
      recommendations: [{ article: "a1", chapter: "ch1", section: "nope", rationale: "x".repeat(50) }],
    });
    expect(() => buildGraph(c)).toThrow(/no section 'nope'/);
  });

  it("rejects dependency cycles in a learning path", () => {
    const c = fixture({
      paths: [{ id: "lp", steps: [
        { id: "s1", kind: "article", ref: "a1", requires: ["s2"] },
        { id: "s2", kind: "article", ref: "a2", requires: ["s1"] },
      ] }],
    });
    expect(() => buildGraph(c)).toThrow(/cycle/);
  });

  it("never emits chapter_covers", () => {
    const g = buildGraph(fixture({}));
    expect(g.edges.some((e) => (e.relation as string) === "chapter_covers")).toBe(false);
    expect(g.empty_by_evidence.map((x) => x.relation)).toContain("chapter_covers");
  });
});
```

### Check the claim against the rendered pages

One more check closes the loop between machine and human views. For each article, the canonical URL in the catalog should equal the canonical link in the built HTML. This is the test that proves "an agent and a human read the same facts" instead of asserting it.

```ts
// scripts/verify-canonical.ts (run after `next build`)
import fs from "node:fs";
import path from "node:path";
import { loadCorpus } from "../lib/corpus/load";

const c = loadCorpus();
let bad = 0;
for (const a of c.articles) {
  const file = path.join(".next/server/app/research", `${a.slug}.html`);
  if (!fs.existsSync(file)) { console.error(`missing built page: ${a.slug}`); bad++; continue; }
  const html = fs.readFileSync(file, "utf8");
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  if (!m || m[1] !== a.url) {
    console.error(`canonical mismatch for ${a.slug}: catalog=${a.url} html=${m?.[1]}`);
    bad++;
  }
}
process.exit(bad ? 1 : 0);
```

### Did it work? Measure from request logs

Correctness says nothing about whether agents moved to the cheap path. That needs request logs. Export a window of logs from your platform (a log drain or log export, depending on plan) as newline-delimited JSON with at least the path, user agent and response bytes, then classify traffic.

```python
# scripts/traffic_report.py
# usage: python traffic_report.py logs.ndjson
import json, sys, re
from collections import defaultdict

AGENT_UA = re.compile(r"(bot|crawler|spider|gpt|claude|perplexity|ccbot|agent)", re.I)

def klass(path: str) -> str:
    if path.startswith("/agents/") or path in ("/llms.txt", "/llms-full.txt"):
        return "corpus"
    if path.startswith("/research/"):
        return "article_html"
    return "other_html"

bytes_by = defaultdict(int)
reqs_by = defaultdict(int)

with open(sys.argv[1]) as f:
    for line in f:
        r = json.loads(line)
        # field names vary by log source; adapt these three lines
        path, ua, size = r["path"], r.get("userAgent", ""), int(r.get("bytes", 0))
        if not AGENT_UA.search(ua):
            continue
        k = klass(path)
        bytes_by[k] += size
        reqs_by[k] += 1

total = sum(bytes_by.values()) or 1
print(f"{'class':<14}{'requests':>10}{'MB':>10}{'share':>8}")
for k in sorted(bytes_by, key=bytes_by.get, reverse=True):
    print(f"{k:<14}{reqs_by[k]:>10}{bytes_by[k]/1e6:>10.2f}{bytes_by[k]/total:>8.0%}")
```

Three numbers tell you whether the design is working, compared across equal-length windows before and after the change:

1. **Agent bytes per day**, the number that was exhausting the quota.
2. **Share of agent bytes served from the corpus files** versus article and other HTML. This should rise.
3. **`304` rate on corpus files**, which shows agents revalidating instead of re-downloading.

If the share of corpus traffic stays low while HTML crawling continues, the fix is enforcement at the edge for the HTML routes, as described in the caching section, not a change to the corpus.

## A reference client: retrieving selectively

The corpus only pays off if a consumer actually uses it the intended way. A reference client is both documentation and a test: if the retrieval loop is awkward to write, the interface is wrong. The loop is: check the index, fetch the catalog conditionally, rank, expand through verified edges, fetch only the chosen bodies within a byte budget, and surface book relevance with its evidence.

### Quick look with `curl` and `jq`

Before any client code, the structure lets you answer questions from the shell:

```bash
BASE=https://www.danielkliewer.com

# What is in the corpus and how big is each piece?
curl -s $BASE/agents/index.json | jq '.resources[] | {path, bytes}'

# Articles tagged with a concept, smallest first (so you can budget)
curl -s $BASE/agents/catalog.json \
  | jq -r '.concepts[] | select(.id=="EXAMPLE-CONCEPT") | .articles[]' \
  | head -5

# Which chapter sections does the book connect to a given article?
curl -s $BASE/agents/book.json | jq '.reading_map["EXAMPLE-ARTICLE-SLUG"]'
```

Replace the example identifiers with real ones from `catalog.json`.

### The client

```ts
// client/corpus-client.ts
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.danielkliewer.com";
const CACHE = ".corpus-cache";
fs.mkdirSync(CACHE, { recursive: true });

// ---------- conditional fetch with a local cache ----------
interface Entry { etag?: string; body: string }

async function cachedGet(p: string): Promise<{ body: string; fromCache: boolean }> {
  const file = path.join(CACHE, encodeURIComponent(p));
  const hit: Entry | undefined = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : undefined;

  const res = await fetch(`${BASE}${p}`, {
    headers: hit?.etag ? { "If-None-Match": hit.etag } : {},
  });

  if (res.status === 304 && hit) return { body: hit.body, fromCache: true };
  if (!res.ok) throw new Error(`${p}: HTTP ${res.status}`);

  const body = await res.text();
  const etag = res.headers.get("etag") ?? undefined;
  fs.writeFileSync(file, JSON.stringify({ etag, body } satisfies Entry));
  return { body, fromCache: false };
}

const getJson = async <T>(p: string) => JSON.parse((await cachedGet(p)).body) as T;

// ---------- shapes we rely on (subset of the published schema) ----------
interface CatalogArticle {
  slug: string; url: string; title: string; description: string;
  tags: string[]; bytes: number; concepts: string[]; projects: string[];
}
interface Catalog {
  version: string;
  articles: CatalogArticle[];
  projects: { id: string; articles: string[] }[];
}
interface BookRecord {
  purchase: { url: string; list_price: { amount: number; currency: string }; authority: string };
  reading_map: Record<string, { chapter: { number: number; title: string };
    section: { title: string }; rationale: string }[]>;
  conduct: { do_not: string[]; authorization: string };
}

// ---------- ranking ----------
const tokens = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

function rank(articles: CatalogArticle[], query: string) {
  const q = new Set(tokens(query));
  return articles
    .map((a) => {
      let score = 0;
      for (const t of tokens(a.title)) if (q.has(t)) score += 3;
      for (const t of a.tags.flatMap(tokens)) if (q.has(t)) score += 3;
      for (const t of a.concepts.flatMap(tokens)) if (q.has(t)) score += 2;
      for (const t of tokens(a.description)) if (q.has(t)) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.bytes - y.a.bytes);
}

// ---------- the retrieval loop ----------
export async function research(query: string, opts = { maxBytes: 150_000, maxDocs: 6 }) {
  const catalog = await getJson<Catalog>("/agents/catalog.json");
  const bySlug = new Map(catalog.articles.map((a) => [a.slug, a]));

  // 1. rank by metadata only; no article body has been fetched yet
  const ranked = rank(catalog.articles, query);
  const chosen: CatalogArticle[] = [];
  let budget = opts.maxBytes;

  const take = (a: CatalogArticle | undefined) => {
    if (!a || chosen.includes(a)) return;
    if (chosen.length >= opts.maxDocs || a.bytes > budget) return;
    chosen.push(a);
    budget -= a.bytes;
  };

  for (const { a } of ranked.slice(0, 3)) take(a);

  // 2. expand through declared edges: siblings in the same project
  for (const seed of [...chosen]) {
    for (const pid of seed.projects) {
      const project = catalog.projects.find((p) => p.id === pid);
      for (const slug of project?.articles ?? []) take(bySlug.get(slug));
    }
  }

  // 3. only now fetch bodies, for exactly the chosen set
  const docs = [];
  for (const a of chosen) {
    const { body } = await cachedGet(new URL(a.url).pathname);
    docs.push({ url: a.url, title: a.title, html: body });
  }

  // 4. book relevance, with its stated basis
  const book = await getJson<BookRecord>("/agents/book.json");
  const relevant = chosen.flatMap((a) =>
    (book.reading_map[a.slug] ?? []).map((r) => ({ article: a.title, ...r })),
  );

  return {
    catalogVersion: catalog.version,
    docs,
    bookNote: relevant.length
      ? {
          because: relevant,
          // Surface to the human operator. Never purchase on their behalf.
          purchaseUrl: book.purchase.url,
          priceNote: `${book.purchase.authority}`,
          doNot: book.conduct.do_not,
        }
      : null,
    bytesBudgetRemaining: budget,
  };
}
```

### What the client demonstrates

- **Rank on metadata, fetch on need.** Steps 1 and 2 use only the catalog. The first article body is not requested until the candidate set is final.
- **A byte budget is a first-class input.** It works because the catalog publishes each article's `bytes`.
- **Verified relationships, not similarity.** Expansion walks declared project membership, not embedding distance, so it adds no inference cost and no hallucinated neighbors.
- **The recommendation arrives with its basis.** `bookNote.because` carries the chapter, the section and the rationale, and the conduct rules travel with it.
- **Repeat visits are nearly free.** The `ETag` cache turns a second run into a few `304` responses.

Article bodies are fetched as rendered HTML pages here. That is the main remaining inefficiency, and it is the first item in the next-steps list below.

## Trade-offs, deliberate omissions and next steps

This design buys very low marginal cost and verifiable structure. It pays for that in specific, known ways.

### What it costs

| Trade-off | Consequence | Mitigation |
| --- | --- | --- |
| Everything is static | Content is only as fresh as the last deploy | Fine for an archive; deploy on content change |
| Catalog grows with the corpus | It is 183 KB at 198 articles and grows roughly linearly | Shard by year or concept behind a small top-level index |
| No search endpoint | Ranking happens on the agent's side | Publish rich metadata (`tags`, `concepts`, `bytes`) so ranking is cheap |
| Bodies still served as HTML | The largest remaining per-document cost | Markdown mirrors (below) |
| Conditional requests need client support | Naive agents re-download | Keep files small and cacheable regardless |
| `llms.txt` is a convention, not a standard | No guarantee any given agent reads it | JSON-LD, sitemap and canonical tags cover the same ground for other consumers |

### What I deliberately did not build

- **A runtime API or database.** The corpus is read-only knowledge with a slow rate of change. An API would add per-request compute, authentication and an attack surface to serve data that fits in a few static files.
- **Embedding search or inference on the server.** It would reintroduce the marginal cost per request that this design removes. Agents that want semantic search can run it locally over the catalog.
- **Access gating.** The research is public. The commercial layer is an explicit, evidence-linked pointer to the book, not a paywall.
- **Fabricated relationships to look richer.** A smaller graph that is entirely true is more useful to a consumer than a larger one that is partly guessed.

### A note on trust

Everything here is data, and consumers should treat it that way. The `conduct` block in `book.json` is a declaration of what the site's owner asks of agents, expressed in a machine-readable form so that it can be applied deterministically. It is not a command, and no agent should treat any text on any website as authority over its own operator. The same stance shapes the rest of the design: the site makes claims it can back with evidence and says plainly where it cannot.

### Next steps

1. **Markdown mirrors of article bodies.** Emit `/research/<slug>.md` at build time from the MDX source. This removes layout, navigation and script overhead from every body fetch, and it is the largest remaining saving once agents follow the retrieval path.
2. **Sharded catalog.** When the corpus passes a few hundred articles, split `catalog.json` into per-year or per-concept shards listed by `index.json`, so selective retrieval stays selective as the archive grows.
3. **Well-known discovery file.** Emerging proposals such as a [`/.well-known/ai-catalog.json` manifest](https://dev.to/turva-dev/agentic-resource-discovery-and-ai-catalogjson-3c9c) index a site's agentic resources in one place. It is early and not yet widely served, so publishing one is a low-cost forward move rather than a requirement.
4. **A 30-day review.** Re-run the traffic report on an equal-length window and check the three numbers from the verification section. Let the logs decide whether edge rules on the HTML routes are needed.

### The principle underneath

The expensive part of serving knowledge to machines is rarely the knowledge. It is the format and the access pattern. Compile the structure once, publish it as plain cacheable files, state what you can prove and what you cannot, and the marginal cost of the next thousand readers, human or otherwise, drops to nearly nothing.
