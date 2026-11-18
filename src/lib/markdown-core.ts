// markdown-core.ts — canonical Markdown mirrors of the published archive.
//
// Pure functions: no clock, no randomness, no filesystem, no `@/` imports.
// `src/lib/agent-resources-core.ts` re-exports the builder so the route
// handlers and the `node --test` suites exercise the exact bytes that are
// emitted, and so the mirrors are reproducible from source.
//
// The mirror is the article's own markdown body (the same string the blog page
// renders) preceded by a YAML frontmatter block carrying the canonical
// document identifier, the canonical URL, the publication metadata, the
// derived concept/project joins, and a content hash over the body.
//
// The hash and byte count describe the BODY, not the whole file: a document
// cannot contain a hash of itself without a fixed-point trick, and the body is
// the part a consumer verifies against the source. `verifyMarkdownMirror`
// re-derives both from the emitted bytes.

import crypto from "node:crypto";

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
export const MARKDOWN_PREFIX = "/research/";
export const MARKDOWN_SUFFIX = ".md";
export const MARKDOWN_GENERATOR = "src/lib/markdown-core.ts";

/** URL path of a post's Markdown mirror. */
export function markdownPath(slug: string): string {
  return `${MARKDOWN_PREFIX}${slug}${MARKDOWN_SUFFIX}`;
}

/** Stable, URL-independent document identifier. */
export function markdownDocId(slug: string): string {
  return `danielkliewer.com/article/${slug}`;
}

export interface MarkdownPost {
  slug: string;
  title: string;
  /** Normalised ISO date from frontmatter. */
  date: string;
  updated?: string;
  concepts: string[];
  projects: string[];
  /** The raw markdown body, exactly as rendered by the blog page. */
  content: string;
}

/** Normalise a raw body for emission: drop leading blank lines (including
 *  whitespace-only ones) and trailing whitespace, then terminate with exactly
 *  one newline. This is the canonical form the hash and byte count describe. */
export function canonicalBody(content: string): string {
  return content.replace(/^(?:\s*\n)+/, "").replace(/\s+$/, "") + "\n";
}

export function sha256Hex(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

/** JSON string literals are valid YAML double-quoted scalars, so a title
 *  containing `:`, `#`, leading quotes or newlines survives the round trip. */
function yamlString(value: string): string {
  return JSON.stringify(value);
}

function yamlList(values: string[]): string {
  return `[${values.join(", ")}]`;
}

/** Render the canonical Markdown mirror for one published post. */
export function renderMarkdownMirror(site: string, post: MarkdownPost): string {
  const body = canonicalBody(post.content);
  const bytes = Buffer.byteLength(body, "utf8");
  const hash = sha256Hex(body);
  const published = post.date;
  const modified = post.updated ?? post.date;

  const fields = [
    "---",
    `doc_id: ${markdownDocId(post.slug)}`,
    `canonical_url: ${site}/blog/${post.slug}`,
    `title: ${yamlString(post.title)}`,
    `published: ${published}`,
    `modified: ${modified}`,
    `type: article`,
    `concepts: ${yamlList(post.concepts)}`,
    `projects: ${yamlList(post.projects)}`,
    `content_hash: sha256:${hash}`,
    `bytes: ${bytes}`,
    "provenance:",
    `  source: content/research/${post.slug}.md`,
    `  generator: ${MARKDOWN_GENERATOR}`,
    `  site: ${site}`,
    "---",
    "",
    body,
  ];
  return fields.join("\n");
}

export interface SplitMarkdown {
  frontmatter: string;
  body: string;
}

/** Split an emitted mirror into its frontmatter block and canonical body.
 *  Throws on a malformed delimiter so a corrupt artifact is never silently
 *  treated as valid. */
export function splitMarkdownMirror(doc: string): SplitMarkdown {
  if (!doc.startsWith("---\n")) {
    throw new Error("markdown mirror: missing opening frontmatter delimiter");
  }
  const end = doc.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error("markdown mirror: missing closing frontmatter delimiter");
  }
  const frontmatter = doc.slice(4, end);
  const body = doc.slice(end + 5).replace(/^\n/, "");
  return { frontmatter, body };
}

function parseScalar(raw: string): unknown {
  const val = raw.trim();
  if (val.startsWith("[") && val.endsWith("]")) {
    const inner = val.slice(1, -1).trim();
    return inner
      ? inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }
  if (val.startsWith('"') && val.endsWith('"')) {
    try {
      return JSON.parse(val);
    } catch {
      return val.slice(1, -1);
    }
  }
  if (/^-?\d+$/.test(val)) return Number(val);
  return val;
}

/** Parse the generated frontmatter subset. Not a general YAML parser — it
 *  parses exactly the shape `renderMarkdownMirror` emits. */
export function parseFrontmatter(fm: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let current: string | null = null;
  for (const line of fm.split("\n")) {
    const nested = /^ {2}([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (nested) {
      if (!current) continue;
      const parent = (out[current] as Record<string, unknown>) ?? {};
      parent[nested[1]] = parseScalar(nested[2]);
      out[current] = parent;
      continue;
    }
    const m = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    if (val === "") {
      current = key;
      out[key] = {};
      continue;
    }
    current = null;
    out[key] = parseScalar(val);
  }
  return out;
}

export interface MarkdownMeta {
  docId: string;
  canonicalUrl: string;
  title: string;
  published: string;
  modified: string;
  type: string;
  concepts: string[];
  projects: string[];
  contentHash: string;
  bytes: number;
  provenance: { source: string; generator: string; site: string };
}

export interface ParsedMarkdown {
  meta: MarkdownMeta;
  body: string;
}

/** Parse and structurally validate a mirror. Does not verify the hash. */
export function parseMarkdownMirror(doc: string): ParsedMarkdown {
  const { frontmatter, body } = splitMarkdownMirror(doc);
  const raw = parseFrontmatter(frontmatter);
  const prov = (raw.provenance ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

  const hashRaw = str(raw.content_hash);
  const hash = hashRaw.startsWith("sha256:") ? hashRaw.slice(7) : hashRaw;

  return {
    meta: {
      docId: str(raw.doc_id),
      canonicalUrl: str(raw.canonical_url),
      title: str(raw.title),
      published: str(raw.published),
      modified: str(raw.modified),
      type: str(raw.type),
      concepts: list(raw.concepts),
      projects: list(raw.projects),
      contentHash: hash,
      bytes: typeof raw.bytes === "number" ? raw.bytes : Number(raw.bytes ?? 0),
      provenance: {
        source: str(prov.source),
        generator: str(prov.generator),
        site: str(prov.site),
      },
    },
    body,
  };
}

export interface MirrorVerification {
  ok: boolean;
  problems: string[];
}

/** Verify an emitted mirror against its own claims and the source body.
 *  `sourceBody` is optional: when supplied, the emitted body must equal it. */
export function verifyMarkdownMirror(
  doc: string,
  sourceBody?: string
): MirrorVerification {
  const problems: string[] = [];
  let parsed: ParsedMarkdown;
  try {
    parsed = parseMarkdownMirror(doc);
  } catch (e) {
    return { ok: false, problems: [(e as Error).message] };
  }

  const { meta, body } = parsed;

  if (!meta.docId) problems.push("missing doc_id");
  if (!meta.canonicalUrl) problems.push("missing canonical_url");
  if (!meta.title) problems.push("missing title");
  if (!meta.published) problems.push("missing published");
  if (!meta.modified) problems.push("missing modified");
  if (meta.type !== "article") problems.push(`unexpected type ${JSON.stringify(meta.type)}`);
  if (!meta.provenance.source) problems.push("missing provenance.source");

  const actualBytes = Buffer.byteLength(body, "utf8");
  if (meta.bytes !== actualBytes) {
    problems.push(`bytes claims ${meta.bytes}, body is ${actualBytes}`);
  }
  const actualHash = sha256Hex(body);
  if (meta.contentHash !== actualHash) {
    problems.push(`content_hash claims ${meta.contentHash}, body hashes to ${actualHash}`);
  }

  if (sourceBody !== undefined) {
    const canonical = canonicalBody(sourceBody);
    if (body !== canonical) {
      problems.push("body does not match the source article body");
    }
  }

  return { ok: problems.length === 0, problems };
}
