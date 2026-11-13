// normalize.ts — source normalization.
//
// Turns a raw source document (markdown with frontmatter) into a
// SourceDocument. This is the only place that knows about the source format;
// everything downstream works on the normalized type.

import { createHash } from "node:crypto";
import type { SourceDocument } from "./types.ts";

export function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Split YAML frontmatter from a markdown body. Supports the subset the
 *  compiler emits: `key: value`, `[a, b]` lists, and `key:` nested blocks with
 *  two-space indentation. */
export function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---\n")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, body: raw };
  const frontmatter = raw.slice(4, end);
  const body = raw.slice(end + 5).replace(/^\n/, "");
  const data: Record<string, unknown> = {};
  let current: string | null = null;
  for (const line of frontmatter.split("\n")) {
    const nested = /^ {2}([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (nested) {
      if (!current) continue;
      const parent = (data[current] as Record<string, unknown>) ?? {};
      parent[nested[1]] = parseScalar(nested[2]);
      data[current] = parent;
      continue;
    }
    const m = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    if (val === "") {
      current = key;
      data[key] = {};
      continue;
    }
    current = null;
    data[key] = parseScalar(val);
  }
  return { data, body };
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
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}

/** Normalize one raw source document. */
export function normalizeDocument(raw: string, path: string): SourceDocument {
  const { data, body } = splitFrontmatter(raw);
  const str = (v: unknown): string => (typeof v === "string" ? v : Array.isArray(v) ? "" : String(v ?? ""));
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const canonicalBody = body.replace(/^(?:\s*\n)+/, "").replace(/\s+$/, "") + "\n";
  return {
    id: path,
    path,
    title: str(data.title),
    published: str(data.date || data.published) || undefined,
    modified: str(data.updated || data.modified) || undefined,
    tags,
    draft: data.draft === true,
    body: canonicalBody,
    contentHash: sha256Hex(canonicalBody),
    bytes: Buffer.byteLength(canonicalBody, "utf8"),
  };
}

/** Normalize a whole source tree. */
export function normalizeDocuments(entries: Array<{ path: string; raw: string }>): SourceDocument[] {
  return entries.map((e) => normalizeDocument(e.raw, e.path));
}
