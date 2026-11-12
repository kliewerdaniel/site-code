// Article ↔ book-chapter relations, with provenance.
//
// The rule this file exists to enforce: a relationship is either computed from
// data or verified against the source material — never invented from keyword
// overlap. The manuscript (`Computational Sovereignty`, 24 chapters) is a
// synthesized treatment: it does not name the blog's projects and does not
// reproduce individual articles. A search for verbatim 6–7 word phrases shared
// between a chapter and an article returns only code boilerplate (curl
// commands, JSON-schema fragments, Docker snippets), never conceptual prose.
//
// Consequence, stated plainly:
//   - `chapter_covers` (chapter → article, "this chapter covers this article")
//     has NO verifiable entries. It is declared, validated, and reported as 0
//     rather than populated by topical inference.
//   - `recommends_reading` (chapter → article, "for more on this chapter's
//     subject, read this") is curated below. Each entry names the chapter
//     section that carries the subject, so the claim is checkable.
//
// To add a `chapter_covers` entry, cite the chapter section and the article
// passage that coincide. Do not add one from a shared tag.

export type BookRelation = "chapter_covers" | "recommends_reading";

export interface BookLink {
  /** Post slug (filename minus .md). */
  article: string;
  /** Chapter number, 1–24. */
  chapter: number;
  relation: BookRelation;
  /** Why the relation holds. Names the chapter section, not a vibe. */
  reason: string;
}

export const BOOK_LINKS: BookLink[] = [
  // ── Part I — Why Sovereignty ─────────────────────────────────────────────
  {
    article: "2026-03-10-breaking-free-from-chatgpt",
    chapter: 1,
    relation: "recommends_reading",
    reason: "Chapter 1 §1.1 prices the five liabilities of a hosted API; this article is the same argument from the author's own migration.",
  },
  {
    article: "2026-09-04-the-rented-sovereign-agent-agency-stack",
    chapter: 1,
    relation: "recommends_reading",
    reason: "Chapter 1 §1.4 prices what sovereignty costs against what renting costs; the article is that ledger applied to an agency stack.",
  },
  {
    article: "2026-03-28-sovereignty-manifesto",
    chapter: 2,
    relation: "recommends_reading",
    reason: "Chapter 2 §2.1 lays out the seven layers of the stack; the manifesto states the thesis those layers implement.",
  },
  {
    article: "2026-07-05-sovereign-ai-architecture-synthesis",
    chapter: 2,
    relation: "recommends_reading",
    reason: "Chapter 2 §2.4 maps the book onto the stack; this synthesis is the same mapping in running prose.",
  },

  // ── Part II — Inference You Control ──────────────────────────────────────
  {
    article: "2025-11-08-local-llm-integration",
    chapter: 3,
    relation: "recommends_reading",
    reason: "Chapter 3 §3.1–3.3 installs a first local model and does the VRAM math; the article is the author's working integration note.",
  },
  {
    article: "2025-07-06-demystifying-large-language-models",
    chapter: 4,
    relation: "recommends_reading",
    reason: "Chapter 4 §4.1–4.3 covers tokenization, context budgeting and sampling; the article is the conceptual groundwork.",
  },
  {
    article: "2025-11-14-2025-inference-new-geography-intelligence",
    chapter: 5,
    relation: "recommends_reading",
    reason: "Chapter 5 §5.1–5.5 is about reading benchmarks and choosing a model; the article is the market geography behind that choice.",
  },
  {
    article: "2025-11-12-mastering-llama-cpp-local-llm-integration-guide",
    chapter: 6,
    relation: "recommends_reading",
    reason: "Chapter 6 §6.1–6.3 covers GGUF, llama-server flags and KV-cache sizing; the article is the hands-on guide to the same server.",
  },
  {
    article: "2026-10-23-two-models-one-harness",
    chapter: 6,
    relation: "recommends_reading",
    reason: "Chapter 6 §6.5 compares serving runtimes; the article measures two models behind one execution boundary.",
  },

  // ── Part III — Memory That Isn't a Prompt ────────────────────────────────
  {
    article: "2025-03-28-ollama-chunking",
    chapter: 7,
    relation: "recommends_reading",
    reason: "Chapter 7 §7.3 treats chunking as the decision that decides retrieval quality; the article is that decision worked through on Ollama.",
  },
  {
    article: "2025-10-19-building-a-local-llm-powered-knowledge-graph",
    chapter: 7,
    relation: "recommends_reading",
    reason: "Chapter 7 §7.2 chooses an embedding model; the article records the local embedding pipeline the chapter generalises.",
  },
  {
    article: "2024-12-01-basic-rag",
    chapter: 8,
    relation: "recommends_reading",
    reason: "Chapter 8 §8.1–8.4 builds the local RAG pipeline end to end; the article is the first working version of that pipeline.",
  },
  {
    article: "2025-11-15-building-evaluating-local-research-assistant-graphrag-vero-eval",
    chapter: 9,
    relation: "recommends_reading",
    reason: "Chapter 9 §9.1–9.4 builds a gold set and reports misses; the article is a retrieved-assistant evaluation with the same discipline.",
  },
  {
    article: "2026-07-06-sovereign-ai-benchmarks-performance-results",
    chapter: 9,
    relation: "recommends_reading",
    reason: "Chapter 9 §9.6 makes evaluation a regression run; the article publishes measured results rather than assertions.",
  },

  // ── Part IV — Knowledge Graphs ───────────────────────────────────────────
  {
    article: "2026-03-17-building-a-private-knowledge-graph-with-local-ai-agents",
    chapter: 10,
    relation: "recommends_reading",
    reason: "Chapter 10 §10.2 designs a schema of claims, evidence and provenance; the article builds that schema with local agents.",
  },
  {
    article: "2025-11-15-building-evaluating-local-research-assistant-graphrag-vero-eval",
    chapter: 11,
    relation: "recommends_reading",
    reason: "Chapter 11 §11.1–11.3 separates local and global graph search; the article is a GraphRAG assistant measured against both.",
  },
  {
    article: "2026-10-25-ganymede-the-archive-of-the-gods",
    chapter: 11,
    relation: "recommends_reading",
    reason: "Chapter 11 §11.5 debugs GraphRAG as a worked diagnosis; the article is the project that diagnosis came out of.",
  },
  {
    article: "2026-07-11-knowledge-compiler-compiling-human-knowledge-into-static-semantic-artifacts",
    chapter: 12,
    relation: "recommends_reading",
    reason: "Chapter 12 §12.1–12.3 introduces the staged compile pipeline; the article is where that pipeline was first published.",
  },
  {
    article: "2026-07-12-compile-time-ai-knowledge-compiler-architecture",
    chapter: 12,
    relation: "recommends_reading",
    reason: "Chapter 12 §12.2–12.3 describes the artifact and the build pipeline; the article specifies that architecture.",
  },
  {
    article: "2026-07-15-compiling-my-blog-into-a-decision-graph",
    chapter: 12,
    relation: "recommends_reading",
    reason: "Chapter 12 §12.4 is a capstone compiling notes into a graph; the article compiles the blog itself into a decision graph.",
  },
  {
    article: "2026-07-16-the-sovereign-knowledge-compiler-explorer",
    chapter: 12,
    relation: "recommends_reading",
    reason: "Chapter 12 §12.6 says to verify the artifact rather than trust it; the article is the explorer built to inspect one.",
  },

  // ── Part V — Agents That Obey ────────────────────────────────────────────
  {
    article: "2025-03-24-model-context-protocol",
    chapter: 13,
    relation: "recommends_reading",
    reason: "Chapter 13 §13.5 treats MCP as the tool interface layer; the article is the author's MCP integration record.",
  },
  {
    article: "2025-11-05-the-ghost-in-the-machine-is-finally-allowed-to-see-a-beginners-guide-to-mcp",
    chapter: 13,
    relation: "recommends_reading",
    reason: "Chapter 13 §13.1–13.3 covers tool-call failure modes and schema design for weak models; the article works the same ground for MCP.",
  },
  {
    article: "2026-09-04-sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework",
    chapter: 14,
    relation: "recommends_reading",
    reason: "Chapter 14 §14.2–14.5 makes the agent a state machine that replays; the article is the governed runtime implementing that shape.",
  },
  {
    article: "2026-10-29-frozen-spine-reference-model-enforcement",
    chapter: 14,
    relation: "recommends_reading",
    reason: "Chapter 14 §14.3 uses a claim lifecycle as the worked machine; the article enforces a frozen reference model the same way.",
  },
  {
    article: "2026-09-04-sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework",
    chapter: 15,
    relation: "recommends_reading",
    reason: "Chapter 15 §15.4 puts a policy gate in front of execution, failing closed; the article is that gate implemented.",
  },
  {
    article: "2026-08-09-hermes-atlas-v03-evidence-ledger-claim-lifecycle-explain",
    chapter: 15,
    relation: "recommends_reading",
    reason: "Chapter 15 §15.2–15.3 audits claims by exact-match and contradiction; the article is the evidence ledger that carries that lifecycle.",
  },

  // ── Part VI — Personas and Routing ───────────────────────────────────────
  {
    article: "2026-01-22-dynamic-persona-moe-rag",
    chapter: 16,
    relation: "recommends_reading",
    reason: "Chapter 16 §16.2–16.4 extracts a persona as a comparable object; the article is the dynamic persona system built on that idea.",
  },
  {
    article: "2026-01-25-building-the-synthetic-analyst",
    chapter: 16,
    relation: "recommends_reading",
    reason: "Chapter 16 §16.3 turns features into behaviour; the article is a quantified persona put to work.",
  },
  {
    article: "2026-01-25-dynamic-persona-moe-rag-building-a-sovereign-synthetic-intelligence-system",
    chapter: 17,
    relation: "recommends_reading",
    reason: "Chapter 17 §17.1–17.3 routes between specialists and evaluates the router; the article is a mixture-of-experts persona router.",
  },
  {
    article: "2026-01-28-dynamic-persona-moe-rag-implementation-plan",
    chapter: 18,
    relation: "recommends_reading",
    reason: "Chapter 18 §18.1–18.4 handles consistency, regression testing and drift; the article is the implementation plan for a production persona system.",
  },
  {
    article: "2026-02-03-dynamic-persona-moe-rag-building-memory-driven-synthetic-intelligence",
    chapter: 18,
    relation: "recommends_reading",
    reason: "Chapter 18 §18.6 manages the persona lifecycle; the article is the memory-driven system that lifecycle governs.",
  },

  // ── Part VII — Verification Discipline ───────────────────────────────────
  {
    article: "2026-10-23-llmjacking-the-skynet-mode-recursive-threat",
    chapter: 19,
    relation: "recommends_reading",
    reason: "Chapter 19 §19.1–19.3 shapes a principled refusal and a detector that did not ship; the article is the threat that refusal answers.",
  },
  {
    article: "2026-10-23-operation-ouroboros-recursive-intelligence-parasite",
    chapter: 19,
    relation: "recommends_reading",
    reason: "Chapter 19 §19.5 refuses in the sovereign context; the article is the recursive-infrastructure case that context was drawn from.",
  },
  {
    article: "2026-07-26-does-the-compiler-know-when-it-is-wrong",
    chapter: 20,
    relation: "recommends_reading",
    reason: "Chapter 20 §20.1–20.3 runs contradiction detection as a pipeline and measures it; the article asks whether the compiler knows it is wrong.",
  },
  {
    article: "2026-10-25-ganymede-the-archive-of-the-gods",
    chapter: 20,
    relation: "recommends_reading",
    reason: "Chapter 20 §20.4 integrates contradiction detection with the auditor; the article is the claim graph that integration runs on.",
  },
  {
    article: "2026-07-06-sovereign-ai-benchmarks-performance-results",
    chapter: 21,
    relation: "recommends_reading",
    reason: "Chapter 21 §21.1–21.4 freezes the corpus and versions the gold set; the article is a published, frozen benchmark run.",
  },
  {
    article: "2026-08-09-hermes-atlas-v04-evidence-lifecycle-gold-benchmark",
    chapter: 21,
    relation: "recommends_reading",
    reason: "Chapter 21 §21.6 builds gold sets for generative tasks; the article specifies an evidence-lifecycle gold benchmark.",
  },

  // ── Part VIII — Privacy, Security, Shipping ──────────────────────────────
  {
    article: "2026-10-23-patching-the-trust-store-emudhra-nodejs-and-the-build-gate",
    chapter: 22,
    relation: "recommends_reading",
    reason: "Chapter 22 §22.5 covers supply-chain hygiene and §22.7 the audit you will actually do; the article is a compromised root found by that audit.",
  },
  {
    article: "2025-12-04-critical-nextjs-rce-cve-2025-66478-security-guide",
    chapter: 22,
    relation: "recommends_reading",
    reason: "Chapter 22 §22.1–22.2 writes the threat model and denies by default; the article is a framework RCE handled under that model.",
  },
  {
    article: "2026-10-12-mindbroadcast",
    chapter: 23,
    relation: "recommends_reading",
    reason: "Chapter 23 §23.1–23.4 is about one-command builds, offline distribution and the UX lesson; the article is a cross-platform build pipeline.",
  },
  {
    article: "2026-03-29-sovereign-synthesis",
    chapter: 24,
    relation: "recommends_reading",
    reason: "Chapter 24 §24.2 states the ongoing discipline; the article is the synthesis that discipline produced.",
  },
  {
    article: "2026-07-05-getting-started-sovereign-ai",
    chapter: 24,
    relation: "recommends_reading",
    reason: "Chapter 24 §24.1 caps the book with one complete system; the article is the on-ramp to building it.",
  },
];

/** Reverse index: article slug → the links that mention it. */
export function linksForArticle(slug: string): BookLink[] {
  return BOOK_LINKS.filter((l) => l.article === slug);
}

/** Links for one chapter, in declaration order. */
export function linksForChapter(n: number): BookLink[] {
  return BOOK_LINKS.filter((l) => l.chapter === n);
}
