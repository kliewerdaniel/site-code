// adapters.ts — source adapters.
//
// Each adapter is the only place that knows a source format. Everything
// downstream works on the normalized SourceDocument. Adapters never fetch the
// network, never execute source material, and treat every document as untrusted
// text: paths are validated to stay inside the declared root, and content is
// hashed, never evaluated.

import fs from "node:fs";
import path from "node:path";
import { normalizeDocument, sha256Hex } from "./normalize.ts";
import type { SourceDocument } from "./types.ts";
import type { SourceSpec } from "./manifest.ts";

function safeJoin(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const base = path.resolve(root);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error(`path escapes the source root: ${relative}`);
  }
  return resolved;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out.sort();
}

/** Markdown adapter: read every matching file under `root` and normalize it. */
export function readMarkdownSource(spec: Extract<SourceSpec, { kind: "markdown" }>): SourceDocument[] {
  const pattern = spec.pattern ?? ".md";
  const exclude = spec.exclude ?? [];
  const root = path.resolve(spec.root);
  const documents: SourceDocument[] = [];

  for (const file of walk(root)) {
    const relative = path.relative(root, file);
    if (!file.endsWith(pattern)) continue;
    if (exclude.some((needle) => relative.includes(needle))) continue;
    const raw = fs.readFileSync(safeJoin(root, relative), "utf8");
    documents.push(normalizeDocument(raw, relative));
  }
  return documents;
}

interface JsonDocument {
  id?: string;
  path?: string;
  title?: string;
  body?: string;
  tags?: string[];
  draft?: boolean;
  published?: string;
  modified?: string;
}

/** JSON adapter: read a structured knowledge source. Each entry becomes a
 *  SourceDocument; the body is hashed, never executed. */
export function readJsonSource(spec: Extract<SourceSpec, { kind: "json" }>): SourceDocument[] {
  const raw = fs.readFileSync(path.resolve(spec.file), "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const key = spec.documents ?? "documents";
  const list: JsonDocument[] = Array.isArray(parsed)
    ? parsed
    : ((parsed as Record<string, unknown>)?.[key] as JsonDocument[]);

  if (!Array.isArray(list)) {
    throw new Error(`json source ${spec.file} has no "${key}" array`);
  }

  return list.map((entry, i) => {
    const id = entry.id ?? entry.path ?? `json:${i}`;
    const body = (entry.body ?? "").replace(/^(?:\s*\n)+/, "").replace(/\s+$/, "") + "\n";
    return {
      id,
      path: entry.path ?? id,
      title: entry.title ?? id,
      published: entry.published,
      modified: entry.modified,
      tags: entry.tags ?? [],
      draft: entry.draft === true,
      body,
      contentHash: sha256Hex(body),
      bytes: Buffer.byteLength(body, "utf8"),
    };
  });
}

/** Load every source in a manifest, in order. */
export function loadSources(sources: SourceSpec[]): SourceDocument[] {
  const documents: SourceDocument[] = [];
  for (const spec of sources) {
    documents.push(
      ...(spec.kind === "markdown"
        ? readMarkdownSource(spec)
        : readJsonSource(spec))
    );
  }
  return documents;
}
