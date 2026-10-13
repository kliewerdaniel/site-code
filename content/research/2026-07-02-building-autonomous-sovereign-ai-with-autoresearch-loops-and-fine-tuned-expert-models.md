---
book_reference: true
canonical_url: /blog/2026-07-02-building-autonomous-sovereign-ai-with-autoresearch-loops-and-fine-tuned-expert-models
categories:
  - AI Architecture
  - Sovereign AI
  - Agent Systems
date: 07-02-2026
description: 'How to build self-improving AI systems using autoresearch loops, agent recipes, and domain-specific fine-tuning with open-source tools. A complete implementation guide connecting the latest research from Introspection, Bridgewater AIA Labs, and Thinking Machines Lab.'
image: /images/ComfyUI_00206_.png
layout: post
tags:
  - autonomous-agents
  - sovereign-ai
  - autoresearch
  - fine-tuning
  - local-first
  - open-source
  - agent-recipes
  - reinforcement-learning
  - sovereign-architecture
  - local-llms
  - ollama
  - smolagents
  - langgraph
  - deerflow
title: 'Building Autonomous Sovereign AI: How Autoresearch Loops and Expert Fine-Tuning Create Self-Improving Local AI Systems'
wiki_references: ["autonomous-agents", "fine-tuning", "knowledge-graphs", "local-llms", "ollama", "rag", "reinforcement-learning", "sovereign-ai"]
---

# Autoresearch Loops and Differentiated Intelligence

**Two Converging Blueprints for Self-Improving AI Systems**

**Date:** July 2, 2026

---

## Introduction: The Shift from Models to Systems That Improve Themselves

Two major threads in AI research converged almost simultaneously.

On one side, Introspection's "autoresearch" framework reframes AI systems not as static models, but as self-improving loops. On the other, Thinking Machines Lab and Bridgewater AIA Labs demonstrated something more concrete: carefully trained open-weight models can outperform frontier LLMs on tasks requiring expert judgment—at lower cost and higher accuracy.

Taken together, they point to a new design principle:

> The unit of intelligence is no longer the model. It is the loop.

This post synthesizes both perspectives into a single architecture for building sovereign, self-improving AI systems—systems that continuously refine their own behavior through evaluation, feedback, and fine-tuning.

---

## Part 1: Autoresearch — When the Loop Becomes the Product

Roland Gavrilescu's framing at Introspection introduces a shift in how we think about agent systems.

### 1. The Loop Is the Product

Traditional AI systems are static:

> Train → Deploy → Maintain

Autoresearch systems are dynamic:

> Observe → Evaluate → Improve → Repeat

The key idea is that the feedback loop itself becomes the product surface.

But the hard problem isn't building loops—it's designing signals that are meaningful enough for improvement without collapsing into noisy optimization.

Cheap signals (likes, heuristics, weak metrics) lead to "slop optimization."
Expensive signals (expert review, structured evals) are what actually move capability.

---

### 2. Agent Recipes: Capturing How Systems Evolve

A core concept is the agent recipe.

An agent recipe is not configuration—it is history:

* The model + harness configuration
* The evaluation suite used over time
* The human expertise embedded in the system
* The failure cases that led to new evaluations
* The decisions that shaped the system's current behavior

If you inherited a production agent system, the code alone would not explain why it behaves the way it does. The recipe captures that missing context.

> It is, effectively: A versioned memory of how intelligence was shaped.

---

### 3. Inner Loop vs Outer Loop

Autoresearch systems split into two interacting systems:

**Inner loop:**
* Executes tasks
* Produces outputs
* Interfaces with users

**Outer loop:**
* Observes performance
* Identifies failure patterns
* Creates new evaluations
* Updates prompts, tools, or training data

The outer loop is where improvement happens. The inner loop is where value is delivered.

The key design challenge is ensuring the outer loop remains cost-bounded and signal-efficient, not a runaway optimization engine.

---

### 4. Humans as Tools in the Loop

A subtle but important shift:

Humans are not outside the system. They are callable components inside the loop, especially early on.

As systems accumulate examples of human decisions, they reduce their reliance on explicit queries. This mirrors apprenticeship: early heavy supervision → gradual autonomy.

---

## Part 2: The Expert Judgment Problem

Autoresearch loops matter because of a deeper empirical limitation in current frontier models.

### Where Frontier Models Break

Bridgewater AIA Labs evaluated frontier models on six tasks involving real investment workflows:

* Financial article relevance
* Central bank document interpretation
* Boilerplate detection in research
* Email truncation detection
* Signal extraction from macroeconomic text
* General document relevance filtering

These are not reasoning-heavy tasks. They are judgment-heavy tasks. And that distinction matters.

Even with strong prompting, frontier models plateaued around ~78% accuracy—below the threshold required for real-world deployment in expert workflows.

---

### The Core Limitation: Tacit Judgment

> Prompts can only encode what experts can articulate. The most important judgments are often non-verbalizable.

This is where prompting stops working.

---

### Why Fine-Tuning Wins

Fine-tuning bypasses articulation entirely. Instead of translating intuition into instructions, it learns directly from examples of decisions.

The result:
* Base model: ~44% accuracy
* With GRPO + structured training: ~73%
* Final system: ~84.7% accuracy

And critically:
* ~30% fewer errors than frontier models
* ~13.8× lower inference cost

This is not incremental improvement. It is a regime shift in how capability is produced.

---

### What Actually Mattered in Training

The gains did not come from a single trick. They came from structured system design:

* GRPO-style RL: largest jump in performance
* Interleaved batching: improves cross-task generalization
* Loss function design (CISPO): stabilizes optimization
* On-policy distillation: prevents degradation over time
* Carefully curated expert feedback loops: highest leverage factor

But the most important bottleneck wasn't architecture—it was data quality and labeling strategy.

A key technique:

> Train on cheap labels → route disagreements to experts → iterate

This turns expensive expert time into a targeted refinement signal rather than a brute-force labeling requirement.

---

## Part 3: What This Means — The New AI Architecture Stack

When you combine autoresearch loops with fine-tuning results, a consistent architecture emerges.

### 1. Separate Inner and Outer Loops Explicitly

* Inner loop: fast inference, stable behavior, user-facing reliability
* Outer loop: slow optimization, experimentation, evaluation-driven updates

They must be independently constrained.

---

### 2. Treat "Recipes" as First-Class Artifacts

Agent systems should not be defined by prompts or configs. They should be defined by:

* Evaluation history
* Failure cases
* Data lineage
* Human correction traces

This is the difference between a system that works today and one that improves tomorrow.

---

### 3. Prompting Has a Ceiling

Prompt engineering works for:
* Knowledge retrieval
* Structured reasoning
* Clear rule-based tasks

It fails for:
* Tacit judgment
* Domain-specific intuition
* Expert-style filtering decisions

When the task depends on "feel," you need data, not prompts.

---

### 4. Fine-Tuning Is Not Optional for Expert Systems

If a task meets this condition: "An expert cannot fully explain how they decide," then the correct solution is:

* Not better prompting
* Not longer context windows
* But supervised + RL fine-tuning pipelines

---

### 5. Cost Efficiency Comes from Specialization

The economic advantage is structural. Smaller, specialized models:
* Beat frontier models on narrow expert tasks
* Cost an order of magnitude less
* Run locally with sovereignty guarantees

This is the foundation of differentiated intelligence.

---

## Part 4: Sovereign AI Systems — The Practical Architecture

The implementation pattern that emerges looks like this:

### Core Components

1. **Local inference layer**
   * Ollama or similar runtime
   * Open-weight models (Qwen, Llama, Mistral)

2. **Agent harness**
   * Task execution layer
   * Tool calling + orchestration
   * Deterministic control flow

3. **Evaluation system**
   * Domain-specific judges
   * Failure detection logic
   * Automated regression tests

4. **Outer loop system**
   * Logs performance over time
   * Generates new evaluations
   * Updates recipes and datasets

5. **Fine-tuning pipeline**
   * GRPO / RL-based optimization
   * LoRA-based efficient training
   * Distillation from stronger teachers

6. **Knowledge layer**
   * Vector database (semantic memory)
   * Knowledge graph (structured relationships)
   * Persona routing (expert specialization)

---

## Part 5: The Key Insight — Intelligence Is Becoming Infrastructure

The convergence here is not accidental. Both systems point to the same shift:

**Old paradigm:** Intelligence = model capability

**New paradigm:** Intelligence = system that improves itself

The model becomes just one component in a larger feedback architecture.

The real differentiator is:
* How you collect feedback
* How you structure evaluation
* How you convert experience into training signal
* How you close the loop

---

## Conclusion: From Models to Living Systems

The next generation of AI systems will not be defined by parameter count or context length. They will be defined by:

* How quickly they learn from failure
* How well they encode expert judgment
* How tightly feedback loops are integrated into their architecture
* How cheaply they improve over time

Autoresearch provides the system design. Fine-tuning research provides the empirical validation.

Together, they define a single direction: AI systems are becoming self-improving infrastructures for capturing and refining human expertise.

> The model is no longer the product. The loop is.

---

## Sources

* [Autoresearch: The feedback loop behind self-improving agents](https://www.latent.space/p/autoresearch-introspection) - Latent.Space
* [Learning to replicate expert judgment in financial tasks](https://thinkingmachines.ai/news/learning-to-replicate-expert-judgment-in-financial-tasks) - Thinking Machines Lab

---

## Addendum: Implementation Notes and Minimal Code Examples for a Sovereign Autoresearch System

This addendum translates the architecture described above into concrete, minimal implementations. The goal is not production completeness, but to show how the pieces actually connect: inner loop, outer loop, evaluation layer, and fine-tuning pipeline.

---

### 1. Core Idea: Everything Reduces to a Loop

At runtime, every sovereign AI system collapses into the same structure:

```python
def run_system(task):
    result = inner_loop(task)
    score = evaluate(result)
    feedback = outer_loop(task, result, score)
    update_system(feedback)
    return result
```

Everything else—agents, RAG, fine-tuning—is just implementation detail around this structure.

---

### 2. Inner Loop: Agent Execution Layer

The inner loop is the "worker." It must be stable, deterministic enough to evaluate, and cheap enough to run repeatedly.

**Example: Local Agent with Ollama**

```python
from ollama import chat

class InnerLoopAgent:
    def __init__(self, model="qwen2.5:7b"):
        self.model = model

    def run(self, task, context=""):
        prompt = f"""
        You are an expert system.
        Context:
        {context}
        Task:
        {task}
        Return a structured answer.
        """
        response = chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response["message"]["content"]
```

**Key point:** The inner loop should NOT evolve itself. It only executes.

---

### 3. Evaluators: Turning Judgment into Code

Evaluators are where "taste" becomes computable.

**Example: Simple domain evaluator**

```python
def relevance_evaluator(output: str, task: str) -> float:
    """
    Scores whether output matches expected domain constraints.
    In practice, this can be:
    - heuristics
    - small judge model
    - embedding similarity
    """
    keywords = ["market", "risk", "macro", "liquidity"]
    score = sum(1 for k in keywords if k in output.lower())
    return min(score / len(keywords), 1.0)
```

**Better version: LLM-as-judge**

```python
def llm_judge(output, task, model="llama3.1:8b"):
    prompt = f"""
    Evaluate this output for correctness and relevance.
    Task:
    {task}
    Output:
    {output}
    Score from 0 to 1 with explanation.
    """
    res = chat(model=model, messages=[{"role": "user", "content": prompt}])
    return parse_score(res["message"]["content"])
```

---

### 4. Outer Loop: Autoresearch Engine

The outer loop is the "researcher." It looks at failures and modifies the system.

**Minimal implementation**

```python
from collections import defaultdict

class OuterLoop:
    def __init__(self):
        self.failures = []

    def record(self, task, output, score):
        if score < 0.8:
            self.failures.append((task, output, score))

    def analyze_patterns(self):
        patterns = defaultdict(int)
        for task, output, score in self.failures:
            if "market" in output:
                patterns["market_bias"] += 1
            if len(output) < 50:
                patterns["verbosity_issue"] += 1
        return patterns
```

---

### 5. Turning Failures into New Evaluators

This is the key autoresearch step: the system writes its own tests.

```python
def generate_new_evaluator(pattern_name):
    if pattern_name == "verbosity_issue":
        def evaluator(output, task):
            return 1.0 if len(output) > 100 else 0.0
        return evaluator
    if pattern_name == "market_bias":
        def evaluator(output, task):
            banned = ["guaranteed profit", "risk-free"]
            return 0.0 if any(b in output.lower() for b in banned) else 1.0
        return evaluator
```

Then the outer loop injects this back into the system:

```python
class System:
    def __init__(self):
        self.evaluators = [relevance_evaluator]

    def update(self, new_eval):
        self.evaluators.append(new_eval)
```

---

### 6. Agent Recipe: The Versioned Intelligence Artifact

This is where system memory becomes structured.

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class AgentRecipe:
    name: str
    model: str
    evaluators: list
    history: list = field(default_factory=list)

    def log_failure(self, task, output, score):
        self.history.append({
            "task": task,
            "output": output,
            "score": score,
            "time": datetime.now().isoformat()
        })

    def export(self):
        return {
            "name": self.name,
            "model": self.model,
            "evaluators": [e.__name__ for e in self.evaluators],
            "history": self.history
        }
```

**Key idea:** Recipes are not config files. They are compressed learning histories.

---

### 7. Full Autoresearch Loop (Putting It Together)

```python
class AutoresearchSystem:
    def __init__(self, agent, recipe):
        self.agent = agent
        self.recipe = recipe
        self.outer = OuterLoop()

    def step(self, task):
        output = self.agent.run(task)
        score = self.evaluate(output, task)
        self.outer.record(task, output, score)
        self.recipe.log_failure(task, output, score)
        return output, score

    def evaluate(self, output, task):
        scores = [e(output, task) for e in self.recipe.evaluators]
        return sum(scores) / len(scores)

    def improve(self):
        patterns = self.outer.analyze_patterns()
        for pattern, count in patterns.items():
            if count > 3:
                new_eval = generate_new_evaluator(pattern)
                self.recipe.evaluators.append(new_eval)
```

---

### 8. Fine-Tuning Hook: Closing the Loop with Learning

Once enough failures accumulate, we convert them into training data.

```python
def build_dataset(recipe):
    dataset = []
    for entry in recipe.history:
        dataset.append({
            "input": entry["task"],
            "output": entry["output"],
            "label": entry["score"]
        })
    return dataset
```

Then fine-tune (LoRA-style sketch):

```python
from transformers import AutoModelForCausalLM

def fine_tune(model_name, dataset):
    model = AutoModelForCausalLM.from_pretrained(model_name)
    # pseudo-training loop
    for batch in dataset:
        loss = compute_loss(model, batch)
        loss.backward()
    return model
```

---

### 9. Knowledge Graph Hook (Optional but Powerful)

To move from "memory" to "structure":

```python
import networkx as nx

class KnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_fact(self, subject, relation, obj):
        self.graph.add_edge(subject, obj, relation=relation)

    def query(self, node):
        return list(self.graph.neighbors(node))
```

Example usage:

```python
kg = KnowledgeGraph()
kg.add_fact("inflation", "impacts", "interest_rates")
kg.add_fact("interest_rates", "impacts", "equities")
```

Now reasoning becomes graph traversal instead of pure generation.

---

### 10. The Complete System in One View

```
                    agent → inner loop execution
                      ↓
              evaluation layer (judges)
                      ↓
              outer loop (failure analysis)
                      ↓
               recipe update (system memory)
                      ↓
           fine-tuning dataset generation
                      ↓
                model improvement
                      ↓
                   back to agent
```

This is the full autoresearch cycle. Not a metaphor. A literal closed system.

---

### Closing Insight

Once implemented, something important becomes visible:

> Intelligence is no longer stored in the model.

It is distributed across:
* evaluation functions
* failure history
* training data generation
* update rules
* and loop structure itself

The model is just the execution substrate. The loop is where intelligence actually accumulates.

---

## Related Resources

### Related Posts

- [The Sovereign Intelligence Stack](/blog/2026-07-04-sovereign-intelligence-stack) — 5-layer architecture with working code
- [The Loop Is the Product](/blog/2026-07-03-the-sovereign-intelligence-observatory) — Intelligence Observatory deep dive
- [The Model Is Not the Product](/blog/2026-07-03-the-model-is-not-the-product) — Research validation
- [Getting Started with Sovereign AI](/blog/2026-07-05-getting-started-sovereign-ai) — Beginner on-ramp
- [Local AI Architecture](/blog/2026-07-05-local-ai-architecture-synthesis) — Local-first implementation guide
- [Retrieval Architecture](/blog/2026-07-05-retrieval-architecture-synthesis) — Memory and retrieval systems

### Related Repositories

- [sovereign-intelligence-stack](https://github.com/kliewerdaniel/sovereign-intelligence-stack) — 70 Python files, 7,757 lines
- [Sovereign Memory Bank](https://github.com/kliewerdaniel/sovereign-memory-bank) — 7-layer autonomous cognitive memory
- [Dynamic Persona MoE RAG](https://github.com/kliewerdaniel/dynamic-persona-moe-rag) — Persona-driven mixture-of-experts
- [Objective05](https://github.com/kliewerdaniel/objective05) — Persistent intelligence infrastructure in Rust
- [SovereignSpec](https://github.com/kliewerdaniel/sovereignspec) — Spec-driven development engine

### Additional Research

- [Autoresearch: The feedback loop behind self-improving agents](https://www.latent.space/p/autoresearch-introspection) — Latent.Space
- [Learning to replicate expert judgment in financial tasks](https://thinkingmachines.ai/news/learning-to-replicate-expert-judgment-in-financial-tasks) — Thinking Machines Lab
- [Autonomous Agent Research](https://arxiv.org/search/?query=autonomous+agents&searchtype=all) — arXiv search
- [Expert Fine-Tuning Research](https://arxiv.org/search/?query=expert+fine+tuning&searchtype=all) — arXiv search
- [Autoresearch Loops Research](https://arxiv.org/search/?query=autoresearch&searchtype=all) — arXiv search
- [Bridgewater AIA Labs](https://www.bridgewater.com/) — Autonomous evaluation
- [Thinking Machines Lab](https://www.thinkmachineslab.com/) — Compounding intelligence