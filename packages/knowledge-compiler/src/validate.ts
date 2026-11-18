// validate.ts — deterministic validation.
//
// Validation is a function of the document alone: no model, no confidence
// score. A document that fails is rejected from the compilation, not silently
// repaired.

import { createHash } from "node:crypto";
import type { SourceDocument } from "./types.ts";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Structural validation. A document must be publishable and traceable. */
export function validateDocument(doc: SourceDocument): ValidationResult {
  const errors: string[] = [];
  if (!doc.title.trim()) errors.push("title is empty");
  if (!doc.published) errors.push("published date is missing");
  else if (!/^\d{4}-\d{2}-\d{2}/.test(doc.published))
    errors.push(`published date is not ISO (${doc.published})`);
  if (doc.modified && doc.published && doc.modified < doc.published)
    errors.push(`modified (${doc.modified}) precedes published (${doc.published})`);
  if (doc.body.length === 0) errors.push("body is empty");
  if (doc.contentHash !== hashBody(doc.body)) errors.push("content hash does not match the body");
  return { ok: errors.length === 0, errors };
}

function hashBody(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("hex");
}
