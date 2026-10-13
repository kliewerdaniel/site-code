// Book structure — the canonical 24-chapter table of contents.
//
// This lives in lib/, not in a component: it is book data, and both the
// /book page and any future surface (the sample, the press kit) read the
// same list. It previously lived inside ChapterStack.tsx, which also owned
// a scroll animation; v3 replaced that animation with a ruled INSTRUMENT
// list, so the data moved here to survive the component's deletion.

export interface Chapter {
  n: number;
  part: string;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { n: 1, part: "I — Why Sovereignty", title: "The Cloud Is a Liability" },
  { n: 2, part: "I — Why Sovereignty", title: "The Sovereignty Stack" },
  { n: 3, part: "I — Why Sovereignty", title: "Your First Local Model" },
  { n: 4, part: "II — Inference You Control", title: "Tokens, Context, and Sampling" },
  { n: 5, part: "II — Inference You Control", title: "Choosing Models Like an Engineer" },
  { n: 6, part: "II — Inference You Control", title: "Serving Models Locally" },
  { n: 7, part: "III — Memory That Isn't a Prompt", title: "Embeddings and Vector Search" },
  { n: 8, part: "III — Memory That Isn't a Prompt", title: "Building Local RAG" },
  { n: 9, part: "III — Memory That Isn't a Prompt", title: "Evaluating Retrieval Honestly" },
  { n: 10, part: "IV — Knowledge Graphs", title: "From Documents to Graphs" },
  { n: 11, part: "IV — Knowledge Graphs", title: "GraphRAG in Practice" },
  { n: 12, part: "IV — Knowledge Graphs", title: "Compile-Time Intelligence" },
  { n: 13, part: "V — Agents That Obey", title: "Tool Use, Locally" },
  { n: 14, part: "V — Agents That Obey", title: "State Machines Over Vibes" },
  { n: 15, part: "V — Agents That Obey", title: "The Auditor Pattern" },
  { n: 16, part: "VI — Personas and Routing", title: "Quantified Personas" },
  { n: 17, part: "VI — Personas and Routing", title: "Dynamic Routing (MoE-style)" },
  { n: 18, part: "VI — Personas and Routing", title: "Persona Systems in Production" },
  { n: 19, part: "VII — Verification Discipline", title: "The Refusal Discipline" },
  { n: 20, part: "VII — Verification Discipline", title: "Contradiction Detection at Scale" },
  { n: 21, part: "VII — Verification Discipline", title: "Gold Sets and Frozen Benchmarks" },
  { n: 22, part: "VIII — Privacy, Security, Shipping", title: "The Local-First Security Model" },
  { n: 23, part: "VIII — Privacy, Security, Shipping", title: "Shipping Sovereign Software" },
  { n: 24, part: "VIII — Privacy, Security, Shipping", title: "The Sovereign Practice" },
];

/** The eight parts, in order, derived from CHAPTERS so they cannot drift. */
export const PARTS: string[] = [...new Set(CHAPTERS.map((c) => c.part))];
