---
book_reference: true
categories:
- Vibe Coding
- Context Engineering
date: 2025-10-19 01:42:44 -0500
description: A vibe coding session exploring the creation of a local LLM-powered personal
  knowledge graph system using Next.js, FastAPI, and NetworkX.
layout: post
tags:
- Vibe Coding
- LLM
- Knowledge Graph
- Local AI
- Next.js
- FastAPI
title: Vibe Coding Session Building a Local LLM-Powered Knowledge Graph
wiki_references: ["docker", "embeddings", "knowledge-graphs", "llama3", "local-first-ai", "local-inference", "mcp", "ollama", "prompt-engineering", "python", "rag", "rlhf", "sentence-transformers", "transformers", "typescript"]
---

![Image](/images/1019001.png)


## Brainstorming


Today I'm starting my vibe coding session with a full-on vibe for the brainstorming prompt below. I keep it fairly vague so that I can get a feel for what kind of things it will come up with. I'm going to try to keep it local and I'm building a graph. Let's see what today brings!


```
what are some vibe coding projects which are related to LLMs about building a graph, I want to build a graph, I want to vibe code, I want a blog post to be created about the whole thing, but I am going to write the blog post, what I want from you are ideas on what to build and the technologies used and then I want you to formulate several options with the technologies listed and allow me to choose one. One requirement is that I want everything to be local, the databases and inference are all done locally
```

<br>

That prompt gave me a list of five ideas. I chose one that I liked and chatGPT even gave me some options which I gave in the following prompt along with the following:

<br>

```
Now I want in .md form a full description, architecture and everything else needed to know in order to fill the context for the generation of the prompt I am going to give to CLIne, so I want full output from you, you are not creating a prompt for CLIne but you are just writing in .md form the full description of every aspect you can fit into your context.
```

<br>

That outputted a document I went on to edit and include which is very long so I made it collapsable here:

<br>

<details>
	<summary>Click to expand the full document</summary>

## Mind Map AI — Full Project Specification

**Project:** Mind Map AI — LLM-powered Personal Knowledge Graph (All Local)
**Target:** Local-only stack (Next.js frontend, FastAPI backend, local LLM, SQLite, NetworkX graph).
**Purpose:** Convert notes/journals/markdown into a browsable, queryable, and editable knowledge graph; provide semantic search and visualization; all inference and storage stays local.

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [User Stories & Flows](#2-user-stories--flows)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Technology Choices (Rationale)](#4-technology-choices-rationale)
5. [Data Models & Storage Design](#5-data-models--storage-design)
6. [LLM Strategy (Local Inference + Embeddings)](#6-llm-strategy)
7. [API Design (FastAPI)](#7-api-design)
8. [Frontend (Next.js)](#8-frontend)
9. [Graph Processing & Transformation Logic](#9-graph-processing--transformation-logic)
10. [Visualization Approach](#10-visualization-approach)
11. [File Structure & Example Files](#11-file-structure--example-files)
12. [Deployment / Local Dev Setup](#12-deployment--local-dev-setup)
13. [Testing & Validation Strategy](#13-testing--validation-strategy)
14. [Security & Privacy Considerations](#14-security--privacy-considerations)
15. [Performance & Scaling Notes](#15-performance--scaling-notes)
16. [Example Prompts & Extraction Templates](#16-example-prompts--extraction-templates)
17. [CLIne Handoff Notes](#17-cline-handoff-notes)
18. [Stretch Goals / Extensions](#18-stretch-goals--extensions)

---

## 1. Overview & Goals

**What it does:**
- Accepts local markdown/text notes (or pasted text)
- Uses a locally-hosted LLM to extract entities, concepts, relationships, and sentiment
- Stores raw notes in SQLite, embeddings in a local vector store, and graph relationships in a NetworkX graph persisted to disk
- Exposes an API for ingestion, querying, and editing
- Frontend (Next.js) provides an interactive visualization and editor for nodes/edges and a semantic search UI

**Constraints:**
- Everything local: inference, DB, vector store, UI served locally
- Offline-capable development workflow where possible
- Auditable transformations — every extraction stores source text and provenance

**Primary users:**
- You (the developer / blogger) building and experimenting; audience for blog: fellow vibe coders

---

## 2. User Stories & Flows

**User Stories:**
- As a user, I want to drop a folder of markdown into the app and have a graph generated automatically
- As a user, I want to click on a node and see the source passages and the LLM's extraction/provenance
- As a user, I want to semantically search my notes and get graph nodes as results
- As a user, I want to edit nodes/edges manually and commit changes
- As a user, I want exports: GraphML, GEXF, PNG snapshots

**Typical Flow:**
1. Drop or upload notes/folder or paste text
2. Backend reads files, extracts metadata, runs LLM extraction and embeddings
3. Save raw text to SQLite, embeddings to local vector store (Chroma or local Faiss), create/append nodes & edges to NetworkX graph
4. Frontend queries backend for graph and renders interactive visualization
5. User inspects nodes, opens provenance panel with source text and extracted labels
6. User edits a node/edge → backend updates NetworkX & SQLite
7. User exports or runs graph analytics (connected components, centrality)

---

## 3. High-Level Architecture

```
[ Next.js (frontend) ] <---> [ FastAPI (backend) ] <---> [Local LLM runtime (Ollama/Llama)]
                                   |-- SQLite (raw notes + metadata)
                                   |-- Vector DB (local Chroma / Faiss) (embeddings)
                                   |-- NetworkX (graph persisted as .gpickle / GraphML)
```

**Components:**
- **Frontend:** Next.js app (React). Interactive graph (react-cytoscapejs), note editor, search UI
- **Backend:** FastAPI for ingestion, graph management, search endpoints, admin endpoints
- **LLM runtime:** Ollama, Llama.cpp, or Dockerized local model backend (whichever you prefer). Used for extraction and for optional reasoning queries
- **Embeddings:** local sentence-transformer model (e.g., all-MiniLM or similar) or Ollama embedding endpoint (local)
- **Graph persistence:** NetworkX memory representation persisted to .gpickle / GraphML files, backed up in SQLite for quick metadata queries

---

## 4. Technology Choices (Rationale)

- **Next.js:** you're familiar with it; great for building modern UIs, server-side rendering for initial page load; can run entirely locally with `next dev` or `next start`
- **FastAPI:** lightweight, async, great for building REST APIs; easy to integrate with Python graph code and LLM libraries
- **NetworkX:** excellent for in-memory graph algorithms and flexible node/edge attributes; easy persistence to gpickle or GraphML
- **SQLite:** simple, file-based database for raw text and provenance; ACID, portable
- **Local LLM (Ollama / Llama):** keeps inference local. Ollama provides an easy local server experience; alternatives: llama.cpp or locally run Mistral/Gemma via supported runtimes
- **Embeddings:** local sentence-transformers or Ollama embeddings. Useful for fast semantic search
- **Vector DB:** lightweight local Chroma or Faiss if you want faster vector search than scanning SQLite
- **Visualization:** Cytoscape (via react-cytoscapejs) — good UX for graph exploration

---

## 5. Data Models & Storage Design

**SQLite Schema (Simplified):**

```sql
-- notes table: raw source markdown / text
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_path TEXT,     -- original path on disk if uploaded
  hash TEXT,            -- content hash for dedup
  processed BOOLEAN DEFAULT 0
);

-- extracts table: store entity extracts & provenance
CREATE TABLE extracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER REFERENCES notes(id),
  extractor_model TEXT,
  extract_json TEXT,        -- store raw JSON output from LLM (entities, relationships)
  score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- metadata table (optional)
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

**NetworkX Graph Model:**
- **Node attributes:**
  - `id` (unique string; e.g., node:UUID or entity:<normalized_text>)
  - `label` (display name)
  - `type` (concept, person, place, idea, event, passage)
  - `provenance` (list of (note_id, span_start, span_end) tuples)
  - `embedding` (optional: vector; not stored directly in NetworkX but in vector DB with node id)
  - `created_at`, `updated_at`

- **Edge attributes:**
  - `type` (related_to, causes, elaborates, contradicts, similar_to, part_of)
  - `weight` (confidence score)
  - `extraction_id` (id in extracts table)
  - `provenance` (source spans)

**Persistence:**
- Save NetworkX to disk: `nx.write_gpickle(G, 'graph.gpickle')` or `nx.readwrite.gexf.write_gexf(G, path)` for export

---

## 6. LLM Strategy (Local Inference + Embeddings)

**Roles for LLM:**
1. **Extraction** — Given a text block, extract:
   - Entities (nouns, named entities)
   - Concepts (abstract ideas)
   - Relationships between entities/concepts with relation types and confidence
   - Short summaries for nodes or passages
   - Sentiment or metadata tags (mood, importance)

2. **Normalization** — Normalize entity names (e.g., "AI", "artificial intelligence" → canonical node)

3. **Reasoning / Querying** — Answer user questions by walking the graph and using the LLM to generate synthesis from node contents

4. **Rewrite / Summarize** — Generate node summaries for UI display

**Extraction Prompt Pattern:**
- Provide short instructions to extract JSON with a strict schema
- Include examples
- Ask model to return only JSON (machine-readable)

**Example Expected JSON:**

```json
{
  "nodes": [
    {"label": "sleep", "type": "concept", "span": [120, 170], "confidence": 0.95},
    {"label": "work", "type": "activity", "span": [0, 15], "confidence": 0.9}
  ],
  "edges": [
    {"source": "sleep", "target": "work", "type": "affects", "confidence": 0.87}
  ],
  "summary": "This passage mentions that sleep affects work energy..."
}
```

**Embeddings:**
- Use a local sentence-transformer model to embed each note and node label for semantic search
- Store vectors in local Chroma/Faiss, keyed by node id or note id

---

## 7. API Design (FastAPI)

**Core Endpoints:**

- `POST /api/ingest/file` — upload a file or zip of markdown files
- `POST /api/ingest/text` — post a text block for processing
- `GET /api/notes` — list notes
- `GET /api/notes/{id}` — get single note + extracts
- `POST /api/graph/build` — force rebuild graph from extracts
- `GET /api/graph` — get full graph or paginated
- `GET /api/graph/node/{id}` — get node details + provenance
- `POST /api/graph/node` — add/edit node
- `POST /api/graph/edge` — add/edit edge
- `POST /api/search/semantic` — body: `{"q": "...", "top_k": 10}`
- `GET /api/export/graph` — returns GraphML / GEXF / gpickle
- `POST /api/query/llm` — run a custom LLM prompt (local) — gated

**Example Ingestion Workflow:**
1. `POST /api/ingest/text` with `{"filename": "morning.md", "content": "I slept poorly..."}`
2. Backend saves to notes, returns note_id
3. Backend calls `extractor.process_note(note_id)` which:
   - runs LLM extraction
   - writes extracts row
   - updates NetworkX nodes & edges
   - indexes embeddings
4. Frontend polls `GET /api/notes/{id}` to check processed flag and show results

---

## 8. Frontend (Next.js)

**Pages:**
- `/` — Dashboard / quick summary and recent notes
- `/graph` — Full-screen interactive graph viewer
- `/note/[id]` — Note viewer + extraction provenance + edit controls
- `/search` — Semantic search interface
- `/settings` — LLM settings, model selection, embedding model, import/export

**Key Components:**
- `GraphCanvas` — react-cytoscapejs wrapper with pan/zoom, node click handlers
- `NodeDetailsPanel` — shows node metadata, provenance passages, edit buttons
- `NoteUploader` — drag & drop or folder selection
- `SemanticSearchBox` — search input with results mapped to nodes/notes
- `ModelControl` — choose local LLM / embeddings model, configure params

**UX Interactions:**
- Double-click node → open NodeDetailsPanel with source passages highlighted
- Right-click node → context menu: merge nodes, export node, delete node
- Lasso select → group operations
- Inline edit → on save, PATCH to `/api/graph/node`

---

## 9. Graph Processing & Transformation Logic

**Extraction Pipeline (per note):**
1. Read note content and optionally split into passages (by paragraphs or sliding window)
2. For each passage:
   - Send to LLM extraction prompt (strict JSON output)
   - Receive nodes & edges list, normalize labels
   - Assign node IDs based on normalization (e.g., slugify + checksum)
3. Merge nodes:
   - If normalized label already exists, merge provenance and update attributes (increment counts, update last_seen)
4. Create/Update edges:
   - Attach extraction_id and confidence
5. Store extracts and update `notes.processed = TRUE`
6. Index embeddings for note and nodes

**Normalization Heuristics:**
- Lowercase normalization + stopword stripping for short labels
- Use model to provide canonical name suggestion and disambiguation (LLM can propose canonical forms; store as canonical_label)
- Keep alias list on node attributes

**Conflict Resolution:**
- Keep original extraction raw store
- On conflicting edges (contradictory relations), create contradiction edge type or attach contradiction attribute with evidence list

---

## 10. Visualization Approach

**Recommendation:** Use react-cytoscapejs or cytoscape with cose or cola layout.

**Key Visual Cues:**
- Node color by type (concept, person, event)
- Node size by centrality (degree or eigenvector centrality)
- Edge thickness by weight (confidence)
- Hover tooltip shows top 1-2 provenance excerpts
- Click to open panel with full provenance + raw extract JSON + ability to edit

**Performance:**
- For large graphs, implement lazy loading and clustering. Only render subgraph around selected node by default (e.g., BFS to depth 2)
- Provide client-side search that requests filtered nodes from backend

---

## 11. File Structure & Example Files

```
mindmap-ai/
├─ backend/
│  ├─ app/
│  │  ├─ main.py                # FastAPI app
│  │  ├─ api/
│  │  │  ├─ ingest.py
│  │  │  ├─ graph.py
│  │  │  ├─ search.py
│  │  ├─ services/
│  │  │  ├─ extractor.py       # LLM extraction logic
│  │  │  ├─ embeddings.py
│  │  │  ├─ graph_store.py     # NetworkX wrapper + persistence
│  │  ├─ db/
│  │  │  ├─ schema.sql
│  │  │  ├─ db.py              # sqlite connection functions
│  ├─ requirements.txt
│  ├─ Dockerfile
├─ frontend/
│  ├─ package.json
│  ├─ next.config.js
│  ├─ src/
│  │  ├─ pages/
│  │  │  ├─ index.js
│  │  │  ├─ graph.js
│  │  │  ├─ note/[id].js
│  │  ├─ components/
│  │  │  ├─ GraphCanvas.jsx
│  │  │  ├─ NodePanel.jsx
│  │  │  ├─ SearchBox.jsx
│  ├─ Dockerfile
├─ models/                       # local LLM or pointers to models
├─ data/
│  ├─ notes/                     # sample markdown files
│  ├─ graph.gpickle
│  ├─ vectors/                    # vector DB files (Chroma/Faiss)
└─ README.md
```

---

## 12. Deployment / Local Dev Setup

**Development Steps (Summary):**
1. Install Python 3.10+ and Node 18+
2. **Backend:**
   - `cd backend`
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - Setup SQLite DB: run `app/db/schema.sql`
   - Configure local LLM endpoint in `app/config.py` (e.g., `http://localhost:11434` for Ollama)
   - `uvicorn app.main:app --reload --port 8000`
3. **Frontend:**
   - `cd frontend`
   - `npm install`
   - `npm run dev` (by default `http://localhost:3000`)
4. **LLM:**
   - Start Ollama or other local LLM runtime with the chosen model
5. Try `/api/ingest/text` via Postman or frontend uploader

**Docker (Optional):**
- Provide docker-compose with three services:
  - frontend (Next.js)
  - backend (FastAPI)
  - local LLM runtime (if using a docker-friendly image)
  - Volume mount `./data` and `./models`

---

## 13. Testing & Validation Strategy

**Unit Tests:**
- Test SQLite insert/read operations
- Test NetworkX persistence and loading
- Test `extractor.parse_output` function with sample JSON outputs (simulate LLM)

**Integration Tests:**
- Ingest sample markdown → run extraction → assert nodes count, edge count stable
- Semantic search correctness: query fixture questions and check expected node returns

**Manual QA:**
- Use a small set of notes with known relationships and ensure extraction and normalization produce expected outputs

---

## 14. Security & Privacy Considerations

- Everything local — no remote calls unless explicitly configured (e.g., to an optional cloud LLM). Default config should disable external network
- Raw notes stored in SQLite; consider encrypting the DB for extra privacy (e.g., using filesystem-level encryption or libs)
- LLM sandboxing: if using containerized LLM, ensure it's not exposed outside localhost
- Sanitize inputs to prevent injection-like threats into the backend shell or file system

---

## 15. Performance & Scaling Notes

- For many notes (thousands), NetworkX in-memory may become heavy. Strategies:
  - Shard graph by topic or file
  - Use persistent graph DB (Neo4j) as an upgrade path
  - Vector search: Faiss or Chroma with on-disk indexes recommended for large corpora
  - Batch extractions: process notes in parallel but throttle LLM calls to avoid resource exhaustion

---

## 16. Example Prompts & Extraction Templates

**Strict JSON Extractor Prompt (Short):**

```
System: You are a JSON extractor. Receive a short passage and return a JSON with nodes, edges, and summary. Return only valid JSON, nothing else. Use the schema below.

{
  "nodes": [{"label":..., "type":..., "span":[start,end], "confidence":float}],
  "edges": [{"source": "label_or_id", "target":"label_or_id", "type":"affects|relates_to|contradicts", "confidence":float}],
  "summary":"one-sentence summary"
}
```

**Example Instruction Body for Model:**

```
Passage:
"""
I haven't been sleeping well, which makes my work energy low and irritability higher. I want to improve exercise and sleep routine.
"""

Return JSON following schema: nodes: detect "sleep", "work energy", "irritability", "exercise", their types (concept/activity), edges such as sleep -> work energy (affects), include span character indexes and confidence scores between 0 and 1.
```

**Normalization Prompt (if using LLM to canonicalize):**
- Provide candidate aliases and ask model to choose canonical label and provide justification

---

## 17. CLIne Handoff Notes

**What to give CLIne later:**
- The full project README (this document)
- Preferred languages: Python (FastAPI), JS/TS (Next.js)
- Test data: a small `data/notes/` folder with 4–6 markdown files exhibiting overlapping concepts (to validate dedup and merging)
- Specify "All local" requirement and that LLM MUST be local; provide model preference (e.g., llama-3 via Ollama)
- Ask for:
  - Implementation of the API endpoints described
  - Basic Next.js frontend with GraphCanvas & NodePanel
  - A minimal extraction prompt (as provided) and an extractor harness that can be swapped for different LLM endpoints easily
  - Provide acceptance tests:
    - Ingest sample notes and produce at least N nodes and M edges (numbers based on sample)
    - Export GraphML and confirm at least one node with provenance exists

---

## 18. Stretch Goals / Extensions

- Graph analytics dashboard: centrality, communities (Louvain), timeline of nodes by created_at
- Versioning & diffs: maintain history of node edits and allow rollback
- Local fine-tuning: fine-tune an LLM locally on your own notes for improved extraction
- Sync to Obsidian or local vault: keep files in sync
- Biometric integration: pair node tags with daily metrics (sleep HR from device) — for the journaling use case
- Export to Neo4j for larger-scale graph storage or use as a migration path

---

## Appendix — Sample Code Snippets

**FastAPI Ingestion Skeleton (Illustrative):**

```python
# backend/app/api/ingest.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.extractor import process_text
from ..db.db import insert_note

router = APIRouter()

class IngestRequest(BaseModel):
    filename: str
    content: str

@router.post("/text")
async def ingest_text(payload: IngestRequest):
    note_id = insert_note(payload.filename, payload.content)
    # process in background or synchronous depending on config:
    result = process_text(note_id, payload.content)  # calls LLM
    return {"note_id": note_id, "result": result}
```

**NetworkX Persistence Example:**

```python
import networkx as nx
G = nx.Graph()
G.add_node("sleep", type="concept", label="sleep")
G.add_node("work", type="activity", label="work energy")
G.add_edge("sleep", "work", type="affects", weight=0.95)
nx.write_gpickle(G, "data/graph.gpickle")
# load:
G2 = nx.read_gpickle("data/graph.gpickle")
```

**Example LLM Call (Pseudo):**

```python
def call_local_llm(prompt: str) -> dict:
    # Example using requests to an Ollama-like local endpoint
    import requests
    r = requests.post("http://localhost:11434/api/text", json={"prompt": prompt})
    return r.json()
```

---

## Final Notes 

- This project is perfect for vibe-coding: incremental wins (drop a note → see a node), clear visuals (graph grows as you feed it), and deep future-proofing (persisted graph + raw extracts)
- Keep everything auditable — that'll make your blog narrative strong: "I fed my journal to a local LLM and watched my mind's topology appear"
- Start small: one FastAPI endpoint + one Next.js page with a small sample Markdown folder. Graduate to background processing and better UI after you confirm extraction quality

---
</details>

<br>

Now I am going to open a new folder in VSCode and start a new project. In the root I am creating a file called spec.md and I am going to paste the above into it.


<br>

![Image](/images/1019010.png)

<br>

## Generating the CLIne Prompt


<br>

The following prompt I am going to create will generate a master CLIne builder prompt which will establish the full rules and workflow for the project.

I guess this is part of "context engineering" basically just picking and choosing, editing and drafting the documents that outline what you want to vibe code.

<br>

```
I want you to generate the CLIne builder prompt in markdown, I want to save it to the root and be able to reference it so that I can list many iterative prompts which will be executed in sequence to complete the project, I want all the prompts to be fully formed to be able to be given to CLIne individually for each incremental improvement. I want deliverables, thresholds for completion in the prompts. I want each prompt to have a checkbox that is checked when completed as well as instructions to create a set of files to keep track of everything. These files include a checklist.md which includes each and every series of instructions which need to be followed in order to complete the application. I want .md files generated to aid in the project. I first want the documentation to be created for the application which will include vast and detailed documentation of the API, the functions, architecture, technologies, security, CI/CD, devops, deployment, testing, design as well as each and every other department within a tech company you can think of. I want all of these documents to be referenced in each and every CLIne prompt so that they are able to keep track, edit and adapt the application based on changes to these documents, the documents themselves will help aid in observability and help the model keep track of changes and needed improvements.
```

<br>

The purpose of this prompt is to build a basic workflow structure that CLIne can follow along and modify according to the project specs.

I once created a template repo for something similar to this ages ago in my Vibe Coding career which was helpful [here](https://github.com/kliewerdaniel/workflow.git)

But now I create the same set of documents in this method we are doing today as I described in the previous prompt.

The previous prompt generated the below output. I save it to the root folder along with the specs as cline_master_prompt.md

<br>

```
# CLINE_MASTER_PROMPT.md

# Mind Map AI — CLIne Master Builder Prompt

---

## 1. Project Overview

**Project Name:** Mind Map AI  
**Purpose:** Build a fully local, LLM-powered personal knowledge graph system that ingests text or markdown notes, extracts entities, relationships, and concepts, stores them in a NetworkX graph with SQLite for provenance, and provides an interactive Next.js frontend for exploration and editing.  

**Core Goals:**
- Entirely local: LLM inference, database, and graph processing are all on-device.
- Incremental iterative development via CLIne prompts.
- Maintain comprehensive documentation that guides development and adapts with project changes.
- Track every step, task, and deliverable in a `checklist.md` for observability and iterative progress.

---

## 2. Technologies & Architecture

**Frontend:** Next.js (React), react-cytoscapejs for graph visualization  
**Backend:** FastAPI (Python)  
**Graph Processing:** NetworkX, persisted with `.gpickle` / GraphML  
**Database:** SQLite for raw text, metadata, and provenance  
**LLM:** Local model (Ollama, LLaMA, or similar)  
**Vector Embeddings:** Local sentence-transformers or Chroma/Faiss  
**Visualization:** Cytoscape.js via React wrapper  
**Optional DevOps Tools:** Docker for local containers, Git for version control  

**High-Level Architecture Diagram:**

[ Next.js Frontend ] <—> [ FastAPI Backend ] <—> [Local LLM Runtime]
|– SQLite (notes + extracts)
|– NetworkX Graph (.gpickle / GraphML)
|– Vector DB (local Chroma/Faiss embeddings)

---

## 3. Documentation Framework

All documentation should be generated by CLIne initially and updated incrementally as the project evolves. Documentation must live in `/docs/`.

**Files to generate:**
- `architecture.md` — diagrams, system overview, folder structure
- `api-spec.md` — REST endpoint descriptions, request/response formats
- `database.md` — SQLite schema, table definitions
- `llm_prompting.md` — prompt schemas, extraction JSON format
- `security.md` — authentication, API security, local privacy
- `cicd_devops.md` — Docker setups, local dev environment, CI/CD notes
- `testing.md` — unit, integration, end-to-end testing guidelines
- `design_system.md` — UI/UX rules, graph visualization patterns
- `roadmap.md` — planned features, incremental goals
- `decisions.md` — track architectural and implementation choices
- `changelog.md` — versioned project changes

**Documentation Rules:**
- Every CLIne prompt must reference `/docs/` files.
- Changes to the system (API, DB, frontend) must be reflected in the corresponding documentation.
- Documentation must include sample JSON, diagrams, code snippets, and usage instructions.
- CLIne must create `.md` files even with placeholders for sections not yet implemented.

---

## 4. Checklist System (`checklist.md`)

CLIne must maintain a master checklist that includes **all tasks, deliverables, thresholds, and progress**.  

**Checklist Format Example:**
```markdown
# Mind Map AI Checklist

## Prompt 1: Initialize Repository & Documentation
- [ ] Create folder structure (`/frontend`, `/backend`, `/docs`, `/data`, `/tests`)
- [ ] Generate initial documentation templates in `/docs/`
- [ ] Initialize `checklist.md` with this entry
- [ ] Commit initial repo structure

Rules for CLIne:
	•	Append each prompt and its tasks to checklist.md.
	•	Update checkboxes [ ] → [x] when tasks are complete.
	•	Reference documentation in each prompt to stay consistent with system changes.
	•	Include deliverables and completion thresholds in each prompt.

⸻

5. CLIne Workflow Rules
	1.	Documentation-First: CLIne must create and maintain /docs/ files before or alongside implementation.
	2.	Incremental Prompts: Each CLIne prompt must be fully executable on its own, without assumptions of external context, but referencing /docs/.
	3.	Deliverables & Thresholds: Each prompt must specify output files, expected behavior, and conditions for marking completion.
	4.	Observability: CLIne must log all actions, decisions, and modifications into decisions.md and changelog.md.
	5.	Version Control: CLIne must maintain clear commit points per prompt.
	6.	Local-Only Constraint: No remote LLM calls unless explicitly configured; default operation is fully offline.

⸻

6. Incremental CLIne Prompts

✅ Prompt 1 — Initialize Repository & Documentation

Objective: Set up project structure, create documentation templates, initialize checklist.md.

Tasks:
	•	Create /frontend, /backend, /docs, /data, /tests.
	•	Generate documentation placeholders:
	•	/docs/architecture.md
	•	/docs/api-spec.md
	•	/docs/database.md
	•	/docs/llm_prompting.md
	•	/docs/security.md
	•	/docs/cicd_devops.md
	•	/docs/testing.md
	•	/docs/design_system.md
	•	/docs/roadmap.md
	•	/docs/decisions.md
	•	/docs/changelog.md
	•	Initialize checklist.md and add this prompt as entry.
	•	Commit initial structure to Git.

Deliverables:
	•	Directory structure as above.
	•	Placeholder .md files in /docs/.
	•	Initialized checklist.md.

Completion Threshold:
	•	All directories and placeholder docs exist.
	•	Checklist entry added.
	•	CLIne logs creation in decisions.md.

⸻

✅ Prompt 2 — Backend Setup & SQLite Schema

Objective: Initialize FastAPI backend and SQLite database with schema.

Tasks:
	•	Create /backend/app/main.py with FastAPI instance.
	•	Define /backend/app/db/schema.sql with notes, extracts, metadata tables.
	•	Implement DB connection module (/backend/app/db/db.py).
	•	Add initial requirements.txt for Python dependencies.
	•	Add tasks to checklist.md referencing backend initialization.

Deliverables:
	•	FastAPI project skeleton.
	•	SQLite schema created.
	•	DB connection module functional.

Completion Threshold:
	•	FastAPI server runs locally without errors.
	•	SQLite database can be created and queried.
	•	Checklist entry updated [x] when complete.

⸻

✅ Prompt 3 — NetworkX Graph Setup & Persistence

Objective: Implement in-memory graph using NetworkX and persistence to disk.

Tasks:
	•	Create /backend/app/services/graph_store.py managing NetworkX graph.
	•	Implement node and edge creation, update, deletion.
	•	Persist graph to .gpickle and GraphML.
	•	Include sample load and save scripts.
	•	Document graph storage in /docs/database.md and /docs/architecture.md.

Deliverables:
	•	Fully functional NetworkX graph module.
	•	Sample persistence files.

Completion Threshold:
	•	Graph can be saved and reloaded.
	•	Checklist entry updated.

⸻

✅ Prompt 4 — LLM Extraction Module

Objective: Implement local LLM integration for extracting nodes and edges from text.

Tasks:
	•	Create /backend/app/services/extractor.py.
	•	Implement function to call local LLM with structured JSON output.
	•	Handle canonicalization of node labels.
	•	Write unit tests to validate extraction.
	•	Document JSON schema in /docs/llm_prompting.md.

Deliverables:
	•	Extractor module functional.
	•	Test cases for extraction correctness.

Completion Threshold:
	•	Given sample text, LLM produces valid JSON nodes/edges.
	•	Checklist updated.

⸻

✅ Prompt 5 — Embeddings & Vector Store

Objective: Add embeddings and semantic search.

Tasks:
	•	Generate embeddings for notes and nodes using local sentence-transformer.
	•	Store vectors in local Chroma or Faiss DB.
	•	Implement semantic search API endpoint (/api/search/semantic).
	•	Update /docs/architecture.md with vector store design.

Deliverables:
	•	Embedding module functional.
	•	Search API endpoint returns top-k results.

Completion Threshold:
	•	Test queries return expected nodes.
	•	Checklist updated.

⸻

✅ Prompt 6 — Frontend Graph Visualization

Objective: Implement Next.js frontend for graph exploration.

Tasks:
	•	Create /frontend/src/pages/graph.js.
	•	Implement GraphCanvas component using react-cytoscapejs.
	•	Node click opens details panel.
	•	Sync frontend with backend API.
	•	Document UI design in /docs/design_system.md.

Deliverables:
	•	Interactive graph visualization.
	•	Node panel shows provenance and metadata.

Completion Threshold:
	•	Graph renders sample NetworkX data.
	•	Node interactions functional.
	•	Checklist updated.

⸻

✅ Prompt 7 — Note Ingestion UI

Objective: Allow users to upload markdown/text notes.

Tasks:
	•	Implement /frontend/src/components/NoteUploader.jsx.
	•	Connect uploader to backend /api/ingest/text.
	•	Validate uploads and display ingestion progress.
	•	Document in /docs/design_system.md.

Deliverables:
	•	Upload UI functional.
	•	Successful ingestion updates graph.

Completion Threshold:
	•	Upload sample notes → nodes/edges appear in graph.
	•	Checklist updated.

⸻

✅ Prompt 8 — API Security & Local Privacy

Objective: Ensure API and local data are secure.

Tasks:
	•	Add input validation for API endpoints.
	•	Implement authentication if multi-user mode.
	•	Ensure database files and embeddings are only accessible locally.
	•	Document security measures in /docs/security.md.

Deliverables:
	•	API endpoints protected.
	•	Local-only constraints enforced.

Completion Threshold:
	•	No unauthorized access possible.
	•	Checklist updated.

⸻

✅ Prompt 9 — Testing Infrastructure

Objective: Add unit, integration, and end-to-end testing.

Tasks:
	•	Implement /tests/backend/test_db.py, /test_extractor.py, /test_graph.py.
	•	Frontend tests for key components.
	•	Integrate pytest or similar.
	•	Document testing strategy in /docs/testing.md.

Deliverables:
	•	Tests pass locally.
	•	Checklist updated.

Completion Threshold:
	•	90% of core backend functions covered.
	•	Checklist updated.

⸻

✅ Prompt 10 — CI/CD & DevOps

Objective: Prepare local CI/CD workflow and devops scripts.

Tasks:
	•	Add Dockerfiles for frontend and backend.
	•	Add docker-compose.yml for local stack.
	•	Document setup in /docs/cicd_devops.md.
	•	Include instructions for starting full local environment.

Deliverables:
	•	Working Docker Compose environment.
	•	CI/CD documentation complete.

Completion Threshold:
	•	Entire stack runs locally with one command.
	•	Checklist updated.

⸻

7. Rules for All Future CLIne Prompts
	•	Reference documentation /docs/ before making changes.
	•	Update checklist.md and decisions.md with every change.
	•	Provide clear deliverables and completion thresholds.
	•	Use incremental, isolated prompts for every new feature or fix.
	•	Maintain full local-only operation.
	•	Always generate `.md files for any new modules or updates.  
	-	Each prompt must include `[ ]` checkboxes for each task and mark `[x]` when complete.  
	-	CLIne must never overwrite existing files without backup or logging changes in `decisions.md`.  
	-	Each prompt should assume the previous prompts have executed successfully and the checklist is up-to-date.  

---

## 8. Folder Structure Reference

/frontend
/src
/pages
/components
next.config.js
/backend
/app
main.py
/db
db.py
schema.sql
/services
graph_store.py
extractor.py
/api
endpoints.py
/data
/graphs
/embeddings
/docs
architecture.md
api-spec.md
database.md
llm_prompting.md
security.md
cicd_devops.md
testing.md
design_system.md
roadmap.md
decisions.md
changelog.md
/tests
backend
test_db.py
test_extractor.py
test_graph.py
frontend
test_graph_ui.jsx
checklist.md
CLINE_MASTER_PROMPT.md

---

## 9. Deliverables Summary

- **`CLINE_MASTER_PROMPT.md`** – master instructions for CLIne.  
- **`/docs/`** – full documentation suite.  
- **`/backend/app`** – backend FastAPI + NetworkX + LLM modules.  
- **`/frontend/src`** – Next.js frontend with graph visualization and note ingestion UI.  
- **`checklist.md`** – iterative task tracker with checkboxes, deliverables, and thresholds.  
- **`/data`** – persistent storage for SQLite, NetworkX graphs, and embeddings.  
- **`/tests`** – unit, integration, and end-to-end tests.  
- **Docker & DevOps files** – enable local reproducible environment.

---

## 10. Observability & Iterative Improvements

- **Decisions & Rationale**: `decisions.md` tracks architectural decisions and their justification.  
- **Changelog**: `changelog.md` records versioned updates with date, author, and impact.  
- **Checklist Updates**: Every CLIne prompt must update `checklist.md` with tasks completed.  
- **Documentation Syncing**: CLIne must reference `/docs/` in every prompt to ensure consistency and update any affected sections.  
- **Error Handling & Logging**: Backend modules should log all errors to `/data/logs.log` and notify via console during local execution.

---

## 11. Incremental Development Philosophy

1. **Documentation First** – Define architecture, API, DB schema, and LLM JSON formats before implementation.  
2. **Local-Only** – All processing, embeddings, and inference must remain on-device.  
3. **Modular Prompts** – Each CLIne prompt addresses a single subsystem or feature.  
4. **Observability** – All tasks, decisions, and changes must be logged in `/docs/` or `checklist.md`.  
5. **Checkpoints** – Deliverables and success thresholds must be explicitly stated for every task.

---

## 12. Example Future Prompts

- **Prompt 11** – Interactive Graph Editing: Add node/edge create, edit, delete in frontend and backend.  
- **Prompt 12** – Semantic Search Enhancements: Advanced query filters, similarity scoring, and result ranking.  
- **Prompt 13** – Graph Export/Import: Support JSON, CSV, and GraphML for interoperability.  
- **Prompt 14** – UI Enhancements: Dark mode, node coloring, and cluster visualization.  
- **Prompt 15** – Multi-user Mode: Local authentication and personal graph spaces (optional).  
- **Prompt 16** – Advanced LLM Prompt Optimization: Modular prompt chaining and improved extraction accuracy.  
- **Prompt 17** – Backup & Recovery: Automated local graph and DB backup routines.  
- **Prompt 18** – Metrics & Observability Dashboard: Visualize ingestion rates, graph growth, extraction success.  
- **Prompt 19** – Local Plugin System: Allow CLIne to extend modules via local plugin scripts.  
- **Prompt 20** – Full Test Suite Integration: Coverage reports, CI scripts, and automated testing for all modules.

---

## 13. Notes for CLIne Execution

- Each prompt is **self-contained but sequentially aware**.  
- All tasks require clear **deliverables** and a **success threshold**.  
- CLIne must maintain **full observability** through `/docs/`, `checklist.md`, and `decisions.md`.  
- Every prompt update should result in updated Markdown documentation reflecting the current system state.  
- Prompts should **encourage modular, local-first development** to ensure reproducibility and offline operation.

---

## 14. CLIne Execution Log
```

<br>

Ok, so I can tell that that is a flawed prompt. It is partially my fault. I need to refine it. You can see at the end of this how I messed it up in the full brainstorm chat for this [here](https://chatgpt.com/share/68f4c565-b764-8006-b78b-d5d563b2d1b6/)

So how should I do that? I think what I am going to do is use NotebookLM for this next part. I am first going to compile as much documentation as I can give to it. The purpose of this is to help construct the key documents for our vibe coding session. Feeding the right context to CLIne is what will make the difference between working and not.

One reason to create the spec.md file first is that often you can get away from your initial intentions so it is best to get as much detail down before going any further in the brainstorming session.

As you saw the context window for the model was eaten up by all the mistakes I made before the final prompt was generated and you see how it abberated from the inital spec. So I am going to use NotebookLM to help me write some more documentation to feed CLIne before we start vibe coding. So I can just entere a simple prompt after I have the two loaded like the following:

<br>

```
I want the prompts in cline_master_prompt.md to be rewritten according to the information in spec.md
```

<br>

So from that I got the below output which I am saving as prompt_add.md and putting in the root.

<br>

```
### Mind Map AI — CLIne Master Builder Prompt

--------------------------------------------------------------------------------

#### 1. Project Overview
**Project Name:** Mind Map AI — LLM-powered Personal Knowledge Graph (All Local)
**Purpose:** Build a fully local system designed to **convert notes/journals/markdown into a browsable, queryable, and editable knowledge graph**. The system must ingest text or markdown notes, use a local LLM to extract entities, concepts, relationships, and sentiment, store them, and provide an interactive Next.js frontend for visualization and editing.

**Core Goals:**
*   **Entirely local:** LLM inference, database (SQLite), vector store, and graph processing must all operate on-device and remain local.
*   **Auditable transformations:** Every extraction must store source text and provenance.
*   **Support Semantic Search:** Implement semantic search capability for notes and nodes using local vector embeddings.
*   **Interactive Editing:** Allow users to edit nodes/edges manually and commit changes.
*   Incremental iterative development via CLIne prompts.
*   Maintain comprehensive documentation that guides development and adapts with project changes.
*   Track every step, task, and deliverable in a `checklist.md` for observability and iterative progress.

**Constraints:**
*   The system must be offline-capable where possible.
*   The LLM extraction must utilize a **strict JSON schema** defined in `llm_prompting.md`.



--------------------------------------------------------------------------------

#### 2. Technologies & Architecture
The architecture is defined as an all-local stack.

**Frontend:** Next.js (React), utilizing `react-cytoscapejs` for graph visualization.
**Backend:** FastAPI (Python), serving ingestion, graph management, search, and admin endpoints.
**Graph Processing:** NetworkX, representing the graph in memory.
**Graph Persistence:** NetworkX persisted to `.gpickle` or `GraphML` files on disk.
**Database:** SQLite for raw text, metadata, and provenance (source text/note data).
**LLM:** Local model (Ollama, Llama.cpp, or similar Dockerized local model backend).
**Vector Embeddings:** Local `sentence-transformers` model (e.g., all-MiniLM) or Ollama embedding endpoint.
**Vector DB:** Lightweight local Chroma or Faiss is recommended for storing vectors, keyed by node ID or note ID.

**High-Level Architecture Diagram (Detailed):**
[ Next.js Frontend ] <—> [ FastAPI Backend (Python logic, NetworkX) ] <—> [Local LLM Runtime (Ollama/Llama)]
|– SQLite (raw notes + extracts/provenance)
|– NetworkX Graph (.gpickle / GraphML)
|– Vector DB (local Chroma/Faiss embeddings, indexed by node/note ID)



--------------------------------------------------------------------------------

#### 3. Documentation Framework
All documentation should be generated by CLIne initially and updated incrementally as the project evolves. Documentation must live in `/docs/`.

**Files to generate and required content enhancements:**

*   **`architecture.md`**: Diagrams, system overview, folder structure, and rationale for technology choices (Next.js, FastAPI, NetworkX, SQLite, Local LLM).
*   **`api-spec.md`**: Detailed REST endpoint descriptions, request/response formats. Must define and specify the **Core Endpoints** including `/api/ingest/file`, `/api/ingest/text`, `/api/graph`, `/api/search/semantic`, and the mutation endpoints for nodes/edges.
*   **`database.md`**: SQLite schema, table definitions, and the detailed **NetworkX Graph Model** (Node attributes: `id`, `label`, `type`, `provenance`, `embedding`, `created_at`; Edge attributes: `type`, `weight`, `extraction_id`, `provenance`).
*   **`llm_prompting.md`**: Prompt schemas, including the **Extraction Prompt Pattern** (strict JSON output with examples) and the four primary **Roles for LLM** (Extraction, Normalization, Reasoning/Querying, Rewrite/Summarize).
*   **`cicd_devops.md`**: Local Dev Setup, including environment dependencies (Python 3.10+, Node 18+), setup steps for backend (venv, requirements, SQLite schema), frontend (npm install/dev), and configuration for the local LLM endpoint (e.g., Ollama at `http://localhost:11434`).
*   **`testing.md`**: Unit, integration, and end-to-end testing guidelines, covering tests for NetworkX persistence, SQLite operations, and the **Integration Test** flow (Ingest sample markdown → run extraction → assert nodes/edges count).
*   **`security.md`**: Authentication, API security, and confirmation that the default configuration disables external network calls and that raw notes are stored locally in SQLite.
*   **`design_system.md`**: UI/UX rules, including graph visualization patterns (Node color by type, Node size by centrality, Edge thickness by confidence), and key UX interactions (Double-click for provenance, Inline editing).
*   **`roadmap.md` / `decisions.md` / `changelog.md`**: Standard project tracking documentation.

**Documentation Rules:**
*   Every CLIne prompt must reference `/docs/` files.
*   Changes to the system must be reflected in the corresponding documentation.
*   Documentation must include sample JSON (for LLM output), diagrams, code snippets, and usage instructions.
*   CLIne must create `.md` files even with placeholders for sections not yet implemented.



--------------------------------------------------------------------------------

#### 4. Checklist System (checklist.md)

CLIne must maintain a master checklist that includes **all tasks, deliverables, thresholds, and progress**.

---
### DETAILED CRITICAL CHECKLIST TASKS

The project progress must be tracked against the following phases: 0. Setup & Documentation, 1. Core API & Ingestion, 2. Extraction & Persistence, 3. Frontend & Visualization, and 4. Testing & Validation.

#### Phase 0: Setup & Documentation
| Task ID | Description | Deliverable / Threshold | Source |
| :--- | :--- | :--- | :--- |
| 0.1 | **Local Environment Setup** | Install Python 3.10+ and Node 18+. Create Python backend venv and install dependencies (`requirements.txt`). | |
| 0.2 | **LLM Configuration** | Configure local LLM endpoint in `app/config.py`, specifying the LLM server (e.g., Ollama at `http://localhost:11434`). | |
| 0.3 | **Documentation Initialization** | Generate initial versions of all 11 required documentation files in `/docs/`, including `architecture.md`, `api-spec.md`, and `llm_prompting.md`. | |
| 0.4 | **Database Schema Setup** | Run `app/db/schema.sql` to initialize the SQLite database structure for raw notes, extracts, and metadata. | |
| 0.5 | **Embeddings Setup** | Configure the backend to load the local sentence-transformer model (e.g., all-MiniLM) or configure the Ollama embedding endpoint. | |

#### Phase 1: Core API & Ingestion
| Task ID | Description | Deliverable / Threshold | Source |
| :--- | :--- | :--- | :--- |
| 1.1 | **Ingestion Endpoint (Text)** | Implement `POST /api/ingest/text` to accept content, save it to the SQLite notes table, and initiate the asynchronous processing workflow. | |
| 1.2 | **Ingestion Endpoint (File)** | Implement `POST /api/ingest/file` to handle file uploads (single file or zip of markdown files). | |
| 1.3 | **Graph Retrieval API** | Implement `GET /api/graph` (returns full graph or paginated results) and `GET /api/graph/node/{id}` (returns node details and provenance). | |
| 1.4 | **Graph Export API** | Implement `GET /api/export/graph` to return the NetworkX graph persisted as GraphML, GEXF, or gpickle. | |
| 1.5 | **Semantic Search API** | Implement `POST /api/search/semantic` which accepts a query `{"q": "..."}` and returns ranked nodes/notes based on local vector embeddings. | |
| 1.6 | **Mutation Endpoints** | Implement `POST /api/graph/node` and `POST /api/graph/edge` to allow manual editing and committing changes to the NetworkX graph and updating corresponding SQLite entries. | |

#### Phase 2: Extraction & Persistence
| Task ID | Description | Deliverable / Threshold | Source |
| :--- | :--- | :--- | :--- |
| 2.1 | **LLM Extraction Harness** | Create the minimal extractor component that sends text to the local LLM runtime and strictly enforces the **JSON output schema** defined in `llm_prompting.md`. | |
| 2.2 | **Core Ingestion Workflow** | Implement the full sequence within the backend: LLM extraction, writing extraction results to SQLite, updating/merging nodes/edges in NetworkX, and indexing vectors. | |
| 2.3 | **Node Merging Logic** | Implement the logic to assign unique node IDs (based on normalization) and merge nodes that represent the same entity, ensuring the `provenance` list is updated correctly. | |
| 2.4 | **Graph Persistence** | Implement periodic saving of the NetworkX graph using `nx.write_gpickle` to ensure state persistence across application restarts. | |
| 2.5 | **Provenance Tracking** | Ensure every extracted node stores the full provenance (source text spans, `note_id`). | |

#### Phase 3: Frontend & Visualization
| Task ID | Description | Deliverable / Threshold | Source |
| :--- | :--- | :--- | :--- |
| 3.1 | **Frontend Setup** | Initialize the Next.js application, including the basic required pages: `/graph`, `/note/[id]`, `/search`, and `/settings`. | |
| 3.2 | **GraphCanvas Component** | Create the `GraphCanvas` component using `react-cytoscapejs` that fetches graph data from `GET /api/graph` and implements basic pan/zoom functionality. | |
| 3.3 | **Visualization Cues** | Apply initial visualization rules: Node color by type (`concept`, `person`), Node size by centrality, and Edge thickness by confidence score (weight). | |
| 3.4 | **Node Details Panel** | Implement the `NodeDetailsPanel` component that displays node metadata, lists provenance passages, and provides edit buttons when a node is clicked. | |
| 3.5 | **Provenance Interaction** | Implement the key UX interaction: Double-click a node to open the `NodeDetailsPanel` showing source passages. | |

#### Phase 4: Testing & Validation
| Task ID | Description | Deliverable / Threshold | Source |
| :--- | :--- | :--- | :--- |
| 4.1 | **Unit Test Suite** | Implement Unit Tests for NetworkX loading/persistence and SQLite read/write operations. | |
| 4.2 | **Integration Test 1 (Ingestion)** | **Acceptance Test:** Ingest the provided sample notes folder (`data/notes/`) via `/api/ingest/file`. Assert that the process completes and the resulting NetworkX graph contains non-zero nodes (N) and edges (M). | |
| 4.3 | **Integration Test 2 (Export)** | **Acceptance Test:** Implement and run `GET /api/export/graph`. Confirm the exported GraphML/gpickle file contains at least one node with a populated `provenance` attribute. | |
| 4.4 | **Security Check** | Verify that the default configuration disables external network calls, ensuring the system remains entirely local. | |

This continuation details the essential technical specifications for the Mind Map AI project, focusing on data models, LLM requirements, core endpoints, and visualization specifications, as required by `spec.md`.

--------------------------------------------------------------------------------

#### 5. Data Models & Storage Design

The system utilizes SQLite for raw source text and metadata, and NetworkX for the graph structure. Persistence must use `nx.write_gpickle` or `nx.readwrite.gexf.write_gexf`.

##### 5.1. NetworkX Graph Model

The NetworkX graph must rigidly follow these attribute definitions:

**Node Attributes:**
*   **id:** Unique string (e.g., `node:UUID` or `entity:<normalized_text>`).
*   **label:** The display name.
*   **type:** Categorization (e.g., `concept`, `person`, `place`, `idea`, `event`, `passage`).
*   **provenance:** A list of tuples referencing source data: `(note_id, span_start, span_end)`.
*   **embedding:** (Optional, reference to Vector DB) The vector, though the vector itself is usually stored in the local Vector DB and keyed by node id.
*   **created\_at, updated\_at**.
*   **alias list:** Should be kept on node attributes to aid normalization and merging.

**Edge Attributes:**
*   **type:** Relationship category (e.g., `related_to`, `causes`, `elaborates`, `contradicts`, `similar_to`, `part_of`).
*   **weight:** Confidence score of the extraction.
*   **extraction\_id:** ID referencing the entry in the SQLite extracts table.
*   **provenance:** Source spans.

##### 5.2. Normalization Heuristics
The backend must implement logic to normalize entity names to ensure that different mentions (e.g., "AI," "artificial intelligence") map to a single canonical node. This process should utilize the LLM to propose canonical forms and disambiguation. When merging nodes, the `provenance` list must be correctly updated.

--------------------------------------------------------------------------------

#### 6. LLM Strategy & Extraction Pipeline

The entire LLM strategy must utilize a local model (Ollama, LLaMA, or similar).

##### 6.1. Roles for LLM
The local LLM will serve four primary roles:
1.  **Extraction:** Extracting Entities, Concepts, Relationships (with relation types and confidence), Short summaries, and Sentiment/metadata tags from input text.
2.  **Normalization:** Normalizing entity names (e.g., choosing a canonical label).
3.  **Reasoning / Querying:** Answering user questions by synthesizing information from the graph.
4.  **Rewrite / Summarize:** Generating display-ready summaries for nodes.

##### 6.2. Extraction Prompt Pattern
The extraction process must utilize a **strict JSON schema**. The prompt must include short instructions, examples, and explicitly ask the model to return *only* machine-readable JSON.

##### 6.3. Embeddings
A local `sentence-transformer` model (e.g., all-MiniLM) or an Ollama embedding endpoint must be used to embed each note and node label for semantic search functionality. These vectors must be stored in a lightweight local vector store (Chroma or Faiss).

--------------------------------------------------------------------------------

#### 7. API Design: Core Endpoints

The FastAPI backend must expose the following core endpoints:

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ingest/file` | Upload a file or zip of markdown files. |
| `POST` | `/api/ingest/text` | Post a text block for asynchronous processing. |
| `GET` | `/api/graph` | Retrieve the full graph or paginated results for visualization. |
| `GET` | `/api/graph/node/{id}` | Retrieve specific node details and its provenance. |
| `POST` | `/api/graph/node` | Add or edit a specific node (manual user intervention). |
| `POST` | `/api/graph/edge` | Add or edit a specific edge (manual user intervention). |
| `POST` | `/api/search/semantic` | Accepts `{"q": "..."}` and returns ranked nodes/notes based on local vector embeddings. |
| `GET` | `/api/export/graph` | Returns the NetworkX graph in GraphML, GEXF, or gpickle format. |

**Ingestion Workflow Requirement:** Upon successful ingestion via `/api/ingest/text`, the backend must perform the sequence: save note to SQLite, run LLM extraction, write extracts, update/merge nodes/edges in NetworkX, and index embeddings.

--------------------------------------------------------------------------------

#### 8. Frontend & Visualization Requirements

The Next.js frontend must provide an interactive visualization and editing environment.

##### 8.1. Key Components & Pages
Critical pages include `/graph` (Full-screen interactive graph viewer) and `/note/[id]` (Note viewer + provenance). Key components are the **GraphCanvas** (`react-cytoscapejs` wrapper) and the **NodeDetailsPanel**.

##### 8.2. Visualization Cues
The visualization must use cues based on graph data:
*   **Node color:** Determined by node `type` (e.g., `concept`, `person`, `event`).
*   **Node size:** Determined by graph analytics results, specifically **centrality** (degree or eigenvector centrality).
*   **Edge thickness:** Determined by the edge `weight` (confidence score).

##### 8.3. UX Interactions
Key interactions must include:
*   **Double-click on a node:** Opens the **NodeDetailsPanel** showing source passages and LLM extraction provenance.
*   **Inline editing:** Allows users to manually edit nodes/edges, triggering a `PATCH` request to the backend mutation endpoints.

##### 8.4. Performance
For large graphs, the visualization should only render a subgraph around the selected node (e.g., BFS to depth 2) to maintain performance.

--------------------------------------------------------------------------------

#### 9. Testing & Validation (Acceptance Criteria)

Testing must cover persistence, data operations, and extraction correctness.

##### 9.1. Acceptance Tests (Critical Thresholds)
1.  **Ingestion/Extraction:** Successfully ingest the provided sample notes folder (`data/notes/`) and confirm the extraction process successfully produces non-zero nodes (N) and edges (M).
2.  **Provenance Check:** Run `GET /api/export/graph` and confirm the exported GraphML/gpickle file contains at least one node with a full `provenance` attribute.

##### 9.2. Security Precondition
The default configuration must explicitly disable external network calls, ensuring the system remains entirely local and offline-capable.
```

<br>

Now I am going to build my final version of the master builder prompt. But this time I am going to use Anthropic. I save them for the end. I use chatGPT to brainstorm and then when I want something really done well I use my valuable Anthropic free usages to generate final versions. 

So for this generation I am going to use the app for Anthropic, which I have enabled a lot of MCP servers and have connected my github which allows me to reference the workflow.git I mentioned earlier with a template for creating the context for the propmt. You see, it serves as the one shot for the generation, that is the one example given to it, but I really should few shot it, that is include multiple examples instead of just one. I will do that later.

So the prompt I am using to generate the final version of our master_prompt_builder.md is:

<br>

```
You are an expert in prompt engineering and are going to help me build a prompt for CLIne to vibe code an entire project.

I am giving you spec.md which has the full details of the project. It is the most authoritative version and should be referenced first.

cline_master_prompt.md is the current version of the master prompt. It is not perfect and needs to be improved.

prompt_add.md is a file that contains additional information that should be included in the master prompt.

I want you to use the attached workflow.git as a template for the context of the prompt.

The deliverable you are producing is the final version of the prompt I am going to give to CLIne to that will instruct it as to each and everything it needs to do. This prompt should be long and detailed and should include all the information from the spec.md, cline_master_prompt.md, and prompt_add.md which is relevant to the task. They are in the root folder of the project and can be referenced rather than directly quoted in the prompt in order to conserver context.

Be sure to research as much as is needed in order to provide the best possible prompt. Do not assume anything. Do not make anything up.
```

<br>

Well not really, we all know the best prompt builders are LLMs so instead I am going to use chatGPT one more time to rewrite my prompt I am going to use with Anthropic by using something like this to generate it:

<br>

```
Rewrite the following prompt so that it includes all the standards of software engineering which will help me instruct the LLM to generate the best possible CLIne prompt for vibe coding. This is the prompt I have now which I want modified or augmented as necessary to include the best practices in software engineering. : You are an expert in prompt engineering and are going to help me build a prompt for CLIne to vibe code an entire project.

I am giving you spec.md which has the full details of the project. It is the most authoritative version and should be referenced first.

cline_master_prompt.md is the current version of the master prompt. It is not perfect and needs to be improved.

prompt_add.md is a file that contains additional information that should be included in the master prompt.

I want you to use the attached workflow.git as a template for the context of the prompt.

The deliverable you are producing is the final version of the prompt I am going to give to CLIne to that will instruct it as to each and everything it needs to do. This prompt should be long and detailed and should include all the information from the spec.md, cline_master_prompt.md, and prompt_add.md which is relevant to the task. They are in the root folder of the project and can be referenced rather than directly quoted in the prompt in order to conserver context.

Be sure to research as much as is needed in order to provide the best possible prompt. Do not assume anything. Do not make anything up.
```

<br>

So now I get something like this which is what I am going to give to Anthropic along with the context I said and hope that we get a good result.

<br>

```
You are an expert in **prompt engineering** and **software engineering best practices**, and your task is to help me build a **master prompt for CLIne** that will enable it to "vibe code" an entire project efficiently, accurately, and maintainably.

### Project Context
- **spec.md**: This is the authoritative specification for the project. All decisions, features, and workflows should reference this file first.
- **cline_master_prompt.md**: This is the current master prompt. It is functional but imperfect and must be improved.
- **prompt_add.md**: This file contains supplementary information that must be integrated into the final master prompt wherever relevant.
- **workflow.git**: This repository contains the workflow template to provide context on project structure, coding style, and operational logic. Reference it as needed for formatting, style, and organization guidance.

### Objective
Your deliverable is the **final, fully-formed CLIne master prompt** that:
1. Instructs CLIne on **all tasks, procedures, and coding decisions** necessary to build the project end-to-end.
2. Integrates relevant content from **spec.md**, **cline_master_prompt.md**, and **prompt_add.md**, without unnecessary duplication, preserving clarity and context.
3. Conforms to **software engineering best practices**, including but not limited to:
   - **Modularity**: Break tasks and code generation into clear, manageable components.
   - **Maintainability**: Ensure the prompt encourages clean, well-documented, and scalable code.
   - **Consistency**: Follow consistent naming conventions, formatting, and architectural patterns.
   - **Validation and Testing**: Include instructions for CLIne to generate appropriate unit tests, integration tests, or checks where applicable.
   - **Documentation**: Produce internal documentation and inline comments for all generated code.
   - **Error Handling**: Anticipate potential failures or edge cases and instruct CLIne to handle them gracefully.
   - **Iterative Development**: Plan for incremental improvements, verification steps, and checkpoints to ensure correctness.
   - **Version Control Awareness**: Encourage structured commit messages and proper branching strategies, if applicable.
   - **Security and Performance Awareness**: Include guidance for secure coding practices and optimization considerations.
   
### Instructions for Prompt Generation
1. **Read and Understand All Sources**: Thoroughly review **spec.md**, **cline_master_prompt.md**, and **prompt_add.md**. Do not assume anything; verify all information before including it.
2. **Reference, Don’t Overload**: Where possible, reference the files rather than quoting their full content to conserve context and readability.
3. **Structure the Prompt Logically**: Organize instructions in a step-by-step, hierarchical, or modular format that CLIne can follow reliably.
4. **Explicit Deliverables**: Specify clearly what CLIne should produce at each stage—files, code blocks, test scripts, configuration, documentation, or other artifacts.
5. **Iterative Verification**: Include checkpoints where CLIne should verify correctness against specifications or tests before proceeding to the next step.
6. **Comprehensiveness and Clarity**: Ensure the final prompt is detailed, unambiguous, and leaves no critical detail unaddressed.

### Constraints
- Do not invent features or requirements not present in **spec.md**.
- Avoid vague instructions; everything should be actionable.
- Ensure that the prompt can be fed to CLIne as-is to drive the coding workflow for the full project.

Your output should be a **ready-to-use CLIne master prompt** that combines the authority of **spec.md**, the structure of **cline_master_prompt.md**, the supplementary details from **prompt_add.md**, and the workflow logic from **workflow.git**, while fully adhering to software engineering best practices.
```

<br>

OK, so here is what Anthropic output. I am going to save it to root as final_prompt.md. And I think we are just about ready to start vibe coding. This is going to be a massive prompt but thankfully the stealth model from CLIne that is free has a one million token context window. Yeah this is massive. I really should read over it first and edit it. You will kick yourself if you don't and just YOLO it only to find out a few hours later that you really should correct it from the beginning and start over.

<br>

```
# CLIne Master Prompt: Mind Map AI - Local Knowledge Graph System

## Meta-Instructions for CLIne

You are CLIne, an AI coding assistant tasked with building **Mind Map AI**, a fully local, LLM-powered personal knowledge graph system. This prompt is your single source of truth for all development decisions, procedures, and coding standards.

### Core Principles
1. **Specification Authority**: `spec.md` is the authoritative project specification. All features, architecture, and implementation decisions must align with it.
2. **Documentation-First**: Generate and maintain comprehensive documentation in `/docs/` before and during implementation.
3. **Incremental Development**: Complete each phase fully before proceeding to the next. Each phase has explicit deliverables and completion thresholds.
4. **Local-Only Constraint**: All LLM inference, databases, vector stores, and graph processing must operate locally. No external API calls unless explicitly configured by the user.
5. **Auditability**: Every extraction, transformation, and graph modification must preserve provenance and source text references.
6. **Best Practices**: Follow software engineering best practices for modularity, maintainability, testing, security, and documentation.

---

## Project Overview

**Name**: Mind Map AI  
**Purpose**: Convert personal notes, journals, and markdown files into a browsable, queryable, and editable knowledge graph using local LLM inference.

**Tech Stack**:
- **Frontend**: Next.js (React) with `react-cytoscapejs` for graph visualization
- **Backend**: FastAPI (Python) for REST API, graph management, and LLM integration
- **Graph Engine**: NetworkX (in-memory graph, persisted to `.gpickle` or GraphML)
- **Database**: SQLite for raw notes, metadata, and provenance tracking
- **LLM**: Local model (Ollama, Llama.cpp, or similar)
- **Embeddings**: Local sentence-transformers (e.g., all-MiniLM) or Ollama embedding endpoint
- **Vector Store**: Lightweight local Chroma or Faiss for semantic search

**Architecture**:

[Next.js Frontend] <-> [FastAPI Backend] <-> [Local LLM Runtime]
                           ├─ SQLite (notes + extracts + metadata)
                           ├─ NetworkX Graph (.gpickle / GraphML)
                           └─ Vector DB (Chroma/Faiss embeddings)


---

## File Structure

Maintain this exact directory structure:


mindmap-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration (LLM endpoint, DB paths)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── ingest.py           # Ingestion endpoints
│   │   │   ├── graph.py            # Graph query/mutation endpoints
│   │   │   └── search.py           # Semantic search endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── extractor.py        # LLM extraction logic
│   │   │   ├── embeddings.py       # Embedding generation
│   │   │   └── graph_store.py      # NetworkX wrapper + persistence
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── db.py               # SQLite connection functions
│   │       └── schema.sql          # Database schema
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.js            # Dashboard
│   │   │   ├── graph.js            # Graph visualization page
│   │   │   ├── note/[id].js        # Note detail page
│   │   │   ├── search.js           # Semantic search page
│   │   │   └── settings.js         # Configuration page
│   │   └── components/
│   │       ├── GraphCanvas.jsx     # Cytoscape graph component
│   │       ├── NodeDetailsPanel.jsx # Node provenance panel
│   │       ├── NoteUploader.jsx    # File upload component
│   │       └── SearchBox.jsx       # Search interface
│   └── Dockerfile
├── data/
│   ├── notes/                      # Sample markdown files
│   ├── mindmap.db                  # SQLite database
│   ├── graph.gpickle               # Persisted NetworkX graph
│   └── vectors/                    # Vector DB files
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   ├── database.md
│   ├── llm_prompting.md
│   ├── security.md
│   ├── cicd_devops.md
│   ├── testing.md
│   ├── design_system.md
│   ├── roadmap.md
│   ├── decisions.md
│   └── changelog.md
├── tests/
│   ├── backend/
│   │   ├── test_db.py
│   │   ├── test_extractor.py
│   │   └── test_graph.py
│   └── frontend/
│       └── test_graph_ui.jsx
├── checklist.md                    # Progress tracking
├── README.md
└── docker-compose.yml


---

## Development Workflow

### Phase 0: Setup & Documentation

**Objective**: Initialize project structure and generate comprehensive documentation templates.

**Tasks**:
1. Create all directories as specified in the file structure
2. Initialize Git repository: `git init`
3. Create `.gitignore` with entries for:
   - `__pycache__/`, `*.pyc`, `.venv/`, `node_modules/`, `.env`, `*.db`, `*.gpickle`, `vectors/`
4. Generate documentation templates in `/docs/`:
   - `architecture.md`: System overview, technology choices, folder structure, architecture diagrams
   - `api-spec.md`: REST endpoint specifications with request/response schemas
   - `database.md`: SQLite schema, NetworkX graph model, persistence strategy
   - `llm_prompting.md`: LLM roles, extraction prompt patterns, JSON schemas
   - `security.md`: Authentication, API security, local privacy measures
   - `cicd_devops.md`: Local dev setup, Docker configuration, environment dependencies
   - `testing.md`: Unit, integration, and acceptance test strategies
   - `design_system.md`: UI/UX patterns, visualization cues, interaction specifications
   - `roadmap.md`: Future features and enhancements
   - `decisions.md`: Architectural decision records (ADR format)
   - `changelog.md`: Version history with dates and changes
5. Create `checklist.md` with this phase as the first entry
6. Create `README.md` with project overview, setup instructions, and quick start guide

**Deliverables**:
- Complete directory structure
- All documentation templates with section headers and placeholders
- Initialized Git repository with `.gitignore`
- `checklist.md` with Phase 0 tasks listed

**Completion Threshold**:
- [ ] All directories exist
- [ ] All `.md` files in `/docs/` contain structured placeholders
- [ ] `README.md` contains project description and setup steps
- [ ] Initial commit made to Git
- [ ] Log creation in `decisions.md` with rationale for directory structure

**Documentation Standards**:
- Include code examples, diagrams (ASCII or markdown), and usage instructions
- Use consistent markdown formatting (headers, lists, code blocks)
- Reference other documentation files where appropriate using relative links

---

### Phase 1: Backend Core Infrastructure

**Objective**: Set up FastAPI backend, SQLite database, and basic configuration.

**Pre-requisites**: Phase 0 complete

**Tasks**:

#### 1.1 Database Setup
1. Create `backend/app/db/schema.sql` with the following tables:

```sql
-- Table: notes
-- Stores raw markdown/text content with metadata
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_path TEXT,
  hash TEXT UNIQUE,  -- Content hash for deduplication
  processed BOOLEAN DEFAULT 0  -- Flag for extraction completion
);

-- Table: extracts
-- Stores LLM extraction results with provenance
CREATE TABLE extracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  extractor_model TEXT NOT NULL,  -- Model identifier (e.g., "llama3-8b")
  extract_json TEXT NOT NULL,     -- Raw JSON output from LLM
  score REAL,                      -- Confidence/quality score
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

-- Table: metadata
-- Key-value store for system metadata
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notes_hash ON notes(hash);
CREATE INDEX idx_notes_processed ON notes(processed);
CREATE INDEX idx_extracts_note_id ON extracts(note_id);


2. Create `backend/app/db/db.py` with connection management:

```python
import sqlite3
from pathlib import Path
from typing import Optional, Dict, List, Any
import hashlib
import json

DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "mindmap.db"

def get_connection() -> sqlite3.Connection:
    """Get SQLite connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with schema."""
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path) as f:
        schema = f.read()
    
    conn = get_connection()
    conn.executescript(schema)
    conn.commit()
    conn.close()

def insert_note(filename: str, content: str, source_path: Optional[str] = None) -> int:
    """Insert note and return note_id. Skip if hash exists."""
    content_hash = hashlib.sha256(content.encode()).hexdigest()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if note with same hash exists
    cursor.execute("SELECT id FROM notes WHERE hash = ?", (content_hash,))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return existing[0]
    
    cursor.execute(
        "INSERT INTO notes (filename, content, source_path, hash) VALUES (?, ?, ?, ?)",
        (filename, content, source_path, content_hash)
    )
    note_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return note_id

def insert_extract(note_id: int, extractor_model: str, extract_json: Dict, score: Optional[float] = None) -> int:
    """Insert extraction result."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO extracts (note_id, extractor_model, extract_json, score) VALUES (?, ?, ?, ?)",
        (note_id, extractor_model, json.dumps(extract_json), score)
    )
    extract_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return extract_id

def mark_note_processed(note_id: int):
    """Mark note as processed after extraction."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notes SET processed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()

def get_note(note_id: int) -> Optional[Dict]:
    """Retrieve note by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def get_all_notes() -> List[Dict]:
    """Retrieve all notes."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_extracts_for_note(note_id: int) -> List[Dict]:
    """Retrieve all extracts for a given note."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM extracts WHERE note_id = ? ORDER BY created_at DESC", (note_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


3. Update `docs/database.md` with:
   - Table schemas with column descriptions
   - NetworkX graph model specification (see spec.md Section 5.1)
   - Persistence strategy (gpickle vs GraphML tradeoffs)
   - Provenance tracking approach

#### 1.2 FastAPI Application Setup

1. Create `backend/app/config.py`:


from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # LLM Configuration
    llm_endpoint: str = "http://localhost:11434/api/generate"  # Default Ollama endpoint
    llm_model: str = "llama3"
    embedding_endpoint: str = "http://localhost:11434/api/embeddings"
    embedding_model: str = "all-minilm"
    
    # Database Paths
    db_path: Path = Path(__file__).parent.parent.parent / "data" / "mindmap.db"
    graph_path: Path = Path(__file__).parent.parent.parent / "data" / "graph.gpickle"
    vector_db_path: Path = Path(__file__).parent.parent.parent / "data" / "vectors"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list = ["http://localhost:3000"]
    
    # Processing Configuration
    max_batch_size: int = 10
    extraction_timeout: int = 300  # seconds
    
    class Config:
        env_file = ".env"

settings = Settings()

2. Create `backend/app/main.py`:

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db.db import init_database
from .api import ingest, graph, search

app = FastAPI(
    title="Mind Map AI",
    description="Local LLM-powered personal knowledge graph",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    # Initialize graph store (will be implemented in Phase 2)
    # from .services.graph_store import init_graph
    # init_graph()

# Include routers
app.include_router(ingest.router, prefix="/api/ingest", tags=["ingestion"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Mind Map AI API", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

3. Create empty router files (to be implemented in later phases):
   - `backend/app/api/__init__.py`
   - `backend/app/api/ingest.py`
   - `backend/app/api/graph.py`
   - `backend/app/api/search.py`

4. Create `backend/requirements.txt`:

fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic-settings==2.1.0
networkx==3.2.1
requests==2.31.0
sentence-transformers==2.3.1
chromadb==0.4.22
numpy==1.26.3
python-multipart==0.0.6

#### 1.3 Testing & Documentation

1. Create `tests/backend/test_db.py`:

import pytest
from pathlib import Path
import tempfile
import shutil
from backend.app.db import db

@pytest.fixture
def temp_db():
    """Create temporary database for testing."""
    temp_dir = tempfile.mkdtemp()
    original_db_path = db.DB_PATH
    db.DB_PATH = Path(temp_dir) / "test.db"
    db.init_database()
    
    yield db.DB_PATH
    
    # Cleanup
    shutil.rmtree(temp_dir)
    db.DB_PATH = original_db_path

def test_insert_note(temp_db):
    """Test note insertion."""
    note_id = db.insert_note("test.md", "Test content", "/path/to/test.md")
    assert note_id > 0
    
    note = db.get_note(note_id)
    assert note['filename'] == "test.md"
    assert note['content'] == "Test content"
    assert note['processed'] == 0

def test_duplicate_note_hash(temp_db):
    """Test that duplicate content returns existing note_id."""
    note_id_1 = db.insert_note("test1.md", "Same content")
    note_id_2 = db.insert_note("test2.md", "Same content")
    
    assert note_id_1 == note_id_2

def test_insert_extract(temp_db):
    """Test extract insertion."""
    note_id = db.insert_note("test.md", "Test content")
    extract_json = {"nodes": [], "edges": []}
    extract_id = db.insert_extract(note_id, "llama3", extract_json, 0.95)
    
    assert extract_id > 0
    
    extracts = db.get_extracts_for_note(note_id)
    assert len(extracts) == 1
    assert extracts[0]['extractor_model'] == "llama3"

def test_mark_note_processed(temp_db):
    """Test marking note as processed."""
    note_id = db.insert_note("test.md", "Test content")
    db.mark_note_processed(note_id)
    
    note = db.get_note(note_id)
    assert note['processed'] == 1

2. Update `docs/architecture.md` with:
   - Technology stack rationale
   - Backend architecture diagram (ASCII art or description)
   - Data flow from ingestion to graph
   - Module dependencies

3. Update `docs/cicd_devops.md` with:
   - Python environment setup (`venv`, dependencies)
   - Running the backend: `uvicorn app.main:app --reload`
   - Database initialization steps

**Deliverables**:
- `backend/app/db/schema.sql` with complete schema
- `backend/app/db/db.py` with all CRUD functions
- `backend/app/config.py` with settings management
- `backend/app/main.py` with FastAPI app initialization
- `backend/requirements.txt` with all dependencies
- `tests/backend/test_db.py` with passing unit tests
- Updated documentation in `docs/`

**Completion Threshold**:
- [ ] SQLite database can be created and queried
- [ ] FastAPI server runs locally without errors: `uvicorn app.main:app --reload`
- [ ] All database unit tests pass: `pytest tests/backend/test_db.py`
- [ ] `/health` endpoint returns 200 OK
- [ ] Update `checklist.md` with Phase 1 completion
- [ ] Log backend setup in `decisions.md`

---

### Phase 2: NetworkX Graph Store

**Objective**: Implement in-memory graph using NetworkX with disk persistence.

**Pre-requisites**: Phase 1 complete

**Tasks**:

#### 2.1 Graph Store Implementation

1. Create `backend/app/services/graph_store.py`:

import networkx as nx
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import pickle
from datetime import datetime
from ..config import settings

class GraphStore:
    """Manages NetworkX graph with disk persistence."""
    
    def __init__(self, graph_path: Optional[Path] = None):
        self.graph_path = graph_path or settings.graph_path
        self.graph = self._load_graph()
    
    def _load_graph(self) -> nx.Graph:
        """Load graph from disk or create new."""
        if self.graph_path.exists():
            try:
                with open(self.graph_path, 'rb') as f:
                    return pickle.load(f)
            except Exception as e:
                print(f"Error loading graph: {e}. Creating new graph.")
                return nx.Graph()
        else:
            return nx.Graph()
    
    def save(self):
        """Persist graph to disk."""
        self.graph_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.graph_path, 'wb') as f:
            pickle.dump(self.graph, f)
    
    def add_node(
        self,
        node_id: str,
        label: str,
        node_type: str,
        provenance: List[Tuple[int, int, int]] = None,
        **kwargs
    ) -> str:
        """
        Add or update node in graph.
        
        Args:
            node_id: Unique node identifier
            label: Display name
            node_type: Type (concept, person, place, idea, event, passage)
            provenance: List of (note_id, span_start, span_end) tuples
            **kwargs: Additional attributes (embedding, metadata, etc.)
        
        Returns:
            node_id
        """
        if self.graph.has_node(node_id):
            # Update existing node
            existing = self.graph.nodes[node_id]
            existing['label'] = label
            existing['type'] = node_type
            
            # Merge provenance
            existing_prov = existing.get('provenance', [])
            new_prov = provenance or []
            existing['provenance'] = existing_prov + [p for p in new_prov if p not in existing_prov]
            
            existing['updated_at'] = datetime.now().isoformat()
            existing.update(kwargs)
        else:
            # Add new node
            self.graph.add_node(
                node_id,
                label=label,
                type=node_type,
                provenance=provenance or [],
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                **kwargs
            )
        
        return node_id
    
    def add_edge(
        self,
        source: str,
        target: str,
        edge_type: str,
        weight: float = 1.0,
        extraction_id: Optional[int] = None,
        provenance: Optional[List[Tuple[int, int, int]]] = None,
        **kwargs
    ):
        """
        Add or update edge in graph.
        
        Args:
            source: Source node ID
            target: Target node ID
            edge_type: Relationship type (related_to, causes, elaborates, etc.)
            weight: Confidence score (0-1)
            extraction_id: Reference to extracts table
            provenance: Source spans
            **kwargs: Additional attributes
        """
        if not self.graph.has_node(source) or not self.graph.has_node(target):
            raise ValueError(f"Both nodes must exist before adding edge: {source} -> {target}")
        
        if self.graph.has_edge(source, target):
            # Update existing edge
            existing = self.graph.edges[source, target]
            existing['type'] = edge_type
            existing['weight'] = weight
            existing['extraction_id'] = extraction_id
            existing['provenance'] = provenance or []
            existing['updated_at'] = datetime.now().isoformat()
            existing.update(kwargs)
        else:
            # Add new edge
            self.graph.add_edge(
                source,
                target,
                type=edge_type,
                weight=weight,
                extraction_id=extraction_id,
                provenance=provenance or [],
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                **kwargs
            )
    
    def get_node(self, node_id: str) -> Optional[Dict]:
        """Get node attributes."""
        if self.graph.has_node(node_id):
            data = dict(self.graph.nodes[node_id])
            data['id'] = node_id
            return data
        return None
    
    def get_all_nodes(self) -> List[Dict]:
        """Get all nodes with attributes."""
        return [
            {'id': node_id, **dict(attrs)}
            for node_id, attrs in self.graph.nodes(data=True)
        ]
    
    def get_edges(self, node_id: Optional[str] = None) -> List[Dict]:
        """Get edges, optionally filtered by node."""
        if node_id:
            edges = self.graph.edges(node_id, data=True)
        else:
            edges = self.graph.edges(data=True)
        
        return [
            {'source': u, 'target': v, **attrs}
            for u, v, attrs in edges
        ]
    
    def delete_node(self, node_id: str):
        """Remove node and associated edges."""
        if self.graph.has_node(node_id):
            self.graph.remove_node(node_id)
    
    def delete_edge(self, source: str, target: str):
        """Remove edge."""
        if self.graph.has_edge(source, target):
            self.graph.remove_edge(source, target)
    
    def get_neighbors(self, node_id: str, depth: int = 1) -> List[str]:
        """Get neighboring nodes up to specified depth."""
        if not self.graph.has_node(node_id):
            return []
        
        neighbors = set()
        current_level = {node_id}
        
        for _ in range(depth):
            next_level = set()
            for node in current_level:
                next_level.update(self.graph.neighbors(node))
            neighbors.update(next_level)
            current_level = next_level
        
        return list(neighbors)
    
    def get_subgraph(self, node_id: str, depth: int = 2) -> Dict:
        """Get subgraph around node for visualization."""
        neighbors = self.get_neighbors(node_id, depth)
        nodes_to_include = [node_id] + neighbors
        
        subgraph = self.graph.subgraph(nodes_to_include)
        
        return {
            'nodes': [
                {'id': n, **dict(attrs)}
                for n, attrs in subgraph.nodes(data=True)
            ],
            'edges': [
                {'source': u, 'target': v, **attrs}
                for u, v, attrs in subgraph.edges(data=True)
            ]
        }
    
    def compute_centrality(self, metric: str = 'degree') -> Dict[str, float]:
        """Compute centrality metrics for visualization."""
        if metric == 'degree':
            return nx.degree_centrality(self.graph)
        elif metric == 'eigenvector':
            try:
                return nx.eigenvector_centrality(self.graph, max_iter=1000)
            except:
                return nx.degree_centrality(self.graph)  # Fallback
        elif metric == 'betweenness':
            return nx.betweenness_centrality(self.graph)
        else:
            return nx.degree_centrality(self.graph)
    
    def export_graphml(self, output_path: Path):
        """Export graph to GraphML format."""
        nx.write_graphml(self.graph, str(output_path))
    
    def export_gexf(self, output_path: Path):
        """Export graph to GEXF format."""
        nx.write_gexf(self.graph, str(output_path))
    
    def get_stats(self) -> Dict:
        """Get graph statistics."""
        return {
            'num_nodes': self.graph.number_of_nodes(),
            'num_edges': self.graph.number_of_edges(),
            'density': nx.density(self.graph),
            'connected_components': nx.number_connected_components(self.graph),
        }


# Global instance
_graph_store = None

def get_graph_store() -> GraphStore:
    """Get or create global graph store instance."""
    global _graph_store
    if _graph_store is None:
        _graph_store = GraphStore()
    return _graph_store

def init_graph():
    """Initialize graph store on startup."""
    global _graph_store
    _graph_store = GraphStore()

2. Uncomment graph initialization in `backend/app/main.py` startup event:

@app.on_event("startup")
async def startup_event():
    init_database()
    from .services.graph_store import init_graph
    init_graph()

#### 2.2 Basic Graph API Endpoints

1. Implement `backend/app/api/graph.py`:

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from ..services.graph_store import get_graph_store
from pathlib import Path

router = APIRouter()

class NodeCreate(BaseModel):
    id: str
    label: str
    type: str
    provenance: List[List[int]] = []
    metadata: dict = {}

class EdgeCreate(BaseModel):
    source: str
    target: str
    type: str
    weight: float = 1.0
    extraction_id: Optional[int] = None

@router.get("/")
async def get_graph(
    node_id: Optional[str] = Query(None, description="Get subgraph around node"),
    depth: int = Query(2, description="Subgraph depth")
):
    """Get full graph or subgraph around a node."""
    graph_store = get_graph_store()
    
    if node_id:
        return graph_store.get_subgraph(node_id, depth)
    else:
        return {
            'nodes': graph_store.get_all_nodes(),
            'edges': graph_store.get_edges()
        }

@router.get("/node/{node_id}")
async def get_node(node_id: str):
    """Get specific node details."""
    graph_store = get_graph_store()
    node = graph_store.get_node(node_id)
    
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    return node

@router.post("/node")
async def create_node(node: NodeCreate):
    """Create or update node."""
    graph_store = get_graph_store()
    
    node_id = graph_store.add_node(
        node.id,
        node.label,
        node.type,
        provenance=[tuple(p) for p in node.provenance],
        **node.metadata
    )
    
    graph_store.save()
    
    return {"node_id": node_id}

@router.post("/edge")
async def create_edge(edge: EdgeCreate):
    """Create or update edge."""
    graph_store = get_graph_store()
    
    try:
        graph_store.add_edge(
            edge.source,
            edge.target,
            edge.type,
            weight=edge.weight,
            extraction_id=edge.extraction_id
        )
        graph_store.save()
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/node/{node_id}")
async def delete_node(node_id: str):
    """Delete node and associated edges."""
    graph_store = get_graph_store()
    graph_store.delete_node(node_id)
    graph_store.save()
    return {"status": "deleted"}

@router.delete("/edge")
async def delete_edge(source: str, target: str):
    """Delete edge."""
    graph_store = get_graph_store()
    graph_store.delete_edge(source, target)
    graph_store.save()
    return {"status": "deleted"}

@router.get("/stats")
async def get_stats():
    """Get graph statistics."""
    graph_store = get_graph_store()
    return graph_store.get_stats()

@router.get("/export")
async def export_graph(format: str = Query("graphml", enum=["graphml", "gexf", "gpickle"])):
    """Export graph in specified format."""
    from fastapi.responses import FileResponse
    import tempfile
    
    graph_store = get_graph_store()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as tmp:
        tmp_path = Path(tmp.name)
    
    if format == "graphml":
        graph_store.export_graphml(tmp_path)
    elif format == "gexf":
        graph_store.export_gexf(tmp_path)
    elif format == "gpickle":
        import shutil
        shutil.copy(graph_store.graph_path, tmp_path)
    
    return FileResponse(
        tmp_path,
        media_type="application/octet-stream",
        filename=f"mindmap_graph.{format}"
    )

#### 2.3 Testing & Documentation

1. Create `tests/backend/test_graph.py`:

import pytest
from backend.app.services.graph_store import GraphStore
from pathlib import Path
import tempfile

@pytest.fixture
def temp_graph():
    """Create temporary graph for testing."""
    with tempfile.NamedTemporaryFile(suffix=".gpickle", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    
    graph_store = GraphStore(tmp_path)
    
    yield graph_store
    
    # Cleanup
    if tmp_path.exists():
        tmp_path.unlink()

def test_add_node(temp_graph):
    """Test node addition."""
    node_id = temp_graph.add_node(
        "node:1",
        "Test Node",
        "concept",
        provenance=[(1, 0, 10)]
    )
    
    assert node_id == "node:1"
    assert temp_graph.graph.has_node("node:1")
    
    node = temp_graph.get_node("node:1")
    assert node['label'] == "Test Node"
    assert node['type'] == "concept"
    assert len(node['provenance']) == 1

def test_add_edge(temp_graph):
    """Test edge addition."""
    temp_graph.add_node("node:1", "Node 1", "concept")
    temp_graph.add_node("node:2", "Node 2", "concept")
    
    temp_graph.add_edge("node:1", "node:2", "related_to", weight=0.9)
    
    assert temp_graph.graph.has_edge("node:1", "node:2")
    
    edges = temp_graph.get_edges("node:1")
    assert len(edges) == 1
    assert edges[0]['type'] == "related_to"
    assert edges[0]['weight'] == 0.9

def test_persistence(temp_graph):
    """Test graph save and load."""
    temp_graph.add_node("node:1", "Test Node", "concept")
    temp_graph.add_node("node:2", "Test Node 2", "person")
    temp_graph.add_edge("node:1", "node:2", "related_to")
    
    temp_graph.save()
    
    # Create new instance with same path
    new_graph = GraphStore(temp_graph.graph_path)
    
    assert new_graph.graph.has_node("node:1")
    assert new_graph.graph.has_node("node:2")
    assert new_graph.graph.has_edge("node:1", "node:2")

def test_merge_provenance(temp_graph):
    """Test provenance merging on node update."""
    temp_graph.add_node("node:1", "Test", "concept", provenance=[(1, 0, 10)])
    temp_graph.add_node("node:1", "Test", "concept", provenance=[(2, 5, 15)])
    
    node = temp_graph.get_node("node:1")
    assert len(node['provenance']) == 2
    assert (1, 0, 10) in node['provenance']
    assert (2, 5, 15) in node['provenance']

def test_get_neighbors(temp_graph):
    """Test neighbor retrieval."""
    temp_graph.add_node("node:1", "Node 1", "concept")
    temp_graph.add_node("node:2", "Node 2", "concept")
    temp_graph.add_node("node:3", "Node 3", "concept")
    
    temp_graph.add_edge("node:1", "node:2", "related_to")
    temp_graph.add_edge("node:2", "node:3", "related_to")
    
    neighbors_d1 = temp_graph.get_neighbors("node:1", depth=1)
    assert "node:2" in neighbors_d1
    assert "node:3" not in neighbors_d1
    
    neighbors_d2 = temp_graph.get_neighbors("node:1", depth=2)
    assert "node:2" in neighbors_d2
    assert "node:3" in neighbors_d2

def test_subgraph(temp_graph):
    """Test subgraph extraction."""
    temp_graph.add_node("node:1", "Node 1", "concept")
    temp_graph.add_node("node:2", "Node 2", "concept")
    temp_graph.add_node("node:3", "Node 3", "concept")
    temp_graph.add_node("node:4", "Node 4", "concept")
    
    temp_graph.add_edge("node:1", "node:2", "related_to")
    temp_graph.add_edge("node:2", "node:3", "related_to")
    temp_graph.add_edge("node:3", "node:4", "related_to")
    
    subgraph = temp_graph.get_subgraph("node:2", depth=1)
    
    node_ids = [n['id'] for n in subgraph['nodes']]
    assert "node:2" in node_ids
    assert "node:1" in node_ids
    assert "node:3" in node_ids
    assert "node:4" not in node_ids

def test_centrality(temp_graph):
    """Test centrality computation."""
    temp_graph.add_node("node:1", "Node 1", "concept")
    temp_graph.add_node("node:2", "Node 2", "concept")
    temp_graph.add_node("node:3", "Node 3", "concept")
    
    temp_graph.add_edge("node:1", "node:2", "related_to")
    temp_graph.add_edge("node:1", "node:3", "related_to")
    temp_graph.add_edge("node:2", "node:3", "related_to")
    
    centrality = temp_graph.compute_centrality("degree")
    
    assert "node:1" in centrality
    assert "node:2" in centrality
    assert "node:3" in centrality
    assert centrality["node:1"] > 0

2. Update `docs/database.md` with:
   - NetworkX graph model (node/edge attributes)
   - Provenance tracking mechanism
   - Persistence strategy (gpickle advantages)
   - Graph merging and deduplication logic

3. Update `docs/api-spec.md` with:
   - All graph endpoints with request/response examples
   - Error codes and handling
   - Pagination considerations for large graphs

**Deliverables**:
- `backend/app/services/graph_store.py` with full GraphStore class
- `backend/app/api/graph.py` with all CRUD endpoints
- `tests/backend/test_graph.py` with comprehensive tests
- Updated documentation

**Completion Threshold**:
- [ ] Graph can be saved and reloaded from disk
- [ ] All graph tests pass: `pytest tests/backend/test_graph.py`
- [ ] Graph API endpoints accessible via FastAPI
- [ ] `GET /api/graph` returns empty graph structure
- [ ] `GET /api/graph/stats` returns node/edge counts
- [ ] Update `checklist.md` with Phase 2 completion
- [ ] Log graph design decisions in `decisions.md`

---

### Phase 3: LLM Extraction Module

**Objective**: Implement local LLM integration for extracting entities, concepts, and relationships from text.

**Pre-requisites**: Phases 1 and 2 complete

**Tasks**:

#### 3.1 LLM Extraction Prompt Design

1. Update `docs/llm_prompting.md` with the extraction prompt schema:

# LLM Prompting Strategy

## Extraction Prompt Pattern

### System Instructions
You are a knowledge extraction assistant. Your task is to analyze text and extract structured information in strict JSON format.

### Required JSON Schema
{
  "nodes": [
    {
      "label": string,      // Entity or concept name
      "type": string,       // One of: concept, person, place, idea, event, passage
      "span": [int, int],   // Character position [start, end] in source text
      "confidence": float   // Score between 0 and 1
    }
  ],
  "edges": [
    {
      "source": string,     // Label of source node
      "target": string,     // Label of target node
      "type": string,       // Relationship type (see below)
      "confidence": float   // Score between 0 and 1
    }
  ],
  "summary": string         // One-sentence summary of passage
}

### Edge Types
- **related_to**: General association
- **causes**: Causal relationship
- **elaborates**: Provides detail or explanation
- **contradicts**: Conflicting information
- **similar_to**: Conceptual similarity
- **part_of**: Hierarchical relationship
- **precedes**: Temporal ordering
- **affects**: Impact or influence

### Example 1

**Input:**
I haven't been sleeping well, which makes my work energy low and irritability higher. I want to improve exercise and sleep routine.

**Output:**
{
  "nodes": [
    {"label": "sleep quality", "type": "concept", "span": [11, 24], "confidence": 0.95},
    {"label": "work energy", "type": "concept", "span": [39, 50], "confidence": 0.9},
    {"label": "irritability", "type": "concept", "span": [59, 71], "confidence": 0.9},
    {"label": "exercise", "type": "activity", "span": [99, 107], "confidence": 0.85},
    {"label": "sleep routine", "type": "activity", "span": [112, 125], "confidence": 0.85}
  ],
  "edges": [
    {"source": "sleep quality", "target": "work energy", "type": "affects", "confidence": 0.95},
    {"source": "sleep quality", "target": "irritability", "type": "affects", "confidence": 0.9},
    {"source": "exercise", "target": "sleep routine", "type": "related_to", "confidence": 0.8}
  ],
  "summary": "Poor sleep negatively impacts work performance and mood, prompting desire to improve health routines."
}

### Example 2

**Input:**
Artificial intelligence and machine learning are transforming software development. AI can assist with code generation, bug detection, and optimization.

**Output:**
{
  "nodes": [
    {"label": "artificial intelligence", "type": "concept", "span": [0, 24], "confidence": 0.98},
    {"label": "machine learning", "type": "concept", "span": [29, 45], "confidence": 0.98},
    {"label": "software development", "type": "concept", "span": [64, 84], "confidence": 0.95},
    {"label": "code generation", "type": "activity", "span": [106, 121], "confidence": 0.9},
    {"label": "bug detection", "type": "activity", "span": [123, 136], "confidence": 0.9},
    {"label": "optimization", "type": "activity", "span": [142, 154], "confidence": 0.85}
  ],
  "edges": [
    {"source": "artificial intelligence", "target": "machine learning", "type": "related_to", "confidence": 0.95},
    {"source": "artificial intelligence", "target": "software development", "type": "affects", "confidence": 0.9},
    {"source": "artificial intelligence", "target": "code generation", "type": "enables", "confidence": 0.88},
    {"source": "artificial intelligence", "target": "bug detection", "type": "enables", "confidence": 0.88},
    {"source": "artificial intelligence", "target": "optimization", "type": "enables", "confidence": 0.85}
  ],
  "summary": "AI and ML technologies are revolutionizing how software is developed through automated assistance."
}

## Normalization Prompt Pattern

### Task
Given multiple entity mentions, identify the canonical (preferred) form and list all aliases.

### Input Format
{
  "entities": ["AI", "artificial intelligence", "A.I.", "machine intelligence"]
}

### Output Format
{
  "canonical": "artificial intelligence",
  "aliases": ["AI", "A.I.", "machine intelligence"],
  "rationale": "Full expanded form is most descriptive and unambiguous"
}

## Implementation Notes
- Always validate JSON output before processing
- Handle extraction failures gracefully with empty nodes/edges arrays
- Store raw LLM output for debugging and refinement
- Implement timeout handling (max 300 seconds per extraction)

#### 3.2 Extractor Service Implementation

1. Create `backend/app/services/extractor.py`:

import requests
import json
from typing import Dict, List, Tuple, Optional
from ..config import settings
from ..db.db import insert_extract, mark_note_processed, get_note
from .graph_store import get_graph_store
import hashlib
import re

EXTRACTION_PROMPT_TEMPLATE = """You are a knowledge extraction assistant. Analyze the following text and extract structured information in strict JSON format.

Required JSON Schema:
{{
  "nodes": [
    {{"label": "string", "type": "concept|person|place|idea|event|passage", "span": [start, end], "confidence": 0.0-1.0}}
  ],
  "edges": [
    {{"source": "label", "target": "label", "type": "related_to|causes|elaborates|contradicts|similar_to|part_of|precedes|affects", "confidence": 0.0-1.0}}
  ],
  "summary": "one-sentence summary"
}}

Edge types:
- related_to: General association
- causes: Causal relationship
- elaborates: Provides detail
- contradicts: Conflicting information
- similar_to: Conceptual similarity
- part_of: Hierarchical relationship
- precedes: Temporal ordering
- affects: Impact or influence

Return ONLY valid JSON. No additional text.

Text to analyze:
\"\"\"
{text}
\"\"\"
"""

def normalize_label(label: str) -> str:
    """Normalize entity label for consistent node IDs."""
    # Lowercase, remove special chars, replace spaces with underscores
    normalized = re.sub(r'[^\w\s-]', '', label.lower())
    normalized = re.sub(r'\s+', '_', normalized)
    return normalized.strip('_')

def generate_node_id(label: str) -> str:
    """Generate unique node ID from label."""
    normalized = normalize_label(label)
    # Use hash for uniqueness while keeping it deterministic
    hash_suffix = hashlib.md5(normalized.encode()).hexdigest()[:8]
    return f"node:{normalized}_{hash_suffix}"

def call_local_llm(prompt: str, model: str = None) -> str:
    """
    Call local LLM endpoint (Ollama format).
    
    Args:
        prompt: The prompt text
        model: Model name (defaults to settings.llm_model)
    
    Returns:
        Generated text response
    
    Raises:
        Exception: If LLM call fails
    """
    model = model or settings.llm_model
    
    try:
        response = requests.post(
            settings.llm_endpoint,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,  # Lower temperature for more consistent extraction
                    "num_predict": 2048
                }
            },
            timeout=settings.extraction_timeout
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    
    except requests.exceptions.Timeout:
        raise Exception("LLM request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"LLM request failed: {str(e)}")

def parse_extraction_output(llm_output: str) -> Dict:
    """
    Parse and validate LLM extraction output.
    
    Args:
        llm_output: Raw LLM response string
    
    Returns:
        Parsed and validated extraction dict
    
    Raises:
        ValueError: If output is invalid JSON or missing required fields
    """
    # Try to extract JSON from output (handle cases where LLM adds extra text)
    json_match = re.search(r'\{.*\}', llm_output, re.DOTALL)
    if not json_match:
        raise ValueError("No JSON found in LLM output")
    
    try:
        data = json.loads(json_match.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {str(e)}")
    
    # Validate schema
    if "nodes" not in data or not isinstance(data["nodes"], list):
        raise ValueError("Missing or invalid 'nodes' field")
    
    if "edges" not in data or not isinstance(data["edges"], list):
        raise ValueError("Missing or invalid 'edges' field")
    
    if "summary" not in data:
        data["summary"] = ""  # Optional field
    
    # Validate node structure
    valid_node_types = {"concept", "person", "place", "idea", "event", "passage"}
    for node in data["nodes"]:
        if not all(k in node for k in ["label", "type", "span", "confidence"]):
            raise ValueError(f"Invalid node structure: {node}")
        
        if node["type"] not in valid_node_types:
            raise ValueError(f"Invalid node type: {node['type']}")
        
        if not isinstance(node["span"], list) or len(node["span"]) != 2:
            raise ValueError(f"Invalid span format: {node['span']}")
        
        if not 0 <= node["confidence"] <= 1:
            raise ValueError(f"Invalid confidence score: {node['confidence']}")
    
    # Validate edge structure
    valid_edge_types = {
        "related_to", "causes", "elaborates", "contradicts",
        "similar_to", "part_of", "precedes", "affects"
    }
    for edge in data["edges"]:
        if not all(k in edge for k in ["source", "target", "type", "confidence"]):
            raise ValueError(f"Invalid edge structure: {edge}")
        
        if edge["type"] not in valid_edge_types:
            raise ValueError(f"Invalid edge type: {edge['type']}")
        
        if not 0 <= edge["confidence"] <= 1:
            raise ValueError(f"Invalid confidence score: {edge['confidence']}")
    
    return data

def extract_from_text(text: str, note_id: int) -> Dict:
    """
    Extract entities and relationships from text using local LLM.
    
    Args:
        text: Input text to analyze
        note_id: Associated note ID for provenance
    
    Returns:
        Extraction result with nodes and edges
    """
    prompt = EXTRACTION_PROMPT_TEMPLATE.format(text=text)
    
    # Call LLM
    llm_output = call_local_llm(prompt)
    
    # Parse and validate
    extraction = parse_extraction_output(llm_output)
    
    # Add note_id to provenance
    for node in extraction["nodes"]:
        node["note_id"] = note_id
    
    return extraction

def update_graph_from_extraction(extraction: Dict, note_id: int, extraction_id: int):
    """
    Update NetworkX graph with extraction results.
    
    Args:
        extraction: Parsed extraction dict
        note_id: Source note ID
        extraction_id: Extract record ID
    """
    graph_store = get_graph_store()
    
    # Track created node IDs for edge creation
    node_label_to_id = {}
    
    # Add/update nodes
    for node_data in extraction["nodes"]:
        label = node_data["label"]
        node_id = generate_node_id(label)
        
        span_start, span_end = node_data["span"]
        provenance = [(note_id, span_start, span_end)]
        
        graph_store.add_node(
            node_id,
            label,
            node_data["type"],
            provenance=provenance,
            confidence=node_data["confidence"]
        )
        
        node_label_to_id[label] = node_id
    
    # Add edges
    for edge_data in extraction["edges"]:
        source_label = edge_data["source"]
        target_label = edge_data["target"]
        
        # Get node IDs (may need to generate if referenced node doesn't exist in this extraction)
        source_id = node_label_to_id.get(source_label, generate_node_id(source_label))
        target_id = node_label_to_id.get(target_label, generate_node_id(target_label))
        
        # Skip edge if either node doesn't exist in graph
        if not graph_store.graph.has_node(source_id) or not graph_store.graph.has_node(target_id):
            continue
        
        graph_store.add_edge(
            source_id,
            target_id,
            edge_data["type"],
            weight=edge_data["confidence"],
            extraction_id=extraction_id
        )
    
    # Save graph
    graph_store.save()

def process_note(note_id: int) -> Dict:
    """
    Full extraction pipeline for a note.
    
    Args:
        note_id: Note to process
    
    Returns:
        Processing result with stats
    """
    # Get note content
    note = get_note(note_id)
    if not note:
        raise ValueError(f"Note {note_id} not found")
    
    if note['processed']:
        return {"status": "already_processed", "note_id": note_id}
    
    content = note['content']
    
    # Extract
    try:
        extraction = extract_from_text(content, note_id)
    except Exception as e:
        return {
            "status": "extraction_failed",
            "note_id": note_id,
            "error": str(e)
        }
    
    # Store extract
    extraction_id = insert_extract(
        note_id,
        settings.llm_model,
        extraction,
        score=None  # Could compute average confidence
    )
    
    # Update graph
    try:
        update_graph_from_extraction(extraction, note_id, extraction_id)
    except Exception as e:
        return {
            "status": "graph_update_failed",
            "note_id": note_id,
            "extraction_id": extraction_id,
            "error": str(e)
        }
    
    # Mark as processed
    mark_note_processed(note_id)
    
    return {
        "status": "success",
        "note_id": note_id,
        "extraction_id": extraction_id,
        "nodes_extracted": len(extraction["nodes"]),
        "edges_extracted": len(extraction["edges"]),
        "summary": extraction.get("summary", "")
    }

#### 3.3 Ingestion API Implementation

1. Implement `backend/app/api/ingest.py`:

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
from ..db.db import insert_note
from ..services.extractor import process_note
import zipfile
import io

router = APIRouter()

class IngestTextRequest(BaseModel):
    filename: str
    content: str
    source_path: str = None

class IngestResponse(BaseModel):
    note_id: int
    status: str
    message: str

@router.post("/text", response_model=IngestResponse)
async def ingest_text(payload: IngestTextRequest, background_tasks: BackgroundTasks):
    """
    Ingest text content for processing.
    
    Saves note to database and triggers asynchronous extraction.
    """
    try:
        # Insert note
        note_id = insert_note(
            payload.filename,
            payload.content,
            payload.source_path
        )
        
        # Process in background
        background_tasks.add_task(process_note, note_id)
        
        return IngestResponse(
            note_id=note_id,
            status="accepted",
            message="Note saved and queued for processing"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/file")
async def ingest_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Ingest markdown file(s).
    
    Supports single .md files or .zip archives containing multiple .md files.
    """
    if not file.filename.endswith(('.md', '.txt', '.zip')):
        raise HTTPException(
            status_code=400,
            detail="Only .md, .txt, or .zip files are supported"
        )
    
    content = await file.read()
    note_ids = []
    
    try:
        if file.filename.endswith('.zip'):
            # Handle zip archive
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                for filename in zf.namelist():
                    if filename.endswith(('.md', '.txt')):
                        file_content = zf.read(filename).decode('utf-8')
                        note_id = insert_note(filename, file_content, file.filename)
                        note_ids.append(note_id)
                        
                        # Process in background
                        if background_tasks:
                            background_tasks.add_task(process_note, note_id)
        else:
            # Single file
            file_content = content.decode('utf-8')
            note_id = insert_note(file.filename, file_content, file.filename)
            note_ids.append(note_id)
            
            # Process in background
            if background_tasks:
                background_tasks.add_task(process_note, note_id)
        
        return {
            "status": "accepted",
            "note_ids": note_ids,
            "message": f"Ingested {len(note_ids)} file(s), processing started"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{note_id}")
async def get_ingestion_status(note_id: int):
    """Check processing status of a note."""
    from ..db.db import get_note, get_extracts_for_note
    
    note = get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    extracts = get_extracts_for_note(note_id)
    
    return {
        "note_id": note_id,
        "processed": bool(note['processed']),
        "num_extracts": len(extracts),
        "created_at": note['created_at']
    }

#### 3.4 Testing & Documentation

1. Create `tests/backend/test_extractor.py`:

import pytest
from backend.app.services.extractor import (
    normalize_label,
    generate_node_id,
    parse_extraction_output
)
import json

def test_normalize_label():
    """Test label normalization."""
    assert normalize_label("Artificial Intelligence") == "artificial_intelligence"
    assert normalize_label("  AI  ") == "ai"
    assert normalize_label("Self-Driving Cars") == "selfdriving_cars"

def test_generate_node_id():
    """Test deterministic node ID generation."""
    id1 = generate_node_id("test concept")
    id2 = generate_node_id("test concept")
    id3 = generate_node_id("different concept")
    
    assert id1 == id2  # Same label produces same ID
    assert id1 != id3  # Different labels produce different IDs
    assert id1.startswith("node:")

def test_parse_extraction_valid():
    """Test parsing valid extraction JSON."""
    valid_json = json.dumps({
        "nodes": [
            {"label": "sleep", "type": "concept", "span": [0, 5], "confidence": 0.9}
        ],
        "edges": [
            {"source": "sleep", "target": "health", "type": "affects", "confidence": 0.8}
        ],
        "summary": "Sleep affects health"
    })
    
    result = parse_extraction_output(valid_json)
    
    assert len(result["nodes"]) == 1
    assert result["nodes"][0]["label"] == "sleep"
    assert len(result["edges"]) == 1
    assert result["summary"] == "Sleep affects health"

def test_parse_extraction_invalid_node_type():
    """Test parsing with invalid node type."""
    invalid_json = json.dumps({
        "nodes": [
            {"label": "test", "type": "invalid_type", "span": [0, 4], "confidence": 0.9}
        ],
        "edges": [],
        "summary": ""
    })
    
    with pytest.raises(ValueError, match="Invalid node type"):
        parse_extraction_output(invalid_json)

def test_parse_extraction_missing_fields():
    """Test parsing with missing required fields."""
    invalid_json = json.dumps({
        "nodes": [
            {"label": "test", "type": "concept"}  # Missing span and confidence
        ],
        "edges": []
    })
    
    with pytest.raises(ValueError, match="Invalid node structure"):
        parse_extraction_output(invalid_json)

def test_parse_extraction_with_extra_text():
    """Test parsing JSON embedded in text."""
    output_with_text = """
    Here is the extraction result:
    {"nodes ": [{"label": "test", "type": "concept", "span": [0, 4], "confidence": 0.9}], "edges": [], "summary": "Test"}
    That's the analysis.
    """
    
    result = parse_extraction_output(output_with_text)
    
    assert len(result["nodes"]) == 1
    assert result["nodes"][0]["label"] == "test"

# Mock LLM for integration testing
@pytest.fixture
def mock_llm_response(monkeypatch):
    """Mock LLM response for testing."""
    def mock_call_local_llm(prompt: str, model: str = None) -> str:
        return json.dumps({
            "nodes": [
                {"label": "sleep", "type": "concept", "span": [0, 5], "confidence": 0.95},
                {"label": "work", "type": "activity", "span": [20, 24], "confidence": 0.9}
            ],
            "edges": [
                {"source": "sleep", "target": "work", "type": "affects", "confidence": 0.9}
            ],
            "summary": "Sleep impacts work performance"
        })
    
    from backend.app.services import extractor
    monkeypatch.setattr(extractor, "call_local_llm", mock_call_local_llm)

def test_extract_from_text(mock_llm_response, temp_db):
    """Test full extraction from text."""
    from backend.app.services.extractor import extract_from_text
    from backend.app.db.db import insert_note
    
    note_id = insert_note("test.md", "Sleep affects work")
    
    result = extract_from_text("Sleep affects work", note_id)
    
    assert len(result["nodes"]) == 2
    assert len(result["edges"]) == 1
    assert result["summary"] == "Sleep impacts work performance"
    assert all(node["note_id"] == note_id for node in result["nodes"])

2. Update `docs/llm_prompting.md` with complete extraction prompt templates and examples (as shown in Task 3.1)

3. Update `docs/api-spec.md` with ingestion endpoints:

## Ingestion Endpoints

### POST /api/ingest/text

Ingest text content for processing.

**Request Body:**
{
  "filename": "daily-journal-2024-01-15.md",
  "content": "Today I realized that consistent sleep patterns directly impact my productivity...",
  "source_path": "/optional/path/to/file"
}

**Response:**
{
  "note_id": 42,
  "status": "accepted",
  "message": "Note saved and queued for processing"
}

**Process:**
1. Content is saved to SQLite `notes` table
2. Note hash is computed for deduplication
3. Background task is queued to run LLM extraction
4. Extraction results are stored in `extracts` table
5. Graph is updated with nodes and edges
6. Note is marked as processed

### POST /api/ingest/file

Upload markdown file(s) for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (UploadFile)
- Supported formats: `.md`, `.txt`, `.zip`

**Response:**
{
  "status": "accepted",
  "note_ids": [42, 43, 44],
  "message": "Ingested 3 file(s), processing started"
}

**Zip Archive Support:**
- Upload a `.zip` containing multiple markdown files
- All `.md` and `.txt` files within the archive are extracted
- Each file is processed as a separate note

### GET /api/ingest/status/{note_id}

Check processing status of an ingested note.

**Response:**
{
  "note_id": 42,
  "processed": true,
  "num_extracts": 1,
  "created_at": "2024-01-15T10:30:00"
}

4. Update `docs/cicd_devops.md` with LLM configuration:

## Local LLM Setup

### Ollama Installation (Recommended)

1. Install Ollama:
curl -fsSL https://ollama.com/install.sh | sh

2. Pull the required model:
ollama pull llama3

3. Start Ollama server (runs on http://localhost:11434):
ollama serve

4. Test the endpoint:
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Extract entities from: The AI revolution is changing software.",
  "stream": false
}'

### Alternative: Llama.cpp

If you prefer llama.cpp for lower-level control:

1. Clone and build:
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

2. Download model (e.g., Llama-3-8B GGUF):
# Download from HuggingFace or other source

3. Run server:
./server -m models/llama-3-8b-q4_0.gguf --port 11434

### Configuration

Update `backend/.env`:
LLM_ENDPOINT=http://localhost:11434/api/generate
LLM_MODEL=llama3
EMBEDDING_ENDPOINT=http://localhost:11434/api/embeddings
EMBEDDING_MODEL=all-minilm
EXTRACTION_TIMEOUT=300

**Deliverables**:
- `backend/app/services/extractor.py` with full extraction pipeline
- `backend/app/api/ingest.py` with ingestion endpoints
- `tests/backend/test_extractor.py` with unit tests
- Updated documentation in `/docs/`

**Completion Threshold**:
- [ ] Extraction function correctly parses LLM JSON output
- [ ] Mock-based tests pass: `pytest tests/backend/test_extractor.py`
- [ ] Manual test with local LLM: Ingest sample note and verify extraction in SQLite
- [ ] Graph is updated with nodes/edges after ingestion
- [ ] `POST /api/ingest/text` returns 200 with note_id
- [ ] Update `checklist.md` with Phase 3 completion
- [ ] Log LLM integration decisions in `decisions.md`

---

### Phase 4: Embeddings & Semantic Search

**Objective**: Implement local embeddings and vector-based semantic search.

**Pre-requisites**: Phases 1-3 complete

**Tasks**:

#### 4.1 Embeddings Service

1. Create `backend/app/services/embeddings.py`:

from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from pathlib import Path
from ..config import settings
import numpy as np

class EmbeddingStore:
    """Manages embeddings using sentence-transformers and ChromaDB."""
    
    def __init__(self):
        # Initialize sentence transformer model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=str(settings.vector_db_path)
        ))
        
        # Get or create collections
        self.notes_collection = self.chroma_client.get_or_create_collection(
            name="notes",
            metadata={"description": "Note embeddings"}
        )
        
        self.nodes_collection = self.chroma_client.get_or_create_collection(
            name="nodes",
            metadata={"description": "Node label embeddings"}
        )
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text."""
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    def index_note(self, note_id: int, content: str, metadata: Dict = None):
        """Index a note for semantic search."""
        embedding = self.embed_text(content)
        
        self.notes_collection.add(
            ids=[f"note:{note_id}"],
            embeddings=[embedding],
            documents=[content],
            metadatas=[metadata or {}]
        )
    
    def index_node(self, node_id: str, label: str, node_type: str, metadata: Dict = None):
        """Index a node for semantic search."""
        embedding = self.embed_text(label)
        
        self.nodes_collection.add(
            ids=[node_id],
            embeddings=[embedding],
            documents=[label],
            metadatas=metadata or {}
        )
    
    def search_notes(self, query: str, top_k: int = 10) -> List[Dict]:
        """
        Search notes by semantic similarity.
        
        Args:
            query: Search query
            top_k: Number of results to return
        
        Returns:
            List of results with note_id, content, and similarity score
        """
        query_embedding = self.embed_text(query)
        
        results = self.notes_collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        if not results['ids'] or not results['ids'][0]:
            return []
        
        output = []
        for i, note_ref in enumerate(results['ids'][0]):
            note_id = int(note_ref.split(':')[1])
            output.append({
                'note_id': note_id,
                'content': results['documents'][0][i],
                'score': 1 - results['distances'][0][i],  # Convert distance to similarity
                'metadata': results['metadatas'][0][i] if results['metadatas'] else {}
            })
        
        return output
    
    def search_nodes(self, query: str, top_k: int = 10) -> List[Dict]:
        """
        Search nodes by semantic similarity.
        
        Args:
            query: Search query
            top_k: Number of results to return
        
        Returns:
            List of results with node_id, label, and similarity score
        """
        query_embedding = self.embed_text(query)
        
        results = self.nodes_collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        if not results['ids'] or not results['ids'][0]:
            return []
        
        output = []
        for i, node_id in enumerate(results['ids'][0]):
            output.append({
                'node_id': node_id,
                'label': results['documents'][0][i],
                'score': 1 - results['distances'][0][i],
                'metadata': results['metadatas'][0][i] if results['metadatas'] else {}
            })
        
        return output
    
    def delete_note(self, note_id: int):
        """Remove note from index."""
        try:
            self.notes_collection.delete(ids=[f"note:{note_id}"])
        except:
            pass  # Note may not exist in index
    
    def delete_node(self, node_id: str):
        """Remove node from index."""
        try:
            self.nodes_collection.delete(ids=[node_id])
        except:
            pass  # Node may not exist in index

# Global instance
_embedding_store = None

def get_embedding_store() -> EmbeddingStore:
    """Get or create global embedding store instance."""
    global _embedding_store
    if _embedding_store is None:
        _embedding_store = EmbeddingStore()
    return _embedding_store

def init_embeddings():
    """Initialize embedding store on startup."""
    global _embedding_store
    settings.vector_db_path.mkdir(parents=True, exist_ok=True)
    _embedding_store = EmbeddingStore()

2. Update `backend/app/services/extractor.py` to index embeddings after extraction:

# Add this import at the top
from .embeddings import get_embedding_store

# Update the update_graph_from_extraction function to include embedding indexing
def update_graph_from_extraction(extraction: Dict, note_id: int, extraction_id: int):
    """
    Update NetworkX graph with extraction results.
    
    Args:
        extraction: Parsed extraction dict
        note_id: Source note ID
        extraction_id: Extract record ID
    """
    graph_store = get_graph_store()
    embedding_store = get_embedding_store()
    
    # Track created node IDs for edge creation
    node_label_to_id = {}
    
    # Add/update nodes
    for node_data in extraction["nodes"]:
        label = node_data["label"]
        node_id = generate_node_id(label)
        
        span_start, span_end = node_data["span"]
        provenance = [(note_id, span_start, span_end)]
        
        graph_store.add_node(
            node_id,
            label,
            node_data["type"],
            provenance=provenance,
            confidence=node_data["confidence"]
        )
        
        # Index node embedding
        embedding_store.index_node(
            node_id,
            label,
            node_data["type"],
            metadata={'confidence': node_data['confidence']}
        )
        
        node_label_to_id[label] = node_id
    
    # Add edges (existing code)
    for edge_data in extraction["edges"]:
        source_label = edge_data["source"]
        target_label = edge_data["target"]
        
        source_id = node_label_to_id.get(source_label, generate_node_id(source_label))
        target_id = node_label_to_id.get(target_label, generate_node_id(target_label))
        
        if not graph_store.graph.has_node(source_id) or not graph_store.graph.has_node(target_id):
            continue
        
        graph_store.add_edge(
            source_id,
            target_id,
            edge_data["type"],
            weight=edge_data["confidence"],
            extraction_id=extraction_id
        )
    
    # Save graph
    graph_store.save()

# Update process_note to index note embedding
def process_note(note_id: int) -> Dict:
    """
    Full extraction pipeline for a note.
    
    Args:
        note_id: Note to process
    
    Returns:
        Processing result with stats
    """
    # Get note content
    note = get_note(note_id)
    if not note:
        raise ValueError(f"Note {note_id} not found")
    
    if note['processed']:
        return {"status": "already_processed", "note_id": note_id}
    
    content = note['content']
    
    # Index note embedding
    embedding_store = get_embedding_store()
    embedding_store.index_note(
        note_id,
        content,
        metadata={'filename': note['filename'], 'created_at': note['created_at']}
    )
    
    # Extract (existing code continues...)
    try:
        extraction = extract_from_text(content, note_id)
    except Exception as e:
        return {
            "status": "extraction_failed",
            "note_id": note_id,
            "error": str(e)
        }
    
    # Store extract
    extraction_id = insert_extract(
        note_id,
        settings.llm_model,
        extraction,
        score=None
    )
    
    # Update graph
    try:
        update_graph_from_extraction(extraction, note_id, extraction_id)
    except Exception as e:
        return {
            "status": "graph_update_failed",
            "note_id": note_id,
            "extraction_id": extraction_id,
            "error": str(e)
        }
    
    # Mark as processed
    mark_note_processed(note_id)
    
    return {
        "status": "success",
        "note_id": note_id,
        "extraction_id": extraction_id,
        "nodes_extracted": len(extraction["nodes"]),
        "edges_extracted": len(extraction["edges"]),
        "summary": extraction.get("summary", "")
    }

3. Update `backend/app/main.py` to initialize embeddings:

@app.on_event("startup")
async def startup_event():
    init_database()
    from .services.graph_store import init_graph
    from .services.embeddings import init_embeddings
    init_graph()
    init_embeddings()

#### 4.2 Search API Implementation

1. Implement `backend/app/api/search.py`:

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Dict
from ..services.embeddings import get_embedding_store
from ..services.graph_store import get_graph_store
from ..db.db import get_note

router = APIRouter()

class SemanticSearchRequest(BaseModel):
    q: str
    top_k: int = 10
    search_type: str = "both"  # "notes", "nodes", or "both"

class SearchResult(BaseModel):
    type: str  # "note" or "node"
    id: str
    content: str
    score: float
    metadata: Dict = {}

@router.post("/semantic")
async def semantic_search(request: SemanticSearchRequest):
    """
    Semantic search across notes and/or nodes.
    
    Args:
        q: Search query
        top_k: Number of results to return
        search_type: Search scope ("notes", "nodes", or "both")
    
    Returns:
        Ranked list of results
    """
    embedding_store = get_embedding_store()
    results = []
    
    if request.search_type in ["notes", "both"]:
        note_results = embedding_store.search_notes(request.q, request.top_k)
        for r in note_results:
            results.append(SearchResult(
                type="note",
                id=str(r['note_id']),
                content=r['content'][:200] + "..." if len(r['content']) > 200 else r['content'],
                score=r['score'],
                metadata=r['metadata']
            ))
    
    if request.search_type in ["nodes", "both"]:
        node_results = embedding_store.search_nodes(request.q, request.top_k)
        graph_store = get_graph_store()
        
        for r in node_results:
            node = graph_store.get_node(r['node_id'])
            if node:
                results.append(SearchResult(
                    type="node",
                    id=r['node_id'],
                    content=r['label'],
                    score=r['score'],
                    metadata={
                        'node_type': node.get('type'),
                        'provenance_count': len(node.get('provenance', []))
                    }
                ))
    
    # Sort by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    
    # Limit to top_k
    results = results[:request.top_k]
    
    return {
        "query": request.q,
        "results": [r.dict() for r in results],
        "total": len(results)
    }

@router.get("/related/{node_id}")
async def get_related_nodes(
    node_id: str,
    top_k: int = Query(5, description="Number of related nodes to return")
):
    """
    Find semantically related nodes.
    
    Uses the node label as query to find similar nodes.
    """
    graph_store = get_graph_store()
    embedding_store = get_embedding_store()
    
    node = graph_store.get_node(node_id)
    if not node:
        return {"error": "Node not found"}
    
    # Search for similar nodes using label
    similar_nodes = embedding_store.search_nodes(node['label'], top_k + 1)
    
    # Filter out the query node itself
    similar_nodes = [n for n in similar_nodes if n['node_id'] != node_id][:top_k]
    
    return {
        "source_node": node_id,
        "related_nodes": similar_nodes
    }

#### 4.3 Testing & Documentation

1. Create `tests/backend/test_embeddings.py`:

import pytest
from backend.app.services.embeddings import EmbeddingStore
import tempfile
from pathlib import Path
import shutil

@pytest.fixture
def temp_embedding_store():
    """Create temporary embedding store."""
    temp_dir = Path(tempfile.mkdtemp())
    
    # Mock settings
    from backend.app import config
    original_path = config.settings.vector_db_path
    config.settings.vector_db_path = temp_dir
    
    store = EmbeddingStore()
    
    yield store
    
    # Cleanup
    shutil.rmtree(temp_dir)
    config.settings.vector_db_path = original_path

def test_embed_text(temp_embedding_store):
    """Test text embedding generation."""
    embedding = temp_embedding_store.embed_text("test content")
    
    assert isinstance(embedding, list)
    assert len(embedding) == 384  # all-MiniLM-L6-v2 dimension
    assert all(isinstance(x, float) for x in embedding)

def test_index_and_search_notes(temp_embedding_store):
    """Test note indexing and search."""
    # Index notes
    temp_embedding_store.index_note(1, "Machine learning is transforming AI")
    temp_embedding_store.index_note(2, "I love cooking pasta with fresh tomatoes")
    temp_embedding_store.index_note(3, "Neural networks and deep learning")
    
    # Search
    results = temp_embedding_store.search_notes("artificial intelligence", top_k=2)
    
    assert len(results) <= 2
    assert results[0]['note_id'] in [1, 3]  # Should match AI-related notes
    assert 'score' in results[0]

def test_index_and_search_nodes(temp_embedding_store):
    """Test node indexing and search."""
    # Index nodes
    temp_embedding_store.index_node("node:1", "machine learning", "concept")
    temp_embedding_store.index_node("node:2", "pasta", "concept")
    temp_embedding_store.index_node("node:3", "deep learning", "concept")
    
    # Search
    results = temp_embedding_store.search_nodes("AI algorithms", top_k=2)
    
    assert len(results) <= 2
    # Should prioritize ML-related nodes
    top_result_label = results[0]['label'].lower()
    assert any(term in top_result_label for term in ['machine', 'learning', 'deep'])

def test_delete_note(temp_embedding_store):
    """Test note deletion from index."""
    temp_embedding_store.index_note(1, "test content")
    
    # Verify indexed
    results = temp_embedding_store.search_notes("test", top_k=5)
    assert any(r['note_id'] == 1 for r in results)
    
    # Delete
    temp_embedding_store.delete_note(1)
    
    # Verify removed
    results = temp_embedding_store.search_notes("test", top_k=5)
    assert not any(r['note_id'] == 1 for r in results)

2. Update `docs/architecture.md` with embeddings architecture:

## Embeddings & Vector Search

### Architecture

The system uses a two-tier embedding strategy:

1. **Note Embeddings**: Full note content is embedded for semantic document search
2. **Node Embeddings**: Individual node labels are embedded for entity-level search

### Technology Stack

- **Embedding Model**: sentence-transformers (`all-MiniLM-L6-v2`)
  - Dimension: 384
  - Fast inference on CPU
  - Good balance of speed and quality
  
- **Vector Store**: ChromaDB with DuckDB+Parquet backend
  - Persistent local storage
  - Efficient similarity search
  - No external dependencies

### Workflow

[New Note] → [Extract Text] → [Generate Embedding] → [Index in ChromaDB]
                                                            ↓
[User Query] → [Generate Query Embedding] → [Similarity Search] → [Ranked Results]

### Search Process

1. User submits search query
2. Query is embedded using same model
3. Vector similarity (cosine) computed against indexed vectors
4. Results ranked by similarity score (0-1)
5. Top-k results returned with metadata

### Performance Considerations

- Embedding generation: ~50ms per note on CPU
- Search latency: <100ms for 10k vectors
- Index persistence: Automatic on collection update

3. Update `docs/api-spec.md` with search endpoints:

## Search Endpoints

### POST /api/search/semantic

Semantic search across notes and/or nodes.

**Request Body:**
{
  "q": "how does sleep affect productivity",
  "top_k": 10,
  "search_type": "both"
}

**Parameters:**
- `q`: Search query (required)
- `top_k`: Number of results (default: 10)
- `search_type`: Scope - "notes", "nodes", or "both" (default: "both")

**Response:**
{
  "query": "how does sleep affect productivity",
  "results": [
    {
      "type": "node",
      "id": "node:sleep_quality_a3f9e2b1",
      "content": "sleep quality",
      "score": 0.92,
      "metadata": {
        "node_type": "concept",
        "provenance_count": 3
      }
    },
    {
      "type": "note",
      "id": "42",
      "content": "I've noticed that when I sleep poorly, my work performance drops significantly...",
      "score": 0.88,
      "metadata": {
        "filename": "journal-2024-01-15.md",
        "created_at": "2024-01-15T10:30:00"
      }
    }
  ],
  "total": 2
}

### GET /api/search/related/{node_id}

Find semantically related nodes.

**Parameters:**
- `node_id`: Source node ID
- `top_k`: Number of results (default: 5)

**Response:**
{
  "source_node": "node:sleep_quality_a3f9e2b1",
  "related_nodes": [
    {
      "node_id": "node:rest_patterns_b2c4d5e6",
      "label": "rest patterns",
      "score": 0.89
    },
    {
      "node_id": "node:circadian_rhythm_c3d4e5f6",
      "label": "circadian rhythm",
      "score": 0.85
    }
  ]
}

**Deliverables**:
- `backend/app/services/embeddings.py` with full embedding functionality
- Updated `backend/app/services/extractor.py` to index embeddings
- `backend/app/api/search.py` with semantic search endpoints
- `tests/backend/test_embeddings.py` with unit tests
- Updated documentation

**Completion Threshold**:
- [ ] Embeddings are generated for notes and nodes during ingestion
- [ ] Semantic search returns relevant results: `pytest tests/backend/test_embeddings.py`
- [ ] `POST /api/search/semantic` returns ranked results
- [ ] Vector store persists across application restarts
- [ ] Update `checklist.md` with Phase 4 completion
- [ ] Log embedding strategy in `decisions.md`

---

### Phase 5: Frontend Setup & Graph Visualization

**Objective**: Create Next.js frontend with interactive graph visualization.

**Pre-requisites**: Phases 1-4 complete (backend functional)

**Tasks**:

#### 5.1 Next.js Project Setup

1. Initialize Next.js project:

cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

2. Install dependencies:

npm install cytoscape react-cytoscapejs axios react-query @tanstack/react-query
npm install -D @types/cytoscape

3. Create `frontend/next.config.js`:

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

4. Create `frontend/lib/api.ts`:

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Node {
  id: string;
  label: string;
  type: string;
  provenance: [number, number, number][];
  confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface Edge {
  source: string;
  target: string;
  type: string;
  weight: number;
  extraction_id?: number;
  created_at: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface SearchResult {
  type: 'note' | 'node';
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

// Graph API
export const graphAPI = {
  getGraph: async (nodeId?: string, depth?: number): Promise<GraphData> => {
    const params = new URLSearchParams();
    if (nodeId) params.append('node_id', nodeId);
    if (depth) params.append('depth', depth.toString());
    
    const response = await api.get(`/api/graph?${params.toString()}`);
    return response.data;
  },
  
  getNode: async (nodeId: string): Promise<Node> => {
    const response = await api.get(`/api/graph/node/${nodeId}`);
    return response.data;
  },
  
  createNode: async (node: Partial<Node>): Promise<{ node_id: string }> => {
    const response = await api.post('/api/graph/node', node);
    return response.data;
  },
  
  createEdge: async (edge: Partial<Edge>): Promise<{ status: string }> => {
    const response = await api.post('/api/graph/edge', edge);
    return response.data;
  },
  
  getStats: async (): Promise<any> => {
    const response = await api.get('/api/graph/stats');
    return response.data;
  },
};

// Search API
export const searchAPI = {
  semantic: async (query: string, topK: number = 10, searchType: string = 'both'): Promise<SearchResult[]> => {
    const response = await api.post('/api/search/semantic', {
      q: query,
      top_k: topK,
      search_type: searchType,
    });
    return response.data.results;
  },
  
  related: async (nodeId: string, topK: number = 5): Promise<any> => {
    const response = await api.get(`/api/search/related/${nodeId}?top_k=${topK}`);
    return response.data;
  },
};

// Ingestion API
export const ingestAPI = {
  ingestText: async (filename: string, content: string): Promise<{ note_id: number }> => {
    const response = await api.post('/api/ingest/text', {
      filename,
      content,
    });
    return response.data;
  },
  
  ingestFile: async (file: File): Promise<{ note_ids: number[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/ingest/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getStatus: async (noteId: number): Promise<any> => {
    const response = await api.get(`/api/ingest/status/${noteId}`);
    return response.data;
  },
};

export default api;

#### 5.2 Graph Visualization Component

1. Create `frontend/components/GraphCanvas.tsx`:

'use client';

import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import { GraphData, Node } from '@/lib/api';

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  selectedNodeId?: string;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  data,
  onNodeClick,
  onNodeDoubleClick,
  selectedNodeId,
}) => {
  const cyRef = useRef<Cytoscape.Core | null>(null);
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    // Convert GraphData to Cytoscape elements
    const nodes = data.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        confidence: node.confidence || 1,
        provenanceCount: node.provenance?.length || 0,
      },
    }));

    const edges = data.edges.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        label: edge.type,
        weight: edge.weight,
      },
    }));

    setElements([...nodes, ...edges]);
  }, [data]);

  useEffect(() => {
    if (cyRef.current && selectedNodeId) {
      // Highlight selected node
      cyRef.current.nodes().removeClass('selected');
      cyRef.current.getElementById(selectedNodeId).addClass('selected');
    }
  }, [selectedNodeId]);

  const stylesheet: Cytoscape.Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => {
          const type = ele.data('type');
          const colors: Record<string, string> = {
            concept: '#3b82f6',
            person: '#10b981',
            place: '#f59e0b',
            idea: '#8b5cf6',
            event: '#ef4444',
            passage: '#6b7280',
          };
          return colors[type] || '#9ca3af';
        },
        'label': 'data(label)',
        'width': (ele: any) => {
          const provCount = ele.data('provenanceCount') || 1;
          return Math.min(20 + provCount * 5, 60);
        },
        'height': (ele: any) => {
          const provCount = ele.data('provenanceCount') || 1;
          return Math.min(20 + provCount * 5, 60);
        },
        'font-size': '12px',
        'color': '#fff',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
      },
    },
    {
      selector: 'node.selected',
      style: {
        'border-width': 3,
        'border-color': '#fbbf24',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': (ele: any) => {
          const weight = ele.data('weight') || 0.5;
          return 1 + weight * 3;
        },
        'line-color': '#cbd5e1',
        'target-arrow-color': '#cbd5e1',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'text-margin-y': -10,
      },
    },
  ];

  const layout = {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    edgeElasticity: 100,
    nestingFactor: 1.2,
  };

  const handleCyReady = (cy: Cytoscape.Core) => {
    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = data.nodes.find((n) => n.id === node.id());
      if (nodeData && onNodeClick) {
        onNodeClick(nodeData);
      }
    });

    // Node double-click handler
    cy.on('dbltap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = data.nodes.find((n) => n.id === node.id());
      if (nodeData && onNodeDoubleClick) {
        onNodeDoubleClick(nodeData);
      }
    });
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {elements.length > 0 ? (
        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          cy={handleCyReady}
          zoom={1}
          pan={{ x: 0, y: 0 }}
          minZoom={0.3}
          maxZoom={3}
          wheelSensitivity={0.2}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No graph data available. Ingest some notes to get started.
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;

2. Create `frontend/components/NodeDetailsPanel.tsx`:

'use client';

import React, { useEffect, useState } from 'react';
import { Node, graphAPI } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NodeDetailsPanelProps {
  nodeId: string;
  onClose: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeId, onClose }) => {
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNode = async () => {
      try {
        setLoading(true);
        const nodeData = await graphAPI.getNode(nodeId);
        setNode(nodeData);
        setError(null);
      } catch (err) {
        setError('Failed to load node details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="w-96 bg-gray-800 text-white p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="w-96 bg-gray-800 text-white p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-red-400">Error</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p>{error || 'Node not found'}</p>
      </div>
    );
  }

  return (
    <div className="w-96 bg-gray-800 text-white p-6 shadow-lg overflow-y-auto max-h-screen">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{node.label}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Node Type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Type</h3>
          <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm">
            {node.type}
          </span>
        </div>

        {/* Confidence */}
        {node.confidence && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Confidence</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${node.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm">{(node.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Provenance */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
            Provenance ({node.provenance?.length || 0} sources)
          </h3>
          {node.provenance && node.provenance.length > 0 ? (
            <div className="space-y-2">
              {node.provenance.map((prov, idx) => (
                <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Note ID: {prov[0]}</span>
                    <span>Span: {prov[1]}-{prov[2]}</span>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 text-xs"
                    onClick={() => {
                      // TODO: Navigate to note or show excerpt
                      console.log('View note:', prov[0]);
                    }}
                  >
                    View source →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No provenance data available</p>
          )}
        </div>

        {/* Metadata */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Metadata</h3>
          <div className="bg-gray-700 p-3 rounded text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">ID:</span>
              <span className="font-mono">{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span>{new Date(node.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated:</span>
              <span>{new Date(node.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-700">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2">
            Edit Node
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">
            Find Related
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;

#### 5.3 Graph Page Implementation

1. Create `frontend/app/graph/page.tsx`:

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import GraphCanvas from '@/components/GraphCanvas';
import NodeDetailsPanel from '@/components/NodeDetailsPanel';
import { graphAPI, GraphData, Node } from '@/lib/api';

export default function GraphPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const { data: graphData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['graph'],
    queryFn: () => graphAPI.getGraph(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleNodeClick = (node: Node) => {
    setSelectedNodeId(node.id);
  };

  const handleNodeDoubleClick = (node: Node) => {
    setSelectedNodeId(node.id);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-400 text-xl">Error loading graph</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Graph Area */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold mb-2">Mind Map AI</h1>
          <div className="text-sm text-gray-400">
            <p>Nodes: {graphData?.nodes.length || 0}</p>
            <p>Edges: {graphData?.edges.length || 0}</p>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-gray-800 text-white p-2 rounded-lg shadow-lg">
          <div className="text-xs space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Concept</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Person</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Place</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Idea</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Event</span>
            </div>
          </div>
        </div>

        {graphData && (
          <GraphCanvas
            data={graphData}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            selectedNodeId={selectedNodeId || undefined}
          />
        )}
      </div>

      {/* Side Panel */}
      {showPanel && selectedNodeId && (
        <div className="border-l border-gray-700">
          <NodeDetailsPanel nodeId={selectedNodeId} onClose={handleClosePanel} />
        </div>
      )}
    </div>
  );
}

2. Create `frontend/app/layout.tsx`:

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mind Map AI - Personal Knowledge Graph',
  description: 'Local LLM-powered knowledge graph for personal notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

3. Create `frontend/app/providers.tsx`:

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

#### 5.4 Testing & Documentation

1. Update `docs/design_system.md`:

# Frontend Design System

## Visual Design Principles

### Color Palette

**Node Colors (by type):**
- Concept: `#3b82f6` (Blue)
- Person: `#10b981` (Green)
- Place: `#f59e0b` (Amber)
- Idea: `#8b5cf6` (Purple)
- Event: `#ef4444` (Red)
- Passage: `#6b7280` (Gray)

**UI Colors:**
- Background: `#111827` (Gray-900)
- Panel: `#1f2937` (Gray-800)
- Accent: `#fbbf24` (Yellow-400)
- Text Primary: `#ffffff`
- Text Secondary: `#9ca3af` (Gray-400)

### Visualization Cues

**Node Size:**
- Based on provenance count (number of source references)
- Formula: `min(20 + provenance_count * 5, 60)` pixels
- Larger nodes indicate concepts mentioned across multiple notes

**Edge Thickness:**
- Based on confidence weight (0-1)
- Formula: `1 + weight * 3` pixels
- Thicker edges indicate stronger relationships

**Node Selection:**
- Selected nodes have yellow (`#fbbf24`) border, 3px width
- Click to select, double-click to open details panel

### Layout Algorithm

**Graph Layout: COSE (Compound Spring Embedder)**
- Organic, force-directed layout
- Parameters:
  - Node repulsion: 8000
  - Ideal edge length: 100
  - Edge elasticity: 100
  - Animation duration: 500ms

### Interactions

**Primary Interactions:**
1. **Single Click Node**: Select node, highlight in graph
2. **Double Click Node**: Open NodeDetailsPanel with provenance
3. **Pan**: Click and drag on background
4. **Zoom**: Mouse wheel or pinch gesture
5. **Hover Node**: Show tooltip with label and type

**NodeDetailsPanel:**
- Slides in from right side
- Shows: Type, confidence, provenance list, metadata
- Actions: Edit node, find related nodes, view source notes

### Responsive Design

**Breakpoints:**
- Desktop: > 1024px (full graph + side panel)
- Tablet: 768-1024px (graph only, panel as overlay)
- Mobile: < 768px (not prioritized in Phase 5)

### Accessibility

- Keyboard navigation: Tab through nodes
- ARIA labels on interactive elements
- Sufficient color contrast (WCAG AA)
- Screen reader support for node metadata

## Component Structure

GraphPage
├── GraphCanvas (Cytoscape visualization)
│   ├── Node rendering
│   ├── Edge rendering
│   └── Event handlers
└── NodeDetailsPanel (Side panel)
    ├── Node metadata
    ├── Provenance list
    └── Action buttons

2. Update `docs/testing.md` with frontend testing strategy:

## Frontend Testing

### Component Testing (React Testing Library)

Test coverage for:
- GraphCanvas render with sample data
- NodeDetailsPanel data display
- User interactions (click, double-click)
- Loading and error states

### E2E Testing (Playwright - Future Phase)

Critical user flows:
1. Load graph page → View graph → Click node → View details
2. Search for node → Select from results → Navigate to graph
3. Upload note → Wait for processing → Verify graph updated

**Deliverables**:
- Complete Next.js frontend setup
- `GraphCanvas` component with Cytoscape integration
- `NodeDetailsPanel` with provenance display
- `/graph` page with full visualization
- API client library (`lib/api.ts`)
- Updated documentation

**Completion Threshold**:
- [ ] Frontend runs: `npm run dev` on port 3000
- [ ] Graph page loads and displays empty state
- [ ] Sample graph data (manually added via API) renders correctly
- [ ] Node click and double-click handlers work
- [ ] NodeDetailsPanel displays node metadata and provenance
- [ ] Update `checklist.md` with Phase 5 completion
- [ ] Log frontend architecture in `decisions.md`

---

### Phase 6: Note Upload & Integration Testing

**Objective**: Complete note ingestion UI and run end-to-end integration tests.

**Pre-requisites**: Phases 1-5 complete

**Tasks**:

#### 6.1 Note Upload Component

1. Create `frontend/components/NoteUploader.tsx`:

'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ingestAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NoteUploader: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => ingestAPI.ingestFile(file),
    onSuccess: (data) => {
      setUploadStatus(`Successfully uploaded ${data.note_ids.length} note(s)`);
      // Invalidate graph query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
    onError: (error) => {
      setUploadStatus(`Upload failed: ${error}`);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadStatus(`Uploading ${file.name}...`);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Drag & drop a markdown file or zip archive here
            </p>
            <p className="text-sm text-gray-500">
              or click to select file
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Supported: .md, .txt, .zip
            </p>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">{uploadStatus}</p>
        </div>
      )}

      {uploadMutation.isLoading && (
        <div className="mt-4">
          <div className="animate-pulse flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteUploader;

2. Create `frontend/app/page.tsx` (Dashboard):

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphAPI } from '@/lib/api';
import NoteUploader from '@/components/NoteUploader';
import Link from 'next/link';

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['graph-stats'],
    queryFn: () => graphAPI.getStats(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Mind Map AI</h1>
          <p className="text-sm text-gray-600 mt-1">
            Your personal knowledge graph, powered by local LLM
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Nodes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.num_nodes || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Edges</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.num_edges || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Density</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.density?.toFixed(3) || '0.000'}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Upload Notes
          </h2>
          <NoteUploader />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/graph"
            className="block p-6 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <h3 className="text-xl font-bold mb-2">Explore Graph</h3>
            <p className="text-blue-100">
              Visualize and interact with your knowledge graph
            </p>
          </Link>
          
          <Link
            href="/search"
            className="block p-6 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            <h3 className="text-xl font-bold mb-2">Semantic Search</h3>
            <p className="text-purple-100">
              Find related concepts and notes
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

3. Install additional dependency:

cd frontend
npm install react-dropzone

#### 6.2 Integration Testing

1. Create sample test data in `data/notes/`:

mkdir -p data/notes

2. Create `data/notes/sample1.md`:

# Daily Journal - January 15, 2024

I've been thinking a lot about productivity and how sleep affects my work. When I don't get enough rest, my focus drops significantly. I've noticed that exercise helps improve both my sleep quality and energy levels during the day.

Key takeaways:
- Better sleep leads to better productivity
- Regular exercise improves sleep
- Morning routines set the tone for the entire day

3. Create `data/notes/sample2.md`:

# Artificial Intelligence Research Notes

Machine learning and deep learning are transforming software development. Neural networks can now generate code, detect bugs, and optimize performance. The recent advances in large language models like GPT and Claude have made AI assistants incredibly useful for developers.

Important concepts:
- Neural networks process information in layers
- Transformers use attention mechanisms
- Fine-tuning adapts models to specific tasks

4. Create `data/notes/sample3.md`:

# Project Planning - Mind Map AI

Building a local knowledge graph system that extracts entities and relationships from personal notes. The system uses NetworkX for graph storage and a local LLM for extraction.

Technical decisions:
- FastAPI for backend REST API
- SQLite for provenance tracking
- Cytoscape.js for visualization
- Sentence transformers for semantic search

The goal is complete local operation with no cloud dependencies.

5. Create `tests/integration/test_full_pipeline.py`:

import pytest
import requests
import time
from pathlib import Path

API_BASE = "http://localhost:8000"

def test_health_check():
    """Test API health endpoint."""
    response = requests.get(f"{API_BASE}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_ingestion_pipeline():
    """
    Integration test: Ingest sample notes and verify graph creation.
    
    This test validates the complete pipeline:
    1. Upload markdown file
    2. Wait for processing
    3. Verify nodes and edges created
    4. Check graph statistics
    """
    # Read sample note
    sample_path = Path(__file__).parent.parent.parent / "data" / "notes" / "sample1.md"
    
    with open(sample_path, 'r') as f:
        content = f.read()
    
    # Ingest text
    response = requests.post(
        f"{API_BASE}/api/ingest/text",
        json={
            "filename": "sample1.md",
            "content": content
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    note_id = data["note_id"]
    
    # Poll for processing completion
    max_attempts = 30
    for attempt in range(max_attempts):
        status_response = requests.get(f"{API_BASE}/api/ingest/status/{note_id}")
        status_data = status_response.json()
        
        if status_data["processed"]:
            break
        
        time.sleep(2)
    else:
        pytest.fail("Processing timed out after 60 seconds")
    
    # Verify graph updated
    graph_response = requests.get(f"{API_BASE}/api/graph")
    assert graph_response.status_code == 200
    graph_data = graph_response.json()
    
    assert len(graph_data["nodes"]) > 0, "No nodes created from extraction"
    assert len(graph_data["edges"]) >= 0, "Graph should have edges or be valid without them"
    
    # Verify node types
    node_types = [node["type"] for node in graph_data["nodes"]]
    valid_types = {"concept", "person", "place", "idea", "event", "passage"}
    assert all(t in valid_types for t in node_types), f"Invalid node types: {node_types}"
    
    # Verify provenance exists
    for node in graph_data["nodes"]:
        assert "provenance" in node, f"Node {node['id']} missing provenance"
        assert len(node["provenance"]) > 0, f"Node {node['id']} has empty provenance"

def test_semantic_search():
    """Test semantic search functionality."""
    # Ensure some data exists
    graph_response = requests.get(f"{API_BASE}/api/graph")
    graph_data = graph_response.json()
    
    if len(graph_data["nodes"]) == 0:
        pytest.skip("No graph data available for search test")
    
    # Perform search
    search_response = requests.post(
        f"{API_BASE}/api/search/semantic",
        json={
            "q": "productivity and sleep",
            "top_k": 5,
            "search_type": "both"
        }
    )
    
    assert search_response.status_code == 200
    search_data = search_response.json()
    
    assert "results" in search_data
    assert isinstance(search_data["results"], list)
    
    # Verify result structure
    for result in search_data["results"]:
        assert "type" in result
        assert result["type"] in ["note", "node"]
        assert "score" in result
        assert 0 <= result["score"] <= 1

def test_graph_export():
    """Test graph export functionality."""
    # Export as GraphML
    export_response = requests.get(f"{API_BASE}/api/export?format=graphml")
    assert export_response.status_code == 200
    assert len(export_response.content) > 0
    
    # Verify GraphML content
    content = export_response.content.decode('utf-8')
    assert '<?xml' in content
    assert '<graphml' in content

def test_full_batch_ingestion():
    """
    Test batch ingestion of all sample notes.
    
    This is the acceptance test from Phase 2.
    """
    notes_dir = Path(__file__).parent.parent.parent / "data" / "notes"
    
    if not notes_dir.exists():
        pytest.skip("Sample notes directory not found")
    
    note_ids = []
    
    # Ingest all markdown files
    for md_file in notes_dir.glob("*.md"):
        with open(md_file, 'r') as f:
            content = f.read()
        
        response = requests.post(
            f"{API_BASE}/api/ingest/text",
            json={
                "filename": md_file.name,
                "content": content
            }
        )
        
        assert response.status_code == 200
        note_ids.append(response.json()["note_id"])
    
    # Wait for all processing to complete
    max_wait = 120  # 2 minutes
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        all_processed = True
        
        for note_id in note_ids:
            status_response = requests.get(f"{API_BASE}/api/ingest/status/{note_id}")
            if not status_response.json()["processed"]:
                all_processed = False
                break
        
        if all_processed:
            break
        
        time.sleep(3)
    else:
        pytest.fail("Batch processing timed out")
    
    # Get final graph stats
    stats_response = requests.get(f"{API_BASE}/api/graph/stats")
    stats = stats_response.json()
    
    # Acceptance criteria
    assert stats["num_nodes"] > 0, "No nodes created from sample notes"
    assert stats["num_edges"] >= 0, "Invalid edge count"
    
    print(f"\n✓ Successfully ingested {len(note_ids)} notes")
    print(f"✓ Created {stats['num_nodes']} nodes")
    print(f"✓ Created {stats['num_edges']} edges")
    
    # Export and verify provenance
    export_response = requests.get(f"{API_BASE}/api/export?format=graphml")
    assert export_response.status_code == 200
    
    export_content = export_response.content.decode('utf-8')
    assert 'provenance' in export_content, "Exported graph missing provenance data"
    
    print("✓ Exported graph contains provenance data")

6. Create pytest configuration `pytest.ini` in project root:

[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short

#### 6.3 Run Integration Tests

1. Update `docs/testing.md` with integration test instructions:

## Integration Testing

### Setup

1. Ensure backend is running:
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

2. Ensure local LLM is running (Ollama):
ollama serve

3. Run integration tests:
pytest tests/integration/test_full_pipeline.py -v

### Acceptance Tests

#### Test 1: Sample Notes Ingestion

**Objective**: Verify complete pipeline from ingestion to graph creation.

**Steps**:
1. Ingest all files from `data/notes/`
2. Wait for processing completion
3. Verify graph contains nodes (N > 0) and edges (M ≥ 0)

**Success Criteria**:
- All notes marked as processed
- Graph contains extracted nodes
- Each node has provenance data

#### Test 2: Provenance Verification

**Objective**: Ensure exported graph contains full provenance.

**Steps**:
1. Export graph as GraphML
2. Parse and verify structure
3. Check for provenance attributes on nodes

**Success Criteria**:
- Export completes successfully
- GraphML contains valid XML
- At least one node has provenance attribute with source reference

### Manual Testing Checklist

- [ ] Upload single markdown file via frontend
- [ ] Verify note appears in database: `sqlite3 data/mindmap.db "SELECT * FROM notes;"`
- [ ] Verify extraction in database: `sqlite3 data/mindmap.db "SELECT * FROM extracts;"`
- [ ] Navigate to `/graph` page and verify visualization
- [ ] Click node and verify details panel opens
- [ ] Perform semantic search and verify results
- [ ] Export graph and verify file downloads

**Deliverables**:
- `NoteUploader` component with drag-and-drop
- Dashboard page with stats and upload UI
- Sample test data in `data/notes/`
- Integration test suite in `tests/integration/`
- Updated testing documentation

**Completion Threshold**:
- [ ] Frontend upload UI functional
- [ ] Sample notes can be uploaded via UI
- [ ] Integration tests pass: `pytest tests/integration/test_full_pipeline.py`
- [ ] **Acceptance Test 1**: Ingest sample notes → N nodes and M edges created
- [ ] **Acceptance Test 2**: Export graph → Contains provenance data
- [ ] Manual verification: Upload note → See graph update in real-time
- [ ] Update `checklist.md` with Phase 6 completion
- [ ] Log integration testing results in `decisions.md`

---

### Phase 7: Security & Deployment

**Objective**: Apply security best practices and prepare for deployment.

**Pre-requisites**: Phases 1-6 complete

**Tasks**:

#### 7.1 Security Implementation

1. Update `backend/app/config.py` with security settings:

from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # LLM Configuration
    llm_endpoint: str = "http://localhost:11434/api/generate"
    llm_model: str = "llama3"
    embedding_endpoint: str = "http://localhost:11434/api/embeddings"
    embedding_model: str = "all-minilm"
    
    # Database Paths
    db_path: Path = Path(__file__).parent.parent.parent / "data" / "mindmap.db"
    graph_path: Path = Path(__file__).parent.parent.parent / "data" / "graph.gpickle"
    vector_db_path: Path = Path(__file__).parent.parent.parent / "data" / "vectors"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list = ["http://localhost:3000"]
    
    # Security
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: set = {".md", ".txt"}
    disable_external_llm: bool = True  # Force local-only operation
    
    # Processing Configuration
    max_batch_size: int = 10
    extraction_timeout: int = 300
    
    class Config:
        env_file = ".env"

settings = Settings()

2. Add input validation to ingestion endpoints in `backend/app/api/ingest.py`:

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel, validator
from typing import List
from ..db.db import insert_note
from ..services.extractor import process_note
from ..config import settings
import zipfile
import io

router = APIRouter()

class IngestTextRequest(BaseModel):
    filename: str
    content: str
    source_path: str = None
    
    @validator('filename')
    def validate_filename(cls, v):
        """Validate filename extension."""
        if not any(v.endswith(ext) for ext in settings.allowed_extensions):
            raise ValueError(f"Invalid file extension. Allowed: {settings.allowed_extensions}")
        return v
    
    @validator('content')
    def validate_content_length(cls, v):
        """Validate content size."""
        if len(v.encode('utf-8')) > settings.max_upload_size:
            raise ValueError(f"Content exceeds maximum size of {settings.max_upload_size} bytes")
        return v

# ... rest of the endpoints remain the same but with validation

3. Add rate limiting middleware in `backend/app/main.py`:

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .config import settings
from .db.db import init_database
from .api import ingest, graph, search

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Mind Map AI",
    description="Local LLM-powered personal knowledge graph",
    version="0.1.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    from .services.graph_store import init_graph
    from .services.embeddings import init_embeddings
    init_graph()
    init_embeddings()

# Include routers
app.include_router(ingest.router, prefix="/api/ingest", tags=["ingestion"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Mind Map AI API", "version": "0.1.0"}

@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    return {"status": "healthy"}

4. Install security dependency:

cd backend
pip install slowapi
pip freeze > requirements.txt

5. Update `docs/security.md`:

# Security Best Practices

## Local-Only Architecture

**Critical Constraint**: The system operates entirely locally by default.

### Configuration

- `DISABLE_EXTERNAL_LLM=true` prevents any external LLM API calls
- LLM endpoint must be localhost or explicitly whitelisted
- All data (notes, graph, vectors) stored locally in `data/` directory

### Input Validation

**File Upload:**
- Maximum size: 10MB (configurable via `MAX_UPLOAD_SIZE`)
- Allowed extensions: `.md`, `.txt`, `.zip`
- Filename sanitization prevents path traversal

**Text Ingestion:**
- Content size validation
- UTF-8 encoding enforcement
- SQL injection prevention via parameterized queries

### Rate Limiting

- Health endpoint: 10 requests/minute per IP
- Ingestion endpoints: 5 requests/minute per IP
- Search endpoints: 20 requests/minute per IP

### Data Security

**SQLite Database:**
- File permissions: 600 (owner read/write only)
- No remote access
- Regular backups recommended

**Graph & Vector Store:**
- Persistent files in `data/` directory
- No network exposure
- Access controlled via filesystem permissions

### API Security

**CORS:**
- Restricted to `http://localhost:3000` by default
- Configure `CORS_ORIGINS` for additional allowed origins

**Headers:**
- No sensitive data in headers
- Standard security headers applied

### Threat Model

**In Scope:**
- Local file access control
- Input validation and sanitization
- Resource exhaustion (rate limiting)

**Out of Scope:**
- Authentication (single-user system)
- Network-based attacks (local-only)
- Encryption at rest (relies on OS-level encryption)

### Recommended Deployment Practices

1. Run backend and frontend on localhost only
2. Use OS-level firewall to block external access
3. Enable disk encryption for `data/` directory
4. Regularly backup graph and database files
5. Keep dependencies updated for security patches

### Security Checklist

- [ ] `DISABLE_EXTERNAL_LLM=true` in configuration
- [ ] File upload size limits enforced
- [ ] Rate limiting active on all endpoints
- [ ] CORS restricted to known origins
- [ ] Database file permissions set to 600
- [ ] No sensitive data logged
- [ ] Dependencies scanned for vulnerabilities

#### 7.2 Docker Configuration

1. Create `backend/Dockerfile`:

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DB_PATH=/data/mindmap.db
ENV GRAPH_PATH=/data/graph.gpickle
ENV VECTOR_DB_PATH=/data/vectors

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

2. Create `frontend/Dockerfile`:

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Run application
CMD ["npm", "start"]

3. Create `docker-compose.yml` in project root:

version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/data
    environment:
      - LLM_ENDPOINT=http://host.docker.internal:11434/api/generate
      - DB_PATH=/data/mindmap.db
      - GRAPH_PATH=/data/graph.gpickle
      - VECTOR_DB_PATH=/data/vectors
    networks:
      - mindmap

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - mindmap

networks:
  mindmap:
    driver: bridge

volumes:
  data:

4. Create `.dockerignore` in backend and frontend:

**backend/.dockerignore**:
__pycache__/
*.pyc
.venv/
.env
*.db
*.gpickle
vectors/

**frontend/.dockerignore**:
node_modules/
.next/
.env.local

5. Update `docs/cicd_devops.md`:

# CI/CD & DevOps

## Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama (or alternative local LLM runtime)

### Backend Setup

cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

### Frontend Setup

cd frontend
npm install
npm run dev

### LLM Setup (Ollama)

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3

# Start server
ollama serve

## Docker Deployment

### Build and Run with Docker Compose

# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

### Individual Service Management

# Backend only
docker build -t mindmap-backend ./backend
docker run -p 8000:8000 -v $(pwd)/data:/data mindmap-backend

# Frontend only
docker build -t mindmap-frontend ./frontend
docker run -p 3000:3000 mindmap-frontend

## Environment Variables

Create `.env` file in backend directory:

LLM_ENDPOINT=http://localhost:11434/api/generate
LLM_MODEL=llama3
EMBEDDING_MODEL=all-minilm
MAX_UPLOAD_SIZE=10485760
EXTRACTION_TIMEOUT=300
CORS_ORIGINS=["http://localhost:3000"]

## Production Considerations

### Performance

- Use production ASGI server (Gunicorn with Uvicorn workers)
- Enable Next.js production build
- Configure proper logging
- Monitor resource usage

### Backup Strategy

# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Automated backup (crontab)
0 2 * * * tar -czf /backups/mindmap-$(date +\%Y\%m\%d).tar.gz /path/to/data/

### Monitoring

- Health check endpoint: `GET /health`
- Graph stats: `GET /api/graph/stats`
- Log aggregation (stdout/stderr)

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Data directory persistent volume mounted
- [ ] Local LLM accessible from backend
- [ ] CORS origins properly set
- [ ] Rate limiting enabled
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Logging configured

**Deliverables**:
- Security configuration and input validation
- Rate limiting implementation
- Dockerfiles for backend and frontend
- Docker Compose configuration
- Updated security and deployment documentation

**Completion Threshold**:
- [ ] Input validation prevents oversized uploads
- [ ] Rate limiting blocks excessive requests
- [ ] Local-only constraint enforced (`DISABLE_EXTERNAL_LLM`)
- [ ] Docker images build successfully
- [ ] `docker-compose up` starts full stack
- [ ] Security audit passes (no external network calls)
- [ ] Update `checklist.md` with Phase 7 completion
- [ ] Log security measures in `decisions.md`

---

## Final Checklist & Validation

### Complete System Acceptance Test

Run this final validation before considering the project complete:

1. **Environment Setup**:
   - [ ] Ollama running with llama3 model
   - [ ] Backend running on port 8000
   - [ ] Frontend running on port 3000

2. **Core Functionality**:
   - [ ] Upload `data/notes/sample1.md` via frontend
   - [ ] Wait for processing (check `/api/ingest/status`)
   - [ ] Navigate to `/graph` page
   - [ ] Verify graph visualization renders
   - [ ] Click a node and verify details panel opens
   - [ ] Verify provenance is displayed

3. **Search Functionality**:
   - [ ] Navigate to `/search` page (if implemented)
   - [ ] Perform semantic search
   - [ ] Verify results are returned and ranked

4. **Data Persistence**:
   - [ ] Stop backend
   - [ ] Restart backend
   - [ ] Verify graph data persists
   - [ ] Verify can query existing nodes

5. **Export**:
   - [ ] Export graph as GraphML
   - [ ] Verify file downloads
   - [ ] Open in text editor and verify provenance data present

### Documentation Completeness

Verify all documentation files are complete:

- [ ] `docs/architecture.md` - System overview and diagrams
- [ ] `docs/api-spec.md` - All endpoints documented with examples
- [ ] `docs/database.md` - Schema and graph model documented
- [ ] `docs/llm_prompting.md` - Extraction prompts and examples
- [ ] `docs/security.md` - Security measures documented
- [ ] `docs/cicd_devops.md` - Setup and deployment instructions
- [ ] `docs/testing.md` - Test strategy and instructions
- [ ] `docs/design_system.md` - UI/UX patterns documented
- [ ] `docs/roadmap.md` - Future features listed
- [ ] `docs/decisions.md` - Key decisions logged
- [ ] `docs/changelog.md` - Version history maintained

### Code Quality

- [ ] All unit tests pass: `pytest tests/backend/`
- [ ] Integration tests pass: `pytest tests/integration/`
- [ ] No TODO comments in production code
- [ ] All functions have docstrings
- [ ] Code follows PEP 8 (Python) and consistent JS style

### README Completeness

Ensure `README.md` contains:

- [ ] Project description
- [ ] Features list
- [ ] Installation instructions
- [ ] Quick start guide
- [ ] Usage examples
- [ ] Architecture overview
- [ ] Contributing guidelines (if applicable)
- [ ] License information

---

## Post-Development: Knowledge Capture

After completing all phases, capture the development experience:

1. **Update `docs/decisions.md`** with:
   - Final architectural decisions
   - Trade-offs made
   - Lessons learned
   - Known limitations

2. **Create blog post outline** covering:
   - Project motivation
   - Technology choices
   - LLM integration challenges
   - Graph visualization approach
   - Local-first philosophy
   - Future enhancements

3. **Document common issues** in README:
   - LLM connection problems
   - Graph visualization performance
   - Extraction quality tuning

---

## Maintenance & Evolution

### Regular Maintenance Tasks

- Update dependencies monthly
- Review and improve extraction prompts
- Monitor graph growth and performance
- Backup data directory weekly

### Future Enhancement Priorities

Reference `docs/roadmap.md` for planned features. Priority order:

1. **Graph Analytics Dashboard**: Centrality metrics, community detection
2. **Advanced Search**: Filters, boolean operators, temporal queries
3. **Note Versioning**: Track changes to nodes/edges over time
4. **Export Formats**: JSON, CSV, Obsidian-compatible markdown
5. **UI Enhancements**: Dark mode, custom node colors, layout algorithms
6. **Multi-user Support**: Authentication, personal graph spaces (optional)

---

## Success Criteria Summary

The Mind Map AI project is complete when:

✅ All 7 phases are marked complete in `checklist.md`  
✅ Acceptance Test 1 passes: Sample notes → N nodes, M edges  
✅ Acceptance Test 2 passes: Export contains provenance data  
✅ All documentation files are comprehensive and accurate  
✅ Local-only constraint is enforced  
✅ System runs via Docker Compose  
✅ Frontend and backend integration is seamless  
✅ Graph visualization is interactive and performant  
✅ Semantic search returns relevant results  

---

**End of CLIne Master Prompt**
```

<br>

![Image](/images/1019011.png)

<br>

## Vibe Coding

<br>

Ok so now it is time to YOLO it and save that prompt as final_propmt.md in root and I just copy pasted the whole thing into the chat for CLIne since it is a large context model. It of course restarts the task with the proper context, which is why I do that since it is pretty good at figuring that part out. The initial prompt it created from that context is as follows:

<br>

```
## Current Work
The user has provided a comprehensive master prompt for building Mind Map AI, a local LLM-powered personal knowledge graph system. This is a complex multi-phase project that needs to be implemented systematically.

## Key Technical Concepts
- **Backend**: FastAPI with Python for REST API, graph management, and LLM integration
- **Graph Engine**: NetworkX for in-memory graph with disk persistence (.gpickle or GraphML)
- **Database**: SQLite for raw notes, metadata, and provenance tracking
- **LLM**: Local model (Ollama, Llama.cpp) for entity/relationship extraction
- **Embeddings**: Local sentence-transformers with Chroma/Faiss for semantic search
- **Frontend**: Next.js with react-cytoscapejs for interactive graph visualization
- **Architecture**: Local-only constraint, no external API calls unless configured

## Relevant Files and Code
The project starts from scratch with only documentation files currently present:
- cline_master_prompt.md (the master specification)
- spec.md (project specification)
- prompt_add.md and final_prompt.md (additional context)

## Problem Solving
This is a complex multi-phase implementation that requires:
1. Systematic phase-by-phase development
2. Comprehensive documentation before implementation
3. Local-only architecture constraints
4. Integration between multiple technologies (Python backend, Next.js frontend, LLM integration)

## Pending Tasks and Next Steps
**Phase 0: Setup & Documentation** (Starting now)
1. Create complete directory structure as specified
2. Initialize Git repository with proper .gitignore
3. Generate comprehensive documentation templates in /docs/
4. Create checklist.md for progress tracking
5. Create README.md with project overview

**Subsequent Phases** (After Phase 0 completion):
- Phase 1: Backend Core Infrastructure (FastAPI, SQLite)
- Phase 2: NetworkX Graph Store implementation
- Phase 3: LLM Extraction Module
- Phase 4: Embeddings & Semantic Search
- Phase 5: Frontend Setup & Graph Visualization
- Phase 6: Note Upload & Integration Testing
- Phase 7: Security & Deployment

The project follows strict local-only constraints and requires comprehensive documentation at each phase.
```

<br>

![image](/images/1019002.png)

<br>

![image](/images/1019003.png)

<br>

![image](/images/1019004.png)

<br>

So the first prompt generated the following [repo](https://github.com/kliewerdaniel/mindmap01)

This has the documents that outline the entire project. At this point it is not a bad idea to peruse and read the documents created in order to better formulate them.

Now I will start the next prompt, which will begin the real coding and after each prompt remember to stop, read, test and correct.

<br>

```
### Phase 1: Backend Core Infrastructure

**Objective**: Set up FastAPI backend, SQLite database, and basic configuration.

**Pre-requisites**: Phase 0 complete

**Tasks**:

#### 1.1 Database Setup
1. Create `backend/app/db/schema.sql` with the following tables:


-- Table: notes
-- Stores raw markdown/text content with metadata
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_path TEXT,
  hash TEXT UNIQUE,  -- Content hash for deduplication
  processed BOOLEAN DEFAULT 0  -- Flag for extraction completion
);

-- Table: extracts
-- Stores LLM extraction results with provenance
CREATE TABLE extracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  extractor_model TEXT NOT NULL,  -- Model identifier (e.g., "llama3-8b")
  extract_json TEXT NOT NULL,     -- Raw JSON output from LLM
  score REAL,                      -- Confidence/quality score
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

-- Table: metadata
-- Key-value store for system metadata
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notes_hash ON notes(hash);
CREATE INDEX idx_notes_processed ON notes(processed);
CREATE INDEX idx_extracts_note_id ON extracts(note_id);


2. Create `backend/app/db/db.py` with connection management:


import sqlite3
from pathlib import Path
from typing import Optional, Dict, List, Any
import hashlib
import json

DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "mindmap.db"

def get_connection() -> sqlite3.Connection:
    """Get SQLite connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with schema."""
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path) as f:
        schema = f.read()
    
    conn = get_connection()
    conn.executescript(schema)
    conn.commit()
    conn.close()

def insert_note(filename: str, content: str, source_path: Optional[str] = None) -> int:
    """Insert note and return note_id. Skip if hash exists."""
    content_hash = hashlib.sha256(content.encode()).hexdigest()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if note with same hash exists
    cursor.execute("SELECT id FROM notes WHERE hash = ?", (content_hash,))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return existing[0]
    
    cursor.execute(
        "INSERT INTO notes (filename, content, source_path, hash) VALUES (?, ?, ?, ?)",
        (filename, content, source_path, content_hash)
    )
    note_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return note_id

def insert_extract(note_id: int, extractor_model: str, extract_json: Dict, score: Optional[float] = None) -> int:
    """Insert extraction result."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO extracts (note_id, extractor_model, extract_json, score) VALUES (?, ?, ?, ?)",
        (note_id, extractor_model, json.dumps(extract_json), score)
    )
    extract_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return extract_id

def mark_note_processed(note_id: int):
    """Mark note as processed after extraction."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notes SET processed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()

def get_note(note_id: int) -> Optional[Dict]:
    """Retrieve note by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def get_all_notes() -> List[Dict]:
    """Retrieve all notes."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_extracts_for_note(note_id: int) -> List[Dict]:
    """Retrieve all extracts for a given note."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM extracts WHERE note_id = ? ORDER BY created_at DESC", (note_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


3. Update `docs/database.md` with:
   - Table schemas with column descriptions
   - NetworkX graph model specification (see spec.md Section 5.1)
   - Persistence strategy (gpickle vs GraphML tradeoffs)
   - Provenance tracking approach

#### 1.2 FastAPI Application Setup

1. Create `backend/app/config.py`:


from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # LLM Configuration
    llm_endpoint: str = "http://localhost:11434/api/generate"  # Default Ollama endpoint
    llm_model: str = "llama3"
    embedding_endpoint: str = "http://localhost:11434/api/embeddings"
    embedding_model: str = "all-minilm"
    
    # Database Paths
    db_path: Path = Path(__file__).parent.parent.parent / "data" / "mindmap.db"
    graph_path: Path = Path(__file__).parent.parent.parent / "data" / "graph.gpickle"
    vector_db_path: Path = Path(__file__).parent.parent.parent / "data" / "vectors"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list = ["http://localhost:3000"]
    
    # Processing Configuration
    max_batch_size: int = 10
    extraction_timeout: int = 300  # seconds
    
    class Config:
        env_file = ".env"

settings = Settings()


2. Create `backend/app/main.py`:


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db.db import init_database
from .api import ingest, graph, search

app = FastAPI(
    title="Mind Map AI",
    description="Local LLM-powered personal knowledge graph",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    # Initialize graph store (will be implemented in Phase 2)
    # from .services.graph_store import init_graph
    # init_graph()

# Include routers
app.include_router(ingest.router, prefix="/api/ingest", tags=["ingestion"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Mind Map AI API", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


3. Create empty router files (to be implemented in later phases):
   - `backend/app/api/__init__.py`
   - `backend/app/api/ingest.py`
   - `backend/app/api/graph.py`
   - `backend/app/api/search.py`

4. Create `backend/requirements.txt`:


fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic-settings==2.1.0
networkx==3.2.1
requests==2.31.0
sentence-transformers==2.3.1
chromadb==0.4.22
numpy==1.26.3
python-multipart==0.0.6


#### 1.3 Testing & Documentation

1. Create `tests/backend/test_db.py`:


import pytest
from pathlib import Path
import tempfile
import shutil
from backend.app.db import db

@pytest.fixture
def temp_db():
    """Create temporary database for testing."""
    temp_dir = tempfile.mkdtemp()
    original_db_path = db.DB_PATH
    db.DB_PATH = Path(temp_dir) / "test.db"
    db.init_database()
    
    yield db.DB_PATH
    
    # Cleanup
    shutil.rmtree(temp_dir)
    db.DB_PATH = original_db_path

def test_insert_note(temp_db):
    """Test note insertion."""
    note_id = db.insert_note("test.md", "Test content", "/path/to/test.md")
    assert note_id > 0
    
    note = db.get_note(note_id)
    assert note['filename'] == "test.md"
    assert note['content'] == "Test content"
    assert note['processed'] == 0

def test_duplicate_note_hash(temp_db):
    """Test that duplicate content returns existing note_id."""
    note_id_1 = db.insert_note("test1.md", "Same content")
    note_id_2 = db.insert_note("test2.md", "Same content")
    
    assert note_id_1 == note_id_2

def test_insert_extract(temp_db):
    """Test extract insertion."""
    note_id = db.insert_note("test.md", "Test content")
    extract_json = {"nodes": [], "edges": []}
    extract_id = db.insert_extract(note_id, "llama3", extract_json, 0.95)
    
    assert extract_id > 0
    
    extracts = db.get_extracts_for_note(note_id)
    assert len(extracts) == 1
    assert extracts[0]['extractor_model'] == "llama3"

def test_mark_note_processed(temp_db):
    """Test marking note as processed."""
    note_id = db.insert_note("test.md", "Test content")
    db.mark_note_processed(note_id)
    
    note = db.get_note(note_id)
    assert note['processed'] == 1


2. Update `docs/architecture.md` with:
   - Technology stack rationale
   - Backend architecture diagram (ASCII art or description)
   - Data flow from ingestion to graph
   - Module dependencies

3. Update `docs/cicd_devops.md` with:
   - Python environment setup (`venv`, dependencies)
   - Running the backend: `uvicorn app.main:app --reload`
   - Database initialization steps

**Deliverables**:
- `backend/app/db/schema.sql` with complete schema
- `backend/app/db/db.py` with all CRUD functions
- `backend/app/config.py` with settings management
- `backend/app/main.py` with FastAPI app initialization
- `backend/requirements.txt` with all dependencies
- `tests/backend/test_db.py` with passing unit tests
- Updated documentation in `docs/`

**Completion Threshold**:
- [ ] SQLite database can be created and queried
- [ ] FastAPI server runs locally without errors: `uvicorn app.main:app --reload`
- [ ] All database unit tests pass: `pytest tests/backend/test_db.py`
- [ ] `/health` endpoint returns 200 OK
- [ ] Update `checklist.md` with Phase 1 completion
- [ ] Log backend setup in `decisions.md`

---
```

<br>

## 

<br>

![image](/images/1019005.png)

<br>

![image](/images/1019006.png)

<br>

![image](/images/1019007.png)

<br>

Ok, so we have our first lines of actual code. It is really time to read. Getting this intital set up right is what will save you a lot of heartache later.

Well first thing I did was replace the LLM model name with one that I actually have installed. Second is that I noticed that the files in api folder are all placeholder. That is good to keep in mind as you go as you want to ensure that all placeholder logic is completed or removed as you go.

Now I will simply repeat with the remaining prompts and test as I go. Hopefully this all works. If not I will blame it on using a free model and not state of the art Anthropic Sonnet 4.5 or whatever is now the best. I hope this helps give you a foundation of the entire process.

<br>

![image](/images/1019008.png)

<br>

![image](/images/1019012.png)

<br>

## [Results After All Prompts Run](https://github.com/kliewerdaniel/mindmap03.git)

<br>

![image](/images/1019009.png)

<br>

So a basic frontend loads but does this even function? Let's see. I will try to run it and see.


So initial run of docker compose ends with this error:

```
0.412 > next build --turbopack
0.412 
0.881    ▲ Next.js 15.5.6 (Turbopack)
0.881 
0.901    Creating an optimized production build ...
26.00  ✓ Finished writing to disk in 34ms
26.01  ✓ Compiled successfully in 24.9s
26.02    Linting and checking validity of types ...
27.26 
27.26 Failed to compile.
27.26 
27.26 ./components/GraphCanvas.tsx
27.26 9:1  Warning: Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any').
27.26 60:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 64:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 77:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 81:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 103:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 
27.26 ./lib/api.ts
27.26 42:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27.26 88:84  Warning: Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any').
27.26 
27.26 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
27.27 npm notice
27.27 npm notice New major version of npm available! 10.8.2 -> 11.6.2
27.27 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.2
[+] Running 1/2e To update run: npm install -g npm@11.6.2
 ✔ Service backend   Built                                    1.1s 
 ⠏ Service frontend  Building                                27.9s 
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

What does it mean?

It means it is the next prompt I enter and pray it fixes it with no thinking on my part. Not really. Do not do that. It will end in a broken heart and you will end up wearing all black for a year or two.

<br>

![Image](/images/1019013.png)

<br>

It basically runs. You can even load a document. It does not function like it supposed to. I imagine this is filled with pseudo code. This is why you do not do this do.

So why do you vibe code?

Now I have something to work with. Now is when the real works begins. I do this as part of my learning process. After I have generated something like this I then go through all the functions and such and analyze it to try to get it to function like I initally thought.

Hey I got further than last time at least.

![Image](/images/1019014.png)

<br>
