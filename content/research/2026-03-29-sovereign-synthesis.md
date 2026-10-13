---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-03-29-sovereign-synthesis
date: 03-29-2026
description: The capstone synthesis of every system I have built — Dynamic Persona
  MoE RAG, agentic knowledge graphs, Control Boundary governance, local inference
  stacks, and spec-driven code generation — collapsed into one unified sovereign AI
  architecture called SOVEREIGN. This is the project blueprint.
image: /images/ComfyUI_00198_.png
layout: post
og:description: The capstone synthesis of Dynamic Persona MoE RAG, knowledge graphs,
  governance, and local inference — collapsed into one unified sovereign AI architecture.
og:image: /images/ComfyUI_00198_.png
og:title: 'SOVEREIGN: The Unified Architecture for Local-First AI'
og:type: article
og:url: /blog/2026-03-29-sovereign-synthesis
tags:
- sovereign AI
- local-first
- MoE RAG
- knowledge graph
- agentic orchestration
- data sovereignty
- Ollama
- Neo4j
- ChromaDB
- FastAPI
- Next.js
- local LLM
- Control Boundary
- audit-ready AI
- autonomous agents
- persona engineering
- SpecGen
- architecture
- capstone
- Python
- TypeScript
title: 'SOVEREIGN: The Unified Architecture — A Magnum Opus for Local-First AI Systems
  That Think for Themselves'
twitter:card: summary_large_image
twitter:description: Every module I've built collapsed into one sovereign AI architecture.
  This is the blueprint.
twitter:image: /images/ComfyUI_00198_.png
twitter:title: 'SOVEREIGN: The Unified Architecture for Local-First AI'
wiki_references: ["ai-agents", "ai-sovereignty", "data-sovereignty", "docker", "embeddings", "knowledge-graphs", "llama3", "local-first-ai", "local-inference", "ollama", "python", "quantization", "rag", "sentence-transformers", "typescript"]
---
# SOVEREIGN: The Unified Architecture

## A Magnum Opus for Local-First AI Systems That Think for Themselves

> *"The mind that runs on borrowed infrastructure answers to its landlord. Build your own floor."*

---

## Preface: Why This Post Exists

Every system I have built over the last several years was an answer to a problem I could not ignore.

SynthInt answered the problem of opaque identity: why should the values baked into an AI's persona belong to someone else? Dynamic Persona MoE RAG answered the problem of context drift: why should yesterday's dead context contaminate today's reasoning? The Private Knowledge Graph answered the problem of relational amnesia: why should the connections between ideas collapse into similarity scores that lose their meaning? DeerFlow 2.0 answered the problem of isolated execution: why should agents be monoliths when they can be swarms? OpenClaw answered the problem of cloud dependency: why should inference require a network request? SpecGen answered the problem of the blank page: why should code generation be non-deterministic when the specification is precise? mcbot01 answered the problem of foundation: why should every project rebuild the local-first scaffold from scratch?

Each of these was a partial answer. A module. A proof-of-concept that one piece of the sovereignty puzzle could be built, deployed, and owned.

This post is the synthesis.

**SOVEREIGN** — **S**elf-owned **O**rchestration of **V**ersatile **E**xpert **R**easoning, **E**valuation, **I**ntelligence, **G**overnance, and **N**etwork — is the unified architecture that collapses all of these systems into a single coherent project. It is not a rewrite. It is an integration. Every module you have read about on this site is a subsystem in the larger machine. This post is the blueprint for assembling that machine.

I am writing this for myself first. Then for you — the person who read the Sovereignty Manifesto, who runs Ollama on local hardware, who understands intuitively that the architecture you choose encodes your values. You already know why this matters. This post is about how to build it.

And specifically: this post is written so that a coding agent — given nothing but this document as context — can construct the entire SOVEREIGN system from scratch. The architecture is fully specified here. The scaffolding is complete. The philosophy is embedded in the structure itself, because in sovereign AI, the code is always the philosophy.

---

## I. The Thesis: One Problem, Seven Partial Answers, One Synthesis

The core problem of AI in 2026 is not capability. It is ownership.

The most capable models in the world run on hardware you do not control, store context you did not authorize, evolve in directions you did not choose, and serve objectives that were never yours. You interact with them through an interface that was designed to maximize your dependency, not your agency. The extraction is architectural. It was designed in.

I have spent the better part of a decade building the counter-architecture. Not as a rejection of capability — the sovereign stack I describe here is extraordinarily capable — but as a rejection of the trade embedded in every cloud AI interaction: your context in exchange for their compute.

The seven systems that SOVEREIGN synthesizes each resolved one dimension of this problem:

| System | Problem Solved | Core Contribution |
|---|---|---|
| **SynthInt / Dynamic Persona MoE RAG** | Opaque identity, static personas | Personas as versioned, auditable JSON; MoE routing to specialized reasoning agents |
| **Private Knowledge Graph** | Relational amnesia, flat vector retrieval | Explicit semantic relationships via NetworkX/Neo4j; provenance-tracked multi-hop reasoning |
| **DeerFlow 2.0** | Monolithic agent execution | SuperAgent harness; AIO sandbox; persistent memory across agent invocations |
| **OpenClaw** | Cloud inference dependency | Fully local agent runtime via Ollama + llama.cpp; zero-telemetry execution paths |
| **SpecGen** | Non-deterministic code generation | Spec-driven, RAG-grounded code generation; deterministic output from structured input |
| **mcbot01** | Fragmented local-first scaffolding | Reactive UI + async FastAPI backend as the reusable foundation layer |
| **Control Boundary Engine** | No governance in the execution path | Intent evaluation before execution; audit-ready pipelines; Colorado AI Act "Reasonable Care" compliance |

SOVEREIGN does not replace these systems. It is the environment in which they all run together, passing context between each other through a shared memory substrate, governed by a unified evaluation loop, exposed through a single interface.

The result is not merely a better RAG system. It is a **local-first AI operating system** — a platform for thought that you own completely.

---

## II. Architecture Overview: The Seven Layers

SOVEREIGN is organized as seven concentric layers. Each layer is independently deployable, testable, and replaceable. The boundaries between layers are explicit interfaces, not implementation assumptions. This is the sovereignty principle applied to architecture itself: no layer should be dependent on the internal implementation of another.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 7: INTERFACE LAYER                                           │
│  Next.js 16 (App Router) + React + TypeScript                       │
│  Conversational UI · Session Management · Persona Selector          │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 6: API GATEWAY LAYER                                         │
│  FastAPI · REST/GraphQL · WebSocket streaming · Auth middleware      │
│  Request validation · Rate limiting · Audit log emission            │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 5: ORCHESTRATION LAYER                                       │
│  MoE Orchestrator · Agent Swarm Router · DeerFlow SuperAgent        │
│  Intent classification · Persona activation · Result aggregation    │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 4: GOVERNANCE LAYER                                          │
│  Control Boundary Engine · Evaluation Loop · Audit Trail            │
│  Intent evaluation · Output scoring · Hallucination detection       │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 3: REASONING LAYER                                           │
│  Dynamic Persona Engine · Specialist Agent Pool · SpecGen           │
│  Persona lifecycle · Bounded trait evolution · Code synthesis       │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 2: MEMORY LAYER                                              │
│  Knowledge Graph (Neo4j/NetworkX) · Vector Store (ChromaDB)         │
│  Episodic memory · Semantic graph · Embedding index · Pruning       │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 1: INFERENCE LAYER                                           │
│  Ollama · llama.cpp · Local model registry                          │
│  On-prem inference · Zero telemetry · Reproducible seeds            │
└─────────────────────────────────────────────────────────────────────┘
```

Every request in SOVEREIGN flows downward through these layers and returns upward. The path is never short-circuited. There is no "fast path" that skips governance. There is no "trusted caller" that bypasses the evaluation loop. The architecture enforces the principle that accountability is not optional — it is structural.

---

## III. The Memory Substrate: Dual-Layer Sovereign Memory

The most important architectural decision in SOVEREIGN is the structure of memory. Memory determines what the system knows, what it can reason about, and what it forgets.

SOVEREIGN uses a **dual-substrate memory architecture**: a semantic knowledge graph for relational, provenance-tracked long-term memory, and a vector store for high-dimensional similarity retrieval. These are not interchangeable. They are complementary, and the architecture uses them for different reasoning tasks.

### 3.1 The Semantic Knowledge Graph

The knowledge graph in SOVEREIGN is a persistent, typed, directional graph built on Neo4j (for production persistence) with a NetworkX in-memory layer for query-scoped reasoning. The graph is not a flat document store. It is a living model of your knowledge domain.

Every node in the graph carries:
- A unique identifier and type
- A source document reference (provenance)
- A creation timestamp and last-accessed timestamp
- A relevance decay coefficient (used by the pruning engine)
- A confidence weight (updated by the evaluation loop)

Every edge in the graph carries:
- A typed relationship label (CAUSES, SUPPORTS, CONTRADICTS, PRECEDES, DERIVES_FROM, etc.)
- A weight (0.0–1.0) representing relationship strength
- A source (which agent or document established this relationship)
- A timestamp

This structure makes multi-hop reasoning explicit and auditable. When the system traces a path from Concept A to Claim B through Relationship R, that path is a first-class data structure you can inspect, export, and challenge. It is not a black-box attention pattern.

```python
# sovereign/memory/knowledge_graph.py

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any
import networkx as nx
import uuid


@dataclass
class KGNode:
    """A typed, provenance-tracked node in the sovereign knowledge graph."""
    id: str
    label: str                          # Entity type: CONCEPT, CLAIM, DOCUMENT, AGENT, EVENT
    content: str                        # Human-readable representation
    source_document_id: str             # Provenance anchor
    confidence: float = 1.0             # Updated by evaluation loop
    access_count: int = 0               # Used by LRU-style pruning
    decay_coefficient: float = 0.95     # Per-session relevance decay
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    last_accessed_at: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class KGEdge:
    """A typed, weighted, traceable relationship in the sovereign knowledge graph."""
    id: str
    source_id: str
    target_id: str
    relationship: str                   # CAUSES, SUPPORTS, CONTRADICTS, PRECEDES, DERIVES_FROM
    weight: float = 1.0
    established_by: str = "system"      # Agent ID or document ID that created this edge
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)


class SovereignKnowledgeGraph:
    """
    Dual-substrate knowledge graph: persistent Neo4j backend with
    NetworkX in-memory layer for query-scoped reasoning.
    
    Design principle: every reasoning path is traceable.
    Every node has provenance. Every edge has an author.
    Nothing is inferred without a trail.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.in_memory_graph = nx.DiGraph()
        self.nodes: Dict[str, KGNode] = {}
        self.edges: List[KGEdge] = []
        self._neo4j_driver = None
        self._init_neo4j()

    def _init_neo4j(self):
        """Initialize Neo4j connection if configured; fall back to pure NetworkX."""
        try:
            from neo4j import GraphDatabase
            self._neo4j_driver = GraphDatabase.driver(
                self.config.get("neo4j_uri", "bolt://localhost:7687"),
                auth=(
                    self.config.get("neo4j_user", "neo4j"),
                    self.config.get("neo4j_password", "sovereign")
                )
            )
        except Exception:
            # Graceful degradation: operate as pure in-memory graph
            self._neo4j_driver = None

    def add_node(self, label: str, content: str, source_document_id: str,
                 confidence: float = 1.0, metadata: Optional[Dict] = None) -> KGNode:
        node = KGNode(
            id=str(uuid.uuid4()),
            label=label,
            content=content,
            source_document_id=source_document_id,
            confidence=confidence,
            metadata=metadata or {}
        )
        self.nodes[node.id] = node
        self.in_memory_graph.add_node(
            node.id,
            label=label,
            content=content,
            confidence=confidence
        )
        if self._neo4j_driver:
            self._persist_node_to_neo4j(node)
        return node

    def add_edge(self, source_id: str, target_id: str, relationship: str,
                 weight: float = 1.0, established_by: str = "system") -> Optional[KGEdge]:
        if source_id not in self.nodes or target_id not in self.nodes:
            return None
        edge = KGEdge(
            id=str(uuid.uuid4()),
            source_id=source_id,
            target_id=target_id,
            relationship=relationship,
            weight=weight,
            established_by=established_by
        )
        self.edges.append(edge)
        self.in_memory_graph.add_edge(
            source_id, target_id,
            relationship=relationship,
            weight=weight
        )
        if self._neo4j_driver:
            self._persist_edge_to_neo4j(edge)
        return edge

    def find_reasoning_path(self, source_id: str, target_id: str,
                             relationship_filter: Optional[List[str]] = None) -> List[KGNode]:
        """
        Find an explicit, auditable reasoning path between two nodes.
        
        This is not similarity search. This is structured inference.
        The path returned is a chain of evidence, not a probability distribution.
        """
        try:
            path_ids = nx.shortest_path(self.in_memory_graph, source_id, target_id)
            path_nodes = [self.nodes[nid] for nid in path_ids if nid in self.nodes]
            if relationship_filter:
                # Filter edges along the path to the specified relationship types
                path_nodes = self._filter_path_by_relationship(path_ids, relationship_filter)
            # Update access counts — the memory knows it has been used
            for node in path_nodes:
                node.access_count += 1
                node.last_accessed_at = datetime.utcnow().isoformat()
            return path_nodes
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def apply_temporal_decay(self, decay_factor: float = 0.95):
        """
        Apply temporal decay to all node confidence scores.
        
        Design philosophy: memory that is never accessed should fade.
        The system forgets gracefully, not catastrophically.
        Forgetting is not failure. It is discernment.
        """
        for node in self.nodes.values():
            if node.last_accessed_at is None:
                node.confidence *= decay_factor
                node.confidence = max(0.01, node.confidence)

    def prune_low_confidence_nodes(self, threshold: float = 0.1) -> List[str]:
        """
        Remove nodes whose confidence has decayed below the threshold.
        Returns list of pruned node IDs for audit logging.
        
        What is pruned is not destroyed — it is archived.
        Sovereignty includes the right to forget deliberately.
        """
        pruned_ids = []
        nodes_to_prune = [
            nid for nid, node in self.nodes.items()
            if node.confidence < threshold
        ]
        for nid in nodes_to_prune:
            self.in_memory_graph.remove_node(nid)
            pruned_ids.append(nid)
            del self.nodes[nid]
        return pruned_ids

    def export_subgraph(self, node_ids: List[str]) -> Dict[str, Any]:
        """Export a subgraph for inspection, audit, or external analysis."""
        subgraph_nodes = {nid: self.nodes[nid] for nid in node_ids if nid in self.nodes}
        subgraph_edges = [
            e for e in self.edges
            if e.source_id in node_ids and e.target_id in node_ids
        ]
        return {
            "nodes": [vars(n) for n in subgraph_nodes.values()],
            "edges": [vars(e) for e in subgraph_edges],
            "exported_at": datetime.utcnow().isoformat()
        }

    def _persist_node_to_neo4j(self, node: KGNode):
        with self._neo4j_driver.session() as session:
            session.run(
                "MERGE (n:Node {id: $id}) "
                "SET n.label = $label, n.content = $content, "
                "n.source_document_id = $source_document_id, "
                "n.confidence = $confidence, n.created_at = $created_at",
                id=node.id, label=node.label, content=node.content,
                source_document_id=node.source_document_id,
                confidence=node.confidence, created_at=node.created_at
            )

    def _persist_edge_to_neo4j(self, edge: KGEdge):
        with self._neo4j_driver.session() as session:
            session.run(
                "MATCH (a:Node {id: $source_id}), (b:Node {id: $target_id}) "
                f"MERGE (a)-[r:{edge.relationship} {{id: $edge_id}}]->(b) "
                "SET r.weight = $weight, r.established_by = $established_by",
                source_id=edge.source_id, target_id=edge.target_id,
                edge_id=edge.id, weight=edge.weight,
                established_by=edge.established_by
            )

    def _filter_path_by_relationship(self, path_ids: List[str],
                                      allowed_relationships: List[str]) -> List[KGNode]:
        filtered = []
        for i in range(len(path_ids) - 1):
            edge_data = self.in_memory_graph.get_edge_data(path_ids[i], path_ids[i + 1])
            if edge_data and edge_data.get("relationship") in allowed_relationships:
                if path_ids[i] in self.nodes:
                    filtered.append(self.nodes[path_ids[i]])
        return filtered
```

### 3.2 The Vector Store Integration

The vector store (ChromaDB in development, Qdrant in production) handles the similarity retrieval that the knowledge graph cannot: dense semantic search across large document corpora where the exact relational structure is not yet known.

The critical design decision here is that **the vector store feeds the knowledge graph, not the other way around**. Vector retrieval surfaces candidate documents. The knowledge graph determines how those documents relate to each other and to the current query context. The vector store is a search index. The knowledge graph is the mind.

```python
# sovereign/memory/vector_store.py

from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings


class SovereignVectorStore:
    """
    Local-first vector store with zero cloud dependency.
    
    ChromaDB in development (file-backed, no server required).
    Qdrant in production (local server, same guarantee).
    
    The embeddings are yours. The index is yours.
    Nothing is sent to an external endpoint.
    """

    def __init__(self, config: Dict[str, Any]):
        self.persist_directory = config.get("persist_directory", "./data/chromadb")
        self.collection_name = config.get("collection_name", "sovereign_documents")
        self.embedding_model = config.get("embedding_model", "nomic-embed-text")
        
        # File-backed persistence: data survives restarts on your hardware
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=Settings(anonymized_telemetry=False)  # Explicit: no telemetry
        )
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def embed_and_store(self, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Embed documents and persist to local vector store.
        Returns document IDs for graph node linkage.
        """
        doc_ids = []
        for doc in documents:
            doc_id = doc.get("id", str(uuid.uuid4()))
            self.collection.add(
                documents=[doc["content"]],
                metadatas=[{
                    "source": doc.get("source", "unknown"),
                    "doc_type": doc.get("doc_type", "text"),
                    "created_at": datetime.utcnow().isoformat(),
                    "provenance": doc.get("provenance", "")
                }],
                ids=[doc_id]
            )
            doc_ids.append(doc_id)
        return doc_ids

    def query(self, query_text: str, n_results: int = 10,
              where_filter: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Semantic search over local embeddings.
        Returns results with full provenance metadata.
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        return [
            {
                "id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "relevance_score": 1.0 - results["distances"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]
```

---

## IV. The Inference Layer: Local Execution, Zero Dependency

The inference layer is non-negotiable. It is the foundation of every sovereignty guarantee in the system. If inference is remote, the entire stack is a thin wrapper over someone else's infrastructure. Sovereignty is not a frontend feature. It begins at the model.

SOVEREIGN's inference layer supports three execution modes:

**Mode 1: Ollama (Primary)** — HTTP interface to locally served models. Fast, easy to configure, supports quantized variants of Llama, Qwen, Mistral, Phi, and Gemma families.

**Mode 2: llama.cpp (Fallback/Air-Gap)** — Direct binary execution. No server process. No HTTP overhead. Used when network interface is unacceptable (air-gapped environments, maximum-security deployments).

**Mode 3: Hybrid** — Different specialist agents use different models. The orchestrator routes to the fastest suitable model for the current task. Code tasks go to a code-optimized model. Long-context tasks go to a high-context-window model. All models are local.

```python
# sovereign/inference/local_engine.py

from typing import Dict, Any, Optional, Generator
import requests
import subprocess
import json


class LocalInferenceEngine:
    """
    Unified interface to local model execution.
    
    Design invariant: no request leaves this machine.
    The api_endpoint, even in Ollama mode, resolves to localhost.
    There is no fallback to a cloud endpoint.
    If local inference fails, the system fails loudly — not silently to the cloud.
    """

    EXECUTION_MODES = ["ollama", "llama_cpp", "hybrid"]

    def __init__(self, config: Dict[str, Any]):
        self.mode = config.get("execution_mode", "ollama")
        self.ollama_endpoint = config.get("ollama_endpoint", "http://localhost:11434")
        self.llama_cpp_binary = config.get("llama_cpp_binary", "./bin/llama-cli")
        self.model_registry = config.get("model_registry", {})
        self.default_model = config.get("default_model", "llama3.2")
        self.seed = config.get("seed", 42)             # Reproducibility by default
        self.default_temperature = config.get("temperature", 0.1)
        
        self._validate_local_availability()

    def _validate_local_availability(self):
        """
        Refuse to initialize if no local inference backend is reachable.
        
        This is a hard failure, not a warning.
        Failing loudly protects sovereignty — a silent fallback would not.
        """
        if self.mode in ("ollama", "hybrid"):
            try:
                response = requests.get(f"{self.ollama_endpoint}/api/tags", timeout=5)
                response.raise_for_status()
            except Exception as e:
                raise RuntimeError(
                    f"SOVEREIGN requires local inference. Ollama is not reachable at "
                    f"{self.ollama_endpoint}. Start Ollama with `ollama serve` and retry.\n"
                    f"Original error: {e}"
                )

    def generate(self, prompt: str, system_prompt: str = "",
                 model: Optional[str] = None, temperature: Optional[float] = None,
                 max_tokens: int = 2000, seed: Optional[int] = None) -> str:
        """
        Generate a response from the local model.
        Returns the complete response text.
        """
        effective_model = model or self.default_model
        effective_temperature = temperature if temperature is not None else self.default_temperature
        effective_seed = seed if seed is not None else self.seed

        if self.mode == "ollama":
            return self._generate_ollama(
                prompt, system_prompt, effective_model,
                effective_temperature, max_tokens, effective_seed
            )
        elif self.mode == "llama_cpp":
            return self._generate_llama_cpp(
                prompt, system_prompt, effective_model,
                effective_temperature, max_tokens
            )
        else:
            raise ValueError(f"Unknown execution mode: {self.mode}")

    def generate_stream(self, prompt: str, system_prompt: str = "",
                        model: Optional[str] = None) -> Generator[str, None, None]:
        """
        Stream tokens from local inference for real-time UI updates.
        Every token comes from your hardware.
        """
        effective_model = model or self.default_model
        payload = {
            "model": effective_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "options": {"temperature": self.default_temperature, "seed": self.seed},
            "stream": True
        }
        with requests.post(
            f"{self.ollama_endpoint}/api/chat",
            json=payload,
            stream=True,
            timeout=120
        ) as response:
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if not chunk.get("done"):
                        yield chunk.get("message", {}).get("content", "")

    def route_to_specialist(self, task_type: str, prompt: str,
                             system_prompt: str = "") -> str:
        """
        Route to the best local model for the given task type.
        
        The routing table is yours. You decide which model handles what.
        The routing logic is explicit, auditable, and modifiable.
        """
        routing_table = self.model_registry.get("routing", {})
        specialist_model = routing_table.get(task_type, self.default_model)
        return self.generate(prompt, system_prompt, model=specialist_model)

    def _generate_ollama(self, prompt: str, system_prompt: str, model: str,
                          temperature: float, max_tokens: int, seed: int) -> str:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt or "You are a helpful, precise assistant."},
                {"role": "user", "content": prompt}
            ],
            "options": {
                "temperature": temperature,
                "seed": seed,
                "num_predict": max_tokens
            },
            "stream": False
        }
        response = requests.post(
            f"{self.ollama_endpoint}/api/chat",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        return response.json()["message"]["content"]

    def _generate_llama_cpp(self, prompt: str, system_prompt: str, model: str,
                              temperature: float, max_tokens: int) -> str:
        model_path = self.model_registry.get("paths", {}).get(model, model)
        full_prompt = f"<|system|>{system_prompt}<|user|>{prompt}<|assistant|>"
        result = subprocess.run(
            [
                self.llama_cpp_binary,
                "-m", model_path,
                "-p", full_prompt,
                "--temp", str(temperature),
                "-n", str(max_tokens),
                "--silent-prompt",
                "--no-display-prompt"
            ],
            capture_output=True, text=True, timeout=300
        )
        if result.returncode != 0:
            raise RuntimeError(f"llama.cpp execution failed: {result.stderr}")
        return result.stdout.strip()
```

---

## V. The Persona Engine: Identity as a First-Class Data Structure

Every prior system I have built has wrestled with the same question: what is an AI persona, exactly? In corporate systems, it is a system prompt — a string of text injected at the top of the context window, ephemeral, invisible, unversioned, unauditable. You accept it as a default and interact with a character whose values you did not choose.

In SOVEREIGN, a persona is a **typed, versioned, evolvable data structure** with a complete lifecycle. It has traits (numeric weights that shape how the reasoning engine processes queries), expertise domains (which determine routing priority), an activation cost (used by the MoE orchestrator to balance resource allocation), and a performance history (updated by the evaluation loop after every query).

The persona is not the model. The model is a reasoning engine. The persona is a constraint vector applied to that engine. You can have dozens of personas sharing a single model instance. You can swap personas without changing the model. You can evolve a persona's trait weights based on its performance without retraining anything. The separation is total.

```python
# sovereign/reasoning/persona_engine.py

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import os
import uuid


@dataclass
class PersonaTrait:
    name: str
    weight: float       # 0.0 to 1.0
    description: str
    evolution_rate: float = 0.05    # How quickly this trait responds to feedback


@dataclass  
class PersonaPerformance:
    total_queries: int = 0
    total_score: float = 0.0
    last_used: Optional[str] = None
    success_rate: float = 0.0
    domain_scores: Dict[str, float] = field(default_factory=dict)

    @property
    def average_score(self) -> float:
        if self.total_queries == 0:
            return 0.0
        return self.total_score / self.total_queries


@dataclass
class Persona:
    """
    A sovereign persona: fully owned, fully auditable, fully evolvable.
    
    This is not a system prompt. It is a data structure with history,
    with traits that evolve according to rules you define,
    with performance metrics that you evaluate,
    and with a lifecycle that you control.
    """
    id: str
    name: str
    description: str
    traits: Dict[str, PersonaTrait]
    expertise: List[str]
    activation_cost: float = 0.3
    status: str = "experimental"        # experimental → active → stable → pruned
    version: int = 1
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Optional[str] = None
    performance: PersonaPerformance = field(default_factory=PersonaPerformance)
    evolution_log: List[Dict[str, Any]] = field(default_factory=list)
    system_prompt_template: str = ""

    def get_system_prompt(self, context: str = "") -> str:
        """Generate the system prompt from trait weights and context."""
        trait_descriptions = []
        for trait_name, trait in self.traits.items():
            if trait.weight > 0.6:
                trait_descriptions.append(f"strong {trait_name.replace('_', ' ')}")
            elif trait.weight > 0.3:
                trait_descriptions.append(f"moderate {trait_name.replace('_', ' ')}")
        
        trait_string = ", ".join(trait_descriptions) if trait_descriptions else "balanced reasoning"
        return (
            f"You are {self.name}. {self.description} "
            f"Your reasoning is characterized by: {trait_string}. "
            f"Your areas of expertise are: {', '.join(self.expertise)}. "
            f"{self.system_prompt_template} "
            f"{f'Current context: {context}' if context else ''}"
        ).strip()

    def apply_bounded_update(self, feedback_vector: Dict[str, float]) -> Dict[str, Any]:
        """
        Apply the bounded update function: Δw = f(feedback) × (1 − w)
        
        The (1 − w) term ensures convergence — high-weight traits resist
        extreme changes. This prevents runaway specialization.
        Stability is a design feature, not a constraint.
        """
        evolution_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "version": self.version,
            "changes": []
        }
        
        for trait_name, trait in self.traits.items():
            feedback_value = feedback_vector.get(trait_name, 0.0)
            delta = feedback_value * trait.evolution_rate * (1.0 - trait.weight)
            new_weight = max(0.0, min(1.0, trait.weight + delta))
            
            evolution_entry["changes"].append({
                "trait": trait_name,
                "from": trait.weight,
                "to": new_weight,
                "delta": new_weight - trait.weight,
                "feedback": feedback_value
            })
            trait.weight = new_weight
        
        self.version += 1
        self.updated_at = datetime.utcnow().isoformat()
        self.evolution_log.append(evolution_entry)
        return evolution_entry


class PersonaEngine:
    """
    Manages the complete lifecycle of sovereign personas.
    
    Active → Stable → Pruned → Cold Storage → Recalled.
    The lifecycle is yours to govern.
    Nothing is deleted without your explicit instruction.
    Cold storage preserves everything for potential recall.
    """

    LIFECYCLE_STATES = ["experimental", "active", "stable", "pruned"]
    PERSONAS_DIR = "./data/personas"

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.active_personas: Dict[str, Persona] = {}
        self.cold_storage: Dict[str, Persona] = {}
        self.personas_dir = config.get("personas_dir", self.PERSONAS_DIR)
        self._ensure_directory_structure()
        self._load_active_personas()

    def _ensure_directory_structure(self):
        for state in self.LIFECYCLE_STATES:
            os.makedirs(os.path.join(self.personas_dir, state), exist_ok=True)
        os.makedirs(os.path.join(self.personas_dir, "cold_storage"), exist_ok=True)

    def _load_active_personas(self):
        for state in ["experimental", "active", "stable"]:
            state_dir = os.path.join(self.personas_dir, state)
            for fname in os.listdir(state_dir):
                if fname.endswith(".json"):
                    with open(os.path.join(state_dir, fname)) as f:
                        data = json.load(f)
                        persona = self._deserialize_persona(data)
                        self.active_personas[persona.id] = persona

    def route_to_persona(self, query: str, query_domain: str) -> List[Persona]:
        """
        Select the best personas for the current query using multi-factor routing.
        
        Routing considers: domain expertise match, activation cost,
        historical performance in the query domain, and current lifecycle state.
        Only stable and active personas participate in production routing.
        """
        candidates = [
            p for p in self.active_personas.values()
            if p.status in ("active", "stable")
        ]
        
        scored_candidates = []
        for persona in candidates:
            domain_match = 1.0 if query_domain in persona.expertise else 0.3
            historical_score = persona.performance.domain_scores.get(query_domain, 0.5)
            cost_penalty = 1.0 - persona.activation_cost
            composite_score = (
                0.4 * domain_match +
                0.4 * historical_score +
                0.2 * cost_penalty
            )
            scored_candidates.append((persona, composite_score))
        
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        max_parallel = self.config.get("max_parallel_personas", 3)
        return [p for p, _ in scored_candidates[:max_parallel]]

    def prune_persona(self, persona_id: str, reason: str = "performance_threshold") -> bool:
        """
        Retire a persona to cold storage. Not deletion — archival.
        The persona's full history is preserved.
        The reason is logged.
        It can be recalled if context warrants.
        """
        if persona_id not in self.active_personas:
            return False
        
        persona = self.active_personas[persona_id]
        persona.status = "pruned"
        persona.updated_at = datetime.utcnow().isoformat()
        persona.evolution_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "event": "pruned",
            "reason": reason
        })
        
        self.cold_storage[persona_id] = persona
        del self.active_personas[persona_id]
        self._save_persona_to_state(persona, "cold_storage")
        return True

    def recall_persona(self, persona_id: str, query_context: str) -> Optional[Persona]:
        """
        Attempt to recall a pruned persona based on current query context.
        
        The system asks: is this dormant knowledge relevant again?
        If yes, it is restored. If no, it remains dormant.
        The question is explicit. The answer is auditable.
        """
        if persona_id not in self.cold_storage:
            return None
        
        persona = self.cold_storage[persona_id]
        # Compute context relevance by checking domain overlap
        query_terms = set(query_context.lower().split())
        expertise_terms = set(" ".join(persona.expertise).lower().split())
        overlap = len(query_terms & expertise_terms) / max(len(expertise_terms), 1)
        
        recall_threshold = self.config.get("recall_threshold", 0.3)
        if overlap >= recall_threshold:
            persona.status = "active"
            persona.updated_at = datetime.utcnow().isoformat()
            persona.evolution_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "event": "recalled",
                "context_overlap": overlap
            })
            self.active_personas[persona_id] = persona
            del self.cold_storage[persona_id]
            return persona
        return None

    def _deserialize_persona(self, data: Dict[str, Any]) -> Persona:
        traits = {
            k: PersonaTrait(**v) if isinstance(v, dict) else PersonaTrait(
                name=k, weight=float(v), description="", evolution_rate=0.05
            )
            for k, v in data.get("traits", {}).items()
        }
        performance_data = data.get("performance", {})
        performance = PersonaPerformance(
            total_queries=performance_data.get("total_queries", 0),
            total_score=performance_data.get("total_score", 0.0),
            last_used=performance_data.get("last_used"),
            success_rate=performance_data.get("success_rate", 0.0),
            domain_scores=performance_data.get("domain_scores", {})
        )
        return Persona(
            id=data.get("id", str(uuid.uuid4())),
            name=data["name"],
            description=data.get("description", ""),
            traits=traits,
            expertise=data.get("expertise", []),
            activation_cost=data.get("activation_cost", 0.3),
            status=data.get("status", "experimental"),
            version=data.get("version", 1),
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
            performance=performance,
            evolution_log=data.get("evolution_log", []),
            system_prompt_template=data.get("system_prompt_template", "")
        )

    def _save_persona_to_state(self, persona: Persona, state: str):
        filepath = os.path.join(self.personas_dir, state, f"{persona.id}.json")
        with open(filepath, "w") as f:
            json.dump(vars(persona), f, indent=2, default=str)
```

---

## VI. The Governance Layer: The Control Boundary Engine

The Control Boundary Engine is the system's conscience. It runs on every request. It cannot be bypassed. It evaluates intent before execution, scores outputs after generation, and emits a complete audit trail that satisfies enterprise governance requirements including the Colorado AI Act's "Reasonable Care" standard.

In corporate AI, governance is a post-hoc appendage — a feedback button, a content moderation layer, a logging system bolted onto the side of the architecture after the fact. In SOVEREIGN, governance is embedded in the execution path. You cannot get a response without passing through the evaluation loop. You cannot update a persona without logging the change. You cannot prune a knowledge graph node without recording the decision.

This is not compliance theater. It is the architecture of a system that answers to you.

```python
# sovereign/governance/control_boundary.py

from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
import uuid


class IntentCategory(Enum):
    INFORMATIONAL = "informational"
    GENERATIVE = "generative"
    ANALYTICAL = "analytical"
    EXECUTABLE = "executable"         # Triggers higher governance scrutiny
    ADMINISTRATIVE = "administrative" # System modification — maximum scrutiny


class GovernanceDecision(Enum):
    PROCEED = "proceed"
    PROCEED_WITH_LOGGING = "proceed_with_logging"
    REQUIRE_CONFIRMATION = "require_confirmation"
    BLOCK = "block"


@dataclass
class ControlBoundaryResult:
    request_id: str
    intent_category: IntentCategory
    governance_decision: GovernanceDecision
    risk_score: float                   # 0.0 (benign) to 1.0 (high risk)
    justification: str
    audit_record: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    passed: bool = True


@dataclass
class OutputEvaluationResult:
    request_id: str
    grounding_score: float              # How well anchored to source documents
    coherence_score: float              # Internal logical consistency
    coverage_score: float               # Query completeness
    hallucination_penalty: float        # Detected confabulation
    composite_score: float              # Weighted aggregate
    flagged_claims: List[str]           # Claims requiring provenance verification
    audit_record: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class ControlBoundaryEngine:
    """
    The governance conscience of SOVEREIGN.
    
    Every request passes through here before execution.
    Every output passes through here before delivery.
    The audit trail is complete, immutable, and yours.
    
    This is not a security layer. It is an accountability layer.
    The distinction matters: security prevents bad actors.
    Accountability ensures the system answers to you.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.audit_log_path = config.get("audit_log_path", "./logs/audit.jsonl")
        self.risk_thresholds = config.get("risk_thresholds", {
            "block": 0.9,
            "require_confirmation": 0.7,
            "enhanced_logging": 0.4
        })
        self._init_audit_log()

    def _init_audit_log(self):
        import os
        os.makedirs(os.path.dirname(self.audit_log_path), exist_ok=True)

    def evaluate_request(self, query: str, session_id: str,
                         user_context: Dict[str, Any]) -> ControlBoundaryResult:
        """
        Phase 1: Evaluate intent before execution.
        
        The system asks itself: what is this request trying to do?
        Is the intent aligned with the configured governance policy?
        What level of scrutiny does this request warrant?
        """
        request_id = str(uuid.uuid4())
        intent_category = self._classify_intent(query)
        risk_score = self._compute_risk_score(query, intent_category, user_context)
        governance_decision = self._make_governance_decision(risk_score, intent_category)
        
        justification = self._generate_justification(
            intent_category, risk_score, governance_decision
        )
        
        audit_record = {
            "request_id": request_id,
            "session_id": session_id,
            "query_hash": hash(query),      # Hash, not raw query — privacy-preserving audit
            "intent_category": intent_category.value,
            "risk_score": risk_score,
            "governance_decision": governance_decision.value,
            "justification": justification,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self._append_to_audit_log(audit_record)
        
        return ControlBoundaryResult(
            request_id=request_id,
            intent_category=intent_category,
            governance_decision=governance_decision,
            risk_score=risk_score,
            justification=justification,
            audit_record=audit_record,
            passed=(governance_decision != GovernanceDecision.BLOCK)
        )

    def evaluate_output(self, output: str, source_nodes: List[Dict],
                         query: str, request_id: str) -> OutputEvaluationResult:
        """
        Phase 2: Evaluate output before delivery.
        
        The system asks: is this response grounded in evidence?
        Does it make claims that cannot be traced to source documents?
        Is it coherent? Is it complete relative to the query?
        
        This is the architectural answer to hallucination.
        Not a post-hoc filter — an embedded evaluation.
        """
        grounding_score = self._compute_grounding_score(output, source_nodes)
        coherence_score = self._compute_coherence_score(output)
        coverage_score = self._compute_coverage_score(output, query)
        hallucination_penalty = self._detect_hallucinations(output, source_nodes)
        flagged_claims = self._extract_flagged_claims(output, source_nodes)
        
        composite_score = (
            0.35 * grounding_score +
            0.30 * coherence_score +
            0.25 * coverage_score -
            0.10 * hallucination_penalty
        )
        composite_score = max(0.0, min(1.0, composite_score))
        
        audit_record = {
            "request_id": request_id,
            "grounding_score": grounding_score,
            "coherence_score": coherence_score,
            "coverage_score": coverage_score,
            "hallucination_penalty": hallucination_penalty,
            "composite_score": composite_score,
            "flagged_claims_count": len(flagged_claims),
            "timestamp": datetime.utcnow().isoformat()
        }
        self._append_to_audit_log(audit_record)
        
        return OutputEvaluationResult(
            request_id=request_id,
            grounding_score=grounding_score,
            coherence_score=coherence_score,
            coverage_score=coverage_score,
            hallucination_penalty=hallucination_penalty,
            composite_score=composite_score,
            flagged_claims=flagged_claims,
            audit_record=audit_record
        )

    def _classify_intent(self, query: str) -> IntentCategory:
        query_lower = query.lower()
        if any(k in query_lower for k in ["delete", "modify", "update", "configure", "install"]):
            return IntentCategory.ADMINISTRATIVE
        if any(k in query_lower for k in ["execute", "run", "deploy", "create file", "write to"]):
            return IntentCategory.EXECUTABLE
        if any(k in query_lower for k in ["analyze", "compare", "evaluate", "assess"]):
            return IntentCategory.ANALYTICAL
        if any(k in query_lower for k in ["write", "generate", "create", "draft", "produce"]):
            return IntentCategory.GENERATIVE
        return IntentCategory.INFORMATIONAL

    def _compute_risk_score(self, query: str, intent: IntentCategory,
                             context: Dict[str, Any]) -> float:
        base_scores = {
            IntentCategory.INFORMATIONAL: 0.1,
            IntentCategory.GENERATIVE: 0.3,
            IntentCategory.ANALYTICAL: 0.2,
            IntentCategory.EXECUTABLE: 0.6,
            IntentCategory.ADMINISTRATIVE: 0.8
        }
        return base_scores.get(intent, 0.5)

    def _make_governance_decision(self, risk_score: float,
                                   intent: IntentCategory) -> GovernanceDecision:
        if risk_score >= self.risk_thresholds["block"]:
            return GovernanceDecision.BLOCK
        if risk_score >= self.risk_thresholds["require_confirmation"]:
            return GovernanceDecision.REQUIRE_CONFIRMATION
        if risk_score >= self.risk_thresholds["enhanced_logging"]:
            return GovernanceDecision.PROCEED_WITH_LOGGING
        return GovernanceDecision.PROCEED

    def _compute_grounding_score(self, output: str,
                                   source_nodes: List[Dict]) -> float:
        if not source_nodes:
            return 0.0
        source_terms = set()
        for node in source_nodes:
            content = node.get("content", "")
            source_terms.update(content.lower().split())
        output_terms = set(output.lower().split())
        overlap = len(output_terms & source_terms)
        return min(1.0, overlap / max(len(output_terms), 1) * 3.0)

    def _compute_coherence_score(self, output: str) -> float:
        sentences = [s.strip() for s in output.split(".") if s.strip()]
        if len(sentences) < 2:
            return 1.0
        return min(1.0, 0.5 + (len(sentences) / 20.0))

    def _compute_coverage_score(self, output: str, query: str) -> float:
        query_terms = set(query.lower().split())
        output_text = output.lower()
        covered = sum(1 for term in query_terms if term in output_text)
        return covered / max(len(query_terms), 1)

    def _detect_hallucinations(self, output: str,
                                source_nodes: List[Dict]) -> float:
        specific_claims = [
            word for word in output.split()
            if word.replace(",", "").replace(".", "").isdigit()
               or (len(word) > 2 and word[0].isupper())
        ]
        if not specific_claims or not source_nodes:
            return 0.0
        source_content = " ".join(n.get("content", "") for n in source_nodes).lower()
        ungrounded = sum(
            1 for claim in specific_claims
            if claim.lower() not in source_content
        )
        return min(1.0, ungrounded / max(len(specific_claims), 1))

    def _extract_flagged_claims(self, output: str,
                                 source_nodes: List[Dict]) -> List[str]:
        source_content = " ".join(n.get("content", "") for n in source_nodes).lower()
        sentences = [s.strip() for s in output.split(".") if s.strip()]
        flagged = []
        for sentence in sentences:
            key_terms = [w for w in sentence.split() if len(w) > 5]
            if key_terms and not any(t.lower() in source_content for t in key_terms):
                flagged.append(sentence)
        return flagged[:5]  # Return top 5 flagged sentences

    def _generate_justification(self, intent: IntentCategory,
                                  risk_score: float,
                                  decision: GovernanceDecision) -> str:
        return (
            f"Intent classified as {intent.value} with risk score {risk_score:.2f}. "
            f"Governance decision: {decision.value}. "
            f"Threshold configuration: block={self.risk_thresholds['block']}, "
            f"confirm={self.risk_thresholds['require_confirmation']}."
        )

    def _append_to_audit_log(self, record: Dict[str, Any]):
        import json
        with open(self.audit_log_path, "a") as f:
            f.write(json.dumps(record) + "\n")
```

---

## VII. The Orchestration Layer: MoE Routing and Agent Swarms

The MoE orchestrator is the brain of SOVEREIGN's execution path. It receives a query from the API gateway, consults the governance layer for clearance, routes to the persona engine for specialist selection, dispatches parallel persona commentary passes against the knowledge graph, aggregates results through a multi-dimensional evaluation function, and returns a synthesized response with a full execution trace.

This is not a chain. It is a graph. Execution can be parallel, recursive, or branching depending on query complexity and persona routing decisions.

```python
# sovereign/orchestration/moe_orchestrator.py

from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import uuid

from sovereign.reasoning.persona_engine import PersonaEngine, Persona
from sovereign.memory.knowledge_graph import SovereignKnowledgeGraph
from sovereign.memory.vector_store import SovereignVectorStore
from sovereign.inference.local_engine import LocalInferenceEngine
from sovereign.governance.control_boundary import ControlBoundaryEngine, GovernanceDecision


class MoEOrchestrator:
    """
    The Mixture-of-Experts orchestrator for SOVEREIGN.
    
    Routes queries to specialist personas, executes parallel
    commentary passes, aggregates results through multi-dimensional
    evaluation, and returns synthesized responses with full execution traces.
    
    Every execution is reproducible.
    Every routing decision is logged.
    Every persona contribution is attributed.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.persona_engine = PersonaEngine(config.get("persona_config", {}))
        self.knowledge_graph = SovereignKnowledgeGraph(config.get("graph_config", {}))
        self.vector_store = SovereignVectorStore(config.get("vector_config", {}))
        self.inference_engine = LocalInferenceEngine(config.get("inference_config", {}))
        self.governance = ControlBoundaryEngine(config.get("governance_config", {}))

    def execute(self, query: str, session_id: str,
                user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Full orchestration pipeline.
        
        Phase 1: Governance pre-check
        Phase 2: Context retrieval (vector + graph)
        Phase 3: Persona routing
        Phase 4: Parallel persona commentary passes
        Phase 5: Aggregation and synthesis
        Phase 6: Governance post-check
        Phase 7: Persona evolution update
        Phase 8: Return with full execution trace
        """
        execution_trace = {
            "execution_id": str(uuid.uuid4()),
            "query": query,
            "session_id": session_id,
            "started_at": datetime.utcnow().isoformat(),
            "phases": []
        }

        # ── Phase 1: Governance Pre-Check ────────────────────────────────────────
        governance_result = self.governance.evaluate_request(
            query, session_id, user_context or {}
        )
        execution_trace["phases"].append({
            "phase": "governance_precheck",
            "result": governance_result.audit_record
        })
        
        if not governance_result.passed:
            return self._build_blocked_response(query, governance_result, execution_trace)

        # ── Phase 2: Context Retrieval ────────────────────────────────────────────
        vector_results = self.vector_store.query(query, n_results=10)
        query_domain = self._infer_domain(query, vector_results)
        
        # Build query-scoped graph from retrieved documents
        source_node_ids = self._build_query_graph(query, vector_results)
        execution_trace["phases"].append({
            "phase": "context_retrieval",
            "vector_results_count": len(vector_results),
            "graph_nodes_constructed": len(source_node_ids),
            "inferred_domain": query_domain
        })

        # ── Phase 3: Persona Routing ──────────────────────────────────────────────
        activated_personas = self.persona_engine.route_to_persona(query, query_domain)
        execution_trace["phases"].append({
            "phase": "persona_routing",
            "activated_personas": [p.id for p in activated_personas],
            "persona_count": len(activated_personas)
        })

        if not activated_personas:
            return self._build_no_persona_response(query, execution_trace)

        # ── Phase 4: Parallel Persona Commentary ─────────────────────────────────
        persona_results = self._execute_persona_passes(
            query, activated_personas, vector_results, source_node_ids
        )
        execution_trace["phases"].append({
            "phase": "persona_commentary",
            "results_count": len(persona_results)
        })

        # ── Phase 5: Aggregation and Synthesis ───────────────────────────────────
        aggregated_response = self._aggregate_and_synthesize(
            query, persona_results, vector_results
        )
        execution_trace["phases"].append({
            "phase": "aggregation",
            "composite_score": aggregated_response["evaluation_score"],
            "synthesis_length": len(aggregated_response["synthesis"])
        })

        # ── Phase 6: Governance Post-Check ───────────────────────────────────────
        output_evaluation = self.governance.evaluate_output(
            aggregated_response["synthesis"],
            vector_results,
            query,
            governance_result.request_id
        )
        execution_trace["phases"].append({
            "phase": "governance_postcheck",
            "grounding_score": output_evaluation.grounding_score,
            "hallucination_penalty": output_evaluation.hallucination_penalty,
            "flagged_claims_count": len(output_evaluation.flagged_claims)
        })

        # ── Phase 7: Persona Evolution ────────────────────────────────────────────
        self._update_persona_evolution(
            activated_personas, persona_results,
            aggregated_response["evaluation_score"], query_domain
        )

        # ── Phase 8: Prune underperformers ───────────────────────────────────────
        self._run_pruning_cycle()

        execution_trace["completed_at"] = datetime.utcnow().isoformat()
        
        return {
            "response": aggregated_response["synthesis"],
            "evaluation": {
                "composite_score": aggregated_response["evaluation_score"],
                "grounding_score": output_evaluation.grounding_score,
                "coherence_score": output_evaluation.coherence_score,
                "hallucination_penalty": output_evaluation.hallucination_penalty
            },
            "provenance": {
                "source_documents": [r["metadata"].get("source") for r in vector_results[:5]],
                "activated_personas": [p.name for p in activated_personas],
                "flagged_claims": output_evaluation.flagged_claims
            },
            "execution_trace": execution_trace
        }

    def _execute_persona_passes(self, query: str, personas: List[Persona],
                                  vector_results: List[Dict],
                                  source_node_ids: List[str]) -> List[Dict[str, Any]]:
        """Execute parallel persona commentary passes."""
        context = self._format_context_for_inference(vector_results)
        results = []
        
        for persona in personas:
            start_time = datetime.utcnow()
            system_prompt = persona.get_system_prompt(context=query)
            
            inference_prompt = (
                f"Based on the following context, provide your expert analysis:\n\n"
                f"CONTEXT:\n{context}\n\n"
                f"QUERY: {query}\n\n"
                f"Provide a detailed analysis from your perspective as {persona.name}. "
                f"Reference specific information from the context. "
                f"Identify key insights and any limitations in the available information."
            )
            
            try:
                commentary = self.inference_engine.generate(
                    inference_prompt, system_prompt, max_tokens=1500
                )
                latency_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                results.append({
                    "persona_id": persona.id,
                    "persona_name": persona.name,
                    "commentary": commentary,
                    "relevance_score": self._score_relevance(commentary, query),
                    "key_insights": self._extract_key_insights(commentary),
                    "latency_ms": latency_ms,
                    "success": True
                })
            except Exception as e:
                results.append({
                    "persona_id": persona.id,
                    "persona_name": persona.name,
                    "commentary": "",
                    "relevance_score": 0.0,
                    "key_insights": [],
                    "latency_ms": 0,
                    "success": False,
                    "error": str(e)
                })
        
        return results

    def _aggregate_and_synthesize(self, query: str, persona_results: List[Dict],
                                    vector_results: List[Dict]) -> Dict[str, Any]:
        """Synthesize persona commentaries into a unified response."""
        successful_results = [r for r in persona_results if r["success"]]
        
        if not successful_results:
            return {"synthesis": "No successful persona passes completed.", "evaluation_score": 0.0}
        
        synthesis_prompt = (
            "Synthesize the following expert analyses into a single, coherent response. "
            "Preserve the key insights from each perspective. "
            "Resolve contradictions explicitly. "
            "Be precise about what is known versus inferred.\n\n"
        )
        
        for result in successful_results:
            synthesis_prompt += (
                f"### {result['persona_name']} Analysis:\n"
                f"{result['commentary']}\n\n"
            )
        
        synthesis_prompt += f"\nQuery to address: {query}\n\nProvide a unified synthesis:"
        
        synthesis = self.inference_engine.generate(
            synthesis_prompt,
            system_prompt="You are a synthesis engine. Combine multiple expert perspectives into clear, grounded analysis.",
            max_tokens=2000
        )
        
        evaluation_score = self._evaluate_synthesis(
            [r["commentary"] for r in successful_results],
            [insight for r in successful_results for insight in r["key_insights"]],
            query
        )
        
        return {"synthesis": synthesis, "evaluation_score": evaluation_score}

    def _evaluate_synthesis(self, commentaries: List[str],
                              insights: List[str], query: str) -> float:
        if not commentaries:
            return 0.0
        
        coverage = min(1.0, len(insights) / max(len(query.split()), 1) * 2.0)
        
        if len(commentaries) < 2:
            coherence = 1.0
        else:
            all_terms = [set(c.lower().split()) for c in commentaries]
            pairwise_overlaps = []
            for i in range(len(all_terms)):
                for j in range(i + 1, len(all_terms)):
                    union = all_terms[i] | all_terms[j]
                    intersection = all_terms[i] & all_terms[j]
                    pairwise_overlaps.append(len(intersection) / max(len(union), 1))
            coherence = sum(pairwise_overlaps) / max(len(pairwise_overlaps), 1)
        
        query_terms = set(query.lower().split())
        all_output = " ".join(commentaries).lower()
        relevance = sum(1 for t in query_terms if t in all_output) / max(len(query_terms), 1)
        
        return 0.4 * coverage + 0.3 * coherence + 0.3 * relevance

    def _build_query_graph(self, query: str,
                            vector_results: List[Dict]) -> List[str]:
        """Construct a query-scoped knowledge graph from retrieved documents."""
        node_ids = []
        for result in vector_results:
            node = self.knowledge_graph.add_node(
                label="DOCUMENT",
                content=result["content"][:500],
                source_document_id=result["id"],
                confidence=result["relevance_score"]
            )
            node_ids.append(node.id)
        
        # Connect related documents
        for i in range(len(node_ids) - 1):
            self.knowledge_graph.add_edge(
                node_ids[i], node_ids[i + 1],
                relationship="RELATED_TO",
                weight=0.5,
                established_by="query_construction"
            )
        return node_ids

    def _update_persona_evolution(self, personas: List[Persona],
                                   results: List[Dict],
                                   aggregate_score: float, domain: str):
        for persona in personas:
            persona_result = next(
                (r for r in results if r["persona_id"] == persona.id), None
            )
            if not persona_result:
                continue
            
            individual_score = persona_result.get("relevance_score", aggregate_score)
            feedback_vector = {
                trait_name: individual_score
                for trait_name in persona.traits.keys()
            }
            persona.apply_bounded_update(feedback_vector)
            
            persona.performance.total_queries += 1
            persona.performance.total_score += individual_score
            persona.performance.last_used = datetime.utcnow().isoformat()
            persona.performance.domain_scores[domain] = (
                persona.performance.domain_scores.get(domain, 0.5) * 0.8 +
                individual_score * 0.2
            )
            if individual_score >= 0.6:
                persona.performance.success_rate = (
                    persona.performance.success_rate * 0.9 + 0.1
                )

    def _run_pruning_cycle(self):
        """Retire consistently underperforming personas."""
        prune_threshold = self.config.get("prune_threshold", 0.3)
        for persona_id, persona in list(self.persona_engine.active_personas.items()):
            if (persona.performance.total_queries >= 10 and
                    persona.performance.average_score < prune_threshold):
                self.persona_engine.prune_persona(
                    persona_id, reason=f"average_score {persona.performance.average_score:.2f} below threshold {prune_threshold}"
                )

    def _infer_domain(self, query: str, vector_results: List[Dict]) -> str:
        domain_keywords = {
            "code": ["function", "class", "algorithm", "implement", "debug", "code", "python", "typescript"],
            "research": ["analyze", "study", "evidence", "research", "paper", "data", "statistics"],
            "writing": ["write", "draft", "compose", "article", "blog", "narrative", "story"],
            "architecture": ["system", "design", "architecture", "infrastructure", "deploy", "scale"],
            "governance": ["compliance", "policy", "audit", "risk", "regulation", "governance"]
        }
        query_lower = query.lower()
        domain_scores = {}
        for domain, keywords in domain_keywords.items():
            domain_scores[domain] = sum(1 for kw in keywords if kw in query_lower)
        return max(domain_scores, key=domain_scores.get)

    def _format_context_for_inference(self, vector_results: List[Dict]) -> str:
        context_parts = []
        for i, result in enumerate(vector_results[:5]):
            source = result["metadata"].get("source", "unknown")
            content = result["content"][:400]
            score = result["relevance_score"]
            context_parts.append(f"[Source {i+1}: {source} | Relevance: {score:.2f}]\n{content}")
        return "\n\n".join(context_parts)

    def _score_relevance(self, commentary: str, query: str) -> float:
        query_terms = set(query.lower().split())
        commentary_terms = set(commentary.lower().split())
        return len(query_terms & commentary_terms) / max(len(query_terms), 1)

    def _extract_key_insights(self, commentary: str) -> List[str]:
        sentences = [s.strip() for s in commentary.split(".") if len(s.strip()) > 40]
        return sentences[:3]

    def _build_blocked_response(self, query: str, governance_result: Any,
                                  trace: Dict) -> Dict[str, Any]:
        return {
            "response": f"Request blocked by governance layer. Reason: {governance_result.justification}",
            "blocked": True,
            "governance_result": governance_result.audit_record,
            "execution_trace": trace
        }

    def _build_no_persona_response(self, query: str, trace: Dict) -> Dict[str, Any]:
        return {
            "response": "No active personas available for this query domain. Review persona configuration.",
            "no_personas": True,
            "execution_trace": trace
        }
```

---

## VIII. The SpecGen Module: Deterministic Code from Specification

One of the most powerful — and underutilized — components in the system is SpecGen: the deterministic code generation engine that produces production-ready implementations from structured technical specifications.

SpecGen was born from a frustration I could not resolve with vanilla LLM code generation: non-determinism. Given the same specification twice, most code generation systems will produce meaningfully different implementations. The patterns, the naming conventions, the error handling strategies, the test coverage — all of it varies with temperature and token sampling. This is fine for exploration. It is unacceptable for production infrastructure.

SpecGen solves this through three mechanisms: (1) a structured specification format that eliminates ambiguity before generation, (2) RAG-grounded generation that anchors output to your existing codebase patterns, and (3) a fixed-seed inference call that produces deterministic output given the same specification and context.

```python
# sovereign/specgen/spec_generator.py

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import json
import hashlib


@dataclass
class ComponentSpec:
    """
    A fully specified component for deterministic code generation.
    
    Ambiguity in the spec means ambiguity in the output.
    Every field is required because every field shapes the generated code.
    Underspecified components produce underspecified implementations.
    """
    name: str
    component_type: str           # service, model, api_endpoint, utility, test, config
    language: str                 # python, typescript, sql, yaml, bash
    description: str
    inputs: List[Dict[str, str]]  # [{name, type, description, required}]
    outputs: List[Dict[str, str]] # [{name, type, description}]
    dependencies: List[str]       # Other component names this depends on
    constraints: List[str]        # Explicit behavioral constraints
    error_handling: List[str]     # Error cases and handling strategies
    test_scenarios: List[Dict]    # [{name, given, when, then}]
    existing_patterns: List[str]  # Code patterns from codebase to follow
    
    @property
    def spec_hash(self) -> str:
        """Deterministic hash of the specification — same spec = same hash = same code."""
        spec_string = json.dumps(
            {k: v for k, v in vars(self).items() if k != "spec_hash"},
            sort_keys=True
        )
        return hashlib.sha256(spec_string.encode()).hexdigest()[:12]


class SpecGenerator:
    """
    Deterministic code generation from structured specifications.
    
    The key insight: LLM code generation is non-deterministic by default
    because the prompt is underspecified and the sampling is random.
    Remove the underspecification. Fix the seed.
    Now the generation is deterministic.
    
    Your codebase is a corpus. New code should be grounded in existing patterns.
    SpecGen retrieves those patterns before generating.
    The result is code that looks like it was written by the same author
    as the rest of the codebase — because it was trained on the same corpus.
    """

    def __init__(self, config: Dict[str, Any], vector_store, inference_engine):
        self.config = config
        self.vector_store = vector_store
        self.inference_engine = inference_engine
        self.generation_seed = config.get("generation_seed", 42)
        self.spec_cache: Dict[str, str] = {}

    def generate_component(self, spec: ComponentSpec) -> Dict[str, Any]:
        """Generate a complete, production-ready component from specification."""
        
        # Check spec cache — same spec always produces same code
        if spec.spec_hash in self.spec_cache:
            return {
                "code": self.spec_cache[spec.spec_hash],
                "spec_hash": spec.spec_hash,
                "cache_hit": True
            }
        
        # Retrieve existing patterns from the codebase
        pattern_context = self._retrieve_existing_patterns(spec)
        
        # Build deterministic generation prompt
        generation_prompt = self._build_generation_prompt(spec, pattern_context)
        system_prompt = self._build_system_prompt(spec)
        
        # Generate with fixed seed for determinism
        generated_code = self.inference_engine.generate(
            generation_prompt,
            system_prompt=system_prompt,
            temperature=0.0,      # Zero temperature: maximum determinism
            seed=self.generation_seed,
            max_tokens=3000
        )
        
        # Generate tests in a separate pass
        test_code = self._generate_tests(spec, generated_code, pattern_context)
        
        result = {
            "component_name": spec.name,
            "component_type": spec.component_type,
            "language": spec.language,
            "spec_hash": spec.spec_hash,
            "implementation": generated_code,
            "tests": test_code,
            "dependencies": spec.dependencies,
            "cache_hit": False
        }
        
        self.spec_cache[spec.spec_hash] = generated_code
        return result

    def _retrieve_existing_patterns(self, spec: ComponentSpec) -> str:
        """Retrieve relevant code patterns from the existing codebase."""
        search_query = f"{spec.component_type} {spec.language} {' '.join(spec.existing_patterns[:3])}"
        results = self.vector_store.query(
            search_query,
            n_results=5,
            where_filter={"doc_type": "code"}
        )
        if not results:
            return "No existing patterns found in codebase."
        return "\n\n".join([
            f"# Pattern from {r['metadata'].get('source', 'unknown')}:\n{r['content']}"
            for r in results
        ])

    def _build_generation_prompt(self, spec: ComponentSpec, pattern_context: str) -> str:
        return f"""Generate a production-ready {spec.language} {spec.component_type} named {spec.name}.

SPECIFICATION:
- Description: {spec.description}
- Inputs: {json.dumps(spec.inputs, indent=2)}
- Outputs: {json.dumps(spec.outputs, indent=2)}
- Dependencies: {', '.join(spec.dependencies)}
- Constraints: {chr(10).join(f'  - {c}' for c in spec.constraints)}
- Error handling: {chr(10).join(f'  - {e}' for e in spec.error_handling)}

EXISTING CODEBASE PATTERNS TO FOLLOW:
{pattern_context}

Generate ONLY the implementation code. No preamble. No explanation. No markdown fences.
The code must be complete, typed, and production-ready."""

    def _build_system_prompt(self, spec: ComponentSpec) -> str:
        language_instructions = {
            "python": "Use type hints, dataclasses, explicit error handling, and docstrings. Follow PEP 8.",
            "typescript": "Use strict TypeScript with explicit types. No `any`. Prefer interfaces over types for objects.",
            "sql": "Use explicit column names, proper indexes, and transactional safety.",
        }
        return (
            f"You are a senior software engineer generating production {spec.language} code. "
            f"{language_instructions.get(spec.language, '')} "
            f"Output ONLY valid {spec.language} code. No explanations."
        )

    def _generate_tests(self, spec: ComponentSpec, implementation: str,
                         pattern_context: str) -> str:
        test_prompt = f"""Generate comprehensive tests for this {spec.language} {spec.component_type}.

IMPLEMENTATION:
{implementation}

TEST SCENARIOS:
{json.dumps(spec.test_scenarios, indent=2)}

Generate complete test code following the patterns in the codebase.
Cover success cases, edge cases, and each error handling scenario.
Output ONLY test code."""
        return self.inference_engine.generate(
            test_prompt,
            system_prompt=f"Generate complete {spec.language} tests. Output ONLY code.",
            temperature=0.0,
            seed=self.generation_seed,
            max_tokens=2000
        )
```

---

## IX. The API Gateway: FastAPI Backend

```python
# sovereign/api/main.py

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import uuid
import yaml
from sovereign.orchestration.moe_orchestrator import MoEOrchestrator
from sovereign.governance.control_boundary import ControlBoundaryEngine


def load_config(path: str = "./config/sovereign.yaml") -> Dict[str, Any]:
    with open(path) as f:
        return yaml.safe_load(f)


config = load_config()
app = FastAPI(
    title="SOVEREIGN API",
    description="Self-owned local-first AI orchestration. No cloud. No telemetry. Your inference.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get("cors_origins", ["http://localhost:3000"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MoEOrchestrator(config)


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=10000)
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    persona_override: Optional[List[str]] = None
    domain_hint: Optional[str] = None
    stream: bool = False


class DocumentIngestRequest(BaseModel):
    documents: List[Dict[str, Any]]
    collection: Optional[str] = "default"
    extract_entities: bool = True
    build_graph_edges: bool = True


@app.post("/query")
async def query(request: QueryRequest) -> Dict[str, Any]:
    """
    Primary query endpoint. Runs the full 8-phase orchestration pipeline.
    Returns response with evaluation scores, provenance, and execution trace.
    """
    try:
        result = orchestrator.execute(
            query=request.query,
            session_id=request.session_id,
            user_context={"domain_hint": request.domain_hint}
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/query/stream")
async def query_stream(websocket: WebSocket):
    """
    Streaming query endpoint for real-time token delivery.
    Every token comes from local inference.
    """
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        query_text = data.get("query", "")
        session_id = data.get("session_id", str(uuid.uuid4()))
        
        for token in orchestrator.inference_engine.generate_stream(query_text):
            await websocket.send_json({"token": token, "done": False})
        
        await websocket.send_json({"token": "", "done": True})
    except Exception as e:
        await websocket.send_json({"error": str(e), "done": True})
    finally:
        await websocket.close()


@app.post("/documents/ingest")
async def ingest_documents(request: DocumentIngestRequest,
                            background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Ingest documents into the memory substrate (vector store + knowledge graph)."""
    doc_ids = orchestrator.vector_store.embed_and_store(request.documents)
    return {
        "ingested_count": len(doc_ids),
        "document_ids": doc_ids,
        "collection": request.collection
    }


@app.get("/personas")
async def list_personas() -> Dict[str, Any]:
    """List all personas with their current lifecycle state and performance metrics."""
    active = {
        pid: {
            "name": p.name,
            "status": p.status,
            "expertise": p.expertise,
            "average_score": p.performance.average_score,
            "total_queries": p.performance.total_queries,
            "version": p.version
        }
        for pid, p in orchestrator.persona_engine.active_personas.items()
    }
    cold = {
        pid: {"name": p.name, "status": p.status}
        for pid, p in orchestrator.persona_engine.cold_storage.items()
    }
    return {"active": active, "cold_storage": cold}


@app.post("/personas/{persona_id}/recall")
async def recall_persona(persona_id: str, query_context: str) -> Dict[str, Any]:
    """Attempt to recall a pruned persona based on query context."""
    recalled = orchestrator.persona_engine.recall_persona(persona_id, query_context)
    if recalled:
        return {"recalled": True, "persona_name": recalled.name, "persona_id": recalled.id}
    return {"recalled": False, "reason": "Context relevance below recall threshold"}


@app.get("/audit/log")
async def get_audit_log(limit: int = 50) -> Dict[str, Any]:
    """Return the most recent audit log entries."""
    import json
    entries = []
    try:
        with open(config.get("governance_config", {}).get("audit_log_path", "./logs/audit.jsonl")) as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
    except FileNotFoundError:
        entries = []
    return {"entries": entries[-limit:], "total_count": len(entries)}


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "sovereign",
        "inference_mode": config.get("inference_config", {}).get("execution_mode", "ollama"),
        "cloud_dependency": False,
        "telemetry": False
    }
```

---

## X. Complete Project Scaffolding

This is the directory structure for a coding agent to construct from scratch. Every file listed is necessary. Every directory serves a specific architectural purpose.

```
sovereign/
├── README.md
├── pyproject.toml
├── docker-compose.yml
├── Makefile
│
├── config/
│   ├── sovereign.yaml          # Master configuration
│   ├── personas/               # Persona definition templates
│   │   ├── analytical.json
│   │   ├── creative.json
│   │   ├── technical.json
│   │   ├── critical.json
│   │   └── generalist.json
│   └── model_registry.yaml     # Local model routing table
│
├── sovereign/                  # Core Python package
│   ├── __init__.py
│   │
│   ├── inference/
│   │   ├── __init__.py
│   │   └── local_engine.py     # Ollama + llama.cpp unified interface
│   │
│   ├── memory/
│   │   ├── __init__.py
│   │   ├── knowledge_graph.py  # Dual-substrate KG (Neo4j + NetworkX)
│   │   ├── vector_store.py     # ChromaDB/Qdrant local vector store
│   │   └── document_loader.py  # PDF, Markdown, HTML, JSON loaders
│   │
│   ├── reasoning/
│   │   ├── __init__.py
│   │   ├── persona_engine.py   # Persona lifecycle + bounded evolution
│   │   └── domain_classifier.py
│   │
│   ├── orchestration/
│   │   ├── __init__.py
│   │   ├── moe_orchestrator.py # 8-phase query execution pipeline
│   │   └── agent_swarm.py      # Multi-agent parallel execution
│   │
│   ├── governance/
│   │   ├── __init__.py
│   │   ├── control_boundary.py # Intent evaluation + output scoring
│   │   └── audit_exporter.py   # Export audit trail to CSV/JSON
│   │
│   ├── specgen/
│   │   ├── __init__.py
│   │   ├── spec_generator.py   # Deterministic code generation
│   │   └── spec_validator.py   # Validate spec completeness before generation
│   │
│   └── api/
│       ├── __init__.py
│       ├── main.py             # FastAPI application
│       ├── middleware.py       # Request logging, auth
│       └── models.py           # Pydantic request/response models
│
├── frontend/                   # Next.js 14 interface
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main chat interface
│   │   ├── globals.css
│   │   │
│   │   ├── chat/
│   │   │   └── page.tsx        # Conversational query UI
│   │   ├── personas/
│   │   │   └── page.tsx        # Persona management dashboard
│   │   ├── knowledge/
│   │   │   └── page.tsx        # Knowledge graph visualization
│   │   ├── audit/
│   │   │   └── page.tsx        # Audit log viewer
│   │   └── specgen/
│   │       └── page.tsx        # SpecGen UI: spec input → code output
│   │
│   └── components/
│       ├── ChatInterface.tsx
│       ├── PersonaCard.tsx
│       ├── GraphViewer.tsx     # D3.js or Cytoscape knowledge graph viz
│       ├── AuditLog.tsx
│       ├── EvaluationScore.tsx
│       ├── ProvenancePanel.tsx
│       └── SpecForm.tsx
│
├── data/
│   ├── personas/
│   │   ├── experimental/
│   │   ├── active/
│   │   ├── stable/
│   │   ├── pruned/
│   │   └── cold_storage/
│   ├── chromadb/               # Local vector store persistence
│   ├── graph_snapshots/        # Exported knowledge graph states
│   └── documents/              # Source document repository
│
├── logs/
│   ├── audit.jsonl             # Governance audit trail (append-only)
│   ├── execution_traces/       # Per-query execution traces
│   └── persona_evolution/      # Persona lifecycle change logs
│
├── scripts/
│   ├── setup.sh                # One-command environment setup
│   ├── ingest_documents.py     # Batch document ingestion
│   ├── create_persona.py       # Interactive persona creation wizard
│   ├── export_audit.py         # Audit trail export utility
│   ├── run_specgen.py          # SpecGen CLI
│   └── graph_snapshot.py       # Export knowledge graph state
│
└── tests/
    ├── unit/
    │   ├── test_knowledge_graph.py
    │   ├── test_persona_engine.py
    │   ├── test_control_boundary.py
    │   ├── test_local_engine.py
    │   └── test_spec_generator.py
    ├── integration/
    │   ├── test_orchestration_pipeline.py
    │   └── test_api_endpoints.py
    └── fixtures/
        ├── sample_personas.json
        ├── sample_documents/
        └── sample_specs.json
```

---

## XI. Configuration: The Master Manifest

```yaml
# config/sovereign.yaml
# Every value here is yours to set. Nothing is a default you cannot override.
# Read this file as a declaration of your own system's values.

sovereign:
  version: "1.0.0"
  environment: "development"   # development | production | air_gap

inference_config:
  execution_mode: "ollama"     # ollama | llama_cpp | hybrid
  ollama_endpoint: "http://localhost:11434"
  default_model: "llama3.2"
  seed: 42                     # Reproducibility: same seed = same output
  temperature: 0.1             # Low temperature: precision over creativity
  max_tokens: 2000
  model_registry:
    routing:
      code: "qwen2.5-coder:7b"
      research: "llama3.2"
      writing: "mistral:7b"
      architecture: "llama3.2"
      governance: "llama3.2"
    paths: {}                  # For llama_cpp mode: model file paths

graph_config:
  neo4j_uri: "bolt://localhost:7687"
  neo4j_user: "neo4j"
  neo4j_password: "sovereign"  # Change this before production
  decay_factor: 0.95           # Temporal decay per session
  prune_confidence_threshold: 0.1

vector_config:
  persist_directory: "./data/chromadb"
  collection_name: "sovereign_documents"
  embedding_model: "nomic-embed-text"

persona_config:
  personas_dir: "./data/personas"
  max_parallel_personas: 3
  prune_threshold: 0.3
  recall_threshold: 0.3
  evolution_rate: 0.05         # How quickly persona traits respond to feedback
  min_queries_before_prune: 10

governance_config:
  audit_log_path: "./logs/audit.jsonl"
  risk_thresholds:
    block: 0.9
    require_confirmation: 0.7
    enhanced_logging: 0.4
  reasonable_care_mode: true   # Colorado AI Act alignment

specgen_config:
  generation_seed: 42
  temperature: 0.0             # Zero temperature: maximum determinism
  cache_generated_specs: true

api_config:
  host: "0.0.0.0"
  port: 8000
  cors_origins:
    - "http://localhost:3000"

frontend_config:
  api_base_url: "http://localhost:8000"
  websocket_url: "ws://localhost:8000/query/stream"
  graph_visualization: "cytoscape"  # d3 | cytoscape
```

---

## XII. Bootstrap: From Zero to Sovereign in Ten Commands

```bash
# 1. Clone and enter
git clone https://github.com/kliewerdaniel/sovereign.git
cd sovereign

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install spaCy language model (for entity extraction in governance layer)
python -m spacy download en_core_web_sm

# 4. Start Ollama and pull your primary model
ollama serve &
ollama pull llama3.2
ollama pull nomic-embed-text   # For local embeddings

# 5. Start Neo4j (optional: skip for pure in-memory graph)
docker run -d \
  --name sovereign-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/sovereign \
  neo4j:latest

# 6. Create directory structure
python scripts/setup.sh

# 7. Ingest your first documents
python scripts/ingest_documents.py --source ./data/documents/

# 8. Start the API backend
uvicorn sovereign.api.main:app --reload --port 8000

# 9. Start the frontend
cd frontend && npm install && npm run dev

# 10. Open your sovereign AI at http://localhost:3000
# No API keys. No cloud. No telemetry.
# Your hardware. Your inference. Your memory.
echo "SOVEREIGN is running. You own this."
```

---

## XIII. The Knowledge Graph of the Blog — Why This Project Is the Synthesis

Every post I have written on this blog is a node in a knowledge graph. Every project I have built is an edge between concepts. SOVEREIGN is the traversal of that graph from end to end — the path that passes through every significant node and resolves the relationships between them.

```
[local inference] ──ENABLES──▶ [data sovereignty]
[data sovereignty] ──REQUIRES──▶ [audit trails]
[audit trails] ──REQUIRES──▶ [control boundary]
[control boundary] ──GOVERNS──▶ [MoE orchestration]
[MoE orchestration] ──ROUTES_TO──▶ [persona engine]
[persona engine] ──QUERIES──▶ [knowledge graph]
[knowledge graph] ──GROUNDS──▶ [RAG retrieval]
[RAG retrieval] ──FEEDS──▶ [SpecGen]
[SpecGen] ──GENERATES──▶ [new sovereign components]
[new sovereign components] ──EXPAND──▶ [knowledge graph]
                                              ▲
                                              └── (the loop closes)
```

This is not a coincidence of architecture. It is the point. A sovereign AI system should be able to reason about its own architecture. The knowledge graph should contain documentation of the system itself. SpecGen should be able to generate new components for the system from its own specifications. The orchestrator should be able to route queries about how to improve the orchestrator.

The system is self-referential by design. Not self-modifying — you remain the author of every change. But self-aware in the sense that every component can be queried, explained, and improved using the system itself.

**That is what sovereignty means at full depth.** Not just that your data stays local. Not just that your inference is on-prem. But that the system you use to think can be used to improve the way you think, and the improvement remains yours.

---

## XIV. What This Is Not

SOVEREIGN is not:

- A replacement for the best frontier models. GPT-5 and Claude and Gemini outperform every local model on raw capability benchmarks. If capability on cloud hardware with their data on their telemetry is the only thing you care about, this architecture is not for you.

- A finished product. It is an architecture. A blueprint. A starting point. The personas you define will shape it. The documents you ingest will train its memory. The governance thresholds you configure will determine its behavior. The code this post generates is scaffolding, not a ceiling.

- A political statement against any particular company. It is a structural argument: systems designed to extract from you produce different architecture than systems designed to serve you. Both exist. The choice between them is yours to make.

What this is: the most complete expression of everything I understand about building AI systems that answer to the person running them. Every module in this codebase is the distillation of a problem I could not stop thinking about until I had an implementation that solved it.

Build it. Modify it. Extend it. Publish your modifications. The graph grows in every direction from here.

---

## Closing: The Architecture Is the Argument

The code in this post is an argument.

The bounded update function `Δw = f(feedback) × (1 − w)` is an argument that stability matters — that a system should resist extremes, not optimize toward them.

The query-scoped knowledge graph is an argument that memory should be deliberate — that accumulation without discernment is not intelligence, it is noise.

The governance layer in the execution path is an argument that accountability cannot be post-hoc — that a system which can only be evaluated after the fact cannot be meaningfully controlled.

The local inference requirement is an argument that the execution path should belong to the person executing — that cognitive infrastructure has an owner, and that owner should be you.

Every design choice in SOVEREIGN is downstream of one question: who is this system for?

I built it for myself. And then I wrote it down so you could build it for yourself too.

That is what sovereignty means in practice: not the absence of dependency on everything, but the deliberate choice of which dependencies you accept and which you refuse. The cloud can keep the telemetry. You keep the mind.

---

## Appendix A: Python Dependencies

```toml
# pyproject.toml
[project]
name = "sovereign"
version = "1.0.0"
description = "Self-owned local-first AI orchestration system"
requires-python = ">=3.11"

dependencies = [
    # Core
    "fastapi>=0.110.0",
    "uvicorn[standard]>=0.29.0",
    "pydantic>=2.6.0",
    "pyyaml>=6.0",
    
    # Inference
    "requests>=2.31.0",
    
    # Memory
    "chromadb>=0.4.24",
    "networkx>=3.2",
    "neo4j>=5.18.0",
    
    # Document processing
    "pypdf>=4.1.0",
    "python-docx>=1.1.0",
    "markdown>=3.6",
    
    # NLP / Entity extraction
    "spacy>=3.7.4",
    
    # Utilities
    "python-multipart>=0.0.9",
    "aiofiles>=23.2.1",
    "websockets>=12.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.1.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.27.0",
    "black>=24.3.0",
    "ruff>=0.3.0",
    "mypy>=1.9.0",
]
```

## Appendix B: Docker Compose

```yaml
# docker-compose.yml
# Complete local stack. No external services. No internet required after initial pull.

version: "3.9"

services:
  sovereign-api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config
    environment:
      - OLLAMA_ENDPOINT=http://ollama:11434
      - NEO4J_URI=bolt://neo4j:7687
    depends_on:
      - ollama
      - neo4j
    networks:
      - sovereign-network

  sovereign-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    networks:
      - sovereign-network

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - sovereign-network

  neo4j:
    image: neo4j:5
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/sovereign
    volumes:
      - neo4j-data:/data
    networks:
      - sovereign-network

volumes:
  ollama-models:
  neo4j-data:

networks:
  sovereign-network:
    driver: bridge
```

---

*SOVEREIGN is the synthesis of every system documented on this blog. Every component described here has a prior post that goes deeper on its individual design. The knowledge graph of danielkliewer.com is the context this post assumes you already carry. If you arrived here without that context, the blog is the prerequisite.*

*Repository: [github.com/kliewerdaniel/sovereign](https://github.com/kliewerdaniel/sovereign)*

*Series: [Sovereignty Manifesto](https://danielkliewer.com/blog/2026-03-28-sovereignty-manifesto) · [Architecture as Autonomy](https://danielkliewer.com/blog/2026-03-28-architecture-as-autonomy) · [Architecture of Autonomy](https://danielkliewer.com/blog/2026-03-29-architecture-of-autonomy) · [Private Knowledge Graph](https://danielkliewer.com/blog/2026-03-17-building-a-private-knowledge-graph-with-local-ai-agents) · [DeerFlow 2.0](https://danielkliewer.com/blog/2026-03-26-deerflow-2-building-sovereign-ai-agent-systems) · [OpenClaw Guide](https://danielkliewer.com/blog/2026-03-10-breaking-free-from-chatgpt) · **SOVEREIGN — This Post***
