import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { FLEET_LAYERS } from "../page";

export function generateStaticParams() {
  return FLEET_LAYERS.map((l) => ({ domain: l.slug }));
}

interface Props {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const layer = FLEET_LAYERS.find((l) => l.slug === domain);
  if (!layer) return { title: "Domain Not Found" };
  return {
    title: `${layer.name} — Fleet Domain`,
    description: layer.description,
    alternates: { canonical: `/fleet/${domain}` },
  };
}

const LAYER_DETAILS: Record<string, { problem: string; whyMatters: string }> = {
  "knowledge-compilation": {
    problem:
      "Human knowledge is scattered across documents, notes, and code. Until it is compiled into navigable structure, it cannot be understood at scale.",
    whyMatters:
      "Compilation is the first step in reducing the cost of understanding: it turns a corpus into something a person can actually explore.",
  },
  "compile-time-ai": {
    problem:
      "Query-time AI rediscovers the same relationships repeatedly. Reasoning done ahead of time is far cheaper to reuse.",
    whyMatters:
      "Compile-time AI is how we lower the cognitive cost of understanding — the hard work happens once, for everyone.",
  },
  "scientific-knowledge-systems": {
    problem:
      "Scientific knowledge is fragmented across papers, code, and institutions. Preserving and connecting it accelerates everyone who comes next.",
    whyMatters:
      "Every hour a researcher spends searching is an hour not spent discovering. Better knowledge systems return that time to science.",
  },
  "local-first-ai": {
    problem:
      "Cloud-dependent AI places knowledge behind someone else's infrastructure and incentives. Local-first keeps it under the user's control.",
    whyMatters:
      "Knowledge that can be shared without being consumed should also be owned. Local-first is how understanding stays sovereign.",
  },
  "cognitive-memory": {
    problem:
      "Systems that forget between sessions cannot accumulate understanding. Memory is what turns information into knowledge.",
    whyMatters:
      "Durable memory is how the cost of understanding keeps falling — each session builds on the last instead of starting over.",
  },
  "research-automation": {
    problem:
      "Much knowledge work is ingestion, synthesis, and reporting. Automating it returns human time to judgment and care.",
    whyMatters:
      "Automation at the level of understanding — not replacement — is how more people can do more meaningful work.",
  },
  "knowledge-representation": {
    problem:
      "Understanding that cannot be represented cannot be reused, taught, or improved. Representation is the substrate of transfer.",
    whyMatters:
      "Clear representation is what makes knowledge portable — from one mind to another, from one system to the next.",
  },
  "decision-graphs": {
    problem:
      "Judgment is usually implicit and unrepeatable. Making it explicit lets reasoning be inspected and taught.",
    whyMatters:
      "When decisions are graphs, not black boxes, understanding becomes something we can pass on and refine.",
  },
};

interface Project {
  name: string;
  repository: string;
  status: string;
  summary: string;
  technologies: string[];
}

const PROJECTS: Record<string, Project[]> = {
  "knowledge-compilation": [
    {
      name: "Sovereign Knowledge Compiler",
      repository: "kliewerdaniel/sovereign-knowledge-compiler",
      status: "active",
      summary:
        "Compile-time memory for local-first AI agents. The reference implementation of The Sovereign Knowledge Compiler — it turns a corpus of human knowledge into structured semantic artifacts, then into a navigable decision graph, using only local inference.",
      technologies: ["Python", "TypeScript", "Ollama", "Local LLM"],
    },
    {
      name: "Knowledge Compiler SDK",
      repository: "kliewerdaniel/knowledge-compiler-sdk",
      status: "active",
      summary:
        "A Python SDK that compiles collections of human knowledge into progressively higher-level semantic artifacts — until they can generate deployable software. The foundation beneath the Sovereign Knowledge Compiler.",
      technologies: ["Python", "Local LLM"],
    },
    {
      name: "sovereign-knowledge-engine",
      repository: "kliewerdaniel/Sovereign-Knowledge-Engine",
      status: "active",
      summary:
        "Local-first, sovereign knowledge system that ingests markdown documents, constructs a multi-layer knowledge graph, generates vector embeddings, performs agentic reasoning, and continuously expands its understanding through human interaction.",
      technologies: ["Python"],
    },
    {
      name: "ukb",
      repository: "kliewerdaniel/ukb",
      status: "active",
      summary:
        "Universal Knowledge Base — Spec-driven knowledge base system. Define what you know in an .sspec file, run start.sh, get a searchable, embeddable, web-UI-equipped knowledge base.",
      technologies: ["Python"],
    },
    {
      name: "blog-knowledge-base",
      repository: "kliewerdaniel/Blog-Knowledge-Base",
      status: "active",
      summary:
        "Next.js chat application that ingests markdown blog posts, constructs a knowledge graph with vector embeddings using a local LLM, and provides a RAG-based chat interface for querying blog content.",
      technologies: ["Next.js", "TypeScript", "Python"],
    },
    {
      name: "LGVRAG series",
      repository: "kliewerdaniel/LGVRAG01",
      status: "experimental",
      summary:
        "Local Graph + Vector RAG System with HelixDB — multiple iterations exploring graph and vector retrieval.",
      technologies: ["Python"],
    },
    {
      name: "mindmap series",
      repository: "kliewerdaniel/mindmap01",
      status: "experimental",
      summary:
        "Mind Map AI — Local LLM-powered Personal Knowledge Graph. Interactive mind maps from notes using local LLMs and vector embeddings.",
      technologies: ["Python"],
    },
  ],
  "compile-time-ai": [
    {
      name: "sovereignSpec",
      repository: "kliewerdaniel/sovereignSpec",
      status: "production",
      summary:
        "Local-first, offline spec-driven development engine that treats specifications as living, graph-grounded artifacts and enforces deterministic code generation through structured pipelines.",
      technologies: ["Python"],
    },
    {
      name: "specweave",
      repository: "kliewerdaniel/specweave",
      status: "active",
      summary:
        "Self-verifying, speculative, multi-agent spec engine with neuro-symbolic reasoning.",
      technologies: ["Python"],
    },
    {
      name: "synthScript",
      repository: "kliewerdaniel/synthScript",
      status: "active",
      summary:
        "Semantic operating system that transforms a knowledge graph into executable software specifications — no more prompting LLMs directly.",
      technologies: ["Python"],
    },
  ],
  "scientific-knowledge-systems": [
    {
      name: "sovereign-intelligence-stack",
      repository: "kliewerdaniel/sovereign-intelligence-stack",
      status: "production",
      summary:
        "The canonical 5-layer sovereign intelligence architecture: recipe compiler, signal router, autonomous evaluation, apprenticeship engine, and intelligence observatory.",
      technologies: ["TypeScript", "Python", "Ollama"],
    },
    {
      name: "sovereign-intelligence-observatory",
      repository: "kliewerdaniel/sovereign-intelligence-observatory",
      status: "active",
      summary:
        "Complete local-first AI observability platform that tracks, analyzes, and optimizes agent intelligence across its entire lifecycle.",
      technologies: ["TypeScript", "Python"],
    },
    {
      name: "zero-trust",
      repository: "kliewerdaniel/zero-trust",
      status: "active",
      summary:
        "Security architecture for AI-generated code preventing supply chain poisoning, DLL sideloading, and trust inheritance exploits.",
      technologies: ["Python"],
    },
    {
      name: "quantum series",
      repository: "kliewerdaniel/q01",
      status: "experimental",
      summary:
        "Post-quantum cryptography implementations for sovereign systems: q01, quantum01, quantum03, r02.",
      technologies: ["Python"],
    },
    {
      name: "Learn",
      repository: "kliewerdaniel/learn",
      status: "active",
      summary:
        "Self-hosted, personalized AI learning platform powered by local LLMs, knowledge graphs, and retrieval-augmented generation.",
      technologies: ["Python"],
    },
    {
      name: "catholic-kb",
      repository: "kliewerdaniel/catholic-kb",
      status: "active",
      summary:
        "Local-first Catholic knowledge base with AI-powered Q&A. Built with Tauri, Rust, and vanilla JavaScript.",
      technologies: ["Rust", "Tauri", "JavaScript"],
    },
    {
      name: "cathkb",
      repository: "kliewerdaniel/cathkb",
      status: "active",
      summary:
        "Local-first doctrinal reasoning engine grounded exclusively in authoritative Catholic sources.",
      technologies: ["Python"],
    },
    {
      name: "chrome-ai-filename-generator",
      repository: "kliewerdaniel/chrome-ai-filename-generator",
      status: "experimental",
      summary:
        "Studies the interaction between local inference and everyday user workflows. A concrete experiment in unobtrusive on-device AI utility.",
      technologies: ["JavaScript"],
    },
  ],
  "local-first-ai": [
    {
      name: "turboq",
      repository: "kliewerdaniel/turboq",
      status: "active",
      summary:
        "Comprehensive local LLM inference platform that synthesizes research-grade KV cache optimization, graph-based agent orchestration, and distributed cluster deployment into a unified system.",
      technologies: ["Go"],
    },
    {
      name: "sovereign-scaffold",
      repository: "kliewerdaniel/sovereign-scaffold",
      status: "active",
      summary:
        "Deployable, configurable sovereign AI system that you can run locally and deploy for any client.",
      technologies: ["Python"],
    },
    {
      name: "sovereign",
      repository: "kliewerdaniel/sovereign",
      status: "production",
      summary:
        "Local-first AI operating system. No cloud. No telemetry. Your inference. Your memory. Your governance.",
      technologies: ["Python"],
    },
    {
      name: "sse",
      repository: "kliewerdaniel/sse",
      status: "active",
      summary:
        "Local-first, privacy-focused Sovereign Intelligence Layer that eliminates dependency on cloud-based AI services.",
      technologies: ["Python"],
    },
    {
      name: "rlm",
      repository: "kliewerdaniel/rlm",
      status: "active",
      summary:
        "General plug-and-play inference library for Recursive Language Models (RLMs), supporting various sandboxes.",
      technologies: ["Python"],
    },
    {
      name: "ollama-chatbot",
      repository: "kliewerdaniel/ollama-chatbot",
      status: "experimental",
      summary: "Experimental Ollama integration for chatbot applications.",
      technologies: ["Python"],
    },
  ],
  "cognitive-memory": [
    {
      name: "orthos",
      repository: "kliewerdaniel/orthos",
      status: "experimental",
      summary:
        "A locally sovereign, replayable, graph-executed cognitive system.",
      technologies: ["Python"],
    },
    {
      name: "divine-light",
      repository: "kliewerdaniel/divine-light",
      status: "active",
      summary:
        "Unified AI memory system combining MemPalace verbatim storage, Graphify knowledge graphs, and Synt-inspired reasoning agents.",
      technologies: ["Python"],
    },
    {
      name: "sovereign-memory-bank",
      repository: "kliewerdaniel/sovereignBank",
      status: "production",
      summary:
        "Seven-layer cognitive memory architecture for autonomous agents: raw documents → synthesized abstractions → cross-document insights.",
      technologies: ["Python", "Ollama"],
    },
    {
      name: "brain-memory-graphrag-engine",
      repository: "kliewerdaniel/Brain-Memory-GraphRAG-Engine",
      status: "active",
      summary:
        "Unified system that combines sovereign Graph RAG with self-improving agent memory.",
      technologies: ["Python"],
    },
    {
      name: "bot series",
      repository: "kliewerdaniel/bot001",
      status: "experimental",
      summary:
        "Multiple AI chatbot and research assistant iterations exploring GraphRAG, MCP integration, and conversational interfaces.",
      technologies: ["Python", "Next.js"],
    },
    {
      name: "basicbot",
      repository: "kliewerdaniel/basicbot",
      status: "experimental",
      summary:
        "Sophisticated Research Assistant powered by GraphRAG technology for analyzing documents and research data.",
      technologies: ["Python", "Next.js"],
    },
  ],
  "research-automation": [
    {
      name: "objective",
      repository: "kliewerdaniel/objective",
      status: "active",
      summary:
        "Autonomous news ingestion, claim extraction, contradiction tracking, and TTS broadcast — entirely on your laptop.",
      technologies: ["Python"],
    },
    {
      name: "objective05",
      repository: "kliewerdaniel/objective05",
      status: "active",
      summary:
        "Perpetual intelligence and broadcasting platform — a long-running daemon that continuously ingests information, extracts entities and claims, detects events, narratives, and contradictions, maintains a living knowledge graph, and generates written reports and audio broadcasts.",
      technologies: ["Python"],
    },
    {
      name: "objective06",
      repository: "kliewerdaniel/objective06",
      status: "active",
      summary:
        "Local-first intelligence infrastructure that continuously synthesizes a user's digital existence into a persistent, evolving cognitive model.",
      technologies: ["Python"],
    },
    {
      name: "synt",
      repository: "kliewerdaniel/synt",
      status: "production",
      summary:
        "Revolutionary, air-gapped Local-First Dynamic Persona Intelligence System that transforms large, heterogeneous corpuses into grounded, attributable, and conversationally explorable intelligence using deterministic generative models.",
      technologies: ["Python"],
    },
    {
      name: "SynthInt",
      repository: "kliewerdaniel/SynthInt",
      status: "production",
      summary:
        "Dynamic Persona Intelligence System that transforms large, heterogeneous corpuses into grounded, attributable, and conversationally explorable intelligence.",
      technologies: ["Python"],
    },
    {
      name: "dynamic_persona_moe_rag",
      repository: "kliewerdaniel/dynamic_persona_moe_rag",
      status: "active",
      summary:
        "Dynamic graph-based Mixture-of-Experts RAG system using persona JSON files and a local Ollama model.",
      technologies: ["Python"],
    },
    {
      name: "AMIS",
      repository: "kliewerdaniel/amis",
      status: "active",
      summary:
        "Autonomous Marketing Intelligence System — turns a corpus of Markdown blog posts into an autonomous marketing knowledge graph that plans, ranks, recommends, and generates campaigns.",
      technologies: ["Python"],
    },
    {
      name: "ConCreat",
      repository: "kliewerdaniel/ConCreat",
      status: "experimental",
      summary:
        "Modern web application for creating and managing multimedia content, featuring AI-powered text-to-speech capabilities using Chatterbox.",
      technologies: ["TypeScript"],
    },
    {
      name: "autoblog01",
      repository: "kliewerdaniel/autoblog01",
      status: "active",
      summary:
        "Investigates whether local LLMs can drive a complete content generation pipeline. RSS ingestion, RAG-based writing, and automated publishing on local hardware.",
      technologies: ["Python"],
    },
    {
      name: "RedDiss",
      repository: "kliewerdaniel/RedDiss",
      status: "experimental",
      summary:
        "Explores the practical limits of local LLMs for content analysis. Built during the Loco Local LocalLLaMa Hackathon.",
      technologies: ["Python"],
    },
  ],
  "knowledge-representation": [
    {
      name: "stratagent",
      repository: "kliewerdaniel/stratagent",
      status: "active",
      summary:
        "Collaborative AI development environment where specialized AI personas work together to build software projects.",
      technologies: ["Python"],
    },
    {
      name: "workflow",
      repository: "kliewerdaniel/workflow",
      status: "active",
      summary:
        "Structured AI-assisted development methodology exploring how systems thinking guides human-AI collaboration in software engineering.",
      technologies: ["Markdown"],
    },
    {
      name: "specgen",
      repository: "kliewerdaniel/specgen",
      status: "experimental",
      summary:
        "Transform natural language specifications into production-ready application skeletons using AI-powered agentic workflows.",
      technologies: ["Python"],
    },
    {
      name: "BookForge",
      repository: "kliewerdaniel/bookforge",
      status: "active",
      summary:
        "Deterministic publishing runtime that transforms structured knowledge into professionally written technical books.",
      technologies: ["Python"],
    },
  ],
  "decision-graphs": [
    {
      name: "cogGraph",
      repository: "kliewerdaniel/cogGraph",
      status: "active",
      summary:
        "Sophisticated cognitive routing system that transforms how AI systems process and respond to user inputs through a cognitive graph-based reasoning engine.",
      technologies: ["Python"],
    },
  ],
};

export default async function FleetDomainPage({ params }: Props) {
  const { domain } = await params;
  const layer = FLEET_LAYERS.find((l) => l.slug === domain);
  if (!layer) notFound();

  const details = LAYER_DETAILS[domain];
  const systems = PROJECTS[domain] ?? [];

  return (
    <div className="bg-ink text-paper">
      <Container className="pt-24 pb-14">
        <Link
          href="/fleet"
          className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline mb-8 inline-block"
        >
          ← Back to the Fleet
        </Link>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-moss text-3xl">{layer.icon}</span>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight">
            {layer.name}
          </h1>
        </div>
        <p className="text-xl text-paper-dim mb-4 leading-relaxed max-w-3xl">
          {layer.description}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper-dim">
          A Fleet domain · running on the frozen substrate
        </p>
      </Container>

      <section className="border-t border-hairline">
        <Container className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
            <div className="bg-ink-card p-7">
              <h2 className="font-display text-2xl mb-3">The problem it answers</h2>
              <p className="text-paper-dim leading-relaxed">{details.problem}</p>
            </div>
            <div className="bg-ink-card p-7">
              <h2 className="font-display text-2xl mb-3">Why it matters</h2>
              <p className="text-paper-dim leading-relaxed">{details.whyMatters}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <SectionHeading
            kicker={`${systems.length} Fleet Deployment${systems.length === 1 ? "" : "s"}`}
            title="Systems in this domain"
            lede="Open source on GitHub. Every system below runs on the same frozen governance substrate — proving the domain required zero substrate edits."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {systems.map((sys) => (
              <div key={sys.name} className="bg-ink-card border border-hairline p-7">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-2xl text-paper">{sys.name}</h3>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-amber whitespace-nowrap pt-1">
                    {sys.status}
                  </span>
                </div>
                <p className="text-paper-dim leading-relaxed mb-5">{sys.summary}</p>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-paper-dim mb-5">
                  {sys.technologies.join(" · ")}
                </p>
                <a
                  href={`https://github.com/${sys.repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline"
                >
                  github.com/{sys.repository} →
                </a>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12">
          <div className="flex flex-wrap gap-6 items-center">
            <Link
              href="/fleet"
              className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
            >
              ← All Domains
            </Link>
            <Link
              href="/research"
              className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline"
            >
              Browse the research log →
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
