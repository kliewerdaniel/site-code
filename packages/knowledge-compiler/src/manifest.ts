// manifest.ts — the configurable source manifest.
//
// A manifest is the only input a compilation needs. It names the site, lists
// the sources to read, and carries the approval records a human has produced.
// Nothing here knows about Next.js, a content directory or this website.

import type { ApprovalRecord } from "./approval.ts";

export const MANIFEST_SCHEMA = "knowledge-source/1";

export interface SourceManifest {
  schema: typeof MANIFEST_SCHEMA;
  site: {
    name: string;
    url: string;
    description?: string;
  };
  /** Sources are read in order; ids must be unique across all of them. */
  sources: SourceSpec[];
  /** Explicit human approvals. The compiler consumes these; it never creates
   *  them. */
  approvals?: ApprovalRecord[];
  output: {
    /** Directory the artifacts are written to. */
    directory: string;
    /** Public base URL the artifacts will be served from. */
    baseUrl: string;
  };
}

export type SourceSpec =
  | {
      kind: "markdown";
      /** Directory to walk recursively. */
      root: string;
      /** Glob-like suffix filter, default ".md". */
      pattern?: string;
      /** Substrings; a path containing any of them is skipped. */
      exclude?: string[];
      /** Frontmatter field that marks a draft. Default "draft". */
      draftField?: string;
    }
  | {
      kind: "json";
      /** A structured JSON knowledge source. */
      file: string;
      /** Key holding the document array. Default "documents". */
      documents?: string;
    };

/** Structural validation of a manifest. Returns problems; empty is valid. */
export function validateManifest(manifest: SourceManifest): string[] {
  const errors: string[] = [];
  if (manifest.schema !== MANIFEST_SCHEMA) {
    errors.push(`schema must be ${MANIFEST_SCHEMA}`);
  }
  if (!manifest.site?.name) errors.push("site.name is required");
  if (!manifest.site?.url) errors.push("site.url is required");
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    errors.push("sources must be a non-empty array");
  }
  if (!manifest.output?.directory) errors.push("output.directory is required");
  if (!manifest.output?.baseUrl) errors.push("output.baseUrl is required");
  if (manifest.approvals && !Array.isArray(manifest.approvals)) {
    errors.push("approvals must be an array");
  }
  return errors;
}
