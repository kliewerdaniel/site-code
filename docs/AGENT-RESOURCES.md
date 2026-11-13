# Agent knowledge interface

Six public resources, generated at build time from the same source the pages
render. No database, no runtime API, no per-request compute. All are static and
cacheable.

| Path | Type | Purpose |
|---|---|---|
| `/llms.txt` | `text/plain` | Entry point: identity, domains, navigation, book, pointers. ~3 KB. |
| `/llms-full.txt` | `text/plain` | Full catalog as text: every article, project, concept, path, chapter. ~145 KB. |
| `/agents` | HTML | Human guide to the corpus and its graph. |
| `/agents/index.json` | `application/json` | Master index with byte sizes and content types. |
| `/agents/catalog.json` | `application/json` | Structured catalog. ~204 KB. |
| `/agents/graph.json` | `application/json` | Typed relation graph with provenance. ~19 KB. |
| `/agents/book.json` | `application/json` | The book as a product record. ~18 KB. |
| `/research/{slug}.md` | `text/markdown` | Canonical Markdown mirror of every published article. One file per article, generated from the same source the page renders. |

`/for-agents` is a permanent redirect to `/agents`.

## Canonical Markdown mirrors

Every published article has a canonical Markdown representation at
`/research/<slug>.md`, generated at build time from the same markdown body the
blog page renders. There is no separate hand-edited copy: the mirror is the
source body, preceded by a YAML frontmatter block.

The frontmatter carries:

| Field | Meaning |
|---|---|
| `doc_id` | Stable, URL-independent identifier (`danielkliewer.com/article/<slug>`). |
| `canonical_url` | The article's canonical HTML URL. |
| `title` | The article title. |
| `published` / `modified` | ISO dates; `modified` falls back to `published`. |
| `type` | `article`. |
| `concepts` / `projects` | Slugs derived from the archive's own tags and the taxonomy. |
| `content_hash` | `sha256:<hex>` over the emitted body. |
| `bytes` | Exact byte length of the emitted body. |
| `provenance` | Source file, generator and site. |

The hash and byte count describe the **body**, not the whole file — a document
cannot contain a hash of itself. `verifyMarkdownMirror` re-derives both from
the emitted bytes and optionally checks the body against the source.

Drafts have no mirror: they are absent from `generateStaticParams` and from the
mirror builder, so `/research/<draft-slug>.md` returns 404. `catalog.json`
lists each article's `markdownUrl`; `index.json` describes the mirror scheme and
its count.

## Source of truth

Everything is derived, never hand-copied:

- `src/config.ts` — site identity, the book, navigation.
- `content/research/*.md` — the article archive.
- `src/lib/posts.ts` — the published-post loader; excludes `draft: true`.
- `src/lib/taxonomy.ts` — projects, concepts, learning paths, and the derived
  article↔concept joins.
- `src/lib/chapters.ts` — the 24-chapter manifest (verified against the
  manuscript's table of contents).
- `src/lib/book-links.ts` — article↔chapter relations, each with a reason.
- `src/lib/relations-core.ts` — the graph semantics, shared with the auditor.
- `src/lib/markdown-core.ts` — the pure Markdown mirror builder and verifier.
- `src/lib/agent-resources-core.ts` — the pure builders for the six resources.

The builders are pure functions of that data: no clock, no randomness. Two
builds of the same commit produce byte-identical resources.

## Retrieving efficiently

1. Fetch `/agents/catalog.json` once.
2. Pick the documents that answer the question.
3. Fetch only those canonical URLs. Article bodies are not duplicated in any
   index.
4. Follow `/agents/graph.json` edges rather than re-reading the archive.

## Graph vocabulary

| Type | From | To | Meaning |
|---|---|---|---|
| `implements` | `/projects/<p>` | `/concepts/<c>` | the project implements the concept |
| `documents` | `/blog/<post>` | `/projects/<p>` | the post is the write-up for the project |
| `prerequisite_for` | `<ref>` | `<ref>` | consecutive learning-path steps |
| `chapter_covers` | `chapter:<n>` | `/blog/<post>` | the chapter covers the article (verified only) |
| `recommends_reading` | `/blog/<post>` | `chapter:<n>` | the article is further reading for the chapter |

Relation types with no data source are listed in `absent`, never fabricated:
`extends`, `validates`, `explains`, `expands_on`, `related_product`.

### The `chapter_covers` rule

`chapter_covers` is the strong claim. It is **empty**, deliberately. The
manuscript (`Computational Sovereignty`, 24 chapters) is a synthesized
treatment: it does not name the blog's projects and does not reproduce
individual articles. A search for verbatim 6–7 word phrases shared between a
chapter and an article returns only code boilerplate — curl commands,
JSON-schema fragments, Docker snippets — never conceptual prose.

So `recommends_reading` edges are curated, each naming the chapter section it
rests on; `chapter_covers` is withheld rather than inferred from keyword
overlap. To add a `chapter_covers` entry, cite the chapter section and the
article passage that coincide, and add a test that fails if the reason is
removed.

## The book record

`/agents/book.json` carries only what `src/config.ts` states: title, subtitle,
author, ASIN, Amazon URL, ISBN, publication date, format, page count, chapter
count, word count, cover assets and the chapter list. It does **not** assert
availability, a live price, a rating or a review — those cannot be verified from
the repository and would be invented. The price is labelled as configured, and
`purchase` states that a purchase requires authorization from a human.

Known discrepancy: the manuscript's copyright page still reads
`ISBN (paperback): [assign via KDP]`, while `src/config.ts` carries
`979-8162014881`. The config value is the owner-supplied one; the manuscript
placeholder is a production leftover.

## Citation

Cite the canonical URL and attribute Daniel Kliewer. Every article exposes its
canonical URL, publication date and modification date as JSON-LD `BlogPosting`.
The archive, the projects and the book are one body of work by the same author.

## Validation

`npm run validate:agents` runs after `next build` and fails closed on: a missing
resource, unparseable JSON, a non-canonical URL, a book record that contradicts
the config, an invented availability/rating, a dangling graph edge, a chapter
relation with no reason, an index whose byte sizes do not match the bodies, or a
draft that leaked into the catalog.

`npm run validate:markdown` runs after `next build` and fails closed on: a
published post with no mirror, a mirror whose hash or byte count does not
verify, a mirror whose body differs from the source article, a mirror that does
not match the deterministic render, or a draft with a published mirror.

The auditor (`npm run audit`) reports the resource list, the edge counts by
type, the dangling count, the verified-chapter-link count and the mirror count.

`npm run conformance` aggregates every validator plus the corpus-level
invariants (schema shape, deterministic compilation, output consistency,
resource references, publication metadata, index completeness, draft
exclusion) into `data/conformance-report.json`, and fails on any structural
violation. `npm run smoke:production` checks the deployed site against the
local build.
