---
author: Daniel Kliewer
canonical_url: /blog/2026-11-18-running-zcode-agent-with-local-ai
date: 11-18-2026
description: "ZCode provides an agent harness for working with code, files, repositories, and development workflows. It becomes particularly interesting when you stop treating the model provider as a fixed dependency and connect it to inference infrastructure running on your own hardware."
image: /images/1103011.png
layout: post
title: "Running ZCode Agent with Local AI Models: A Complete Guide to Ollama and llama.cpp"
tags:
  - ZCode
  
---

# Running ZCode Agent with Local AI Models: A Complete Guide to Ollama and llama.cpp


ZCode provides an agent harness for working with code, files, repositories, and development workflows. It becomes particularly interesting when you stop treating the model provider as a fixed dependency and connect it to inference infrastructure running on your own hardware.

I have been experimenting with connecting [ZCode](https://zcode.z.ai/) to locally hosted models, using [Ollama](https://ollama.com/) as the inference backend. My initial configuration uses **LFM3-Omni**, a compact multimodal model from Liquid AI. I am still testing how effectively it operates the ZCode harness, particularly its ability to execute tools and manage multi-step development tasks.

The important part of this experiment is that ZCode supports custom model providers using compatible API protocols. This means that the inference engine does not necessarily need to be hosted by Z.ai, Anthropic, OpenAI, or another commercial provider. It can run locally.

This guide explains how to configure the connection from beginning to end, including:

- Installing and configuring Ollama.
- Connecting Ollama to ZCode through its OpenAI-compatible API.
- Using LFM3-Omni as the initial model.
- Testing an alternative coding model.
- Configuring llama.cpp as an alternative inference backend.
- Verifying API connectivity and tool execution.
- Troubleshooting common integration problems.
- Giving an autonomous coding agent enough information to perform the setup itself.

The objective is a locally controlled development environment in which ZCode provides the agent harness and the model runs on your own machine.

---

## 1. Understanding the architecture

Before installing anything, it helps to understand how the components communicate.

There are three distinct pieces:

**ZCode:** The agent harness. It manages the development workflow, conversations, tools, file operations, and execution environment.

**Ollama or llama.cpp:** The inference server. It loads a model and exposes an API that other applications can call.

**The model:** The actual language model that interprets instructions, generates responses, and determines how to interact with available tools.

The architecture looks like this:

```text
                USER
                  |
                  v
          +---------------+
          |    ZCode      |
          |  Agent Harness|
          +---------------+
                  |
                  | OpenAI-compatible API
                  |
                  v
          +---------------+
          | Local Inference|
          |     Server     |
          +---------------+
                  |
             +----+----+
             |         |
             v         v
          Ollama    llama.cpp
             |         |
             +----+----+
                  |
                  v
             LOCAL MODEL
                  |
                  v
          Generated Responses
          and Tool Instructions
                  |
                  v
             ZCode Agent
```

Ollama and llama.cpp are alternative inference backends. You do not need both running simultaneously.

The important integration point is the API endpoint. ZCode sends requests to the inference server, and the inference server returns model responses using a compatible API format.

This separation makes the configuration relatively portable. You can change the inference backend or model without fundamentally changing the purpose of the harness.

## 2. Requirements

You will need:

- A computer capable of running a local language model.
- ZCode installed and operational.
- Ollama or llama.cpp.
- An available model compatible with your inference backend.
- Network access between ZCode and the inference server.

I am using an Apple Silicon MacBook Pro with 48 GB of unified memory for my experiments.

The same general configuration works on Linux and Windows, although installation instructions and hardware acceleration will differ.

For the purposes of this guide, we will use the following default endpoints:

| Component | Default endpoint |
|---|---|
| Ollama API | `http://localhost:11434` |
| Ollama OpenAI API | `http://localhost:11434/v1` |
| llama.cpp server | `http://localhost:8080` |
| llama.cpp OpenAI API | `http://localhost:8080/v1` |

These are local endpoints. If ZCode is running on a different machine, you must configure the appropriate reachable address instead of `localhost`.

## 3. Install Ollama

Ollama is the easiest starting point because it handles model downloads, model management, inference, and API serving.

Download Ollama:

https://ollama.com/download

Install the application for your operating system.

Once installed, open a terminal and verify that it is available:

```bash
ollama --version
```

Check whether the local server is responding:

```bash
curl http://localhost:11434/api/version
```

You should receive a JSON response containing the Ollama version.

Ollama normally starts its local API automatically when its application or service is running.

### Download LFM3-Omni

My initial ZCode configuration uses LFM3-Omni.

Download the model:

```bash
ollama pull lfm3-omni
```

Start it:

```bash
ollama run lfm3-omni
```

You can now interact with the model directly through the terminal.

For a basic test, enter:

```text
Explain what a software development agent harness does.
```

Exit the interactive session when finished.

Verify that the model is installed:

```bash
ollama list
```

You should see `lfm3-omni` in the model list.

LFM3-Omni is interesting because it is designed for multimodal interaction, including audio, images, and language. It also supports multimodal tool-calling scenarios.

However, multimodal capabilities should not be confused with coding-agent performance. A model can be good at understanding images or audio without necessarily being particularly reliable at executing complicated software development workflows.

That is one of the things I am investigating with this configuration.

## 4. Verify the Ollama API

Before configuring ZCode, verify that the model can be reached through the API.

Ollama exposes an OpenAI-compatible API at:

```text
http://localhost:11434/v1
```

Test it with curl:

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{
    "model": "lfm3-omni",
    "messages": [
      {
        "role": "user",
        "content": "Explain what a local AI agent is in one paragraph."
      }
    ],
    "stream": false
  }'
```

The expected result is a JSON response containing the model's generated message.

The `ollama` authorization value is a placeholder for this local connection. Standard local Ollama API access does not require an API key.

If this request works, you have established that:

1. Ollama is running.
2. The model is installed.
3. The API endpoint is reachable.
4. The model can generate responses through the OpenAI-compatible interface.

You have not yet verified that ZCode can use its tools successfully. That requires the next step.

## 5. Configure ZCode to use Ollama

This is the central part of the integration.

ZCode supports custom providers that implement the Anthropic or OpenAI API protocols. Ollama exposes an OpenAI-compatible API, so we can use the OpenAI protocol to connect it.

Official documentation:

https://zcode.z.ai/en/docs/configuration

### Step 1: Open Model Settings

Launch ZCode.

Open the model selector inside the chat interface.

Select:

```text
Manage Models
```

This opens the Model Settings panel.

### Step 2: Add a custom provider

Find the option to add a provider.

Create a new provider with the following configuration:

| Setting | Value |
|---|---|
| Provider name | Ollama Local |
| API protocol | OpenAI Compatible |
| API Base URL | `http://localhost:11434/v1` |
| API Key | `ollama` |

The exact appearance of the settings panel may change between ZCode versions.

The important configuration is that the provider uses the OpenAI protocol and points to Ollama's `/v1` endpoint.

Do not append `/chat/completions` to the base URL. The application handles the API route.

### Step 3: Add the model

After creating the provider, select Add Model.

Enter:

```text
lfm3-omni
```

The model identifier must match the identifier returned by:

```bash
ollama list
```

If your Ollama installation reports a different model tag, use that exact identifier.

Save the configuration.

Enable the provider and select the model in ZCode's model selector.

### Step 4: Start a new conversation

Start a new ZCode conversation using the Ollama provider.

Try a simple instruction:

```text
Inspect the current project directory and explain its structure.
Do not modify any files.
```

If ZCode receives a response, the basic integration is working.

At this point, you have successfully connected a locally hosted model to the ZCode harness.

The next step is determining how well the model actually performs.

---

## 6. Choosing another model to test the harness

I would not limit testing to LFM3-Omni.

The best way to evaluate an agent harness is to test it with models that have different strengths and compare their behavior under identical conditions.

For a coding-agent experiment, I would start with a dedicated coding model.

### Recommended: GLM-4.7-Flash

Ollama's coding-model recommendations include GLM-4.7-Flash, Qwen3-Coder, and GPT-OSS 20B.

I would use GLM-4.7-Flash as the first alternative to LFM3-Omni.

Download it:

```bash
ollama pull glm-4.7-flash
```

Verify the installation:

```bash
ollama list
```

In ZCode, add another model under your existing Ollama provider:

```text
glm-4.7-flash
```

This lets you switch between the two models without changing the API configuration.

GLM-4.7-Flash is particularly interesting as a coding-agent test because it provides a more directly relevant comparison for repository analysis, code generation, and multi-step development tasks.

Ollama's published guidance recommends approximately 64K context for coding tools. Its published hardware guidance for GLM-4.7-Flash estimates around 23 GB of VRAM for a 64K context configuration. Actual memory consumption depends on quantization, context allocation, and hardware.

### Alternative: Qwen3-Coder

Another useful candidate is Qwen3-Coder.

For a smaller local deployment, try:

```bash
ollama pull qwen3-coder:30b
```

Then add the exact model identifier to ZCode.

Qwen3-Coder is worth testing because coding-agent workloads depend heavily on the model's ability to interpret repository context, generate structured changes, and use tools consistently.

### Model comparison

| Model | Primary reason to test |
|---|---|
| LFM3-Omni | Your initial configuration; multimodal capabilities |
| GLM-4.7-Flash | Dedicated coding-agent evaluation |
| Qwen3-Coder 30B | Coding and tool-use comparison |
| GPT-OSS 20B | Additional general-purpose reasoning baseline |

I would begin with LFM3-Omni and GLM-4.7-Flash rather than downloading everything at once.

The purpose is not simply to find the model that generates the best code. It is to identify which model operates the ZCode harness most reliably.

A model that writes excellent code but repeatedly fails to invoke tools correctly is not necessarily the best agent model.

---

## 7. Alternative setup: Using llama.cpp instead of Ollama

Ollama is convenient, but it is not the only way to run local models.

You can also use llama.cpp.

This is particularly useful if you want more direct control over model loading, GGUF quantization, context allocation, inference parameters, and server configuration.

The important feature is that llama.cpp includes an HTTP server that exposes an OpenAI-compatible API.

That means ZCode can connect to it using essentially the same approach.

### Step 1: Install llama.cpp

Official repository:

https://github.com/ggml-org/llama.cpp

On macOS, one installation option is Homebrew:

```bash
brew install llama.cpp
```

Verify the installation:

```bash
llama-server --version
```

Depending on your installation, the server executable may also be available as `llama-server` or through the newer `llama serve` command.

For this guide, the examples use the `llama-server` executable.

### Step 2: Obtain a GGUF model

llama.cpp works with GGUF model files.

You can download GGUF models from Hugging Face or use llama.cpp's Hugging Face integration.

For example, LFM3-Omni has an official GGUF distribution:

https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF

One way to launch it is:

```bash
llama-server \
  -hf LiquidAI/LFM3-Omni-2B-GGUF:Q4_K_M \
  --reasoning off \
  --temp 0 \
  --host 127.0.0.1 \
  --port 8080
```

This example follows the model publisher's recommended setup for LFM3-Omni.

The model publisher specifies llama.cpp version b11960 or newer for this model. Its documentation also identifies the model as non-reasoning and recommends disabling reasoning mode for this configuration.

If you already have a GGUF file downloaded, you can instead launch it directly:

```bash
llama-server \
  -m /path/to/model.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  -c 32768
```

Here, `-c` specifies the context size.

Adjust the context size based on the model's supported context length and available memory.

For larger coding projects, a larger context can be useful, but it also increases memory requirements.

### Step 3: Verify the llama.cpp server

Once the server starts, it should expose its API at:

```text
http://localhost:8080
```

The OpenAI-compatible API base URL is:

```text
http://localhost:8080/v1
```

Test it:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Explain the purpose of an agent harness."
      }
    ],
    "stream": false
  }'
```

If you have configured an API key when starting the server, include the corresponding Bearer token in the request.

Otherwise, a key is not required by the standard local server configuration.

### Step 4: Connect llama.cpp to ZCode

Return to ZCode's Model Settings.

Add another custom provider.

Use these settings:

| Setting | Value |
|---|---|
| Provider name | llama.cpp Local |
| API protocol | OpenAI Compatible |
| API Base URL | `http://localhost:8080/v1` |
| API Key | `ollama` or another placeholder if the client requires one |

If your llama.cpp server was started with `--api-key`, enter the actual configured key instead.

Add the model using the model identifier reported by the server or the configured model alias.

Save and enable the provider.

Select the model and start a new conversation.

You now have an alternative inference backend available to the same ZCode harness.

### Why use llama.cpp?

There are some practical reasons to choose llama.cpp:

- Direct control over GGUF model files.
- Explicit control over context allocation.
- Quantization selection.
- Hardware acceleration configuration.
- More direct control over server parameters.
- Ability to experiment with model variants without depending on Ollama's model packaging.

Ollama is generally easier to manage. llama.cpp is useful when you want to control more of the inference stack yourself.

---

## 8. Testing whether the model can actually operate ZCode

This is arguably the most important part of the experiment.

Successfully connecting an API does not establish that a model is capable of operating an agent harness.

The model needs to do more than generate plausible text.

It needs to interact with the tools exposed by ZCode, interpret their results, and decide what to do next.

I would test the configuration in stages.

### Test 1: Basic instruction following

Prompt:

```text
Inspect the current repository.

Identify the primary programming language,
the project structure, and the main entry point.

Do not modify any files.
```

Evaluate whether the model:

- Understands the instruction.
- Uses the appropriate inspection tools.
- Reports actual repository contents.
- Avoids inventing files or directories.

### Test 2: File inspection

Prompt:

```text
Find the primary configuration file in this repository.

Read it and explain the project's configuration.
Do not modify anything.
```

This tests whether the model can navigate the filesystem and retrieve relevant information.

### Test 3: Multi-step execution

Prompt:

```text
Inspect the repository.

Identify one small, clearly isolated improvement
that can be made without changing the project's
fundamental architecture.

Explain the proposed change before implementing it.
```

This tests whether the model can inspect a project, reason about its structure, and produce a coherent plan.

### Test 4: Controlled code modification

Use a disposable test repository.

Prompt:

```text
Create a small Python program that implements
a function for calculating the factorial of an integer.

Include input validation and unit tests.

Run the tests and report the results.
```

Evaluate whether the model can:

1. Create the files.
2. Implement the function.
3. Write the tests.
4. Execute the tests.
5. Interpret failures.
6. Correct mistakes.
7. Report the actual result.

### Test 5: Error recovery

Introduce a deliberate test failure in a disposable repository.

Ask the model to diagnose and correct it.

This is important because agent performance is not just about successful execution. It is also about how the model responds when an operation fails.

### Test 6: Long-running task management

Give the model a moderately complicated task involving several files.

Observe whether it:

- Maintains the original objective.
- Remembers previous decisions.
- Uses tools appropriately.
- Avoids repeatedly performing the same operation.
- Recognizes when the work is complete.
- Provides a meaningful final report.

---

## 9. Troubleshooting

There are several problems worth checking when connecting local inference servers to ZCode.

### Connection refused

Example:

```text
ECONNREFUSED
```

This usually means the inference server is not running or ZCode cannot reach the configured address.

Check Ollama:

```bash
curl http://localhost:11434/api/version
```

Check llama.cpp:

```bash
curl http://localhost:8080/health
```

Make sure the server is running and that the configured port matches the provider settings.

### SSL WRONG_VERSION_NUMBER

Example:

```text
ERR_SSL_WRONG_VERSION
```

This is particularly important when configuring local providers.

A local Ollama or llama.cpp server normally uses HTTP, not HTTPS.

Correct:

```text
http://localhost:11434/v1
```

Incorrect:

```text
https://localhost:11434/v1
```

Do not use HTTPS unless you have explicitly configured TLS termination for the endpoint.

### Model not found

If ZCode reports that a model does not exist, verify the exact model identifier:

```bash
ollama list
```

The identifier configured in ZCode must match the model name exposed by the inference server.

### API connection works, but tools do not

This is a different problem from connectivity.

A model may return ordinary chat responses successfully but fail when asked to use tools.

Possible causes include:

- The model does not reliably generate tool calls.
- The model's tool-call format is incompatible with the API implementation.
- The model is not following the tool schemas correctly.
- The server does not support a required API feature.
- The harness is sending parameters that the local server does not support.

Try a model specifically intended for coding and agent workflows.

Compare the results using the same prompt and repository.

### Context limitations

Coding agents can consume substantial context when reading large repositories.

A model may appear to work initially and then become unreliable during longer sessions.

Check the model's context capabilities and the inference server's context allocation.

ZCode also has its own context-window settings for custom providers. Its documentation explains how custom-provider context settings and automatic compaction work.

Do not assume that increasing ZCode's configured context automatically increases the context allocated by Ollama or llama.cpp. Both sides must be configured consistently.

### Model loads but runs slowly

Check:

- Whether hardware acceleration is working.
- Whether the model fits in available memory.
- Whether the context allocation is excessive.
- Whether the model is partially offloaded to system memory.
- Whether another inference server is consuming resources.

Start with a smaller quantization or a smaller context window if necessary.

---

## 10. Security and local deployment considerations

One of the primary advantages of this architecture is the ability to run inference locally.

However, local inference does not automatically mean that every component of the application is local.

ZCode may still communicate with external services for account functionality, application services, or other features.

The inference requests can be directed to your own machine, but you should independently verify which other application components communicate externally.

A few practical precautions:

- Keep local inference servers bound to `127.0.0.1` when remote access is unnecessary.
- Do not expose Ollama's unauthenticated local API directly to the public internet.
- Do not expose llama.cpp without an appropriate access-control configuration.
- Use authentication and network restrictions if another machine needs access.
- Avoid putting private credentials into prompts or test repositories.
- Use disposable repositories when testing file modification and execution behavior.

The distinction between local inference and complete application sovereignty matters.

Running the model locally gives you control over the inference component. It does not, by itself, establish that the entire agent environment is isolated from external infrastructure.

---

## 11. An implementation checklist for autonomous agents

The following checklist is intended for an autonomous coding agent or a human following the installation procedure.

It can be used as an operational setup specification.

### Environment discovery

- [ ] Identify the operating system.
- [ ] Identify the available hardware and memory.
- [ ] Check whether ZCode is installed.
- [ ] Check whether Ollama or llama.cpp is installed.
- [ ] Check whether the inference server is running.
- [ ] Determine which local ports are available.

### Ollama installation

- [ ] Install Ollama if necessary.
- [ ] Verify the Ollama version.
- [ ] Verify the local API.
- [ ] Download `lfm3-omni`.
- [ ] Verify the model appears in `ollama list`.
- [ ] Test model generation using the API.

### ZCode configuration

- [ ] Open Model Settings.
- [ ] Add a custom OpenAI-compatible provider.
- [ ] Set the base URL to `http://localhost:11434/v1`.
- [ ] Configure the local API key field if required.
- [ ] Add the exact installed model identifier.
- [ ] Enable the provider.
- [ ] Select the model.
- [ ] Start a new session.
- [ ] Verify that ZCode receives a response.

### Agent validation

- [ ] Test repository inspection.
- [ ] Test file reading.
- [ ] Test tool invocation.
- [ ] Test controlled file creation.
- [ ] Test command execution.
- [ ] Test error recovery.
- [ ] Test a multi-step development task.
- [ ] Record failures and limitations.

### Alternative inference backend

- [ ] Install llama.cpp.
- [ ] Obtain a compatible GGUF model.
- [ ] Start the HTTP server.
- [ ] Verify the `/v1` API.
- [ ] Add a second provider to ZCode.
- [ ] Repeat the agent validation tests.

### Final acceptance criteria

The setup should not be considered complete simply because the model responds to a chat message.

A successful deployment should demonstrate:

1. Reliable API communication.
2. Successful model selection.
3. Correct tool invocation.
4. Accurate interpretation of tool results.
5. Controlled file modification.
6. Successful command execution.
7. Appropriate error recovery.
8. Consistent behavior across multiple steps.

If these conditions are not met, record the specific failure rather than treating the installation as fully operational.

---

## 12. Where this experiment goes next

I am currently using LFM3-Omni with Ollama as the initial configuration for ZCode.

The next step is comparing its performance against more specialized coding models, particularly GLM-4.7-Flash and Qwen3-Coder.

There are several interesting questions worth investigating:

- How much of the harness's performance depends on the underlying model?
- Can a relatively small model reliably operate a more sophisticated agent environment?
- Does multimodal capability provide any practical advantage in a coding harness?
- How well do local models handle structured tool calls?
- How does inference latency affect multi-step execution?
- Does llama.cpp offer meaningful advantages over Ollama for this particular workload?
- Can the same agent workflow be reproduced across different local inference backends?

The broader architectural point is that an agent harness and its inference provider do not need to be the same product.

ZCode can provide the orchestration layer while Ollama or llama.cpp provides the inference layer. The model itself becomes replaceable.

This is an important distinction when designing local-first AI systems.

Rather than treating a particular hosted model API as a permanent dependency, the inference layer can be treated as an interchangeable component behind a defined interface.

That makes it possible to experiment with different models, quantizations, hardware configurations, and inference engines without rebuilding the entire development environment.

**The goal is not simply to run a chatbot locally. It is to run an actual agent workflow locally, with the ability to control and evaluate the model that operates it.**

---

## References

- ZCode model configuration: https://zcode.z.ai/en/docs/configuration
- Ollama: https://ollama.com/
- Ollama API documentation: https://github.com/ollama/ollama/blob/main/docs/api/introduction.mdx
- Ollama OpenAI compatibility: https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx
- Ollama model library: https://ollama.com/library
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LFM3-Omni model: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- GLM-4.7-Flash: https://ollama.com/library/glm-4.7-flash
- Qwen3-Coder: https://ollama.com/library/qwen3-coder

