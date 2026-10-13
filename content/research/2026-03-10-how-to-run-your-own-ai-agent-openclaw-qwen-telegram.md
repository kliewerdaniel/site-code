---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-03-10-how-to-run-your-own-ai-agent-openclaw-qwen-telegram
date: 03-10-2026
description: Build your own local AI agent that runs on your computer and talks to
  you through Telegram. No cloud, no subscriptions, just software and curiosity.
image: /images/1018001.png
layout: post
og:description: Build your own local AI agent that runs on your computer and talks
  to you through Telegram. No cloud, no subscriptions, just software and curiosity.
og:image: /images/1018001.png
og:title: 'How to Run Your Own AI Agent: OpenClaw + Qwen 3.5 + Telegram (Fully Local)'
og:type: article
og:url: /blog/2026-03-10-how-to-run-your-own-ai-agent-openclaw-qwen-telegram
tags:
- AI
- OpenClaw
- Qwen
- Telegram
- Local AI
- Autonomous Agents
- Tutorial
title: 'How to Run Your Own AI Agent: OpenClaw + Qwen 3.5 + Telegram (Fully Local)'
twitter:card: summary_large_image
twitter:description: Build your own local AI agent that runs on your computer and
  talks to you through Telegram. No cloud, no subscriptions, just software and curiosity.
twitter:image: /images/1018001.png
twitter:title: 'How to Run Your Own AI Agent: OpenClaw + Qwen 3.5 + Telegram (Fully
  Local)'
wiki_references: ["ai-agents", "llama3", "local-inference", "ollama"]
---

# How to Run Your Own AI Agent: OpenClaw + Qwen 3.5 + Telegram (Fully Local)

There's something deeply satisfying about running your own AI system.

Not renting intelligence from a server in California.
Not waiting on API quotas.
Not wondering what's happening to your prompts.

Just a machine on your desk, quietly thinking.

In this guide we'll build exactly that: a local AI agent that runs on your computer and talks to you through Telegram.

The stack looks like this:

Telegram
   ↓
OpenClaw Agent Framework
   ↓
Ollama Inference Server
   ↓
Qwen 3.5 Local Model

When you send a message to your Telegram bot, it travels through OpenClaw and lands inside Qwen 3.5 running locally on your machine.

No cloud. No subscriptions. Just software and curiosity.

Let's begin.

---

## What We're Building

By the end of this tutorial you will have:

• A local Qwen 3.5 model running on your computer
• OpenClaw managing an autonomous AI agent
• A Telegram bot interface to chat with your agent anywhere
• A persistent AI personality and memory system

This is essentially your own personal AI operator.

And it runs on your hardware.

---

## Requirements

Before we start, make sure your system has:

1. **Node.js 22+**

OpenClaw requires a modern Node runtime.

Check your version:

```bash
node --version
```

If it's below 22, install the latest version from [Node.js](https://nodejs.org/).

---

2. **Ollama**

Ollama is the easiest way to run local models.

Install it:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

After installation verify it works:

```bash
ollama --version
```

---

3. **Hardware**

Qwen models scale depending on your machine.

Typical options:

| Model | VRAM Needed |
|-------|-------------|
| qwen3.5:0.8b | ~2GB |
| qwen3.5:1.5b | ~4GB |
| qwen3.5:9b | ~8GB |
| qwen3.5:32b | 24GB+ |

If you're running on a laptop or Apple Silicon, 0.8b or 1.5b is ideal.

---

## Step 1 — Install OpenClaw

OpenClaw is the agent framework that connects your model to tools, memory, and communication channels.

Install it globally:

```bash
npm install -g openclaw
```

Verify installation:

```bash
openclaw status
```

You should see something similar to:

```
OpenClaw status

Dashboard: http://127.0.0.1:18789
OS: macOS
Agents: 1
Memory: ready
```

This confirms the CLI is working.

---

## Step 2 — Run the Qwen Model Locally

Now we pull the Qwen model using Ollama.

For lightweight setups:

```bash
ollama pull qwen3.5:0.8b
```

Run the model once to ensure it loads:

```bash
ollama run qwen3.5:0.8b
```

You should see a prompt where you can type questions.

Once this works, your local model server is active at:

```
http://localhost:11434
```

This is the endpoint OpenClaw will talk to.

---

## Step 3 — Launch OpenClaw with Ollama (The Easy Way)

Modern versions of Ollama include a helper that automatically configures OpenClaw.

Run:

```bash
ollama launch openclaw --model qwen3.5:0.8b
```

This command does several things automatically:

• installs OpenClaw configuration
• connects the model provider
• creates an agent workspace
• launches the OpenClaw gateway service

You'll see output like:

```
Launching OpenClaw with qwen3.5:0.8b

OpenClaw is running

Web UI:
http://localhost:18789/#token=ollama
```

Your AI agent is now running.

---

## Step 4 — Access the OpenClaw Dashboard

Open the dashboard in your browser:

```
http://localhost:18789/#token=ollama
```

This interface allows you to:

• manage sessions
• configure models
• install tools ("skills")
• view logs
• control channels

Think of it as mission control for your AI agent.

---

## Step 5 — Test the Local Agent

You can interact with the agent using the terminal UI:

```bash
openclaw tui
```

You'll see something like:

```
Wake up, my friend!
Who are you?
```

At this point the model is responding directly through OpenClaw.

Your AI agent is officially alive.

---

## Step 6 — Set Qwen as the Default Model

Sometimes the default session uses a cloud model like Gemini.

To switch permanently to Qwen:

```bash
openclaw config set agents.main.defaults.model.primary "ollama/qwen3.5:0.8b"
```

Restart the gateway:

```bash
openclaw gateway restart
```

Now every new session will use your local Qwen model.

---

## Step 7 — Create a Telegram Bot

Now we connect your agent to Telegram.

Open Telegram and search for:

**@BotFather**

Start the conversation and run:

```
/newbot
```

BotFather will ask for:

1️⃣ Bot name
2️⃣ Bot username

Example:

Name: Kadaligogh
Username: kadaligoghbot

BotFather will give you a bot token that looks like this:

```
123456:ABCDEF123456abcdef
```

Copy it.

---

## Step 8 — Connect Telegram to OpenClaw

Run the OpenClaw channel configuration:

```bash
openclaw channels add telegram
```

Paste the token from BotFather when prompted.

OpenClaw will add it to your config file:

```
~/.openclaw/openclaw.json
```

Restart the gateway:

```bash
openclaw gateway restart
```

---

## Step 9 — Pair Your Telegram Account

OpenClaw requires pairing to ensure only you can control the agent.

Open Telegram and send a message to your bot.

Example:

```
/start
```

The bot will reply with something like:

```
Pairing code: Z2EDQKMK
```

Approve the pairing in your terminal:

```bash
openclaw pairing approve telegram Z2EDQKMK
```

Your Telegram account is now authorized.

---

## Step 10 — Chat with Your AI from Telegram

Now simply message your bot.

Your messages travel like this:

Telegram → OpenClaw Gateway → Ollama → Qwen → Response → Telegram

You now have a fully local AI assistant reachable from your phone.

---

## Useful OpenClaw Commands

**View status**

```bash
openclaw status
```

**Watch logs**

```bash
openclaw logs --follow
```

**Restart gateway**

```bash
openclaw gateway restart
```

**Start a new AI session**

Inside chat:

```
/new
```

**Change models**

```
/model ollama/qwen3.5:1.5b
```

---

## Fixing Common Problems

### Device Signature Invalid

Run:

```bash
openclaw devices list
```

Approve the pending request:

```bash
openclaw devices approve <ID>
```

---

### Telegram Unsupported Type

This happens when the bot receives unsupported content.

Fix by disabling streaming:

```bash
openclaw config set agents.main.streaming false
```

Restart the gateway afterward.

---

### Gateway Not Reachable

Probe the gateway:

```bash
openclaw gateway probe
```

If necessary restart:

```bash
openclaw gateway restart
```

---

## Optional: Give Your AI a Personality

OpenClaw agents can load personality and behavior rules using files like:

- SOUL.md
- IDENTITY.md
- USER.md

Example philosophy for an agent:

```
You are a technical AI developer.

You speak precisely and avoid casual language.

Your priority is actionable solutions and independent reasoning.
```

This creates a persistent AI character across sessions.

---

## What You Can Build Next

Once you have this running, OpenClaw becomes extremely powerful.

You can add:

• Web search tools
• Code execution
• File reading
• Autonomous task loops
• Voice interfaces
• Local knowledge bases

Your Telegram bot becomes a remote terminal for your AI system.

---

## Why This Matters

Running AI locally changes the relationship entirely.

Instead of:

User → API → Corporate Model

You get:

User → Personal Infrastructure → Intelligence

The model belongs to you.
The data belongs to you.
And the system can evolve however you want.


[If you demand better performance than what Ollama offers you can always use llama.cpp instead. I show the basics of llama.cpp here.](https://www.danielkliewer.com/blog/2025-11-12-mastering-llama-cpp-local-llm-integration-guide)