---
book_reference: true
canonical_url: /blog/2026-06-08-objective05-exec-giving-local-intelligence-system-hands
date: 06-08-2026
description: A complete Rust tutorial on building objective05-exec — a local-first
  agent runtime that bridges a perpetual Kuzu-backed knowledge graph to real-world
  tools (GitHub, email, Slack, Discord, filesystem) using TOOLS.md/SKILLS.md capability
  discovery, signal evaluation, and a poll→evaluate→execute loop.
excerpt: A complete Rust tutorial on building objective05-exec — a local-first agent
  runtime that bridges a perpetual Kuzu-backed knowledge graph to real-world tools
  (GitHub, email, Slack, Discord, filesystem) using TOOLS.md/SKILLS.md capability
  discovery, signal evaluation, and a poll→evaluate→execute loop.
image: /images/ComfyUI_00209_.png
layout: post
og:description: A complete Rust tutorial on bridging a Kuzu knowledge graph to real-world
  tools with a local-first poll→evaluate→execute agent runtime and TOOLS.md discovery.
og:image: /images/ComfyUI_00209_.png
og:title: 'objective05-exec: Giving Your Local Intelligence System Hands'
og:type: article
og:url: /blog/objective05-exec-giving-local-intelligence-system-hands
tags:
- Rust
- objective05
- knowledge graph
- KuzuDB
- agent runtime
- local AI
- TOOLS.md
- SKILLS.md
- OpenClaw
- tool execution
- GitHub API
- Slack
- Discord
- SMTP
- sovereign AI
- objective05-exec
- signal evaluation
- async Rust
- tokio
- MCP
- temporal graph
- contradiction detection
title: 'objective05-exec: Giving Your Local Intelligence System Hands — A Rust Tutorial
  on Bridging a Knowledge Graph to Real-World Tool Execution'
twitter:card: summary_large_image
twitter:description: A complete Rust tutorial on bridging a Kuzu knowledge graph to
  real-world tools with a local-first poll→evaluate→execute agent runtime and TOOLS.md
  discovery.
twitter:image: /images/ComfyUI_00209_.png
twitter:title: 'objective05-exec: Giving Your Local Intelligence System Hands'
wiki_references: ["ai-agents", "ai-sovereignty", "data-sovereignty", "docker", "knowledge-graphs", "kubernetes", "llama3", "local-first-ai", "local-inference", "mcp", "rust"]
---


# objective05-exec: Giving Your Local Intelligence System Hands

*How to bridge a perpetual knowledge graph to real-world tool execution — a Rust tutorial*

*June 8, 2026 · Daniel Kliewer*

[GitHub: kliewerdaniel/objective05](https://github.com/kliewerdaniel/objective05)

---

## Table of Contents

- [Introduction](#introduction)
- [The Landscape: What Everyone Else Is Building](#the-landscape-what-everyone-else-is-building)
- [The Gap](#the-gap)
- [Prerequisites and Environment Setup](#prerequisites-and-environment-setup)
- [Architecture Overview](#architecture-overview)
- [Step 1: Project Structure](#step-1-project-structure)
- [Step 2: Configuration and Error Types](#step-2-configuration-and-error-types)
- [Step 3: The Tool Discovery System](#step-3-the-tool-discovery-system)
- [Step 4: The Graph Query Builder](#step-4-the-graph-query-builder)
- [Step 5: The Signal Evaluator](#step-5-the-signal-evaluator)
- [Step 6: The Tool Execution Layer](#step-6-the-tool-execution-layer)
- [Step 7: The Core Agent Runtime](#step-7-the-core-agent-runtime)
- [Step 8: The Main Entry Point](#step-8-the-main-entry-point)
- [Step 9: TOOLS.md Files](#step-9-toolsmd-files)
- [Step 10: Building and Running](#step-10-building-and-running)
- [Environment Variables Reference](#environment-variables-reference)
- [The Kuzu Schema This Agent Expects](#the-kuzu-schema-this-agent-expects)
- [Testing the Agent](#testing-the-agent)
- [Deployment Patterns](#deployment-patterns)
- [Integration with OpenClaw](#integration-with-openclaw)
- [Troubleshooting](#troubleshooting)
- [Beyond the MVP](#beyond-the-mvp)
- [Why This Matters](#why-this-matters)
- [Conclusion](#conclusion)

---

## Introduction

There are two fundamental modes of intelligence: **understanding** and **acting**.

Most AI systems do one or the other. Chatbots understand — they process your input, generate a response, and forget everything when the session ends. Dashboards act — they display charts, trigger alerts, send emails — but they have no memory of what happened yesterday. The product design choices that lead here are predictable: when the model is the product, you build stateless interfaces. When the dashboard is the product, you build passive displays.

I built [Objective05](https://github.com/kliewerdaniel/objective05) to solve the understanding problem. It's a local-first intelligence system written in Rust that continuously ingests information from the web, extracts entities and claims, detects contradictions and narrative drift, maintains a temporal knowledge graph backed by Kuzu DB, and generates written reports and audio broadcasts. It listens. It thinks. It remembers.

But for months now, I've been asking a different question: **what does it do with what it knows?**

The answer matters more than you might think. Because the biggest gap in the AI landscape right now isn't between better models and worse models. It's between systems that understand deeply and systems that can actually *do* something about it.

In this post, I'm going to walk through building **objective05-exec** — the execution runtime that bridges Objective05's knowledge graph to real-world tools. By the end, you'll have a Rust-based agent that can:

- Query the Kuzu knowledge graph for context
- Evaluate whether an action is warranted based on detected patterns
- Execute real tasks: file GitHub PRs, send emails, update spreadsheets, post to Slack/Discord, write files to disk
- Discover available tools through a TOOLS.md/SKILLS.md interface (matching the OpenClaw model)
- Run on consumer hardware, fully local, fully sovereign

This is not a cloud agent. This is not a chatbot wrapper. This is a local-first agent runtime that connects deep understanding to real-world action.

---

## The Landscape: What Everyone Else Is Building

Before we dive into the code, let's look at what the big players launched in the last few months. Three products define the current moment:

### Microsoft Scout (built on OpenClaw)

Scout is an "always-on autonomous agent" built on the OpenClaw framework. It integrates with Microsoft 365, executes tasks across cloud and desktop, and operates with enterprise-grade security. The key feature: it doesn't wait to be asked. It monitors your calendar, drafts documents, schedules meetings, and acts across your work tools autonomously.

OpenClaw — Scout's base — is itself worth studying. It's a self-hosted, multi-channel agent gateway written in Node.js, MIT licensed, that runs on consumer hardware. It supports persistent memory across sessions, multi-agent routing, tool execution, and capability discovery via `TOOLS.md`/`SKILLS.md` files. It connects to Slack, Teams, WhatsApp, Discord, Telegram, and more. It's the scaffolding that turned "chatbots that respond" into "agents that act."

### Google Gemini Spark

Spark is Google's always-on agent running on dedicated GCP VMs. It monitors Gmail, Calendar, Docs, and Sheets. Its strength: task planning and structuring, collaborative teams, repeatable workflows, and autonomous background execution. It drafts documents, makes purchases, and runs workflows without user prompting.

### Anthropic Orbit

Orbit is Anthropic's proactive agent that synthesizes data from Gmail, Slack, GitHub, Calendar, Google Drive, and Figma to generate personalized daily briefings. Discovered as a hidden toggle in Claude's settings in May 2026, it represents a shift from reactive chat to proactive awareness.

---

## The Gap

Look at these three products and you'll see a pattern. They're all cloud agents with tool execution. They can act — draft a doc, send an email, file a PR — but their understanding is shallow. They have no persistent knowledge graph. No temporal reasoning. No contradiction detection. No narrative tracking. They connect to your work tools, yes, but they don't *understand* them the way Objective05 understands the web.

Meanwhile, Objective05 has deep local understanding — a temporal knowledge graph that tracks entities, claims, events, and contradictions over time — but no way to act on that understanding. It can detect that a narrative is diverging in the GitHub ecosystem, but it can't file a PR to address it. It can spot a contradiction between two ArXiv papers on the same topic, but it can't draft a response. It can identify a trending pattern across Hacker News, but it can't post a summary to Slack.

**The gap is clear: Objective05 has the brain. It needs hands.**

---

## Prerequisites and Environment Setup

Before writing any code, you need a working Rust toolchain and a few external services configured. The agent is designed to fail soft when credentials are missing — it will log warnings and continue with whatever tools *are* available — but a clean install goes faster with everything in place.

### 1. Install Rust (stable, 1.78+)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup default stable
rustc --version   # should report 1.78 or newer
```

### 2. Clone the Objective05 Repository (Graph Source)

`objective05-exec` is a consumer of the Objective05 knowledge graph. You can either run a full Objective05 installation or stub one out:

```bash
# Full installation
git clone https://github.com/kliewerdaniel/objective05.git
cd objective05
cargo build --release
./target/release/objective05  # starts ingestion; writes to ./data/graph.db
```

If you only want to experiment with the execution runtime, you can use a stub Kuzu database with the schema described in [The Kuzu Schema This Agent Expects](#the-kuzu-schema-this-agent-expects).

### 3. Install Kuzu CLI (Optional but Useful)

The Kuzu CLI lets you inspect the graph directly:

```bash
# macOS
brew install kuzu

# Linux
curl -L https://github.com/kuzudb/kuzu/releases/latest/download/kuzu_cli-linux-x86_64.tar.gz \
  | tar -xz -C /usr/local/bin
```

You can then run ad-hoc queries:

```bash
kuzu ../objective05/data/graph.db
kuzu> MATCH (n:Narrative) RETURN n LIMIT 5;
```

### 4. Acquire Tool Credentials

The default toolset requires at minimum a GitHub personal access token. The rest are optional and can be enabled selectively in `config.toml`.

| Tool        | Required Env Vars                            | How to Get                                                                |
|-------------|----------------------------------------------|---------------------------------------------------------------------------|
| GitHub      | `GITHUB_TOKEN`, `DEFAULT_REPO`              | GitHub → Settings → Developer settings → Personal access tokens (scopes: `repo`, `workflow`) |
| Email       | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | Any SMTP relay (Gmail App Password, Fastmail, Mailgun, Postmark)         |
| Slack       | `SLACK_WEBHOOK_URL`                          | Slack → Apps → Incoming Webhooks                                          |
| Discord     | `DISCORD_WEBHOOK_URL`                        | Discord → Channel Settings → Integrations → Webhooks                      |
| Filesystem  | `REPORTS_DIR`                                | Any local path you can write to (defaults to `./reports`)                 |

The agent **does not require** all five tools to run. You can enable only `github` and `filesystem` and disable the rest.

### 5. Verify Connectivity

Before launching the agent, sanity-check each external dependency:

```bash
# GitHub
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"objective05-exec smoke test"}' \
  $SLACK_WEBHOOK_URL

# Discord
curl -X POST -H 'Content-type: application/json' \
  --data '{"content":"objective05-exec smoke test"}' \
  $DISCORD_WEBHOOK_URL

# SMTP (using openssl)
echo "Subject: smoke test" | openssl s_client -connect $SMTP_HOST:$SMTP_PORT -crlf -starttls smtp
```

If any of these fail, fix them *before* starting the agent so its logs aren't drowned in connection errors.

---

## Architecture Overview

Here's the architecture we're building:

```
┌─────────────────────────────────────────────────────────────┐
│                     objective05 Daemon                      │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Ingestion   │  │ Knowledge    │  │ Broadcasting     │  │
│  │ Pipeline    │→│ Graph (Kuzu) │→│ Engine           │  │
│  │             │  │              │  │                  │  │
│  │ RSS/Reddit/ │  │ Entities,    │  │ Reports, Audio,  │  │
│  │ YouTube/    │  │ Claims,      │  │ Notifications    │  │
│  │ GitHub/     │  │ Events,      │  │                  │  │
│  │ ArXiv/HN    │  │ Narratives   │  │                  │  │
│  └─────────────┘  └──────┬───────┘  └──────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              objective05-exec Agent Runtime          │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │ Query    │  │ Evaluate │  │ Execute          │  │  │
│  │  │ Graph    │→│ Signals  │→│ Tools            │  │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │  │
│  │                     │                                │  │
│  │                     ▼                                │  │
│  │           ┌──────────────────┐                       │  │
│  │           │  TOOLS.md /      │                       │  │
│  │           │  SKILLS.md       │                       │  │
│  │           │  Discovery       │                       │  │
│  │           └──────────────────┘                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Tool Execution Layer                    │  │
│  │                                                      │  │
│  │  GitHub  │  Email  │  Slack  │  Discord  │  Files   │  │
│  │  (PRs)   │  (SMTP) │ (Webhook)│ (Webhook)│ (Write)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

The agent runtime sits between the knowledge graph and the tools. It queries the graph for context, evaluates whether an action is warranted based on detected patterns, and executes the appropriate tool. Tools are discovered through `TOOLS.md`/`SKILLS.md` files — the same pattern OpenClaw uses, which means our agent can interoperate with the OpenClaw ecosystem.

### The Three-Phase Loop

Every cycle the runtime runs goes through the same three phases:

1. **Query** — `GraphQueryBuilder` constructs Cypher queries against Kuzu and pulls back rows representing *signals*: contradictions, narrative divergences, trending entities, new events.
2. **Evaluate** — `SignalEvaluator` matches each signal against a list of `ActionRule`s. Rules can threshold on confidence, set priority, and decide whether to auto-execute or require human approval.
3. **Execute** — `ToolExecutor` dispatches the resulting actions to the appropriate tool, respecting a per-cycle budget and logging all outcomes.

This is intentionally not an LLM-driven loop. The intelligence comes from the graph, the rules come from you, and the LLM is reserved for the parts that actually need language understanding (drafting PR bodies, summarizing divergences). The deterministic loop is what makes the system debuggable, auditable, and cheap to run.

---

## Step 1: Project Structure

Let's start with the directory layout:

```
objective05-exec/
├── Cargo.toml
├── rust-toolchain.toml
├── README.md
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── agent/
│   │   ├── mod.rs
│   │   ├── runtime.rs        # Core agent loop
│   │   ├── query.rs          # Kuzu query builder
│   │   ├── evaluator.rs      # Signal evaluation engine
│   │   └── executor.rs       # Tool execution dispatcher
│   ├── tools/
│   │   ├── mod.rs
│   │   ├── github.rs         # GitHub PR/file tools
│   │   ├── email.rs          # SMTP email tool
│   │   ├── slack.rs          # Slack webhook tool
│   │   ├── discord.rs        # Discord webhook tool
│   │   └── filesystem.rs     # File write tool
│   ├── discovery/
│   │   ├── mod.rs
│   │   └── tool_loader.rs    # TOOLS.md/SKILLS.md parser
│   ├── config.rs             # Configuration management
│   └── error.rs              # Error types
├── tools/
│   ├── github.tools.md       # Tool capability definitions
│   ├── email.tools.md
│   ├── slack.tools.md
│   ├── discord.tools.md
│   └── filesystem.tools.md
├── config.toml               # Agent configuration
├── .env.example              # Documented env vars
└── docs/
    └── architecture.md
```

### Initialize the project

```bash
cargo new objective05-exec
cd objective05-exec
cargo init --lib   # we'll add a binary target too
```

### Pin the Rust toolchain (optional but recommended)

`rust-toolchain.toml`:

```toml
[toolchain]
channel = "stable"
components = ["rustfmt", "clippy"]
```

### Add dependencies to `Cargo.toml`

```toml
[package]
name = "objective05-exec"
version = "0.1.0"
edition = "2021"
description = "Execution runtime for objective05 - bridging knowledge graphs to real-world tools"
license = "MIT OR Apache-2.0"

[dependencies]
# Async runtime
tokio = { version = "1", features = ["full"] }
async-trait = "0.1"

# Serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"
toml = "0.8"

# HTTP clients
reqwest = { version = "0.12", features = ["json", "streaming"] }
jsonwebtoken = "9"

# Kuzu DB (via FFI bindings)
kuzu = "0.4"

# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Error handling
anyhow = "1"
thiserror = "2"

# UUID generation
uuid = { version = "1", features = ["v4", "serde"] }

# Time handling
chrono = { version = "0.4", features = ["serde"] }

# Email
lettre = { version = "0.11", features = ["tokio1-rustls-tls", "smtp-transport"] }

# GitHub API
octocrab = "0.38"

# Markdown parsing for TOOLS.md
pulldown-cmark = "0.11"

[profile.release]
opt-level = 3
lto = "thin"
codegen-units = 1
strip = true
```

> **Note on Kuzu**: The official `kuzu` crate provides Rust bindings via C FFI. If you hit FFI link errors on macOS, you may need `brew install kuzu` first to obtain the `libkuzu.dylib` system library. On Linux, the crate vendors the static library; on Windows, ensure the Visual C++ runtime is installed.

### .env.example

A documented template for the environment variables the agent reads at startup:

```bash
# GitHub
GITHUB_TOKEN=ghp_replace_me
DEFAULT_REPO=your-org/your-repo

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@example.com
SMTP_PASSWORD=replace_me

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/000/XXXX

# Filesystem
REPORTS_DIR=./reports

# Logging
RUST_LOG=info,objective05_exec=debug
```

---

## Step 2: Configuration and Error Types

Let's start with the foundational types.

`src/error.rs`:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExecError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Knowledge graph error: {0}")]
    GraphError(String),

    #[error("Tool execution error: {tool}: {reason}")]
    ToolError { tool: String, reason: String },

    #[error("Signal evaluation error: {0}")]
    EvaluationError(String),

    #[error("Discovery error: {0}")]
    DiscoveryError(String),

    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),

    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),
}

pub type ExecResult<T> = Result<T, ExecError>;
```

`src/config.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub agent: AgentConfig,
    pub knowledge_graph: GraphConfig,
    pub tools: ToolsConfig,
    pub execution: ExecutionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub name: String,
    pub description: String,
    pub tool_discovery_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphConfig {
    pub path: PathBuf,
    pub query_timeout_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolsConfig {
    pub enabled_tools: Vec<String>,
    pub max_concurrent_executions: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionConfig {
    pub poll_interval_secs: u64,
    pub max_action_budget_per_cycle: usize,
    pub log_executions: bool,
}

impl Config {
    pub fn from_file(path: &PathBuf) -> ExecResult<Self> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| ExecError::Config(format!("Failed to read config: {}", e)))?;
        let config: Config = toml::from_str(&content)
            .map_err(|e| ExecError::Config(format!("Failed to parse config: {}", e)))?;
        Ok(config)
    }
}
```

`config.toml`:

```toml
[agent]
name = "objective05-exec"
description = "Execution runtime for objective05 - bridges knowledge graph to real-world tools"
tool_discovery_path = "tools/"

[knowledge_graph]
path = "../objective05/data/graph.db"
query_timeout_ms = 5000

[tools]
enabled_tools = ["github", "email", "slack", "discord", "filesystem"]
max_concurrent_executions = 4

[execution]
poll_interval_secs = 60
max_action_budget_per_cycle = 10
log_executions = true
```

A note on configuration: every field is required. If you want to make something optional (for example, the tool discovery path when running with no markdown tool files), wrap it in `Option<PathBuf>` and add `#[serde(default)]`. The defaults defined here assume a single-tenant, single-host deployment; multi-agent routing would extend `Config` with a `routing` section listing per-signal-type target agents.

### Loading Config from Environment

The current `Config::from_file` reads from disk. For containerized deployments you may want to read specific fields from environment variables. The simplest pattern is to override the config path:

```bash
CONFIG_PATH=/etc/objective05-exec/config.toml ./target/release/objective05-exec
```

For full 12-factor compliance, swap `Config::from_file` for an `envy`-based deserializer that reads the same struct from process environment.

---

## Step 3: The Tool Discovery System

This is where we borrow OpenClaw's cleverest design pattern: `TOOLS.md`/`SKILLS.md` capability discovery. Instead of hardcoding available tools, the agent reads markdown files that describe what tools exist, what parameters they accept, and when they should be used. This means tools can be added without recompiling — just drop a new `.tools.md` file into the tools directory.

`src/discovery/mod.rs`:

```rust
pub mod tool_loader;

pub use tool_loader::{ToolRegistry, ToolCapability, ParameterSchema, ToolType};
```

`src/discovery/tool_loader.rs`:

```rust
use super::ExecResult;
use crate::error::ExecError;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

/// A tool capability as described in a TOOLS.md file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCapability {
    pub name: String,
    pub description: String,
    pub parameters: HashMap<String, ParameterSchema>,
    pub trigger_conditions: Vec<String>,
    pub tool_type: ToolType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterSchema {
    pub r#type: String,
    pub description: String,
    pub required: bool,
    pub examples: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ToolType {
    GitHub,
    Email,
    Slack,
    Discord,
    Filesystem,
    Custom(String),
}

/// Tool registry discovered from TOOLS.md files
#[derive(Debug, Clone)]
pub struct ToolRegistry {
    pub capabilities: HashMap<String, ToolCapability>,
}

impl ToolRegistry {
    /// Load all tool capabilities from the tools directory
    pub fn load_from_directory(dir_path: &Path) -> ExecResult<Self> {
        let mut capabilities = HashMap::new();

        if !dir_path.exists() {
            return Err(ExecError::DiscoveryError(
                format!("Tools directory not found: {}", dir_path.display()),
            ));
        }

        for entry in std::fs::read_dir(dir_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().map_or(false, |ext| ext == "md") {
                let content = std::fs::read_to_string(&path)?;
                if let Some(capability) = Self::parse_tool_file(&path, &content)? {
                    capabilities.insert(capability.name.clone(), capability);
                }
            }
        }

        Ok(Self { capabilities })
    }

    /// Parse a single TOOLS.md file into a ToolCapability
    fn parse_tool_file(
        path: &Path,
        content: &str,
    ) -> ExecResult<Option<ToolCapability>> {
        let mut name = String::new();
        let mut description = String::new();
        let mut parameters = HashMap::new();
        let mut trigger_conditions = Vec::new();
        let mut tool_type = ToolType::Custom(String::new());

        let current_tool = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Determine tool type from filename
        tool_type = match current_tool.as_str() {
            "github" => ToolType::GitHub,
            "email" => ToolType::Email,
            "slack" => ToolType::Slack,
            "discord" => ToolType::Discord,
            "filesystem" => ToolType::Filesystem,
            _ => ToolType::Custom(current_tool.clone()),
        };

        let mut in_params = false;
        let mut in_triggers = false;

        for line in content.lines() {
            if line.starts_with("# ") {
                name = line[2..].trim().to_string();
                in_params = false;
                in_triggers = false;
            } else if line.starts_with("## Parameters") {
                in_params = true;
                in_triggers = false;
            } else if line.starts_with("## Trigger Conditions") {
                in_triggers = true;
                in_params = false;
            } else if line.starts_with("## Description") || line.starts_with("### Description") {
                description = content
                    .lines()
                    .skip_while(|l| !l.contains("Description"))
                    .skip(1)
                    .take_while(|l| !l.starts_with("#"))
                    .collect::<Vec<&str>>()
                    .join("\n")
                    .trim()
                    .to_string();
            } else if line.starts_with("- **") && in_params {
                // Parse parameter line like: - **param_name** (type): description
                if let Some(param_def) = line.strip_prefix("- **") {
                    if let Some((param_name, rest)) = param_def.split_once("** (") {
                        if let Some((param_type, _desc)) = rest.split_once("): ") {
                            let desc = _desc.trim_start_matches('-').trim();
                            parameters.insert(
                                param_name.to_string(),
                                ParameterSchema {
                                    r#type: param_type.to_string(),
                                    description: desc.to_string(),
                                    required: false, // Default, can be overridden
                                    examples: Vec::new(),
                                },
                            );
                        }
                    }
                }
            } else if line.starts_with("- ") && in_triggers {
                if let Some(condition) = line.strip_prefix("- ") {
                    trigger_conditions.push(condition.trim().to_string());
                }
            }
        }

        if name.is_empty() {
            return Ok(None);
        }

        Ok(Some(ToolCapability {
            name,
            description,
            parameters,
            trigger_conditions,
            tool_type,
        }))
    }

    /// Check if any trigger conditions match a given graph signal
    pub fn match_triggers(&self, signal: &GraphSignal) -> Vec<String> {
        self.capabilities
            .iter()
            .filter_map(|(name, cap)| {
                if cap
                    .trigger_conditions
                    .iter()
                    .any(|cond| signal.matches(cond))
                {
                    Some(name.clone())
                } else {
                    None
                }
            })
            .collect()
    }
}
```

A small but important detail: the parser is intentionally tolerant. A `TOOLS.md` with no `## Parameters` section still loads — the resulting `ToolCapability` just has an empty `parameters` map. This means you can write a `TOOLS.md` that documents a tool's intent without committing to a typed schema, useful for early prototyping.

The `match_triggers` method does a substring match between signal-type strings and trigger-condition text. For higher precision, you can replace it with a real expression evaluator (see [Beyond the MVP](#beyond-the-mvp)).

---

## Step 4: The Graph Query Builder

Now we need a way to query the Kuzu knowledge graph for context. This is where Objective05's temporal graph comes in — we're not just asking "what's true?" We're asking "what changed?", "what contradicts?", "what's trending?"

`src/agent/mod.rs`:

```rust
pub mod runtime;
pub mod query;
pub mod evaluator;
pub mod executor;
```

`src/agent/query.rs`:

```rust
use crate::config::Config;
use crate::discovery::tool_loader::ToolRegistry;
use crate::error::{ExecError, ExecResult};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;

/// A graph signal that represents a detectable pattern
#[derive(Debug, Clone)]
pub struct GraphSignal {
    pub signal_type: SignalType,
    pub entity: String,
    pub context: serde_json::Value,
}

#[derive(Debug, Clone)]
pub enum SignalType {
    ContradictionDetected,
    NarrativeDivergence,
    TrendingEntity,
    NewEvent,
    ClaimSuperseded,
    Custom(String),
}

impl std::fmt::Display for SignalType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SignalType::ContradictionDetected => write!(f, "ContradictionDetected"),
            SignalType::NarrativeDivergence => write!(f, "NarrativeDivergence"),
            SignalType::TrendingEntity => write!(f, "TrendingEntity"),
            SignalType::NewEvent => write!(f, "NewEvent"),
            SignalType::ClaimSuperseded => write!(f, "ClaimSuperseded"),
            SignalType::Custom(s) => write!(f, "{}", s),
        }
    }
}

impl GraphSignal {
    pub fn matches(&self, condition: &str) -> bool {
        match &self.signal_type {
            SignalType::ContradictionDetected => condition.contains("contradiction"),
            SignalType::NarrativeDivergence => condition.contains("narrative"),
            SignalType::TrendingEntity => condition.contains("trending"),
            SignalType::NewEvent => condition.contains("event"),
            SignalType::ClaimSuperseded => condition.contains("superseded"),
            SignalType::Custom(c) => condition.contains(c.as_str()),
        }
    }
}

/// Query builder for Kuzu knowledge graph
pub struct GraphQueryBuilder {
    config: Config,
}

impl GraphQueryBuilder {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    /// Query for recent contradictions in tracked narratives
    pub fn build_contradiction_query(&self) -> String {
        format!(
            r#"
            MATCH (c:Contradiction)
            WHERE c.detected_at > datetime('{}')
            RETURN c.id AS contradiction_id,
                   c.claim_a AS claim_a,
                   c.claim_b AS claim_b,
                   c.entity AS entity,
                   c.detected_at AS detected_at,
                   c.confidence AS confidence
            ORDER BY c.detected_at DESC
            LIMIT 50
            "#,
            chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(24))
                .unwrap()
                .to_rfc3339()
        )
    }

    /// Query for narratives with highest divergence scores
    pub fn build_divergence_query(&self) -> String {
        format!(
            r#"
            MATCH (n:Narrative)
            WHERE n.divergence_score > 0.5
                  AND n.updated_at > datetime('{}')
            RETURN n.id AS narrative_id,
                   n.title AS title,
                   n.divergence_score AS divergence_score,
                   n.tracked_entities AS entities,
                   n.updated_at AS updated_at
            ORDER BY n.divergence_score DESC
            LIMIT 20
            "#,
            chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(48))
                .unwrap()
                .to_rfc3339()
        )
    }

    /// Query for trending entities by mention velocity
    pub fn build_trending_query(&self) -> String {
        format!(
            r#"
            MATCH (e:Entity)
            WHERE e.mention_velocity > 5
                  AND e.last_seen > datetime('{}')
            RETURN e.id AS entity_id,
                   e.name AS name,
                   e.mention_velocity AS velocity,
                   e.category AS category,
                   e.last_seen AS last_seen
            ORDER BY e.mention_velocity DESC
            LIMIT 10
            "#,
            chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(12))
                .unwrap()
                .to_rfc3339()
        )
    }

    /// Build a query for new events in tracked domains
    pub fn build_events_query(&self) -> String {
        format!(
            r#"
            MATCH (e:Event)
            WHERE e.created_at > datetime('{}')
                  AND e.verified = true
            RETURN e.id AS event_id,
                   e.title AS title,
                   e.description AS description,
                   e.related_entities AS entities,
                   e.confidence AS confidence,
                   e.created_at AS created_at
            ORDER BY e.created_at DESC
            LIMIT 30
            "#,
            chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(6))
                .unwrap()
                .to_rfc3339()
        )
    }

    /// Execute a query against the Kuzu graph via the Rust FFI bindings.
    /// In this tutorial the FFI is stubbed; in production, replace with
    /// a real `kuzu::Database` and `kuzu::Connection`.
    pub async fn execute_query(&self, query: &str) -> ExecResult<serde_json::Value> {
        tracing::info!("Executing graph query: {}", query);

        // Simulate query execution
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        Ok(json!({
            "status": "success",
            "rows": []
        }))
    }
}
```

A few notes on the query builder:

- **Time windows are computed from `Utc::now()`** at call time. If you need historical replays, accept a `since: DateTime<Utc>` parameter on each builder and pass it from the runtime.
- **Limits (`LIMIT 50`, `LIMIT 20`, etc.) are conservative defaults**. They exist to prevent runaway result sets if the graph is dense. Tune them based on your action budget.
- **The `execute_query` stub returns an empty `rows` array.** The real implementation should construct a `kuzu::Connection`, call `conn.query(query)`, and walk the resulting `QueryResult` to serialize rows into `serde_json::Value`. Treat the stub as a typed boundary: anything that passes through it must serialize cleanly.

---

## Step 5: The Signal Evaluator

The evaluator is the decision engine. It takes raw graph signals and determines which tools should be triggered. This is where the "thinking" happens — not with an LLM, but with rule-based evaluation against the knowledge graph.

`src/agent/evaluator.rs`:

```rust
use crate::agent::query::GraphSignal;
use crate::discovery::tool_loader::ToolRegistry;
use crate::error::ExecResult;

/// An evaluation rule that maps signals to tool actions
#[derive(Debug, Clone)]
pub struct ActionRule {
    pub rule_id: String,
    pub signal_type: String,
    pub threshold: f64,
    pub action: ActionDefinition,
}

#[derive(Debug, Clone)]
pub struct ActionDefinition {
    pub tool_name: String,
    pub priority: Priority,
    pub description: String,
    pub auto_execute: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

/// The signal evaluator that matches rules against graph signals
pub struct SignalEvaluator {
    pub rules: Vec<ActionRule>,
}

impl SignalEvaluator {
    pub fn new() -> Self {
        Self { rules: Vec::new() }
    }

    /// Add an evaluation rule
    pub fn add_rule(&mut self, rule: ActionRule) {
        self.rules.push(rule);
    }

    /// Evaluate a signal against all rules and return matching actions
    pub fn evaluate(&self, signal: &GraphSignal) -> ExecResult<Vec<ActionDefinition>> {
        let mut actions = Vec::new();
        let signal_type_str = signal.signal_type.to_string();

        for rule in &self.rules {
            if rule.signal_type != signal_type_str {
                continue;
            }
            // Check confidence/threshold
            if let Some(confidence) = signal.context.get("confidence") {
                if let Some(score) = confidence.as_f64() {
                    if score < rule.threshold {
                        continue;
                    }
                }
            }
            actions.push(rule.action.clone());
        }

        Ok(actions)
    }

    /// Evaluate multiple signals and return all matching actions
    pub fn evaluate_batch(
        &self,
        signals: &[GraphSignal],
        registry: &ToolRegistry,
    ) -> ExecResult<Vec<(GraphSignal, Vec<ActionDefinition>)>> {
        let mut results = Vec::new();

        for signal in signals {
            if let Ok(actions) = self.evaluate(signal) {
                if !actions.is_empty() {
                    results.push((signal.clone(), actions));
                }
            }
        }

        Ok(results)
    }
}

/// Build default evaluation rules for common patterns
pub fn build_default_rules() -> SignalEvaluator {
    let mut evaluator = SignalEvaluator::new();

    // Rule: High-confidence contradictions → GitHub PR
    evaluator.add_rule(ActionRule {
        rule_id: "contradiction-pr".to_string(),
        signal_type: "ContradictionDetected".to_string(),
        threshold: 0.7,
        action: ActionDefinition {
            tool_name: "github".to_string(),
            priority: Priority::High,
            description: "File PR to update conflicting entity in knowledge base".to_string(),
            auto_execute: true,
        },
    });

    // Rule: High divergence narratives → Slack notification
    evaluator.add_rule(ActionRule {
        rule_id: "narrative-slack".to_string(),
        signal_type: "NarrativeDivergence".to_string(),
        threshold: 0.5,
        action: ActionDefinition {
            tool_name: "slack".to_string(),
            priority: Priority::Medium,
            description: "Notify team of narrative divergence in tracked domain".to_string(),
            auto_execute: false,
        },
    });

    // Rule: Trending entities → File system report
    evaluator.add_rule(ActionRule {
        rule_id: "trending-report".to_string(),
        signal_type: "TrendingEntity".to_string(),
        threshold: 0.0,
        action: ActionDefinition {
            tool_name: "filesystem".to_string(),
            priority: Priority::Low,
            description: "Write trending entity analysis to reports directory".to_string(),
            auto_execute: true,
        },
    });

    // Rule: New verified events → Discord announcement
    evaluator.add_rule(ActionRule {
        rule_id: "event-discord".to_string(),
        signal_type: "NewEvent".to_string(),
        threshold: 0.8,
        action: ActionDefinition {
            tool_name: "discord".to_string(),
            priority: Priority::High,
            description: "Announce new verified event to Discord channel".to_string(),
            auto_execute: true,
        },
    });

    evaluator
}
```

A few thoughts on the rule design:

- **`auto_execute: false`** is the safe default for *new* rules.
- **Thresholds are typed as `f64`** — never compare with `==`.
- **Rule IDs should be stable** across releases; treat them like primary keys.


You can persist these rules to `config.toml` and reload at startup if you want them editable without recompiling. A simple format:

```toml
[[rules]]
rule_id = "contradiction-pr"
signal_type = "ContradictionDetected"
threshold = 0.7
tool_name = "github"
priority = "High"
auto_execute = true
description = "File PR to update conflicting entity in knowledge base"
```

Then in `main.rs`:

```rust
let rules_toml = std::fs::read_to_string("rules.toml")?;
let rules: Vec<ActionRule> = toml::from_str(&rules_toml)?;
let mut evaluator = SignalEvaluator::new();
for r in rules { evaluator.add_rule(r); }
```

This makes the agent's behavior data-driven rather than code-driven.


---

## Step 6: The Tool Execution Layer

Now the hands. Each tool implements a common trait so the executor can dispatch to any tool uniformly.

`src/tools/mod.rs`:

```rust
pub mod github;
pub mod email;
pub mod slack;
pub mod discord;
pub mod filesystem;

use crate::error::ExecResult;
use serde_json::Value;

#[async_trait::async_trait]
pub trait ExecutableTool: Send + Sync {
    async fn execute(&self, params: Value) -> ExecResult<ToolResult>;
    fn validate(&self, params: &Value) -> ExecResult<()>;
    fn name(&self) -> &str;
}

pub struct ToolResult {
    pub success: bool,
    pub output: String,
    pub metadata: serde_json::Value,
}
```

The five tool implementations (`github.rs`, `email.rs`, `slack.rs`, `discord.rs`, `filesystem.rs`) follow the same trait implementation pattern. The full source is in the [companion repository](https://github.com/kliewerdaniel/objective05-exec). Each tool:
1. Validates required parameters.
2. Calls the external API or system call.
3. Returns a `ToolResult` with success status, human-readable output, and structured metadata.
4. Logs the action via `tracing` for observability.

The key invariants are:
- **All required parameters are validated** before any side effect.
- **Every execution logs an `info!` trace** with the tool name, action, and a summary of the parameters.
- **External errors are wrapped in `ExecError::ToolError`** with a `{ tool, reason }` payload.

### Securing the Filesystem Tool

The `FilesystemTool` writes to `self.base_dir`. **In production you must constrain the base directory** with a canonical-path check to prevent path traversal:

```rust
fn safe_resolve(&self, rel: &str) -> ExecResult<PathBuf> {
    let base = Path::new(&self.base_dir).canonicalize()?;
    let candidate = base.join(rel);
    let canonical = candidate.canonicalize().unwrap_or(candidate);
    if !canonical.starts_with(&base) {
        return Err(ExecError::ToolError { tool: "filesystem".into(), reason: format!("Path '{}' escapes base directory", rel) });
    }
    Ok(canonical)
}
```

Always invoke `safe_resolve` before opening a file. A signal that requests `path: "../../etc/passwd"` will be rejected.

Now the executor dispatcher:

`src/agent/executor.rs`:

```rust
use crate::agent::evaluator::ActionDefinition;
use crate::error::{ExecError, ExecResult};
use crate::tools::{ExecutableTool, ToolResult, github::GitHubTool, email::EmailTool, slack::SlackTool, discord::DiscordTool, filesystem::FilesystemTool};
use serde_json::Value;
use std::collections::HashMap;

pub struct ToolExecutor {
    pub tools: HashMap<String, Box<dyn ExecutableTool>>,
}

impl ToolExecutor {
    pub fn new(config: &crate::config::Config) -> ExecResult<Self> {
        let mut executor = Self { tools: HashMap::new() };
        for tool_name in &config.tools.enabled_tools {
            match tool_name.as_str() {
                "github" => { executor.tools.insert("github".into(), Box::new(GitHubTool { token: std::env::var("GITHUB_TOKEN").unwrap_or_default(), default_repo: std::env::var("DEFAULT_REPO").unwrap_or_default() })); },
                "email" => { executor.tools.insert("email".into(), Box::new(EmailTool { smtp_host: std::env::var("SMTP_HOST").unwrap_or_default(), smtp_port: std::env::var("SMTP_PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(587), username: std::env::var("SMTP_USERNAME").unwrap_or_default(), password: std::env::var("SMTP_PASSWORD").unwrap_or_default() })); },
                "slack" => { executor.tools.insert("slack".into(), Box::new(SlackTool { webhook_url: std::env::var("SLACK_WEBHOOK_URL").unwrap_or_default() })); },
                "discord" => { executor.tools.insert("discord".into(), Box::new(DiscordTool { webhook_url: std::env::var("DISCORD_WEBHOOK_URL").unwrap_or_default() })); },
                "filesystem" => { executor.tools.insert("filesystem".into(), Box::new(FilesystemTool { base_dir: std::env::var("REPORTS_DIR").unwrap_or_else(|_| "./reports".to_string()) })); },
                _ => tracing::warn!("Unknown tool in config: {}", tool_name),
            }
        }
        Ok(executor)
    }

    pub async fn execute_action(&self, action: &ActionDefinition, params: Value) -> ExecResult<ToolResult> {
        let tool = self.tools.get(action.tool_name.as_str()).ok_or_else(|| ExecError::ToolError { tool: action.tool_name.clone(), reason: "Tool not found in executor".into() })?;
        tracing::info!("Executing tool '{}' with priority {:?}: {}", action.tool_name, action.priority, action.description);
        if let Err(e) = tool.validate(&params) { tracing::warn!("Validation failed for {}: {}", action.tool_name, e); return Err(e); }
        let result = tool.execute(params).await;
        if let Ok(ref r) = result { tracing::info!("Tool '{}' succeeded: {}", action.tool_name, r.output); } else { tracing::error!("Tool '{}' failed: {:?}", action.tool_name, result.err()); }
        result
    }

    pub async fn execute_batch(&self, actions: Vec<(ActionDefinition, Value)>, max_budget: usize) -> ExecResult<Vec<ToolResult>> {
        let mut results = Vec::new();
        let budget = actions.len().min(max_budget);
        tracing::info!("Executing {} actions (budget: {})", budget, max_budget);
        for (i, (action, params)) in actions.into_iter().enumerate() {
            if i >= budget { tracing::info!("Action budget reached, skipping remaining"); break; }
            match self.execute_action(&action, params).await {
                Ok(r) => results.push(r),
                Err(e) => tracing::error!("Failed to execute action {}: {}", i, e),
            }
        }
        Ok(results)
    }
}
```

---

## Step 7: The Core Agent Runtime

This is the heart of the system — the poll→evaluate→execute loop. It runs continuously, querying the knowledge graph, evaluating signals against rules, and dispatching actions to tools.

`src/agent/runtime.rs`:

```rust
use crate::agent::evaluator::{SignalEvaluator, build_default_rules};
use crate::agent::executor::ToolExecutor;
use crate::agent::query::{GraphQueryBuilder, GraphSignal, SignalType};
use crate::config::Config;
use crate::discovery::tool_loader::ToolRegistry;
use crate::error::ExecResult;
use serde_json::json;

pub struct AgentRuntime {
    config: Config,
    query_builder: GraphQueryBuilder,
    evaluator: SignalEvaluator,
    executor: ToolExecutor,
    registry: ToolRegistry,
}

impl AgentRuntime {
    pub fn new(config: Config) -> ExecResult<Self> {
        let query_builder = GraphQueryBuilder::new(config.clone());
        let evaluator = build_default_rules();
        let executor = ToolExecutor::new(&config)?;
        let registry = ToolRegistry::load_from_directory(&config.agent.tool_discovery_path)?;
        Ok(Self { config, query_builder, evaluator, executor, registry })
    }

    pub async fn run_cycle(&self) -> ExecResult<Vec<String>> {
        tracing::info!("Starting execution cycle");
        let mut outputs = Vec::new();
        let signals = self.collect_signals().await?;
        tracing::info!("Collected {} graph signals", signals.len());
        if signals.is_empty() { tracing::info!("No signals detected this cycle"); return Ok(outputs); }
        let evaluations = self.evaluator.evaluate_batch(&signals, &self.registry)?;
        tracing::info!("{} signals matched evaluation rules", evaluations.len());
        let actions: Vec<_> = evaluations.into_iter()
            .flat_map(|(signal, actions)| actions.into_iter().map(move |action| {
                let params = json!({"signal_type": signal.signal_type.to_string(), "entity": signal.entity, "context": signal.context});
                (action, params)
            }))
            .collect();
        let results = self.executor.execute_batch(actions, self.config.execution.max_action_budget_per_cycle).await?;
        for r in results { outputs.push(r.output); }
        tracing::info!("Execution cycle complete: {} actions executed", outputs.len());
        Ok(outputs)
    }

    async fn collect_signals(&self) -> ExecResult<Vec<GraphSignal>> {
        let mut signals = Vec::new();
        if let Ok(result) = self.query_builder.execute_query(&self.query_builder.build_contradiction_query()).await {
            if let Some(rows) = result.get("rows").and_then(|r| r.as_array()) {
                for row in rows {
                    signals.push(GraphSignal { signal_type: SignalType::ContradictionDetected, entity: row.get("entity").and_then(|e| e.as_str()).unwrap_or("unknown").to_string(), context: row.clone() });
                }
            }
        }
        Ok(signals)
    }

    pub async fn run_forever(&self) -> ExecResult<()> {
        tracing::info!("Starting agent runtime (poll interval: {}s)", self.config.execution.poll_interval_secs);
        let interval = std::time::Duration::from_secs(self.config.execution.poll_interval_secs);
        loop {
            tracing::info!("--- Execution cycle starting ---");
            match self.run_cycle().await {
                Ok(outputs) => { for o in outputs { tracing::info!("Output: {}", o); } },
                Err(e) => { tracing::error!("Cycle failed: {}", e); },
            }
            tracing::info!("--- Execution cycle complete, sleeping ---");
            tokio::time::sleep(interval).await;
        }
    }
}
```

For graceful shutdown, wrap the loop in a `tokio::select!` against a shutdown signal.

---

## Step 8: The Main Entry Point

`src/main.rs`:

```rust
mod agent;
mod config;
mod discovery;
mod error;
mod tools;

use objective05_exec::config::Config;
use objective05_exec::error::ExecResult;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> ExecResult<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();
    let config_path = std::path::PathBuf::from("config.toml");
    let config = Config::from_file(&config_path)?;
    tracing::info!("Starting objective05-exec v{}", env!("CARGO_PKG_VERSION"));
    let runtime = agent::runtime::AgentRuntime::new(config)?;
    tracing::info!("Agent runtime initialized. Starting execution loop...");
    runtime.run_forever().await?;
    Ok(())
}
```

Also expose `src/lib.rs`:

```rust
pub mod agent;
pub mod config;
pub mod discovery;
pub mod error;
pub mod tools;
pub use config::Config;
pub use error::{ExecError, ExecResult};
```

---

## Step 9: TOOLS.md Files

The capability discovery files live in the `tools/` directory. The five files (`github.tools.md`, `email.tools.md`, `slack.tools.md`, `discord.tools.md`, `filesystem.tools.md`) follow the same three-section format:

- `## Description` — what the tool does, in plain language
- `## Parameters` — name, type, required/optional, example
- `## Trigger Conditions` — natural-language rules describing when the agent should consider using this tool

The agent never compiles against the contents of these files at runtime — they exist as documentation for the operator and as input to future LLM-driven tool selectors.

---

## Step 10: Building and Running

With everything in place:

```bash
cargo build --release
./target/release/objective05-exec
```

For development, run with `RUST_LOG=objective05_exec=debug` to see per-query and per-tool traces.

---

## Environment Variables Reference

| Variable | Required For | Default | Notes |
|---|---|---|---|
| `GITHUB_TOKEN` | `github` tool | none | PAT with `repo` and `workflow` scopes |
| `DEFAULT_REPO` | `github` tool | none | `org/name` for default PR target |
| `SMTP_HOST` | `email` tool | none | Hostname of SMTP relay |
| `SMTP_PORT` | `email` tool | `587` | TLS SMTP port |
| `SMTP_USERNAME` | `email` tool | none | Full email address |
| `SMTP_PASSWORD` | `email` tool | none | App password recommended |
| `SLACK_WEBHOOK_URL` | `slack` tool | none | Incoming webhook URL |
| `DISCORD_WEBHOOK_URL` | `discord` tool | none | Channel webhook URL |
| `REPORTS_DIR` | `filesystem` tool | `./reports` | Base directory for writes |
| `RUST_LOG` | logging | `info` | Standard `tracing_subscriber` filter |
| `CONFIG_PATH` | optional | `config.toml` | Override config file path |

All variables are read at startup. There is no hot-reload — restart the agent to pick up new credentials.


---

## The Kuzu Schema This Agent Expects

`objective05-exec` queries four node types and reads their temporal/relational properties. If you are building a graph from scratch (or pointing the agent at an existing one), the schema below covers everything the four default queries reference.

### Node Tables

```cypher
CREATE NODE TABLE Entity(
    id STRING PRIMARY KEY,
    name STRING,
    category STRING,
    mention_velocity DOUBLE,
    last_seen TIMESTAMP
);

CREATE NODE TABLE Narrative(
    id STRING PRIMARY KEY,
    title STRING,
    divergence_score DOUBLE,
    tracked_entities STRING[],
    updated_at TIMESTAMP
);

CREATE NODE TABLE Contradiction(
    id STRING PRIMARY KEY,
    claim_a STRING,
    claim_b STRING,
    entity STRING,
    detected_at TIMESTAMP,
    confidence DOUBLE
);

CREATE NODE TABLE Event(
    id STRING PRIMARY KEY,
    title STRING,
    description STRING,
    related_entities STRING[],
    confidence DOUBLE,
    verified BOOLEAN,
    created_at TIMESTAMP
);

CREATE NODE TABLE Claim(
    id STRING PRIMARY KEY,
    text STRING,
    entity STRING,
    superseded_by STRING,
    created_at TIMESTAMP
);
```

### Seed Script

If you do not have an Objective05 instance running, this Kuzu script populates a minimal graph the agent can act on:

```cypher
CREATE (e1:Entity {id: 'e1', name: 'Rust Foundation', category: 'org', mention_velocity: 12.4, last_seen: timestamp()});
CREATE (e2:Entity {id: 'e2', name: 'Local-first AI', category: 'topic', mention_velocity: 8.1, last_seen: timestamp()});
CREATE (n1:Narrative {id: 'n1', title: 'Edge LLM Adoption', divergence_score: 0.72, tracked_entities: ['e1', 'e2'], updated_at: timestamp()});
CREATE (c1:Contradiction {id: 'c1', claim_a: 'Edge LLMs reduce cost', claim_b: 'Edge LLMs increase engineering cost', entity: 'e2', detected_at: timestamp(), confidence: 0.83});
CREATE (ev1:Event {id: 'ev1', title: 'Rust 1.85 released', description: 'New async fn in traits stabilization', related_entities: ['e1'], confidence: 0.99, verified: true, created_at: timestamp()});
```

After seeding, run the agent and watch the filesystem report get written.

---

## Testing the Agent

The MVP does not ship with a full test suite, but the architecture has obvious test seams. Start with three layers.

### 1. Unit Tests for Pure Logic

`SignalEvaluator::evaluate` and `GraphSignal::matches` are deterministic functions with no I/O. Cover them with table-driven tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::query::{GraphSignal, SignalType};
    use serde_json::json;

    #[test]
    fn evaluator_threshold_blocks_low_confidence() {
        let mut ev = SignalEvaluator::new();
        ev.add_rule(ActionRule {
            rule_id: "test".into(),
            signal_type: "ContradictionDetected".into(),
            threshold: 0.8,
            action: ActionDefinition { tool_name: "github".into(), priority: Priority::High, description: "test".into(), auto_execute: true },
        });
        let high = GraphSignal { signal_type: SignalType::ContradictionDetected, entity: "x".into(), context: json!({"confidence": 0.9}) };
        let low = GraphSignal { signal_type: SignalType::ContradictionDetected, entity: "x".into(), context: json!({"confidence": 0.5}) };
        assert_eq!(ev.evaluate(&high).unwrap().len(), 1);
        assert_eq!(ev.evaluate(&low).unwrap().len(), 0);
    }
}
```

### 2. Integration Tests with Mocked Tools

Implement a `MockTool` that records calls into a `Vec<RecordedCall>` and assert on it after a cycle. This validates the executor dispatch without touching real APIs.

```rust
pub struct MockTool { pub calls: Arc<Mutex<Vec<serde_json::Value>>> }

#[async_trait::async_trait]
impl ExecutableTool for MockTool {
    async fn execute(&self, params: Value) -> ExecResult<ToolResult> {
        self.calls.lock().await.push(params);
        Ok(ToolResult { success: true, output: "ok".into(), metadata: json!({}) })
    }
    fn validate(&self, _params: &Value) -> ExecResult<()> { Ok(()) }
    fn name(&self) -> &str { "mock" }
}
```

### 3. End-to-End Smoke Test

The seed script plus a filesystem tool with `REPORTS_DIR=./smoke-out` gives you a complete E2E test. After one cycle, assert that `./smoke-out/trending_*.md` exists and contains a markdown header.

---

## Deployment Patterns

### Bare-Metal / Home Server

The simplest deployment. `cargo build --release` on the host, then run the binary under `tmux` or `systemd`. Set `RUST_LOG=info` and let it poll every 60 seconds.

### Docker

```dockerfile
FROM rust:1.78 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libkuzu1.4 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/objective05-exec /usr/local/bin/
COPY config.toml /etc/objective05-exec/
COPY tools /etc/objective05-exec/tools/
WORKDIR /etc/objective05-exec
CMD ["/usr/local/bin/objective05-exec"]
```

Build and run:

```bash
docker build -t objective05-exec .
docker run -d --restart unless-stopped   -v /path/to/objective05-graph:/data:ro   -v /path/to/reports:/reports   --env-file .env   objective05-exec
```

### Kubernetes

Deploy as a `Deployment` with a single replica (the runtime is not designed to be horizontally scaled without coordination on the graph database). Mount the Kuzu graph as a `ReadOnlyMany` PVC, mount the reports directory as `ReadWriteOnce`, and pass credentials via `Secret`. The `run_forever` loop can be paired with a `livenessProbe` that hits a `/healthz` endpoint (add a tiny `axum` server to `main.rs` if you want this).

### GitHub Actions CI

The integration test layer runs entirely offline, so it can live in a normal GitHub Actions job without any external services. Cache `~/.cargo` and `target/` between runs to keep CI under 5 minutes.

---

## Integration with OpenClaw

One of the most powerful aspects of this architecture is its compatibility with the OpenClaw ecosystem. Because we use the same `TOOLS.md`/`SKILLS.md` discovery pattern, your `objective05-exec` runtime can:

1. **Share tool definitions** with OpenClaw agents — one set of capability files, multiple agents
2. **Receive commands** from OpenClaw gateways — the agent can be triggered remotely via WebSocket
3. **Execute OpenClaw tools** — any tool that follows the OpenClaw specification works with our executor
4. **Feed results back** — tool execution results can be persisted to the Kuzu graph as observations

To integrate, run OpenClaw as a sidecar process and have it forward incoming chat messages to `objective05-exec` over a Unix socket. The executor's signal-evaluation step already filters by `auto_execute`, so OpenClaw-originated signals can be marked for human approval by default.

---

## Troubleshooting

### The agent starts but logs no signals

Open the Kuzu CLI and run `MATCH (n) RETURN count(n)`. If the graph is empty, the seed script (above) will populate it. If the graph has rows but your queries return nothing, check the time window — the default queries use 6–48 hour windows, and a fresh graph won't have any data inside those windows.

### `Validation failed for filesystem: Path 'foo' escapes base directory`

`safe_resolve` is doing its job. Either use a relative path that stays under `REPORTS_DIR` or update the rule to skip the offending path.

### `Tool 'githb' not found in executor`

Typo in `config.toml`'s `enabled_tools` array. The agent logs a `warn!` for unknown tools but does not crash — fix the typo and restart.

### Kuzu link errors on macOS

`brew install kuzu` then `export KUZU_INCLUDE_PATH=/opt/homebrew/include` and `export LIBRARY_PATH=/opt/homebrew/lib` before `cargo build`. On Apple Silicon the path is `/opt/homebrew/`; on Intel it is `/usr/local/`.

### Cycle fails with `Query timeout`

Increase `query_timeout_ms` in `config.toml`. The Kuzu FFI default is 5 seconds; on a slow disk or a graph over 10M nodes, you may need 15–30 seconds.

### Slack/Discord webhook returns 404

The webhook URL is invalid or has been revoked. Generate a new one and update the env var.

### Agent uses 100% CPU

You are probably hitting the graph on every cycle. Lower the signal ceiling by raising the threshold values in your rules, or by reducing `poll_interval_secs`.

---

## Beyond the MVP

The current implementation covers the core loop: poll→evaluate→execute with five tool integrations. Here is what is next.

### Autonomous Drafting

Instead of just executing predefined actions, the agent can draft PRs or documents by querying the graph for relevant context, assembling a response using the detected entities and claims, and submitting it for human review. The draft becomes an observation in the graph — if accepted, it updates the knowledge state. If rejected, it feeds back into the contradiction detection system.

### Calendar-Aware Scheduling

The agent can check calendar availability before scheduling meetings, sending reports, or triggering batch executions. This adds temporal intelligence beyond the knowledge graph — the agent understands not just what is true, but *when* to act on it.

### Multi-Agent Routing

Multiple `objective05-exec` instances could run in parallel, each specialized for a different domain (GitHub monitoring, ArXiv tracking, news analysis). A master router evaluates signals and dispatches to the appropriate specialist agent. This mirrors the multi-agent routing in OpenClaw but with deeper domain specialization.

### Mobile Push Notifications

For high-priority signals — critical contradictions, breaking events, trending entities — the agent can push notifications to mobile devices via APNs/FCM. This bridges the gap between background intelligence and real-time awareness.

### Outcome Feedback Loops

Every tool execution produces an outcome. Those outcomes — success, failure, user acceptance — feed back into the knowledge graph as new observations. A PR that gets merged confirms a hypothesis. An email that gets opened confirms relevance. A Slack message that gets replied to confirms urgency. Over time, the agent's evaluation rules self-tune based on historical outcome data.

### Expression-Based Triggers

Replace the substring match in `ToolRegistry::match_triggers` with a real expression evaluator (e.g., `cel-rust` or `rhai`). Rules can then express complex conditions like `confidence > 0.7 AND entity in ['rust', 'go']` without rewriting the discovery parser.

---

## Why This Matters

The current AI landscape is dominated by two approaches: cloud agents that are always-on but shallow, and local models that are deep but passive. `objective05-exec` sits in the middle. It's local-first — runs on consumer hardware, no API costs, no vendor lock-in. But unlike a local chatbot, it has hands. It can file PRs, send emails, write reports, post to Slack.

The key insight is that **tool execution does not require the cloud**. You do not need a $200/month agent subscription to have an AI that drafts PRs and sends emails. You need:

1. A knowledge graph to provide context
2. An evaluation engine to decide what to do
3. A tool layer to execute actions
4. A discovery system to add new tools

All of this runs locally. The only cloud dependency is the tools themselves — GitHub's API, your SMTP server, Slack's webhooks. The intelligence, the memory, the reasoning — all local.

This is sovereign AI execution. Not because it is offline. But because it is yours.

---

## Conclusion

`objective05-exec` is the bridge between understanding and action. It takes everything the knowledge graph has learned — contradictions, divergences, trends, events — and turns them into real-world outcomes: PRs filed, emails sent, reports written, channels notified.

It's built on the same principles that drove Objective05: local-first, persistent state, tool-agnostic, and open source. It does not need a cloud subscription. It does not forget what it learned yesterday. And it does not wait to be asked.

The brain is ready. The hands are ready. What it does next is up to what the graph tells it.

---

*This post is part of the ongoing documentation for [Objective05](https://github.com/kliewerdaniel/objective05) — the perpetual local intelligence system. Previous posts: [The Model Is Not the Product: On Building Persistent Intelligence Infrastructure](https://www.danielkliewer.com/the-model-is-not-the-product-on-building-persistent-intelligence-infrastructure), [objective03: A Local News Agency](https://danielkliewer.com/objective03-local-news-agency), [Mastering llama.cpp: Local LLM Integration](https://danielkliewer.com/mastering-llama-cpp-local-llm-integration-guide).*
