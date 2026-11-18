// @danielkliewer/knowledge-sdk — public entry point.
//
// A typed, dependency-free client for a compiled knowledge corpus. It speaks
// HTTP and the filesystem only, and is independent of the website's Next.js
// runtime.

export { KnowledgeCorpus, parseMirror, sha256Hex } from "./client.ts";
export { KnowledgeError } from "./types.ts";
export type * from "./types.ts";
