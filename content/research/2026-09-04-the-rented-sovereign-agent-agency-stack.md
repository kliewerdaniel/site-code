---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/the-rented-sovereign-agent-agency-stack
date: 09-04-2026
description: 'A technical teardown of the $5K/month AI agent agency playbook — Hermes Agent, Orgo, AgentMail, AgentPhone, Honcho, Composio, and Stripes Machine Payments Protocol — read through a computational sovereignty lens.'
image: /images/ComfyUI_00210_.png
layout: post
og:description: 'A technical teardown of the $5K/month AI agent agency playbook — Hermes Agent, Orgo, AgentMail, AgentPhone, Honcho, Composio, and Stripes Machine Payments Protocol — read through a computational sovereignty lens.'
og:image: /images/ComfyUI_00210_.png
og:title: 'The Rented Sovereign — What the $5K/Month Agent Agency Stack Actually Reveals'
og:type: article
og:url: /blog/the-rented-sovereign-agent-agency-stack
tags:
- 'agents, hermes-agent, computer-use, sovereign-ai, agentic-commerce, compile-time-ai, orgo, composio]'
title: 'The Rented Sovereign — What the $5K/Month Agent Agency Stack Actually Reveals'
twitter:card: summary_large_image
twitter:description: 'A technical teardown of the $5K/month AI agent agency playbook — Hermes Agent, Orgo, AgentMail, AgentPhone, Honcho, Composio, and Stripes Machine Payments Protocol — read through a computational sovereignty lens.'
twitter:image: /images/ComfyUI_00210_.png
twitter:title: 'The Rented Sovereign — What the $5K/Month Agent Agency Stack Actually Reveals'
wiki_references: []
---

# The Rented Sovereign

## What the $5K/Month Agent Agency Stack Actually Reveals About the Post-Model Economy

[Selling AI Agents 5K a Month Agency Playbook](/Selling_AI_Agents_5K_a_Month_Agency_Playbook.pdf)

There's a moment in a recent interview between Andrew Warner and Nick Vasillescu — a founder building on top of [Orgo](https://www.orgo.ai/), the cloud-computer-for-agents company he co-founded — where the economics of the current AI moment snap into focus. Vasillescu made $7,000 in his first month building agents for small businesses, with no audience, no cold outbound, and no proprietary model. He now has users running four-client agencies at $5,000/month each — $20K/month, on the path to $1M/year, "in a small town in Idaho," on twenty customers.

The tool doing the actual work — [Hermes Agent](https://openrouter.ai/apps/hermes-agent), the self-improving, MIT-licensed autonomous agent framework from Nous Research — is free. Anyone can `git clone` it. So can the business owner paying $5,000 a month for it, in theory. Vasillescu says this plainly: "we try to make money off their stupidity" — not as contempt, but as an accurate description of an information asymmetry that will close over the next few years as agent literacy spreads through the SMB market the way "you need a website" did in 2005 and "you need a Facebook page" did in 2012.

That's the economic story, and it's worth understanding on its own terms. But underneath it is a more interesting engineering story, and it's the one I want to spend this post on: **what does the actual stack look like when you go from "free open-source agent" to "$5,000/month managed service," and what does that stack tell us about where the sovereignty line currently sits in agentic AI?**

Because here's the tension. The *model layer* — Hermes, OpenClaw, the LLM underneath — is about as open and commoditized as software gets right now: MIT-licensed, self-hostable on a $5 VPS, portable across 30+ model providers. And yet the *deployable, revenue-generating version* of that same agent is built almost entirely out of rented infrastructure: a cloud desktop you don't own (Orgo), an email identity you don't control (AgentMail), a phone number you're leasing (AgentPhone), a memory graph living on someone else's Postgres instance (Honcho), and an auth broker sitting between the agent and every tool it touches (Composio). The free part is the part that matters least. The rented part is where the actual product lives.

That's not a criticism of Vasillescu's build — it's the correct move if your objective function is time-to-revenue, and I'll get into why. But it's worth naming precisely, because it's a pattern that recurs everywhere in this industry and it's directly relevant to the [compile-time / local-first thesis](https://www.danielkliewer.com) this blog keeps returning to: **the model becoming free doesn't mean intelligence becomes sovereign. It just relocates the rent.**

---

## 1. Model vs. Harness: Why "Hermes Agent" Isn't a Model At All

The first thing worth being precise about, for anyone coming to this fresh, is that Hermes Agent is not a model. It's a *harness* — the orchestration layer, tool-calling loop, memory system, and skill-creation machinery that sits around a model and turns raw next-token prediction into something that behaves like a persistent worker. Nous Research shipped the first tagged release (v0.2.0) in March 2026, and it's now the fastest-growing entry in the agent-harness category on OpenRouter, with 50+ trillion tokens processed and the #1 spot across productivity, coding, personal-agent, and CLI-agent rankings.<sup>[1](#sources)</sup>

What makes Hermes distinct from a terminal coding agent like Claude Code or Codex — and this is the detail that actually matters for the agency business model — is that it's *general-purpose and persistent by default*. It ships with a built-in learning loop: it creates reusable skills from experience, improves them during use, and remembers the user across sessions rather than starting cold every time you open a terminal.<sup>[2](#sources)</sup> It's messaging-native from day one — Telegram, Discord, Slack, WhatsApp, and 20+ other surfaces are first-class citizens, not bolted-on integrations.<sup>[1](#sources)</sup> That's the property that lets Vasillescu drop an agent into an insurance company's Slack and have it behave like a coworker rather than a CLI tool someone has to remember to invoke.

Its closest relative, [OpenClaw](https://docs.openclaw.ai), is architecturally similar — also open-source, also self-hosted, also markdown-memory-based — but earned its reputation first and, per Vasillescu, had enough reliability issues in production business deployments that the team moved to Hermes once it matured. This is a useful data point independent of brand loyalty: **in the agent-harness category, reliability under sustained real-world load is still the differentiator, not raw model capability.** The frontier model race gets the headlines; the actual bottleneck for anyone trying to run an agent unattended for a client, at $5K/month, for months at a time, is whether the harness degrades gracefully or falls over.

The takeaway for anyone building here: the "model" question (which LLM) is now almost a footnote — Hermes is explicitly model-agnostic across 30+ providers.<sup>[1](#sources)</sup> The interesting engineering decisions have all moved up a layer, into the harness and the infrastructure wrapped around it. That's where the rest of this post lives.

---

## 2. The Computer-Use Substrate: Why an Agent Needs a Whole Computer, Not Just a Browser Tab

The single highest-leverage demo in the interview — the "magical moment" that converts a skeptical SMB owner into a paying customer — isn't a chatbot. It's watching an agent open Chrome, search, click, and type on a real desktop, live, in front of them. That's [Orgo](https://docs.orgo.ai/introduction): headless cloud virtual machines, booting in under 500ms, that a computer-use-capable model can operate via screenshots, mouse events, and keystrokes — the same input surface a human uses.<sup>[3](#sources)</sup>

Orgo's own positioning draws a sharp and correct distinction against browser-automation tools like Browserbase: *"Tools like Browserbase give an agent a browser tab. Orgo gives it a full computer."*<sup>[4](#sources)</sup> That one computer can browse, save files, run arbitrary code, and install desktop applications — the full surface area of what an SMB's existing SOPs actually require, because most real business workflows aren't confined to a browser tab. They span a CRM desktop client, a shared drive, a PDF editor, an internal Windows app nobody's rewritten since 2011. A browser-only agent can't touch any of that. A full remote desktop can.

Architecturally, Orgo is explicit that it is *infrastructure, not agent*: "Orgo provides the computer, not the agent. Bring Claude Computer Use, OpenAI's CUA, Hermes Agent, OpenClaw, or your own loop."<sup>[3](#sources)</sup> This is the correct separation of concerns, and it maps cleanly onto the model/harness distinction above — you now have three independent layers: **model → harness → substrate**, each swappable. Vasillescu's workflow exploits Orgo's templating feature specifically for this: a pre-configured computer image with Hermes already installed spins up in ten to twenty seconds, collapsing what used to be an hour of environment setup into something closer to `docker run`.

The forward-looking claim worth flagging — Vasillescu predicts that within three to six months, computer-use agents will be "proficient enough to play Minecraft" — is directionally consistent with where OSWorld-style computer-use benchmarks have been trending, though it's a founder's prediction about his own category, not a peer-reviewed claim, and should be read that way.

---

## 3. Identity Infrastructure: AgentMail and AgentPhone as an Emerging "Agent-Native" Communication Layer

Two smaller pieces of the stack deserve attention because they represent a genuinely new infrastructure category: **giving non-human actors their own addressable identity on legacy communication rails.**

[AgentMail](https://www.agentmail.to/) — a YC-backed company — provides email inboxes provisioned entirely through API rather than through a human-oriented signup flow: `client.inboxes.create(username="hello", domain="agentmail.to")` and the agent has a real, threaded, searchable inbox seconds later, with parsing, webhooks, and semantic search handled server-side.<sup>[5](#sources)</sup> The interesting design decision — and Vasillescu is explicit about this — is *not* to route agent email through the operator's own domain. He deliberately keeps agents on the `agentmail.to` domain rather than issuing them `@nick.ai` addresses, on the reasoning that disguising an agent as a human backfires: once a recipient realizes the email was AI-generated, an address that pretended otherwise reads as deceptive, whereas an agent emailing from an obviously-agent domain reads as straightforwardly what it is. This is a small but genuinely useful piece of applied trust design — authenticity-by-disclosure rather than authenticity-by-mimicry — and it's the kind of decision that only becomes visible once you're managing agent-to-human communication at scale across multiple clients.

[AgentPhone](https://ycombinator.com/companies/agentphone) solves the analogous problem for the telephone network — voice, SMS, and iMessage through one API, positioned explicitly as "the oldest address on the internet is a phone number... but the entire telephony stack was built for humans dialing humans."<sup>[6](#sources)</sup> The detail worth noting technically: a single provisioned iMessage number can support roughly 6,000 concurrent conversation threads, meaning the unit economics favor an *agency* model over a *per-client-number* model — one identity, fanned out across every customer relationship, rather than infrastructure that scales linearly with headcount.<sup>[6](#sources)</sup>

Both companies are, structurally, doing the same thing: building an identity and reachability layer for autonomous software actors on communication protocols that were never designed to have non-human endpoints. That's a real, novel infrastructure gap, and it's worth watching as its own category independent of the agency use case — it's foundational to any vision of agents as economic actors that can be reached, not just actors that can reach out.

---

## 4. The Payments Frontier: Agent Card, Stripe's MPP, and Why This Layer Is Still Genuinely Unsolved

This is the part of the stack Vasillescu is most candid about being immature, and it's worth dwelling on because it's the most technically interesting open problem in the entire interview.

He mentions trying [Agent Card](https://www.agentcard.io) — an emerging standard for issuing agents scoped payment credentials — but falls back to giving agents a Mercury or Ramp virtual card with a tight spending limit and letting computer-use fill in the checkout form like a human would. That's a pragmatic hack, not an architecture, and he says so: citing a conversation with Stripe's CEO, he puts real agent-native payments three to four years out.

The reason this is a harder problem than it looks: payment infrastructure was built around a specific trust model — a human, at a specific moment, consciously authorizing a specific charge, with fraud detection tuned to *human* transaction patterns (frequency, geography, device fingerprinting, hesitation-before-purchase). An autonomous agent breaks every one of those assumptions. It has, in the words of one industry analysis of the space, "no psychology to work around" — no cart abandonment, no purchase hesitation, no natural rate limit on how many $0.001 API calls it's willing to authorize in a second.<sup>[7](#sources)</sup>

The infrastructure response to this, moving fast enough that it's already partially overtaken the interview's framing, is Stripe and Tempo's **Machine Payments Protocol (MPP)**, launched March 18, 2026 — an open, HTTP-native standard explicitly built for the agent-as-payer case rather than retrofitted from human checkout flows.<sup>[8](#sources)</sup> The mechanism is elegantly simple and worth understanding at the protocol level: an agent requests a resource; the server responds with an HTTP 402 ("Payment Required") carrying a structured payment requirement — price, accepted methods, cadence (one-shot, recurring, or streaming), metadata; the agent authorizes using a supported method (stablecoin, card via Shared Payment Token, or BNPL); the request retries and succeeds, with a receipt attached.<sup>[9](#sources)</sup> MPP shares its cryptographic substrate — EIP-3009, Permit2 — with Coinbase's earlier x402 protocol, but extends it past a single-shot handshake into full subscription and streaming-usage lifecycle management, which is the piece that matters for a retainer-based agency model rather than one-off API metering.<sup>[7](#sources)</sup>

Within weeks of launch, Visa extended MPP for card rails, Lightspark added Bitcoin/Lightning settlement, and Anthropic, OpenAI, Mastercard, and Shopify had all integrated the standard.<sup>[10](#sources)</sup> That's an unusually fast, broad coalition for a payments primitive, and it's a strong signal that "give your agent a Ramp card and let it fill out checkout forms manually" — the exact workaround Vasillescu describes — is a 2026 stopgap, not a 2028 architecture. If you're building an agency stack today, this is the layer to watch most closely, because it's the one most likely to be structurally different in twelve months.

---

## 5. Memory: The Honcho / Obsidian Split, and Why It's a Compile-Time Problem in Disguise

This is the section that connects most directly to the broader thesis this blog has been developing across the [Compile-Time AI survey](https://www.danielkliewer.com) and the Sovereign Memory Bank work — and it's the part of the interview I think is most under-explained by the people building it, including, candidly, by Vasillescu himself, who admits on camera that the boundary between his two memory tools isn't fully crisp in his own head.

[Honcho](https://docs.honcho.dev/v2/documentation/introduction/overview) is the *short-term, discrete-fact* layer — an AI-native memory service that reasons over conversation history to build a running model of who the user is: preferences, communication style, goals, "my birthday is March 29th."<sup>[11](#sources)</sup> Structurally, Honcho runs a two-layer context injection on every turn: a base layer (session summary, user representation, peer identity) refreshed on a slower cadence, and a dialectic layer — LLM-synthesized reasoning about the user's *current* state and needs — refreshed more frequently.<sup>[12](#sources)</sup> It's runtime reasoning over a rolling window, optimized for low-latency recall inside a live conversation.

Obsidian, by contrast, is doing something categorically different, even though the interview treats it almost as a UI preference. It's a **compiled, human- and agent-legible knowledge graph** — markdown files, wikilinks, and folder structure that persist facts *and their relationships to each other* across weeks or months of a client engagement: this customer, this computer ID in Orgo, this workflow, connected to that automation, connected to last quarter's SOP change. Vasillescu's own framing — "Honcho would remember a discrete fact... Obsidian is more project-based, long-term, connected to all these other things" — is, whether he'd put it this way or not, exactly the distinction between **retrieval-time reasoning** (Honcho: ask the agent, it synthesizes an answer from stored observations, at query time, via an LLM call) and **compile-time structure** (Obsidian: the relationships are pre-materialized as links in the graph itself, walkable without invoking a model at all).

This is precisely the distinction this blog has argued matters more than it's currently given credit for: **a fact retrieved by re-running inference over a context window is not the same artifact as a fact compiled once into a stable, inspectable, versionable node in a graph.** The former re-derives the same conclusion every time, at token cost, with the possibility of drift between calls. The latter is settled — checked in, diffable, auditable by a human without an LLM in the loop at all. Honcho is doing valuable work, but it's runtime work. Obsidian, almost by accident, is functioning as this stack's only compile-time knowledge layer — and it's telling that the business found their way to needing one organically, driven by client demand ("all these business executives, they all know about Obsidian"), rather than by architectural design.

The mildly amusing detail buried in the interview — that SMB executives keep showing up already knowing what Obsidian is and asking their agency to use it — is a real signal, not a throwaway line. It suggests the market is *already* primed to want an inspectable, portable, non-vendor-locked record of what an agent knows about their business, even if nobody's articulated why that matters yet. That intuition is correct, and it's worth taking seriously as a design constraint rather than a nice-to-have.

---

## 6. Composio: The Auth Broker Nobody Wants to Build Themselves

The last infrastructure piece is [Composio](https://composio.dev), and its role is the least glamorous and most operationally load-bearing of the whole stack: a single connector that manages OAuth, API keys, token refresh, and permission scoping across what's now over a thousand cataloged business-tool integrations, exposed through one MCP endpoint rather than one bespoke integration per tool.<sup>[13](#sources)</sup> Vasillescu's assessment is blunt and accurate: before a layer like this existed, every new client meant manually acquiring and rotating API keys for every tool that client used, which doesn't scale past a handful of accounts. Composio converts what would otherwise be a linear-in-clients integration burden into a flat platform cost — which is precisely the kind of unglamorous plumbing that determines whether a services business can actually run twenty clients on one person's time or caps out at three.

It's also, worth noting, the piece of the stack with the least defensible moat and the most direct sovereignty cost: every credential for every tool the agent touches on every client's behalf now transits a third party's infrastructure. For a security-conscious deployment, that's the layer I'd want a serious audit trail on before scaling past a handful of enterprise clients — MCP-based auth brokering is convenient precisely because it's centralized, and centralization is a liability the moment the broker has an incident.

---

## 7. The Sovereignty Accounting

Lay the full stack out and count what's actually owned versus rented:

| Layer | Component | Ownership model |
|---|---|---|
| Model | Any of 30+ providers | Rented (API) or self-hosted |
| Harness | Hermes Agent | **Owned** — MIT-licensed, self-hostable |
| Compute substrate | Orgo | Rented — cloud VM per agent |
| Email identity | AgentMail | Rented — hosted inbox API |
| Phone identity | AgentPhone | Rented — hosted telephony API |
| Short-term memory | Honcho | Rented — hosted service (self-hostable, AGPL-3.0, but the interview describes the cloud tier)<sup>[14](#sources)</sup> |
| Long-term knowledge | Obsidian | **Owned** — local markdown files |
| Tool auth | Composio | Rented — hosted auth broker |
| Payments | Stripe MPP / Ramp / Mercury | Rented — financial infrastructure, unavoidably |

Two rows out of nine are actually sovereign. That's not a gotcha — it's the honest shape of what "building AI agents" currently means for anyone optimizing for revenue speed rather than infrastructure ownership, and Vasillescu is not doing anything wrong by that standard. Every rented layer in this table was rented *because* it was the fastest path to a working, reliable, client-facing product, and for a services business charging $5K/month with weekly deliverables, speed is the entire game. Nobody bootstrapping an agency should be self-hosting Honcho and building their own telephony stack in month one.

But it's worth being precise about what this means for the "the model is free now" narrative that gets repeated uncritically across this space. **The model becoming commoditized did not make the deployed system sovereign — it just moved the rent-collection point one layer up the stack, from the intelligence itself to the plumbing that makes the intelligence useful in a real business.** Hermes being MIT-licensed doesn't matter much if the working deployment still depends on five separate hosted services with their own uptime SLAs, pricing changes, and data-access terms. The insurance-agency case study in the interview — an agent moving customer policy data between two competing platforms — is exactly the kind of task where "who has access to this data, on whose infrastructure, under what retention policy" should be a first-order design question, not an afterthought resolved by whichever vendor had the best onboarding flow.

This is, not coincidentally, the exact gap the compile-time / local-first thesis on this blog has been aimed at: not "avoid all cloud services" as a purity test, but **be deliberate about which layers of an agent's cognition are compiled into something you own and can audit, versus which are rented and re-derived at runtime from a third party you don't control.** The Obsidian layer in this stack — arrived at organically, under client pressure, without anyone framing it this way — is a small existence proof that the market already wants this even where the tooling around it hasn't caught up yet.

---

## 8. What This Means If You're Building One of These

A few concrete implications, for anyone reading this who's actually assembling a version of this stack rather than just reading about it:

- **Separate your layers deliberately, not accidentally.** Model, harness, compute substrate, identity, memory, auth, and payments are seven genuinely independent decisions. Vasillescu's stack is a reasonable default composition, but every one of those seven is swappable, and the swap cost is lowest right now, while the ecosystem is still young. It gets more expensive every quarter these categories consolidate.
- **Treat the payments layer as unstable infrastructure, not a solved problem.** Build the abstraction so that swapping from a manually-filled Ramp card to MPP-native settlement is a config change, not a rewrite. This layer will look different in a year.
- **Take the client's instinct toward Obsidian seriously as a design signal.** If your customers are independently reaching for a portable, inspectable, markdown-based knowledge layer, that's the market telling you it doesn't fully trust an opaque, hosted "memory" black box for anything that matters long-term — even if it can't articulate why. Build the compile-time layer on purpose, not as an accident of which tool happened to have good UX.
- **The retention mechanism described in the interview — weekly calls, quantified before/after time savings, visible new capability drops — is itself a compile-time move**, even though nobody in the conversation would use that language. It's converting the fuzzy, runtime claim "the agent is helping" into a discrete, auditable, checked-in record of what changed and when. That discipline is worth applying to the technical architecture as much as to the client relationship.

The $5K/month number will compress as agent literacy spreads — Vasillescu says as much himself. What won't compress, and what's actually worth building durable expertise in, is the judgment about which parts of an agentic system get compiled into something you own and which parts you rent, and why.

---

## Sources & Further Reading {#sources}

1. [Hermes Agent — OpenRouter app profile](https://openrouter.ai/apps/hermes-agent)
2. [Hermes Agent: The Complete Guide (2026) — Fastino Labs](https://fastino.ai/blog/hermes-agent-the-complete-guide-to-the-self-improving-ai-agent-(2026))
3. [Orgo API — Full Documentation](https://docs.orgo.ai/introduction)
4. [Orgo — Cloud computers for AI agents](https://www.orgo.ai/)
5. [AgentMail — Email Inboxes for AI Agents (Y Combinator)](https://www.ycombinator.com/companies/agentmail)
6. [AgentPhone — Phone Numbers for AI Agents (Y Combinator)](https://ycombinator.com/companies/agentphone)
7. [Why Stripe's Machine Payments Protocol Signals a Turning Point For Micropayments — Forrester](https://www.forrester.com/blogs/why-stripes-machine-payments-protocol-signals-a-turning-point-for-micropayments)
8. [Introducing the Machine Payments Protocol — Stripe](https://stripe.com/blog/machine-payments-protocol)
9. [MPP — Stripe Documentation](https://docs.stripe.com/payments/machine/mpp)
10. [Stripe's AI Payments Protocol Signals Machine-To-Machine Commerce Era — Forbes](https://www.forbes.com/sites/jonmarkman/2026/03/20/stripes-ai-payments-protocol-signals-machine-to-machine-commerce-era/)
11. [Honcho — AI-native memory documentation](https://docs.honcho.dev/v2/documentation/introduction/overview)
12. [Honcho Memory for Hermes Agent — architecture detail](https://hermes-agent.nousresearch.com/docs/user-guide/features/honcho)
13. [Composio — agent-integration platform overview](https://automationatlas.io/tools/composio/)
14. [Honcho — plastic-labs/honcho (self-hosted, AGPL-3.0)](https://github.com/plastic-labs/honcho)
15. [OpenClaw documentation](https://docs.openclaw.ai)

*Source interview: Andrew Warner in conversation with Nick Vasillescu (Orgo), on selling $5K/month AI agent retainers to small and medium businesses.*
