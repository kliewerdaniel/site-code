// The knowledge layer: projects, concepts and learning paths.
//
// Design rule — every relationship in this file is COMPUTED OR VERIFIED, never
// invented. A concept attaches articles by tag alias, so the mapping is derived
// from the archive itself and cannot drift out of sync with what was published.
// Projects carry only facts that were read off the repositories: last commit
// date, test-file count, remote URL. There are no adoption numbers, no
// benchmarks, and no maturity claims beyond what the code supports.
//
// "Repository signals" are dated. They are a snapshot, not a live feed, and the
// UI labels them as such.

import { getAllPosts, type Post } from "./posts";

export type Maturity = "implementation" | "prototype" | "research";

export interface Project {
  slug: string;
  name: string;
  /** One line. What it is, not what it promises. */
  role: string;
  problem: string;
  approach: string[];
  stack: string[];
  maturity: Maturity;
  repo?: string;
  site?: string;
  /** Read off the repository on 2026-10-25. */
  signals: { lastCommit: string; testFiles: number };
  concepts: string[];
  articles: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "sovereign-agent-stack",
    name: "Sovereign Agent Stack",
    role: "A governed execution layer for agents that must not act on their own authority.",
    problem:
      "A language model can propose an action but cannot be trusted to decide whether the action is permitted. Most agent frameworks collapse those two things into one step, which means the model's confidence becomes the system's permission.",
    approach: [
      "Separate the proposal from the execution: the model emits a structured intent, and a deterministic layer decides whether that intent is allowed to run.",
      "Encode permissions, path restrictions and operation allowlists as data the executor checks, not as instructions in a prompt.",
      "Record every accepted and refused operation so the system can be audited after the fact rather than reconstructed from logs.",
    ],
    stack: ["Python", "JSON Schema", "deterministic executor", "audit trail"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/sovereign-agent-stack",
    signals: { lastCommit: "2026-09-11", testFiles: 139 },
    concepts: ["governed-execution", "reproducibility"],
    articles: ["2026-10-25-hermes-local-video-studio"],
  },
  {
    slug: "sovereign-intelligence-stack",
    name: "Sovereign Intelligence Stack",
    role: "The accumulated-state argument: intelligence as what a system keeps, not what a model weighs.",
    problem:
      "Treating intelligence as a property of model weights makes every system dependent on whoever trained the model. It also throws away the thing that actually compounds — the accumulated, structured record of what a system has established.",
    approach: [
      "Model intelligence as accumulated state that survives model swaps.",
      "Keep the runtime governed: the model is one component inside it, not the system itself.",
      "Make the state inspectable, so an operator can see what the system believes and why.",
    ],
    stack: ["Python", "local inference", "structured state"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/sovereign-intelligence-stack",
    signals: { lastCommit: "2026-07-06", testFiles: 557 },
    concepts: ["local-first", "knowledge-compilation"],
    articles: [],
  },
  {
    slug: "sovereign-intelligence-observatory",
    name: "Sovereign Intelligence Observatory",
    role: "Instrumentation for watching a local intelligence system evolve over time.",
    problem:
      "A system that accumulates state is only trustworthy if you can observe how that state changes. Without observation, accumulation is indistinguishable from drift.",
    approach: [
      "Instrument the runtime so its internal state can be read without mutating it.",
      "Track change over time rather than presenting a single snapshot.",
      "Treat observation as a first-class output, not a debugging afterthought.",
    ],
    stack: ["Python", "local inference", "instrumentation"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/sovereign-intelligence-observatory",
    signals: { lastCommit: "2026-07-06", testFiles: 679 },
    concepts: ["local-first", "provenance"],
    articles: [],
  },
  {
    slug: "ganymede",
    name: "Ganymede",
    role: "A knowledge compiler: source material in, structured and validated knowledge units out.",
    problem:
      "Retrieval over raw text gives you passages that look relevant. It does not give you claims you can check, sources you can trace, or contradictions you can see. The gap is compilation, not search.",
    approach: [
      "Extract claims from source material and bind each one to its evidence.",
      "Build a claim graph so contradictions are represented rather than averaged away.",
      "Keep every stage's output as a versioned artifact, so a conclusion can be traced back through the pipeline that produced it.",
      "Treat sufficiency as a judgement about evidence, not a similarity threshold.",
    ],
    stack: ["Python", "SQLite", "embeddings", "BM25 + cosine", "claim graph"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/ganymede4",
    signals: { lastCommit: "2026-10-01", testFiles: 38 },
    concepts: ["knowledge-compilation", "provenance", "graph-retrieval"],
    articles: ["2026-10-25-ganymede-the-archive-of-the-gods"],
  },
  {
    slug: "konradfreeman-rag",
    name: "KonradFreeman Radio",
    role: "A continuous local broadcast built on retrieval rather than generation alone.",
    problem:
      "Most RAG demos answer a question and stop. A broadcast has to keep producing, on a schedule, from a fixed corpus, without repeating itself and without drifting away from its sources.",
    approach: [
      "Drive the programme from a retrieval pipeline over a frozen corpus.",
      "Separate what is retrieved from how it is spoken, so the sourcing is auditable independently of the writing.",
      "Run the whole thing locally, on a schedule.",
    ],
    stack: ["Python", "retrieval", "TTS", "SSE"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/konradfreeman-rag",
    signals: { lastCommit: "2026-08-30", testFiles: 1433 },
    concepts: ["graph-retrieval", "local-first", "creative-automation"],
    articles: [],
  },
  {
    slug: "hermes-local-video-studio",
    name: "Hermes Local Video Studio",
    role: "A reproducible video-production capability where every step is either verified or explicitly requested.",
    problem:
      "Creative tools report success constantly while doing nothing. A dissolve that never applied, a keyframe that animated nothing, a mask that rendered anyway — each returned exit code zero. A pipeline that trusts exit codes ships broken films confidently.",
    approach: [
      "Validate the project specification before any expensive generation runs.",
      "Probe capabilities: a binary that exists is not a binary that works.",
      "Record every step as verified (a measurement is attached) or requested_only (the tool accepted it; nothing checked it).",
      "Refuse to export when the transition count does not match the spec.",
    ],
    stack: ["Python", "Qwen-Image-2.1-Turbo", "FilmCraft", "ffmpeg", "JSON Schema"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/hermes-local-video-studio",
    signals: { lastCommit: "2026-10-25", testFiles: 4 },
    concepts: ["creative-automation", "reproducibility", "governed-execution"],
    articles: [
      "2026-10-25-hermes-local-video-studio",
      "2026-10-25-the-dissolve-that-wasnt-applied",
      "2026-10-25-the-keyframe-that-went-nowhere",
      "2026-10-25-the-mask-that-rendered-anyway",
    ],
  },
  {
    slug: "artcraft",
    name: "ArtCraft Suite",
    role: "Rust-native reimplementations of the creative applications, driven entirely from a shell.",
    problem:
      "Creative work is normally locked inside GUI applications, which makes it unautomatable and unreproducible. An agent cannot operate a menu bar, and a build cannot depend on a human clicking.",
    approach: [
      "Reimplement the applications so that every UI action is also a command.",
      "Give each app a headless CLI with a discoverable command catalogue.",
      "Keep the tools separate rather than merging them: grading, compositing, layout and editing are different jobs and each belongs in its own application.",
    ],
    stack: ["Rust", "JSX scripting engine", "headless CLIs", "ffmpeg"],
    maturity: "implementation",
    site: "https://getartcraft.com/",
    signals: { lastCommit: "2026-10-10", testFiles: 1 },
    concepts: ["creative-automation", "local-first"],
    articles: [
      "2026-10-11-rust-native-creative-suite-installation",
      "2026-10-25-ganymede-the-archive-of-the-gods",
    ],
  },
  {
    slug: "qwen-image-studio",
    name: "Qwen Image Studio",
    role: "A local image-generation and editing studio on Apple Silicon.",
    problem:
      "Image generation is usually a cloud dependency. Running it locally means owning the weights, the runtime and the failure modes — and discovering that the constraints are real: dimensions must divide by 32, one model variant fits in memory at a time, and editing carries the reference image's background along with its subject.",
    approach: [
      "Run Qwen-Image-2.1-Turbo through MLX with a quantised weight set.",
      "Expose a small HTTP API with job polling rather than blocking calls.",
      "Serialize generation, because the GPU is one device and the weights are 17.8 GB.",
    ],
    stack: ["Python", "MLX", "Qwen-Image-2.1-Turbo", "HTTP API"],
    maturity: "implementation",
    signals: { lastCommit: "2026-10-24", testFiles: 0 },
    concepts: ["local-first", "creative-automation"],
    articles: ["2026-10-24-qwen-image-2-1-turbo-on-apple-silicon"],
  },
  {
    slug: "pagerank-seo",
    name: "PageRank SEO",
    role: "Turning a website into an information graph so its structure can be measured rather than guessed.",
    problem:
      "SEO advice is usually a list of assertions. What a site actually communicates is a function of its link graph, its internal hierarchy, and which pages carry authority — all of which can be computed.",
    approach: [
      "Crawl a site into a directed graph of pages and links.",
      "Run PageRank over it to find which pages actually carry authority.",
      "Compare the computed structure against the intended structure and report the difference.",
    ],
    stack: ["Python", "graph analysis", "PageRank"],
    maturity: "prototype",
    repo: "https://github.com/kliewerdaniel/pagerank-seo",
    signals: { lastCommit: "2026-09-03", testFiles: 9 },
    concepts: ["evaluation", "graph-retrieval"],
    articles: [],
  },
  {
    slug: "sovereignspec",
    name: "SovereignSpec",
    role: "A local-first specification operating system for AI-assisted development.",
    problem:
      "When an agent writes code from a prose request, the specification is implicit and therefore unverifiable. Making the specification an artifact — versioned, reviewable, executable — is what makes the resulting code checkable against something.",
    approach: [
      "Treat the spec as the primary artifact and the code as a derived one.",
      "Keep the whole loop local so specifications and their implementations stay on the machine that owns them.",
      "Gate implementation on an approved specification rather than on a prompt.",
    ],
    stack: ["Python", "local-first", "specification engine"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/sovereignspec",
    signals: { lastCommit: "2026-06-13", testFiles: 25 },
    concepts: ["governed-execution", "reproducibility"],
    articles: [],
  },
  {
    slug: "mindbroadcast",
    name: "MindBroadcast",
    role: "A local knowledge-briefing system with cross-platform builds.",
    problem:
      "A briefing system that depends on a cloud model is a briefing system that stops when the network does. Running it locally means the whole chain — ingestion, compilation, narration — has to work on one machine, and has to be installable by someone who is not the author.",
    approach: [
      "Ingest and compile locally, with no network dependency in the core path.",
      "Ship real artifacts per platform rather than a source tree and good intentions.",
      "Detect available backends at setup time and present only what passes a pre-flight check.",
    ],
    stack: ["Python", "PyInstaller", "fpm", "local LLM"],
    maturity: "implementation",
    repo: "https://github.com/kliewerdaniel/MindBroadCast02",
    signals: { lastCommit: "2026-10-18", testFiles: 22 },
    concepts: ["local-first", "reproducibility"],
    articles: ["2026-10-12-mindbroadcast"],
  },
  {
    slug: "chris-game",
    name: "CHRIS",
    role: "A deterministic game engine where the language model narrates and nothing else.",
    problem:
      "If a model owns the world state, the world is not reproducible and the model can be talked into contradicting itself. The fix is to give the engine the state and restrict the model to describing it.",
    approach: [
      "Keep all world state in a deterministic client-side engine.",
      "Let the model produce narration only, with no authority over state transitions.",
      "Keep the API key server-side and fail closed when it is absent.",
    ],
    stack: ["TypeScript", "deterministic engine", "serverless narration"],
    maturity: "prototype",
    repo: "https://github.com/kliewerdaniel/chris-game",
    signals: { lastCommit: "2026-08-27", testFiles: 26 },
    concepts: ["governed-execution", "creative-automation"],
    articles: [],
  },
];

/* ── Concepts ────────────────────────────────────────────────────────────────
   Each concept carries TAG ALIASES. Articles attach by matching those tags, so
   the article list on every concept page is derived from the archive rather
   than hand-maintained. Synonyms in the tag data (local-first-ai / local-ai /
   local-first) collapse here instead of being "fixed" by rewriting 195 posts,
   which would break the existing tag URLs.                                      */

export interface Concept {
  slug: string;
  name: string;
  /** One sentence, used in indexes. */
  oneLiner: string;
  /** Two or three short paragraphs. */
  body: string[];
  /** Tags that attach an article to this concept. */
  tags: string[];
  projects: string[];
}

export const CONCEPTS: Concept[] = [
  {
    slug: "local-first",
    name: "Local-first inference",
    oneLiner:
      "Running the model, the data and the failure modes on hardware you control.",
    body: [
      "Local-first is not a deployment preference, it is a claim about who can stop your system. If inference runs on someone else's hardware, then availability, cost, acceptable use and observability are all someone else's decisions.",
      "The engineering consequence is that the constraints become yours to discover. Memory is finite, so one model variant fits at a time. Weights are large, so switching variants mid-batch is a process restart, not a cache miss. The GPU is a single device, so generation is serialised whether your code is concurrent or not.",
      "None of that is a limitation of local inference specifically. It is what inference actually costs, made visible because nobody is absorbing it for you.",
      "Put plainly: understanding you cannot run without permission is not yours. Local-first is how the whole loop — question, model, evidence, answer — stays under one owner.",
    ],
    tags: ["local-first-ai", "local-first", "local-ai", "mlx", "ollama", "local-ai-systems"],
    projects: ["sovereign-intelligence-stack", "qwen-image-studio", "konradfreeman-rag", "mindbroadcast"],
  },
  {
    slug: "governed-execution",
    name: "Governed execution",
    oneLiner:
      "The model proposes; a deterministic layer decides whether the proposal may run.",
    body: [
      "An agent that both decides and executes has no place to put a permission check. Splitting the two — probabilistic proposal, deterministic authorisation — is what makes an agent auditable rather than merely supervised.",
      "In practice this means the operations an agent may perform are enumerated as data, the paths it may touch are constrained, and every accepted or refused operation is recorded. A refusal is a normal outcome and should be visible, not swallowed.",
      "The same shape appears in every project here that touches autonomy: a validated specification, an allowlist, an executor, and a record. It is the difference between a system that can be trusted and a system that has been trusted.",
    ],
    tags: ["ai-agents", "agent-architecture", "deterministic", "guardrails", "frozen-spine"],
    projects: ["sovereign-agent-stack", "sovereignspec", "hermes-local-video-studio", "chris-game"],
  },
  {
    slug: "knowledge-compilation",
    name: "Knowledge compilation",
    oneLiner:
      "Turning source material into structured, validated, versioned knowledge units.",
    body: [
      "Retrieval gives you passages. Compilation gives you claims: what was asserted, by which source, with what support, and in conflict with what else. The difference is whether a conclusion can be traced back to something checkable.",
      "A compiler has passes — extraction, normalisation, linking, contradiction detection, validation — and each pass writes an artifact. That is what makes the output inspectable at every stage instead of emerging as a single opaque answer.",
      "The recurring principle across these projects is that evidence magnitude is not sufficiency. A claim supported by a hundred weak sources is not better established than one supported by a single strong one, and a pipeline that only counts support will get that wrong.",
      "This is why compilation beats query-time reasoning on cost as well as rigour. Query-time AI re-derives the same relationships on every request, spending tokens to reach a conclusion someone already reached. Do the hard reasoning once, compile it, and everyone after you inherits the answer instead of re-paying for the question.",
    ],
    tags: ["compile-time-ai", "knowledge-compiler", "research-compiler", "knowledge-compilation", "canonical-knowledge"],
    projects: ["ganymede", "sovereign-intelligence-stack"],
  },
  {
    slug: "provenance",
    name: "Provenance and evidence",
    oneLiner:
      "Every claim keeps the trail back to what supports it, including when the trail ends nowhere.",
    body: [
      "Provenance is usually treated as metadata. It is better treated as a constraint: a claim without a traceable source is not a weaker claim, it is a different kind of object.",
      "The interesting case is when the trail terminates somewhere empty — the source does not exist, or does not say what it was cited for. A system that can represent that outcome is more useful than one that silently drops the claim, because the empty trail is itself the finding.",
      "This is why the archive project renders the trail as a physical object in the film: the beam from claim to source, and the plinth with nothing on it.",
    ],
    tags: ["provenance", "falsifiability", "evidence", "epistemics", "citation"],
    projects: ["ganymede", "sovereign-intelligence-observatory"],
  },
  {
    slug: "graph-retrieval",
    name: "Graph retrieval",
    oneLiner:
      "Representing relationships explicitly instead of hoping a similarity score finds them.",
    body: [
      "Vector search answers 'what looks like this'. A graph answers 'what is connected to this, and through what'. Most questions that matter are the second kind, and the two retrieval modes fail differently, which is why combining them is more useful than choosing.",
      "The practical work is in the edges: what counts as a relationship, how it is typed, and what happens when two edges contradict. A graph that cannot represent contradiction will average it away.",
      "BM25 for lexical precision, cosine for semantic reach, and a graph for structure — each covering the others' blind spot.",
      "Two consequences follow. Judgment is usually implicit — unrepeatable, uninspectable, unteachable — and making a decision an explicit graph turns it into something you can audit, hand down and improve. And a system that forgets between sessions cannot accumulate anything: durable, structured memory is what turns repeated information into compounding knowledge rather than a series of first conversations.",
    ],
    tags: ["knowledge-graph", "knowledge-graphs", "graphrag", "rag", "retrieval", "graph"],
    projects: ["ganymede", "konradfreeman-rag", "pagerank-seo"],
  },
  {
    slug: "evaluation",
    name: "Evaluation and information quality",
    oneLiner:
      "How a system decides which information should be surfaced, trusted, or acted upon.",
    body: [
      "Ranking is a judgement about relevance, and relevance is only meaningful relative to a need. Page Quality and Needs Met are attempts to make that judgement explicit enough to be assessed, rather than leaving it implicit in a model's output.",
      "The engineering version of the same question appears in every retrieval system here: what does it mean for a result to be good, and how would you know? A system that cannot answer that cannot be evaluated, only demonstrated.",
      "This is where professional experience, research interest and implemented work need to be kept apart. The evaluation work informs the architecture; the architecture is what is actually running.",
    ],
    tags: ["seo", "pagerank", "search", "evaluation", "ranking", "information-retrieval", "needs-met"],
    projects: ["pagerank-seo"],
  },
  {
    slug: "creative-automation",
    name: "Creative automation",
    oneLiner:
      "Coordinating creative applications through reusable, verifiable workflows instead of hands.",
    body: [
      "Creative software is built around a person at a keyboard. That makes it powerful and unautomatable at the same time: an agent cannot operate a menu bar, and a build cannot depend on someone remembering to apply a grade.",
      "The move is to make every action a command, then coordinate those commands through skills that encode what the tools actually do — including their silent failures. Most of the difficulty is not in the commands, it is in the fact that these tools accept, ignore and report success.",
      "The consequence for agent design is that a creative pipeline needs the same verification discipline as a data pipeline. An effect that was configured is not an effect that was rendered.",
    ],
    tags: ["video-editing", "local-image-generation", "hermes-agent", "creative-tools", "ffmpeg", "comfyui"],
    projects: ["artcraft", "hermes-local-video-studio", "qwen-image-studio", "chris-game"],
  },
  {
    slug: "reproducibility",
    name: "Reproducibility and verification",
    oneLiner:
      "A result you cannot re-run and measure is an anecdote.",
    body: [
      "Reproducibility starts with pinned inputs and ends with measurement. In between there is a discipline that is easy to state and hard to keep: distinguish what you requested from what you verified.",
      "Every project here has some version of that distinction — a specification that gates implementation, a manifest that records hashes, a quality report that separates verified steps from requested ones. The vocabulary differs; the constraint does not.",
      "The reason it matters is that the failure mode is silent. A tool returns zero, the build goes green, and the defect ships. Only a measurement that would move if the feature stopped working can catch it.",
    ],
    tags: ["reproducible-ai", "determinism", "testing", "verification", "schemas"],
    projects: ["hermes-local-video-studio", "sovereign-agent-stack", "sovereignspec", "mindbroadcast"],
  },
];

/* ── Learning paths ──────────────────────────────────────────────────────────
   A path is an ordered argument for why these resources belong together. Steps
   reference concepts and articles that already exist; nothing here creates new
   documentation.                                                              */

export interface PathStep {
  kind: "concept" | "article";
  ref: string;
  /** Why this step comes here. */
  note: string;
}

export interface LearningPath {
  slug: string;
  name: string;
  promise: string;
  audience: string;
  steps: PathStep[];
}

export const PATHS: LearningPath[] = [
  {
    slug: "local-first-to-governed-agents",
    name: "From local inference to governed agents",
    promise:
      "Why owning the runtime is a precondition for governing what an agent may do.",
    audience: "Engineers who have run a model locally and want to know what comes next.",
    steps: [
      { kind: "concept", ref: "local-first", note: "Start with what ownership actually costs." },
      {
        kind: "article",
        ref: "2026-10-24-qwen-image-2-1-turbo-on-apple-silicon",
        note: "A concrete local runtime, with the constraints that turned out to be real.",
      },
      { kind: "concept", ref: "governed-execution", note: "The split between proposal and permission." },
      {
        kind: "article",
        ref: "2026-10-23-two-models-one-harness",
        note: "Two models behind one execution boundary.",
      },
      { kind: "concept", ref: "reproducibility", note: "Why the boundary has to be measurable." },
    ],
  },
  {
    slug: "knowledge-compilation-end-to-end",
    name: "Knowledge compilation, end to end",
    promise:
      "How raw source material becomes claims you can check, and what happens when the check fails.",
    audience: "Anyone building retrieval systems who has noticed that relevance is not the same as truth.",
    steps: [
      { kind: "concept", ref: "knowledge-compilation", note: "Compilation as a pipeline of passes, not a search box." },
      { kind: "concept", ref: "graph-retrieval", note: "Why structure beats similarity for relational questions." },
      { kind: "concept", ref: "provenance", note: "The constraint that makes a claim checkable." },
      {
        kind: "article",
        ref: "2026-10-25-ganymede-the-archive-of-the-gods",
        note: "The whole argument rendered as a film, including the empty plinth.",
      },
      { kind: "concept", ref: "evaluation", note: "How you would know whether any of it worked." },
    ],
  },
  {
    slug: "verified-creative-workflows",
    name: "Verified creative workflows",
    promise:
      "How to make creative software behave like a build system — and what breaks when you assume it already does.",
    audience: "Engineers automating media, and anyone who has shipped a render that silently lost its transitions.",
    steps: [
      { kind: "concept", ref: "creative-automation", note: "Why creative tools resist automation, and the one move that works." },
      {
        kind: "article",
        ref: "2026-10-11-rust-native-creative-suite-installation",
        note: "The tooling that makes every action a command.",
      },
      {
        kind: "article",
        ref: "2026-10-25-the-dissolve-that-wasnt-applied",
        note: "A transition that failed, and an export that succeeded anyway.",
      },
      {
        kind: "article",
        ref: "2026-10-25-the-keyframe-that-went-nowhere",
        note: "The same class of failure, one layer down.",
      },
      {
        kind: "article",
        ref: "2026-10-25-hermes-local-video-studio",
        note: "The capability that came out of the three post-mortems.",
      },
    ],
  },
];

/* ── Derived joins ─────────────────────────────────────────────────────────── */

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

export function getPath(slug: string): LearningPath | undefined {
  return PATHS.find((p) => p.slug === slug);
}

/** Articles attached to a concept, derived from the archive's own tags. */
export function articlesForConcept(concept: Concept): Post[] {
  const wanted = new Set(concept.tags.map((t) => t.toLowerCase()));
  return getAllPosts().filter((post) =>
    post.tags.some((t) => wanted.has(t.toLowerCase()))
  );
}

export function postsBySlug(slugs: string[]): Post[] {
  const all = getAllPosts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is Post => Boolean(p));
}

export function conceptsForProject(project: Project): Concept[] {
  return project.concepts
    .map((slug) => getConcept(slug))
    .filter((c): c is Concept => Boolean(c));
}

export function projectsForConcept(concept: Concept): Project[] {
  return concept.projects
    .map((slug) => getProject(slug))
    .filter((p): p is Project => Boolean(p));
}

export const MATURITY_LABEL: Record<Maturity, string> = {
  implementation: "Implementation",
  prototype: "Prototype",
  research: "Research",
};

/** Resolve a path step to a title + href, so the UI never guesses. */
export function resolveStep(step: PathStep): { title: string; href: string; kicker: string } | null {
  if (step.kind === "concept") {
    const c = getConcept(step.ref);
    return c ? { title: c.name, href: `/concepts/${c.slug}`, kicker: "Concept" } : null;
  }
  const post = postsBySlug([step.ref])[0];
  return post
    ? { title: post.title, href: `/blog/${post.slug}`, kicker: "Article" }
    : null;
}
