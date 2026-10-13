---
book_reference: true
canonical_url: /blog/2026-06-08-opendesign-opencode-local-first-design-operating-system
date: 06-08-2026
description: A deep technical guide to building a local-first design and development
  operating system with OpenDesign and OpenCode — covering architecture, installation,
  MCP wiring, skill authoring, Docker deployment, environment variables, and the sovereign
  design stack.
excerpt: A deep technical guide to building a local-first design and development operating
  system with OpenDesign and OpenCode — covering architecture, installation, MCP wiring,
  skill authoring, Docker deployment, environment variables, and the sovereign design
  stack.
image: /images/1103012.png
layout: post
og:description: A deep technical guide to building a local-first design and development
  operating system with OpenDesign and OpenCode — covering architecture, installation,
  MCP wiring, skill authoring, Docker deployment, environment variables, and the sovereign
  design stack.
og:image: /images/1103012.png
og:title: 'OpenDesign + OpenCode: Building a Local-First Design Operating System Inside
  Your Terminal'
og:type: article
og:url: /blog/opendesign-opencode-local-first-design-operating-system
tags:
- OpenDesign
- OpenCode
- MCP
- Model Context Protocol
- local-first
- design systems
- design tokens
- coding agents
- sovereign AI
- terminal workflow
- Docker
- Ollama
- Claude
- OpenAI
- npm
- pnpm
- skill authoring
- skill.md
title: 'OpenDesign + OpenCode: Building a Local-First Design Operating System Inside
  Your Terminal'
twitter:card: summary_large_image
twitter:description: A deep technical guide to building a local-first design and development
  operating system with OpenDesign and OpenCode — covering architecture, installation,
  MCP wiring, skill authoring, Docker deployment, environment variables, and the sovereign
  design stack.
twitter:image: /images/1103012.png
twitter:title: 'OpenDesign + OpenCode: Building a Local-First Design Operating System
  Inside Your Terminal'
wiki_references: ["ai-agents", "ai-sovereignty", "data-sovereignty", "docker", "embeddings", "local-first-ai", "local-inference", "mcp", "ollama", "sentence-transformers"]
---


# OpenDesign + OpenCode: Building a Local-First Design Operating System Inside Your Terminal

*June 8, 2026 · Daniel Kliewer*

---

There is a strange contradiction at the center of modern software development.

We have coding agents capable of writing React applications, deploying infrastructure, refactoring monoliths, generating tests, orchestrating CI/CD pipelines, and reasoning across entire repositories. We have local models that can run on consumer hardware. We have Model Context Protocol (MCP) servers that allow AI systems to interact with structured tools and data. We have open-source ecosystems that increasingly rival commercial offerings.

Yet most development workflows still require a human to manually bridge the gap between design and implementation.

A designer creates something in Figma. A screenshot gets exported. The screenshot gets pasted into Cursor, Claude, OpenCode, Codex, or another coding agent. The model attempts to reconstruct what it sees. The developer fixes inconsistencies. The cycle repeats.

The entire workflow depends on moving information between systems that cannot directly communicate.

**OpenDesign and OpenCode represent a fundamentally different approach.**

Instead of treating design as a screenshot problem, they treat design as structured data. Instead of forcing an AI agent to infer your design system from images, OpenDesign exposes design systems, design tokens, component definitions, assets, skills, and project artifacts through a machine-readable interface.

When OpenCode is connected to OpenDesign through MCP, your coding agent no longer generates code from vague descriptions. It generates code from the source of truth.

The result is something much more interesting than another AI coding assistant.

It is the beginning of a **local-first design and development operating system**.

---

## Table of Contents

- [Understanding the Architecture](#understanding-the-architecture)
- [The Missing Layer in AI Development](#the-missing-layer-in-ai-development)
- [OpenDesign as a Design Operating System](#opendesign-as-a-design-operating-system)
- [Installing OpenDesign](#installing-opendesign)
- [Installing OpenCode](#installing-opencode)
- [Method 1: Automated Skill-Based Installation](#method-1-automated-skill-based-installation)
- [Verifying Integration](#verifying-integration)
- [What `od mcp install opencode` Actually Does](#what-od-mcp-install-opencode-actually-does)
- [Installing Everything From Scratch](#installing-everything-from-scratch)
- [Starting the Daemon](#starting-the-daemon)
- [MCP Wiring Reference](#mcp-wiring-reference)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Building a Skill From Scratch](#building-a-skill-from-scratch)
- [Understanding MCP](#understanding-mcp)
- [The Sovereign Design Stack](#the-sovereign-design-stack)
- [Troubleshooting](#troubleshooting)

---

## Understanding the Architecture

Many developers initially misunderstand OpenDesign.

They assume it is another coding agent. It isn't.

Likewise, OpenCode is not a design tool.

The two systems solve different problems.

- **OpenCode** is an *agent runtime*.
- **OpenDesign** is a *design orchestration layer*.

Together they create a system where design knowledge becomes accessible to coding agents.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    OpenDesign Daemon                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ Skills   │  │ Design   │  │ MCP Server        │   │
│  │ (259+)   │  │ Systems  │  │ (stdio-based)     │   │
│  └──────────┘  └──────────┘  └────────┬──────────┘   │
│                                        │              │
└────────────────────────────────────────┼──────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │     OpenCode CLI    │
                              │                     │
                              │  Coding Agent Loop  │
                              └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │      LLM Backend    │
                              │ OpenAI/Ollama/Qwen  │
                              │ Claude/Gemini/etc   │
                              └─────────────────────┘
```

The key insight is that **OpenDesign does not attempt to replace your coding agent**.

Instead, it acts as an **adapter layer** that augments existing coding agents with design intelligence.

### What Each System Is Responsible For

**OpenDesign's job:**

- Manage design systems
- Manage skills
- Manage artifacts
- Manage project exports
- Expose MCP resources
- Discover supported coding agents
- Feed structured design context into those agents

**OpenCode's job:**

- Reason about tasks
- Execute tools
- Edit files
- Run commands
- Manage context windows
- Generate code

This separation of concerns is one of OpenDesign's most elegant design decisions. OpenDesign focuses on *design*. OpenCode focuses on *execution*.

---

## The Missing Layer in AI Development

A coding agent understands:

- Source code
- Documentation
- Terminal output
- Configuration files
- Build systems

A coding agent does **not** inherently understand:

- Typography hierarchies
- Brand systems
- Color palettes
- Design tokens
- Layout conventions
- Visual identity

Historically developers solved this by embedding screenshots into prompts. That approach works, but it scales poorly. Screenshots become stale. Prompts become larger. Consistency becomes harder to maintain.

OpenDesign solves the problem by making design information **queryable**.

### Interpretation vs. Retrieval

Instead of writing this in a prompt:

> "Use the blue color from our design system."

The agent can retrieve structured data:

```json
{
  "primary": "#0066FF"
}
```

Instead of describing spacing:

> "Use the spacing system from our design docs."

The agent can retrieve:

```json
{
  "spacing-sm": "8px",
  "spacing-md": "16px",
  "spacing-lg": "24px"
}
```

This distinction may seem minor. It is not.

- One approach relies on **interpretation**.
- The other relies on **retrieval**.

Retrieval scales. Interpretation eventually breaks.

---

## OpenDesign as a Design Operating System

The best way to think about OpenDesign is not as a design tool. It is a **design operating system**.

Its core subsystems include:

### 1. Design Systems

OpenDesign ships with over **one hundred production-grade design systems**. These contain:

- Typography systems
- Color systems
- Accessibility standards
- Component libraries
- Layout rules
- Brand conventions

Rather than repeatedly prompting agents about these rules, OpenDesign stores them as reusable artifacts that any MCP-connected agent can query by name.

### 2. Skills

Skills are one of OpenDesign's most important concepts.

A **skill** is a reusable unit of expertise. Instead of prompting:

> "Create a modern SaaS landing page using accessibility best practices and responsive layouts."

every single time, a skill already encodes that expertise.

A canonical skill on disk looks like this:

```text
skill/
├── SKILL.md
├── assets/
└── references/
```

A skill can provide:

- Behavioral guidance
- Workflow instructions
- Design conventions
- Example assets
- Reference documentation

OpenDesign currently ships with **hundreds of skills** spanning:

- Prototyping
- Design systems
- Exports
- Slides
- Images
- Video generation
- Presentation workflows
- Component generation

The coding agent loads expertise instead of recreating it.

### 3. MCP Server

The MCP server is arguably OpenDesign's most important architectural component. It allows external agents to access OpenDesign resources as **structured tools**.

Rather than relying entirely on prompts, agents can directly query:

- Design systems
- Components
- Tokens
- Skills
- Assets
- Projects
- Exports

This creates a persistent communication channel between OpenDesign and the coding agent. Every interaction is tool-callable, inspectable, and reproducible.

### 4. Execution Adapters

OpenDesign intentionally avoids becoming tied to any single model vendor. Instead, it delegates execution to existing coding-agent CLIs.

Supported agents include:

- OpenCode
- Claude Code
- Codex
- Gemini CLI
- Cursor Agent
- GitHub Copilot CLI
- Qwen CLI
- Devin for Terminal
- DeepSeek TUI
- Mistral Vibe
- Kimi
- Hermes
- Pi
- Kiro
- Kilo
- Qoder CLI

…and many others.

This design decision matters.

> **OpenDesign does not care which model wins. It only cares about exposing design context.**

---

## Installing OpenDesign

The easiest installation method is through `npm` or `pnpm`.

### Using pnpm (recommended)

```bash
pnpm add -g open-design
```

### Using npm

```bash
npm install -g open-design
```

### Runtime Requirements

- **Node.js** ~24
- **pnpm** 10.33.x

To ensure version consistency, enable Corepack and pin pnpm to the supported version:

```bash
corepack enable
corepack prepare pnpm@10.33.x --activate
```

If you previously installed `open-design` with a different package manager or version, remove it first to avoid path collisions:

```bash
npm uninstall -g open-design || true
pnpm remove -g open-design || true
```

You can confirm the binary is on your `PATH` with:

```bash
which od
od --version
```

---

## Installing OpenCode

OpenCode must be available on your `PATH`.

### Install Globally

```bash
npm install -g @anomalyco/opencode
```

### Verify the Installation

```bash
opencode --version
which opencode
```

OpenDesign scans your `PATH` for supported coding agents. If OpenCode is discoverable, OpenDesign can use it as an execution engine.

If you would prefer to use a different agent (for example Claude Code or Codex), install that agent and OpenDesign will pick it up automatically during the next rescan.

---

## Method 1: Automated Skill-Based Installation

The OpenDesign repository contains tooling specifically designed to automate agent integration.

### Step 1 — Navigate to the OpenDesign package root

```bash
cd $(npm root -g)/open-design
```

This resolves to the global `node_modules` directory, regardless of which package manager installed the package.

### Step 2 — Run the OpenCode integration skill

```bash
bash .claude/skills/od-contribute/install.sh opencode
```

You can substitute any supported agent name for `opencode` (for example `claude`, `codex`, `gemini`, `cursor`).

### What the Installer Does

The installer performs several tasks:

1. **Detects OpenCode** on your `PATH`.
2. **Locates executables** (Node, OpenDesign, OpenCode).
3. **Generates MCP configuration** in the agent-specific format.
4. **Writes agent-specific configuration** to the correct location.
5. **Verifies connectivity** by spawning a short-lived MCP handshake.

This is the fastest path to a working installation.

---

## Verifying Integration

Before applying any configuration, you can preview what the installer would write:

```bash
od mcp install --print opencode
```

This performs a dry run without modifying anything. It prints the exact JSON (or YAML, depending on the target agent) that would be written to disk.

Once satisfied, apply the configuration:

```bash
od mcp install opencode
```

OpenDesign now installs an MCP configuration that allows OpenCode to communicate directly with the daemon.

The coding agent can now query:

- CSS tokens
- Typography scales
- Components
- HTML entry pages
- Assets
- Projects

…directly from OpenDesign.

---

## What `od mcp install opencode` Actually Does

Most guides stop here. The interesting part is understanding what happens under the hood.

When you execute:

```bash
od mcp install opencode
```

OpenDesign performs the following actions in order:

1. **Locates the Node runtime** that owns the global `open-design` package.
2. **Locates the OpenDesign executable** (`od`).
3. **Generates an MCP configuration document** describing how the agent should spawn the OpenDesign MCP server.
4. **Creates an OpenCode-specific install script** that registers the MCP server with OpenCode's config directory.
5. **Embeds absolute executable paths** so the agent can launch OpenDesign regardless of the user's working directory.
6. **Writes the configuration into OpenCode's config location** (typically `~/.config/opencode/` or platform equivalent).
7. **Registers the MCP server** so OpenCode lists it as an available tool provider.

Conceptually, the resulting data flow is:

```text
OpenCode
    │
    ▼
MCP Configuration
    │
    ▼
OpenDesign CLI
    │
    ▼
OpenDesign Daemon
    │
    ▼
Projects
Skills
Assets
Design Systems
```

This is not merely a plugin. It is a **persistent communication channel** that survives across sessions, restarts, and model swaps.

---

## Installing Everything From Scratch

For developers who want complete control, here is the manual route.

### Step 1 — Clone the repository

```bash
git clone https://github.com/nexu-io/open-design.git
cd open-design
```

### Step 2 — Install dependencies

```bash
pnpm install
```

If your environment disables lifecycle scripts (`enable-pre-post-scripts=false` in `npm` config, or the equivalent in `pnpm`), run the post-install hook manually:

```bash
node scripts/postinstall.mjs
```

This step is what populates the bundled design systems and skills. Skipping it leaves the daemon empty.

### Step 3 — Build (optional, for production runs)

```bash
pnpm build
```

For development iteration you can skip the build and run directly with `pnpm dev`.

---

## Starting the Daemon

### Production mode

```bash
od start
```

### Development mode (with hot reload)

```bash
pnpm dev
```

The daemon automatically scans your `PATH` for supported coding agents.

If OpenCode is not discovered, verify the install:

```bash
which opencode
opencode --version
```

Then trigger a manual rescan inside the OpenDesign UI under:

> **Settings → Execution Mode → Rescan**

The daemon binds to `http://localhost:7456` by default. Open the URL in a browser to access the design operating system UI.

---

## MCP Wiring Reference

### Preview the configuration

```bash
od mcp install --print opencode
```

### Apply the configuration

```bash
od mcp install opencode
```

### Available flags

| Flag             | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `--print`        | Print the generated config without writing anything. |
| `--uninstall`    | Remove a previously written MCP configuration.       |
| `--help`         | Show all available flags and supported agents.       |

### Remove an integration

```bash
od mcp install --uninstall opencode
```

### Multi-agent installations

You can run `od mcp install` once per supported agent. Each call writes a configuration specific to that agent's expected location and format. The same OpenDesign daemon serves every connected agent simultaneously.

```bash
od mcp install opencode
od mcp install claude
od mcp install codex
od mcp install gemini
```

---

## Environment Variables

OpenDesign supports runtime configuration via environment variables. This is the right place to set secrets (API tokens), tune resource limits, and customize CORS behavior.

### Common variables

```bash
export OPEN_DESIGN_PORT=7456
export OPEN_DESIGN_MEM_LIMIT=4096
export OPEN_DESIGN_ALLOWED_ORIGINS="http://localhost:7456"
export OPEN_DESIGN_IMAGE="registry.local/open-design:latest"
export OD_API_TOKEN=$(openssl rand -hex 32)
```

### What each variable controls

| Variable                    | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `OPEN_DESIGN_PORT`          | Port the daemon listens on (default `7456`).                     |
| `OPEN_DESIGN_MEM_LIMIT`     | Memory cap (in MB) for spawned processes.                        |
| `OPEN_DESIGN_ALLOWED_ORIGINS` | Comma-separated CORS allowlist.                                |
| `OPEN_DESIGN_IMAGE`         | Container image reference for containerized deployments.         |
| `OD_API_TOKEN`              | Bearer token required for MCP and HTTP API access.               |

Persist these in `~/.zshrc`, `~/.bashrc`, or a `.env` file loaded by your shell.

---

## Docker Deployment

OpenDesign can run entirely through Docker. This is the recommended path for shared servers, CI runners, and remote development hosts.

### Step 1 — Prepare the environment

```bash
cd deploy
cp .env.example .env
```

### Step 2 — Generate an API token

```bash
openssl rand -hex 32
```

### Step 3 — Configure the environment file

Open the new `.env` file and set at minimum:

```bash
OD_API_TOKEN=<paste-the-token-from-step-2>
OPEN_DESIGN_PORT=7456
OPEN_DESIGN_ALLOWED_ORIGINS=http://localhost:7456
```

You can also set a memory limit and any upstream model credentials the daemon should pass through to the agent:

```bash
OPEN_DESIGN_MEM_LIMIT=4096
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 4 — Start the stack

```bash
docker compose up -d
```

The UI becomes available at:

```text
http://localhost:7456
```

Data persists through Docker volumes. To inspect them:

```bash
docker volume ls | grep open-design
docker inspect <volume-name>
```

### Step 5 — Connect OpenCode to the containerized daemon

When the daemon is running inside Docker, your local OpenCode install needs to know where to find it. Export the URL and token, then re-run the installer:

```bash
export OPEN_DESIGN_API_URL=http://localhost:7456
export OD_API_TOKEN=<generated-token>
od mcp install opencode
```

OpenCode will now speak to OpenDesign over HTTP rather than stdio. The token is forwarded as a bearer credential on every MCP request.

### Step 6 — Tail the logs (optional)

```bash
docker compose logs -f open-design
```

This is invaluable when debugging token mismatches, missing design systems, or agent registration issues.

### Updating the container

```bash
git -C open-design pull
docker compose pull
docker compose up -d
```

The persistent volume survives across image upgrades, so your design systems, skills, and project artifacts remain intact.

---

## Building a Skill From Scratch

Skills are how you encode reusable design and engineering expertise. Once a skill is on disk and registered with OpenDesign, any connected coding agent can invoke it by name.

### Minimal Skill Layout

```text
my-skill/
├── SKILL.md
├── assets/
└── references/
```

### `SKILL.md` Template

The frontmatter of `SKILL.md` declares metadata that OpenDesign and the agent use for routing:

```markdown
---
name: responsive-card-generator
description: Generate responsive card components that respect the active design system
triggers:
  - card
  - responsive
  - component
  - pricing
---

# Responsive Card Generator

## When to use this skill

Invoke this skill whenever the user asks for a card, tile, or pricing block
that should adapt to small, medium, and large viewports while honoring the
active design tokens.

## Inputs

- `title` (string, required): the card heading
- `body` (string, optional): supporting copy
- `action` (object, optional): `{ label: string, href: string }`

## Procedure

1. Call `get_design_tokens()` to fetch the current spacing and color scale.
2. Render a container with `spacing-md` padding and `radius-md` corners.
3. Stack the title and body vertically with `spacing-sm` between them.
4. If `action` is provided, render a primary button at the bottom edge.

## Output

A self-contained HTML snippet wrapped in a `<div data-skill="responsive-card-generator">`
element so downstream code can identify and re-render it.

## Example assets

See `./assets/card-example.html` for a complete reference.
```

### Registering the skill

Drop the directory into one of the recognized skill locations:

```bash
~/.config/open-design/skills/responsive-card-generator/
```

or pass it explicitly when starting the daemon:

```bash
od start --skill-path ~/projects/my-skills
```

OpenDesign scans skill directories on startup and on every UI-driven rescan. Once registered, the skill is exposed via MCP and is callable from any connected agent.

### Invoking the skill from an agent

In OpenCode:

```text
opencode
> Use responsive-card-generator to create a pricing card with title="Pro" and body="For growing teams."
```

The agent discovers the skill through MCP, reads `SKILL.md`, and follows the documented procedure using the design tokens that OpenDesign serves.

### Skill authoring best practices

- **Be deterministic.** Encode exact tool calls and exact values, not vague guidance.
- **Reference the MCP tools by name** (`get_design_tokens`, `list_components`, `get_skill`).
- **Keep assets small** — the skill travels into the agent's context window.
- **Version your skills** with a `version` field in the frontmatter.
- **Test in isolation** before publishing. Run `od skill lint <path>` to validate the manifest.

### Validating a skill

```bash
od skill lint ~/.config/open-design/skills/responsive-card-generator
```

The linter checks for:

- Valid frontmatter (required keys: `name`, `description`)
- No broken relative references in `assets/` and `references/`
- No circular skill dependencies
- Reasonable `SKILL.md` length (warns beyond ~4,000 words)

---

## Understanding MCP

MCP may ultimately become more important than any single AI model.

Historically AI systems communicated through prompts. Prompts are:

- Fragile
- Difficult to version
- Difficult to maintain

MCP enables **structured retrieval**.

Instead of:

> "Use our design system."

Agents call:

```text
get_design_tokens()
```

…and receive structured, typed data back.

### Why retrieval beats interpretation

- **Stable contracts.** A tool signature does not drift between model versions.
- **Inspectable.** Every tool call is logged, replayable, and unit-testable.
- **Cacheable.** The same call returns the same data until the design system changes.
- **Permissioned.** MCP servers expose only the resources the agent should see.

### Example MCP resources exposed by OpenDesign

| Resource              | Returns                                                |
| --------------------- | ------------------------------------------------------ |
| `get_design_tokens`   | JSON object with color, spacing, type, and radius scales |
| `list_design_systems` | Array of registered design system names                |
| `get_component`       | Component definition for a given name                  |
| `list_skills`         | Array of available skills                              |
| `get_skill`           | Full `SKILL.md` content for a given skill              |
| `list_assets`         | Asset metadata (path, type, size)                      |
| `export_project`      | Triggers an export job and returns the archive URL     |

The future increasingly belongs to retrieval rather than interpretation.

---

## The Sovereign Design Stack

Perhaps the most interesting aspect of OpenDesign and OpenCode is that **every layer can be self-hosted**.

A complete stack might include:

- **OpenCode** — the agent runtime
- **OpenDesign** — the design orchestration daemon
- **Ollama** — local model server
- **Qwen, Llama, DeepSeek** — open-weight models
- **SQLite** — local persistence for projects and skills
- **Docker** — reproducible deployments
- **Git** — version control for everything
- **MCP** — the protocol that ties it all together

No SaaS requirement. No monthly subscriptions. No dependency on a specific AI vendor.

You own:

- The models
- The design systems
- The prompts
- The skills
- The infrastructure
- The deployment pipeline

This is the larger significance of OpenDesign.

It is not simply a design tool.

OpenCode is not simply a coding assistant.

Together they demonstrate a broader trend emerging throughout the AI ecosystem.

> The industry spent the last decade centralizing infrastructure. The next decade may be defined by rebuilding local capability.

Design systems become machine-readable. Coding agents become interchangeable. Models become replaceable. Protocols become standardized.

The result is a future where your development environment survives the rise and fall of individual AI companies — because the intelligence resides in open systems, local infrastructure, and interoperable protocols rather than proprietary platforms.

OpenDesign and OpenCode offer one of the clearest examples of that future available today.

---

## Troubleshooting

A field guide to the issues you are most likely to hit during your first installation.

### `od: command not found`

The global `node_modules` bin directory is not on your `PATH`.

```bash
# npm
export PATH="$(npm config get prefix)/bin:$PATH"

# pnpm
export PATH="$(pnpm bin -g):$PATH"
```

Persist the export in your shell rc file.

### `opencode: command not found`

Install OpenCode globally:

```bash
npm install -g @anomalyco/opencode
```

Then verify:

```bash
which opencode
opencode --version
```

### OpenDesign is running but OpenCode does not list it as an MCP server

1. Run `od mcp install --print opencode` and confirm the printed config looks correct.
2. Re-run `od mcp install opencode` to (re)write the configuration.
3. Inside OpenCode, trigger an MCP rescan from its settings or restart the CLI.
4. Check that `OD_API_TOKEN` matches between the daemon environment and the agent configuration.

### `EADDRINUSE` on port 7456

Another process is bound to the default port.

```bash
lsof -i :7456
```

Either stop the conflicting process, or change the port:

```bash
export OPEN_DESIGN_PORT=7600
od start
```

Remember to update `OPEN_DESIGN_API_URL` in your shell and re-run `od mcp install` for every connected agent.

### Docker container starts but the UI is unreachable

- Confirm the container is running: `docker compose ps`
- Inspect the published port: `docker compose port open-design 7456`
- Verify the port mapping in `docker-compose.yml` exposes `7456` to the host.
- Check CORS: `OPEN_DESIGN_ALLOWED_ORIGINS` must include the URL you are loading the UI from.

### Skills are missing after installation

If you skipped `node scripts/postinstall.mjs` during a from-source build, the bundled skills are absent. Re-run the post-install hook:

```bash
pnpm install
node scripts/postinstall.mjs
```

Then restart the daemon and rescan from **Settings → Execution Mode → Rescan**.

### Agent produces code that ignores the design system

This almost always means the agent is not invoking MCP tools. Verify two things:

1. The MCP server is registered (`od mcp list` or the agent's own MCP inspector).
2. The system prompt encourages tool use. Some agents default to pure generation unless explicitly told to call tools.

A reliable workaround is to include a short system-prompt directive:

```text
Before generating any UI, call get_design_tokens() and list_components() so
that the code you produce matches the active design system exactly.
```

### Resetting everything

If you want a clean slate:

```bash
od mcp install --uninstall opencode
od stop
rm -rf ~/.config/open-design
od start
od mcp install opencode
```

This removes all local state, all generated MCP configurations, and all cached design systems, then re-installs from scratch.

---

*OpenDesign repository: [github.com/nexu-io/open-design](https://github.com/nexu-io/open-design)*
*OpenCode: [@anomalyco/opencode](https://www.npmjs.com/package/@anomalyco/opencode)*
*Model Context Protocol: [modelcontextprotocol.io](https://modelcontextprotocol.io)*
