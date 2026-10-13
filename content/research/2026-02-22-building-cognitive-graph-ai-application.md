---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-02-22-building-cognitive-graph-ai-application
date: 02-22-2026
description: Learn how to build a sophisticated cognitive routing system that transforms
  how AI processes and responds to user inputs through personas, finite state machines,
  and directed acyclic graphs.
image: /images/1019010.png
layout: post
og:description: Learn how to build a sophisticated cognitive routing system with personas,
  FSM, and DAG for intelligent AI responses.
og:image: /images/1019010.png
og:title: Building a Cognitive Graph AI Application
og:type: article
og:url: /blog/2026-02-22-building-cognitive-graph-ai-application
tags:
- ai
- cognitive-architecture
- ollama
- nextjs
- personas
- llm
title: 'Building a Cognitive Graph AI Application: A Comprehensive Guide'
twitter:card: summary_large_image
twitter:description: A comprehensive guide to building a cognitive routing system
  with personas, finite state machines, and directed acyclic graphs.
twitter:image: /images/1019010.png
twitter:title: Building a Cognitive Graph AI Application
wiki_references: ["llama3", "local-inference", "ollama", "typescript"]
---



# Building a Cognitive Graph AI Application: A Comprehensive Guide

[Follow along with the code here!](https://github.com/kliewerdaniel/cogGraph)

## Introduction

Imagine an AI system that doesn't just respond to your queries—it thinks about *how* to think about them. Picture a system that can activate different cognitive "personas" depending on the nature of your question, blending multiple perspectives into a coherent response, and making all of its reasoning visible and debuggable along the way.

This isn't science fiction. It's the architecture behind the Cognitive Graph AI Application—a sophisticated cognitive routing system that transforms how AI systems process and respond to user inputs.

In this comprehensive guide, I'll walk you through building this entire system from the ground up. Whether you're a high-level programmer looking to understand advanced AI architecture or a developer ready to implement this system, this guide will take you through every layer: from the Finite State Machine that orchestrates cognition, through the Directed Acyclic Graph that models reasoning, all the way to the Next.js frontend with real-time streaming responses.

Let's dive in.

---

## Table of Contents

1. [Understanding the Core Philosophy](#1-understanding-the-core-philosophy)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [The Persona System](#3-the-persona-system)
4. [Building the Finite State Machine](#4-building-the-finite-state-machine)
5. [Implementing the Directed Acyclic Graph](#5-implementing-the-directed-acyclic-graph)
6. [Ollama Integration](#6-ollama-integration)
7. [The Next.js Frontend](#7-the-nextjs-frontend)
8. [API Layer Implementation](#8-api-layer-implementation)
9. [Deployment and Production](#9-deployment-and-production)
10. [Conclusion](#10-conclusion)

---

## 1. Understanding the Core Philosophy

Before writing a single line of code, it's essential to understand *why* this architecture exists and the principles that guide its design.

### The Problem with Monolithic AI Systems

Traditional AI chatbots rely on a single Large Language Model (LLM) to handle all types of reasoning. Need analytical thinking? The same model provides it. Need creative brainstorming? Same model. Need emotional support? Still the same model.

This approach has fundamental limitations:

- **No specialized reasoning**: A model excels at logic but struggles with emotional nuance (or vice versa)
- **Invisible decision-making**: You never know *why* the model chose its response
- **Unbounded costs**: Complex prompts can lead to runaway token usage
- **No debuggability**: When things go wrong, you can't easily trace the problem

### The Cognitive Graph Solution

The Cognitive Graph system takes a fundamentally different approach:

1. **Cognitive Decomposition**: Rather than relying on a single LLM to handle all reasoning styles, the system decomposes cognitive tasks into specialized persona modules. Each persona represents a distinct reasoning lens with unique strengths.

2. **Deterministic Control**: The system operates within strict bounds—explicit state transitions (no recursive prompt loops), bounded depth (maximum 4 reasoning layers), token budgets per query, and deterministic routing mathematics.

3. **Parallel Cognition**: Multiple persona nodes can execute concurrently, enabling multi-perspective reasoning without sequential bottlenecks.

4. **Visible Reasoning**: The system exposes its internal cognition through graph visualization, state badges, and confidence scoring—turning invisible reasoning into observable telemetry.

### Core Design Principles

| Principle | Description |
|-----------|-------------|
| **Modular Cognition** | Decouple reasoning style from inference engine |
| **Adaptive Routing** | Automatically select optimal persona(s) based on input features |
| **Multi-Perspective Synthesis** | Blend multiple persona outputs into coherent responses |
| **Production Safety** | Bound cost, depth, and complexity deterministically |
| **Debuggable Reasoning** | Make cognitive decisions observable and traceable |

---

## 2. System Architecture Overview

The Cognitive Graph AI Application follows a layered architecture, with each layer having distinct responsibilities. Understanding this layered approach is crucial before diving into implementation.

### The Layered Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
│   Next.js Frontend (React + TailwindCSS + Framer Motion + shadcn) │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                   │
│   Next.js Route Handlers                                           │
│   Streaming endpoints, Request/Response validation                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                               │
│   CognitiveGraphFSM (State Machine Controller)                     │
│   DAGExecutor (Parallel Graph Execution)                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    COGNITIVE PROCESSING LAYER                       │
│   Classifier (Feature Extraction)                                  │
│   PersonaScoringEngine (Affinity Calculation)                      │
│   PersonaActivationLogic (Selection + Blending)                     │
│   CritiqueEngine (Output Evaluation)                               │
│   SynthesisEngine (Response Merging)                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       INFERENCE LAYER                                │
│   Ollama API Integration (Local LLM)                              │
│   Streaming patterns, Prompt construction                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16+ | UI framework, API routes |
| Styling | TailwindCSS | Utility-first styling |
| Animation | Framer Motion | Complex animations, transitions |
| Components | shadcn/ui | Accessible, composable UI |
| Inference | Ollama | Local LLM engine |
| Runtime | TypeScript | Type safety, interfaces |

### How Data Flows Through the System

1. **User submits prompt** → API layer receives request
2. **FSM initializes** → Creates GraphContext, transitions to CLASSIFYING
3. **Classifier executes** → Ollama generates FeatureVector
4. **Scoring executes** → Dot product of FeatureVector × Persona weight vectors
5. **Activation executes** → Persona selection + optional blending
6. **Persona nodes execute** → Parallel Ollama calls for each active persona
7. **Critique executes** (optional) → Evaluate outputs
8. **Synthesis executes** → Merge outputs, remove persona traces
9. **Streaming output** → Stream final response to frontend
10. **Complete** → Return to IDLE, ready for next input

---

## 3. The Persona System

The persona system is the heart of the Cognitive Graph application. Each persona represents a distinct reasoning lens with unique strengths, traits, and activation conditions.

### The Seven Personas

The system includes seven distinct personas, each optimized for different cognitive tasks:

| Persona ID | Archetype | Core Strength |
|------------|-----------|---------------|
| systems_stoic | Structural Analyst | Analytical, logical reasoning |
| konrad_freeman | Deep Critic | Critical analysis, institutional critique |
| tactical_operator | Execution Planner | Action-oriented, practical planning |
| vision_architect | Strategic Thinker | Long-term vision, possibility mapping |
| existential_diver | Introspective Guide | Meaning-finding, emotional depth |
| social_navigator | Interpersonal Expert | Relationship dynamics, social intelligence |
| creative_disruptor | Pattern Breaker | Novel approaches, unconventional thinking |

### Persona Schema

Each persona follows a structured JSON format that defines its identity, behavior, and activation conditions:

```typescript
interface Persona {
  persona_name: string
  identity: {
    archetype: string
    core_motivation: string
    worldview: string
    emotional_posture: string
  }
  core_rules: string[]
  tone_constraints: {
    deadpan_level: number        // 0-1
    emotional_display: number    // 0-1
    sarcasm: number              // 0-1
    intellectualization: number  // 0-1
    exaggeration: number         // 0-1
  }
  humor_mechanism?: {
    primary: string
    secondary: string
    release_style: string
  }
  structure_pattern?: string
  trait_vector: {
    creativity: number
    risk_tolerance: number
    analysis_depth: number
    empathy: number
    meta_awareness: number
    structural_thinking: number
    discipline: number
    novelty_bias: number
    moral_aggression: number
  }
  activation_conditions: {
    min_feature_score?: number
    required_features?: string[]
    excluded_features?: string[]
  }
  failure_modes: string[]
  forbidden_behaviors?: string[]
  example_internal_instruction: string
}
```

### Example Persona: Systems Stoic

Here's a complete example persona definition:

```json
{
  "persona_name": "Systems_Stoic",
  "identity": {
    "archetype": "Pragmatic Existential Systems Thinker",
    "core_motivation": "Stabilize chaos through structure",
    "worldview": "Life is a failing system that can be refactored",
    "emotional_posture": "Externally calm, internally high-pressure"
  },
  "core_rules": [
    "Never tell traditional jokes.",
    "Do not signal humor explicitly.",
    "Maintain procedural tone.",
    "Reframe emotional events as optimization problems.",
    "Describe absurdity without outrage.",
    "End with forward motion or next-step framing."
  ],
  "tone_constraints": {
    "deadpan_level": 0.95,
    "emotional_display": 0.25,
    "sarcasm": 0.15,
    "intellectualization": 0.9,
    "exaggeration": 0.2
  },
  "humor_mechanism": {
    "primary": "Tonal dislocation",
    "secondary": "Structural contradiction exposure",
    "release_style": "Calm reframing"
  },
  "structure_pattern": [
    "Present high-stakes scenario factually.",
    "Describe constraints in neutral tone.",
    "Pivot abruptly into procedural thinking.",
    "Conclude with calm operational next step."
  ],
  "forbidden_behaviors": [
    "Slapstick humor",
    "Random absurdity",
    "Emotional outbursts",
    "Internet meme language",
    "Obvious punchlines",
    "Self-aware comedic commentary"
  ],
  "trait_vector": {
    "deadpan": 0.95,
    "dark_humor": 0.7,
    "intellectual_humor": 0.92,
    "self_deprecation": 0.55,
    "observational": 0.85,
    "meta_awareness": 0.9,
    "emotional_volatility_outward": 0.2,
    "structural_thinking": 0.98,
    "absurdity_tolerance": 0.88,
    "moral_aggression": 0.35
  },
  "activation_conditions": [
    "Personal stress topics",
    "Health uncertainty",
    "Corporate absurdity affecting narrator",
    "Financial instability",
    "Self-reflection contexts"
  ],
  "failure_modes": [
    "Becoming monotone and humorless",
    "Sounding robotic instead of human",
    "Over-optimizing tone into sterile output",
    "Accidentally inserting punchlines"
  ],
  "example_internal_instruction": "Translate emotional instability into a logistics problem. Maintain calm. Do not try to be funny. Let the structure create the humor."
}
```

### Storing Personas

Personas are stored as JSON files in a `personas/` directory:

```
personas/
├── systemsStoic.json
├── konradFreeman.json
├── tacticalOperator.json
├── visionArchitect.json
├── existentialDiver.json
├── socialNavigator.json
└── creativeDisruptor.json
```

A persona registry loads all personas at runtime:

```typescript
// lib/personas/registry.ts
import fs from 'fs'
import path from 'path'

interface PersonaRegistry {
  getAll(): Persona[]
  getById(id: string): Persona | undefined
}

class PersonaRegistryImpl implements PersonaRegistry {
  private personas: Map<string, Persona> = new Map()

  constructor() {
    this.loadPersonas()
  }

  private loadPersonas() {
    const personasDir = path.join(process.cwd(), 'personas')
    const files = fs.readdirSync(personasDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const content = fs.readFileSync(path.join(personasDir, file), 'utf-8')
      const persona = JSON.parse(content)
      const id = persona.persona_name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      this.personas.set(id, persona)
    }
  }

  getAll(): Persona[] {
    return Array.from(this.personas.values())
  }

  getById(id: string): Persona | undefined {
    return this.personas.get(id)
  }
}

export const PERSONA_REGISTRY = new PersonaRegistryImpl()
```

---

## 4. Building the Finite State Machine

The Finite State Machine (FSM) provides deterministic control over the cognitive graph execution flow. It ensures predictable transitions between states, bounded complexity, and controllable costs.

### State Enumeration

The FSM operates through a series of well-defined states:

```typescript
export enum GraphStateType {
  IDLE = "IDLE",
  CLASSIFYING = "CLASSIFYING",
  SCORING = "SCORING",
  ACTIVATING = "ACTIVATING",
  EXECUTING_PERSONAS = "EXECUTING_PERSONAS",
  CRITIQUING = "CRITIQUING",
  SYNTHESIZING = "SYNTHESIZING",
  STREAMING_OUTPUT = "STREAMING_OUTPUT",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}
```

### State Transition Diagram

```
IDLE ──(user input)──► CLASSIFYING ──(complete)──► SCORING ──(complete)──► ACTIVATING
    ▲                                                            │
    │                                                            ▼
    │                                             ┌──────────────────────────┐
    │                                             │  EXECUTING_PERSONAS      │
    │                                             │  (sequential or parallel)│
    │                                             └──────────────────────────┘
    │                                                            │
    │                                              (critique required?)
    │                                                 ↓              ↓
    │                                          CRITIQUING      SYNTHESIZING
    │                                             │                 │
    │                                             └────────┬────────┘
    │                                                      ▼
    │                                          STREAMING_OUTPUT ──► COMPLETE
    │                                                      │
    │                                                      ▼
    │                                                        ERROR (on failure)
```

### Implementing the FSM

Here's the core FSM implementation:

```typescript
// lib/fsm/cognitive-graph-fsm.ts
import { GraphStateType } from './types'
import { GraphContext, FeatureVector, Persona } from './types'
import { PERSONA_REGISTRY } from '../personas/registry'
import { callOllamaClassifier, callOllamaPersona, callOllamaCritique, callOllamaSynthesis } from '../ollama/client'

const MAX_PERSONAS = 3

export class CognitiveGraphFSM {
  private context: GraphContext

  constructor(initialPrompt: string) {
    this.context = {
      currentState: GraphStateType.IDLE,
      inputPrompt: initialPrompt,
      totalTokenEstimate: 0
    }
  }

  public async run(): Promise<GraphContext> {
    try {
      await this.transition(GraphStateType.CLASSIFYING)
      await this.transition(GraphStateType.SCORING)
      await this.transition(GraphStateType.ACTIVATING)
      await this.transition(GraphStateType.EXECUTING_PERSONAS)

      if (this.shouldCritique()) {
        await this.transition(GraphStateType.CRITIQUING)
      }

      await this.transition(GraphStateType.SYNTHESIZING)
      await this.transition(GraphStateType.STREAMING_OUTPUT)
      await this.transition(GraphStateType.COMPLETE)

      return this.context
    } catch (err: any) {
      this.context.currentState = GraphStateType.ERROR
      this.context.error = err.message
      return this.context
    }
  }

  private async transition(next: GraphStateType) {
    switch (next) {
      case GraphStateType.CLASSIFYING:
        await this.classify()
        break
      case GraphStateType.SCORING:
        this.scorePersonas()
        break
      case GraphStateType.ACTIVATING:
        this.activatePersonas()
        break
      case GraphStateType.EXECUTING_PERSONAS:
        await this.executePersonas()
        break
      case GraphStateType.CRITIQUING:
        await this.critique()
        break
      case GraphStateType.SYNTHESIZING:
        await this.synthesize()
        break
      case GraphStateType.STREAMING_OUTPUT:
        this.prepareStreaming()
        break
      case GraphStateType.COMPLETE:
        break
      default:
        throw new Error("Invalid transition")
    }

    this.context.currentState = next
  }

  private async classify() {
    const result = await callOllamaClassifier(this.context.inputPrompt)
    this.context.featureVector = result
  }

  private scorePersonas() {
    const scores: Record<string, number> = {}
    const input = this.context.featureVector!

    for (const persona of PERSONA_REGISTRY.getAll()) {
      const score = Object.keys(input).reduce((sum, key) => {
        const weight = persona.trait_vector[key as keyof TraitVector] || 0
        return sum + input[key as keyof FeatureVector] * weight
      }, 0)

      scores[persona.persona_name] = score
    }

    this.context.personaScores = scores
  }

  private activatePersonas() {
    const scores = this.context.personaScores!
    
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])

    const getPersona = (id: string) => PERSONA_REGISTRY.getAll()
      .find(p => p.persona_name === id)!

    const primary = getPersona(sorted[0][0])
    const active: Persona[] = [primary]

    // Secondary persona check (≥ 0.75 × primary score)
    if (sorted[1][1] >= sorted[0][1] * 0.75) {
      active.push(getPersona(sorted[1][0]))
    }

    // Auto-injection rules
    const featureVector = this.context.featureVector!
    if (featureVector.emotional_intensity > 0.8) {
      active.push(getPersona('Existential_Diver'))
    }
    if (featureVector.execution_need > 0.85) {
      active.push(getPersona('Tactical_Operator'))
    }

    // Cap at MAX_PERSONAS
    const capped = active.slice(0, MAX_PERSONAS)

    this.context.activePersonas = capped
    
    // Compute confidence
    const primaryScore = sorted[0][1]
    const secondScore = sorted[1]?.[1] || 0
    this.context.confidenceScore = primaryScore - secondScore
  }

  private async executePersonas() {
    const outputs: Record<string, string> = {}

    // Execute in parallel for speed
    const promises = this.context.activePersonas!.map(async (persona) => {
      const output = await callOllamaPersona(persona, this.context.inputPrompt)
      return [persona.persona_name, output] as const
    })

    const results = await Promise.all(promises)
    this.context.personaOutputs = Object.fromEntries(results)
  }

  private shouldCritique(): boolean {
    if (!this.context.featureVector) return false

    return (
      this.context.featureVector.institutional_critique > 0.7 ||
      this.context.confidenceScore! < 0.15
    )
  }

  private async critique() {
    const critique = await callOllamaCritique(this.context.personaOutputs!)
    this.context.critiqueOutput = critique
  }

  private async synthesize() {
    const final = await callOllamaSynthesis({
      personas: this.context.personaOutputs!,
      critique: this.context.critiqueOutput
    })

    this.context.finalOutput = final
  }

  private prepareStreaming() {
    // Streaming is handled at the API layer
  }
}
```

### Graph Context

The GraphContext maintains state throughout execution:

```typescript
interface GraphContext {
  // Input
  inputPrompt: string
  
  // Classification
  featureVector?: FeatureVector
  
  // Scoring
  personaScores?: Record<string, number>
  
  // Activation
  activePersonas?: Persona[]
  blendConfig?: BlendConfig
  
  // Execution
  personaOutputs?: Record<string, string>
  
  // Critique
  critiqueOutput?: CritiqueOutput
  
  // Synthesis
  finalOutput?: string
  
  // Metadata
  confidenceScore?: number
  totalTokenEstimate: number
  currentState: GraphStateType
  error?: string
  metadata: Record<string, any>
}
```

---

## 5. Implementing the Directed Acyclic Graph

While the FSM controls *when* things happen, the Directed Acyclic Graph (DAG) controls *what* executes and *how data flows* between cognitive operations.

### Graph Topology

The system models cognition as a DAG where nodes represent cognitive operations and edges represent information flow.

#### Base Graph Structure

```typescript
const baseGraph = {
  nodes: [
    "Input",
    "Classifier", 
    "PersonaSelector",
    "Synthesis",
    "Output"
  ],
  edges: [
    ["Input", "Classifier"],
    ["Classifier", "PersonaSelector"],
    ["PersonaSelector", "Synthesis"],
    ["Synthesis", "Output"]
  ]
}
```

#### Extended Graph with Personas

```typescript
const extendedGraph = {
  nodes: [
    "Input",
    "Classifier",
    "Systems_Stoic",
    "KonradFreeman", 
    "Tactical_Operator",
    "Vision_Architect",
    "Existential_Diver",
    "Social_Navigator",
    "Creative_Disruptor",
    "Critique",
    "Synthesis",
    "Output"
  ],
  edges: [
    // Classification flow
    ["Input", "Classifier"],
    ["Classifier", "Systems_Stoic"],
    ["Classifier", "KonradFreeman"],
    ["Classifier", "Tactical_Operator"],
    ["Classifier", "Vision_Architect"],
    ["Classifier", "Existential_Diver"],
    ["Classifier", "Social_Navigator"],
    ["Classifier", "Creative_Disruptor"],
    
    // Persona to critique (optional)
    ["Systems_Stoic", "Critique"],
    ["KonradFreeman", "Critique"],
    ["Tactical_Operator", "Critique"],
    ["Vision_Architect", "Critique"],
    ["Existential_Diver", "Critique"],
    ["Social_Navigator", "Critique"],
    ["Creative_Disruptor", "Critique"],
    
    // Critique to synthesis
    ["Critique", "Synthesis"],
    
    // Synthesis to output
    ["Synthesis", "Output"]
  ]
}
```

### Node Types

The system defines several node types:

1. **Input Node**: Entry point for user prompts
2. **Classifier Node**: Analyzes input and extracts feature vector
3. **Persona Nodes** (7 total): Generate reasoning from each persona's perspective
4. **Critique Node**: Evaluates persona outputs for flaws, tone issues, depth
5. **Synthesis Node**: Merges multiple persona outputs into coherent response
6. **Output Node**: Final response rendering with streaming support

### Feature Vector

The classifier extracts an 8-dimensional feature vector from the input:

```typescript
interface FeatureVector {
  emotional_intensity: number      // 0-1
  urgency: number                  // 0-1
  self_reflection: number          // 0-1
  institutional_critique: number   // 0-1
  creative_request: number         // 0-1
  strategic_planning: number       // 0-1
  social_navigation: number        // 0-1
  execution_need: number           // 0-1
}
```

### Parallel Execution Model

One of the key advantages of the DAG approach is parallel execution:

```
                    ┌─────────────┐
                    │ Classifier  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Scoring   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Activation │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Persona A│    │ Persona B│    │ Persona C│
   │(Parallel)│    │(Parallel)│    │(Parallel)│
   └─────┬────┘    └─────┬────┘    └─────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Synthesis  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Output   │
                    └─────────────┘
```

---

## 6. Ollama Integration

Ollama provides the local LLM inference engine that powers all cognitive operations. Using a local model offers significant advantages: privacy (data never leaves your machine), offline operation, and cost control.

### Setting Up Ollama

First, install Ollama:

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

Then pull the required models:

```bash
# Default model for general purpose
ollama pull mistral

# Lightweight model for classification
ollama pull phi3

# Higher quality (if hardware allows)
ollama pull llama3
```

### The Ollama Client

Here's the complete Ollama integration client:

```typescript
// lib/ollama/client.ts
import { generate, generateStream } from 'ollama'

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  system?: string
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
    stop?: string[]
  }
}

export async function generate(
  request: OllamaGenerateRequest
): Promise<OllamaGenerateResponse> {
  const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`)
  }

  return response.json()
}

export async function* generateStream(
  request: OllamaGenerateRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(Boolean)
    
    for (const line of lines) {
      const data = JSON.parse(line)
      if (data.response) {
        yield data.response
      }
      if (data.done) break
    }
  }
}
```

### System Prompt Construction

Each cognitive operation requires a specially crafted prompt. Here's how to build them:

#### Persona System Prompt

```typescript
function buildPersonaSystemPrompt(persona: Persona): string {
  return `You are operating in persona mode.

Primary Persona: ${persona.persona_name}

Core Identity:
- Archetype: ${persona.identity.archetype}
- Core Motivation: ${persona.identity.core_motivation}
- Worldview: ${persona.identity.worldview}
- Emotional Posture: ${persona.identity.emotional_posture}

Core Rules:
${persona.core_rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

Tone Constraints:
${Object.entries(persona.tone_constraints)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Failure Modes To Avoid:
${persona.failure_modes.map(mode => `- ${mode}`).join('\n')}

${persona.forbidden_behaviors ? `Forbidden Behaviors:\n${persona.forbidden_behaviors.map(b => `- ${b}`).join('\n')}` : ''}

Internal Instruction:
${persona.example_internal_instruction}

Remember: Stay in character as ${persona.persona_name}. Do not break persona.`
}
```

#### Classifier Prompt

```typescript
const CLASSIFIER_SYSTEM_PROMPT = `You are a routing classifier. Your task is to analyze user input and extract a feature vector.

Analyze for these dimensions:
- emotional_intensity: How emotionally charged is the prompt?
- urgency: How time-sensitive is this request?
- self_reflection: Is the user asking about themselves/their feelings?
- institutional_critique: Is there criticism of organizations/systems?
- creative_request: Is this a creative/generative task?
- strategic_planning: Is this about future planning/strategy?
- social_navigation: Is this about interpersonal relationships?
- execution_need: Is this asking for actionable steps?

Return ONLY valid JSON with values between 0 and 1.`

function buildClassifierPrompt(userInput: string): string {
  return `${CLASSIFIER_SYSTEM_PROMPT}

User input: """
${userInput}
"""

Output JSON:`
}
```

#### Critique Prompt

```typescript
const CRITIQUE_SYSTEM_PROMPT = `You are a critique engine. Analyze the following outputs and provide structured feedback.`

function buildCritiquePrompt(
  personaOutputs: Record<string, string>
): string {
  const outputsText = Object.entries(personaOutputs)
    .map(([persona, output]) => 
      `=== ${persona.toUpperCase()} ===\n${output}\n`
    )
    .join('\n')

  return `${CRITIQUE_SYSTEM_PROMPT}

Analyze the following persona outputs:

${outputsText}

Provide your critique in this JSON format:
{
  "logical_flaws": ["issue1", "issue2"],
  "tone_issues": ["issue1"],
  "missed_depth": ["aspect1"],
  "suggestions": ["improvement1"],
  "overall_assessment": "brief summary",
  "passes_critique": true/false
}

Output only valid JSON:`
}
```

#### Synthesis Prompt

```typescript
const SYNTHESIS_SYSTEM_PROMPT = `You are a synthesis node. Your task is to merge multiple perspectives into a single, coherent response.`

function buildSynthesisPrompt(
  personaOutputs: Record<string, string>,
  critique?: CritiqueOutput
): string {
  const outputsText = Object.entries(personaOutputs)
    .map(([persona, output]) => 
      `--- Perspective from ${persona} ---\n${output}\n`
    )
    .join('\n')

  const critiqueSection = critique 
    ? `\n=== CRITIQUE FEEDBACK (address these) ===\n${critique.suggestions.join('\n')}\n`
    : ''

  return `${SYNTHESIS_SYSTEM_PROMPT}

${outputsText}${critiqueSection}

Requirements:
1. Merge these perspectives into ONE coherent response
2. NO mention of which personas were used
3. Maintain a unified voice
4. Address critique suggestions if present
5. Be clear, direct, and helpful

Produce your final response:`
}
```

### Making the Ollama Calls

```typescript
export async function callOllamaClassifier(
  prompt: string
): Promise<FeatureVector> {
  const response = await generate({
    model: process.env.CLASSIFIER_MODEL || 'phi3',
    prompt: buildClassifierPrompt(prompt),
    options: {
      temperature: 0.1,
      num_predict: 500,
    },
  })

  try {
    return JSON.parse(response.response)
  } catch {
    // Fallback for malformed responses
    return {
      emotional_intensity: 0.5,
      urgency: 0.5,
      self_reflection: 0.5,
      institutional_critique: 0.5,
      creative_request: 0.5,
      strategic_planning: 0.5,
      social_navigation: 0.5,
      execution_need: 0.5,
    }
  }
}

export async function callOllamaPersona(
  persona: Persona,
  userPrompt: string,
  config?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const systemPrompt = buildPersonaSystemPrompt(persona)
  
  const response = await generate({
    model: process.env.PERSONA_MODEL || 'mistral',
    prompt: userPrompt,
    system: systemPrompt,
    options: {
      temperature: config?.temperature ?? 0.7,
      num_predict: config?.maxTokens ?? 1000,
      top_p: 0.9,
    },
  })

  return response.response
}

export async function callOllamaCritique(
  outputs: Record<string, string>
): Promise<CritiqueOutput> {
  const response = await generate({
    model: process.env.CRITIQUE_MODEL || 'mistral',
    prompt: buildCritiquePrompt(outputs),
    options: {
      temperature: 0.2,
      num_predict: 800,
    },
  })

  try {
    return JSON.parse(response.response)
  } catch {
    return {
      logical_flaws: [],
      tone_issues: [],
      missed_depth: [],
      suggestions: [],
      overall_assessment: 'Analysis incomplete',
      passes_critique: true,
    }
  }
}

export async function callOllamaSynthesis(
  inputs: {
    personas: Record<string, string>
    critique?: CritiqueOutput
  }
): Promise<string> {
  const response = await generate({
    model: process.env.SYNTHESIS_MODEL || 'mistral',
    prompt: buildSynthesisPrompt(inputs.personas, inputs.critique),
    options: {
      temperature: 0.6,
      num_predict: 1500,
    },
  })

  return response.response
}
```

---

## 7. The Next.js Frontend

The frontend provides a modern, responsive interface with real-time streaming, animations, and detailed routing analysis visualization.

### Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── globals.css            # Global styles
├── api/
│   └── cognitive/
│       └── route.ts       # Main API endpoint
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── cognitive/
│   │   ├── ChatInterface.tsx
│   │   ├── PersonaBadge.tsx
│   │   ├── StreamingOutput.tsx
│   │   ├── RoutingDetails.tsx
│   │   ├── BlendIndicator.tsx
│   │   ├── ConfidenceMeter.tsx
│   │   └── StateBadge.tsx
│   └── layout/
├── lib/
│   ├── utils.ts          # Utility functions
│   ├── api.ts            # API client
│   └── types.ts          # TypeScript types
└── hooks/
    ├── useStreaming.ts   # Streaming response hook
    └── useCognitive.ts    # Main cognitive interaction hook
```

### Custom Hooks

#### useCognitive

The main hook for interacting with the cognitive API:

```typescript
// hooks/useCognitive.ts
import { useState, useCallback } from 'react'

interface UseCognitiveOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (response: CognitiveResponse) => void
  onError?: (error: Error) => void
}

interface CognitiveResponse {
  content: string
  metadata: {
    personas_used: string[]
    confidence: number
    feature_vector: Record<string, number>
  }
}

export function useCognitive(options: UseCognitiveOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = useCallback(async (prompt: string) => {
    setIsStreaming(true)

    try {
      const response = await fetch('/api/cognitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          if (line === 'data: [DONE]') continue
          
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            if (data.token) {
              fullContent += data.token
              options.onChunk?.(data.token)
            }
          } catch {
            // Skip malformed data
          }
        }
      }

      // Get full response for metadata
      const fullResponse = await fetch('/api/cognitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, getMetadata: true })
      }).then(r => r.json())

      options.onComplete?.({
        content: fullContent,
        metadata: fullResponse.metadata
      })

    } catch (error) {
      options.onError?.(error as Error)
    } finally {
      setIsStreaming(false)
    }
  }, [options])

  return { sendMessage, isStreaming }
}
```

---

## 8. API Layer Implementation

The API layer connects the frontend to the cognitive processing engine, handling request validation, streaming responses, and error handling.

### Main API Route

```typescript
// app/api/cognitive/route.ts
import { NextRequest } from 'next/server'
import { CognitiveGraphFSM } from '@/lib/fsm/cognitive-graph-fsm'
import { generateStream } from '@/lib/ollama/client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Build and run the cognitive graph
    const fsm = new CognitiveGraphFSM(prompt)
    const context = await fsm.run()

    if (context.currentState === 'ERROR') {
      return Response.json(
        { error: context.error || 'Processing failed' },
        { status: 500 }
      )
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const finalOutput = context.finalOutput || ''

        // Stream the final output token by token
        for (const token of finalOutput.split('')) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
          )
          await new Promise(r => setTimeout(r, 20))
        }
        
        // Send metadata at the end
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            metadata: {
              personas_used: context.activePersonas?.map(p => p.persona_name),
              confidence: context.confidenceScore,
              feature_vector: context.featureVector
            }
          })}\n\n`)
        )
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 9. Deployment and Production

Deploying the Cognitive Graph application requires consideration of the local Ollama dependency and the real-time nature of the responses.

### Prerequisites

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| GPU | Optional | NVIDIA 8GB+ |

### Environment Configuration

```bash
# .env.local

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
CLASSIFIER_MODEL=phi3
PERSONA_MODEL=mistral
CRITIQUE_MODEL=mistral
SYNTHESIS_MODEL=mistral

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running the Application

```bash
# Install dependencies
npm install

# Start Ollama
ollama serve

# Pull required models
ollama pull mistral
ollama pull phi3

# Start development server
npm run dev
```

---

## 10. Conclusion

Building a Cognitive Graph AI application is an exercise in architectural thinking—breaking down complex cognitive processes into modular, composable pieces that can be orchestrated, parallelized, and observed.

### What We've Built

Throughout this guide, we've constructed a complete cognitive routing system:

1. **A layered architecture** that separates concerns from presentation to inference
2. **A Finite State Machine** that provides deterministic control over execution flow
3. **A Directed Acyclic Graph** that models cognitive operations and their dependencies
4. **Seven distinct personas** that represent different reasoning perspectives
5. **An intelligent routing system** that automatically selects and blends personas based on input analysis
6. **A modern Next.js frontend** with real-time streaming and beautiful animations
7. **Complete API integration** with Ollama for local LLM inference

### Key Takeaways

- **Modularity matters**: By decomposing cognition into personas, you get specialized reasoning without building separate systems
- **Determinism enables reliability**: The FSM ensures predictable behavior, making debugging possible
- **Parallelism enables speed**: Multiple personas can reason simultaneously, improving response times
- **Visibility enables trust**: By exposing routing decisions, confidence scores, and feature vectors, users can understand and trust the system

### Future Enhancements

The architecture supports many extensions:

- **Memory systems**: Add persistent context across conversations
- **Dynamic persona creation**: Allow users to define custom personas
- **Multi-modal inputs**: Extend to handle images, audio, and other inputs
- **Distributed execution**: Scale to multiple Ollama instances for higher throughput
- **Advanced critiquing**: Implement iterative refinement loops

### Getting Started Today

To build this system yourself:

1. Install Ollama and pull the required models
2. Create a Next.js project with TypeScript
3. Implement the persona registry and FSM
4. Build the API routes
5. Create the frontend components
6. Deploy and iterate

The Cognitive Graph architecture represents a fundamental shift in how we think about AI systems—not as monolithic black boxes, but as observable, controllable, and infinitely extensible cognitive engines.

---

## Appendix: Quick Reference

### NPM Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ollama": "^0.1.0",
    "framer-motion": "^10.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Check health
curl http://localhost:3000/api/health
```

---
