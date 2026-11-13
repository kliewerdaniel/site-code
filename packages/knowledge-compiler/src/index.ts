// @danielkliewer/knowledge-compiler — the reusable compile-time knowledge
// compiler. Source normalization, deterministic validation, governed proposal
// approval and artifact emission.

export { compile, assertGoverned, declareRelation } from "./compile.ts";
export { normalizeDocument, normalizeDocuments, splitFrontmatter, sha256Hex } from "./normalize.ts";
export { proposeTagOverlap } from "./propose.ts";
export { validateDocument } from "./validate.ts";
export { CompilerError } from "./types.ts";
export type * from "./types.ts";
