---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-06-14-sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems
date: 06-14-2026
description: A deep dive into Sovereign Memory Bank, an autonomous cognitive memory
  system that transforms markdown documents into a continuously evolving seven-layer
  memory architecture optimized for agent reasoning and knowledge synthesis.
image: /images/1103010.png
layout: post
og:description: A deep dive into Sovereign Memory Bank, an autonomous cognitive memory
  system that transforms markdown documents into a continuously evolving seven-layer
  memory architecture optimized for agent reasoning and knowledge synthesis.
og:image: /images/1103010.png
og:title: 'Sovereign Memory Bank: A Deep Dive Into Autonomous Cognitive Memory for
  Agent Systems'
og:type: article
og:url: /blog/2026-06-14-sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems
tags:
- memory
- ai-agents
- knowledge-graph
- rag
- local-llm
- cognitive-memory
title: 'Sovereign Memory Bank: A Deep Dive Into Autonomous Cognitive Memory for Agent
  Systems'
twitter:card: summary_large_image
twitter:description: A deep dive into Sovereign Memory Bank, an autonomous cognitive
  memory system that transforms markdown documents into a continuously evolving seven-layer
  memory architecture optimized for agent reasoning and knowledge synthesis.
twitter:image: /images/1103010.png
twitter:title: 'Sovereign Memory Bank: A Deep Dive Into Autonomous Cognitive Memory
  for Agent Systems'
wiki_references: ["ai-agents", "embeddings", "knowledge-graphs", "local-first-ai", "local-inference", "ollama", "python", "rag", "sentence-transformers"]
---

[Github](https://github.com/kliewerdaniel/sovereignBank)

# Sovereign Memory Bank: A Deep Dive Into Autonomous Cognitive Memory for Agent Systems

**By Daniel Kliewer** · June 14, 2026

---

Every knowledge system I've built — and most I've encountered in the wild — treats memory the same way a warehouse treats inventory: it arrives, it gets shelved, and it waits passively for retrieval. That model is fundamentally broken for the class of problems I care about: agent reasoning, knowledge synthesis, and emergent understanding. When an AI agent needs to *think* across tens of thousands of documents, it doesn't need a search index. It needs a cognitive substrate that evolves, reflects, and constructs new understanding from what it already knows.

That's what drove me to build **Sovereign Memory Bank** (`kliewerdaniel/sovereignBank`). It's an autonomous cognitive memory system that ingests markdown documents and transforms them into a continuously evolving memory architecture optimized for agent reasoning and knowledge synthesis — not retrieval. The system generates novel insights not explicitly present in the source documents, serving as a writable cognitive substrate for AI agents.

This post walks through the entire architecture in full technical detail: the seven-layer memory model, the tripartite storage system, the autonomous evolution engine, and the hybrid recall pipeline. If you've ever wondered why RAG feels like a band-aid on a broken paradigm, this is the alternative.

---

## The Problem With Retrieval

Before diving into the architecture, it's worth stating the core thesis explicitly: **information architecture is the product**. Most systems treat memory as a passive store — write, index, query. That works for document search. It doesn't work for cognition.

A cognitive memory system must:

1. **Organize knowledge around cognitive structures** (concepts, claims, entities, relationships, narratives, insights, abstractions, contradictions, questions, beliefs, syntheses) rather than source files.
2. **Represent every significant memory simultaneously as multiple cognitive artifacts** — a concept object, a claim object, a graph node, and an embedding representation — enabling multi-pathway reasoning.
3. **Actively create new knowledge structures** not in the source material: synthesized concepts, higher-order abstractions, meta-concepts, and world models.
4. **Evolve autonomously** by merging/splitting concepts, promoting abstractions, detecting contradictions, reorganizing taxonomy, and deprecating stale knowledge.

Sovereign Memory Bank is built to satisfy all four.

---

## The Specification

The system was spec-driven from the start, defined in `smb.sspec` (version 0.1.0). Fifteen requirements, six constraints, nine acceptance criteria, and four test cases. A few constraints that shaped the entire design:

- **Source memory artifacts (Layer 0) must be immutable once ingested.** You can't rewrite history.
- **The system must operate locally-first with no cloud API dependency.** Everything runs through Ollama.
- **Contradictions must never be silently deleted.** They are stored as first-class memory objects — this is a philosophical commitment, not a feature.
- **The graph must use only defined edge types:** `references`, `supports`, `contradicts`, `extends`, `derives_from`, `inspired_by`, `evolves_into`, `related_to`, `contains`, `explains`.
- **The graph must use only defined node types:** `concept`, `entity`, `claim`, `insight`, `narrative`, `abstraction`.

The acceptance criteria are aggressive: *an agent must be able to reason across tens of thousands of source documents without degradation*, *reasoning performance must improve as memory grows rather than degrade*, and *the system must discover and record relationships not explicitly stated in any single source document*.

---

## The Seven-Layer Memory Architecture

The core organizing principle is a seven-layer memory hierarchy, modeled loosely on cognitive architectures from the psychology literature but implemented as a concrete filesystem structure under `memory-bank/layer-{0..6}/`.

### Layer 0: Source Memory

The immutable root. Raw markdown documents, conversations, and notes land here exactly as they arrived. Once ingested, source artifacts are never modified. This is the only layer that preserves the original document structure.

```
memory-bank/layer-0/source/
├── document-1.md
├── document-2.md
└── document-3.md
```

### Layer 1: Extracted Memory

Atomic memory objects extracted from source documents. This is where the raw material is decomposed into discrete, addressable units:

- **Concepts** — ideas, topics, or themes
- **Claims** — factual or opinion statements
- **Entities** — named things (people, organizations, places)
- **Relationships** — connections between other objects

Each object is stored as a markdown file with YAML frontmatter containing its metadata:

```yaml
---
id: a3f2b8c1d4e5
type: concept
confidence: 0.85
created: 2026-06-14T10:30:00+00:00
modified: 2026-06-14T10:30:00+00:00
status: active
embedding_id: emb-a3f2b8c1d4e5
graph_node_id: mem-a3f2b8c1d4e5
title: "Knowledge Graphs"
source_ids:
  - document-1
tags:
  - graph
  - reasoning
---

Knowledge Graphs
```

The `MemoryObject` base class enforces a standard schema: `id`, `type`, `confidence`, `created`, `modified`, `status`, `embedding_id`, `graph_node_id`, `title`, `description`, `source_ids`, and `tags`. Subclasses add type-specific fields — `Concept` carries `related_concepts` and `associated_claims`; `Claim` carries `claim_text`, `supports`, and `contradicts`; `Entity` carries `entity_type`.

### Layer 2: Semantic Memory

Knowledge organization structures. This layer holds taxonomy hierarchies, cluster groupings, and community structures discovered through analysis of the extracted memory objects.

```
memory-bank/layer-2/
├── taxonomy/
├── clusters/
└── communities/
```

### Layer 3: Reflective Memory

The system's capacity for self-awareness about what it knows — and doesn't know. This layer stores:

- **Insights** — meaningful patterns or observations derived from the knowledge base
- **Questions** — research gaps or open inquiries
- **Contradictions** — conflicting claims stored as first-class objects, never silently resolved

The contradiction handling is deliberate. In most systems, contradictory information is resolved by voting, averaging, or discarding. Here, contradictions are preserved because they represent genuine epistemic tension — they trigger research questions and synthesis generation.

### Layer 4: Synthetic Memory

Novel understanding that didn't exist in the source material:

- **Abstractions** — higher-order generalizations across domains
- **World-models** — integrated representations of how domains interact
- **Meta-concepts** — concepts about concepts
- **Syntheses** — cross-cutting integrations of multiple knowledge strands

This is where the system actually *creates* knowledge rather than just organizing it.

### Layer 5: Narrative Memory

Long-form understanding:

- **Narratives** — structured stories explaining how domains evolved
- **Timelines** — chronological ordering of events and developments
- **Evolution** — records of how the memory bank itself has changed

### Layer 6: Executive Memory

Actionable knowledge derived from the cognitive substrate:

- **Research** — research agendas and directions
- **Specifications** — system requirements and design documents
- **Projects** — concrete work items
- **Plans** — execution strategies

---

## The Tripartite Storage System

Every memory object exists simultaneously in three representations, each optimized for a different reasoning pathway. This is the multi-representation principle in practice.

### 1. Markdown Storage (`MarkdownStore`)

The primary persistence layer. Each memory object is a self-contained markdown file with YAML frontmatter. This is human-readable, version-controllable, and inspectable. The `MarkdownStore` maps memory types to specific layer directories via `TYPE_TO_LOCATION`:

```python
TYPE_TO_LOCATION: dict[MemoryType, tuple[LayerIndex, str]] = {
    MemoryType.CONCEPT: (LayerIndex.EXTRACTED, "concepts"),
    MemoryType.CLAIM: (LayerIndex.EXTRACTED, "claims"),
    MemoryType.ENTITY: (LayerIndex.EXTRACTED, "entities"),
    MemoryType.RELATIONSHIP: (LayerIndex.EXTRACTED, "relationships"),
    MemoryType.INSIGHT: (LayerIndex.REFLECTIVE, "insights"),
    MemoryType.CONTRADICTION: (LayerIndex.REFLECTIVE, "contradictions"),
    MemoryType.QUESTION: (LayerIndex.REFLECTIVE, "questions"),
    MemoryType.SYNTHESIS: (LayerIndex.SYNTHETIC, "syntheses"),
    MemoryType.ABSTRACTION: (LayerIndex.SYNTHETIC, "abstractions"),
    MemoryType.NARRATIVE: (LayerIndex.NARRATIVE, "narratives"),
}
```

The `MemoryObject.to_markdown()` method serializes to this format, and `deserialize_memory()` reconstructs from it. The YAML header is parsed via PyYAML, and the body becomes the description.

### 2. SQLite Metadata Store (`SQLiteStore`)

A structured query layer for fast metadata lookups, filtering, and counting. The schema includes:

```sql
CREATE TABLE IF NOT EXISTS memory_objects (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT DEFAULT '',
    confidence REAL DEFAULT 0.5,
    status TEXT DEFAULT 'active',
    embedding_id TEXT,
    graph_node_id TEXT,
    source_ids TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    layer TEXT,
    created TEXT NOT NULL,
    modified TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_objects(type);
CREATE INDEX IF NOT EXISTS idx_memory_status ON memory_objects(status);
CREATE INDEX IF NOT EXISTS idx_memory_layer ON memory_objects(layer);
```

All operations are async via `aiosqlite`. The store supports `save`, `get`, `delete`, `list_by_type`, `list_by_status`, `list_all`, `count`, and `update_embedding`. Source IDs and tags are stored as JSON strings for flexible querying.

### 3. ChromaDB Vector Store (`VectorStore`)

Semantic recall via cosine similarity. The store uses `chromadb.PersistentClient` with `anonymized_telemetry=False` (local-first, no telemetry). Each memory object gets an embedding generated through Ollama's `nomic-embed-text` model. The collection is configured with `hnsw:space: cosine`.

```python
self._collection = self._client.get_or_create_collection(
    name=self.collection_name,
    metadata={"hnsw:space": "cosine"},
)
```

The vector store supports `add`, `update`, `delete`, `query` (with text or embedding input, optional `where` filter), `get`, and `count`.

### 4. Knowledge Graph (`KnowledgeGraph`)

The structural reasoning layer. An in-memory graph persisted as JSON to `memory-bank/graph.json`. Nodes and edges are typed:

**Node types:** `concept`, `entity`, `claim`, `insight`, `narrative`, `abstraction`

**Edge types:** `references`, `supports`, `contradicts`, `extends`, `derives_from`, `inspired_by`, `evolves_into`, `related_to`, `contains`, `explains`

The graph supports:
- **Neighbor queries** with optional edge type filtering
- **Multi-hop BFS traversal** returning all paths up to `max_hops`
- **Path finding** between two nodes
- **Node/edge creation**
- **Nodes-by-type queries**

```python
def multi_hop_query(
    self,
    start_id: str,
    max_hops: int = 3,
    edge_type_filter: Optional[NodeEdgeType] = None,
) -> list[GraphPath]:
    """BFS multi-hop query returning all paths up to max_hops."""
```

This is the backbone of structural reasoning — you can trace how a claim connects to supporting evidence, how a concept derives from abstractions, or how contradictions propagate through the knowledge space.

---

## The Ingestion Pipeline

The `Ingester` class orchestrates the full ingestion pipeline. When you run `smb ingest`, here's what happens:

1. **Source Storage**: The raw markdown file is copied to `memory-bank/layer-0/source/`, making it immutable.
2. **Graph Node Creation**: A source node is added to the knowledge graph with type `concept` and metadata including the file path.
3. **Extraction**: The `Extractor` decomposes the document into atomic memory objects (concepts, claims, entities, relationships).
4. **Markdown Persistence**: Each extracted object is saved as a markdown file in its appropriate layer directory.
5. **SQLite Registration**: Metadata is written to the structured store.
6. **Embedding Generation**: The `Embedder` generates a vector embedding via Ollama.
7. **Vector Storage**: The embedding is persisted in ChromaDB.
8. **Graph Node Registration**: A graph node is created for each memory object, and edges are established connecting the new objects to existing graph nodes and the source node.

The entire pipeline is async, and the `Ingester.ingest_directory()` method processes files sequentially, tracking success/failure per file and returning a summary dict.

---

## The Autonomous Evolution Engine

This is where the system diverges from every knowledge base I've encountered. The `EvolutionEngine` runs periodic cycles (default: every 3600 seconds) that actively reshape the memory architecture. A full cycle consists of five phases:

### Phase 1: Deduplication

The `DuplicateDetector` identifies conceptually identical memory objects and merges them. Duplicate concepts are consolidated, and their source IDs and tags are unioned. The merged object retains the highest confidence score.

### Phase 2: Concept Splitting

The `ConceptSplitter` identifies overloaded concepts — those that have accumulated too many disparate associations — and splits them into more specific sub-concepts. This prevents concept drift and maintains taxonomic precision.

### Phase 3: Contradiction Detection

The `ContradictionDetector` scans for conflicting claims and stores contradictions as first-class `MemoryType.CONTRADICTION` objects. This is critical: contradictions are never resolved away. They are preserved as evidence of epistemic tension, and they trigger the creation of research `Question` objects.

### Phase 4: Abstraction Promotion

The `AbstractionPromoter` identifies patterns across multiple concepts or claims and promotes them to higher-order abstractions in Layer 4. If three concepts share significant overlap, the system creates an abstraction that encompasses them, and edges are created linking the abstraction to its constituent concepts via `contains` edges.

### Phase 5: Synthesis Generation

The `SynthesisGenerator` produces `MemoryType.SYNTHESIS` objects — cross-cutting integrations of concepts, claims, relationships, narratives, and insights. These are genuinely novel knowledge structures that didn't exist in any single source document.

Each phase returns a result dict, and the full cycle result is timestamped. The graph is saved after the cycle completes.

---

## The Agent Interface

The FastAPI server exposes a REST API for agent interaction. The app uses a `lifespan` context to initialize all stores and the graph, storing them in `app.state`:

```python
@app.on_event("startup")
async def startup():
    app.state.layer_manager = LayerManager(settings.memory_bank_dir)
    app.state.markdown_store = MarkdownStore(app.state.layer_manager)
    app.state.sqlite_store = SQLiteStore(settings.sqlite_db_path)
    app.state.vector_store = VectorStore(settings.chroma_persist_dir, settings.chroma_collection)
    app.state.knowledge_graph = KnowledgeGraph(settings.memory_bank_dir / "graph.json")
```

### Memory CRUD

- `GET /api/memory/{id}` — retrieve by ID (searches across all types)
- `POST /api/memory/` — create new memory object
- `PUT /api/memory/{id}` — update with partial fields
- `DELETE /api/memory/{id}` — cascading delete (markdown + SQLite + vector + graph)
- `GET /api/memory/` — list with optional type filter and limit

### Graph Operations

- `GET /api/graph/stats` — node/edge counts by type
- `GET /api/graph/nodes/{id}` — node details
- `GET /api/graph/neighbors/{id}` — neighbors with optional edge type filter
- `GET /api/graph/multi-hop/{id}` — BFS traversal
- `GET /api/graph/path/{start}/{end}` — path finding
- `POST /api/graph/nodes` — add node
- `POST /api/graph/edges` — add edge
- `GET /api/graph/type/{type}` — nodes by type

### Search

- `POST /api/search/` — semantic vector search with optional type filter
- `GET /api/search/stats` — embedding count

### Hybrid Recall

The most powerful endpoint: `POST /api/hybrid/`. It combines semantic vector search with graph traversal:

1. **Semantic search** returns the top-N most relevant memory objects
2. **Graph expansion** traverses from those nodes up to `max_hops` (default 2), optionally filtered by edge type

The response includes both the semantic results and the graph-expanded nodes, giving an agent both the most relevant content and the structural context around it. This is the closest this system gets to actual reasoning support — not just "what's relevant" but "what connects to what's relevant."

```python
class HybridQueryRequest(BaseModel):
    query: str
    n_results: int = 10
    max_hops: int = 2
    edge_type: Optional[NodeEdgeType] = None
```

---

## The CLI

The `smb` command provides four operations:

```bash
# Initialize the memory bank directory structure
smb init

# Ingest markdown documents from a source directory (default: ./kbmd)
smb ingest [--source PATH]

# Run a single autonomous evolution cycle
smb evolve

# Start the FastAPI server
smb serve [--host HOST] [--port PORT]
```

The CLI is minimal by design — it's a bootstrap and control interface, not a data access layer. Agents interact through the REST API.

---

## Configuration

The system uses Pydantic Settings with `SMB_`-prefixed environment variables and `.env` file support. Key configuration points:

| Setting | Default | Description |
|---|---|---|
| `SMB_OLLAMA_HOST` | `http://localhost:11434` | Ollama API endpoint |
| `SMB_OLLAMA_MODEL` | `qwen2.5-coder:32b` | LLM model for extraction and evolution |
| `SMB_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `SMB_EVOLUTION_INTERVAL_SECONDS` | `3600` | Evolution cycle frequency |
| `SMB_API_HOST` | `0.0.0.0` | API bind address |
| `SMB_API_PORT` | `8000` | API port |
| `SMB_MEMORY_BANK_DIR` | `./memory-bank` | Root memory directory |
| `SMB_KBMD_DIR` | `./kbmd` | Source document directory |

All paths resolve relative to the project root via `Path.cwd()`. The `model_validator` ensures sensible defaults when values aren't overridden.

---

## Technology Stack

Everything runs locally. No cloud APIs, no external dependencies beyond Ollama:

- **Python 3.13+** — async-first throughout
- **FastAPI + Uvicorn** — REST API server
- **Pydantic Settings** — configuration management
- **ChromaDB** — vector embeddings with HNSW indexing
- **SQLite (aiosqlite)** — structured metadata store
- **Ollama** — local LLM and embedding generation
- **PyYAML** — YAML frontmatter parsing
- **HTTPX** — async HTTP client for Ollama communication

---

## Why This Matters

The fundamental shift Sovereign Memory Bank represents is from **retrieval** to **reasoning substrate**. In a traditional RAG system, the agent queries a search index and receives documents. The agent must do all the reasoning itself, and the memory is passive.

In Sovereign Memory Bank, the memory itself has structure, relationships, contradictions, and emergent knowledge. When an agent queries it:

- The **vector store** provides semantic relevance
- The **graph** provides structural reasoning paths
- The **evolution engine** has already done the work of identifying contradictions, promoting abstractions, and generating syntheses
- The **hybrid recall** combines both pathways into a single reasoning context

The memory isn't just a store — it's a collaborator in the reasoning process.

This matters because the next generation of AI applications won't be defined by how well they retrieve information. They'll be defined by how well they *reason* across information. And reasoning requires a memory architecture that supports it.

---

## Where This Is Going

Sovereign Memory Bank v0.1.0 is the foundation. The roadmap includes:

1. **Agent-agnostic trust layer** — replacing any authentication with filesystem-based trust, making the system usable by any agent regardless of its origin
2. **Contradiction propagation** — when a contradiction is detected, automatically flagging all downstream reasoning that depends on the contradictory claims
3. **Confidence decay** — memory objects should degrade in confidence over time unless reinforced by new evidence
4. **Cross-bank federation** — multiple memory banks that can reason across their boundaries without merging
5. **Neuro-symbolic hybrid reasoning** — combining the symbolic graph reasoning with neural semantic reasoning in a unified pipeline

---

## Building Sovereign Intelligence

The broader thesis driving Sovereign Memory Bank — and all my work in this space — is that sovereign intelligence requires sovereign memory. You can't have an autonomous agent that reasons independently if its memory depends on cloud APIs, external services, or centralized infrastructure.

The memory substrate must be local, inspectable, version-controllable, and self-evolving. It must preserve contradictions rather than suppress them. It must create new knowledge rather than just organize old knowledge.

Sovereign Memory Bank is my best attempt at that so far. The code is open, the specification is public, and I welcome contributions and critiques.

**Repository:** [kliewerdaniel/sovereignBank](https://github.com/kliewerdaniel/sovereignBank)

---

*This post was written in the context of developing SovereignSpec v2 (SpecWeave), a self-verifying, multi-agent spec engine with neuro-symbolic reasoning. Sovereign Memory Bank is a core dependency of that stack.*