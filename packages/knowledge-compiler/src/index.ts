// @danielkliewer/knowledge-compiler — the reusable compile-time knowledge
// compiler. Source normalization, deterministic validation, governed proposal
// approval, manifest-driven ingestion and artifact emission.

export { compile, assertGoverned, declareRelation } from "./compile.ts";
export { normalizeDocument, normalizeDocuments, splitFrontmatter, sha256Hex } from "./normalize.ts";
export { proposeTagOverlap } from "./propose.ts";
export { validateDocument } from "./validate.ts";
export { CompilerError } from "./types.ts";
export type * from "./types.ts";

export { approvalStore } from "./approval.ts";
export type { ApprovalRecord, ApprovalStore } from "./approval.ts";

export { MANIFEST_SCHEMA, validateManifest } from "./manifest.ts";
export type { SourceManifest, SourceSpec } from "./manifest.ts";

export { readMarkdownSource, readJsonSource, loadSources } from "./adapters.ts";

export { CORPUS_SCHEMA, emitArtifacts, writeArtifacts, slugify } from "./emit.ts";
export type { ArtifactFile, CorpusBundle, EmitOptions } from "./emit.ts";

export { compileFromManifest } from "./compileFromManifest.ts";
export type { ManifestCompileResult } from "./compileFromManifest.ts";
