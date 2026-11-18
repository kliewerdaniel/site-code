// emit.ts — deterministic artifact emission.
//
// The compiler emits a versioned, content-addressed corpus bundle plus canonical
// Markdown mirrors and a resource index. The output is a pure function of the
// compile result: no clock, no randomness, no network. The same input always
// produces byte-identical artifacts.

import fs from "node:fs";
import { createHash } from "node:crypto";
import type { CompileResult, SourceDocument } from "./types.ts";

export const CORPUS_SCHEMA = "knowledge-corpus/1";

export interface ArtifactFile {
  path: string;
  body: string;
  contentType: string;
}

export interface EmitOptions {
  baseUrl: string;
  siteName: string;
  generator?: string;
}

export interface BundledDocument {
  id: string;
  path: string;
  title: string;
  url: string;
  published?: string;
  modified?: string;
  tags: string[];
  bytes: number;
  contentHash: string;
}

export interface CorpusBundle {
  schema: typeof CORPUS_SCHEMA;
  site: { name: string; url: string };
  counts: Record<string, number>;
  documents: BundledDocument[];
  relations: CompileResult["relations"];
  claims: CompileResult["claims"];
  proposals: CompileResult["proposals"];
  evidence: Array<{
    id: string;
    type: "source_span";
    source: string;
    span: string;
    contentHash: string;
  }>;
}

const sha256Hex = (text: string) =>
  createHash("sha256").update(text, "utf8").digest("hex");

export function slugify(id: string): string {
  const slug = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "document";
}

function mirror(doc: SourceDocument, opts: EmitOptions): string {
  const slug = slugify(doc.id);
  const lines = [
    "---",
    `doc_id: ${opts.siteName}/article/${slug}`,
    `canonical_url: ${opts.baseUrl}/${slug}`,
    `title: ${JSON.stringify(doc.title)}`,
    `published: ${doc.published ?? ""}`,
    `modified: ${doc.modified ?? doc.published ?? ""}`,
    "type: article",
    `tags: [${doc.tags.join(", ")}]`,
    `content_hash: sha256:${doc.contentHash}`,
    `bytes: ${doc.bytes}`,
    "provenance:",
    `  source: ${doc.path}`,
    `  generator: ${opts.generator ?? "@danielkliewer/knowledge-compiler/0.1"}`,
    `  site: ${opts.baseUrl}`,
    "---",
    "",
    doc.body,
  ];
  return lines.join("\n");
}

/** Build every artifact as an in-memory file. Nothing is written here. */
export function emitArtifacts(
  result: CompileResult,
  opts: EmitOptions
): { bundle: CorpusBundle; files: ArtifactFile[] } {
  const documents: BundledDocument[] = [...result.documents]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((d) => ({
      id: d.id,
      path: d.path,
      title: d.title,
      url: `${opts.baseUrl}/${slugify(d.id)}`,
      ...(d.published ? { published: d.published } : {}),
      ...(d.modified ? { modified: d.modified } : {}),
      tags: d.tags,
      bytes: d.bytes,
      contentHash: d.contentHash,
    }));

  const relations = [...result.relations].sort((a, b) => a.id.localeCompare(b.id));
  const claims = [...result.claims].sort((a, b) => a.id.localeCompare(b.id));
  const proposals = [...result.proposals].sort((a, b) => a.id.localeCompare(b.id));

  const evidence = proposals.map((p) => ({
    id: p.id,
    type: "source_span" as const,
    source: p.evidence,
    span: p.evidence,
    contentHash: sha256Hex(p.evidence).slice(0, 16),
  }));

  const bundle: CorpusBundle = {
    schema: CORPUS_SCHEMA,
    site: { name: opts.siteName, url: opts.baseUrl },
    counts: {
      documents: documents.length,
      relations: relations.length,
      claims: claims.length,
      proposals: proposals.length,
      evidence: evidence.length,
      rejected: result.rejected.length,
      excludedDrafts: result.excludedDrafts.length,
    },
    documents,
    relations,
    claims,
    proposals,
    evidence,
  };

  const files: ArtifactFile[] = [];
  const push = (path: string, body: string, contentType: string) =>
    files.push({ path, body, contentType });

  const bundleBody = JSON.stringify(bundle, null, 2) + "\n";
  push("corpus.json", bundleBody, "application/json; charset=utf-8");

  for (const doc of result.documents) {
    push(
      `mirrors/${slugify(doc.id)}.md`,
      mirror(doc, opts),
      "text/markdown; charset=utf-8"
    );
  }

  const resources = files.map((f) => ({
    path: `/${f.path}`,
    url: `${opts.baseUrl}/${f.path}`,
    bytes: Buffer.byteLength(f.body, "utf8"),
    contentType: f.contentType,
    sha256: sha256Hex(f.body),
  }));
  push(
    "index.json",
    JSON.stringify(
      {
        schema: CORPUS_SCHEMA,
        site: { name: opts.siteName, url: opts.baseUrl },
        resources,
      },
      null,
      2
    ) + "\n",
    "application/json; charset=utf-8"
  );

  return { bundle, files };
}

/** Write artifacts to disk. Deterministic; existing files are overwritten. */
export function writeArtifacts(
  files: ArtifactFile[],
  directory: string
): void {
  for (const file of files) {
    const target = `${directory}/${file.path}`;
    const parent = target.slice(0, target.lastIndexOf("/"));
    if (parent) fs.mkdirSync(parent, { recursive: true });
    fs.writeFileSync(target, file.body, "utf8");
  }
}
