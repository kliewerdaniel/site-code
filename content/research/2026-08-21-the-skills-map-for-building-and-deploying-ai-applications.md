---
author: Daniel Kliewer
canonical_url: /blog/2026-08-21-the-skills-map-for-building-and-deploying-ai-applications
date: 08-21-2026
description: "A field guide to the six competencies that make up building and deploying AI applications — LLM foundations, grounding with data, agentic systems, evaluation-driven development, production operations, and machine-learning foundations — with the research and tools behind each."
image: /images/ai-engineering-skills-map.png
layout: post
title: 'The Skills Map for Building and Deploying AI Applications'
og:description: "Six competencies, one discipline: building reliable software on top of unreliable AI components. A field guide with the papers, frameworks, and posts behind each skill."
og:image: /images/ai-engineering-skills-map.png
og:title: 'The Skills Map for Building and Deploying AI Applications'
og:type: article
og:url: /blog/2026-08-21-the-skills-map-for-building-and-deploying-ai-applications
tags:
  - ai-engineering
  - llm
  - agents
  - evaluation
  - rag
  - production
  - machine-learning
---


The single most useful thing someone handed me this year is a one-page map of the
skills that make up *building and deploying AI applications*. It was built by
analyzing a large number of job postings, structured expert interviews, and
survey responses — so it reflects what the field actually rewards, not what a
single company's blog thinks is fashionable.

The map is worth sitting with. AI Engineering sits at the top, and one of its
four branches — *Building and deploying AI applications* — expands into six
competencies:

1. **LLM foundations**
2. **Grounding models with data**
3. **Building agentic systems**
4. **Evaluation-driven development**
5. **Operating in production**
6. **Machine learning foundations**

That's the map. What follows is my field guide to each node — what the skill
*means*, where to go to actually build it, and how the pieces fit together. I've
linked the primary sources and tools I trust so you can go deeper on any branch.

## The one idea underneath all six

Before the branches: the difference between AI applications and ordinary software
is that **an AI application's output is less predictable**. You don't know in
advance what an LLM will say, or what a supervised model will predict. That
uncertainty changes the *shape* of the work.

Traditional software is planned. AI software is **iterative**. You build a piece,
examine it, and decide what to try next — a sequence of steps driven by the
intermediate results. Skilled AI engineers are good at that loop:

![The core loop: build, examine, evaluate, decide, repeat](/images/ai-eng-iteration-loop.png)

The six competencies are the *toolkit* you reach into at every step of that loop.
Being able to skillfully decide what to do next is what lets you build reliable
systems on top of unreliable components. That's the whole game.

## 1. LLM foundations

Understanding how large language models tokenize input and generate output is
what lets you predict when to count on them and when they'll fail. This is not
trivia — it's the difference between guessing and reasoning about:

- **tokenization and context windows** — what fits, what gets truncated, and the
  cost of a cache miss vs. a cache hit ([OpenAI's tokenizer guide](https://platform.openai.com/docs/guides/prompt-engineering) and [Anthropic's prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) are the canonical practical references; [Lilian Weng's survey](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/) is the deep one);
- **knowledge cutoff and reasoning effort** — knowing a model can't know what it
  wasn't trained on, and how to spend inference budget;
- **sampling parameters** — temperature, top-p, and why "more creative" is
  rarely what a production system wants;
- **special features** — tool calling, multimodal input, and when a smaller
  specialized model beats a giant general one.

The Transformer architecture is the substrate for all of it
([Vaswani et al., 2017 — *Attention Is All You Need*](https://arxiv.org/abs/1706.03762)).
When you understand the foundations you can make the real calls: which model, or
which *mix* of models, and whether a specialized technique like fine-tuning or
self-hosting is worth it ([Hu et al., 2021 — LoRA](https://arxiv.org/abs/2106.09685);
[Dettmers et al., 2023 — QLoRA](https://arxiv.org/abs/2305.14314)).

I've written about this from the sovereignty angle — when the model is local and
you control the weights, "LLM foundations" becomes an operational discipline, not
a vendor dependency. See [Context Engineering: the real full-stack paradigm](https://danielkliewer.com/blog/2026-07-02-context-engineering-the-real-full-stack-development-paradigm)
and [The Model Is Not the Product](https://danielkliewer.com/blog/2026-07-03-the-model-is-not-the-product).

## 2. Grounding models with data

LLMs need good input context to produce useful output. Vector-search RAG was the
early answer, but the toolkit has grown well past it. The actual decision is
*what to include in the prompt versus what to let the model retrieve on demand*,
and *which representation fits the data and the query*:

![Choosing a data representation for grounding](/images/ai-eng-grounding-tree.png)

- **vector index (RAG)** — embed and similarity-search over documents
  ([Chroma](https://github.com/chroma-core/chroma), [Weaviate](https://weaviate.io),
  [LlamaIndex](https://github.com/run-llama/llama_index));
- **knowledge graph** — entities and relations for multi-hop queries
  ([Microsoft GraphRAG](https://github.com/microsoft/graphrag));
- **semantic layer over structured data** — customer records and OLAP reached
  through tools rather than stuffed into a prompt
  ([a private knowledge-graph build with local agents](https://danielkliewer.com/blog/2026-03-17-building-a-private-knowledge-graph-with-local-ai-agents));
- **in-prompt context** — curated records packed into the window
  ([retrieval architecture: memory systems that compound](https://danielkliewer.com/blog/2026-07-05-retrieval-architecture-synthesis)).

Whatever you pick, you still have to turn documents — text, PDFs, HTML, images —
into LLM-ready inputs, and engineer pipelines that keep that data *clean and
fresh*. Stale grounding is worse than no grounding. For the framing of
"RAG is one branch, not the tree," Huyen Chip's
[GenAI Platform design](https://huyenchip.com/2024/07/25/genai-platform.html)
is the clearest industry write-up, and [her AI Engineering field guide](https://www.aiengineeringbook.com)
is worth the read alongside the skills map.

## 3. Building agentic systems

Agentic systems run from workflows that chain a fixed sequence of LLM calls to a
harness that lets the model pick its own next step. The engineering decisions:

- **architecture** — what to chain, what to parallelize, when to use code vs. an
  LLM, and where the fallbacks live
  ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents);
  [Kaggle — Agents whitepaper](https://www.kaggle.com/whitepaper-agents));
- **the tool surface** — what the model can call, including
  [MCP](https://modelcontextprotocol.io), CLI, and sandbox execution
  ([OpenAI Agents guide](https://platform.openai.com/docs/guides/agents),
  [LangGraph](https://github.com/langchain-ai/langgraph));
- **memory and long sessions** — how context is managed across a long run
  ([Sovereign Memory Bank: autonomous cognitive memory for agents](https://danielkliewer.com/blog/2026-06-14-sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems));
- **multi-agent orchestration** — when one agent stops being enough
  ([autonomous architectures and self-improving inference](https://danielkliewer.com/blog/2026-01-03-autonomous-architectures));
- **going to production safely** — guardrails, adversarial inputs, data
  exfiltration, and governance
  ([OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/),
  [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails),
  [LLM-Guard](https://github.com/protectai/llm-guard)).

The field is moving fast — voice agents, computer-use agents, generative UI. Each
is a specialization of the same harness. I've been building these
[fully local](https://danielkliewer.com/blog/2026-03-10-breaking-free-from-chatgpt)
and [giving local systems hands via a real execution environment](https://danielkliewer.com/blog/2026-06-08-objective05-exec-giving-local-intelligence-system-hands).

## 4. Evaluation-driven development

This is the one I'd pick if I could only keep a single skill. The engineers who
are genuinely good at building AI systems are the ones who can drive a disciplined
**evals + error-analysis loop**. It focuses effort on directions that actually
pay off, instead of random thrashing.

Building good evals is its own deep skill:

- **exploratory analysis of traces and outputs**, combined with product and
  business judgment, to decide *what to measure*;
- **the menu of eval types** — deterministic (code-based) checks, LLM-as-a-judge,
  and human-in-the-loop — and when each applies
  ([DeepEval](https://github.com/confident-ai/deepeval),
  [DSPy](https://github.com/stanfordnlp/dspy) for programmatic optimization);
- **evaluating your evals** — so the measurement itself keeps improving.

The right approach varies by project *and by stage of the project*, which is why
it's hard to master. But once you have it, development becomes systematic rather
than random — exactly the loop in the first diagram.

## 5. Operating in production

Operating AI software differs from traditional software because of its
**unpredictability, cost, and latency**. The production skill set:

- **observability** — understand real-world performance, detect drift, and
  respond fast to model failures and adversarial prompt injection
  ([Arize Phoenix](https://docs.arize.com/phoenix),
  [Evidently AI](https://www.evidentlyai.com) for drift and evaluation);
- **statistical CI/CD** — regression testing calibrated to the *risk* of a
  mistake, not a fixed suite;
- **cost and latency optimization** — model-choice optimization, distillation,
  fine-tuning, and workflow simplification when you have many users.

This is where "the loop is the product" becomes literal: if the system runs
continuously, observability *is* the operating system
([If the loop is the product, observability becomes the OS](https://danielkliewer.com/blog/2026-07-22-if-the-loop-is-the-product)
— when that post is live; the theme runs through the whole
[observatory series](https://danielkliewer.com/blog/2026-07-03-the-sovereign-intelligence-observatory)).

## 6. Machine learning foundations

Modern LLMs are built with machine learning — supervised and reinforcement
learning. Everyone I know who is good at building with LLMs also understands ML
and deep learning at some depth, and many applications still need a model someone
else trained or one you train yourself.

Foundations here mean knowing the popular models and their tradeoffs (accuracy,
training speed, inference speed), and how to engineer the data to train and
evaluate them. The mental frameworks — **bias/variance**, **error analysis**,
**engineering your data** — are the same ones that let you navigate uncertain
output everywhere else on this map:

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (Transformers);
- [LoRA](https://arxiv.org/abs/2106.09685) and [QLoRA](https://arxiv.org/abs/2305.14314) (efficient fine-tuning);
- the RL behind modern post-training, including [RLHF](https://arxiv.org/abs/2203.02155)
  and [RLAIF / constitutional methods](https://arxiv.org/abs/2212.08073);
- [distillation](https://arxiv.org/abs/1503.02531) for cost/latency.

Labeling and data-curation tooling like [Label Studio](https://github.com/HumanSignal/label-studio)
and serving layers like [MLServer](https://github.com/SeldonIO/MLServer) round
out the practical stack.

## How to use the map

The map isn't a checklist to finish — it's a diagnostic. When a build is
stuck, the six nodes tell you *which* missing skill is the bottleneck:

- output is unpredictable in a way you can't reason about → **LLM foundations**.
- the model keeps missing facts → **grounding with data**.
- the workflow is brittle or can't scale to open-ended tasks → **agentic systems**.
- you're changing things and hoping → **evaluation-driven development**.
- it works in the demo and dies at scale → **operating in production**.
- you can't train or tune the part that matters → **ML foundations**.

Every bit you learn makes the next system better. And the complement that holds
the whole map together is plain **software engineering** — the discipline that
turns a promising prototype into something safe to run. That's the next letter.

---

**Sources & further reading**

- The skills map itself (the header image) — synthesized from job-postings,
  expert interviews, and surveys; reproduced with attribution to its author.
- [Attention Is All You Need — Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)
- [LoRA — Hu et al., 2021](https://arxiv.org/abs/2106.09685) · [QLoRA — Dettmers et al., 2023](https://arxiv.org/abs/2305.14314)
- [RLHF — Ouyang et al., 2022](https://arxiv.org/abs/2203.02155) · [Constitutional AI — Bai et al., 2022](https://arxiv.org/abs/2212.08073)
- [Distilling the Knowledge in a Neural Network — Hinton et al., 2015](https://arxiv.org/abs/1503.02531)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Model Context Protocol](https://modelcontextprotocol.io) · [OpenAI Agents](https://platform.openai.com/docs/guides/agents) · [LangGraph](https://github.com/langchain-ai/langgraph)
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag) · [Chroma](https://github.com/chroma-core/chroma) · [Weaviate](https://weaviate.io) · [LlamaIndex](https://github.com/run-llama/llama_index)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) · [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) · [LLM-Guard](https://github.com/protectai/llm-guard)
- [DeepEval](https://github.com/confident-ai/deepeval) · [DSPy](https://github.com/stanfordnlp/dspy) · [Arize Phoenix](https://docs.arize.com/phoenix) · [Evidently AI](https://www.evidentlyai.com)
- [Huyen Chip — GenAI Platform](https://huyenchip.com/2024/07/25/genai-platform.html) · [AI Engineering field guide](https://www.aiengineeringbook.com)
- [Kaggle — Agents whitepaper](https://www.kaggle.com/whitepaper-agents) · [Prompt Engineering Guide](https://www.promptingguide.ai)
- Related writing on this site: [Context Engineering](https://danielkliewer.com/blog/2026-07-02-context-engineering-the-real-full-stack-development-paradigm), [The Model Is Not the Product](https://danielkliewer.com/blog/2026-07-03-the-model-is-not-the-product), [Private Knowledge Graph with Local Agents](https://danielkliewer.com/blog/2026-03-17-building-a-private-knowledge-graph-with-local-ai-agents), [Sovereign Memory Bank](https://danielkliewer.com/blog/2026-06-14-sovereign-memory-bank-a-deep-dive-into-autonomous-cognitive-memory-for-agent-systems), [Autonomous Architectures](https://danielkliewer.com/blog/2026-01-03-autonomous-architectures), [Breaking Free from ChatGPT](https://danielkliewer.com/blog/2026-03-10-breaking-free-from-chatgpt), [objective05-exec](https://danielkliewer.com/blog/2026-06-08-objective05-exec-giving-local-intelligence-system-hands), [Retrieval Architecture](https://danielkliewer.com/blog/2026-07-05-retrieval-architecture-synthesis).
