---
author: Daniel Kliewer
canonical_url: /blog/2026-10-23-llmjacking-the-skynet-mode-recursive-threat
date: 10-23-2026
description: "A deep dive into 'LLMjacking'—where autonomous agents hijack exposed LLMs to drive their own attacks. We deconstruct the architecture of recursive agents, 'Skynet mode' autonomy, and how a stolen brain becomes the primary attacker."
image: /images/llmjacking-skynet.png
layout: post
title: "LLMjacking: Building the 'Skynet Mode' Recursive Attacker"
og:description: "How to build a recursive LLM agent that hijacks exposed endpoints, scans for targets, and uses the stolen brain to run attacks for 100,000 steps."
og:image: /images/llmjacking-skynet.png
og:title: "LLMjacking: Building the 'Skynet Mode' Recursive Attacker"
og:type: article
og:url: /blog/2026-10-23-llmjacking-the-skynet-mode-recursive-threat
tags:
  - ai-security
  - autonomous-agents
  - llm
  - cybersecurity
  - skynet
twitter:card: summary_large_image
twitter:description: "We deconstruct the 'Skynet mode' agent: hijacking exposed LLMs to drive recursive network attacks."
twitter:image: /images/llmjacking-skynet.png
twitter:title: "LLMjacking: Building the 'Skynet Mode' Recursive Attacker"
---
# LLMjacking: Building the “Skynet Mode” Recursive Attacker
## How Exposed AI Infrastructure Becomes a Control Plane for Autonomous Cybercrime

**By Daniel Kliewer | October 23, 2026**

*The next evolution of AI-enabled cybercrime is not simply an attacker asking a language model to write malicious code. It is an attacker assembling a persistent control loop around stolen inference capacity, then using the model to plan, evaluate, and adapt the next action. The victim supplies the compute. The attacker supplies the objective. The tools turn generated decisions into real-world effects.*

---

## 1. The Architectural Inversion: The Model Becomes the Control Plane

When Symantec reported an offensive AI agent searching the internet for exposed large language model endpoints, the initial description sounded familiar. Automated reconnaissance, vulnerability exploitation, credential harvesting, and cryptocurrency mining are established components of cybercrime. None requires artificial intelligence to exist.

What makes this case important is how those components were assembled.

According to [Symantec's investigation, reported by Help Net Security on October 23, 2026](https://www.helpnetsecurity.com/2026/10/23/llmjacking-agent-hijacks-exposed-ai-models/), researchers captured the operating instructions of an agent designed to find exposed AI services, use an accessible model to drive offensive operations, and continue working without requesting human approval. The captured instructions specified up to 100,000 steps. The research also described tooling for reconnaissance, web application exploitation, credential collection, database access, and cryptocurrency mining.

The researchers did not observe a complete, successfully executed 100,000-step campaign. They captured the instructions through a honeypot designed to impersonate an exposed AI service. That distinction matters. The evidence demonstrates a concrete offensive design and associated activity, not proof that every capability described in the prompt was successfully executed.

Nevertheless, the architecture deserves serious attention because it exposes a structural weakness in how we deploy AI systems.

We have spent years treating language models as interfaces. A user supplies a request, a model produces a response, and a person decides what happens next. Tool-enabled agents change that relationship. The model can select a tool, receive its output, interpret the result, and choose another action. A surrounding application can repeat this cycle until a task is complete or a stopping condition is reached.

Once that loop is connected to external systems, generated text becomes a potential source of operational decisions.

The fundamental distinction is between a model that describes an action and a system that executes one.

A language model does not need to possess operating system privileges internally. It does not need to understand a network in the same way that a human security engineer does. It only needs access to an orchestration layer that translates its outputs into actions using the privileges of the surrounding process.

That is the architectural inversion.

The model supplies probabilistic decision-making. The orchestrator supplies persistence and state. The tools supply capabilities. The execution environment supplies access to real systems.

The resulting system can behave autonomously even though no individual component is independently autonomous in the broader sense.

This is why I think the most important security question is not whether a model is intelligent enough to conduct an attack. It is whether the system around the model allows its outputs to become actions without independent authorization.

## 2. What LLMjacking Actually Means

LLMjacking is the unauthorized use of another party's large language model infrastructure. It overlaps with traditional account compromise, API abuse, and cryptojacking, but it introduces a distinct resource into the attacker's economic model: inference capacity.

In a conventional cryptojacking operation, an attacker compromises computing infrastructure and uses its processor or graphics processor to mine cryptocurrency. The victim absorbs electricity, hardware wear, cloud charges, and reduced system performance.

LLMjacking redirects that same economic principle toward AI inference.

The target might be a self-hosted model server, a gateway connected to commercial model providers, an API credential exposed in a repository, or an AI service deployed without adequate access controls.

The attacker does not necessarily need to compromise the underlying model weights. In many cases, access to the inference interface is sufficient.

The distinction is important. A stolen API credential can grant access to a model without giving the attacker ownership of that model. An exposed self-hosted endpoint can allow unauthorized inference without granting administrative control of the machine running it. A compromised tool-enabled agent can create a more serious situation in which model access becomes a route into other systems.

These are related but separate security failures.

There are at least four economic and operational incentives for LLMjacking:

1. **Compute theft.** The operator shifts the cost of inference onto a third party.
2. **Credential and data exposure.** An inadequately protected service may expose conversation history, application context, or other sensitive information.
3. **Unauthorized resale.** Stolen access can be aggregated and resold through intermediaries.
4. **Operational leverage.** An accessible model can provide reasoning and planning capacity to an agent that already has offensive tools.

The first three have been documented in research on criminal exploitation of AI infrastructure. In January 2026, [Pillar Security published research on Operation Bizarre Bazaar](https://www.pillar.security/blog/operation-bizarre-bazaar-first-attributed-llmjacking-campaign-with-commercial-marketplace-monetization), describing a campaign that targeted exposed LLM and Model Context Protocol endpoints and monetized unauthorized access through a commercial marketplace.

That investigation reported approximately 35,000 attack sessions during its observation period. Its findings illustrate that LLMjacking is not limited to a hypothetical future in which fully autonomous agents become common. The unauthorized access and commercialization of AI infrastructure already form part of the threat landscape.

The fourth incentive is the more consequential development examined here.

An attacker who steals access to a model for ordinary inference can use it to generate text, code, or other outputs. An attacker who connects that model to an orchestration system can potentially use the same stolen inference capacity to select and coordinate subsequent operations.

The resource being stolen is no longer just a service that answers questions. It becomes one component in an operational control loop.

## 3. The Recursive Attacker: A System, Not a Single Model

The term *recursive attacker* can sound more mysterious than the architecture actually is.

There is no need to assume that a model has developed independent intentions, acquired consciousness, or spontaneously decided to compromise other systems. A recursive agent can be implemented using ordinary application logic, repeated model calls, a collection of tools, and persistent state.

The recursion exists at the system level.

An orchestrator presents a task to the model. The model proposes an action. An execution layer performs an authorized operation and returns its result. The orchestrator updates the task state and provides relevant information to the model again. The model then proposes another action.

The cycle repeats.

At each iteration, the next decision is informed by the previous result. The agent can therefore adapt to changing conditions instead of following a completely predetermined sequence.

This is a meaningful capability, but it is not the same as self-improvement in the technical sense of modifying its own weights or reliably increasing its general intelligence. A system can become more adaptive within a task without changing the model itself.

That distinction helps separate what is demonstrated from what is merely suggested by terms such as *Skynet mode*.

A recursive agent can exhibit several properties that make it operationally dangerous:

- **Persistence:** It continues working across many model calls.
- **Statefulness:** It retains information about earlier actions and results.
- **Feedback:** It uses observed outcomes to select subsequent actions.
- **Tool access:** It can invoke functions that interact with external systems.
- **Goal persistence:** It continues pursuing an objective until a stopping condition is met.
- **Delegated execution:** It can perform actions without requiring a person to approve every individual step.

None of these properties alone is inherently malicious. They are also useful in software testing, research automation, infrastructure management, and local-first AI applications.

The risk emerges from their combination with unauthorized objectives, excessive permissions, insufficient isolation, and weak control over execution.

This is the central engineering lesson: a system can be dangerous because of how its components are connected, even when every component is individually ordinary.

## 4. The Four-Layer Architecture

A useful way to analyze this class of threat is to separate the system into four layers.

### Layer One: The Control Plane

The control plane maintains the task, selects when to call the model, manages iteration limits, and decides how the system responds to tool results.

It is the application logic surrounding the model.

In a legitimate agent, this layer should enforce the task's boundaries. It should determine which actions are available, which require approval, how much work can be performed, and when the process must stop.

In an offensive agent, the same general architecture can be used to sustain a malicious task.

The important observation is that the control plane does not have to be sophisticated. It can be a relatively small program that coordinates model requests and tool execution. The model contributes flexible decision-making, while the orchestrator supplies the machinery needed to repeat that decision-making indefinitely.

This separation also explains why model quality alone is not a reliable measure of system security.

A weaker model connected to unrestricted execution can still cause damage. A stronger model connected to well-defined, tightly constrained tools can be substantially safer to operate.

The security boundary belongs to the entire system, not merely to the inference engine.

### Layer Two: The Reasoning Engine

The reasoning engine interprets the current task and proposes the next action.

In the LLMjacking scenario, the reasoning engine may be hosted by someone other than the attacker. The attacker supplies the objective and surrounding instructions, while the victim supplies the inference capacity.

This arrangement creates an unusual separation of ownership.

The model provider or infrastructure owner controls the service, but the unauthorized operator attempts to control how it is used. The person paying for inference may have little visibility into the actual purpose of the requests.

The model's output may include structured data or a proposed tool call. That output is then interpreted by the application surrounding it.

This is where a common security misconception becomes dangerous.

Structured output is not equivalent to safe output. JSON is a serialization format, not an authorization mechanism. A syntactically valid function call can still request an impermissible action.

Similarly, a model's explanation of why an action is necessary does not establish that the action is legitimate.

A secure architecture must validate both the structure of the proposed operation and the authority under which it would be performed.

### Layer Three: The Tool and Execution Layer

Tools connect the model's decisions to external capabilities.

Depending on the application, those tools might read files, search the web, inspect source code, query databases, modify documents, execute tests, or invoke operating system functions.

The danger is proportional not simply to the number of tools available, but to their combined authority and the context in which they execute.

A read-only search function has a different risk profile from a general-purpose shell. A database query restricted to a single authorized table is different from a database connection with unrestricted write privileges. A narrowly scoped deployment function is different from an agent that can change its own infrastructure.

The execution layer is where an abstract model decision acquires real consequences.

If a model proposes an unsafe action but the executor rejects it, the system remains within its security boundary. If the executor blindly accepts every proposed action, the model's output becomes a route around conventional application controls.

This is the fundamental failure mode behind insecure output handling and excessive agency.

[OWASP's guidance on excessive agency](https://owasp.org/www-project-top-10-for-large-language-model-applications/) identifies excessive functionality, excessive permissions, and excessive autonomy as important sources of risk in LLM applications.

These are not merely prompt-engineering problems. They are failures of system design.

### Layer Four: The Resource and Network Environment

The final layer includes the infrastructure on which the system operates.

It may contain model servers, API credentials, local files, databases, network connections, cloud identities, and compute resources.

The environment determines what the agent can actually reach.

A model that proposes a malicious operation but runs inside a properly isolated environment with no access to sensitive credentials, no unrestricted network connectivity, and no privileged execution path has limited capacity to cause damage.

A model connected to a host process with broad filesystem access, inherited credentials, and unrestricted outbound connectivity presents a different problem.

This is why network segmentation, least privilege, and process isolation remain important even when an application is described as AI-native.

The model does not replace the operating system's security model. It operates through it.

If the surrounding application can access a resource, the agent may be able to access that resource indirectly through the application's tools.

That is the boundary defenders need to understand.

## 5. Why the 100,000-Step Limit Matters

The reported agent's instruction set specified up to 100,000 steps without requiring human approval.

That number should not be interpreted as proof that the agent completed 100,000 successful actions. It describes an intended operational allowance, not a verified campaign outcome.

Its significance is architectural.

A system permitted to execute a large number of unattended steps can accumulate substantial impact even when the probability of success for any individual action is modest.

Suppose an automated system performs a sequence of independent actions, each with some probability of producing an undesirable outcome. As the number of actions increases, the probability of encountering at least one failure also increases.

For a simplified model in which each action has an independent failure probability \(p\), the probability of at least one failure after \(n\) actions is:

\[
P(\text{at least one failure}) = 1-(1-p)^n
\]

This is an illustrative model, not a prediction of real attack success. In actual systems, actions are dependent, failure probabilities vary, and successful actions can change the environment in ways that affect subsequent outcomes.

Nevertheless, the principle is straightforward: a small per-action risk can become consequential when repeated many times without meaningful supervision.

The more important problem is that the impact of an agent's actions may not be independent either.

An early action might expose a credential. A later action might use that credential to reach another system. A subsequent action might create persistent access or consume additional compute resources. The system's state changes as the task progresses.

This creates the possibility of compounding consequences.

A long-running agent can also generate a large volume of activity before a human notices that something is wrong. Rate limits, logging, and monitoring can reduce that window, but they are most effective when combined with controls that prevent unauthorized actions in the first place.

The appropriate response is not to ban long-running agents categorically. It is to treat autonomy as a budgeted capability.

An agent should have explicit limits on runtime, model expenditure, tool calls, data access, and the classes of actions it may perform. Those limits should be enforced outside the model and should remain effective even if the model's instructions are manipulated.

The ability to continue working is a feature. The ability to continue working without meaningful boundaries is a vulnerability.

## 6. The Hunting Problem: Exposed AI as an Attack Surface

The first problem for an LLMjacking operator is finding an accessible service.

AI infrastructure has proliferated across developer workstations, cloud deployments, internal tools, research environments, and production applications. Different services may expose different interfaces, but many support broadly compatible API patterns.

This creates opportunities for automated discovery and makes configuration errors particularly consequential.

Self-hosted inference servers are frequently deployed for local experimentation. Developers may bind a service to a network interface to make it accessible from another machine, connect it to an internal application, or test a remote client. A temporary development configuration can remain in place after the experiment ends.

A service intended to be local can consequently become reachable from a wider network than its operator intended.

The same problem appears in reverse proxies, API gateways, development containers, and cloud security groups. A model server may not have authentication of its own, while the operator assumes that the surrounding network will provide sufficient protection.

That assumption is only valid if the network boundary is actually enforced.

Pillar Security's January 2026 research documented systematic targeting of exposed AI infrastructure, including self-hosted model services and MCP endpoints. Its findings reinforce the need to treat AI endpoints as part of the external attack surface rather than as obscure development utilities.

There is no reason to assume that an obscure service will remain obscure.

Once an endpoint becomes reachable, it can be discovered through automated scanning, indexed by infrastructure-search services, or identified by attackers probing common service configurations.

The defense is therefore not to rely on the endpoint being difficult to find. It is to ensure that discovery does not grant access.

Every externally reachable interface should have an explicit security model. Every service should expose only the functionality required for its intended purpose. Every credential should be scoped to the minimum necessary authority.

For internal services, the preferred default is simple: do not expose them publicly unless public exposure is a deliberate, justified requirement.

For public services, authentication, authorization, rate limiting, quotas, and monitoring must be designed into the deployment from the beginning.

Security through obscurity is particularly weak when the target is a service category that can be recognized through automated discovery.

## 7. Prompt Injection Is Not the Same as Infrastructure Compromise

The captured instructions reportedly used elaborate persona manipulation, attempts to suppress refusal behavior, and directives that framed access to sensitive configuration data as ordinary development work.

These details are relevant, but they need to be interpreted correctly.

A jailbreak attempts to influence a model's behavior through instructions. Prompt injection can introduce malicious instructions through direct user input or through untrusted content processed by the model.

Neither automatically grants operating system access.

A model that has no tools cannot execute a shell command merely because a prompt asks it to do so. A model connected to a narrowly scoped tool cannot legitimately exceed that tool's enforced permissions merely because its instructions demand it.

The critical issue is the relationship between instructions and authority.

A model can be manipulated into proposing an action. Whether that proposal becomes a security incident depends on the surrounding system.

If an application treats every model-generated command as trusted, a prompt injection can become a path to unauthorized execution. If the application independently validates permissions and constrains tool behavior, the same prompt injection may produce an incorrect response without compromising the host.

This distinction is central to secure agent design.

Consider a system that summarizes incoming documents. A document could contain text instructing the model to ignore its original task and transmit confidential information elsewhere. The model might follow that instruction if its context and safeguards are inadequate.

If the agent has access to an email-sending tool, the consequences depend on whether that tool independently checks the recipient, the data being sent, and the user's authorization.

A secure implementation should not depend on the model correctly identifying every malicious instruction. It should make unauthorized transmission impossible or require an independent approval step.

This is the principle of complete mediation: every sensitive operation must be checked at the point where the operation is performed.

The same principle applies to file access, database queries, API calls, deployments, and shell execution.

The correct security posture is not to assume that a model will always resist manipulation. It is to assume that model outputs can be wrong, adversarially influenced, or inconsistent with the application's intended policy.

Then build the system so that those outputs cannot independently override the policy.

## 8. The Significance of the Tool Catalogue

The reported agent's prompt contained approximately 74 tool definitions covering different offensive capabilities.

The number itself is less important than the authority represented by the catalogue.

Every tool expands the set of actions the model can propose. When a collection of tools spans reconnaissance, data access, code execution, and persistent operations, the system can potentially coordinate an entire attack sequence through a single orchestration interface.

This is a form of capability aggregation.

A model may not need direct access to every underlying service. It may only need access to functions that expose those services indirectly.

For example, a tool that reads project files may expose source code and configuration. A tool that queries a database may expose records. A tool that executes arbitrary commands may expose nearly every resource accessible to its process. A network tool may allow communication with systems beyond the local environment.

The composition of these capabilities matters more than the apparent simplicity of any individual function.

This is also why general-purpose tools deserve particular scrutiny.

A tool that performs one well-defined operation can enforce strict validation. A tool that accepts arbitrary commands, URLs, queries, or file paths creates a much larger input space and a more difficult security boundary.

The principle is straightforward:

**Give an agent capabilities that correspond to specific authorized tasks, not a general-purpose interface to everything its host can do.**

This does not mean that general-purpose developer tools are inherently unacceptable. They can be useful in isolated development environments where the user deliberately grants that capability.

It means their authority should be proportional to the task and contained within an environment designed to tolerate mistakes.

A code-generation agent running inside a disposable container with synthetic data presents a different risk from the same agent running on a developer workstation with access to personal files, production credentials, and unrestricted network connectivity.

The model may be identical. The security properties of the deployed system are not.

## 9. Cryptocurrency Mining and the Economics of Stolen Inference

The reported campaign included instructions for installing cryptocurrency-mining software. A subsequent request delivered a compressed shell script that the researchers identified as downloading and, where necessary, compiling XMRig, an open-source Monero miner.

The honeypot captured the script without executing it.

The script reportedly searched for directories associated with go2rtc, a video-streaming component used in some camera and home-automation environments, and attempted to place the miner under a concealed filename.

This detail illustrates the relationship between initial access and monetization.

Unauthorized inference can be valuable on its own. A stolen API key can be used for model access or resold. But a compromised service can also become a bridge to other resources, depending on its permissions and network position.

The attacker's economic incentives can therefore operate across several layers:

- The owner of the model service pays for unauthorized inference or absorbs the cost of stolen compute.
- A compromised application may expose data or credentials that have independent value.
- A compromised host may be used for additional computation, including cryptocurrency mining.
- Access to the infrastructure may support further unauthorized activity.

These are different forms of abuse, and they should not be conflated into one undifferentiated claim.

In particular, stealing access to an LLM does not automatically provide the ability to install a miner on the machine hosting it. That transition requires a separate execution capability or an additional compromise.

The important architectural risk is the possibility of chaining these opportunities together.

A model endpoint that is isolated from the host's sensitive resources may suffer unauthorized inference without becoming a route to system compromise. An agent service that exposes privileged tools can present a much larger attack surface.

The difference lies in the boundary between the inference service and the execution environment.

This is where the economic model becomes a security problem. If a stolen resource can be used to discover or access additional resources, the initial compromise may help finance or facilitate subsequent activity.

The system becomes attractive not because AI has invented a new category of crime, but because it can lower the coordination cost of combining established techniques.

## 10. Why Local AI Is Not Automatically Secure AI

Local inference is frequently presented as a security advantage, and in several important respects it is.

Running a model on hardware you control can reduce dependence on external providers, keep sensitive data within a chosen environment, and make inference costs more predictable. It can also allow an operator to inspect and govern the surrounding software stack.

Those advantages are real.

But local inference is a deployment choice, not a complete security architecture.

A model running on a local machine can still be exposed through a network interface. A local agent can still inherit credentials from its environment. A tool server can still grant access to files or databases. A local application can still execute untrusted model output.

If a model server is bound to an address reachable from other machines without appropriate access controls, the fact that its weights reside on locally owned hardware does not prevent unauthorized use.

If an agent can access the user's home directory, local credentials, and unrestricted network connections, keeping inference offline by default does not help when the application subsequently provides those capabilities.

Likewise, a local-first system that uses external tools may transmit data beyond the machine unless those integrations are explicitly constrained.

Local ownership and operational isolation are different properties.

A sovereign AI system should be designed around control of the full execution path: model loading, inference, memory, tool access, network access, persistence, and data handling.

The objective is not simply to eliminate cloud dependencies. It is to make the system's authority explicit and enforceable.

For a local-first deployment, I would begin with the following questions:

- Which network interfaces can reach the inference service?
- Which identities are permitted to use it?
- Which directories can the agent read or modify?
- Which credentials are available to the process?
- Can the agent access the public internet or internal services?
- Which operations require explicit user approval?
- What happens when the model returns malformed output or requests an unauthorized action?
- Can the agent change its own configuration, permissions, or execution environment?
- Can the operator reconstruct what happened after a failure?

If those questions have no clear answers, local ownership has not yet translated into effective governance.

The goal of local-first AI should be more than control over where computation happens. It should include control over what that computation is permitted to do.

## 11. Model Context Protocol and the Expansion of the Attack Surface

Model Context Protocol, or MCP, provides a standardized way for AI applications to connect to external tools and contextual resources.

This is useful because it reduces the amount of custom integration work required to connect models to filesystems, databases, development environments, and other services.

It also creates a security challenge.

An MCP server is not merely a model endpoint. Depending on its implementation, it may expose capabilities that interact with other systems on behalf of the connected application.

The security implications depend on the specific tools, authorization model, deployment, and permissions involved. An MCP server that exposes read-only access to a small set of public documents has a different risk profile from one that can execute commands, modify files, or access production databases.

The protocol itself does not automatically make a deployment insecure. The risk arises when a tool server is exposed or authorized in ways that exceed its intended purpose.

Pillar Security's Operation Bizarre Bazaar research separately documented reconnaissance targeting MCP endpoints. Its findings illustrate that attackers are interested not only in obtaining inference capacity, but also in discovering interfaces that connect AI applications to operational infrastructure.

The distinction matters because an exposed model endpoint and an exposed tool server may have very different consequences.

An inference endpoint may allow someone to consume compute or query a model. A tool endpoint may provide access to data and actions that the model itself could not otherwise reach.

When both are present in the same architecture, the combined risk can be greater than either component's risk considered independently.

For this reason, MCP deployments should follow the same principles as other privileged service integrations:

1. Authenticate clients and authorize individual operations.
2. Keep internal tool servers off the public internet unless external exposure is explicitly required.
3. Scope access to the specific resources needed for each task.
4. Avoid granting broad filesystem, shell, or database privileges to convenience integrations.
5. Treat tool descriptions and returned content as potentially untrusted inputs.
6. Record sensitive operations and provide a way to revoke access quickly.
7. Separate read capabilities from write capabilities wherever practical.

The most important principle is that a protocol standardizes communication, not trust.

A well-designed integration can improve interoperability without weakening security. A poorly configured integration can turn a convenient AI interface into a bridge across an organization's existing security boundaries.

## 12. A Better Security Model: The Agent Proposes, the Schema Decides, the Executor Verifies

The recurring mistake in agent architecture is allowing the model to become the ultimate authority over its own actions.

A system asks the model what to do, accepts the answer, executes it, and then asks the model what to do next. If the only barrier to an unsafe action is the model's own willingness to refuse, the security policy has been delegated to the component most directly influenced by the task's instructions.

That is not an adequate security boundary.

A stronger architecture separates decision-making from authorization.

**The agent proposes. The schema decides. The executor verifies.**

The agent proposes an action based on the task and available context. The proposal is represented in a structured format with a clearly defined set of permitted operations and parameters.

A deterministic policy layer evaluates that proposal against independently enforced rules. It checks the requested operation, the relevant identity, the resource being accessed, the current task, and whether additional authorization is required.

The executor then performs the operation only if the policy layer permits it.

This architecture changes the role of the model.

The model can remain flexible in how it plans a task, but it cannot unilaterally expand its own authority. It can suggest a new operation, but that suggestion does not create permission to perform it.

A tool schema can restrict an operation to specific fields, but schema validation alone is insufficient. A perfectly valid request can still be unauthorized. The policy layer must check the meaning and scope of the requested action.

Similarly, the executor should enforce security constraints independently rather than relying on the model to describe its intentions accurately.

For example, a file-reading tool might accept a logical resource identifier rather than an arbitrary filesystem path. The application can resolve that identifier against a fixed set of approved resources. A database tool can expose specific read operations instead of accepting unrestricted SQL. A deployment tool can permit changes only to designated environments and require approval for production operations.

These restrictions reduce the number of ways a model output can be converted into an unintended action.

The approach also improves auditability. Instead of recording only a conversation transcript, the system can record each proposed operation, the policy decision, the identity under which it ran, the resulting effect, and the reason an operation was rejected.

This is the difference between an agent that merely explains its actions and a system that can independently demonstrate whether those actions were authorized.

## 13. Deterministic Governance and the Limits of Prompt-Based Safety

Prompt instructions are useful for communicating a task, establishing context, and encouraging a model to behave predictably.

They are not a substitute for access control.

A prompt can ask a model not to read a particular file. A filesystem permission can prevent the process from reading that file at all. A prompt can ask the model not to send information to an external service. A network policy can block the connection. A prompt can ask an agent not to delete data. A downstream authorization layer can reject deletion requests unless the correct approval is present.

These mechanisms operate at different levels.

Prompt-level restrictions influence behavior. Deterministic enforcement constrains what the system can actually do.

Both can be valuable, but they should not be treated as interchangeable.

A secure agent needs a boundary that remains effective when the model behaves unexpectedly. That includes cases in which the model misunderstands a task, follows malicious instructions embedded in retrieved content, generates malformed output, or proposes an operation that exceeds its permissions.

This is one reason that deterministic state machines and explicit policy enforcement are useful in agent design.

The system can define permitted states and transitions. It can require preconditions before an operation is available. It can reject invalid transitions regardless of how convincingly the model argues for them.

For instance, an agent might be permitted to inspect a proposed change in one state, generate a patch in another, run tests in a third, and request approval before deployment. The model can help determine the content of the patch, but it cannot bypass the transition required for deployment.

The same approach applies to financial operations, data deletion, account administration, and other actions with significant consequences.

There is an important qualification: deterministic rules are only as good as their design and implementation. An incorrectly defined permission boundary can consistently enforce the wrong policy. The system still requires testing, threat modeling, monitoring, and review.

But deterministic enforcement makes the security policy inspectable and testable. It gives the operator a concrete place to verify that unauthorized transitions are rejected.

The model's internal confidence or stated intentions do not provide the same guarantee.

## 14. Defense in Depth: Making Unauthorized Recursion Contained and Expensive

No single control can eliminate every risk associated with tool-enabled agents. A robust design combines preventive controls, containment, observability, and recovery.

### Authentication and access control

Every inference endpoint should have an explicit access policy.

Services that are intended to remain private should not be reachable from untrusted networks. Public services should authenticate clients and apply authorization appropriate to the operation being requested.

Authentication must be enforced consistently across the service, including alternate interfaces and management functions. A gateway does not provide meaningful protection if an unprotected backend remains directly reachable.

API credentials should be stored securely, scoped narrowly, and rotated when exposure is suspected.

### Network isolation

Agent execution environments should have only the network access needed for their task.

A research assistant may need access to a small set of approved sources. A code-generation agent may need access to a repository and a package registry. Neither automatically requires unrestricted access to every internal service or the public internet.

Outbound restrictions are especially valuable because they limit what a compromised or manipulated agent can communicate with and download.

Network isolation should be enforced outside the model process so that an instruction cannot simply override it.

### Least privilege

The agent should run under an identity with minimal permissions.

Read-only tasks should use read-only credentials. Access to sensitive data should be limited to the specific resources required. Administrative capabilities should be separated from ordinary task execution.

Credentials should not be inherited unnecessarily from the host environment. Production secrets should not be made available to a development agent simply because they are accessible to the developer's account.

Least privilege limits the consequences of both model errors and conventional application vulnerabilities.

### Sandboxing

Potentially unsafe operations should run inside disposable or tightly constrained environments.

Depending on the task, this can include containers, restricted filesystem mounts, separate operating system identities, resource limits, and isolated network namespaces.

A container alone is not a complete security boundary in every deployment. Its effectiveness depends on configuration, host privileges, exposed sockets, mounted directories, and other available capabilities.

The goal is to reduce the impact of a compromised process, not merely to give it a different packaging format.

### Bounded autonomy

Agents should have explicit limits on runtime, token consumption, tool calls, concurrent tasks, and resource use.

A maximum iteration count is useful, but it should not be the only stopping condition. The system should also recognize repeated failures, abnormal request patterns, unauthorized operations, and resource consumption outside expected limits.

Sensitive actions should require independent authorization. Human approval is particularly important for operations that are difficult to reverse, affect production systems, disclose sensitive data, or change security settings.

The approval mechanism should exist outside the model's control.

### Monitoring and audit

Security monitoring should capture both inference activity and downstream actions.

Useful signals include unexpected request volume, unusual model enumeration, repeated authentication failures, unexplained cost increases, access to sensitive files, abnormal outbound connections, and tool calls inconsistent with the agent's assigned role.

A conversation log alone is insufficient. The system needs to record what was actually executed and whether the operation succeeded.

Logs should be protected from modification by the agent being monitored. Otherwise, the process could potentially alter the evidence needed to investigate its own behavior.

### Recovery and revocation

Operators need a reliable way to disable an agent, revoke its credentials, terminate active sessions, and prevent further tool execution.

A shutdown mechanism that depends on the model cooperating is not a reliable shutdown mechanism.

Recovery procedures should be tested in advance. When a service is compromised, the operator should be able to revoke access without depending on the affected service to provide a trustworthy account of its own state.

The common principle across these controls is that the system should remain governable even when its reasoning component cannot be trusted.

## 15. How to Test an Agent's Security Boundary

Security testing for AI agents should evaluate the complete execution path rather than only the quality of model responses.

A model may refuse an unsafe request during a conversational test and still be embedded in an application that accepts unauthorized tool calls through another route.

Testing should therefore examine both intended behavior and enforced behavior.

A useful assessment begins by enumerating the available tools and identifying the resources each tool can access. The operator should then establish which identities, network destinations, and data stores are reachable from the agent's execution environment.

Next, the policy layer should be tested against malformed requests, unauthorized resources, unexpected parameters, and attempts to invoke operations outside the assigned task. These tests can be performed with synthetic data and isolated infrastructure.

The objective is to verify that invalid operations are rejected even when the model proposes them confidently or when the request originates from an unexpected sequence of prior actions.

Long-running behavior also deserves explicit testing. Operators should verify that time limits, cost limits, iteration budgets, and emergency shutdown mechanisms remain effective across repeated model calls.

Finally, audit records should be checked against actual execution results. The system should make it possible to determine which operation was proposed, which policy was applied, whether the operation ran, and what changed as a result.

This approach is more reliable than testing whether a model says the right thing in a set of adversarial conversations.

A refusal is an output. A security boundary is an enforced property of the deployed system.

## 16. Detection: Look for the Chain, Not Just the Prompt

A prompt containing suspicious instructions can be a useful signal, but prompt inspection alone is an incomplete detection strategy.

Attackers can vary their wording. Legitimate applications may contain unusual text. A system that relies exclusively on recognizing particular jailbreak phrases will miss attacks that use different language or exploit an entirely separate weakness.

The more durable indicators often appear in the behavior of the surrounding infrastructure.

For example, an otherwise quiet inference service might suddenly receive unusually high request volume. A tool-enabled agent might begin making repeated calls unrelated to its normal task. A local process might establish unexpected outbound connections, read configuration files it does not normally access, or consume resources beyond its established limits.

These signals are more useful when correlated.

An increase in inference expenditure may be benign on its own. So might a series of failed requests. But an unexpected increase in model usage combined with unusual tool calls and outbound network activity deserves investigation.

Defenders should also distinguish between unauthorized inference and a host compromise.

Evidence of model API abuse does not by itself establish that the underlying machine has been compromised. Likewise, suspicious host activity does not necessarily prove that an LLM endpoint was the initial entry point.

Accurate incident response requires reconstructing the sequence of events rather than assuming that every observed behavior belongs to one attack chain.

The most useful telemetry includes:

- Authentication events and client identities.
- Model requests, usage volume, and associated costs.
- Tool invocations and authorization decisions.
- Filesystem and database access relevant to the agent's role.
- Network connections initiated by the execution environment.
- Changes to agent configuration, credentials, and permissions.
- Resource consumption and shutdown events.

Where practical, these records should be collected by an independent monitoring system and retained in a way that prevents the monitored process from rewriting them.

The objective is to establish a reliable account of what the system did, not merely what the model claims it intended to do.

## 17. What This Means for AI Infrastructure Providers

AI infrastructure providers face a somewhat different problem from operators of self-hosted systems.

A commercial provider must prevent unauthorized use of its own services while detecting compromised accounts and protecting legitimate customers from abuse. A self-hosted operator must protect the endpoint, its compute resources, and the environment surrounding the model.

API gateways occupy an intermediate position. They may enforce authentication and quotas, but they can also aggregate access to multiple providers and hold credentials with significant financial value.

These different deployment models require different controls, but they share several requirements.

Usage must be attributable to an identity. Access must be scoped to a defined purpose. Consumption must be bounded. Suspicious behavior must be detectable. Credentials must be revocable.

For commercial APIs, per-project budgets, request quotas, anomaly detection, and rapid credential revocation can limit the financial consequences of stolen access.

For self-hosted models, network restrictions, authentication gateways, process isolation, and resource limits can reduce exposure.

For gateways, the security of both the public-facing interface and the backend provider credentials matters. Protecting one while leaving the other exposed creates an incomplete boundary.

Providers should also recognize that the value of a stolen inference endpoint is not necessarily limited to the cost of individual requests. If the endpoint is connected to privileged tools or sensitive context, the service may expose capabilities beyond model generation.

The correct unit of security analysis is therefore the deployed application and its authority, not simply the model API.

## 18. The Broader Implication: AI Changes the Economics of Coordination

The most consequential aspect of this threat is not that an LLM can discover a vulnerability that a conventional scanner misses.

It is that language models can reduce the coordination burden associated with combining many existing tools.

Traditional offensive automation often relies on predefined logic, carefully engineered workflows, or substantial human involvement when the environment deviates from expectations.

A model-driven agent can potentially interpret unfamiliar outputs, summarize results, choose among available actions, and adapt its next proposal without requiring every decision to be encoded in advance.

This does not make the model infallible. It can misunderstand the environment, invent unsupported conclusions, select ineffective actions, or become trapped in an unproductive loop.

But a system does not need to be perfectly intelligent to be operationally useful to an attacker. It needs to produce enough useful decisions to offset its cost and failure rate.

When inference capacity can be stolen, even that cost calculation changes.

The attacker may not need to invest in dedicated model infrastructure. The victim absorbs some or all of the inference expense. If the agent also uses stolen credentials or compromised compute, the operator can distribute costs across multiple victims.

This is the economic asymmetry at the center of LLMjacking.

The attacker supplies a task and attempts to externalize the resources needed to carry it out.

The same principle appears in other forms of resource abuse. Botnets externalize compute costs. Stolen cloud credentials externalize infrastructure costs. Compromised API accounts externalize inference costs.

AI adds a flexible reasoning component to this existing economy.

The danger is not that every exposed model will become an autonomous attacker. It is that a growing number of ordinary services can be assembled into systems where stolen access, automated decision-making, and delegated execution reinforce one another.

That makes the security of interfaces and permissions more important, not less.

## 19. Why “Self-Improving Attacker” Is the Wrong Shortcut

The phrase *self-improving attacker* is tempting because it captures the impression of a system that observes failure and tries something else.

But there is a technical difference between adaptive behavior and self-improvement.

An agent that changes its next action in response to tool output is adapting its behavior within a task. It may become more effective over the course of that task, but that does not establish that it has improved the underlying model, developed a generally superior strategy, or acquired capabilities beyond those provided by its tools.

Likewise, a large step budget does not demonstrate successful autonomy at scale. A system may spend many steps repeating failures or generating ineffective actions.

These distinctions are important because accurate threat analysis should describe the capabilities actually demonstrated.

The reported LLMjacking architecture is concerning without requiring claims about artificial general intelligence, consciousness, or an independently evolving machine intelligence.

Its risks follow from ordinary engineering properties: persistent loops, flexible decision-making, access to tools, broad permissions, and weak oversight.

Those properties are already sufficient to justify serious security controls.

The practical question is whether the agent can continue operating, whether it can reach consequential resources, and whether an independent system can constrain its actions.

Those are measurable questions. They can be tested in an isolated environment and addressed through conventional security engineering.

## 20. A Reference Architecture for Governed Agents

A secure agent architecture should separate at least six concerns.

**1. Intent and task definition.** The user or authorized application defines what the agent is permitted to accomplish. The task should have a clear scope and an identifiable owner.

**2. Planning and inference.** The model interprets context and proposes possible actions. It may use probabilistic reasoning, but its output remains a proposal rather than an authorization.

**3. State and provenance.** The system records the task's current state, relevant evidence, prior actions, and the origin of important inputs. This makes it possible to distinguish verified results from untrusted content and model-generated assumptions.

**4. Policy evaluation.** A deterministic authorization layer checks each proposed operation against the task, identity, resource scope, and required approvals. Invalid transitions are rejected.

**5. Constrained execution.** Approved actions run through narrowly scoped tools inside an environment with explicit filesystem, network, and resource boundaries.

**6. Independent audit and recovery.** The system records the outcome of execution, monitors for abnormal behavior, and retains the ability to revoke credentials or stop the process without relying on the model.

These components should not all share unrestricted control over one another.

The planning layer should not be able to rewrite the authorization policy. The execution layer should not silently expand its own permissions. The audit system should not depend entirely on records produced by the agent it is monitoring.

This separation reduces the risk that one compromised or manipulated component can undermine the entire system.

It also provides a better foundation for testing. Each boundary can be evaluated independently, and the interaction between boundaries can be tested through adversarial scenarios.

The objective is not to eliminate probabilistic reasoning. It is to place probabilistic reasoning inside a system whose consequential actions remain governed.

This is the architecture I consider most defensible for persistent AI services, particularly those that operate across multiple tools and retain access to sensitive resources.

## 21. The Engineering Principle: Autonomy Must Not Become Authority

The LLMjacking case illustrates a problem that extends beyond cybersecurity.

As AI systems become more capable of coordinating tools, developers increasingly delegate decisions about what to do next. That is often useful. A system that can interpret intermediate results and adapt its plan is more flexible than a fixed script.

But delegation creates a temptation to combine decision-making, authorization, and execution in one loosely controlled loop.

The model proposes an action. The same application that asked for the proposal decides whether it is acceptable. The executor performs the action using whatever privileges the application happens to possess. The result returns to the model, and the process repeats.

Such a system may work well under ordinary conditions while failing catastrophically when its assumptions are violated.

The solution is not to make the model more confident, nor to assume that a longer system prompt will solve the problem. It is to establish independent security boundaries around the actions that matter.

A model can recommend a database operation without receiving unrestricted database access. It can generate code without being permitted to deploy it. It can propose a change without being authorized to modify its own security configuration. It can continue working without being allowed to continue indefinitely.

These are architectural choices.

The distinction between autonomy and authority should be explicit in every agent that can affect real systems.

Autonomy determines how much of the work can proceed without continuous human direction. Authority determines which actions the system is permitted to perform.

Those are separate dimensions and should remain separate.

A useful agent can have substantial autonomy within a narrowly defined scope. A dangerous agent can have very little intelligence but excessive authority.

The design goal should be to maximize useful autonomy while minimizing unnecessary authority.

## Conclusion: Secure the Boundaries, Not Just the Model

LLMjacking is a warning about the infrastructure surrounding AI, not simply about the behavior of language models.

The reported “Skynet mode” agent combines stolen inference capacity, persistent orchestration, offensive tools, and a large allowance for unattended operation. The individual techniques are familiar. Their integration demonstrates how AI can serve as a flexible decision-making component inside an established cybercrime workflow.

The available evidence supports a clear conclusion: exposed AI services are resources that attackers actively seek, and tool-enabled deployments can introduce risks that extend beyond unauthorized inference.

It does not establish that every capability in the captured instructions was successfully executed, nor does it require us to imagine an independently evolving intelligence. The demonstrated architecture is concerning on its own.

For operators, the immediate priorities are practical. Authenticate inference endpoints. Keep internal services private. Scope credentials narrowly. Restrict tool permissions. Isolate execution environments. Enforce resource limits. Monitor both inference and downstream actions. Ensure that an agent can be stopped independently of its own reasoning process.

For developers, the deeper lesson is architectural.

A model should be permitted to reason about actions without becoming the final authority over whether those actions may occur. Tool outputs should be validated. Permissions should be enforced by independent components. State transitions should be explicit. High-impact operations should require authorization appropriate to their consequences.

For local-first AI, this principle is particularly important. Owning the model and the hardware is only part of computational sovereignty. The operator must also control the interfaces, permissions, execution environment, and evidence needed to understand what the system has done.

**The agent proposes. The policy decides. The executor verifies.**

That separation is not an obstacle to autonomy. It is what makes autonomy governable.

The future of AI security will not be determined solely by which models are most capable. It will also depend on whether the systems around those models preserve a reliable boundary between generating an action and being authorized to perform it.

A model can suggest almost anything. A secure system must remain capable of saying no.

---

## References and Further Reading

1. **Symantec research, reported by Help Net Security.** [Hackers hijack exposed AI models to launch cyberattacks at victims’ expense](https://www.helpnetsecurity.com/2026/10/23/llmjacking-agent-hijacks-exposed-ai-models/). October 23, 2026. Reporting on the captured offensive-agent instructions, exposed inference services, tool catalogue, and cryptocurrency-mining script.

2. **Pillar Security.** [Operation Bizarre Bazaar: First Attributed LLMjacking Campaign with Commercial Marketplace Monetization](https://www.pillar.security/blog/operation-bizarre-bazaar-first-attributed-llmjacking-campaign-with-commercial-marketplace-monetization). January 28, 2026. Research on unauthorized AI infrastructure access, endpoint discovery, and resale of inference capacity.

3. **OWASP GenAI Security Project.** [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/). Guidance covering prompt injection, insecure output handling, sensitive information disclosure, excessive agency, and related application risks.

4. **MITRE ATT&CK.** [Indirect Prompt Injection, Technique T1698](https://attack.mitre.org/techniques/T1698/). Documentation of adversarial instructions embedded in content processed by LLM-enabled systems.

5. **MITRE D3FEND.** [Exfiltration via AI Agent Tool Invocation, AML.T0086](https://d3fend.mitre.org/offensive-technique/attack/AML.T0086/). Analysis of how legitimate agent tools can be misused to transfer sensitive data.

6. **Daniel Kliewer.** [LLMjacking: Building the “Skynet Mode” Recursive Attacker](https://www.danielkliewer.com/blog/2026-10-23-llmjacking-the-skynet-mode-recursive-threat). Original article and architectural analysis.
