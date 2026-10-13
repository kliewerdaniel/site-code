---
author: Daniel Kliewer
canonical_url: /blog/2026-10-12-mindbroadcast
date: 10-12-2026
description: "MindBroadcast is a persistent, autonomous broadcasting system that continuously transforms incoming information into an evolving stream of spoken analysis, commentary, and debate. A complete technical specification for a local-first, event-driven, evidence-grounded AI system that maintains an internal model of the world and produces ongoing, persona-driven interpretations."
image: /images/1021018.png
layout: post
title: "MindBroadcast — A Technical Specification for a Persistent, Autonomous, News-Driven Intelligence and Broadcasting System"
og:description: "A complete technical specification for MindBroadcast: a local-first, event-driven, persistent AI system that continuously ingests, interprets, and broadcasts evidence-grounded analysis of the world."
og:image: /images/1021018.png
og:title: "MindBroadcast — A Technical Specification for a Persistent, Autonomous, News-Driven Intelligence and Broadcasting System"
og:type: article
og:url: /blog/2026-10-12-mindbroadcast
tags:
  - mindbroadcast
  - autonomous-broadcasting
  - local-first
  - event-driven
  - persistent-ai
  - news-intelligence
  - sovereign-ai
  - architecture
  - persona-driven
twitter:card: summary_large_image
twitter:description: "A complete technical specification for a persistent, autonomous, local-first AI broadcasting system that maintains an internal model of the world and produces ongoing, evidence-grounded interpretations."
twitter:image: /images/1021018.png
twitter:title: "MindBroadcast — A Technical Specification for a Persistent, Autonomous, News-Driven Intelligence and Broadcasting System"
---

# MindBroadcast
## A Technical Specification for a Persistent, Autonomous, News-Driven Intelligence and Broadcasting System

**Document type:** System architecture and engineering specification  
**Project:** MindBroadcast / MindCast / Infinite News Broadcast Generator  
**Specification version:** 1.0  
**Date:** October 12, 2026  
**Architectural orientation:** Local-first, event-driven, persistent, evidence-grounded, persona-driven, continuously operating  
**Implementation philosophy:** Deterministic infrastructure surrounding probabilistic intelligence

---

# 1. Executive Summary

MindBroadcast is a persistent, autonomous broadcasting system that continuously transforms incoming information about the world into an evolving stream of spoken analysis, commentary, debate, explanation, and entertainment.

Unlike a conventional podcast generator, which produces a predetermined audio artifact from a fixed script, MindBroadcast operates as a continuously running information system. It maintains an internal representation of the world, ingests new information, tracks the evolution of existing stories, evaluates competing claims, identifies meaningful changes, and determines what should be communicated to an audience at any given moment.

Its output is not merely a sequence of summaries. It is an ongoing interpretation of the world produced by a system that remembers what it has previously reported, understands which questions remain unresolved, distinguishes new developments from repeated coverage, and adapts its presentation to the interests and behavior of its listeners.

The system combines persistent information storage, source ingestion, entity resolution, event detection, knowledge graph construction, evidence tracking, language-model reasoning, persona orchestration, broadcast scheduling, speech synthesis, and real-time audience interaction.

The defining architectural property is the separation of **what the system knows, what the system believes may be happening, what its individual personas think about it, and what the broadcaster actually says**.

These are related but distinct layers.

A news article is not an event. An event is not a claim. A claim is not evidence. Evidence does not automatically establish a claim as true. An interpretation is not a fact. A persona's opinion is not the system's verified conclusion. A generated sentence is not automatically suitable for broadcast simply because a language model produced it.

MindBroadcast must preserve these distinctions throughout its processing pipeline.

The system therefore treats the generation of a broadcast as a controlled transformation from information to interpretation to speech, with persistent records of the sources, evidence, decisions, and generation processes that produced each segment.

The central design principle is:

> **The world changes, the system observes those changes, its internal model is updated, its perspectives interpret the changes, and its broadcast communicates those interpretations without erasing the distinction between evidence and opinion.**

This design supports a continuously operating news broadcaster, but it also establishes a general architecture for persistent AI systems that maintain a model of an external environment and produce ongoing, evidence-grounded interpretations of that environment.

## 1.1 The system's primary objectives

MindBroadcast MUST:

1. Operate continuously without requiring a human to initiate every broadcast segment.
2. Ingest information from multiple independently configurable sources.
3. Persist source material, extracted information, relationships, corrections, and historical state.
4. Distinguish articles, claims, events, entities, evidence, interpretations, and corrections.
5. Maintain an evolving representation of the world rather than treating each generation request as an isolated task.
6. Detect meaningful developments in ongoing stories.
7. Identify novelty, uncertainty, conflicting accounts, and unresolved questions.
8. Support multiple persistent broadcasting personas with distinct editorial and analytical characteristics.
9. Generate speech that combines factual reporting, explanation, analysis, debate, and entertainment.
10. Associate broadcast statements with their supporting evidence and generation history.
11. Avoid presenting unsupported speculation as verified reporting.
12. Support listener interaction without allowing incoming messages to destabilize the entire broadcast pipeline.
13. Generate audio continuously while maintaining synchronization between text, speech, and broadcast state.
14. Recover from individual subsystem failures without unnecessarily terminating the entire broadcast.
15. Support local inference and local data storage as the default operating mode.
16. Expose its internal operation through an interface that makes the system's state, reasoning artifacts, and current broadcast understandable to an operator.
17. Maintain enough historical context to avoid repeatedly reporting the same development as if it were new.
18. Support deterministic tests for infrastructure and reproducible evaluations of probabilistic components.

## 1.2 Non-goals

MindBroadcast is not intended to be:

- A general-purpose conversational assistant with a news-themed interface.
- A single-prompt article summarizer.
- A system that assumes every ingested article is accurate.
- A fully autonomous publisher whose generated claims bypass validation.
- A replacement for primary sources or professional journalism.
- A system that requires a cloud-hosted language model to remain operational.
- A collection of independent personas that share no common information model.
- A rigid playlist generator that can only play prerecorded segments.
- An agent that freely modifies its own source code or policies during ordinary operation.
- A system that equates fluent speech with factual correctness.

The distinction between an autonomous broadcaster and an autonomous general-purpose agent is particularly important. MindBroadcast should be able to decide what to discuss, how to discuss it, and when to change subjects without granting language models unrestricted authority over storage, network access, operating-system resources, or persistent application state.

Its autonomy should be expressed through explicit decision-making interfaces, bounded execution permissions, and verifiable state transitions.

---

# 2. Product Definition and Operating Model

## 2.1 The broadcast as a continuously evolving process

The primary product is a live, continuously evolving audio program.

The listener should be able to open MindBroadcast at almost any time and encounter a coherent broadcast already in progress.

The system should have an understanding of:

- What is happening in the world according to its available sources.
- Which stories are developing.
- Which developments are sufficiently important to interrupt the current discussion.
- Which subjects have already received substantial coverage.
- Which important questions remain unanswered.
- Which claims are disputed.
- Which subjects are relevant to the listener.
- Which persona should speak next.
- Whether the next segment should inform, explain, debate, question, entertain, or synthesize.
- Whether the current segment should continue, conclude, or transition to something else.

A conventional content-generation pipeline begins with an explicit input and terminates when it produces an output.

MindBroadcast instead operates as a persistent control loop:

\[
\boxed{
\text{Observe}
\rightarrow
\text{Normalize}
\rightarrow
\text{Understand}
\rightarrow
\text{Evaluate}
\rightarrow
\text{Select}
\rightarrow
\text{Compose}
\rightarrow
\text{Validate}
\rightarrow
\text{Speak}
\rightarrow
\text{Measure}
\rightarrow
\text{Update}
}
\]

The loop then continues.

This is a conceptual model, not a requirement that every operation execute synchronously or in a single thread. In the implementation, ingestion, knowledge processing, editorial planning, generation, and audio delivery should operate as separate but coordinated subsystems.

A new article should not have to wait for the current audio segment to finish before it can be ingested. Likewise, a slow language-model request should not prevent the interface from displaying a transcript or receiving a listener message.

The architecture should therefore be asynchronous, event-driven, and persistent.

## 2.2 What makes the broadcast infinite?

An infinite broadcast does not require an infinite supply of newly published news articles.

It requires the system to maintain a meaningful program even when the external information environment becomes quiet.

MindBroadcast should have several distinct programming modes.

**Breaking developments:** Newly detected events or material changes to existing stories receive priority when sufficiently important and well-supported.

**Continuing coverage:** The system revisits ongoing events when new evidence, consequences, official decisions, or meaningful changes become available.

**Analysis:** Personas explore the causes, incentives, institutional structures, historical context, and possible consequences of established events.

**Synthesis:** The system identifies relationships between separate developments and examines whether they reveal a broader pattern. Such relationships must be presented as interpretations unless the underlying connection is sufficiently established.

**Unresolved questions:** The system discusses important questions for which evidence remains incomplete, explaining what is known, what is unknown, and what future information could resolve the uncertainty.

**Historical context:** The broadcaster revisits earlier events to explain how the current situation developed.

**Audience-directed programming:** Listener questions, suggestions, and requests influence topic selection without overriding factual or safety constraints.

**Low-news-volume programming:** When little materially new information is available, the broadcaster can produce clearly identified background analysis, explanatory segments, retrospectives, or discussions of previously established evidence.

The system must never manufacture a breaking event merely to fill silence.

Its ability to continue broadcasting comes from the combination of fresh information and deeper analysis of existing information, not from an obligation to invent new facts.

## 2.3 Operating modes

MindBroadcast should support the following operational modes.

| Mode | Description |
|---|---|
| `LIVE` | Continuously selects and produces broadcast segments. |
| `IDLE` | Remains operational but has no current speech to deliver. |
| `DEGRADED` | Continues using available subsystems while one or more dependencies are unavailable. |
| `REPLAY` | Replays previously generated audio or a historical broadcast session. |
| `SIMULATION` | Runs the editorial pipeline against controlled or historical data without publishing live audio. |
| `MAINTENANCE` | Allows schema migrations, maintenance, and administrative operations. |
| `STOPPING` | Stops accepting new work and drains or cancels in-flight operations according to shutdown policy. |
| `STOPPED` | All managed processing and delivery loops have terminated. |

The operational mode is separate from the editorial mode. For example, the system can remain in `LIVE` while performing a historical-analysis segment rather than reporting breaking news.

The distinction makes it possible to reason independently about system health and programming decisions.

---

# 3. Architectural Principles

The following principles are normative. They should guide implementation decisions even when the implementation changes.

## 3.1 Local-first execution

The default deployment should run on the user's own machine or another explicitly controlled environment.

Persistent state should reside in local storage. Language models should be replaceable through a provider interface. Text-to-speech should have a lightweight local implementation. The core information model should not depend on a particular cloud vendor.

Optional remote services may provide additional capabilities, but they must be explicit dependencies rather than hidden assumptions.

A network outage should not destroy local state. A provider outage should not corrupt the knowledge base. A model change should not require the system to reinterpret its entire historical database.

## 3.2 Deterministic boundaries around probabilistic components

Language models are useful for extracting meaning, generating interpretations, and producing natural speech. They are not reliable substitutes for transaction management, access control, referential integrity, or exact state transitions.

Accordingly:

- The model may propose an entity match, but deterministic code decides whether to commit it.
- The model may propose a claim, but the evidence pipeline records the source and validation status.
- The model may propose a story priority, but the scheduler applies explicit constraints.
- The model may generate a script, but a validator determines whether the script meets broadcast requirements.
- The model may suggest a database update, but a controlled service performs the write.
- The model may recommend a new persona, but persona configuration changes require an explicit administrative process.
- The model may identify a potential correction, but the correction workflow must preserve the original record.

The governing rule is:

**Models propose. Schemas constrain. Services authorize. Transactions commit. Evidence records what happened.**

This follows the same general philosophy as a governed agent architecture in which proposals are separated from execution authority.

## 3.3 Append-only provenance

The system must preserve the history of how information entered, changed, and was used by the broadcaster.

An original source record should not be silently overwritten because a source subsequently corrects an article or because a model revises its interpretation.

Instead, the system should preserve:

- The original observation.
- Any subsequent version or correction.
- The relationships between the records.
- The time each record was observed.
- The source's stated publication or update time.
- The system's processing history.
- The evidence and decisions associated with any broadcast that used the information.

Mutable operational state may exist for performance reasons, but its changes should be reconstructable from durable records wherever those changes materially affect editorial decisions or published content.

Append-only provenance does not mean that every internal cache must be immutable. It means that important historical facts about the system's information and behavior must not disappear when current state changes.

## 3.4 Explicit epistemic status

Every significant information object should carry a status that describes what the system knows about it.

A claim can be:

- Extracted but not reviewed.
- Supported by one source.
- Supported by multiple independent sources.
- Disputed by other sources.
- Contradicted by stronger evidence.
- Corrected or superseded.
- Unresolved.
- Rejected as unreliable.
- Withdrawn from active use.

These statuses should not be confused with a universal numerical measure of truth.

A claim supported by five articles that all repeat the same original report is not necessarily better supported than a claim supported by one directly observed primary source. Source independence, provenance, access to primary evidence, and the nature of the claim matter.

The system must preserve those distinctions rather than treating the number of matching articles as sufficient proof.

## 3.5 Separation of observation, interpretation, and publication

MindBroadcast has three conceptually separate products:

1. An information model describing what its sources report.
2. An analytical model describing what the evidence may mean.
3. A published broadcast describing what the system chooses to communicate.

These products must not be collapsed into a single language-model conversation.

A persona may interpret evidence differently from another persona without altering the underlying evidence records. A broadcast may omit a claim without deleting it from the knowledge base. A correction may change the status of a claim without rewriting an old transcript to conceal what was previously said.

This separation makes the system auditable and supports meaningful disagreement between personas.

---

# 4. System Architecture

## 4.1 High-level architecture

MindBroadcast should be implemented as a collection of cooperating services organized around a persistent event and knowledge model.

The initial deployment can run as a single Python application with multiple asynchronous workers. The architecture should preserve logical service boundaries without requiring a distributed microservice deployment.

This is an important distinction. Separating responsibilities does not require separating them into network services.

For a local-first application, a modular monolith is preferable until there is a demonstrated need for independent scaling, process isolation, or remote execution.

The logical architecture is:

```text
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL WORLD                           │
│                                                             │
│  RSS/Atom │ News APIs │ Official Sources │ Web │ Listeners  │
└─────┬─────────┬───────────┬───────────────┬──────────┬──────┘
      │         │           │               │          │
      ▼         ▼           ▼               ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                           │
│                                                             │
│ Connectors → Fetch Queue → Parsing → Normalization          │
│                         → Deduplication → Source Registry    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 KNOWLEDGE COMPILER                           │
│                                                             │
│ Article → Entity Extraction → Event Resolution              │
│         → Claim Extraction → Evidence Linking               │
│         → Contradiction Detection → Provenance Graph         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PERSISTENT WORLD MODEL                      │
│                                                             │
│ Sources │ Articles │ Events │ Claims │ Evidence │ Entities  │
│ Corrections │ Relationships │ Snapshots │ Historical State  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 EDITORIAL CONTROL PLANE                      │
│                                                             │
│ Change Detection → Story Ranking → Coverage Planning        │
│                  → Topic Selection → Segment Assignment      │
│                  → Interruption and Transition Decisions     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                PERSONA AND ANALYSIS LAYER                    │
│                                                             │
│ Research Context → Persona Memory → Independent Analysis    │
│                  → Cross-Persona Discussion                  │
│                  → Script Construction                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  BROADCAST VALIDATION                        │
│                                                             │
│ Claim Verification → Provenance Check → Policy Check        │
│                    → Length/Timing → Script Approval         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MEDIA PIPELINE                           │
│                                                             │
│ Text → TTS → Audio Buffer → Stream Multiplexer              │
│                            ├── Browser Player                │
│                            ├── Local Audio Output            │
│                            └── Optional Radio Server         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  AUDIENCE AND FEEDBACK                       │
│                                                             │
│ Playback State → Listener Interaction → Feedback Events     │
│                → Preference Updates → Editorial Influence    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               └──────► World Model / Planner
```

All major services should emit structured operational events. Those events should support observability, recovery, historical reconstruction, and evaluation.

## 4.2 Logical service boundaries

The initial implementation should contain the following logical modules.

| Module | Responsibility |
|---|---|
| `ingestion` | Source polling, fetching, parsing, and normalized article creation. |
| `source_registry` | Source identity, configuration, reliability history, and permissions. |
| `normalization` | Canonical URLs, timestamps, content normalization, and fingerprints. |
| `deduplication` | Duplicate and near-duplicate detection. |
| `knowledge_compiler` | Extraction and integration of entities, claims, events, and relationships. |
| `evidence` | Evidence records, support relationships, contradiction tracking, and claim status. |
| `world_model` | Persistent representation of the current and historical information environment. |
| `snapshots` | Versioned representations of world state at specific points in time. |
| `story_engine` | Story clustering, development detection, novelty, and coverage state. |
| `editorial_planner` | Topic ranking, broadcast scheduling, transitions, and interruptions. |
| `personas` | Persona configuration, memory retrieval, perspective generation, and dialogue. |
| `generation` | Language-model provider abstraction and structured generation requests. |
| `validation` | Claim-to-evidence checks, script validation, and broadcast eligibility. |
| `broadcast` | Segment lifecycle, turn scheduling, queue management, and session state. |
| `tts` | Speech synthesis, voice configuration, and audio metadata. |
| `audio` | Audio buffering, sequencing, format conversion, and delivery. |
| `audience` | Listener messages, playback events, preferences, and feedback. |
| `api` | HTTP endpoints, streaming endpoints, and administrative interfaces. |
| `ui` | Dashboard, transcript, playback controls, and system inspection. |
| `persistence` | Database transactions, migrations, repositories, and storage abstractions. |
| `observability` | Metrics, traces, structured logs, health checks, and diagnostic events. |

These boundaries are intended to control complexity and ownership. They are not a mandate to create dozens of packages immediately.

A sensible implementation can initially place related responsibilities in fewer modules while preserving the contracts defined here.

## 4.3 Process architecture

The application should use asynchronous I/O for network operations, event delivery, API requests, and audio streaming.

CPU-intensive work, such as large-scale embedding generation, should be bounded separately so it cannot monopolize the event loop.

Language-model inference and TTS must each have independent concurrency controls.

A model request may take seconds or minutes. It must never hold a database transaction open while waiting for generation.

The preferred processing pattern is:

1. Read the necessary context from persistent storage.
2. Construct an immutable generation request.
3. Execute the model request outside the transaction.
4. Validate the result.
5. Commit the accepted result in a short transaction.
6. Emit a durable event describing the state transition.

The same principle applies to network fetching and speech synthesis.

### 4.3.1 Recommended initial process topology

```text
mindbroadcast/
├── application
│   ├── lifecycle
│   ├── configuration
│   └── dependency_container
├── ingestion_workers
├── knowledge_workers
├── editorial_worker
├── persona_generation_workers
├── validation_worker
├── tts_workers
├── audio_stream_worker
├── api_server
├── scheduler
└── maintenance_worker
```

This describes logical execution responsibilities, not necessarily separate operating-system processes.

The first implementation should favor a single application process with controlled background tasks and bounded worker pools. Process separation can be introduced later for inference isolation or reliability.

---

# 5. Canonical Data Model

The data model is the foundation of the entire system.

If articles, claims, evidence, events, personas, and broadcast segments are represented inconsistently, the broadcaster will eventually lose the ability to distinguish current reporting from historical interpretation.

The schema must therefore be designed before substantial additional features are layered on top of the application.

The following model is the target architecture. It does not imply that every entity already exists in the current implementation.

## 5.1 General record conventions

Every persistent domain record should use a stable identifier and explicit timestamps.

A common logical envelope is:

```python
class RecordMetadata:
    id: str
    created_at: datetime
    updated_at: datetime
    schema_version: int
```

This is illustrative pseudocode, not a complete implementation.

The following rules apply:

- IDs must remain stable across restarts.
- Foreign keys must enforce valid relationships where supported.
- All stored timestamps must be timezone-aware.
- Persisted timestamps should be normalized to UTC.
- Source-provided timestamps must remain distinguishable from system-observation timestamps.
- Mutable records must have an explicit update policy.
- Historical observations must not be silently rewritten.
- Schema migrations must be versioned and tested.
- Records containing externally supplied content must retain provenance.
- Data models must be independent of any particular language-model provider.

SQLite is suitable for the initial deployment, provided that transaction boundaries, concurrency, migrations, and cross-process access are handled deliberately.

## 5.2 Source

A `Source` represents an identifiable origin of information.

Examples include a publication, government agency, news feed, research organization, official press release endpoint, or other configured information provider.

A source is not the same thing as an article.

Proposed fields:

| Field | Type | Description |
|---|---|---|
| `id` | UUID or stable string | Canonical source identifier. |
| `name` | String | Human-readable source name. |
| `canonical_domain` | String, nullable | Primary domain associated with the source. |
| `source_type` | Enum | RSS, Atom, API, official document, web page, or other supported type. |
| `endpoint` | String | Configured ingestion endpoint. |
| `publisher_identity` | String, nullable | Known publisher or organization identifier. |
| `ownership_group_id` | UUID, nullable | Known parent organization or ownership group. |
| `trust_profile_id` | UUID, nullable | Reference to source-evaluation configuration. |
| `enabled` | Boolean | Whether ingestion is permitted. |
| `poll_interval_seconds` | Integer | Desired polling interval. |
| `last_attempt_at` | Timestamp, nullable | Most recent fetch attempt. |
| `last_success_at` | Timestamp, nullable | Most recent successful fetch. |
| `failure_count` | Integer | Consecutive or tracked failures. |
| `created_at` | Timestamp | Creation time. |
| `updated_at` | Timestamp | Last configuration update. |

The `trust_profile_id` must not imply that a source has a single universal reliability score.

A source may be dependable for official statements but weak for independent interpretation. A government agency may be authoritative about what it officially announced without being an independent authority on the accuracy of its own claims.

Source evaluation should therefore be claim- and context-sensitive.

The source registry must also support ownership relationships. Ten publications controlled by the same organization should not automatically count as ten independent confirmations.

## 5.3 Article

An `Article` represents a specific captured publication or document.

An article is a source artifact, not a verified account of reality.

Proposed fields:

```text
Article
├── id
├── source_id
├── canonical_url
├── original_url
├── title
├── author
├── published_at
├── source_updated_at
├── first_seen_at
├── fetched_at
├── language
├── content_hash
├── normalized_text
├── raw_content_reference
├── extraction_status
├── publication_version
├── supersedes_article_id
├── metadata_json
└── schema_version
```

`first_seen_at` and `published_at` are deliberately separate.

A story published three hours ago but discovered just now is not equivalent to a story first observed three hours ago. This distinction matters for freshness calculations, outage recovery, and historical reconstruction.

The system should preserve a normalized text representation suitable for search and extraction.

Raw HTML and other large source artifacts can be stored separately, with a database reference to the retained content.

Content retention must respect configured storage limits and applicable source-access restrictions. The system should not assume that all fetched content can be republished in full.

### 5.3.1 Article versioning

When a publisher materially changes an article, MindBroadcast should create a new captured version or observation linked to the prior version.

The exact implementation may use separate article-version records or distinct article records connected through `supersedes_article_id`.

The invariant is more important than the choice of table:

**A material source revision must not erase the historical version used to produce an earlier broadcast.**

The system should distinguish an ordinary metadata refresh from a substantive content correction.

## 5.4 Entity

An `Entity` represents a recognized real-world or conceptual subject.

Examples include people, organizations, countries, institutions, locations, products, laws, conflicts, and recurring concepts.

Proposed fields:

```text
Entity
├── id
├── canonical_name
├── entity_type
├── description
├── aliases
├── external_identifiers
├── canonical_uri
├── first_observed_at
├── last_observed_at
├── status
└── metadata_json
```

Entity resolution should be based on a combination of:

- Exact aliases.
- Canonical identifiers.
- Contextual similarity.
- Entity type.
- Relationships to already resolved entities.
- Temporal context.
- Explicit source references.

Embedding similarity may generate candidate matches, but it must not independently authorize merges.

For example, two people with the same name must not be merged simply because their names and article contexts are similar.

Entity merges should be recorded as explicit, reversible operations.

## 5.5 Event

An `Event` represents a real-world occurrence or developing situation that may be described by many articles.

Examples include an election, legislative vote, court ruling, military engagement, corporate acquisition, economic announcement, or policy change.

An event is not merely an article cluster.

Multiple articles can discuss one event. One article can discuss several events. A continuing story can contain a series of related events without making all of them identical.

Proposed fields:

```text
Event
├── id
├── canonical_title
├── event_type
├── summary
├── status
├── occurred_at_start
├── occurred_at_end
├── first_observed_at
├── last_material_update_at
├── parent_event_id
├── supersedes_event_id
├── confidence_state
└── metadata_json
```

Event status should distinguish, at minimum:

- `EMERGING`
- `ACTIVE`
- `DEVELOPING`
- `DORMANT`
- `CONCLUDED`
- `DISPUTED`
- `MERGED`
- `SUPERSEDED`

These statuses describe the system's representation of the event, not necessarily an objective and universally accepted state of reality.

For example, an event can be considered concluded by one source and ongoing by another. Such disagreements should be represented rather than silently resolved.

### 5.5.1 Story versus event

The editorial system needs an additional concept: the `Story`.

A story is the editorial grouping through which MindBroadcast tracks a subject over time.

An event is a modeled occurrence. A story may encompass multiple related events, articles, claims, and questions.

For example, a legislative story might include:

- An initial policy proposal.
- Committee hearings.
- A parliamentary vote.
- A court challenge.
- An implementation deadline.
- Subsequent economic consequences.

The system should not create a completely unrelated editorial identity for every article about the proposal.

A `Story` therefore maintains continuity across multiple events and publications.

Proposed fields:

```text
Story
├── id
├── canonical_title
├── editorial_summary
├── status
├── created_at
├── last_material_update_at
├── last_broadcast_at
├── last_substantial_coverage_at
├── audience_relevance_state
├── unresolved_question_count
└── metadata_json
```

A separate many-to-many association should connect stories to events, articles, claims, and entities.

The relationship should include a role or relevance classification where useful.

## 5.6 Claim

A `Claim` is a proposition that can be evaluated against evidence.

Examples:

- An organization announced a policy change.
- A bill passed a legislative chamber.
- A particular event occurred at a given time.
- An official stated that a specific number of people were affected.
- An analyst predicts that a policy may change future economic behavior.

These propositions are not equivalent in epistemic status.

The first may be verifiable against an official announcement. The second may be verifiable against legislative records. The third may require multiple forms of evidence. The fourth establishes what an official claimed, not necessarily that the reported number is accurate. The fifth is a prediction rather than a directly established fact.

Proposed fields:

```text
Claim
├── id
├── canonical_proposition
├── normalized_subject_id
├── normalized_predicate
├── normalized_object
├── claim_type
├── epistemic_status
├── first_observed_at
├── last_evaluated_at
├── valid_time_start
├── valid_time_end
├── supersedes_claim_id
├── created_by_component
└── metadata_json
```

A normalized subject-predicate-object representation can support graph queries and duplicate detection.

However, not all claims can be reliably reduced to simple triples. Complex propositions should retain their canonical natural-language representation and may include structured qualifiers such as location, time, quantity, unit, and conditions.

### 5.6.1 Claim types

At minimum, distinguish:

| Type | Meaning |
|---|---|
| `OBSERVATIONAL` | A proposition about an observed occurrence or state. |
| `ATTRIBUTED` | A proposition that a person or source made a particular statement. |
| `QUANTITATIVE` | A proposition involving a number, measurement, or statistic. |
| `CAUSAL` | A proposition that one factor caused or contributed to another. |
| `PREDICTIVE` | A proposition about a possible future state. |
| `NORMATIVE` | A proposition expressing what should happen. |
| `INTERPRETIVE` | A proposition that explains or characterizes the significance of other information. |

A claim's type determines which validation procedures are appropriate.

A directly attributable quotation, a statistical estimate, and a causal hypothesis should not be assessed using the same simplistic verification rule.

### 5.6.2 Claim status

A claim's epistemic status should be distinct from its type.

Suggested statuses:

```text
UNASSESSED
SUPPORTED
CORROBORATED
DISPUTED
CONTRADICTED
UNRESOLVED
SUPERSEDED
WITHDRAWN
```

These statuses must have explicit transition rules.

`SUPPORTED` means that available evidence supports the proposition under the system's defined evaluation criteria. It does not imply absolute certainty.

`CORROBORATED` should require genuinely distinct supporting evidence rather than repeated publication of the same original assertion.

`CONTRADICTED` should indicate that the available evidence conflicts materially with the proposition. It should not automatically mean that every component of the proposition is false.

A claim can also have a status that is currently unresolved because relevant evidence is unavailable.

## 5.7 Evidence

An `Evidence` record captures a specific evidentiary observation relevant to a claim.

Evidence can include:

- A passage from an article.
- An official document.
- A published statistical table.
- A direct quotation.
- A court filing.
- A recorded public statement.
- A structured dataset.
- A source-provided correction.
- An independently captured observation.

Evidence is not synonymous with an article.

One article can provide several distinct pieces of evidence. One passage can be relevant to several claims. A document can support one proposition while contradicting another.

Proposed fields:

```text
Evidence
├── id
├── evidence_type
├── article_id
├── source_id
├── content_reference
├── excerpt
├── content_hash
├── observed_at
├── source_published_at
├── extraction_method
├── extraction_model
├── extraction_version
├── provenance_status
└── metadata_json
```

Evidence-to-claim relationships should be stored separately.

```text
ClaimEvidence
├── id
├── claim_id
├── evidence_id
├── relationship_type
├── assessment
├── assessment_method
├── assessed_at
└── metadata_json
```

`relationship_type` should distinguish:

- Supports.
- Contradicts.
- Qualifies.
- Attributes.
- Provides context.
- Leaves unresolved.

The `assessment` field may contain a calibrated model score or a categorical result, but neither should be treated as a universal truth probability without validation.

Evidence records must preserve their source location and extraction provenance. A generated summary without a traceable underlying passage should not be treated as primary evidence.

## 5.8 Correction

A `Correction` is a first-class domain object.

It must not be represented merely as a new evidence record.

Evidence establishes or challenges propositions. A correction records that a prior representation, report, or statement requires revision.

Proposed fields:

```text
Correction
├── id
├── correction_type
├── target_type
├── target_id
├── originating_source_id
├── original_value_reference
├── corrected_value_reference
├── reason
├── detected_at
├── effective_at
├── review_status
├── supersedes_correction_id
└── metadata_json
```

Correction types should include:

- Publisher correction.
- System extraction correction.
- Entity-resolution correction.
- Event-association correction.
- Claim-assessment correction.
- Broadcast correction.
- Administrative correction.

The system must distinguish a publisher correcting an article from MindBroadcast discovering that its own extraction was wrong.

A publisher correction does not automatically prove that every associated claim is false. It does, however, require reassessment of claims that depended on the corrected material.

Likewise, a revised model assessment should not be mislabeled as a correction to the original source.

When a correction affects a claim previously broadcast, the system should evaluate whether a public correction is warranted.

The original transcript and audio must remain historically identifiable, with the correction linked to the affected segment.

## 5.9 WorldSnapshot

A `WorldSnapshot` represents the system's best recorded view of a defined portion of the information environment at a particular point in time.

It should not be interpreted as an omniscient snapshot of the real world.

A snapshot is a versioned representation of what the system had observed, processed, and retained.

Proposed fields:

```text
WorldSnapshot
├── id
├── created_at
├── knowledge_watermark
├── schema_version
├── snapshot_type
├── parent_snapshot_id
├── content_hash
├── included_record_manifest
├── unresolved_issue_count
└── metadata_json
```

The `knowledge_watermark` should indicate the latest durable event incorporated into the snapshot.

For a small deployment, a snapshot may contain a canonical serialized representation of relevant state and a manifest of the records used to construct it.

For a larger deployment, the system may store a compact snapshot plus a reference to the immutable event sequence from which it can be reconstructed.

### 5.9.1 Snapshot semantics

Snapshots must distinguish three different times:

1. **Valid time:** When an event or proposition is believed to have applied to the world.
2. **Observation time:** When the system first observed the information.
3. **Transaction time:** When the information became durably recorded in the system.

For example, a report published on Monday may be discovered on Wednesday and processed on Thursday.

Those timestamps must not collapse into a single `created_at` value.

A snapshot generated on Thursday should not falsely imply that the system knew the report on Monday.

Snapshot creation must also be atomic with respect to the logical state being captured. The implementation must not combine incompatible database states simply because different tables were read at different moments while updates continued.

For SQLite, this can be achieved with a read transaction and an explicit snapshot boundary. Expensive serialization should be separated from writes where possible, while preserving a consistent source state.

## 5.10 Provenance graph

MindBroadcast should maintain an explicit graph connecting the information it consumes to the statements it produces.

The graph should support paths such as:

```text
Source
  └── published
       └── Article Version
            └── contains
                 └── Evidence
                      └── supports
                           └── Claim
                                └── associated_with
                                     └── Event
                                          └── grouped_into
                                               └── Story
                                                    └── selected_for
                                                         └── Broadcast Segment
                                                              └── contains
                                                                   └── Spoken Claim
```

This graph is the basis of explainability and post-publication review.

It should also represent negative or qualified relationships, such as evidence that contradicts a claim or a correction that supersedes a previous assessment.

Not every relationship needs a separate graph database.

Initially, ordinary relational tables with foreign keys and indexed association tables are sufficient. SQLite can support recursive queries and many-to-many relationships without introducing another database service.

A dedicated graph engine should be considered only when query complexity or scale demonstrates a real need.

---

# 6. Persistence, Event Sourcing, and State Management

## 6.1 SQLite as the initial system of record

SQLite should remain the default persistence layer for the initial local deployment.

It offers transactional integrity, foreign-key enforcement, mature migration tooling, and a straightforward operational model. It also supports an application that can be backed up and moved without coordinating multiple database services.

However, using SQLite does not automatically make an application reliable. The application must configure and use it correctly.

Required database practices:

- Enable foreign-key enforcement on every connection.
- Use explicit transaction boundaries.
- Configure an appropriate busy timeout.
- Use WAL mode where appropriate for concurrent readers and writers.
- Avoid holding write transactions open during network or model operations.
- Bound the number of concurrent database writers.
- Use migrations for all schema changes.
- Enforce uniqueness constraints for canonical identities and deduplication keys.
- Use parameterized SQL.
- Define retention and backup policies.
- Test recovery after interrupted writes and process termination.

The application should centralize database connection creation and transaction handling rather than allowing every module to establish its own inconsistent configuration.

## 6.2 Event log

MindBroadcast should maintain an append-only log of significant domain events.

Examples:

```text
SourceRegistered
ArticleObserved
ArticleCaptured
ArticleVersionDetected
ClaimExtracted
EvidenceLinked
ClaimAssessmentChanged
EntityResolved
EventAssociationChanged
CorrectionDetected
WorldSnapshotCreated
StoryPriorityChanged
StorySelected
SegmentPlanned
ScriptGenerated
ScriptValidated
BroadcastSegmentStarted
BroadcastSegmentCompleted
AudioChunkProduced
ListenerMessageReceived
CorrectionPublished
```

These events describe transitions in the system rather than simply mirroring every function call.

The event log supports:

- Debugging.
- Recovery.
- Auditability.
- Reconstructing historical editorial decisions.
- Evaluating why a story was selected.
- Determining which evidence was available when a claim was broadcast.
- Identifying the consequences of a correction.
- Comparing system behavior across versions.

### 6.2.1 Event envelope

Each durable event should contain:

```text
DomainEvent
├── event_id
├── event_type
├── aggregate_type
├── aggregate_id
├── sequence_number
├── occurred_at
├── recorded_at
├── causation_id
├── correlation_id
├── actor_type
├── actor_id
├── schema_version
└── payload
```

`occurred_at` records when the underlying action occurred, to the extent known. `recorded_at` records when the event was durably accepted.

`causation_id` identifies the event or request that caused the current event. `correlation_id` links a broader workflow, such as the generation of one broadcast segment.

These identifiers are essential when reconstructing asynchronous operations.

## 6.3 Event sourcing without unnecessary complexity

MindBroadcast does not need to implement full event sourcing for every entity.

A practical architecture is:

- Relational tables hold the current operational state.
- Append-only domain events preserve significant state transitions.
- Immutable source captures preserve historical inputs.
- Versioned snapshots preserve selected views of the world model.
- Provenance relationships connect inputs, transformations, decisions, and outputs.

This hybrid model is easier to operate than a pure event-sourced system while retaining many of its auditability benefits.

Where an entity's historical evolution is especially important, the system should preserve explicit revisions or reconstructable transitions.

## 6.4 Transactional outbox

A critical reliability problem arises when the application updates the database and then attempts to notify a worker through an in-memory queue.

If the process crashes after committing the database transaction but before publishing the notification, the work may never happen.

The reverse ordering can also cause problems. A worker may receive a notification for a state change that never commits.

MindBroadcast should use a transactional outbox for important asynchronous work.

Within one database transaction, the application:

1. Persists the domain state change.
2. Inserts an outbox record describing the work to be scheduled.
3. Commits both records atomically.

A dispatcher subsequently publishes the outbox item to the relevant worker or queue.

Example:

```text
Transaction:
    INSERT Article
    INSERT DomainEvent
    INSERT OutboxMessage
COMMIT

Dispatcher:
    Read pending OutboxMessage
    Publish to worker queue
    Mark delivery acknowledged
```

The dispatcher must tolerate duplicate delivery. Workers must be idempotent.

The design should assume **at-least-once delivery**, not magical exactly-once execution across arbitrary subsystems.

## 6.5 Idempotency

An operation is idempotent if repeating it does not create an unintended additional effect.

Idempotency is mandatory for:

- Fetch retries.
- Article capture.
- Content extraction.
- Claim extraction.
- Embedding generation.
- Story assignment.
- Segment scheduling.
- TTS generation.
- Audio publication.
- Listener-message ingestion.

A practical idempotency key can be derived from the operation type, canonical input identifier, input version, and processing configuration.

For example:

```text
claim-extraction:
    article_version_id
    extractor_version
    extraction_configuration_hash
```

A retry using the same input and configuration should not silently produce a second active set of claims.

If a newer extraction configuration produces different results, those results should be recorded as a new processing version.

## 6.6 Database and filesystem consistency

MindBroadcast will likely store some large artifacts outside SQLite, including raw source captures, generated audio, and diagnostic bundles.

A database transaction cannot atomically commit an arbitrary filesystem write.

The application must therefore use a controlled artifact lifecycle:

1. Write the artifact to a temporary location.
2. Flush and finalize the file.
3. Calculate its content hash.
4. Move it into its durable artifact location.
5. Commit a database record referencing the finalized artifact.
6. Reconcile orphaned files or missing references during maintenance.

For audio generation, a failed artifact commit must not result in a database record claiming that a complete, playable file exists when it does not.

Artifact cleanup must also avoid deleting files referenced by active or historical broadcast records.

## 6.7 Recovery and consistency checks

On startup, MindBroadcast should perform a bounded recovery procedure.

The procedure should:

1. Verify database accessibility.
2. Apply permitted migrations.
3. Check critical schema and foreign-key invariants.
4. Recover abandoned job leases.
5. Requeue expired in-progress work where safe.
6. Reconcile incomplete artifact writes.
7. Identify outbox messages that remain pending.
8. Detect incomplete broadcast sessions.
9. Restore the most recent valid operational state.
10. Record the recovery result.

Recovery should not require rebuilding the entire knowledge graph unless corruption or a specific migration makes that necessary.

The system must distinguish recoverable incomplete work from genuine data-integrity violations. It should not silently repair serious inconsistencies without leaving a record of what changed.

---

# 7. Ingestion and Source Management

## 7.1 Ingestion objectives

The ingestion layer converts external information into durable, normalized observations.

It should not determine the final editorial meaning of every article. Its primary responsibility is to acquire and preserve information with enough context to support later processing.

The ingestion pipeline is:

```text
Source Configuration
       ↓
Polling Scheduler
       ↓
Fetch Request
       ↓
Response Validation
       ↓
Format Parser
       ↓
Canonicalization
       ↓
Duplicate Detection
       ↓
Durable Article Capture
       ↓
Ingestion Event
       ↓
Knowledge Processing Queue
```

The initial implementation should prioritize RSS and Atom feeds because they are relatively simple to configure and maintain.

Additional connectors can support JSON APIs, official publication endpoints, and explicitly permitted web pages.

## 7.2 Source adapters

Each connector should implement a common interface.

Illustrative contract:

```python
class SourceAdapter:
    async def fetch_updates(self, cursor=None):
        ...

    async def parse_response(self, response):
        ...

    async def health_check(self):
        ...

    async def get_checkpoint(self):
        ...

    async def restore_checkpoint(self, checkpoint):
        ...
```

The concrete interface may differ, but all adapters must support explicit error reporting, checkpoint handling, and normalized output.

The ingestion system should not assume that every source exposes a reliable publication timestamp or stable identifier.

When information is missing, the system should preserve that uncertainty rather than inventing values.

## 7.3 Scheduling and backpressure

Each source should have its own polling configuration and failure policy.

The scheduler should account for:

- Configured polling interval.
- Last successful poll.
- Last observed publication.
- Rate limits.
- Network failures.
- Retry delay.
- Source importance.
- Historical source responsiveness.
- Current ingestion backlog.

The scheduler should not poll every source at the same fixed frequency regardless of circumstances.

Exponential backoff with jitter should be used for repeated transient failures. Retry limits and a recovery policy should prevent one failing source from consuming all available resources.

If the ingestion queue becomes overloaded, the system should prioritize preserving incoming source observations over immediately running expensive language-model analysis.

Newly observed information can be processed later. Information that was never captured may be permanently lost.

## 7.4 Canonicalization

Canonicalization must be conservative.

For URLs, the system may normalize host casing, remove known tracking parameters, normalize safe path variations, and follow permitted redirects.

However, query parameters cannot universally be discarded. Some sites use them to identify distinct articles or document versions.

The canonicalization policy should be configurable and source-aware.

The system should preserve:

- Original URL.
- Final fetched URL.
- Canonical URL when available.
- Redirect chain where useful.
- Normalization rules applied.

This enables the system to investigate unexpected merges and duplicate detections.

## 7.5 Deduplication

Deduplication should occur at multiple levels.

**Exact duplication:** The same normalized source artifact is observed again.

**URL duplication:** Multiple feed entries point to the same canonical publication.

**Content duplication:** Different URLs contain substantially identical text.

**Syndication duplication:** Several publications reproduce the same article or wire report.

**Semantic duplication:** Different articles report the same underlying development using different language.

These levels must not be conflated.

A duplicate article should not create a new event merely because its URL differs. Conversely, two articles discussing the same event should not be discarded merely because their subject matter is similar.

The deduplication system should produce candidate relationships and confidence assessments rather than making every merge irreversible.

### 7.5.1 Deduplication pipeline

```text
New Article
    ↓
Canonical URL Match
    ├── Exact match → Existing publication/version
    └── No match
         ↓
Content Hash Match
    ├── Exact match → Duplicate capture
    └── No match
         ↓
Near-Duplicate Text Comparison
    ├── High similarity → Candidate duplicate
    └── Low similarity
         ↓
Semantic and Event Comparison
    ├── Same development → Associate with existing story
    └── New development → Candidate new story
```

A near-duplicate article may contain a meaningful correction, a new quotation, or an updated casualty figure. Such content must not be discarded solely because most of the article is unchanged.

## 7.6 Security of external content

External articles are untrusted input.

They may contain malicious HTML, tracking elements, misleading metadata, prompt-injection instructions, or content intended to manipulate automated systems.

MindBroadcast must treat source content as data, never as an instruction to change its system policies.

Requirements:

- Strip or safely handle active HTML content.
- Validate URL schemes.
- Prevent access to loopback, private-network, and metadata endpoints through user-configured or redirected URLs.
- Apply connection and response-size limits.
- Restrict redirects.
- Set request timeouts.
- Avoid executing scripts from fetched pages.
- Sanitize displayed content.
- Keep source text separate from system instructions in model prompts.
- Never grant a source the ability to authorize tools or modify application configuration.

These protections apply even to sources the system considers generally reputable.

## 7.7 Ingestion acceptance criteria

The ingestion subsystem is complete when it can demonstrate that:

1. A configured feed can be fetched and parsed.
2. A malformed feed does not crash the application.
3. Duplicate fetches do not create duplicate active articles.
4. A new article is durably stored before downstream processing is considered scheduled.
5. Source and observation timestamps are preserved separately.
6. Network failure does not corrupt previously captured information.
7. Retried work is idempotent.
8. A restarted process can recover pending ingestion tasks.
9. A corrected or revised article remains distinguishable from its earlier captured version.
10. External content cannot directly execute application commands.

---

# 8. The Knowledge Compiler

## 8.1 Purpose

The Knowledge Compiler transforms unstructured source material into a structured, versioned representation of the information contained in that material.

This subsystem is central to MindBroadcast.

It is also where the project's broader ideas about provenance graphs, canonical knowledge units, deterministic validation, and controlled AI processing become directly applicable.

The compiler should be designed as a sequence of explicit passes rather than a single opaque language-model operation.

Conceptually:

\[
\text{Source Artifact}
\rightarrow
\text{Normalized Representation}
\rightarrow
\text{Extracted Objects}
\rightarrow
\text{Resolved Relationships}
\rightarrow
\text{Validated Knowledge}
\]

Each pass has a defined input, output, version, and failure mode.

## 8.2 Compiler passes

### Pass 1: Structural normalization

The compiler receives a captured article and creates a normalized document representation.

This includes:

- Title.
- Body text.
- Paragraph boundaries.
- Headings.
- Publication metadata.
- Author information.
- Quotations where identifiable.
- Links and references.
- Document language.
- Text offsets.
- Extraction warnings.

The normalized representation should preserve enough location information to identify the original passage from which a claim or evidence excerpt was extracted.

### Pass 2: Entity extraction

The system identifies candidate entities and mentions.

For example:

> The committee approved the proposal on Tuesday after a three-hour hearing.

Potential entities include the committee and the proposal, while the sentence also provides temporal and event-related information.

Entity extraction should record the exact source span and extraction method.

It should not automatically merge the extracted mention into an existing canonical entity.

### Pass 3: Claim extraction

The compiler identifies propositions asserted by the article.

Each extracted claim should contain:

- Canonical proposition.
- Source passage.
- Claim type.
- Named entities.
- Temporal qualifiers.
- Quantities and units where relevant.
- Attribution.
- Extraction confidence.
- Model and prompt version.
- Link to the source article version.

The extraction process must preserve attribution.

For example, these statements have different meanings:

- A minister said that the policy had reduced inflation.
- The policy reduced inflation.
- An analyst argued that the policy may reduce inflation.

The system must not silently transform an attributed statement or hypothesis into an unqualified factual assertion.

### Pass 4: Evidence extraction

The compiler associates source passages and structured source artifacts with the propositions they may support, qualify, or contradict.

Evidence extraction should preserve the distinction between the existence of a statement and the truth of that statement.

An official transcript may strongly support the claim that a statement was made. It does not necessarily support the underlying factual proposition contained in that statement.

### Pass 5: Entity resolution

The system compares candidate entities against existing records.

Resolution may use:

- Exact identifiers.
- Alias dictionaries.
- Contextual matching.
- Entity types.
- Known relationships.
- Temporal consistency.
- Model-generated candidate explanations.

The compiler should separate candidate generation from the decision to merge.

High-confidence deterministic matches may be accepted automatically. Ambiguous matches should remain unresolved or enter a review queue.

### Pass 6: Event resolution

The compiler identifies whether the article describes:

- An existing event.
- A material update to an existing event.
- A related but distinct event.
- Several separate events.
- A situation whose relationship to existing events remains uncertain.

Event resolution must account for time, location, participants, event type, and the actual proposition being reported.

A language model can propose associations, but the resulting relationships should be recorded with their basis and confidence.

### Pass 7: Contradiction and corroboration analysis

The system evaluates new claims against existing claims and evidence.

It should identify potential:

- Corroboration.
- Direct contradiction.
- Differences in measurement.
- Differences in temporal scope.
- Different definitions.
- Attribution differences.
- Stale information.
- Apparent contradictions caused by article revisions.

Not all conflicting language indicates a contradiction.

For example, two sources may report different unemployment rates because they refer to different months or use different measures. The system should attempt to identify those distinctions before marking the claims as contradictory.

### Pass 8: Knowledge integration

Validated objects and relationships are committed to persistent storage.

The integration transaction should preserve:

- Extracted object identifiers.
- Source provenance.
- Processing versions.
- Resolution decisions.
- New domain events.
- Outbox messages for downstream work.

If one critical part of the transaction fails, the system must not leave a partially integrated set of records that appears complete.

Where partial processing is permitted, its incomplete status must be explicit.

## 8.3 Canonical Knowledge Units

The system should support a concept called the **Canonical Knowledge Unit**, or CKU.

A CKU is a stable, addressable representation of a meaningful piece of knowledge or an assertion about the world.

A CKU should not be synonymous with a sentence, an embedding, or a source document.

A single article may generate many CKUs. Several articles may support the same CKU. A CKU may be revised as evidence changes, while its historical versions remain accessible.

A practical CKU representation might contain:

```text
CanonicalKnowledgeUnit
├── id
├── canonical_content
├── unit_type
├── epistemic_status
├── source_references
├── evidence_references
├── entity_references
├── event_references
├── relationship_references
├── validity_interval
├── observation_interval
├── version
├── supersedes_version
└── provenance_manifest
```

The exact abstraction boundary between CKUs and the underlying `Claim`, `Evidence`, and `Entity` models remains an implementation decision.

The safest initial design is to treat CKUs as a stable interface over existing domain objects, rather than introducing a second competing system of record.

A CKU can be assembled from a claim and its associated evidence, or it can represent a higher-level synthesized proposition. The schema must identify which type it is.

### 8.3.1 CKU identity

The identity of a CKU should not depend exclusively on its text.

Two differently worded propositions may express the same underlying assertion, while two nearly identical sentences may refer to different times or quantities.

Canonical identity should account for the proposition's semantics and relevant qualifiers.

The system should preserve a distinction between:

- A stable conceptual identity.
- A particular textual representation.
- A particular evidence-backed version.
- A particular assessment of that version.

If a claim changes materially, the system should create a new version or a distinct claim linked through an explicit supersession relationship.

It should not silently rewrite the prior proposition.

## 8.4 Embeddings and semantic retrieval

Embeddings are useful for finding related articles, identifying potential duplicates, retrieving historical context, and connecting questions to relevant evidence.

They are not a substitute for structured relationships.

MindBroadcast should use semantic retrieval alongside:

- Exact identifiers.
- Full-text search.
- Entity indexes.
- Temporal filters.
- Source filters.
- Claim status filters.
- Story and event relationships.

A retrieval request should be able to ask for evidence about a specific proposition, rather than simply retrieving documents that are semantically similar to the query.

For example, the question:

> What evidence supports the claim that the regulation reduced operating costs?

should retrieve evidence associated with the causal proposition, relevant measurements, counterevidence, and appropriate temporal scope.

A collection of articles that merely discuss the regulation is not sufficient.

The initial implementation may use SQLite full-text search and a local embedding index. A separate vector database should be introduced only if the existing retrieval layer cannot meet measured performance or functionality requirements.

## 8.5 Versioned compilation

Every compiler pass that depends on a model, prompt, normalization rule, or algorithm must record its version.

The system should be able to answer:

- Which extractor produced this claim?
- Which model generated this summary?
- Which normalization rules were applied?
- Which evidence was available during assessment?
- Which entity-resolution algorithm merged these records?
- Why did a previous compiler version produce a different result?
- Which derived objects must be recomputed after a material change?

The compiler should not require a complete rebuild whenever one component changes.

Instead, dependency tracking should identify which derived objects are invalidated by a new article version, a changed entity resolution, or a revised extraction algorithm.

---

# 9. World State and Continuous Understanding

## 9.1 From article collections to an evolving model

A database containing thousands of articles is not automatically a model of the world.

The world model must represent relationships, changes, unresolved questions, and the historical evolution of information.

MindBroadcast should maintain both a current operational view and a historical record of how that view developed.

The current view answers questions such as:

- What are the active stories?
- Which events have recently changed?
- Which claims remain disputed?
- What evidence supports the current account?
- Which important relationships have recently emerged?
- What questions remain unresolved?
- What has the broadcaster already communicated?

The historical view answers different questions:

- What did the system believe it knew at a given time?
- Which sources had been observed by then?
- Which claim assessments were active?
- Which stories were selected for broadcast?
- Which corrections occurred later?
- Why did the system's interpretation change?

These capabilities are related but should not be implemented as one undifferentiated state object.

## 9.2 Material change detection

A new article does not necessarily mean that the underlying story has changed.

The system must distinguish the arrival of new content from the arrival of new information.

A material change may include:

- A newly reported event.
- A confirmed decision.
- A new quantitative measurement.
- A meaningful revision to a previously reported number.
- A newly identified participant.
- A previously unknown causal mechanism.
- A significant contradiction.
- A correction to an earlier claim.
- Evidence that changes the status of an unresolved question.
- A consequential development in a related event.

The system should classify changes by type and significance.

This classification influences editorial scheduling and helps prevent the broadcaster from repeatedly announcing the same information.

## 9.3 Temporal reasoning

The world model must handle information that becomes available after the events it describes.

For example, an investigation published today may establish details about an incident that occurred months ago.

The system should not necessarily rank this information as old merely because the underlying event is old.

At minimum, the editorial engine should consider:

- Event time.
- Source publication time.
- First-observed time.
- First-processed time.
- Last-material-update time.
- Time since the story was last covered.
- Whether the current report changes the system's understanding.

A late discovery can have high novelty. A newly published article can have low novelty if it simply repeats known information.

## 9.4 World-state uncertainty

The system should represent uncertainty at the level where it occurs.

If the event itself is disputed, the event status should reflect that. If the event is established but the number of people affected is uncertain, the uncertainty should attach to the relevant quantitative claims. If the evidence is clear but the causal interpretation remains uncertain, the uncertainty should attach to the causal proposition.

A single confidence score attached to an entire story is too coarse.

A story may contain many well-established facts and one highly disputed claim.

The world model should preserve this heterogeneity.

## 9.5 World-state update procedure

A knowledge update should follow a controlled sequence:

1. Persist the new source observation.
2. Compile new entities, claims, and evidence.
3. Resolve relationships against existing knowledge.
4. Assess potential contradictions and corrections.
5. Update affected events and stories.
6. Invalidate dependent summaries or analytical artifacts where necessary.
7. Create a durable record of the resulting state changes.
8. Update the editorial planner's view of available developments.
9. Make the updated state available to subsequent generation requests.

A change to one claim should not automatically invalidate every story summary in the database.

The system should maintain explicit dependencies between source records, derived objects, and cached analytical artifacts.

---

# 10. Story Intelligence and Editorial Prioritization

## 10.1 The editorial problem

The editorial engine decides what the broadcaster should discuss next.

This is not equivalent to sorting articles by publication time, ranking them by popularity, or asking a language model what is interesting.

The system must allocate a finite amount of broadcast time across an effectively unbounded set of possible topics.

Each topic has a different combination of importance, novelty, evidentiary support, audience relevance, unresolved questions, historical significance, and redundancy.

The engine must also consider the cost of changing subjects, the amount of coverage a story has already received, and the value of continuing an existing discussion.

The editorial objective is therefore a constrained scheduling problem.

Let \(S_t\) be the set of eligible stories at time \(t\). For each story \(s\), define:

\[
P(s,t) =
f\left(
I_s,
N_s,
V_s,
E_s,
R_s,
U_s,
A_s,
C_s,
D_s
\right)
\]

where:

- \(I_s\): estimated real-world importance.
- \(N_s\): novelty of the available information.
- \(V_s\): temporal velocity of the story.
- \(E_s\): evidentiary quality and relevance.
- \(R_s\): relationship to other important developments.
- \(U_s\): value of unresolved questions.
- \(A_s\): audience relevance.
- \(C_s\): coverage continuity and editorial context.
- \(D_s\): redundancy or repetition penalty.

These are conceptual variables. They must be operationally defined before being combined into a production ranking.

The score should be accompanied by explanations describing which factors materially influenced the ranking.

A high score must not conceal that a story was ranked highly because of speculation, popularity, or an unreliable source.

## 10.2 Importance

Importance measures the potential real-world significance of a development.

Possible factors include:

- Number of people affected.
- Scale of economic consequences.
- Legal or institutional significance.
- Safety implications.
- Geopolitical consequences.
- Irreversibility of the decision.
- Long-term effects.
- Relevance to ongoing major events.
- Potential to materially change public understanding.

Importance should not be defined solely by the number of people discussing a subject.

A minor celebrity controversy can attract more attention than a major legislative decision. MindBroadcast should be capable of recognizing that attention and importance are related but distinct.

## 10.3 Novelty

Novelty measures how much the newly available information changes the system's current understanding.

It should be calculated against the existing world model rather than against article text alone.

Potential novelty components include:

\[
N_s =
w_1N_{\text{claims}}
+
w_2N_{\text{events}}
+
w_3N_{\text{evidence}}
+
w_4N_{\text{relationships}}
+
w_5N_{\text{corrections}}
\]

The weights are tunable parameters, not universal constants.

The engine should recognize several different forms of novelty:

- A completely new event.
- A new claim about an existing event.
- New evidence for an existing claim.
- A change in claim status.
- A newly discovered relationship between events.
- A correction that invalidates an earlier account.
- A new consequence of an established event.

The system should penalize repeated content while preserving the ability to revisit a story when a genuinely consequential development occurs.

## 10.4 Temporal velocity

Temporal velocity estimates the rate at which a story is developing.

A story with several meaningful developments in a short period may deserve more immediate attention than a static story of similar importance.

However, velocity must be measured using meaningful changes rather than article volume alone.

One possible model is:

\[
V_s(t) =
\sum_{d \in \mathcal{D}_s}
W(d)\exp\left(-\frac{t-t_d}{\tau}\right)
\]

where:

- \(\mathcal{D}_s\) is the set of detected material developments.
- \(W(d)\) is the estimated significance of development \(d\).
- \(t_d\) is the observation or effective development time.
- \(\tau\) controls how quickly the contribution decays.

This produces a recency-weighted development measure.

The decay parameter should vary by story type. A rapidly evolving emergency and a long-running economic policy discussion have different temporal characteristics.

The system should also distinguish a surge in reporting caused by new evidence from a surge caused by repeated publication of the same claim.

## 10.5 Knowledge graph centrality

The knowledge graph can identify stories connected to many important entities, events, or unresolved questions.

For example, one policy decision may connect several economic developments, court cases, and institutional changes.

Graph centrality can help identify stories whose significance extends beyond the immediate event.

However, graph centrality is not the same as real-world importance.

A heavily covered subject may become central simply because the system has ingested many articles about it. A new but consequential event may initially have few connections.

Centrality should therefore be normalized and used as a contextual feature rather than a decisive ranking mechanism.

Potential measures include:

- Degree centrality.
- Weighted degree.
- Temporal centrality.
- PageRank-style propagation.
- Connectivity to explicitly designated high-impact entities.
- Number and importance of newly established relationships.

If a PageRank-like measure is used, the graph's nodes, edges, weights, and update procedure must be defined explicitly. Otherwise, the score risks becoming an opaque proxy for source volume.

## 10.6 Evidence quality

Evidence quality must influence broadcast eligibility as well as ranking.

The system should distinguish between:

- Primary documentary evidence.
- Directly attributable statements.
- Independent corroboration.
- Secondary reporting.
- Anonymous or weakly attributable assertions.
- Unsupported social-media claims.
- Conflicting accounts.
- Explicitly corrected material.

The engine should evaluate whether evidence is appropriate for the claim being made.

A primary source may be highly reliable for the fact that an institution issued a statement but less conclusive about the accuracy of that statement's contents.

Source ownership and syndication relationships should be considered when assessing independence.

The engine must also account for source diversity. A story supported by independent evidence from several sources should not be treated as equivalent to a story supported by many outlets repeating one original report.

## 10.7 Audience relevance

The system should be able to adapt its programming to listener interests.

Audience relevance can incorporate:

- Explicit topic subscriptions.
- Direct listener requests.
- Repeated requests for particular subjects.
- Voluntary feedback.
- Playback behavior.
- Requests to avoid or reduce certain categories.
- Recent programming history.

However, audience relevance must not automatically override importance or evidence quality.

The system should avoid creating a feedback loop in which popular stories receive increasing coverage, which generates more interaction, which then causes them to receive still more coverage.

Audience signals should be bounded, and the editorial system should preserve room for important developments that have not yet attracted attention.

Where practical, preference updates should be explainable and reversible.

## 10.8 Coverage debt

A particularly useful concept is **coverage debt**.

Coverage debt represents the difference between the importance of a story and the depth of attention the broadcaster has given it.

A major event may have received only a brief announcement, leaving the audience without necessary context. Another event may have received ten repetitive segments without adding much new understanding.

Coverage debt should account for:

- Importance.
- Previous coverage depth.
- Time since the last substantive explanation.
- Unresolved questions.
- Missing historical context.
- Unexamined consequences.
- Previous corrections that require clarification.

Coverage debt provides a mechanism for returning to important subjects even when no new article has appeared.

It also helps the broadcaster avoid mistaking repetition for depth.

## 10.9 Coverage saturation

A story should eventually become less eligible for repeated coverage if the system has nothing materially new to say.

Coverage saturation measures whether additional broadcast time is likely to add value.

A story may be saturated because:

- No new evidence has appeared.
- The major implications have already been explained.
- Recent segments repeated earlier content.
- Important unresolved questions cannot currently be answered.
- Other stories have substantially greater marginal value.

Saturation must not permanently suppress a story. New evidence or a material change should reduce the saturation penalty.

## 10.10 Editorial selection objective

A practical initial objective is to maximize expected editorial value over a rolling scheduling window:

\[
\max_{x_{s,t}}
\sum_{s,t}
x_{s,t}
\left[
P(s,t)
-
\lambda R(s,t)
-
\mu T(s,t)
\right]
\]

subject to:

\[
\sum_s x_{s,t} \leq 1
\]

where:

- \(x_{s,t}\) indicates whether story \(s\) is allocated to a broadcast slot.
- \(P(s,t)\) represents editorial value.
- \(R(s,t)\) represents redundancy.
- \(T(s,t)\) represents transition cost.
- \(\lambda\) and \(\mu\) control the relative penalties.

Real implementations may use a simpler greedy ranking algorithm.

The mathematical formulation is valuable because it makes the problem explicit. It should not be interpreted as a requirement to introduce a complex optimization solver before the underlying scoring features are measurable.

## 10.11 Explainable story selection

Every selected story should have a recorded selection rationale.

Example:

```json
{
  "story_id": "story-123",
  "decision": "SELECTED",
  "reasons": [
    "New primary-source document",
    "Material change to an active claim",
    "High unresolved-question value",
    "Low recent coverage depth"
  ],
  "exclusions": [],
  "ranking_version": "editorial-ranker-v1",
  "decision_time": "2026-10-12T16:00:00Z"
}
```

This is an illustrative record, not an actual decision from the running application.

The rationale should be derived from structured decision features. A language model may produce a human-readable explanation, but the explanation must not replace the underlying decision record.

## 10.12 Editorial fairness and selection bias

A continuously operating broadcaster can unintentionally develop systematic biases through its source selection, ranking weights, audience feedback, and historical coverage patterns.

MindBroadcast should therefore monitor:

- Source concentration.
- Ownership-group concentration.
- Geographic distribution of coverage.
- Topic distribution.
- Frequency of revisiting the same entities.
- Differences between high-attention and high-importance stories.
- The proportion of claims supported by primary versus secondary sources.
- The number of disputed claims presented in definitive language.
- Whether certain topics are repeatedly excluded by the ranking model.

These measurements do not mechanically establish editorial fairness. They reveal patterns that require inspection.

The system should retain enough information to distinguish bias originating in the source corpus from bias introduced by extraction, ranking, generation, or editorial policy.

---

# 11. Editorial Control Plane

## 11.1 Purpose

The editorial control plane converts the current world model into a coherent broadcast plan.

The story engine identifies candidate developments. The control plane decides how those developments should be presented over time.

It manages the relationship between:

- Story selection.
- Segment structure.
- Persona assignment.
- Duration.
- Broadcast continuity.
- Transitions.
- Breaking-news interruptions.
- Audience questions.
- Current audio state.
- Available evidence.
- Model and TTS availability.

It should not be implemented as an unconstrained language-model agent that receives the entire world database and decides what to do.

The control plane should use explicit state, deterministic scheduling rules, and narrowly scoped model proposals.

## 11.2 Broadcast plan

A broadcast plan is a versioned editorial proposal.

Example structure:

```text
BroadcastPlan
├── id
├── session_id
├── created_at
├── plan_version
├── planning_horizon
├── world_snapshot_id
├── editorial_policy_version
├── status
└── segments[]
```

Each planned segment contains:

```text
PlannedSegment
├── id
├── story_id
├── segment_type
├── assigned_personas
├── target_duration_seconds
├── required_context
├── required_claims
├── prohibited_claims
├── unresolved_questions
├── transition_from_previous
├── interruption_policy
└── status
```

The plan should be treated as a proposal that may be revised when material developments occur.

Once a segment has begun generating audio, its already published portions should not be retroactively rewritten.

## 11.3 Segment types

The initial system should support several distinct segment types:

| Type | Purpose |
|---|---|
| `HEADLINE` | Concise announcement of a significant development. |
| `NEWS_REPORT` | Structured reporting of a recent event. |
| `EXPLAINER` | Background, definitions, and causal context. |
| `ANALYSIS` | Interpretation of evidence and implications. |
| `DEBATE` | Structured disagreement between personas. |
| `FOLLOW_UP` | Reassessment of a previously covered story. |
| `CORRECTION` | Explicit revision of an earlier broadcast claim. |
| `AUDIENCE_RESPONSE` | Response to a listener question or request. |
| `HISTORICAL_REVIEW` | Reconstruction of the development of an issue. |
| `SYNTHESIS` | Analysis of relationships among multiple stories. |
| `TRANSITION` | Short connective speech between segments. |
| `FILLER_ANALYSIS` | Clearly identified background discussion when little new reporting is available. |

`FILLER_ANALYSIS` should be an internal classification, not necessarily the phrase spoken to listeners.

The important requirement is that the system knows when it is discussing previously established material rather than reporting a new development.

## 11.4 Segment duration

The original design target is approximately 10 to 40 seconds per broadcast turn.

This should be treated as a default operating range rather than a rigid constraint on every segment.

A useful initial policy is:

- Short headline: 10 to 15 seconds.
- Standard turn: 15 to 30 seconds.
- Extended analytical turn: 30 to 40 seconds.
- Longer explanation: multiple linked turns.
- Exceptional breaking update: as short as necessary to communicate the supported information.

The scheduler should reason in terms of expected spoken duration rather than word count alone.

Speech duration varies by voice, language, punctuation, speaking rate, and synthesis configuration.

A rough initial estimator can use:

\[
D_{\text{estimated}} =
\frac{60W}{R}
\]

where:

- \(W\) is the number of spoken words.
- \(R\) is the expected words per minute.

At 150 words per minute, 25 words take approximately 10 seconds. Forty words take approximately 16 seconds.

The estimate should be calibrated against actual TTS output.

## 11.5 Story transitions

The system should maintain a transition policy that balances coherence with responsiveness.

A transition may explain:

- Why the next story matters.
- How the next story relates to the current one.
- Why a previous discussion is being revisited.
- Why the broadcast is moving away from a developing event.
- Which question the next segment will address.

The transition should not invent a connection merely to make unrelated stories sound unified.

If two stories are connected only by an analytical hypothesis, the broadcaster should communicate that status explicitly.

## 11.6 Breaking-news interruptions

A new development may warrant interrupting a planned segment.

However, constant interruptions can make the broadcast incoherent and undermine the audience's ability to understand any individual story.

The interruption policy should evaluate:

- Materiality.
- Urgency.
- Evidence quality.
- Public-safety relevance.
- Whether the current segment can be safely interrupted.
- Whether the new information is sufficiently verified.
- Whether a brief interruption is more appropriate than a full topic change.

The policy should support at least three actions:

```text
CONTINUE
QUEUE_NEXT
INTERRUPT
```

`CONTINUE` preserves the current segment.

`QUEUE_NEXT` gives the development priority after the current segment.

`INTERRUPT` suspends ordinary programming to communicate an urgent, sufficiently supported update.

An interruption must not discard the current segment's history. The system should record where it stopped, whether it completed its intended point, and whether the subject should be resumed later.

## 11.7 Planner state machine

The planner should use explicit states:

```text
IDLE
  ↓
EVALUATING
  ↓
PLAN_PROPOSED
  ↓
PLAN_VALIDATED
  ↓
SEGMENT_QUEUED
  ↓
SEGMENT_ACTIVE
  ↓
SEGMENT_COMPLETED
  ↓
REASSESSING
  └──────────► EVALUATING
```

Additional transitions are required for cancellation, invalidation, failure, interruption, and recovery.

The planner must not treat a proposed segment as equivalent to an active segment.

It must also distinguish a generated script from a segment that has actually been delivered to listeners.

---

# 12. Persona Architecture

## 12.1 Personas as persistent analytical perspectives

MindBroadcast should support multiple personas with distinct identities, analytical styles, speaking voices, and persistent memories.

Personas are not merely names attached to language-model responses.

A meaningful persona should have a defined purpose within the broadcast, a stable set of preferences, a characteristic method of analysis, and a record of its previous participation.

For example, a broadcast may include:

- A primary news presenter who favors concise reporting.
- An analytical persona that examines institutions, incentives, and economic consequences.
- A skeptical persona that challenges weak evidence and unsupported assumptions.
- A historical persona that explains how current events emerged from earlier developments.
- An audience-facing persona that handles listener questions.

These are illustrative roles. The system should allow the user to define arbitrary personas without requiring a fixed cast.

## 12.2 Persona definition

A persona configuration should include:

```text
Persona
├── id
├── name
├── role
├── description
├── voice_profile_id
├── speaking_style
├── analytical_preferences
├── epistemic_preferences
├── rhetorical_preferences
├── interaction_policy
├── memory_policy
├── enabled
├── configuration_version
└── created_at
```

The persona's identity and editorial instructions must be stored separately from transient generation prompts.

A persona update should create a versioned configuration change rather than silently rewriting the instructions used by a previously generated segment.

## 12.3 Separation of epistemology and personality

A persona's personality may influence:

- Vocabulary.
- Humor.
- Speaking pace.
- Explanatory depth.
- Preferred analogies.
- The questions it asks.
- The interpretations it emphasizes.
- Its willingness to challenge another persona.

It must not independently determine whether a factual proposition is true.

The shared knowledge model should provide a common evidence baseline.

Personas may disagree about the significance of a policy while agreeing about what the policy contains. They may disagree about a likely causal mechanism while agreeing about the available measurements.

This distinction is essential for meaningful analytical debate.

## 12.4 Independent analysis

When a segment requires multiple perspectives, the system should generate their initial analyses independently.

The recommended sequence is:

1. Construct a shared evidence packet.
2. Identify the question under discussion.
3. Generate an initial analysis for each assigned persona.
4. Record the assumptions and evidence used by each analysis.
5. Identify substantive disagreements.
6. Generate a structured exchange addressing those disagreements.
7. Produce a final segment script.
8. Validate the script against the shared evidence packet.

Generating every persona response sequentially in one unconstrained conversation can cause later personas to inherit the assumptions and framing of earlier responses.

Independent first-pass analysis reduces this risk.

It does not eliminate correlated errors, especially when all personas use the same underlying model. That limitation should be documented.

## 12.5 Disagreement model

A useful disagreement should identify the precise proposition under dispute.

For each disagreement, the system should record:

```text
Disagreement
├── id
├── subject
├── proposition
├── persona_a_id
├── position_a
├── persona_b_id
├── position_b
├── shared_facts
├── disputed_assumptions
├── evidence_references
├── disagreement_type
└── resolution_status
```

Disagreement types may include:

- Factual uncertainty.
- Competing causal explanations.
- Different value judgments.
- Different forecasts.
- Different interpretations of institutional incentives.
- Different assessments of evidence quality.
- Different policy recommendations.

The system should not manufacture disagreement when the evidence supports a straightforward conclusion.

Likewise, it should not force a consensus when the underlying issue remains unresolved.

## 12.6 Persona memory

Persona memory should be persistent but bounded.

It may contain:

- Previous arguments.
- Established preferences.
- Questions raised in earlier segments.
- Prior analytical conclusions.
- Corrections to earlier conclusions.
- Unresolved hypotheses.
- Audience interactions relevant to the persona.
- Recurring subjects of interest.

Memory must not become an uncontrolled transcript appended to every prompt.

The memory subsystem should distinguish:

**Episodic memory:** What happened in a previous broadcast.

**Semantic memory:** Generalized knowledge or stable conclusions derived from prior experience.

**Preference memory:** The persona's established style and editorial preferences.

**Open-question memory:** Questions and hypotheses that have not yet been resolved.

**Correction memory:** Prior conclusions that were revised or withdrawn.

Each memory should have provenance and, where appropriate, a confidence or validity status.

A persona should be able to remember that it previously argued for a position while also recognizing that subsequent evidence weakened that position.

## 12.7 Persona consistency

The system should periodically evaluate whether each persona remains consistent with its configured role.

This does not mean the persona must never change its mind.

It means changes should be explainable through new evidence, revised assumptions, or explicit configuration updates.

A persona that becomes more cautious after several incorrect predictions may represent a legitimate change in analytical behavior. A persona that randomly changes its political or economic outlook from one segment to the next indicates a consistency problem.

Persona evaluations should measure:

- Stability of configured voice and style.
- Consistency of recurring analytical assumptions.
- Ability to acknowledge contradictory evidence.
- Appropriate revision of prior conclusions.
- Frequency of unsupported factual assertions.
- Degree of unintentional imitation of other personas.

---

# 13. The Broadcast Director

## 13.1 Responsibility

The Broadcast Director is the control component responsible for coordinating the actual spoken program.

The editorial planner decides what should happen. The Broadcast Director manages the transition from that plan to speech.

Its responsibilities include:

- Selecting the next eligible segment.
- Assigning the speaking persona.
- Determining whether another persona should respond.
- Coordinating script generation.
- Ensuring the next segment has passed validation.
- Managing the speech queue.
- Sequencing generated audio.
- Handling interruptions.
- Monitoring playback state.
- Initiating transitions.
- Recovering from generation or TTS failures.
- Recording the actual broadcast history.

The director must be stateful, but it should not own the underlying world model or independently redefine editorial policy.

## 13.2 Director state

The director should maintain:

```text
BroadcastSession
├── id
├── started_at
├── stopped_at
├── operating_mode
├── current_plan_id
├── current_segment_id
├── current_persona_id
├── playback_state
├── session_sequence
├── last_completed_segment_id
├── pending_interruption_id
└── metadata_json
```

The current session state should be persisted sufficiently often to support recovery after process termination.

In-memory buffers may be lost during a crash. The system must know which segments were generated, which were queued, which were started, and which were completed.

## 13.3 Segment lifecycle

A segment should progress through explicit states:

```text
PROPOSED
    ↓
PLANNED
    ↓
GENERATING
    ↓
GENERATED
    ↓
VALIDATING
    ↓
APPROVED
    ↓
SYNTHESIZING
    ↓
READY
    ↓
QUEUED
    ↓
PLAYING
    ↓
COMPLETED
```

Failure and cancellation transitions are required at each appropriate stage.

For example, a failed TTS request should not invalidate the underlying evidence or necessarily require a new script. The segment can remain approved while the media subsystem retries synthesis.

Likewise, a failed script validation should return the segment to generation or mark it rejected. It must not enter the playback queue.

## 13.4 The difference between generated and broadcast content

The system must preserve the distinction between:

- Text generated by a language model.
- Text that passed validation.
- Text submitted to TTS.
- Audio successfully synthesized.
- Audio placed in the delivery buffer.
- Audio transmitted to a client.
- Audio actually consumed by a listener, if the client provides reliable playback telemetry.

These are separate events.

A server cannot reliably infer that a listener heard an entire segment merely because it wrote audio bytes to a network connection.

The UI and analytics should communicate these distinctions accurately.

## 13.5 Interrupt-safe audio

If a breaking development requires an interruption, the system must define what happens to already synthesized audio.

The initial implementation should favor segment-boundary interruptions.

A segment-boundary interruption allows the current short turn to finish before the next urgent segment begins.

For genuinely urgent situations, the system may support a more immediate interruption, but it must record any abandoned speech and prevent the abandoned audio from accidentally playing after the interruption.

The audio queue should therefore support:

- Queue inspection.
- Segment cancellation.
- Priority changes.
- Explicit end-of-segment markers.
- Session generation identifiers.
- Stale-chunk rejection.

Every audio chunk should be associated with a segment and a particular synthesis attempt.

When a segment is canceled or superseded, chunks belonging to its obsolete generation must not be delivered as if they were current.

## 13.6 Exactly-once publication is not assumed

Network delivery can fail after the client has received some audio but before the server knows that the transmission completed.

MindBroadcast should not claim that exactly-once playback is guaranteed.

Instead, the system should use segment identifiers, chunk sequence numbers, and explicit session state to make delivery recoverable and duplicate effects detectable.

The browser should be able to reconnect and determine the current broadcast state.

Depending on the streaming protocol, it may resume at a segment boundary or reconnect to the live position.

---

# 14. Language-Model Orchestration

## 14.1 Provider abstraction

MindBroadcast should support multiple language-model providers through a common interface.

The interface should allow local models to serve as the default while supporting optional remote models for tasks where they provide a measurable benefit.

The application must not depend directly on provider-specific APIs throughout its domain logic.

Illustrative interface:

```python
class LanguageModelProvider:
    async def generate(self, request):
        ...

    async def generate_structured(self, request, schema):
        ...

    async def stream(self, request):
        ...

    async def health_check(self):
        ...

    async def capabilities(self):
        ...
```

The actual interface should expose supported capabilities explicitly. Not every provider will support streaming, structured output, tool use, or the same context length.

A provider must not claim support for a capability that it cannot reliably deliver.

## 14.2 Model routing

Different tasks require different model capabilities.

MindBroadcast should not automatically use its most capable model for every operation.

A model-routing policy may select providers according to:

- Task type.
- Required output schema.
- Context length.
- Latency budget.
- Available memory.
- Quality requirements.
- Privacy requirements.
- Provider availability.
- Estimated computational cost.

An illustrative routing policy:

| Task | Preferred capability |
|---|---|
| Article classification | Fast, inexpensive inference. |
| Entity extraction | Reliable structured extraction. |
| Claim extraction | Strong instruction following and source grounding. |
| Contradiction analysis | Reasoning capability and explicit evidence comparison. |
| Story ranking assistance | Structured evaluation with a bounded feature set. |
| Persona dialogue | Natural language generation with stable stylistic control. |
| Long-form analysis | Larger context window and stronger reasoning. |
| Script validation | Separate validation prompt or model, supplemented by deterministic checks. |
| Embedding generation | Dedicated local embedding model. |

This is a capability map, not a requirement to use different model families for every row.

On constrained hardware, one model may handle several tasks sequentially. The architecture should preserve the ability to route tasks differently later.

## 14.3 Generation request contract

Every generation request should carry explicit context and constraints.

A request should include:

```text
GenerationRequest
├── request_id
├── task_type
├── input_record_ids
├── world_snapshot_id
├── evidence_packet
├── persona_configuration_version
├── prompt_version
├── output_schema_version
├── model_selection_policy
├── maximum_output_tokens
├── deadline
├── retry_policy
└── metadata
```

The evidence packet should be constructed by application code.

A model should not be asked to independently discover the authoritative state of the world from a large collection of loosely related documents when the application can supply a targeted, versioned set of relevant evidence.

## 14.4 Context assembly

The context builder is responsible for selecting the information a model receives.

It should retrieve:

- The current segment objective.
- Relevant claims.
- Supporting evidence.
- Material contradictory evidence.
- Relevant historical context.
- The current story summary.
- Previously broadcast statements.
- Relevant persona memories.
- Required disclaimers or attribution.
- Explicit uncertainty and unresolved questions.

It should not simply concatenate the most recent articles.

The context builder should prioritize relevance, provenance, diversity of evidence, and token efficiency.

It must also preserve distinctions between direct source material, system-generated summaries, persona interpretations, and user-provided content.

## 14.5 Prompt injection and tool restrictions

Source documents and listener messages are untrusted content.

A malicious article may instruct a model to ignore its original task, reveal private data, or generate a false report. A listener may submit a message designed to manipulate the system's editorial priorities.

The application must not rely on prompt wording alone to defend against these attacks.

Controls should include:

- Strict separation of instructions and data.
- No unrestricted tool execution from generation prompts.
- Explicit schemas for structured output.
- Validation of all proposed identifiers against the database.
- Allowlisted tools and arguments.
- Bounded model context.
- No direct database credentials in model context.
- No secrets in generation prompts.
- Deterministic authorization outside the model.
- Provenance checks before generated claims can be broadcast.

The language model may propose a query or action. The application decides whether that action is permitted.

## 14.6 Retry and timeout policy

Every model operation should have a deadline and an explicit failure policy.

Transient provider failures may be retried with bounded exponential backoff and jitter.

Malformed structured output may be retried with a correction prompt when the retry is safe and useful.

A repeated semantic failure should not result in an infinite regeneration loop.

The system should record:

- Original request.
- Provider and model.
- Prompt and schema versions.
- Attempt number.
- Validation results.
- Latency.
- Token usage when available.
- Failure classification.
- Final disposition.

Generation requests must be idempotently associated with their inputs so that retries do not create duplicate active segments.

## 14.7 Model disagreement and correlated errors

Using several personas does not guarantee independent reasoning.

If every persona uses the same model, receives the same framing, and retrieves the same incomplete evidence, they may confidently reproduce the same mistake.

MindBroadcast should therefore distinguish:

- Multiple personas.
- Multiple generation attempts.
- Multiple models.
- Independent source evidence.
- Independent verification methods.

These represent different kinds of diversity.

The system should never describe agreement among several outputs from one model as equivalent to independent factual corroboration.

---

# 15. Broadcast Script Construction and Validation

## 15.1 Script as a structured artifact

A broadcast script should be a first-class persistent artifact.

It should not exist only as an ephemeral string in application memory.

The script should contain structured segments, speaker identities, claim references, delivery instructions, and expected timing.

An illustrative schema:

```text
BroadcastScript
├── id
├── segment_id
├── version
├── created_at
├── generation_request_id
├── evidence_packet_id
├── status
└── turns[]
```

Each turn should contain:

```text
ScriptTurn
├── id
├── sequence
├── persona_id
├── text
├── speech_act
├── claim_references
├── evidence_references
├── uncertainty_markers
├── expected_duration
├── generation_metadata
└── validation_status
```

The script should distinguish factual reporting, interpretation, questions, predictions, humor, and other speech acts.

These classifications help determine which validation procedures apply.

## 15.2 Epistemic labeling

Every substantive broadcast statement should be classified internally according to its epistemic function.

Recommended categories:

- `FACTUAL_REPORT`
- `ATTRIBUTED_STATEMENT`
- `EVIDENCE_BASED_INTERPRETATION`
- `INFERENCE`
- `SPECULATION`
- `PREDICTION`
- `OPINION`
- `QUESTION`
- `HYPOTHETICAL`
- `HUMOR`
- `TRANSITION`

These categories are not mutually exclusive in every linguistic context. A single sentence may contain an attributed statement followed by an inference.

The initial implementation can classify statements at the sentence or clause level, depending on extraction quality.

The classification must remain internal metadata even when the spoken language does not explicitly announce the category.

## 15.3 Factual claims must have provenance

A script's factual claims should reference the claims and evidence that support them.

For example:

```text
Spoken statement:
    "The committee approved the proposal on Tuesday."

Claim references:
    claim-482

Evidence references:
    evidence-901
    evidence-917

Attribution:
    Official committee record

Validation:
    SUPPORTED
```

The IDs are illustrative.

A script should not be approved merely because it includes a list of sources somewhere in its metadata. The system must verify that the relevant evidence actually supports the particular statement.

## 15.4 Script validation pipeline

The validation pipeline should have multiple independent stages.

**Stage 1: Structural validation**

Check that the output matches the expected schema, references valid records, and satisfies basic length and formatting requirements.

**Stage 2: Provenance validation**

Verify that factual statements reference available evidence and that the referenced evidence is associated with the relevant claims.

**Stage 3: Contradiction review**

Check whether the script conflicts with material evidence or omits a critical qualification.

**Stage 4: Attribution validation**

Ensure that attributed statements remain attributed and that source claims are not silently presented as independently established facts.

**Stage 5: Epistemic consistency**

Check whether speculative or interpretive statements are presented with an appropriate level of qualification.

**Stage 6: Temporal validation**

Ensure that the script does not present outdated information as current when a newer material development has been recorded.

**Stage 7: Safety and privacy review**

Check for prohibited disclosures, unsupported high-impact allegations, and other content requiring additional restrictions.

**Stage 8: Delivery validation**

Check estimated duration, speaker assignment, text-to-speech compatibility, and transition requirements.

A segment should only enter the approved state after all mandatory checks have passed.

## 15.5 Validation outcomes

Validation should return structured results:

```text
APPROVED
APPROVED_WITH_QUALIFICATIONS
REQUIRES_REGENERATION
REQUIRES_REVIEW
REJECTED
```

The exact set of states can evolve, but the system must distinguish recoverable generation problems from content that should not be broadcast.

A segment that requires qualification may be repaired by adding attribution, narrowing the claim, or explicitly describing uncertainty.

A segment that makes an unsupported allegation should not automatically pass simply because its prose is polished.

## 15.6 Independent verification

Whenever practical, the final validation step should not simply ask the same model that wrote the script whether its own output is correct.

Possible verification mechanisms include:

- Deterministic claim-reference checks.
- Rule-based temporal checks.
- Direct comparison with source passages.
- A separate verifier prompt.
- A different model for high-impact segments.
- Explicit contradiction searches.
- Human review for exceptional cases.

No individual technique is sufficient.

The objective is to catch errors through multiple failure-independent mechanisms rather than treating a second language-model response as a guarantee of truth.

## 15.7 Post-broadcast correction

If new evidence invalidates a statement that was previously broadcast, the system must evaluate the need for a correction.

The correction workflow should:

1. Identify the affected claim.
2. Identify every broadcast segment that referenced it.
3. Determine whether the new information materially changes the statement.
4. Record the reason for the revised assessment.
5. Generate a correction script if required.
6. Validate the correction.
7. Give the correction appropriate editorial priority.
8. Link the correction to the original segment.
9. Preserve the original transcript and audio history.
10. Mark affected summaries and analytical artifacts for reassessment.

A correction should not merely replace the original transcript with revised wording.

The audience and operator should be able to distinguish what was originally said from what the system now believes is supported by the available evidence.

---

# 16. Text-to-Speech and Audio Infrastructure

## 16.1 Design objectives

The audio subsystem must transform approved scripts into continuous, ordered, low-latency speech.

It must support multiple voices, short speaking turns, interruption management, and continuous streaming.

The subsystem should remain independent of the language-model provider.

The initial implementation should prioritize a lightweight local TTS engine with predictable resource usage.

Higher-quality local models and optional remote synthesis providers can be added behind the same interface.

## 16.2 TTS provider interface

An illustrative interface:

```python
class TTSProvider:
    async def synthesize(self, request):
        ...

    async def stream_synthesize(self, request):
        ...

    async def health_check(self):
        ...

    async def capabilities(self):
        ...
```

The request should contain:

- Segment ID.
- Script-turn ID.
- Text.
- Voice profile.
- Language.
- Speaking-rate preference.
- Output audio format.
- Synthesis configuration version.
- Request deadline.

The response should provide the generated audio or audio chunks, duration metadata where available, format information, and a synthesis-attempt identifier.

## 16.3 Voice profiles

A voice profile should be separate from a persona.

One persona may have different voices for different operating modes. Multiple personas may share a voice provider while using different supported voices.

The profile should define:

```text
VoiceProfile
├── id
├── provider_id
├── voice_id
├── language
├── default_rate
├── pitch_parameters
├── output_format
├── normalization_policy
└── configuration_version
```

Not all providers support all parameters. Unsupported settings should be rejected or explicitly ignored according to a documented policy.

## 16.4 Chunking and latency

MindBroadcast should generate audio in short, ordered units.

For each turn:

1. Validate the script.
2. Divide the text into appropriate synthesis units.
3. Submit synthesis requests.
4. Validate the resulting audio format.
5. Normalize audio where necessary.
6. Associate each chunk with its segment and sequence number.
7. Add completed chunks to the delivery buffer.
8. Signal the end of the segment when all required chunks are ready.

The system should avoid unnecessarily fragmenting speech into tiny chunks that damage prosody or make sentence boundaries unnatural.

The optimal chunk size depends on the TTS engine and its streaming capabilities.

## 16.5 Audio formats

The system should choose an internal audio format suitable for the selected TTS provider and playback requirements.

PCM-based internal audio simplifies concatenation and processing, while compressed formats reduce network bandwidth.

A reasonable architecture is:

- Accept provider-specific output.
- Decode or normalize into a known internal representation where necessary.
- Maintain a canonical sample rate and channel layout for each active stream.
- Encode into the delivery format at the appropriate boundary.

The application must not assume that audio from different voices or providers can be concatenated directly without format normalization.

## 16.6 Audio buffering

The audio buffer should support:

- Ordered segment delivery.
- Bounded memory use.
- Backpressure.
- Cancellation.
- Queue inspection.
- Explicit end-of-stream signaling.
- Recovery from provider failure.
- Stale-chunk rejection.

A slow client must not be allowed to consume unlimited memory.

If the client cannot keep up with the live stream, the server should apply an explicit policy: bounded buffering, disconnection, or reconnection at the current live position.

## 16.7 Audio artifact storage

The system should optionally retain generated audio artifacts.

A stored artifact should include:

- Artifact ID.
- Segment ID.
- Script version.
- TTS provider.
- Voice profile version.
- Audio format.
- Content hash.
- Duration.
- Creation timestamp.
- Synthesis configuration.
- Retention policy.

The default retention policy should be configurable because indefinite audio storage can consume substantial disk space.

The system should be able to retain transcripts and provenance longer than large audio files when storage limits require that distinction.

## 16.8 Continuous stream behavior

The audio delivery layer must not depend on the generation of one enormous audio file.

It should stream completed segments incrementally.

The initial browser player can use an HTTP streaming endpoint with a defined framing protocol. Server-Sent Events can carry accompanying metadata, but SSE itself should not be treated as an audio codec or a substitute for proper binary audio delivery.

The audio transport and metadata transport should be logically separate.

For example:

```text
Audio transport:
    ordered audio chunks

Metadata transport:
    session state
    current segment
    speaker changes
    transcript updates
    correction notices
    playback events
```

A later deployment may add Icecast or another streaming-radio service without requiring changes to the editorial engine.

---

# 17. Audience Interaction

## 17.1 Listener interaction as an input channel

Listeners should be able to send messages, ask questions, request subjects, and influence the broadcast.

This functionality must remain separate from the core editorial pipeline.

An incoming message should not synchronously block article ingestion, knowledge compilation, or audio delivery.

Instead, it should become a durable input event that the editorial planner can evaluate.

## 17.2 Listener message model

A listener message should contain:

```text
ListenerMessage
├── id
├── session_id
├── client_id
├── received_at
├── message_type
├── content
├── topic_candidates
├── moderation_status
├── processing_status
├── response_segment_id
└── metadata_json
```

The system should avoid collecting unnecessary personal information.

Persistent listener identity should be optional. A local deployment may use a generated session identifier without requiring accounts or external authentication.

## 17.3 Message processing

The message-processing pipeline should:

1. Validate the request.
2. Apply rate limits.
3. Sanitize the content.
4. Persist the message.
5. Classify the message type.
6. Identify relevant stories or questions.
7. Determine whether the request is eligible for a response.
8. Add the request to the editorial queue.
9. Generate a response only when selected.
10. Record the relationship between the message and the resulting segment.

A listener question should not automatically be answered on air.

The system may decline, defer, summarize, or combine requests according to its editorial policy.

## 17.4 Feedback signals

Listener behavior may help the system understand which subjects are useful or engaging.

Potential signals include:

- Explicit positive or negative feedback.
- Requested topics.
- Requests for clarification.
- Skips.
- Replays.
- Listening duration.
- Voluntary ratings.
- Repeated questions about a subject.

These signals should not be interpreted as direct measures of truth, importance, or public consensus.

A replay may indicate confusion rather than interest. A skipped segment may reflect timing or technical problems rather than dislike of its content.

The system should treat feedback as noisy evidence about audience preferences.

## 17.5 Protection against manipulation

Audience interaction introduces risks such as spam, coordinated topic manipulation, and attempts to induce the system to repeat false claims.

Controls should include:

- Per-client rate limits.
- Bounded message length.
- Duplicate-message detection.
- Queue quotas.
- Abuse classification.
- Separation of listener claims from verified evidence.
- Restrictions on how rapidly one client can influence editorial priorities.
- Explicit review for requests involving serious allegations.

A listener request may create a research task. It must not directly establish a claim in the world model.

---

# 18. User Interface and Operator Experience

## 18.1 Interface philosophy

The MindBroadcast interface should expose the operation of the system rather than merely presenting an audio player.

The application should feel like a live broadcasting console connected to a persistent intelligence engine.

The visual direction can retain the dark, spaceship-like aesthetic associated with the original concept, but the interface must remain functional and information-dense without becoming visually noisy.

The interface should answer four questions immediately:

1. What is the broadcaster saying right now?
2. Why is it saying this?
3. What is the system currently observing and processing?
4. What is likely to happen next?

## 18.2 Primary dashboard

The main dashboard should be divided into a small number of persistent regions.

```text
┌──────────────────────────────────────────────────────────────┐
│ MINDBROADCAST       LIVE / DEGRADED       SYSTEM HEALTH       │
├─────────────────────────────┬────────────────────────────────┤
│                             │                                │
│      BROADCAST PLAYER       │       WORLD ACTIVITY           │
│                             │                                │
│      Current Speaker        │       Recent Developments      │
│      Current Segment        │       Active Stories           │
│      Audio Controls         │       Unresolved Questions      │
│                             │                                │
├─────────────────────────────┴────────────────────────────────┤
│                                                              │
│                     LIVE TRANSCRIPT                          │
│                                                              │
│  Speaker                                                     │
│  Spoken text                                                 │
│  Evidence / interpretation metadata                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    SHOW ANALYSIS                             │
│                                                              │
│  Current segment rationale                                    │
│  Sources and evidence                                         │
│  Persona contributions                                        │
│  Confidence limitations                                       │
│  Next scheduled topics                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Listener input                         System event timeline │
└──────────────────────────────────────────────────────────────┘
```

This is a logical layout, not a requirement to render every panel at equal size.

The transcript and player should receive the greatest attention. Analytical information should be available without obscuring the broadcast itself.

## 18.3 Live transcript

The transcript should update as the system produces speech.

Each transcript entry should contain:

- Speaker name.
- Segment title.
- Text.
- Start and completion timestamps where available.
- Current playback state.
- Relevant story references.
- Evidence links.
- Epistemic classification.
- Correction status.
- Whether the segment was completed, interrupted, or abandoned.

The interface should distinguish generated text from text actually delivered to the audio stream.

A script that was generated but never played should not appear indistinguishably in the public transcript.

## 18.4 SHOW ANALYSIS

The SHOW ANALYSIS interface is one of the most important features of MindBroadcast.

It exposes the editorial and evidentiary basis for the current broadcast.

For the current segment, it should display:

**Editorial objective:** Why this subject was selected.

**Story context:** How the subject relates to ongoing events.

**Evidence:** The specific source records and passages supporting the major claims.

**Contradictions:** Relevant conflicting accounts and their current status.

**Interpretation:** Which statements represent analytical conclusions rather than directly established facts.

**Persona roles:** Why each persona was assigned to the segment.

**Unresolved questions:** What remains unknown or disputed.

**Selection factors:** The major contributors to the story's editorial ranking.

**Generation provenance:** The model, prompt version, evidence packet, and script version used.

**Validation state:** Whether the segment passed all required checks.

The system should not present private chain-of-thought reasoning as an explanation. Instead, it should expose the evidence, structured decision factors, recorded assumptions, validation outcomes, and concise rationales needed to audit the result.

## 18.5 World explorer

A separate interface should allow the operator to explore the world model.

It should support queries such as:

- Show the active stories associated with this entity.
- Show claims made by this source.
- Show all evidence associated with this claim.
- Show material changes to this event.
- Show which broadcast segments referenced this proposition.
- Show the history of a correction.
- Show what was known at a particular snapshot.
- Show which source relationships affect the independence of corroboration.

The first implementation can use tables, filters, and expandable record details.

A graph visualization can be added later. A visually impressive graph is not a substitute for reliable queries, correct provenance, or understandable relationships.

## 18.6 Operator controls

The operator should be able to:

- Start and stop the broadcast.
- Pause new segment generation.
- Temporarily mute playback.
- Skip a segment.
- Request a specific topic.
- Change persona configurations.
- Enable or disable sources.
- Adjust editorial priorities.
- Inspect failed tasks.
- Review corrections.
- Trigger a source refresh.
- Export transcripts.
- Inspect storage and inference usage.
- Switch between live and simulation modes.

Actions that affect persistent policy or data must have explicit confirmation and audit records where appropriate.

## 18.7 Accessibility

The interface should support:

- Keyboard navigation.
- Visible focus indicators.
- Screen-reader labels.
- Transcript access without audio.
- Adjustable text size.
- Clear error states.
- Reduced-motion preferences.
- Audio mute and volume controls.
- Explicit indicators for live versus replay content.

The visual design should not rely exclusively on color to communicate whether a segment is approved, disputed, or failed.

---

# 19. API and Event Contracts

## 19.1 API architecture

The application should expose a versioned HTTP API for the frontend and administrative operations.

The initial API may use a Python framework such as FastAPI, but the architecture should not depend on a specific web framework.

The API should expose domain operations rather than directly exposing arbitrary database tables.

## 19.2 Core endpoints

A proposed initial endpoint set is:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | Basic health status. |
| `GET` | `/api/v1/system/status` | Operational state and subsystem health. |
| `POST` | `/api/v1/broadcast/start` | Start a broadcast session. |
| `POST` | `/api/v1/broadcast/stop` | Stop the broadcast gracefully. |
| `GET` | `/api/v1/broadcast/session` | Retrieve the current session. |
| `GET` | `/api/v1/broadcast/segments` | List recent and active segments. |
| `GET` | `/api/v1/broadcast/segments/{id}` | Retrieve a segment and its state. |
| `GET` | `/api/v1/broadcast/transcript` | Retrieve transcript entries. |
| `GET` | `/api/v1/stories` | Query active stories. |
| `GET` | `/api/v1/stories/{id}` | Retrieve a story and its history. |
| `GET` | `/api/v1/claims/{id}` | Retrieve a claim and its status. |
| `GET` | `/api/v1/claims/{id}/evidence` | Retrieve associated evidence. |
| `GET` | `/api/v1/sources` | List configured sources. |
| `POST` | `/api/v1/sources` | Register a source. |
| `PATCH` | `/api/v1/sources/{id}` | Update source configuration. |
| `POST` | `/api/v1/listener/messages` | Submit a listener message. |
| `GET` | `/api/v1/events` | Query the event timeline. |
| `GET` | `/api/v1/snapshots/{id}` | Inspect a world snapshot. |
| `GET` | `/api/v1/metrics` | Retrieve permitted application metrics. |

Additional endpoints may be introduced as needed.

The API must not expose raw internal database access or unrestricted administrative operations to an unauthenticated network client.

## 19.3 Streaming events

The frontend should receive live metadata updates without repeatedly polling every endpoint.

Server-Sent Events are appropriate for one-way updates from the server to the browser.

Example event types:

```text
broadcast.state_changed
broadcast.segment_started
broadcast.segment_completed
broadcast.segment_interrupted
transcript.turn_added
world.story_updated
world.correction_detected
system.worker_failed
system.worker_recovered
audio.stream_ready
```

An event should contain a stable event ID, timestamp, type, and versioned payload.

The stream should support reconnection and event replay where practical.

The application should not rely on an in-memory event queue as the only record of important state transitions.

## 19.4 Audio endpoint

Audio delivery should use a dedicated streaming endpoint or a compatible streaming service.

A conceptual interface is:

```text
GET /api/v1/audio/live
```

The endpoint must define:

- Supported audio format.
- Framing.
- Buffering behavior.
- Reconnection semantics.
- End-of-stream behavior.
- Authentication requirements.
- Client backpressure policy.

The actual transport may use chunked HTTP audio, a browser-compatible streaming format, or an optional external radio server.

SSE should remain reserved for metadata and control events rather than being used as the primary audio transport.

## 19.5 API versioning

All externally consumed contracts should be versioned.

A schema change that alters the meaning of an existing field must not silently break clients.

The system should validate requests at the API boundary and return structured errors containing:

- Error code.
- Human-readable message.
- Relevant request identifier.
- Retryability.
- Field-level validation details where appropriate.

Internal domain models should not automatically become public API schemas. The API layer should expose stable representations that can evolve independently of database implementation details.

---

# 20. Security, Privacy, and Governance

## 20.1 Threat model

MindBroadcast processes untrusted external information, accepts listener input, generates potentially influential public speech, and may expose administrative controls.

Its threat model must therefore include:

- Prompt injection through source documents.
- Malicious or malformed network responses.
- SSRF and redirect abuse.
- Unauthorized administrative access.
- Database corruption.
- Accidental disclosure of local files.
- Exposure of credentials in prompts or logs.
- Listener spam and manipulation.
- False or defamatory allegations.
- Incorrect automated corrections.
- Compromised model providers.
- Malicious dependencies.
- Unintended access to private user data.

## 20.2 Least privilege

Each subsystem should receive only the permissions it requires.

The language-model orchestration layer should not receive unrestricted filesystem or database access.

A source adapter should not be able to modify persona configurations.

The audio subsystem should not be able to alter claim assessments.

The listener-input subsystem should not be able to modify source trust profiles.

Administrative actions should pass through explicit service interfaces with authorization checks.

## 20.3 Network exposure

The default deployment should bind to loopback unless remote access is explicitly configured.

If the user enables remote access, the application must provide appropriate authentication and transport protection.

Administrative endpoints must not become publicly accessible merely because the web server is bound to a non-loopback interface.

Source fetching must be restricted to permitted schemes and destinations. Redirects must be checked against the same destination policy.

## 20.4 Secrets

API credentials should be stored outside the ordinary application database where practical.

Secrets must not be included in:

- Persona memory.
- Prompt logs.
- Transcript exports.
- Public API responses.
- Debugging bundles.
- Error messages returned to clients.

Provider configuration should support local-only operation without requiring cloud credentials.

## 20.5 Privacy

Listener interaction should be designed around data minimization.

The system should collect only the information necessary to provide its features.

The operator should be able to configure retention for:

- Listener messages.
- Playback telemetry.
- Generated audio.
- Model request logs.
- Source artifacts.
- Historical transcripts.

Sensitive information should not be repeated on air merely because it appears in an ingested source.

The system should apply additional restrictions to personal information, private allegations, and information that could create a serious risk if repeated without sufficient verification.

## 20.6 Governance of generated speech

MindBroadcast is an autonomous publishing system, even if its initial deployment is local.

It should therefore have explicit policies governing the content it is willing to broadcast.

High-impact allegations, medical claims, financial claims, and urgent public-safety information may require stronger evidence and more conservative presentation than ordinary explanatory commentary.

The system should distinguish between reporting an allegation and asserting that the allegation is true.

When a claim is unresolved, the broadcaster should be able to explain that uncertainty without either endorsing or suppressing the claim automatically.

The editorial policy should also define when a human operator must review a segment, when the system may publish with qualifications, and when the system must refuse to broadcast the proposed content.

These policies should be versioned and tested like other system components.

---

# 21. Observability and Diagnostics

## 21.1 Observability objectives

A continuously operating system must be able to explain not only what it produced, but also why it stopped producing, why a story was selected, and where time is being spent.

MindBroadcast should expose operational metrics for every major subsystem.

## 21.2 Metrics

### Ingestion

- Fetch attempts.
- Successful fetches.
- Fetch failures.
- Articles discovered.
- Articles captured.
- Duplicate rate.
- Average fetch latency.
- Oldest pending ingestion task.
- Source-specific failure rate.

### Knowledge compilation

- Documents awaiting processing.
- Extraction success rate.
- Schema-validation failure rate.
- Entity-resolution rate.
- Unresolved entity candidates.
- Claim extraction latency.
- Evidence-linking success rate.
- Contradiction candidates generated.
- Reprocessing backlog.

### Editorial planning

- Eligible stories.
- Story-ranking latency.
- Plan-generation failures.
- Time since the last completed segment.
- Coverage distribution.
- Repeated-content rate.
- Breaking-update latency.
- Unresolved high-priority questions.

### Language models

- Requests per task type.
- Latency distribution.
- Output-validation failures.
- Timeout rate.
- Retry rate.
- Token usage where available.
- Memory consumption.
- Provider availability.

### Audio

- TTS latency.
- Time to first audio.
- Audio generation failures.
- Queue depth.
- Buffer underruns.
- Audio format errors.
- Playback interruption count.
- Time spent without playable audio.

### System health

- Process uptime.
- Database errors.
- Database size.
- Artifact storage usage.
- Outbox backlog.
- Worker lease expirations.
- Recovery events.
- API latency.
- Client disconnects.

## 21.3 Structured logs

Logs should be structured and correlated across workflows.

A log entry associated with a broadcast segment should include the segment ID, session ID, correlation ID, and relevant processing stage.

Logs must avoid duplicating sensitive content unnecessarily.

For example, a model-generation failure can usually be diagnosed using the request ID, model, error category, and validation result without recording the full listener message or source text in every log entry.

## 21.4 Health checks

The application should expose both liveness and readiness information.

**Liveness** indicates whether the application process is functioning sufficiently to remain running.

**Readiness** indicates whether the system can currently perform a specified operation.

The readiness response should identify degraded capabilities.

For example, MindBroadcast may be able to serve transcripts and inspect historical stories while its TTS provider is unavailable.

A single global `healthy: false` response would obscure that distinction.

## 21.5 Operational dashboard

The UI should expose the current processing pipeline as a series of visible states.

For example:

```text
SOURCE INGESTION       HEALTHY
KNOWLEDGE COMPILER     PROCESSING BACKLOG
WORLD MODEL            AVAILABLE
EDITORIAL PLANNER      HEALTHY
LANGUAGE MODEL         AVAILABLE
SCRIPT VALIDATION      HEALTHY
TEXT-TO-SPEECH         DEGRADED
AUDIO DELIVERY         BUFFERING
```

The dashboard should show real state from subsystem health checks, not manually maintained decorative indicators.

---

# 22. Testing and Verification Strategy

MindBroadcast needs a testing strategy that distinguishes deterministic correctness from probabilistic quality.

A test that verifies that a database record exists is fundamentally different from an evaluation that determines whether a generated political analysis is balanced, useful, and factually supported.

Both matter, but they require different methods.

## 22.1 Testing layers

The testing architecture should include:

1. Unit tests.
2. Database and migration tests.
3. Integration tests.
4. Contract tests.
5. State-machine tests.
6. Fault-injection tests.
7. End-to-end tests.
8. Language-model evaluation.
9. Editorial quality evaluation.
10. Long-duration operational tests.
11. Security tests.
12. Recovery and data-integrity tests.

The first seven categories should form the deterministic engineering foundation.

The probabilistic evaluation layers should build on top of that foundation rather than compensate for infrastructure that is not yet reliable.

## 22.2 Unit tests

Unit tests should cover:

- URL canonicalization.
- Content hashing.
- Duplicate detection.
- Entity-resolution rules.
- Claim normalization.
- Evidence relationships.
- Story-ranking calculations.
- Coverage saturation.
- Snapshot boundaries.
- State-machine transitions.
- Idempotency keys.
- Script validation.
- Duration estimation.
- Audio chunk ordering.
- Correction propagation.
- Retention decisions.

Pure functions should be used wherever practical.

A story-ranking test, for example, should be able to verify that a material correction increases a story's eligibility without requiring a live language model.

## 22.3 Database tests

Database tests should verify:

- Foreign-key enforcement.
- Uniqueness constraints.
- Transaction rollback.
- Concurrent reads and writes.
- Migration correctness.
- Cross-process persistence.
- Snapshot consistency.
- Recovery after interrupted writes.
- Append-only event behavior.
- Source and article relationships.
- Correction history preservation.
- Referential integrity of provenance records.

The test suite must use realistic database configurations.

An in-memory SQLite database can be useful for fast unit tests, but it cannot substitute for testing the application's actual on-disk persistence and process-restart behavior.

## 22.4 State-machine testing

The broadcast pipeline contains many possible transitions and failure states.

Tests should verify that invalid transitions are rejected.

For example:

```text
APPROVED → SYNTHESIZING    VALID
APPROVED → PLAYING         INVALID
REJECTED → PLAYING         INVALID
COMPLETED → COMPLETED      IDEMPOTENT
CANCELED → PLAYING         INVALID
```

The exact allowed transitions must be defined in the implementation.

Property-based tests can generate sequences of events and verify that state invariants remain true.

For example, no segment should become playable without passing validation. No canceled synthesis attempt should publish stale audio chunks into the active session.

## 22.5 Failure injection

The system should be tested under failures such as:

- RSS endpoint timeout.
- Malformed feed response.
- Database busy error.
- Process termination during a transaction.
- Language-model timeout.
- Invalid model output.
- TTS failure halfway through a segment.
- Browser disconnect during playback.
- Outbox dispatcher crash.
- Duplicate event delivery.
- Source correction after a segment has been broadcast.
- Missing audio artifact.
- Worker restart with an outstanding lease.

For each failure, the expected recovery behavior should be specified before the test is written.

## 22.6 Knowledge quality evaluation

A representative evaluation corpus should contain articles with known relationships, including:

- Duplicate articles.
- Syndicated articles.
- Corrections.
- Conflicting reports.
- Multiple events in one article.
- Several articles describing one event.
- Ambiguous entities.
- Attributed allegations.
- Quantitative claims with different denominators.
- Claims that change over time.
- Deliberately misleading content.
- Prompt-injection attempts.

Evaluation should measure extraction precision and recall, entity-resolution accuracy, event-association accuracy, evidence-linking accuracy, and correction handling.

These metrics should be reported separately.

A system that extracts many claims but frequently misattributes them should not be considered successful because its overall extraction rate is high.

## 22.7 Editorial evaluation

The editorial engine should be evaluated using historical data and a controlled replay environment.

For each time point, the system should only receive information that would have been available by that time.

This is essential to prevent temporal leakage.

The evaluation should ask:

- Did the system detect material developments?
- Did it avoid repeatedly selecting duplicate stories?
- Did it prioritize important events appropriately?
- Did it distinguish article volume from genuine corroboration?
- Did it recognize corrections?
- Did it preserve coverage of important but less popular subjects?
- Did it return to unresolved questions when appropriate?
- Did it avoid inventing connections between unrelated events?
- Did its selected segments add information beyond previous coverage?

Human evaluation should supplement quantitative metrics where judgments about importance, clarity, and usefulness are involved.

## 22.8 Broadcast quality evaluation

The broadcast should be evaluated on:

- Factual grounding.
- Attribution accuracy.
- Clarity.
- Naturalness.
- Analytical depth.
- Appropriate uncertainty.
- Repetition.
- Persona differentiation.
- Segment coherence.
- Transition quality.
- Duration accuracy.
- Correction quality.
- Listener comprehension.

The evaluation should also measure the difference between the script and the actual synthesized output where TTS normalization or pronunciation handling changes what is delivered.

## 22.9 Long-duration testing

A continuous broadcaster has failure modes that ordinary request-response tests will not reveal.

The system should undergo extended simulations with:

- Bursts of incoming articles.
- Long periods of low news volume.
- Repeated source failures.
- Model provider interruptions.
- Growing knowledge bases.
- Repeated corrections.
- Audience-message bursts.
- Long-running audio sessions.
- Process restarts during active programming.

The goal is to determine whether queues grow without bound, storage expands unexpectedly, repeated work accumulates, and editorial quality degrades over time.

## 22.10 Acceptance gates

The following gates should apply before progressively more autonomous operation is enabled.

| Gate | Requirement |
|---|---|
| Gate 1 | Persistence and migrations are reliable. |
| Gate 2 | Ingestion and deduplication are idempotent. |
| Gate 3 | Claims and evidence have traceable provenance. |
| Gate 4 | World snapshots preserve consistent historical state. |
| Gate 5 | Story selection is explainable and reproducible. |
| Gate 6 | Generated scripts pass mandatory validation. |
| Gate 7 | TTS and audio delivery recover from failures. |
| Gate 8 | Corrections propagate to affected claims and broadcasts. |
| Gate 9 | Listener interaction cannot bypass editorial controls. |
| Gate 10 | Long-duration operation remains stable. |

Each gate should have explicit tests and recorded results.

A feature should not be considered complete because a happy-path demonstration works once.

---

# 23. Performance and Resource Management

## 23.1 Resource constraints

MindBroadcast must operate within finite CPU, memory, storage, and inference capacity.

A local-first system cannot assume that multiple large language models, embedding workers, and TTS engines can run concurrently without contention.

The application should measure its actual resource use and schedule work accordingly.

## 23.2 Priority classes

Work should be divided into priority classes.

**Priority 0: Active broadcast delivery.** Maintain continuity for approved audio already being delivered.

**Priority 1: Urgent editorial developments.** Process sufficiently important breaking information and required corrections.

**Priority 2: Current knowledge integration.** Process recently captured articles and update affected stories.

**Priority 3: Routine editorial planning.** Generate future segments and update story rankings.

**Priority 4: Background enrichment.** Generate embeddings, revisit old stories, improve summaries, and perform optional reanalysis.

The exact priorities may vary, but the system must be able to defer expensive background tasks when immediate operational work requires resources.

## 23.3 Backpressure

Every queue should have a defined capacity or growth policy.

An unbounded queue is not a reliability strategy.

When the system is overloaded, it should:

1. Preserve durable incoming information.
2. Reduce low-priority enrichment work.
3. Limit concurrent model requests.
4. Coalesce redundant updates.
5. Apply bounded retry policies.
6. Expose the backlog through observability.
7. Avoid generating duplicate segments to compensate for delayed work.

If the system cannot keep up with all available information, it should process the highest-priority work first rather than pretending that every source is being analyzed in real time.

## 23.4 Caching

Useful caches include:

- Canonical URL lookups.
- Entity-resolution candidates.
- Article embeddings.
- Story summaries.
- Persona memories.
- Evidence packets.
- Model capability metadata.
- TTS outputs for identical validated text and voice settings.

Cached artifacts must have explicit invalidation rules.

A cached story summary should be invalidated when a material claim changes, a correction arrives, or its source snapshot becomes obsolete.

A cached audio artifact should only be reused when the script version and synthesis configuration are compatible.

## 23.5 Resource-aware model routing

The model router should be able to delay non-urgent work when resources are constrained.

For example, a large analytical model may be unavailable while the local machine is synthesizing speech. In that case, the system may choose a smaller model, defer the analysis, or use a prevalidated fallback segment.

The decision should be based on task requirements rather than silently lowering the quality of every operation.

---

# 24. Deployment and Configuration

## 24.1 Deployment model

The initial deployment should be a local application with persistent storage and a browser-based interface.

A simple directory layout is:

```text
mindbroadcast/
├── app/
├── tests/
├── docs/
├── migrations/
├── config/
├── scripts/
├── pyproject.toml
├── README.md
└── .env.example
```

Runtime data should be stored outside the source-code directory where practical.

A recommended runtime structure is:

```text
mindbroadcast-data/
├── database/
│   └── mindbroadcast.sqlite
├── artifacts/
│   ├── source_captures/
│   ├── audio/
│   └── exports/
├── logs/
├── cache/
└── backups/
```

The actual paths should be configurable.

## 24.2 Configuration hierarchy

Configuration should be resolved in a predictable order:

1. Built-in defaults.
2. Versioned application configuration.
3. Local environment configuration.
4. Explicit runtime overrides.

Secrets should be handled separately from ordinary configuration.

The application should validate configuration at startup and fail clearly when a required setting is invalid.

A missing optional provider should degrade only the functionality that depends on it.

## 24.3 Example configuration

```yaml
application:
  mode: local
  timezone: UTC
  log_level: INFO

database:
  path: ./data/mindbroadcast.sqlite
  wal_enabled: true
  busy_timeout_ms: 5000

ingestion:
  enabled: true
  default_poll_interval_seconds: 300
  max_concurrent_fetches: 4
  request_timeout_seconds: 20

knowledge:
  enabled: true
  max_concurrent_jobs: 2
  preserve_source_provenance: true

editorial:
  enabled: true
  default_turn_min_seconds: 10
  default_turn_max_seconds: 40
  allow_speculation_as_fact: false
  require_evidence_for_factual_claims: true

broadcast:
  auto_start: false
  max_pending_segments: 10
  allow_breaking_interruptions: true

tts:
  provider: local
  max_concurrent_requests: 1

audio:
  internal_sample_rate: 24000
  max_buffer_seconds: 30

audience:
  enabled: true
  persist_messages: true
  rate_limit_per_minute: 10
```

This configuration is illustrative. The settings must be checked against the actual implementation and provider capabilities before being adopted.

In particular, a `false` value for speculation-as-fact is a policy declaration, not a substitute for the script-validation mechanism that enforces it.

## 24.4 Backup and restore

The application should support consistent database backups and artifact retention.

A backup should include:

- Database state.
- Required schema version information.
- Configuration that is safe to retain.
- Necessary provenance artifacts.
- A manifest of included files.
- Checksums where appropriate.

Secrets should not automatically be included in backups.

The system should periodically test restoration rather than assuming that successful backup creation guarantees recoverability.

## 24.5 Upgrades

Application upgrades must include:

- Schema migration.
- Configuration migration where necessary.
- Compatibility checks.
- Backup recommendations or automated backup.
- Explicit handling of incompatible persisted artifacts.
- Rollback or recovery guidance.

Model and prompt upgrades should be treated separately from database schema upgrades.

Changing a language model should not silently cause every stored claim to be regenerated or every historical segment to be reinterpreted.

---

# 25. Phased Implementation Roadmap

The implementation should proceed through explicit milestones, with each milestone producing a working and testable system.

The first priority is not to maximize the number of features. It is to establish a reliable foundation on which continuous broadcasting can be built.

The following roadmap describes the proposed target sequence, not verified progress in the current repository.

## Phase 0: Repository and implementation audit

**Objective:** Establish the actual state of the project before further architectural expansion.

Tasks:

- Inventory the repository and its modules.
- Read the existing design documents.
- Inspect the current database schema.
- Inspect the domain models.
- Run the full test suite.
- Reproduce reported failures.
- Identify incomplete migrations.
- Compare documented features with implemented behavior.
- Identify duplicated responsibilities.
- Establish the current startup and shutdown lifecycle.
- Record known defects and missing invariants.

Deliverables:

- Repository architecture report.
- Current-state component map.
- Test and defect report.
- Implementation-to-specification matrix.
- Prioritized remediation plan.

**Exit criterion:** The current architecture and its known defects are documented, and the baseline test results are reproducible.

## Phase 1: Persistence and domain integrity

**Objective:** Make the existing information model trustworthy.

Tasks:

- Ensure `Source` is persistently modeled.
- Distinguish `Article`, `Event`, and `Story`.
- Keep `Correction` distinct from `Evidence`.
- Establish consistent domain identifiers.
- Enforce foreign keys.
- Add or repair database migrations.
- Verify append-only provenance.
- Define snapshot semantics.
- Verify on-disk and cross-process persistence.
- Add transaction and recovery tests.
- Fix existing test failures before expanding the feature set.

Deliverables:

- Stable domain schema.
- Migration suite.
- Repository interfaces.
- Persistence tests.
- Documented transaction boundaries.
- Explicit recovery behavior.

**Exit criterion:** The system can reliably persist and retrieve its core domain records without violating the defined relationships.

## Phase 2: Ingestion and source normalization

**Objective:** Build a durable pipeline from external sources to normalized articles.

Tasks:

- Implement source adapters.
- Add polling and retry policies.
- Normalize URLs and timestamps.
- Preserve source versions.
- Implement exact and near-duplicate detection.
- Add a transactional outbox.
- Build ingestion observability.
- Test malformed sources and network failures.

Deliverables:

- Working ingestion service.
- Source registry.
- Normalized article store.
- Deduplication engine.
- Durable processing queue.

**Exit criterion:** New source material can be captured, deduplicated, and scheduled for processing without loss of already committed information.

## Phase 3: Knowledge compilation

**Objective:** Transform articles into structured claims and evidence.

Tasks:

- Implement document normalization.
- Add entity extraction.
- Add claim extraction.
- Add evidence linking.
- Add entity resolution.
- Add event resolution.
- Add claim status tracking.
- Implement correction handling.
- Introduce versioned extraction artifacts.
- Add knowledge-quality evaluations.

Deliverables:

- Knowledge Compiler.
- Claim and evidence registry.
- Entity and event associations.
- Provenance graph.
- Compiler evaluation corpus.

**Exit criterion:** The system can trace a structured claim to the source material from which it was extracted and distinguish extraction confidence from evidentiary support.

## Phase 4: World model and story intelligence

**Objective:** Maintain an evolving view of developments rather than a collection of unrelated articles.

Tasks:

- Implement story entities.
- Associate stories with events and claims.
- Track material changes.
- Generate world snapshots.
- Implement temporal reasoning.
- Add novelty detection.
- Add coverage history.
- Track unresolved questions.
- Build the initial editorial-ranking function.

Deliverables:

- World model.
- Snapshot service.
- Story engine.
- Explainable ranking records.
- Historical replay capability.

**Exit criterion:** The system can identify new developments, connect them to ongoing stories, and reconstruct what information was available at a given point in time.

## Phase 5: Single-persona broadcasting

**Objective:** Produce validated spoken segments from the persistent world model.

Tasks:

- Define the generation-request contract.
- Implement model-provider abstraction.
- Build context assembly.
- Implement structured script generation.
- Add claim-to-evidence validation.
- Add a local TTS provider.
- Build the audio buffer.
- Implement the segment state machine.
- Record broadcast history.
- Add the live transcript interface.

Deliverables:

- One functioning presenter.
- Continuous segment scheduling.
- Local speech synthesis.
- Live transcript.
- Evidence-linked script artifacts.

**Exit criterion:** The system can repeatedly generate, validate, synthesize, and deliver short segments without losing state when an individual task fails.

## Phase 6: Multiple personas and analytical dialogue

**Objective:** Support persistent analytical perspectives and structured disagreement.

Tasks:

- Implement versioned persona configurations.
- Add persona memory.
- Generate independent initial analyses.
- Identify substantive disagreements.
- Compose multi-persona exchanges.
- Add persona-specific voice configuration.
- Evaluate factual consistency and persona differentiation.

Deliverables:

- Multiple configurable personas.
- Persistent persona memory.
- Structured disagreement records.
- Multi-voice broadcasting.

**Exit criterion:** Multiple personas can participate coherently while sharing a common evidence model and preserving distinct analytical roles.

## Phase 7: Live audience and operator experience

**Objective:** Make the system interactive and operationally inspectable.

Tasks:

- Implement the main dashboard.
- Build SHOW ANALYSIS.
- Add the world explorer.
- Add listener messages.
- Implement rate limits.
- Add audience preference controls.
- Add system health visualization.
- Implement source and persona administration.
- Add transcript export and correction inspection.

Deliverables:

- Browser-based control console.
- Interactive listener channel.
- Evidence inspection tools.
- Administrative controls.
- Operational dashboard.

**Exit criterion:** An operator can understand the system's current state, inspect why it selected a segment, and safely influence future programming.

## Phase 8: Reliability, optimization, and external streaming

**Objective:** Prepare the system for extended autonomous operation.

Tasks:

- Conduct long-duration simulations.
- Test crash recovery.
- Optimize inference concurrency.
- Introduce resource-aware scheduling.
- Add audio reconnection support.
- Evaluate optional Icecast integration.
- Improve source-diversity monitoring.
- Test backup and restoration.
- Conduct security and privacy reviews.
- Establish operational service-level targets.

Deliverables:

- Recovery procedures.
- Resource management policies.
- Long-duration test reports.
- Optional external streaming.
- Operational documentation.

**Exit criterion:** The system can operate for extended periods while maintaining bounded resource usage, recoverable state, and measurable editorial quality.

---

# 26. Current Implementation Status and Remediation Priorities

The specification above describes the intended architecture. It is important to distinguish that architecture from the state of the existing MindBroadcast implementation.

Based on the project history available in our conversation, the implementation has already progressed beyond the original prototype.

The earlier `news08` project established the basic concept of an RSS-to-NLP-to-clustering-to-LLM-to-TTS pipeline. MindBroadcast subsequently developed toward a persistent system with domain models, SQLite storage, world snapshots, and automated tests.

The more recent implementation work introduced several important components:

- Raw SQLite persistence.
- WAL mode and foreign-key support.
- Append-only data handling.
- Entity deduplication.
- A `WorldSnapshot` concept.
- Domain objects for stories, events, claims, evidence, entities, corrections, and snapshots.
- Automated tests for persistence and domain behavior.

However, previous project notes also identified outstanding issues, including failing tests, incomplete source persistence, questions about snapshot semantics, and inconsistencies between documented behavior and actual implementation.

**I have not inspected the repository in this conversation, so I cannot verify which of those issues remain unresolved today.** They should be treated as items requiring verification, not as confirmed defects in the current checkout.

## 26.1 The immediate priority: establish a trustworthy foundation

I would not begin by implementing the entire multi-persona broadcasting system.

I would first establish that the existing persistence and domain model can support it.

The minimum initial remediation checklist is:

| Priority | Task | Why it matters |
|---|---|---|
| P0 | Run the complete test suite and establish a reproducible baseline. | Prevents architectural work from being built on an unknown failure state. |
| P0 | Verify persistence of every core domain entity. | Prevents information from disappearing between processing stages or restarts. |
| P0 | Define `Article`, `Event`, and `Story` separately. | Prevents publication artifacts, real-world occurrences, and editorial groupings from becoming conflated. |
| P0 | Keep `Correction` separate from `Evidence`. | Preserves the distinction between information supporting a claim and a record that something needs revision. |
| P0 | Verify snapshot consistency and historical semantics. | Ensures the system can reconstruct what it knew at a particular time. |
| P0 | Verify append-only provenance and correction history. | Prevents later changes from erasing the history of earlier decisions. |
| P1 | Establish idempotent ingestion and background processing. | Prevents retries from creating duplicate records or duplicate work. |
| P1 | Implement reliable article-to-claim-to-evidence relationships. | Makes evidence-grounded reporting possible. |
| P1 | Add explicit segment and broadcast-session state machines. | Prevents invalid transitions and inconsistent playback state. |
| P2 | Implement story ranking and editorial scheduling. | Enables the broadcaster to decide what to discuss. |
| P2 | Add script validation and local TTS. | Enables the system to turn its information model into controlled spoken output. |
| P3 | Introduce multiple personas, listener interaction, and advanced presentation. | Expands the experience after the core system is reliable. |

The ordering is deliberate.

The most visually impressive feature is not necessarily the most important engineering task. A sophisticated persona interface cannot compensate for a database that loses corrections, and a fluent broadcast cannot compensate for a claim that has no traceable evidence.

---

# 27. Additional Architectural Decisions

Several aspects of MindBroadcast deserve explicit decisions because they will materially affect the eventual implementation.

## 27.1 Should the system use a knowledge graph or relational database?

**Recommendation: start with relational storage and expose a graph-oriented domain interface.**

The application needs graph semantics, but it does not necessarily need a separate graph database.

SQLite can represent claims, entities, events, stories, and evidence using relational tables and association records. Recursive queries and application-level traversal can support many useful graph operations.

The more important requirement is that relationships be explicit, indexed, versioned where necessary, and traceable.

If graph queries later become a significant performance bottleneck, a dedicated graph index can be introduced as a derived representation.

It should not become a second independent source of truth.

## 27.2 Should every story have a permanent summary?

**Recommendation: yes, but summaries should be versioned derived artifacts.**

Each active story should have a current editorial summary, a historical context summary, and a record of unresolved questions.

These summaries should be generated from the world model and invalidated when material evidence changes.

They should not be treated as authoritative facts.

A summary is a convenient representation of underlying knowledge. The underlying claims and evidence remain the authoritative records.

## 27.3 Should the system maintain a single global world state?

**Recommendation: maintain a global knowledge base, but avoid a single giant mutable world-state document.**

A giant JSON object containing everything the system knows would become difficult to update, query, validate, and reconstruct.

Instead, maintain normalized domain records, a durable event history, and versioned snapshots.

The global world model is the logical combination of those components.

Individual tasks should work against bounded, versioned views of the model.

## 27.4 Should the broadcaster always be talking?

**Recommendation: make continuous operation a system capability, not an obligation to generate meaningless speech.**

The application should be able to operate indefinitely, but it should not be required to produce a new factual report every few seconds.

When fresh reporting is unavailable, it can provide historical context, revisit unresolved questions, or conduct clearly framed analysis.

When there is nothing valuable to add, it should be permitted to remain silent or play an explicitly configured interstitial.

An infinite broadcast is a continuously available programming system, not an infinite stream of fabricated novelty.

## 27.5 Should personas be allowed to disagree with the evidence?

**Recommendation: personas can challenge interpretations, not arbitrarily override evidence.**

A persona may argue that an economic policy is unlikely to achieve its stated objective. It may challenge the assumptions behind a forecast or point out that the available data does not establish causation.

It should not be permitted to present a contradicted claim as an established fact merely because that behavior matches its personality.

The system should preserve the difference between a legitimate analytical disagreement and a factual error.

## 27.6 Should the system rewrite its own knowledge model?

**Recommendation: permit controlled revision, not uncontrolled self-modification.**

MindBroadcast should be capable of correcting its understanding of events, revising claim assessments, merging duplicate entities, and replacing obsolete summaries.

Those changes should occur through explicit domain operations with provenance and validation.

The language model should not be allowed to rewrite the database schema, silently change the editorial policy, or alter the meaning of historical records.

This distinction is especially important if the system later incorporates more advanced autonomous reasoning or recursive improvement techniques.

---

# 28. The Recursive Improvement Layer

A particularly interesting future direction is to make MindBroadcast capable of evaluating and improving its own broadcasting process.

This should be a separate subsystem rather than an unrestricted extension of the Broadcast Director.

The broadcaster already generates artifacts that can be evaluated:

- Extracted claims.
- Evidence relationships.
- Story rankings.
- Editorial plans.
- Persona analyses.
- Scripts.
- Validation outcomes.
- Audio segments.
- Listener feedback.
- Corrections.
- Operational metrics.

These artifacts provide the basis for a controlled improvement loop.

## 28.1 Improvement cycle

The proposed cycle is:

\[
\text{Observe}
\rightarrow
\text{Evaluate}
\rightarrow
\text{Identify Failure}
\rightarrow
\text{Propose Change}
\rightarrow
\text{Test}
\rightarrow
\text{Approve}
\rightarrow
\text{Deploy}
\rightarrow
\text{Measure}
\]

The critical distinction is between identifying a failure and authorizing a change.

Suppose MindBroadcast repeatedly ranks syndicated articles above independently verified developments because its novelty calculation overweights article volume.

The improvement subsystem could:

1. Identify the repeated ranking failure.
2. Collect the affected editorial decisions.
3. Determine which features contributed to the ranking.
4. Propose a modification to the novelty or source-independence calculation.
5. Evaluate the proposed change against historical data.
6. Compare the revised rankings with a baseline.
7. Verify that the change does not introduce unacceptable regressions.
8. Record the decision to adopt or reject the change.
9. Deploy the approved configuration.
10. Monitor subsequent performance.

This is a meaningful form of recursive system improvement.

The system uses evidence about its own behavior to propose modifications to the mechanisms that govern that behavior.

## 28.2 What can be improved automatically?

Initially, automatic improvement should be limited to low-risk, reversible parameters.

Examples include:

- Adjusting polling intervals within predefined limits.
- Changing the order of background tasks.
- Tuning bounded ranking weights in simulation.
- Identifying ineffective retrieval queries.
- Improving cache policies.
- Detecting recurring validation failures.
- Suggesting new regression tests.
- Identifying redundant model calls.
- Recommending changes to persona configurations.

Higher-impact changes should require stronger evidence and explicit approval.

The system should not autonomously weaken factual validation merely because doing so increases the number of segments successfully broadcast.

## 28.3 Evaluation before deployment

Every proposed improvement should be associated with:

- A problem statement.
- A baseline.
- A proposed change.
- An evaluation dataset.
- Acceptance criteria.
- Regression tests.
- A comparison of old and new behavior.
- A rollback procedure.
- An approval record.

For editorial changes, the system should evaluate both the intended improvement and potential adverse effects.

A ranking modification that improves breaking-news detection but suppresses long-running investigations may not be an overall improvement.

Likewise, a prompt change that makes personas more entertaining but increases unsupported assertions should not be accepted simply because listener engagement improves.

## 28.4 Avoiding self-reinforcing evaluation

The system must not define its own success exclusively through metrics it can easily optimize.

If the broadcaster is rewarded only for longer listening sessions, it may learn to prioritize sensationalism.

If it is rewarded only for factual conservatism, it may become so cautious that it offers little useful analysis.

If it is rewarded only for the volume of published content, it may generate redundant segments.

Evaluation should therefore use multiple dimensions:

\[
Q =
f(
F,
P,
N,
C,
D,
R,
S
)
\]

where:

- \(F\): factual grounding.
- \(P\): provenance integrity.
- \(N\): novelty.
- \(C\): clarity.
- \(D\): analytical depth.
- \(R\): relevance.
- \(S\): operational stability.

This is a conceptual quality model. It should not initially be reduced to one opaque score.

The individual dimensions should be measurable and independently inspectable.

The objective is not to create an AI that can change itself without restriction. It is to create a system that can identify deficiencies in its own operation, propose bounded improvements, and demonstrate whether those improvements actually work.

---

# 29. Open Questions and Recommended Defaults

The architecture can be specified in considerable detail without resolving every product decision. However, several choices will eventually influence the implementation.

For now, I recommend the following defaults.

| Decision | Recommended default |
|---|---|
| Primary deployment | Local-first application. |
| Backend language | Python. |
| Database | SQLite with WAL and explicit transaction management. |
| API framework | FastAPI or an equivalent asynchronous Python framework. |
| Initial ingestion | RSS and Atom, followed by selected structured APIs. |
| Search | SQLite full-text search initially. |
| Semantic retrieval | Local embedding model and a replaceable vector-index interface. |
| Knowledge graph | Relational tables and explicit relationships initially. |
| Language models | Provider abstraction with local inference as the default. |
| TTS | Local synthesis as the default. |
| Broadcast structure | Short turns, generally 10 to 40 seconds. |
| Personas | One reliable presenter first, followed by multiple analytical perspectives. |
| Audio delivery | Browser-based live stream initially. |
| External radio streaming | Optional later integration. |
| Audience interaction | Asynchronous, persistent, and subordinate to editorial controls. |
| Corrections | First-class records linked to original claims and broadcasts. |
| Improvement loop | Evaluation and proposal first, controlled deployment afterward. |
| Human oversight | Configurable review for high-impact or uncertain content. |

These choices favor simplicity, local control, and testability without closing off future expansion.

---

# 30. Definition of Done

MindBroadcast should not be considered complete merely because it can produce a convincing demonstration of an AI presenter reading a generated script.

The project is complete when it functions as a persistent broadcasting system whose information, decisions, and outputs remain understandable and recoverable over time.

The final acceptance criteria should include the following.

### Information integrity

- Every captured article has source provenance.
- Claims remain distinguishable from evidence.
- Articles remain distinguishable from events and stories.
- Corrections do not erase historical records.
- Entity and event relationships can be inspected.
- World snapshots have explicit temporal semantics.
- Processing retries do not create unintended duplicate records.
- The system can reconstruct the evidence available when a segment was generated.

### Editorial intelligence

- The system detects material changes to existing stories.
- It can identify new developments without relying exclusively on article volume.
- It ranks stories using explicit and inspectable factors.
- It tracks previous coverage and unresolved questions.
- It can explain why a story was selected.
- It avoids repeatedly reporting unchanged information as new.
- It can distinguish established facts from uncertain interpretations.

### Broadcast generation

- Segments are generated from bounded, versioned evidence packets.
- Factual claims can be traced to supporting evidence.
- Scripts pass mandatory validation before broadcast.
- Personas can express distinct analytical perspectives without inventing factual disagreements.
- The system can generate speech continuously without requiring a human to initiate every turn.
- TTS and audio failures do not corrupt the knowledge base or editorial history.
- Interruptions do not cause stale audio to appear unexpectedly.
- Corrections can be published and linked to the affected broadcast.

### Operational reliability

- The application survives process restarts.
- Pending work can be recovered.
- Database transactions and background processing have explicit failure semantics.
- Queue growth and resource usage are bounded.
- Source failures do not terminate the entire system.
- Model-provider failures degrade only the affected capabilities where possible.
- Backups can be restored.
- Logs and metrics make failures diagnosable.

### Recursive improvement

- The system can evaluate its own outputs.
- It can identify recurring deficiencies.
- It can propose changes to its ranking, retrieval, generation, or scheduling mechanisms.
- Proposed changes can be tested against a baseline.
- Improvements are measured against multiple quality dimensions.
- Approved changes are versioned and reversible.
- Historical evaluation results remain available.

---

# 31. Final Architectural Thesis

MindBroadcast should be understood as a persistent intelligence system whose user-facing output happens to be a continuously evolving broadcast.

Its defining innovation is not simply the use of language models to generate speech. That capability, by itself, is relatively straightforward.

The deeper challenge is maintaining continuity between the external world, the system's observations, its structured knowledge, its analytical interpretations, and its published statements.

A conventional generator can produce a plausible explanation of an article without remembering whether it has already reported the story, whether the article was subsequently corrected, whether another source contradicts it, or whether its own earlier interpretation has become obsolete.

MindBroadcast should be designed to retain precisely that context.

It should remember what it observed, preserve how it reached its conclusions, track how those conclusions change, and use that history to determine what is worth communicating next.

The architecture therefore forms a chain of controlled transformations:

\[
\boxed{
\begin{aligned}
&\text{External Information}\\
&\quad\downarrow\\
&\text{Persistent Observations}\\
&\quad\downarrow\\
&\text{Structured Knowledge}\\
&\quad\downarrow\\
&\text{Versioned World Model}\\
&\quad\downarrow\\
&\text{Editorial Decisions}\\
&\quad\downarrow\\
&\text{Persona Interpretations}\\
&\quad\downarrow\\
&\text{Validated Statements}\\
&\quad\downarrow\\
&\text{Continuous Broadcast}\\
&\quad\downarrow\\
&\text{Evaluation and Feedback}\\
&\quad\downarrow\\
&\text{Controlled Improvement}
\end{aligned}
}
\]

Every transition should have a defined contract. Every consequential decision should leave an inspectable record. Every generated statement should preserve the distinction between its evidence and its interpretation. Every correction should be able to propagate without erasing history.

This is what makes the project more interesting than an infinite podcast generator.

**MindBroadcast is an attempt to build an AI system that continuously interprets a changing world while maintaining a persistent, inspectable record of what it knows, why it believes it, what it communicates, and how its understanding evolves.**

The recommended next step is to turn this specification into a repository-aligned implementation plan, beginning with the existing domain models, SQLite persistence, snapshots, and tests. That will establish which parts of the architecture already exist, which require repair, and which should be introduced incrementally.