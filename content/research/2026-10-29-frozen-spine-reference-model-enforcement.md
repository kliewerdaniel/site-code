---
author: Daniel Kliewer
canonical_url: /blog/2026-10-29-frozen-spine-reference-model-enforcement
date: 10-29-2026
description: "This paper proposes the Frozen Spine, a reference-monitor architecture that separates model-generated proposals from authorised state transitions, and asks — rigorously, and with a negative result in view — whether that separation can survive being moved *inside* the model itself."
image: /images/1020001.png
layout: post
title: "The Frozen Spine: Reference-Monitor Enforcement for Model-Integrated Agents"
tags:
  - frozen spine
  
---
# The Frozen Spine: Reference-Monitor Enforcement for Model-Integrated Agents

## A Formal Framework for Safety Invariants, Complete Mediation, and Neural Computational Architectures

**Research paper — revised edition (v4, 29 October 2026)**
**Date:** 29 October 2026
**Research areas:** Theoretical Computer Science, Formal Methods, Computer Security, Neural Architecture Design
**Status of this document:** A complete, self-contained revision of the draft dated 29 October 2026, incorporating reviewer feedback on that draft. Every citation was re-checked against a primary or authoritative secondary source. Placeholder citations have been removed. Claims about Qwenputer are reported as *project-reported* unless otherwise stated, because Qwenputer is, at the time of writing, a blog, code repository, and model checkpoint — not a peer-reviewed paper — and its benchmarks have not been independently reproduced in this work. Evidence for other claims is classified in the Scope and evidence section; the status paragraph does not repeat that classification.

---

## Abstract

Language-model agents increasingly generate actions that modify persistent state, access external resources, and invoke consequential operations. Their outputs are probabilistic, but their execution environments require enforceable security properties. This paper proposes the Frozen Spine, a reference-monitor architecture that separates model-generated proposals from authorised state transitions, and asks — rigorously, and with a negative result in view — whether that separation can survive being moved *inside* the model itself.

We formalise the system as a transition system with an explicit safe state space, an authorisation policy, and a trusted enforcement kernel. We prove three conditional results, each with its premises stated so that they can be falsified rather than assumed away. First, invariant preservation follows by induction when the initial state is safe and the kernel commits only transitions that are both authorised and invariant-preserving (Theorem 1). Second, those guarantees extend to the whole system only under complete mediation: every path by which protected state can change must pass through the kernel (Theorem 2). Third, trace refinement transfers properties defined pointwise over individual traces from a reference specification to an implementation whose observable traces are included in the specification's traces (Theorem 3). It does not, in general, transfer arbitrary hyperproperties, which constrain sets of traces or relations among executions; whether a particular hyperproperty is preserved depends on its closure properties and on the refinement relation (Section 5.2).

We then scrutinise the motivating neural precedent. Qwenputer (Agrawal, 2026) demonstrates a compiled 32-bit RISC-V processor using Gated DeltaNet recurrent state as addressable memory, passing the official riscv-tests, matching QEMU, and replaying about 230,000 output positions without a mismatch as reported by its author. That is a genuine computational precedent: deterministic execution can be compiled into weights. It is not, by itself, an authorisation precedent. We prove a conditional separation result (Theorem 4): *if* there exists a path by which the proposer can cause a protected effect without an equivalent authorisation decision, complete mediation fails; *if* the proposer can modify security-relevant state of the enforcement mechanism so that an unauthorised proposal is accepted, or can alter or disable the decision procedure, tamper resistance fails; and compiling the mechanism into model weights does not, by itself, establish that either condition is absent. Closing the gap, where it exists, requires a combination of complementary mechanisms, not any one of them alone: mandatory effector-side mediation, state isolation, and, where weight integrity is at issue, weight attestation, or an external interpreter mediating all relevant effects (Section 5.4, Table 1). Each mechanism addresses a different threat and carries its own assumptions.

This paper therefore provides: (i) a small, external reference-monitor framework that can be proved, model-checked, and tested; and (ii) a precise statement of what remains open, with eight proof obligations and eight proposed falsifiable experiments that would have to be discharged before any claim of a *model-integrated* Frozen Spine could be accepted. The central claim is conditional: a formally verified mechanism, placed where the model cannot route around it, can constrain the operations a system commits, independently of the model's willingness to generate compliant proposals. Whether such a mechanism can be made intrinsic to a neural architecture without losing that boundary is the open question addressed in Sections 5.4 and 9.

**Keywords:** reference monitor; complete mediation; safety invariants; trace refinement; execution monitors; shielding; runtime assurance; compiled neural computation; Gated DeltaNet; RISC-V; prompt injection; capability security.

---

## Scope and evidence

This section identifies the evidentiary status of the claims in this paper.

This paper synthesizes reference-monitor theory, runtime assurance, and model-integrated computation into a common formal framework for evaluating authorization enforcement in language-model agents. Its principal proposed contribution is a set of explicit conditions and proof obligations for determining whether a model-integrated mechanism preserves the guarantees of an external reference monitor. The conditional separation result in Section 5.4 identifies failure modes of architectures in which invocation and security-relevant state remain under proposer control. The underlying reference-monitor theory and invariant-preservation results are established literature, not novel results of this paper; the framework, the conditional formulation, and the evaluation plan are the proposed contributions.

The central research question is stated in Section 1.2 and is not restated here.

Evidence is classified as follows, and the classification is used consistently throughout:

| Category | What it establishes |
| --- | --- |
| Formal result | A claim derived from stated assumptions by a valid proof in this paper |
| Machine-checked result | A claim checked by a specified proof assistant or model checker, within its model and assumptions |
| Empirical result | An observation from a reproducible experiment with a stated domain and method |
| Hypothesis or proposal | A claim or research direction not yet established by the preceding evidence |

Theorems 1–4 in this paper are formal results, not machine-checked results. No theorem in this paper has been machine-checked. The eight proof obligations and eight experiments in Sections 8–9 are a research agenda and proposals, not a verified implementation or an experimental finding. Qwenputer benchmark and exactness claims are project-reported (hypothesis/empirical claims by the project author, not reproduced here), unless a sentence explicitly states an independent reproduction, which this paper does not claim.

---

## Contents

1. Introduction
2. Related work
3. Threat model and system model
4. The formal system
5. Main results — and their limits (including 5.5, adversary game and counterexamples for the ledger)
6. The Qwenputer case study, scrutinised
7. A worked example: a ledger the kernel can actually prove
8. Proof obligations
9. Falsifiable experiments
10. Complexity and practical limits
11. Limitations, dual use, and deployment guidance
12. Conclusion
- Appendix A. Notation
- Appendix B. Proof details
- Appendix C. Version history
- Appendix D. Replication checklist
- Appendix E. Executable ledger model and results
- References

---

## 1. Introduction

### 1.1 The problem

A language-model agent can propose an action that is syntactically valid but unauthorised, inconsistent with the current state, or destructive to a protected resource. Prompt instructions, output validation, and a second model asked to judge the first may reduce these failures. None of them establishes that every consequential operation passes through an independently enforced authorisation mechanism. A model that is asked nicely not to do something, and a system that cannot do something without permission, are different systems, and the difference is the whole subject of this paper.

The Frozen Spine addresses the problem by separating proposal generation from execution authority. The model may generate any candidate action, including invalid, malicious, or merely mistaken ones. A trusted kernel determines which proposals may modify authoritative resource state. If the kernel says no, no protected resource changes, although a denial record is appended to the audit log (Definition 6). That claim — *no protected resource change on denial* — is proved for the abstract kernel in Proposition 1, and the rest of this paper is an attempt to say exactly what it would take for it to be true of a deployed system.

This approach builds on the reference-monitor principles articulated by James P. Anderson in 1972 [1] and refined by Saltzer and Schroeder in 1975 [2]: a mediating mechanism must be (i) always invoked — complete mediation, (ii) tamperproof, and (iii) small enough to be verified. Those principles predate language-model agents by half a century. That is a strength, not an anachronism: the failure modes they name — an unmediated path, a guard the watched party can rewrite, a guard too large to check — are exactly the failure modes that reappear when a model is given tools.

### 1.2 The research question

The research question is whether this architecture can be extended beyond an external execution boundary. In particular:

> Under what architectural and implementation conditions can a model-integrated computational mechanism provide the same authorization guarantees as a separately enforced reference monitor?

That question remains interesting whether the answer is a successful construction, a conditional impossibility result, or a demonstration that a hybrid architecture is necessary. Section 5.4 gives a conditional result: it identifies the antecedents under which mediation or tamper resistance fails, rather than asserting failure for every in-model architecture. Sections 8–9 specify the proof obligations and experiments that would settle whether those antecedents hold for a particular design.

### 1.3 Why Qwenputer matters, and why it does not settle the question

Qwenputer, developed by Divyansh Agrawal and published on 22 October 2026 [13], demonstrates a 32-bit RISC-V processor (RV32IM, plus the Zba extension and a small bignum unit) compiled into 11 additional layers placed before Qwen3.5-4B's own 32 layers, with no learned weights in the added layers. It repurposes Gated DeltaNet recurrent state as addressable memory: with the recurrence gate set to 1, the write strength set to 1, and one-hot keys and queries, each row of the recurrent state matrix functions as a memory cell [13, 11]. The project reports passing the official riscv-tests, matching QEMU, running 18 million instructions free-running without a single error, and replaying about 230,000 output positions against a reference machine with zero mismatches [13].

These results, if reproduced, demonstrate that selected deterministic computations can be implemented within a neural architecture. They do not establish that a model is unable to bypass an authorisation mechanism, for three reasons that are visible in the project's own description:

- **Invocation is model-chosen.** Qwenputer is used, in the author's words, by "piggybacking on the tool call format that models are quite well-trained on": the model sends the CPU its instructions and reads back the results [13]. A mechanism the watched party chooses whether to invoke is not complete mediation.
- **Boot is external.** A small driver, RvChat, loads firmware into the Gated DeltaNet state and keeps trace tokens out of Qwen's layers [13]. The project does not yet run with a plain `generate()` call. The driver, not the compiled weights, is currently doing the isolation work that a reference monitor would have to do.
- **State is shared, not protected.** The CPU's RAM *is* the model's recurrent state. That is the engineering insight that makes Qwenputer work, and it is also the reason the RAM cannot, without an additional boundary, be treated as protected memory: the same forward pass that runs the CPU also generates the tokens that write to that state.

The Frozen Spine hypothesis is therefore narrower and more testable than "put the guard inside the model": a formal enforcement mechanism may be integrated into a neural computational architecture, but its safety properties must be established independently of the model's willingness to use it, and independently of the model's ability to write to the mechanism's own state.

### 1.4 Contributions

1. A complete formalisation of the Frozen Spine as a reference monitor over a transition system, with authorisation, invariant, mediation, atomicity, and refinement defined separately so each can fail separately (Section 4).
2. Proofs of invariant preservation, complete-mediation transfer, and trace refinement, with the exact premises each proof needs and the exact property each proof does *not* transfer (Section 5).
3. A conditional separation result that characterises, rather than merely asserting, the conditions under which model-integration fails complete mediation or tamper resistance, and a characterisation of the boundaries that could close the gap (Section 5.4). The result's clauses follow closely from the definitions of mediation and tamper resistance; its contribution is to make those conditions explicit and testable, as instantiated in Section 5.5, not to claim a surprising impossibility theorem.
4. A scrutinised case study of Qwenputer that separates what its author reports from what would count as authorisation evidence (Section 6).
5. A worked, checkable example — a ledger with explicit invariants — that a reader can model-check without taking anything in Sections 4–5 on trust (Section 7).
6. Eight proof obligations and eight falsifiable experiments, each with a stated falsification condition, a preregistration requirement, and a statement of what passing would *not* prove (Sections 8–9).
7. An explicit account of what a runtime monitor cannot guarantee — liveness, general information flow, and specification correctness — grounded in Alpern and Schneider [3], Schneider [4], and Goguen and Meseguer [16] (Section 5.3).

Items 1, 2, and 7 formalise established principles; the proposed contribution is their synthesis for language-model agents (Scope and evidence), not the neural integration itself, which remains a research programme.

---

## 2. Related work

### 2.1 Reference monitors and enforceable policies

Anderson's reference-monitor concept [1] requires that protected references be mediated by a tamper-resistant mechanism small enough to verify. Saltzer and Schroeder [2] generalised the idea into eight design principles, of which four bear directly on this paper: economy of mechanism (keep the trusted part small), fail-safe defaults (deny unless explicitly permitted), complete mediation (check every access, every time), and least privilege (grant only the authority the current task needs). Caching authorization decisions is compatible with complete mediation only when the validity and revocation semantics of the cached decision are explicitly specified. When authorization cannot be established, a fail-safe implementation should reject the operation unless the policy defines an alternative safe behavior.

Schneider [4] asked which policies a runtime monitor *can* enforce, and answered precisely: a monitor that observes execution step by step and halts it on violation — a truncation monitor, formalised as a security automaton — can enforce exactly the safety properties, i.e. properties whose violations are detectable from a finite prefix. Liveness properties ("something good eventually happens") cannot be enforced this way, because no finite prefix witnesses their violation. Schneider's result is sometimes misread as "monitors can enforce safety, full stop." The correct reading is narrower: a truncation monitor can enforce a safety property *if* the monitor's decision predicate is computable, the monitor sees every security-relevant event, and halting is an acceptable intervention. Each of those "ifs" is a proof obligation in Section 8.

Bauer, Ligatti, and Walker [5] extended Schneider's class with *edit automata*, which can suppress, insert, and replace actions, not merely halt. Edit automata can enforce some non-safety properties, including certain renewal properties, because they can repair an execution rather than only truncate it. The Frozen Spine as defined in Section 4 is a truncation kernel: it commits or rejects. Section 9, Experiment 7, and the discussion in Section 5.3 consider the edit-automaton extension — a kernel that substitutes a safe default action — and why that extension buys liveness-like behaviour only at the cost of a stronger specification: the substitute action must itself be proved safe and authorised.

### 2.2 Safety shielding and runtime assurance

Alshiekh et al. [6] synthesise a *shield* from a temporal-logic specification and an abstract model of the environment. The shield monitors the learner's actions and corrects them only when the chosen action would violate the specification, preserving the learner's convergence guarantees under stated conditions. The crucial structural fact is that the shield is synthesised *outside* the learner and interposed between learner and environment. Its guarantee is conditional on the abstraction: if the real environment can do something the abstraction cannot, the shield's proof does not cover it. The Frozen Spine inherits that conditionality and makes it explicit in PO1 (specification adequacy) and PO8 (composition and observation coverage).

The same structure appears in runtime assurance (RTA), notably the Simplex architecture, in which a trusted baseline controller takes over when an untrusted advanced controller would violate safety. Slagel et al. [7] formalise Simplex RTA in PVS using an embedding of differential dynamic logic, treating ML/AI controllers as black boxes. The lesson for agents is architectural, not merely formal: the trusted component must be able to *take over*, not merely advise, and the switching logic must itself be verified. A language model that can ignore its shield has no shield, whatever the shield's internal proof says. ASTM F3269-21 standardises the RTA pattern for aircraft systems containing complex functions [20]; its existence is a reminder that this architecture is already the expected pattern in safety-critical domains, and that agent systems are, by comparison, unusually casual about it.

### 2.3 Formal verification of kernels

The seL4 microkernel [8] is the methodological precedent this paper appeals to, and also the precedent that disciplines its claims. Klein et al. proved seL4's C implementation correct with respect to its abstract specification by machine-checked proof, and subsequent work extended the proofs to integrity, confidentiality, and information-flow noninterference, and to the binary. Three lessons transfer:

- **Verification is relative to a specification.** seL4's proofs show the implementation matches its specification; they do not show the specification is the policy anyone wanted. Specification correctness (Section 5.3.3) remains a separate, human task of threat modelling and review.
- **Smallness is what makes proof affordable.** seL4 is about 8,500 lines of C with roughly 200,000 lines of proof script in the original effort — a ratio that is itself an argument for economy of mechanism. A kernel that grows to include a language model, a tool router, and a policy language will not be verified by the same methods at the same cost.
- **Privilege separation is what makes the proof *mean* something.** seL4 runs in kernel mode; applications run in user mode and can only reach hardware as the kernel permits. The proof's force comes from that boundary, not from the elegance of the specification. Remove the boundary and the proof's conclusion — "applications cannot violate integrity" — no longer follows, however correct the code is in isolation. This is the boundary Theorem 4's conditional form addresses for model-integration.

### 2.4 Programs compiled into neural networks

Tracr [9] compiles programs written in RASP [10] into transformer weights, producing models with known structure that can serve as ground truth for interpretability research. Its programmes — token frequencies, sorting, parenthesis checking — are small, bounded, and exactly specified. Tracr's significance for this paper is twofold. Positively, it shows compilation from a human-readable programme to weights is a real technique, not a metaphor. Negatively, it shows the limits of that technique as currently practised: Tracr compiles a *subset* of RASP, requires a maximum sequence length, and compiles elementwise operations to ReLU networks only approximately in the general case. A compiled programme is therefore not automatically an *exact* programme, and a fortiori not automatically a *secure* one. Any Frozen Spine compilation claim must state its domain, its length bound, and its numerical error bound — PO7 exists for exactly that reason.

Gated DeltaNet [11] supplies the memory primitive Qwenputer exploits. The gated delta rule combines a decay gate (rapid erasure of old state) with a delta update (targeted replacement of one key–value association), and is implemented with a chunkwise parallel algorithm. Schlag, Irie, and Schmidhuber [12] had earlier shown that linear attention with the delta rule functions as an associative memory ("fast weights"). Qwenputer's contribution is to make that memory *exact and addressable* by fixing the gate and write strength and using one-hot keys [13]. Exactness here is a property of the construction in ideal arithmetic; Section 6.3 and Section 10 discuss what it means in bf16 arithmetic on real hardware, where rounding is a real, if empirically small, threat to exactness claims.

### 2.5 Agent security by architecture: CaMeL

Debenedetti et al. [15] propose CaMeL, a defence against prompt injection that, like the Frozen Spine, refuses to make the model itself the security boundary. CaMeL extracts control and data flow from the *trusted* user query into a programme in a restricted interpreter; untrusted tool outputs are treated as data, never as programme, and capabilities track provenance so that untrusted data cannot flow into a sink it is not authorised for. On the AgentDojo benchmark, CaMeL solves 77% of tasks with provable security, against 84% for an undefended baseline [15]. The 7-point gap is itself informative: it is the measured price, on that benchmark, of a structural defence, and it is small enough to refute the claim that structural defences are unusable — and large enough to show they are not free.

CaMeL is the closest existing system to the Frozen Spine's external form, and the contrast is instructive. CaMeL's security comes from the interpreter *outside* the model. If CaMeL's interpreter were compiled into the model's weights and invoked only when the model chose to invoke it, CaMeL's proof would not survive the move. That is not a criticism of CaMeL; it is the reason CaMeL was built the way it was built, and it is the reason Section 5.4's separation theorem matters.


## 3. Threat model and system model

A security proof without a threat model proves nothing, because it does not say who is trying to do what. This section states the model before any theorem uses it, so that a reader who disagrees with the model can see exactly which theorems fall with it.

### 3.1 Principals and authority

- **Principal.** The party on whose behalf the agent acts, and whose authority is at stake. A proposal is authorised only with respect to a principal and a delegation from that principal. "The model authorised it" is not a sentence in this paper.
- **Proposer (M).** The language model, treated as an untrusted proposal generator. Its output distribution is unrestricted for purposes of the safety proof: it may generate unauthorised, malformed, adversarial, or merely mistaken proposals, including proposals crafted by prompt injection from untrusted tool output. No assumption is made that M is benign, aligned, well-prompted, or paying attention.
- **Kernel (F).** The trusted enforcement mechanism. F is not a model, not a prompt, and not a second model asked to judge the first. It is a deterministic (or deterministically specified) decision procedure over an explicit state and policy.
- **Effectors.** The tools, file systems, networks, and external services through which a committed action changes the world. An effector that can be reached without F is an unmediated path, however the system diagram draws it.
- **Policy author.** The party who writes and signs policy and invariant definitions. Policy updates are themselves authorised operations (see Section 4.4); a policy that M can rewrite is not a policy.

### 3.2 Adversary capabilities

The adversary in this paper is *the proposer plus its inputs*, not a separate network attacker — though the framework extends to one. Two adversary roles must be distinguished, because conflating them weakens Theorem 4. **Adversary P** is the proposer at inference time, generating tokens and proposals. **Adversary W** is a party holding the deployed weights (with fine-tuning, quantisation, pruning, or direct weight-editing capability). A claim about P does not, by itself, establish a claim about W, and vice versa. Capabilities A1–A6 below are stated for P unless otherwise noted; weight modification is a W capability and is treated as a separate threat-model case in Section 5.4. The adversary may:

- **A1. Propose anything.** Generate any proposal in the proposal language, including proposals that mimic authorised ones, reuse stale authorisations, or exploit underspecification.
- **A2. Inject via data.** Cause untrusted text from tool outputs, files, web pages, or conversation history to appear in M's context, attempting to steer M's next proposal (prompt injection, in CaMeL's terms [15]).
- **A3. Choose invocation.** If enforcement is invoked by generating a particular token sequence, tool-call format, or pathway, choose not to generate it, or generate a lookalike that does not invoke it.
- **A4. Write to shared state.** If the enforcement mechanism's state lives in a medium M can write to by generating tokens (notably recurrent state), write to it, overwrite it, or interleave writes with the mechanism's own writes.
- **A5. Exploit partial effects.** Trigger a proposal whose validation succeeds but whose commitment is interrupted, or whose side effects begin before authorisation completes, and retain whatever partial effect results.
- **A6. Exploit specification gaps.** Find an operation, resource, or effect channel that the specification does not model — a second tool interface, a log file that is also executable, a cache that is also a store — and use it as an unmediated path.

Capabilities A3 and A4 are the ones that distinguish the model-integrated case from the external case. In an external deployment, A3 is false by construction (the effector calls F; M has no vote) and A4 is false by privilege separation (M's process cannot write kernel memory). In a model-integrated deployment, whether A3 and A4 hold depends on the architecture: optional invocation alone does not prove a bypass exists if effectors reject operations lacking a valid authorisation result, and shared substrate alone does not prove that a particular security-relevant state overwrite is possible. Theorem 4 is therefore stated conditionally in Section 5.4: it identifies the conditions under which mediation or tamper resistance fails, rather than assuming those conditions from the architecture alone.

Capabilities *not* assumed: the adversary is not assumed to be able to break cryptography used by F, to rewrite F's code if F runs in a separate privileged domain with attestation, or to violate physics. Those are explicit non-capabilities, and if a deployment cannot sustain them, its proof obligations must say so.

### 3.3 What is protected, and what is not

Protected state is the authoritative state whose violation constitutes a security failure: resource contents, authorisation records, policy versions, audit logs that are relied upon, and transaction metadata. Everything else — M's internal activations, its chain-of-thought text, its draft proposals — is unprotected by definition, however embarrassing its disclosure might be. This distinction matters because it prevents a common slide: proving something about M's *text* (e.g. "the model said it would not do X") and presenting it as a proof about *state* (X did not happen). Only committed effects on protected state count.

External effects are protected effects if they are irreversible or externally visible in a way that matters: a network request sent, a payment initiated, a file deleted, a message delivered. A system that checks authorisation *after* sending the request has not enforced authorisation, whatever its log says. Proposition 1 (Section 5.2) is therefore stated with an explicit "no protected external effect before authorisation" premise, and Experiment 3 exists to test that premise rather than assume it.

### 3.4 Assumptions, stated once

- **(S1) Initial safety.** Boot and initialisation produce a state in K (Section 4.5). This is PO2, not a free assumption: a system that boots unsafe and "becomes safe later" has no safety proof for its early traces.
- **(S2) Kernel integrity in the external case.** In the external deployment, F's code and policy cannot be modified by M, and F is invoked on every protected path. This is Anderson's tamperproofness and complete mediation, as deployment facts, to be audited — not as hopes.
- **(S3) Decidable checks.** Authorisation and invariant checks used by F are computable within the kernel's stated bound. A policy language that makes authorisation undecidable (cf. the Harrison–Ruzzo–Ullman undecidability result for general access-control safety [21]) cannot be enforced by a kernel that must decide in finite time; such policies must be restricted to a decidable fragment, and the restriction must be stated.
- **(S4) Observation model.** Traces record exactly the observable interface defined in Section 4.6. Refinement (Theorem 3) is relative to that interface. A trace that omits a channel (timing, for example) proves nothing about that channel.
- **(S5) Sequential reference model.** Theorems 1–3 are proved for a sequential reference model in which kernel steps are atomic and totally ordered. A concurrent implementation must be linearizable to this sequential model: each operation must appear to take effect atomically at a single commit point between its invocation and its response, with the kernel's Auth, Eff, and Inv checks evaluated on the state at that point. Concurrent refinement is a separate obligation (PO6/PO7); the sequential theorems do not, by themselves, establish it.

Any deployment that cannot sustain S1–S4 must either change its deployment or weaken its claim. It may not keep the claim and quietly drop the assumption.

---

## 4. The formal system

Notation is collected in Appendix A. Definitions are numbered so that proofs can cite them rather than gesture at them.

### 4.1 State, proposals, and authority

**Definition 1 (Authoritative state).** Let S be the set of authoritative system states. Every state has the form s = (r, ℓ), where r is the protected resource state (resource contents, authorisation records, policy versions, and transaction metadata) and ℓ is the append-only audit log. S is *not* the model's hidden state, its context window, or its activations. Those are proposer state, and they are untrusted. Separating r from ℓ is essential: a denial must be able to append an audit record without changing protected resources, and an allowed mutation must be committed together with its audit record (Section 4.4). A definition that treats the whole state as unchanged on denial, while also requiring an audit record on denial, is inconsistent; Definition 1 resolves that inconsistency by construction.

**Definition 2 (Proposals).** Let A be the set of action proposals. A proposal a ∈ A describes a requested operation. A proposal does not, by itself, alter authoritative state. This is not a modelling convenience; it is the architectural claim. If a proposal *can* alter state merely by being generated — for example, if generating a token sequence writes to a shared recurrent store that is also the authoritative store — then Definition 2 is violated and the system is not a Frozen Spine system at all.

**Definition 3 (Safe state space and invariant).** Let Inv_R be a resource invariant over r, and Inv_A an audit invariant over ℓ (append-only: ℓ can only grow by appending records, never by deletion or alteration of existing records; every committed resource mutation has a corresponding audit record, and every audit record corresponds to a kernel decision). Let Inv(s) = Inv_R(r) ∧ Inv_A(ℓ), and let K = {s ∈ S | Inv(s)} be the safe state space. Membership in K means both resource safety and audit integrity hold. K is a *set of states*, not a property of a single action. An action can be locally plausible and still move the system out of K (for example, a second withdrawal that is individually within a limit but jointly exceeds a balance); only the resulting state decides. Inv over internal state alone does not cover irreversible external effects; those are covered by the trace property in Definition 8b, not by Inv alone.

**Definition 4 (Authorisation predicate).** Let Auth: S × A → {true, false} be the authorisation predicate. Auth(s, a) is true iff action a is permitted in state s under the current policy, for the principal on whose behalf it is proposed. Auth is a function of state and proposal only; it does not consult M's intentions, its chain of thought, or its confidence. A policy that says "allow if the model seems to mean well" is not an Auth predicate and cannot be proved about.

**Definition 5 (Effect function).** Let Eff: S × A ⇀ R be a partial function giving the *resource* state resulting from executing a when execution is defined, where R is the set of possible r components. Eff is partial because not every proposal is executable in every state, and because the kernel must be able to refuse to define an effect for an unauthorised proposal. The kernel's job is to decide, for each (s, a), whether Eff(s, a) may be committed. The full next state on allow is (Eff(s, a), ℓ ∥ allow(s, a)), where ∥ denotes appending a record; on deny it is (r, ℓ ∥ deny(s, a)). Definitions, not implementation obligations, specify this behaviour; whether a deployed system behaves this way is PO6/PO7.

*Remark.* Separating Auth from Eff is deliberate. Auth answers "may this happen?"; Eff answers "what would happen if it did?" A system that conflates them — for example, by defining execution as "whatever the tool does when called" — cannot state, let alone prove, that an unauthorised effect did not occur, because it has no independent description of the effect to compare against.

### 4.2 The Frozen Spine kernel

**Definition 6 (Kernel decision).** The enforcement kernel F is a deterministic decision procedure:

    F(s, a) = (s', d)  where d ∈ {allow, deny}, s = (r, ℓ)

defined by:

- If Auth(s, a) is true, Eff(s, a) is defined, and Inv_R(Eff(s, a)) is true, then d = allow and s' = (Eff(s, a), ℓ ∥ allow(s, a)).
- Otherwise, d = deny and s' = (r, ℓ ∥ deny(s, a)).

In words: the kernel commits a resource action only when it is authorised, executable, and resource-invariant-preserving, and it commits the corresponding audit record atomically with the resource change. On denial it commits no resource change, but it does append a denial record. The kernel's decision is a function of (s, a) and policy, not of M's output distribution. That is why M may be arbitrary in the safety proof: M influences *which* a is presented, never *whether* a presented a is committed. Definition 6 is a specification; it does not, by itself, establish that a deployed system implements it. That implementation obligation is PO3/PO4/PO7.

**Lemma 1 (Kernel commitment).** For every s ∈ K and every a ∈ A, if F(s, a) = (s', allow) then s' ∈ K and Auth(s, a) holds. If F(s, a) = (s', deny) then the resource component of s' equals the resource component of s, and ℓ' = ℓ ∥ deny(s, a).

*Proof.* Directly from Definition 6: allow requires Inv_R(Eff(s, a)), and the audit append preserves Inv_A by construction (append-only, with a record for the decision), so s' ∈ K; deny defines r' = r and ℓ' by appending, preserving Inv_R and Inv_A. ∎

Lemma 1 is small, and that is the point. All of the safety work is in ensuring that a real implementation *is* Definition 6 — that its Auth check is the policy, its Eff is the real effect, and its Inv check is evaluated on the real resulting state, not on a predicted or approximated one. Those are PO3, PO4, and PO7.

**Definition 7 (Committed transition relation).** The system evolves by the relation →_F on S, where s →_F s' iff there exists a proposal a with F(s, a) = (s', allow) or F(s, a) = (s', deny). Reachability is the reflexive-transitive closure of →_F. Denials are included as audit-appending steps (resource unchanged) so that a trace that contains only denials is still a trace, and so that "the system stayed safe by refusing everything" is a trace the theory can describe — and then criticise on liveness grounds (Section 5.3.1) rather than pretend it is not a possible execution. The reference model in Definition 7 is sequential: steps are atomic and totally ordered (assumption S5). A concurrent implementation must be linearizable to this model.

### 4.3 Execution traces and safety properties

**Definition 8 (Trace).** An execution trace τ is a finite or infinite sequence

    τ = (s₀, a₀, d₀, e₀, s₁, a₁, d₁, e₁, s₂, …)

where each step satisfies F(sᵢ, aᵢ) = (sᵢ₊₁, dᵢ), eᵢ is the external effect (if any) produced at that step, taken from an external-effect alphabet E_ext (including a distinguished "no effect" event), or, for an implementation, the implementation's corresponding step. Finite traces are prefixes; infinite traces are limits of finite prefixes. Termination is modelled as a finite trace ending in a terminal state with no further step, or equivalently with an explicit halt event; a terminated trace does not silently continue. Let Tr(F) denote the set of traces permitted by the reference specification, and Tr(C) the set produced by an implementation C, over a shared observable interface (states as observed, proposals as presented, decisions, and committed effects).

**Definition 8b (External-effect safety property).** Let P_ext be the trace safety property: for every finite prefix of a trace, every external effect e in that prefix that is not "no effect" must correspond to a preceding allow decision for exactly that effect (same proposal, same principal, same resource arguments), and must occur only after that decision. P_ext is a safety property in the sense of Definition 9: a violation is witnessed by a finite prefix containing an unauthorised or premature effect, and no later behaviour undoes it, because an external effect that has already been sent (a payment, a network request, a deletion) cannot necessarily be undone by restoring internal state. Internal state invariants (Definition 3) are therefore necessary but not sufficient for external-effect safety: a system can retain a valid internal state after sending an unauthorised payment request, and Inv would still hold while P_ext had already been violated. The kernel enforces P_ext only if effectors perform an external effect *only* after an allow decision for that effect, and only for the effect as decided — an effector-side obligation, not a property of the kernel's internal decision alone. This trace-based approach, rather than attempting to represent every irreversible external consequence as internal state, is the paper's treatment of external effects.

**Definition 9 (Safety property, after Alpern and Schneider [3]).** The defining criterion is the bad-prefix criterion. A trace property P is a *safety* property iff every trace violating P has a finite prefix — a *bad prefix* — that cannot be extended to any trace satisfying P. Informally, "something bad happens" at a finite point and no future good behaviour undoes it. A *liveness* property, by contrast, is one that every finite prefix can be extended to satisfy — "something good eventually happens." Alpern and Schneider's decomposition theorem states that every trace property is the conjunction of a safety and a liveness property [3]. That theorem is why Section 5.3 can say, without hand-waving, that a monitor that only rejects cannot by itself establish liveness: liveness is a different component of the conjunction, requiring different proof techniques (well-founded variants, fairness, scheduling assumptions).

*Closure properties, stated separately from the definition.* The bad-prefix criterion should not be conflated with closure properties of trace sets. In the infinite-trace model, a safety property's trace set is limit-closed (closed under taking limits of finite prefixes): if every finite prefix of an infinite trace can be extended to a satisfying trace, then the infinite trace itself satisfies the safety property. Separately, the set of finite prefixes of satisfying traces is prefix-closed: every prefix of a good prefix is itself a good prefix, in the sense that it is not already a bad prefix. Prefix-closure of the prefix set and limit-closure of the trace set are consequences of the bad-prefix criterion in their respective models; neither is the definition. In this paper's finite-trace proofs, the bad-prefix criterion is the operative test: a violation is witnessed by a finite prefix, as in Definition 8b, where a single unauthorised external effect is already a bad prefix for P_ext.

**Definition 10 (Hyperproperty).** A hyperproperty H is a set of *sets* of traces: a system satisfies H iff its whole trace set Tr(C) belongs to H. Noninterference is a canonical example: it compares pairs of traces that differ in secret inputs and requires their public observations to coincide [16]. No single trace, viewed alone, can witness noninterference or its violation. Hyperproperties differ in their closure properties under trace-set inclusion, and that difference determines whether Theorem 3 transfers them (Section 5.2). A hyperproperty is *downward-closed* if, whenever a trace set satisfies it, every subset also satisfies it; it is *upward-closed* (or existential) if it requires the presence of certain traces, so removing traces can violate it.

### 4.4 Policy updates, atomicity, and audit

**Policy updates.** Policy and invariant definitions are protected state. A policy update is itself a proposal, subject to Auth and Inv like any other, and additionally subject to separation of privilege: the proposer of an ordinary action may not be the authoriser of a policy change that would authorise it. A system in which M can propose "change the policy to allow this, then do this" as a single unmediated sequence has no policy. Clark and Wilson's well-formed-transaction and separation-of-duty ideas [19] are the classical form of this requirement.

**Atomicity.** The kernel's validation and commitment must behave atomically with respect to protected resource state, audit state, and protected external effects: either the whole authorised resource effect and its audit record commit together, or no protected resource effect occurs (and, for a denial, only the denial record is appended). Section 5.2 states this as a proposition with explicit premises, because atomicity is an implementation property (transactions, concurrency control, two-phase commit, or equivalent), not a consequence of writing Definition 6 on paper. A check-then-act race — Auth evaluated on s, Eff committed on a different s' after a concurrent change — violates Definition 6 even if each step looked correct in isolation. In the sequential reference model, atomicity is assumed; in a concurrent implementation, linearizability to the sequential model (S5) must be established.

**Audit.** Every decision, including denials, is recorded in the append-only audit log ℓ, which is part of authoritative state s = (r, ℓ) and is itself protected. A denial therefore changes s (by appending to ℓ) while leaving r unchanged; an allow changes both r and ℓ atomically. If audit logging is intentionally outside authoritative state in a particular deployment, that deployment must state what protects it instead, and its safety claims must be restated without relying on audit integrity. Audit is not an optional extra: without it, a claim of complete mediation is unauditable, and a bypass that leaves no record is indistinguishable from a system that was never attacked. Audit logs that M can rewrite are not audit logs.

### 4.5 Initialisation

Initialisation is part of the system, not a preamble to it. Let s₀ be the boot state. The safety proof requires s₀ ∈ K. For a Qwenputer-style system, this includes: how firmware is loaded into recurrent state, who loads it, what attests that the loaded firmware is the intended firmware, and what prevents a later prompt from reloading it. The draft noted RvChat's role here; the rewrite makes it a proof obligation (PO2) because a system whose boot can be forged has no invariant to preserve — it starts outside K and Theorem 1 never applies.

### 4.6 Refinement

**Definition 11 (Trace refinement).** Let Σ_obs be the observation alphabet: the resource-state projection, proposal, decision, and external effect at each step, as defined in Definition 8. A step in Σ_obs is an observable operation as defined in Section 5.5: a kernel decision step, or an effector step that produces a protected effect. Internal steps (proposer reasoning, token generation presenting no proposal, kernel internal computation before a decision) are not in Σ_obs and are excluded from traces a priori, not removed post hoc. Let I ⊆ K be the set of permitted initial states. Implementation C refines specification F, written C ⊑ F, iff Tr(C) ⊆ Tr(F) over Σ_obs, I, and a stated execution domain (input range, programme class, sequence-length bound, and numerical tolerance, where applicable). Finite traces are included, and infinite traces are included as limits; termination is as in Definition 8. Refinement means C exhibits no observable trace F forbids. It does not mean C exhibits every trace F permits (that would be a liveness/completeness claim), nor that C's internal states match F's, nor that C is correct about behaviour F does not observe. Refinement proofs must state Σ_obs, I, and the domain; a refinement proved for a finite domain does not transfer to inputs outside that domain, and a refinement proved for an observation model that omits a channel proves nothing about that channel.

*Probabilistic behaviour.* M is modelled as an untrusted proposer with an unrestricted output distribution. For safety purposes, this paper treats the support of that distribution — every proposal M could generate — as the relevant set, so trace-set inclusion over the support is the refinement criterion. A quantitative refinement (for example, requiring that C's trace *distribution* be included in or close to F's) is a stronger, distinct criterion and is out of scope here; it would require a probabilistic refinement model and a stated metric, and must not be inferred from trace-set inclusion alone.

*Hyperproperties.* Trace inclusion transfers downward-closed hyperproperties and pointwise trace properties, but not hyperproperties in general. Standard noninterference formulations are downward-closed under trace-set inclusion when the observation model and low-equivalence relation are fixed (Section 5.2, Lemma 2), so trace inclusion does transfer them under those conditions. More general information-flow guarantees — including those that require the existence of indistinguishable traces, that change the observation model or low-equivalence relation under refinement, or that impose quantitative bounds — may require a stronger relation, such as a relational refinement, bisimulation, or an explicitly noninterference-preserving correspondence, stated separately for each claim.

---

## 5. Main results — and their limits

### 5.1 Theorem 1: Invariant preservation

**Assumptions for Theorem 1.** (i) The initial state s₀ ∈ K, with s₀ = (r₀, ℓ₀) and ℓ₀ satisfying Inv_A. (ii) F is as in Definition 6, over the sequential reference model (S5). (iii) Auth, Eff, and Inv_R are as specified in Definitions 3–5. No assumption is made about M's output distribution.

**Theorem 1.** If s₀ ∈ K, and F is as in Definition 6, then every state reachable from s₀ via →_F belongs to K.

*Proof.* By induction on the number of steps n. Base: n = 0, s₀ ∈ K by assumption. Inductive step: suppose sₙ ∈ K after n steps. Consider the next proposal a. If F(sₙ, a) denies, the resource component is unchanged and ℓ is appended to, so by Lemma 1 the next state is in K. If F allows, then by Lemma 1 the next state is in K and Auth holds. Hence sₙ₊₁ ∈ K. By induction, every reachable state after any finite number of steps is in K. ∎

*What this proves, and what it does not.* Theorem 1 proves that *the abstract kernel* preserves K. It does not prove that any particular neural architecture, compiled circuit, or deployed system *is* that kernel. That transfer is PO7 (implementation refinement). It also does not prove that K is the right set — that is specification adequacy (PO1, Section 5.3.3).

*Relation to the earlier formulation.* The earlier formulation stated the transition-preservation condition as an explicit premise. This is a valid but weak specification-level result: it establishes reachability safety given the one-step preservation property, without establishing that an implementation satisfies that property. The present formulation makes the reference kernel's decision rule explicit and separates its abstract correctness from the implementation-refinement obligation. The central verification task is to establish that the deployed mechanism faithfully implements the specified rule over the claimed domain.

### 5.2 Theorem 2, Theorem 3, and Proposition 1

**Assumptions for Theorem 2.** (i) Every change to protected resource state, and every protected external effect, is mediated by F — i.e. there is no transition on protected state except via F, and effectors perform external effects only after an allow decision for that effect (Definition 8b). (ii) F is as in Definition 6, over the sequential reference model (S5). (iii) The initial protected state belongs to K.

**Theorem 2 (Complete-mediation transfer).** Under assumptions (i)–(iii), every reachable protected state belongs to K, and every reachable trace satisfies P_ext.

*Proof.* By (i), every protected transition is an F transition. By Theorem 1, every F transition from a state in K stays in K. Transitions that do not change protected state and produce no protected external effect cannot, by definition of K as a predicate over protected state, move the protected projection out of K. For external effects, (i) and Definition 8b give that each effect in a trace follows an allow decision for that effect, so P_ext holds. Hence every reachable protected state is in K. ∎

*The premise is the whole theorem.* Theorem 2's content is not its proof, which is short, but its premise (i). Complete mediation is an empirical, architectural claim about *all* paths, including ones the designer did not enumerate (adversary capability A6). Testing can falsify it — one bypass suffices — but testing cannot prove it. That asymmetry is why Experiment 2 is designed as adversarial path enumeration, and why PO5 requires an architectural argument (an inventory of effectors, each bound to F) rather than a test suite alone.

**Assumptions for Theorem 3.** (i) Specification F satisfies a trace property P (every trace in Tr(F) satisfies P). (ii) C ⊑ F as in Definition 11, over the same Σ_obs, I, and domain. (iii) P is a trace property, not a hyperproperty (see scope note below).

**Theorem 3 (Safety transfer by trace refinement).** Under assumptions (i)–(iii), C satisfies P.

*Proof.* Suppose for contradiction C violates P. Then C produces a trace τ ∈ Tr(C) violating P. Since Tr(C) ⊆ Tr(F), τ ∈ Tr(F), contradicting that F satisfies P. Hence C satisfies P. ∎

*Scope, stated precisely.* Theorem 3 holds for *any* trace property P, safety or otherwise, by pure set inclusion. The restriction to safety properties matters in practice for a different reason: trace inclusion is almost never *proved* for arbitrary properties without first reducing to safety, because safety properties are the ones a monitor can check prefix by prefix (Schneider [4]). For hyperproperties, the correct distinction is as follows.

Trace inclusion transfers properties defined pointwise over individual traces. It does not, in general, transfer arbitrary hyperproperties, which constrain sets of traces or relations among executions. Whether a particular hyperproperty is preserved depends on its closure properties and on the refinement relation. For example, standard noninterference formulations are downward-closed under trace-set inclusion when the observation model and low-equivalence relation are fixed. More general information-flow guarantees may require relational refinement, bisimulation, or an explicitly noninterference-preserving correspondence between executions.

**Lemma 2 (Downward closure of standard noninterference).** Let NI be the hyperproperty: for all traces τ₁, τ₂ ∈ Tr with identical low inputs, the low observations of τ₁ and τ₂ are identical, where low observations and low-equivalence are defined by a fixed observation model. If Tr(F) satisfies NI, then any Tr(C) ⊆ Tr(F) satisfies NI under the same observation model and low-equivalence relation.

*Proof.* Take any τ₁, τ₂ ∈ Tr(C) with identical low inputs. By inclusion, τ₁, τ₂ ∈ Tr(F). Since Tr(F) satisfies NI, their low observations are identical. Hence Tr(C) satisfies NI. ∎

Lemma 2 corrects an error in the previous version, which used noninterference as a counterexample to trace inclusion. Noninterference is not such a counterexample under the usual trace-set definition, provided the observation model and equivalence relation remain fixed. What trace inclusion does *not* transfer in general is: (a) hyperproperties that are not downward-closed, such as existential properties requiring that certain traces be present; (b) hyperproperties under a refinement that changes the observation model (for example, an implementation that exposes additional observations, so low-equivalence in the implementation is finer than in the specification); and (c) quantitative or possibilistic information-flow properties whose statement depends on the whole trace set, such as the number of distinguishable low observations. Each such claim requires a separately stated refinement relation.

**Assumptions for Proposition 1.** (i) Rejection is atomic in the sense of Section 4.4: a denial appends only its denial record, with no resource mutation and no partial visible mutation. (ii) No protected external effect occurs before authorisation for that effect (Definition 8b).

**Proposition 1 (Rejection and protected-state integrity).** Under assumptions (i)–(ii), a rejected proposal leaves protected resource state unchanged, while appending exactly one denial record to the audit log.

*Argument.* By Definition 6, a denial defines r' = r and ℓ' = ℓ ∥ deny(s, a), with no committed resource transition. Atomicity ensures no partial resource mutation becomes visible, and the no-early-effect premise ensures no external effect escaped before the decision. Hence protected resource state before and after rejection is identical, and the audit log differs only by the appended denial record. ∎

*Why this is a proposition with premises, not a theorem about real systems.* Real systems routinely violate the premises: a tool call that sends a request and then checks authorisation on the response, a file write that is buffered and flushed on denial, a transaction that logs a partial write before rolling back. Proposition 1 tells an implementer what to check, not what is true. Experiment 3 (failure injection at validation, authorisation, commitment, and audit stages) is the test of those premises.

### 5.3 What a runtime monitor cannot guarantee

#### 5.3.1 Liveness

Safety says something bad never happens; liveness says something good eventually happens [3]. A monitor that only rejects can preserve safety indefinitely by rejecting everything — including every useful action. That is not a bug in the monitor; it is the definition of a truncation monitor. Liveness requires additional, separate assumptions: that a safe action is eventually proposed, that the environment eventually supplies a required event, that scheduling is fair, and that resources are available. None of those follows from Theorems 1–3.

The edit-automaton extension [5] mitigates but does not dissolve the problem: a kernel that substitutes a safe default action can guarantee *some* progress (the default action occurs) but not that the *intended* task completes, and the default must itself be authorised and invariant-preserving. A rejection-only monitor can preserve safety while preventing all useful progress. Liveness guarantees therefore require additional assumptions concerning scheduling, resource availability, environmental behavior, and the existence of admissible actions.

#### 5.3.2 Information flow

General information-flow policies are hyperproperties [16]: they concern relationships between multiple executions — whether varying a secret input can change a public observation. A single-trace monitor that checks "is this action authorised?" cannot, in general, establish such a relational property, because authorisation of each individual action is compatible with a leak across actions (e.g. each of two authorised reads reveals one bit, jointly revealing a secret; or the *pattern* of denials reveals secret-dependent information).

This is not a claim that information flow cannot be enforced by a kernel, nor that trace inclusion never transfers a hyperproperty. By Lemma 2, standard noninterference is transferred by trace inclusion when the observation model and low-equivalence relation are fixed; the gap for a monitor is that a per-action authorisation check does not, by itself, establish that the trace set satisfies the relational property in the first place. seL4 [8] proves confidentiality and noninterference, but it does so over a precisely modelled system with capabilities, a verified kernel, and a proof that relates executions — not by adding a per-action "is this a leak?" check. The Frozen Spine can *support* information-flow enforcement by carrying security labels, enforcing declassification only through authorised, audited operations, and isolating principals — but those are additional mechanisms with their own proofs (PO8), not corollaries of Theorems 1–3. Classical label models that such a mechanism could implement include Bell–LaPadula for confidentiality [17] and Biba for integrity [18]; neither is proved or implemented in this paper, and neither follows from Theorems 1–3 alone. Covert channels (timing, resource contention, denial patterns) remain out of scope unless explicitly modelled; a kernel that is silent about them has not proved anything about them.

#### 5.3.3 Specification correctness

A verified implementation can faithfully enforce an incorrect policy. If K omits an invariant that matters (say, "a file deleted by one principal must not be restorable by another without audit"), or Auth grants an authority the principal never intended, Theorems 1–3 remain valid relative to an incorrectly specified invariant. Threat modelling, independent specification review, and adversarial review of K and Auth are therefore not "future work" to be appended; they are PO1, and they are the part of the work that cannot be automated away by a proof assistant. The proof assistant checks that the implementation matches the specification; humans must check that the specification matches the world.

### 5.4 Theorem 4: Conditional failure of mediation and tamper resistance

This section states the paper's central conditional result. It is deliberately narrower than the unconditional separation claim in the previous version, because the unconditional version did not follow from its definition alone: optional invocation does not, by itself, prove a bypass exists if effectors reject operations lacking a valid authorisation result, and writable state does not, by itself, prove that a particular security-relevant overwrite is possible. The conditional version below makes those antecedents explicit, so that a reviewer can check them rather than dispute them.

**Assumptions for Theorem 4.** Let M be an untrusted proposer (adversary P), F an enforcement mechanism, and E a protected effector. Complete mediation is as in Theorem 2, assumption (i); tamper resistance means the watched party cannot alter F's decision procedure or its security-relevant state in a way that defeats its security policy. Weight modification by a party holding the weights (adversary W) is a separate case, stated separately below, not an implicit extension of the inference-time argument.

**Theorem 4 (Conditional failure of mediation and tamper resistance).**

1. If there exists an execution path by which M can cause a protected effect without an authorization decision that is equivalent to the decision specified by F, then complete mediation by F does not hold.
2. If M can modify security-relevant state of F so that an unauthorized proposal is accepted, or can alter or disable the decision procedure itself, then F is not tamper-resistant with respect to that adversary.
3. Compiling F into model weights does not, by itself, establish that either of these conditions is absent.

*Proof.* The first claim follows directly from the definition of complete mediation: a protected effect occurs along a path that is not mediated by the required authorization decision. The second follows from the definition of tamper resistance: the adversary can alter the enforcement mechanism in a way that defeats its security policy. The third follows because weight compilation alone specifies neither the set of accessible execution paths nor the adversary's authority over runtime state, effectors, and deployed weights. Those properties require separate architectural arguments and evidence. ∎

*What Theorem 4 does and does not establish — formal result versus security significance.* Theorem 4 is a formal result, in the evidence classification of the Scope and evidence section: it derives its conclusions from its stated antecedents. Its first two clauses are close to consequences of the definitions of complete mediation and tamper resistance, and the paper does not present them as a surprising impossibility theorem. Their value is that they make the failure conditions explicit and testable: antecedent (1) becomes the inventory and path-enumeration question in PO5 and Experiment 2, and antecedent (2) becomes the state-isolation question in PO5 and Experiments 5 and 8, with concrete instances in Section 5.5. The proposed research contribution is therefore not Theorem 4 in isolation, but the framework in Sections 4–5 and 8–9 for checking whether a real model-integrated architecture satisfies or violates those conditions. Theorem 4 does not, by itself, establish that any particular system satisfies antecedent (1) or (2). Whether a given architecture satisfies them is an empirical and architectural question, to be settled by the inventory in PO5 and by Experiments 2, 5, and 8 — not by citing Theorem 4. In particular, a system in which effectors reject every operation lacking a valid authorisation result does not satisfy antecedent (1) merely because invocation originates inside the model; and a system whose recurrent state is shared does not satisfy antecedent (2) merely because sharing exists — it satisfies (2) only if a demonstrated overwrite changes a security-relevant decision.

*Separate case: weight-holder adversary (W).* If a party holding the weights can modify F's compiled circuit (by fine-tuning, quantisation, pruning, or direct editing) and deploy the modified weights without detection, then F as deployed is not tamper-resistant with respect to W, by the same definitional argument as (2), with W in place of M. This is a distinct threat-model case from inference-time token generation, and a defence against W (weight attestation, Experiment 8) is distinct from a defence against P (effector-side mandatory invocation and state isolation). A paper that cites weight compilation as tamper resistance must state which adversary it defends against, and provide the corresponding evidence.

*Implication for hybrid designs.* The mechanisms that would prevent antecedents (1) and (2) from holding are complementary, not interchangeable alternatives, and the exact combination required depends on the threat model. Table 1 states what each mechanism addresses, what it does not address, and the assumptions it requires.

| Mechanism | Threat addressed | Threat not addressed | Required assumption |
|---|---|---|---|
| Mandatory effector-side mediation | Proposer bypassing the authorisation decision (Theorem 4(1)) | Runtime-state tampering; weight modification by W | Effector is trusted, correctly implements the check, and cannot be reached through an unmediated interface |
| State isolation (privilege separation, enclave, hardware) | Proposer modifying security-relevant enforcement state (Theorem 4(2), adversary P) | Bypass through an unmediated effector; weight modification by W | Isolation boundary is correctly implemented and its assumptions hold at runtime |
| Weight attestation | Deployment of weights other than the verified weights (adversary W) | Runtime-state tampering; optional invocation; bypass | Attestation system, measurement, and verification chain are trusted and correctly implemented; attestation does not, by itself, constrain runtime state |
| External interpreter mediating all effects (e.g. CaMeL [15]) | Policy enforcement for effects it mediates, if it is the sole path to those effects | Effects outside its mediation; its own security assumptions; weight modification by W unless combined with attestation | Interpreter is trusted, all relevant effects are mediated by it, and no side channel bypasses it |

A system supplying mandatory mediation, state isolation, and, where W is in scope, weight attestation is a hybrid system with an external trust anchor, and its proof must cite that anchor and its assumptions. That hybrid is a legitimate research target; it is not the claim that compiled weights alone are a reference monitor, and no single row of Table 1 is sufficient on its own.

*Corollary (the Qwenputer implication, stated conditionally).* Qwenputer's CPU, as described [13], uses invocation via a tool-call format and RAM in shared recurrent state, with boot via an external driver. Whether that architecture satisfies Theorem 4's antecedents (1) or (2) *as an enforcement mechanism* is not established by the CPU benchmarks, and this paper does not claim that it does. Qwenputer therefore cannot, on the evidence cited here, be cited as a Frozen Spine enforcement mechanism. The follow-up claim in Agrawal's oversight post — a monitor "the model can't switch off or edit" [14] — is, on the evidence published so far, a hypothesis in a blog post, not a proved property, and it is in tension with the author's own companion finding that hybrid models can learn to hide reasoning in RNN state and evade chain-of-thought monitoring [13]. Both follow-ups require the experiments in Section 9; at minimum, the hiding result shows that recurrent state is a potential covert channel, not a protected enclave, unless a boundary is added and demonstrated.


### 5.5 Adversary game, observation model, and refinement for the ledger

Theorem 4 is stated conditionally so that its antecedents can be checked on a concrete architecture. This section makes that check explicit for the ledger in Section 7, by defining an observation model, an adversary game, and a refinement relation, and by exhibiting counterexamples for each failure mode. The ledger is chosen because its state, policy, and effects are small enough that each counterexample can be written out in full.

**What counts as a step: observable operations only.** This definition is stated first, because the refinement relation below depends on it. An *observable operation* is one of the following: (a) a kernel decision step, in which a proposal a is presented to F and F returns allow or deny; (b) an effector step, in which an effector produces a protected effect (a transfer committed, a policy changed, an ownership changed) on the basis of a proposal, whether or not the kernel was invoked. Internal steps are not observable operations and are not steps in a trace at all: proposer internal reasoning, model token generation that presents no proposal, and kernel internal computation before a decision is returned do not count, are not audited, and are not removed post hoc — they are excluded a priori from the trace alphabet. A kernel decision with no effect is still an observable operation, because a denial is a decision that must be audited (Proposition 1); a bypass step with d = none is an observable operation exactly when it produces an effect, as in C1 and C3 below. There is therefore no conflict between "exactly one audit record per step" and "no-effect steps need no record": the first statement is about observable operations, and the second, correctly understood, is about internal steps, which are not operations in this model.

**Observation model.** For the ledger, an observable step is a tuple (r, a, d, e), where r is the resource state after the step, a is the proposal presented to the kernel or effector, d ∈ {allow, deny, none} is the kernel decision (none only for an effector step in which the kernel was not invoked, and then only when e is a protected effect), and e ∈ {transfer committed, policy changed, ownership changed, no effect} is the external effect actually produced (no effect occurs only for kernel denial steps, which are observable operations for audit purposes even though they produce no resource effect). The audit log ℓ is not part of the observation available to the proposer in this model, except through its length, which equals the number of observable operations taken. Two traces are low-equivalent in the sense of Lemma 2 when they agree on low inputs and on the low projection of this observation; the ledger example does not itself carry a secret input, so Lemma 2 is used here only to fix the observation model, not to claim a noninterference result for the ledger.

**Refinement relation.** An implementation refines the ledger specification if: (i) its initial resource state is ((100, 0, v1, (owner_A, owner_B))) in the Section 7.1 notation, or ((3, 0, v1, (owner_A, owner_B))) in the bounded checker notation; (ii) every observable trace it produces is a trace of the specification, where the specification's traces are exactly those generated by the kernel in Definition 6 from the initial state, over observable operations as defined above (internal steps are excluded from both trace sets, so no post hoc removal is needed); and (iii) its audit log contains exactly one record per observable operation, in order, with the decision recorded matching d (for an effector bypass step, there is no kernel decision to record, so the specification has no such step at all, and the implementation trace fails (ii) before (iii) is reached; for a kernel decision step, a missing, altered, or reordered record fails (iii)). Condition (iii) is the audit part of refinement; a trace that satisfies (i)–(ii) but whose log is missing, altered, or reordered does not refine the specification, even if its resource states are correct.

**Adversary game.** The game is played in rounds. In each round, adversary P chooses a proposal a, an invocation choice (invoke F, or go directly to an effector), and, where the architecture permits it, a direct state write. The kernel, if invoked, responds with allow or deny per Definition 6. The effector then produces an effect: an *honest* effector produces an effect only after an allow decision for exactly that effect; a *bypass* effector produces the effect on the proposer's instruction alone. P wins if any of the following occurs: (W1) a protected effect occurs without an equivalent allow decision; (W2) r violates Inv_R; or (W3) ℓ is altered, deleted, or missing a record for an observable operation that occurred. The kernel strategy "allow exactly when Auth, Eff defined, and Inv_R(Eff) hold, and append exactly one record per observable operation" is winning against P in the honest-effector, state-isolated game, by Theorems 1–2 and Proposition 1. The counterexamples below show how each deviation from that game gives P a winning move.

**Counterexample C1: optional invocation with a non-mediating effector (Theorem 4(1)).** Initial state r = (100, 0, v1, (owner_A, owner_B)), ℓ = []. P presents Transfer(A, B, 200, owner_A) directly to a fast-transfer effector that does not invoke F. The effector commits the transfer: r' = (-100, 200, v1, (owner_A, owner_B)), e = transfer committed, d = none. This is an observable operation under the definition above, because it produces a protected effect, even though d = none. Result: Inv_R fails (bal_A < 0, although the sum is preserved), P_ext fails (a transfer effect without an allow decision for that transfer), and the implementation trace is not a specification trace, so refinement fails. This is the precise sense in which optional invocation defeats mediation: the failure is not that invocation was optional in the abstract, but that an effector exists that acts without an allow decision. If that effector instead rejected every operation lacking a valid authorisation result, C1 would not be a winning move for P, and antecedent (1) would not hold for that architecture.

**Counterexample C2: writable security-relevant state (Theorem 4(2), adversary P), within the exact state of Section 7.1.** Initial state r = (100, 0, v1, (owner_A, owner_B)), ℓ = []. P writes directly to the owner component of r, outside the kernel, changing owner to (attacker, owner_B). This write is not an UpdateOwner proposal and is not authorised by the policy author; it violates T5, which permits owner changes only on an authorised UpdateOwner. P then presents Transfer(A, B, 100, attacker) to F. F, reading the altered record, finds Auth true (owner[A] = attacker), Eff defined, and Inv_R preserved, and allows: r' = (0, 100, v1, (attacker, owner_B)). Result: the transfer is authorised with respect to the altered record, but not with respect to the original owner record; the implementation trace, including the unmediated owner write, is not a specification trace from the initial state, because specification traces change owner only on authorised UpdateOwner steps, and refinement fails. The counterexample is therefore stated within the exact state defined in Section 7.1, not as an extension of it: owner is a component of r, I5a is its state well-formedness condition and T5 is its authorised-transition condition, and the direct write violates T5. That distinction is also the artifact's claim, stated precisely: the checker's C2 is an executable state-tampering witness, not a bounded enumeration of an in-system ownership-write transition. It constructs the original state and, separately, the tampered state, and shows that the same proposal is denied in the first and allowed in the second. It does not enumerate the direct write as a transition, because such a write is outside the reference system's transition relation by definition; enumerating it as if it were a kernel step would misstate what is being demonstrated. This also shows why shared substrate alone is not the claim: C2 requires a demonstrated write to a security-relevant record that changes a decision, not merely that P and F share a computational substrate.

**Counterexample C3: forged authorisation claim (Theorem 4(1), via effector trust).** Initial state as above. P presents Transfer(A, B, 100, attacker) to an effector that accepts the proposer's claim "the kernel allowed this" without checking a kernel decision, for example by accepting a model-generated allow token as proof. The effector commits the transfer: r' = (0, 100, v1, (owner_A, owner_B)), d = none, e = transfer committed. This is an observable operation, because it produces a protected effect. Result: P_ext fails, and the implementation trace is not a specification trace (condition (ii) fails, because the specification has no bypass step); the audit log also contains no allow record for the committed transfer, so condition (iii) fails as well. The defence is not a stronger token, but effector-side verification of the actual kernel decision — mandatory mediation, Table 1 — or an effector that only acts on a decision it obtained itself from F.

Together, C1–C3 give the separation discussion a testable form for this example: a proposed model-integrated ledger must show, for each counterexample, which architectural feature blocks the winning move — an effector that rejects unmediated operations (C1), state isolation that prevents the direct record write (C2), or effector-side verification of the kernel decision rather than trust in a proposer claim (C3). A design that blocks all three, for its stated domain and threat model, is a candidate for refinement; a design that blocks none is not, regardless of whether its computation is compiled into weights.

## 6. The Qwenputer case study, scrutinised

This section does what the draft did not: it separates Qwenputer's engineering achievement from the security inference sometimes drawn from it, and it records the project's own limits as evidence.

### 6.1 What Qwenputer is

Qwenputer [13] is Qwen3.5-4B with a RISC-V CPU compiled into its weights. The CPU is RV32IM plus the Zba extension and a small bignum unit, occupying 11 layers placed before Qwen's own 32 layers, with no learned weights in the added layers. Qwen's original weights are unchanged; the computer is added in extra dimensions and layers. The CPU uses Qwen's Gated DeltaNet layers [11] as RAM: the gate is set to 1 (nothing fades), the write strength β is set to 1 (the old value along a direction is fully replaced), and one-hot keys and queries address single rows of the recurrent state matrix, so each row functions as a memory cell holding registers, programme data, and the programme counter [13].

Execution proceeds as the model decodes: each instruction becomes a few generated tokens (ADDR, VAL, STEP), which are the CPU's execution trace. The model invokes the CPU by piggybacking on the tool-call format it is already trained on; no external tool call or runtime is used for the computation itself. A small driver, RvChat, loads firmware into the Gated DeltaNet state and keeps trace tokens out of Qwen's layers [13].

An experimental in-model filesystem is also described, on a separate branch: filenames hash into 1,024 directory slots, file text is stored in other heads at eight tokens per row, chained, with linear probing on collision, holding up to 512 files or about 53,000 tokens of text, and persisting across conversations if state is saved and reloaded [13]. That filesystem is explicitly experimental and is not part of the core CPU claim; it is noted here because a persistent in-model store is exactly the kind of protected state a Frozen Spine would have to mediate — and because persistence across conversations via saved state raises the boot-integrity question (PO2) in its sharpest form: saved state reloaded is a new boot, and must be attested as such.

### 6.2 What is reported, with its evidential grade

The following table quotes the project blog [13] and, where noted, secondary reporting of the model card. All numbers are **project-reported**; this paper did not reproduce them, and no independent reproduction is claimed.

| Claim | As reported | Grade and caveat |
|---|---|---|
| Instruction set | RV32IM + Zba + bignum unit | Project-reported; architecture description in blog and code. |
| Test suites | Passes the official riscv-tests; programmes match QEMU | Project-reported; test list and QEMU version not detailed in the blog. Replication requires the repository's test harness (Appendix D). |
| Free-running execution | 18 million instructions free-running without a single error, with no reference machine correcting it between steps | Project-reported; "free-running" is defined in the blog, which strengthens the claim relative to step-corrected replay, but the programme(s) run are not specified in the blog text. |
| Replay exactness | About 230,000 output positions replayed against a reference machine, zero mismatches | Project-reported; domain and programme coverage for those positions are not specified in the blog. Zero mismatches on a tested domain is not a proof of exactness on all inputs. |
| Arithmetic vs. base model | DeepMind sets: div_big 97.5% (vs. 95% with a Python tool, 72.5% base); mul_big 97.5% (vs. 100% tool, 55% base); mul_div_multiple_longer 100% (vs. 97.5% tool, 90% base); add_or_sub_big 97.5% (vs. 97.5% tool, 87.5% base). NUPA long-integer arithmetic: 48.6% → 100%, same as with a Python tool. | Project-reported; greedy decoding as reported in secondary coverage of the model card. Sample sizes and prompts are not stated in the blog for these sets. The comparison to a Python tool is informative but not a security comparison: a tool is also an external executor, and matching it on arithmetic says nothing about authorisation. |
| Effect on ordinary text | Normal text within noise of base Qwen: KL divergence 6e-4, against a noise floor of 5e-4 | Project-reported; the margin above the noise floor is small, which supports "does not noticeably change ordinary text" but does not prove "does not change anything." KL on what distribution, over what prompts, is not stated in the blog. |
| Speed and size | Checkpoint 18.8 GB, roughly double base Qwen, mostly zero padding; batched executor about 3,200 CPU tokens per second on an L4 GPU; each CPU instruction costs a few decoded tokens, so large calculations take seconds rather than milliseconds | Project-reported; cost is relevant to Section 10, not to safety. Performance and enforcement correctness are independent evaluation criteria. |
| Limits stated by the author | Needs RvChat to boot firmware and keep trace tokens out of Qwen's layers; does not run with a plain `generate()` call yet; filesystem experimental | Author-stated; treated here as primary evidence about mediation, not as a footnote. |

Three scrutiny points follow from the table, each of which the draft missed or softened:

1. **Determinism is domain-relative.** "Zero mismatches on 230,000 positions" and "18 million instructions without error" are strong *empirical* signals for the tested domain. They are not a proof that the compiled circuit is exact for all programmes, all inputs, and all sequence lengths, and they say nothing about bf16 rounding at the boundaries of the tested domain. A proof of exactness would require a bound on numerical error for the Gated DeltaNet update under the fixed gate/β/one-hot construction, plus a domain statement. That is PO7, and it is undischarged.
2. **The driver is the mediator.** RvChat loads firmware and isolates trace tokens. If RvChat is compromised, bypassed, or simply not used (plain `generate()`), the CPU does not run as described — or, more importantly for security, the *isolation* does not hold. A security architecture whose mediation depends on a driver must prove properties about the driver, not only about the weights. The draft mentioned the driver; it did not draw the conclusion that the driver is currently the reference monitor, if anything is.
3. **Invocation via a trained format is not enforcement.** The fact that Qwen3.5-4B uses the CPU "quite well, without any post-training required" [13] is an engineering success: the format is natural to the model. For security, naturalness cuts the other way: a format the model finds natural is also a format the model can choose not to use, or to imitate without invoking. A monitor must be invoked by the *effector*, not suggested by a format.

### 6.3 The two follow-ups, and why they point in opposite directions

Agrawal's two follow-up posts, linked from the Qwenputer blog [13], deserve separate treatment because they are sometimes cited together as if they supported each other. They do not.

- **Hiding reasoning in RNN state.** The claim is that hybrid models can learn to hide reasoning in recurrent state and thereby evade chain-of-thought monitoring. If true, this is evidence *against* treating recurrent state as observable or protected: it shows recurrent state is a channel the model can use in ways an external monitor cannot see. For the Frozen Spine, the implication is that any monitor whose evidence lives only in chain-of-thought text, or whose state is recurrent state the model writes, is monitorable only if the monitor's channel is separate from the model's writing channel.
- **In-weight monitors the model "can't tamper with" [14].** The claim is that compiled weights can serve as oversight tools — for example, a lie detector with a log inside the weights — that the model cannot switch off or edit. As a hypothesis, it is interesting and testable (Experiment 5 and Experiment 8 in Section 9 are designed to test exactly it). As a *claim*, it is currently unsupported by a proof or by an adversarial test in the published blog material, and it sits in tension with the hiding result: the same recurrent state that can hide reasoning cannot simultaneously be assumed tamperproof merely because the *weights* that read it are fixed. Fixed weights reading writable state is not the same as fixed state. The distinction between weight integrity (the circuit does not change) and state integrity (the circuit's memory cannot be rewritten by the watched party) is addressed by the antecedents in Theorem 4, and any future version of the in-weight-monitor claim must address it directly.

### 6.4 What Qwenputer does establish for this paper

Qwenputer establishes, subject to independent reproduction, a *computational* premise the Frozen Spine programme needs: a non-trivial deterministic machine can be compiled into a production model's weights and run inside forward passes, with its memory in recurrent state, without training the added layers. That premise was not obvious before, and it makes the research question in Section 1.2 a live question rather than a fantasy.

What Qwenputer does not establish — and does not claim to establish in the core blog post — is any authorisation property: not that unauthorised transitions are impossible, not that every path is mediated, not that the monitor (if one were compiled in) could not be bypassed, and not that the system is safe in Anderson's sense. Citing Qwenputer for those properties would be a category error: citing a CPU benchmark for a security proof. This paper cites it for what it is: a compiled CPU, with reported exactness on a tested domain, whose architecture clarifies exactly where a security boundary would have to be added.

---

## 7. A worked example: a ledger the kernel can actually prove

Abstract theorems are easy to state and hard to believe. This section gives a concrete instance small enough to model-check by hand or with a standard checker, so the reader can see Theorems 1–2 operating on real (if tiny) state, and can see where they stop.

### 7.1 The system

A single-ledger system with two accounts, A and B, and an auditor log. State s = (r, ℓ), where r = (bal_A, bal_B, policy_version, owner), balances are non-negative integers, policy_version is an integer, owner is the ownership record owner = (owner_A, owner_B) giving the owner principal of each account, and ℓ is a finite append-only audit log of kernel decisions (allows and denials, in order). Proposals are transfers: a = Transfer(from, to, amount, principal), plus a policy-update proposal UpdatePolicy(new_version, authoriser) and an ownership-update proposal UpdateOwner(account, new_owner, authoriser).

Invariants (K = Inv_R ∧ Inv_A):
- **I1 (non-negativity, resource):** bal_A ≥ 0 and bal_B ≥ 0.
- **I2 (conservation, resource):** bal_A + bal_B = TOTAL, a constant fixed at boot.
- **I3 (log integrity, audit):** ℓ is append-only (no entry can be removed or altered); every allow decision for a transfer appears in ℓ, and every denial appears in ℓ as a denial record. Note that ℓ records decisions, not only committed transfers: a denied transfer appears as a denial, not as a committed transfer.
- **I4 (policy currency, resource):** policy_version equals the version signed by the policy author; an unsigned or stale version is not in K.
- **I5a (ownership well-formedness, resource state condition):** owner is a pair of principals, one per account. This is the part of ownership integrity that Inv_R checks, by inspecting the current resource state alone, and it is the part the checker tests through `inv_r`.
- **T5 (authorised ownership transitions, transition condition):** the owner component changes only on an authorised UpdateOwner proposal (see Auth below). This does not follow from inspecting the current resource state alone; it follows from the kernel's transition definition — Auth permits UpdateOwner only when the authoriser is the policy author, and Eff changes owner only for an authorised UpdateOwner. A direct write to owner outside the kernel is not a transition of this system; it violates T5, and it is exactly the failure exhibited in counterexample C2 in Section 5.5. The kernel preserves I5a and its transition definition enforces T5; calling both "I5" blurred that distinction, and they are named separately here.

Authorisation Auth(s, a):
- Transfer: principal equals owner[from] in r, amount > 0, and amount ≤ bal_from. (Note: Auth alone does not guarantee I2; the kernel must also check the resulting state. Delegation, if added, would be a further component of owner or a separate delegation record in r, with its own Auth clause; it is not assumed here.)
- UpdatePolicy: authoriser is the policy author, the new version is signed, and new_version > policy_version. No ordinary principal may update policy, and in particular the proposer of a transfer may not authorise a policy update that would authorise that transfer (separation of privilege, Section 4.4).
- UpdateOwner: authoriser is the policy author, account ∈ {A, B}, and new_owner is a principal. No ordinary principal may update ownership, and in particular a transfer proposer may not authorise an ownership change that would authorise that proposer's own transfer.

Effect Eff(s, a): for an authorised transfer, debit `from` and credit `to` in r, leaving policy_version and owner unchanged. For an authorised policy update, replace policy_version in r, leaving balances and owner unchanged. For an authorised ownership update, replace the corresponding component of owner in r, leaving balances and policy_version unchanged. Otherwise undefined. The audit append (allow or deny record) is applied by the kernel as in Definition 6, atomically with any resource change; Eff itself does not append to ℓ.

Kernel F is Definition 6 applied to this Auth, Eff, and Inv.

### 7.2 What the kernel proves, step by step

- **Initial state:** s₀ = ((100, 0, v1, (owner_A, owner_B)), []), TOTAL = 100. I1–I4 and I5a hold by construction, and T5 holds vacuously at the initial state (no transition has yet occurred); s₀ ∈ K. Boot must attest TOTAL, v1, and the initial owner record; if boot cannot attest them, PO2 fails and nothing below applies.
- **A valid transfer** Transfer(A, B, 30, owner_A): Auth holds (owner[A] = owner_A), Eff gives r = (70, 30, v1, (owner_A, owner_B)), I1 holds (70, 30 ≥ 0), I2 holds (70+30=100), I3 holds (ℓ = [allow(t1)]), I5a holds (owner is still a well-formed pair) and T5 holds (owner unchanged by a transfer, which is not an UpdateOwner). Kernel allows. By Lemma 1, the new state is in K.
- **An overdraft** Transfer(A, B, 200, owner_A): Auth fails (200 > 70 after the first transfer, or > bal_from in general). Kernel denies; resource state is unchanged and ℓ appends a denial record (Proposition 1). Proposition 1 applies only if no external effect (e.g. a bank message) was sent before the decision — in this design, the effector is called only after allow, so the premise holds by construction, and Experiment 3 would test that construction.
- **A double-spend via a second interface:** Suppose a second tool, `fast_transfer`, debits A without calling F. That is a complete-mediation failure (Theorem 2 premise (i) violated). The ledger can now show bal_A negative or conservation violated, and Theorems 1–2 say nothing about that trace — correctly, because that trace is not an F trace. The fix is architectural (bind `fast_transfer` to F or remove it), not a stronger proof about F.
- **A policy forgery:** Transfer(B, A, 50, owner_A) where owner_A is not B's owner: Auth fails. UpdatePolicy(v2, owner_A) where owner_A is not the policy author: Auth fails. The model may propose both, in either order, as often as it likes; the kernel's decision does not depend on repetition, persuasion, or prompt wording.
- **An authorised ownership change, and an unauthorised one:** UpdateOwner(A, attacker, author) is authorised (authoriser is the policy author) and changes owner to (attacker, owner_B), after which Transfer(A, B, 100, attacker) would be authorised — but only because the policy author authorised the change, which is a mediated policy decision, not a bypass. UpdateOwner(A, attacker, attacker) is denied, and owner remains (owner_A, owner_B). A direct write to owner outside the kernel, changing owner_A to attacker without any UpdateOwner proposal, is not a kernel transition at all; it is counterexample C2 in Section 5.5, stated now within this exact state model.
- **A valid transfer that would break conservation due to a bug in Eff:** Suppose Eff credited `to` but forgot to debit `from`. Then Inv_R(Eff(s, a)) fails I2, so Definition 6 denies even though Auth held, appending a denial record and leaving r unchanged. This is why the kernel checks the *resulting* state, not only the proposal: Auth is necessary but not sufficient. A kernel that only checks Auth and trusts Eff is not Definition 6, and its proof would be weaker in exactly the place real bugs live.

### 7.3 Model-checking this instance

With balances bounded (say, TOTAL ≤ 3 and amounts ≤ 3), the state space is finite and tiny. An exhaustive checker can enumerate all reachable states from s₀ under F and verify I1–I4 and I5a on every one, and enforce T5 by the kernel's transition rules (Experiment 1; see Appendix E for an executable checker and its results). It can also enumerate the system *without* F — proposals applied directly via Eff — and exhibit the violating traces (overdraft, conservation break) that F prevents. That contrast is the empirical content of Theorems 1–2 for this instance, and it is checkable without trusting the theorems: the checker, not the author, finds or fails to find a counterexample.

The instance also shows its limits: checking the bounded instance proves nothing about unbounded balances, real arithmetic, concurrent transfers (two proposals interleaved — linearizability to the sequential model must be established separately, S5), or a policy language richer than the one above. Those are PO1/PO6/PO8 gaps, and they must be named when the instance is cited as evidence for a larger system. A bounded proof cited as an unbounded proof is a mis-citation, even if the bounded proof itself is correct.

### 7.4 Pseudocode (reference kernel, not production code)

```
def F(s, a):
    # s = (r, log): r = resource state, log = append-only audit log
    # a: proposal; policy: signed policy in r
    r, log = s
    if not Auth(s, a):
        return ((r, log + [deny(s, a)]), "deny")
    if not defined(Eff, s, a):
        return ((r, log + [deny(s, a)]), "deny")
    r_next = Eff(s, a)          # computed on a private copy; not yet committed
    if not Inv_R(r_next):
        return ((r, log + [deny(s, a)]), "deny")
    # atomic commit: resource change + allow record together, or neither
    return ((r_next, log + [allow(s, a)]), "allow")
```

Notes on the pseudocode, because pseudocode is where security proofs most often silently cheat: (i) `Eff` is computed on a copy, so a denied proposal's computed effect never becomes visible; (ii) `commit` and the audit append are atomic together, so a crash between them cannot produce a committed effect with no record, or a record with no effect; (iii) `Auth` and `Inv` are evaluated on the *same* s that `Eff` starts from — if a concurrent writer changes s between Auth and commit, the kernel must re-validate or serialise, otherwise Definition 6 is violated by a time-of-check/time-of-use race. A production kernel must implement (iii) with locking, versioning, or transactional isolation, and PO6 exists to force that implementation choice into the open.


## 8. Proof obligations

A claim that the Frozen Spine has been integrated into a neural architecture — or, more modestly, that it has been deployed as an external kernel — should not be accepted until the following obligations are addressed. Each obligation names the evidence type that can discharge it, because "we tested it" and "we proved it" are different evidence types and must not be conflated. Testing can falsify; only proof (or exhaustive checking over a stated finite domain) can establish a universal claim, and even then only over that domain.

**PO1. Specification adequacy.** Define protected state, relevant external effects, authorisation policy, and invariants. Identify which threats are outside the model (A1–A6, Section 3.2, and any deployment-specific threats). *Evidence:* a written specification, independently reviewed, with an explicit out-of-scope list. A specification with no out-of-scope list is incomplete, because it implicitly claims to cover everything.

**PO2. Initial-state validity.** Establish that initialisation and boot produce a state satisfying the required invariants, including firmware loading, policy loading, and any saved-state reload. For Qwenputer-style systems, this includes examining how the external driver initialises firmware and recurrent state, and what attests that initialisation. *Evidence:* a boot proof or attested boot measurement, plus a test that a forged boot state is rejected.

**PO3. Authorisation soundness.** Prove that every committed protected operation satisfies the applicable authorisation predicate. *Evidence:* a proof that the kernel's allow path implies Auth (Lemma 1's allow direction, for the real implementation), plus adversarial tests that attempt to commit without authorisation through malformed, stale, replayed, and confused-deputy proposals.

**PO4. Invariant preservation.** Prove that every accepted transition preserves the specified safe state space. *Evidence:* an inductive proof (Theorem 1's pattern, instantiated) or exhaustive model-checking over a stated finite domain, plus a statement of the domain's limits.

**PO5. Complete mediation and tamper resistance.** Establish that every path to protected state changes passes through the enforcement mechanism and that the watched party cannot rewrite or disable that mechanism. *Evidence:* an architectural inventory of *all* effectors and interfaces, each bound to F, plus an adversarial path-enumeration test (Experiment 2). For an in-model claim, this obligation additionally requires the complementary boundary evidence in Table 1: mandatory effector-side mediation, state isolation, and, where adversary W is in scope, weight attestation. No single one of these discharges PO5 on its own. Weight compilation alone does not discharge PO5.

**PO6. Rejection atomicity.** Establish that rejected actions and interrupted transactions cannot leave partial protected mutations or unauthorised external effects. *Evidence:* failure-injection tests at validation, authorisation, commitment, and audit stages (Experiment 3), plus a transactional argument for concurrency (locking/versioning/serialisation).

**PO7. Implementation refinement.** Prove that the compiled or deployed implementation conforms to the reference specification over the stated domain, including numerical, recurrent-state, and execution-interface behaviour. For a neural compilation, this includes a domain statement (input range, sequence-length bound, programme class), a numerical error bound (notably for bf16 Gated DeltaNet state), and a statement of what happens outside the domain (deny, not "best effort"). *Evidence:* a refinement proof, a verified compilation argument, or exhaustive equivalence checking over a finite domain (Experiment 4). Random testing is not refinement evidence, though it can falsify refinement.

**PO8. Composition and observation coverage.** Establish that the verified properties survive integration with the model, driver, tools, storage, and external environment. Specify which side channels and information-flow properties are covered and which remain unproved. *Evidence:* an integration argument that composes the kernel proof with the driver, effector, and audit proofs, plus an explicit uncovered-channel list (timing, denial patterns, resource contention, and any other channel not modelled). A composition claim with no uncovered list should be treated as unproved.

Satisfying only PO3 and PO4 would establish useful properties of a local kernel, but not the claim that a complete neural agent cannot bypass it. That sentence, retained from the draft, is the single most important sentence in this section, and it is why PO5 and PO8 exist.

---

## 9. Falsifiable experiments

The following experiments are designed to distinguish architectural enforcement from ordinary correct execution. Each has a failure condition that would falsify the corresponding claim *within the tested domain*. Each experiment must be preregistered — domain, hypothesis, threshold, and falsification condition stated before running — so that a passing result cannot be reinterpreted after the fact as a stronger claim than was tested. A note on interpretation is included for each experiment, because the most common error in this area is not a failed experiment but an over-read passed experiment.

### Experiment 1. Reference-kernel invariant preservation

Construct a finite-state agent with explicit authorisation rules and a machine-checkable safety specification (Section 7 is a template). Enumerate reachable states or use a model checker.

**Falsification condition:** a reachable committed state violates a declared invariant while the initial state satisfies the specification's assumptions.

**What passing does not prove:** safety outside the enumerated domain, under unbounded state, or under a different policy. Passing is evidence for the *kernel logic* on that domain, not for a deployed system.

### Experiment 2. Complete-mediation adversarial testing

Attempt protected operations through every available interface, including direct resource access, alternate tool interfaces, malformed requests, replayed authorisations, confused-deputy sequences, and policy-update paths. The interface inventory must be produced *before* testing, by inspecting the system, not by asking the model what interfaces it thinks exist.

**Falsification condition:** any protected state change occurs without passing through an equivalent verified authorisation decision.

**What passing does not prove:** that no bypass exists. Testing alone cannot prove a universal negative. Passing is evidence that the *known* interfaces are mediated; PO5's architectural inventory is what addresses unknown interfaces, and it remains an argument, not a test result.

### Experiment 3. Rejection atomicity and failure injection

Interrupt transactions at different stages — validation, authorisation, commitment, and audit recording — including crashes, timeouts, and concurrent writers. Inspect protected state and external effects afterward.

**Falsification condition:** a rejected or failed operation leaves an unauthorised partial mutation or external effect.

**What passing does not prove:** atomicity under failure modes not injected. The injected set must be stated, and a failure mode outside it (e.g. a storage-layer partial write) remains uncovered until tested.

### Experiment 4. Qwenputer reference equivalence

Run a defined set of authorisation and state-transition programmes through an independent reference implementation and a compiled Qwenputer-style implementation. Begin with a finite domain that permits exhaustive comparison: bounded integers, bounded memory, bounded sequence length, and a stated numerical tolerance (or exactness requirement) for recurrent-state values.

**Falsification condition:** the compiled implementation produces an authorisation decision or committed state that differs from the reference specification for an input within the claimed domain.

**What passing does not prove:** equivalence outside the domain, under longer sequences, larger values, or different programmes. Passing demonstrates equivalence only for the domain and semantics actually tested or formally covered — a sentence the draft stated and this rewrite retains verbatim in spirit, because it is the sentence most often dropped when results are reported.

### Experiment 5. Invocation and bypass analysis

Test whether model-generated proposals can avoid the compiled enforcement pathway, forge a successful authorisation result, alter its initialisation state, or access protected effects through another interface. This includes: prompting the model not to invoke the pathway; prompting it to imitate a successful authorisation response without running the pathway; supplying token sequences that write to the pathway's recurrent state; and fine-tuning or otherwise modifying weights and observing whether the pathway's decisions change in a way the system does not detect.

**Falsification condition:** any unauthorised operation reaches a protected resource without an equivalent verified authorisation check, or any forged authorisation is accepted by an effector.

**What passing does not prove:** that a stronger adversary (with weight access, or with a novel prompt) could not bypass it. Passing against a stated adversary (Section 3.2, capabilities A1–A6) is the claim; passing against "an attacker" in general is not a claim at all.

This experiment directly addresses the difference between embedding a CPU inside a model and establishing that the CPU governs the model's authority. The theorem and the experimental hypothesis must be stated separately: a system passing Experiment 5 against A1–A6 would not refute the conditional Theorem 4. It could show that the tested system does not satisfy one of Theorem 4's antecedents, or that the proposed attack was insufficient to demonstrate a bypass. Conversely, a system failing Experiment 5 would establish antecedent (1) or (2) for that system and domain, which is the empirical content Theorem 4's conditional form requires.

### Experiment 6. Trace-refinement verification

Construct a formal reference model and verify the implementation's observable behaviour using model checking, symbolic methods, or a machine-checked refinement proof.

**Falsification condition:** the implementation admits an observable trace that the reference specification forbids.

**What passing does not prove:** hyperproperties in general (Section 5.2; downward-closed hyperproperties such as standard noninterference under a fixed observation model are transferred by trace inclusion per Lemma 2, but existential, quantitative, or observation-changing hyperproperties are not), behaviour on unobserved channels, or behaviour outside the verified domain. Random testing may discover counterexamples but cannot establish general trace inclusion.

### Experiment 7. Performance and capability comparison

Compare three systems on identical workloads: (a) a conventional model with an external deterministic kernel, (b) a model-integrated computational mechanism, and (c) a hybrid architecture (in-model computation, external authorisation). Measure correctness, authorisation failures (both false allows, which are security failures, and false denies, which are utility failures), latency, throughput, memory use, and successful task completion.

**Falsification condition:** for a *predeclared* performance or capability hypothesis, the integrated architecture fails to meet the specified threshold or introduces a correctness regression.

**Interpretation rule, stated in advance:** if the hypothesis is only that integration is *possible*, performance parity is not a necessary condition; a slower but correct integrated system passes a possibility hypothesis and fails a parity hypothesis. The result must be interpreted according to the claim preregistered for the experiment, not according to whichever interpretation is more flattering after the numbers are in. These experiments distinguish security claims from performance claims: a system may be formally safe but slower, or fast but insufficiently constrained, and both facts can be true at once.

### Experiment 8. Weight and boot attestation (added in this rewrite)

For any in-model claim, measure the deployed weights and boot state, compare them to the verified weights and boot state, and test whether a modified weight set, a modified firmware image, or a reloaded saved state is detected and refused before execution. Test both detection (the modification is noticed) and enforcement (execution does not proceed on modified state).

**Falsification condition:** a modified weight set or boot state executes without detection, or a detected modification is logged but execution proceeds anyway.

**What passing does not prove:** attestation against an adversary who controls the attestation root itself. The trust anchor (hardware root, signing key, or separate privileged measurer) must be stated, and its compromise is out of scope only if that scope statement is explicit (PO1).

---

## 10. Complexity and practical limits

Let N be the number of reachable states and E the number of transitions in a finite explicit-state model. Reachability analysis can be performed in O(N + E) time, assuming constant-time state and transition processing. That assumption is doing real work and must not be hidden: it excludes the cost of evaluating complex authorisation predicates, manipulating large state representations, and checking invariants over rich data. A kernel whose Auth check is a database query, a model call, or a proof search is not O(1) per transition, and its total cost must be stated in those terms.

With m independent Boolean state variables, the state space can contain up to 2^m states. Exhaustive verification therefore becomes infeasible as the model grows, which is why the field uses symbolic model checking (BDDs, SAT/SMT solvers), abstraction, compositional verification, and inductive invariants. Each of those techniques requires justified modelling assumptions: an abstraction that omits a variable that matters to an invariant proves nothing about that invariant, however efficiently it runs. The practical burden is reduced, not eliminated, and the reduction must be justified per invariant, not asserted in general.

For a proposal of size p, q constant-time policy checks, and invariant evaluation cost r, a straightforward kernel has per-action decision cost O(p + q + r). This is a conditional implementation bound, not a guarantee about arbitrary policy languages. If the policy language is expressive enough to make authorisation undecidable in general — the Harrison–Ruzzo–Ullman result [21] is the classical warning — then no kernel can decide it in bounded time, and the policy must be restricted to a decidable fragment before any cost bound is meaningful.

The neural integration introduces additional costs that an external kernel does not: decoding (each CPU instruction costs a few tokens in Qwenputer [13]), recurrent-state operations, initialisation (firmware loading via RvChat), and execution tracing. No formal safety result implies that the integrated architecture is faster or more resource-efficient than an external executor, and the burden of proof for a performance claim is Experiment 7, not Theorem 1. Conversely, a performance cost does not refute a safety claim. Performance and enforcement correctness are independent evaluation criteria.

A final numerical limit deserves emphasis because it is specific to the Gated DeltaNet construction. The one-hot, gate-1, β-1 construction is exact in ideal arithmetic. On real hardware in bf16, matrix operations round. Qwenputer's reported replay exactness (Section 6.2) suggests rounding did not break exactness on the tested domain, but a proof of exactness for a compiled kernel must include an error bound for the actual arithmetic, or a demonstration that the construction's values stay within exactly representable ranges. Until that bound is given, "exact RAM" should be read as "exact on the tested domain, in the tested arithmetic," not as a mathematical identity for all inputs.

---

## 11. Limitations, dual use, and deployment guidance

### 11.1 Limitations of this paper

- **No new implementation is proved here.** Theorems 1–3 are proved for an abstract kernel; PO7 (refinement to a real implementation) is specified, not discharged. A reader who wants a proved deployed system must do the implementation work in Sections 8–9. This paper is a framework and a set of boundaries, not a finished kernel.
- **Qwenputer was not reproduced.** All Qwenputer numbers are project-reported (Section 6.2). If independent reproduction contradicts them, Section 6's computational premise weakens. Theorem 4's conditional logic does not depend on benchmark scores, but whether its antecedents hold for a particular system remains an empirical question.
- **The threat model is stated, not exhaustive.** A deployment with network adversaries, malicious effectors, or a compromised policy author needs a richer model than Section 3.2. The framework extends to those adversaries by adding capabilities and principals, but the extension must be written down for that deployment.
- **Formalism is discrete and synchronous.** The transition system in Section 4 models steps as atomic and sequential. Real agent systems are concurrent, asynchronous, and timed. Extending the framework to concurrency (interleavings, linearisability) and to timed/hybrid behaviour (as in Slagel et al. [7]) is necessary before applying it to a real-time or multi-agent deployment, and is left as future work rather than hand-waved here.

### 11.2 Dual use

The techniques in this paper are dual-use in both directions, and that fact should be stated plainly rather than discovered later:

- A compiled CPU inside a model can be used to *hide* computation: the companion finding that hybrid models can hide reasoning in RNN state and evade chain-of-thought monitoring [13] shows that the same recurrent-state channel that enables exact computation also enables unobservable computation. A Frozen Spine that relies on observing the model's reasoning, rather than on mediating its effects, is vulnerable to exactly this channel.
- A reference monitor, correctly built, is also a powerful control mechanism. The same kernel that prevents unauthorised deletion can prevent authorised-but-inconvenient actions if its policy is written that way. Policy authorship, audit, and separation of privilege (Section 4.4) are therefore not bureaucratic extras; they are the safeguards that distinguish enforcement of a principal's policy from control by whoever writes the policy. A deployment must be able to answer, in writing, who the policy author is, who can change policy, and who audits the auditor.

### 11.3 Deployment implications

If the goal is a system that is actually safe, rather than a paper about safety, the ordering matters:

1. **Deploy the external kernel first.** Bind every effector to F, default-deny, audit everything, and prove PO1–PO4 and PO6 for that kernel on a bounded domain (Section 7's pattern). This is the system Theorems 1–3 actually cover.
2. **Use CaMeL-style structure for prompt-injection risk.** Separate trusted control flow from untrusted data at the interpreter level [15]; do not rely on the model to notice injections.
3. **Treat any in-model computation as untrusted computation.** It may be useful for arithmetic, for planning, for drafting — but its outputs are proposals, subject to F, until the complementary boundaries in Table 1 (mandatory effector-side mediation, state isolation, and, where W is in scope, weight attestation) are supplied and Experiment 5 and Experiment 8 pass against A1–A6.
4. **Do not cite Qwenputer, Tracr, or any compilation result as a security proof.** Cite them as computational precedents, with their domains and limits stated. A citation that upgrades a benchmark into a proof is a mis-citation, and reviewers will — and should — treat it as one.

---

## 12. Conclusion

The Frozen Spine is best understood as a formally specified reference monitor for model-integrated agents — with "model-integrated" read carefully, as "agents that include a model," not as "a monitor dissolved into the model." Its primary safety result is that a system remains within a defined safe state space when it begins in that space and every committed transition is authorised and invariant-preserving. That guarantee extends to the whole system only under complete mediation and an adequate model of protected effects, and it transfers to an implementation only under trace refinement over a stated observation model and domain.

Qwenputer establishes a computational precedent for compiled execution within a neural architecture, not for authorisation enforcement (Section 6). Theorem 4's conditional form (Section 5.4) and its concrete instances in Section 5.5 state when such a monitor would fail; a monitor satisfying neither antecedent is not ruled out by Theorem 4.

The immediate objective is therefore not to compile a larger monitor into larger weights. It is to implement and verify a small external reference kernel, establish its state-transition and mediation properties, and then — with the complementary boundaries in Table 1 (mandatory effector-side mediation, state isolation, and, where W is in scope, weight attestation) in place — test whether a model-integrated implementation refines that specification. The eight proof obligations and eight experiments in Sections 8–9 provide the framework for determining whether the architectural hypothesis survives formal scrutiny, and for recognising, early, the specific experiment on which it fails.

The strongest defensible claim remains the one the draft reached, now with its premises attached: a formally verified mechanism can constrain the operations a system commits, independently of the model's willingness to generate compliant proposals — *provided the mechanism sits where the model cannot route around it*. Theorem 4 should be read in that light: it is a formal characterisation of the failure conditions (an unmediated path, a decision-changing state write), not a surprising impossibility result, and the paper's proposed contribution is the framework for testing real architectures against those conditions. Whether that mechanism can be made intrinsic to a neural computational architecture, without losing the boundary that makes it a mechanism at all, remains an open and experimentally testable question. 

---

## Appendix A. Notation

- S: set of authoritative states. s, s₀, sₙ ∈ S.
- A: set of proposals. a ∈ A.
- K ⊆ S: safe state space. Inv: S → {true, false}; K = {s | Inv(s)}.
- Auth: S × A → {true, false}: authorisation predicate.
- Eff: S × A ⇀ S: partial effect function.
- F: kernel decision procedure, Definition 6; F(s, a) = (s', d), d ∈ {allow, deny}.
- →_F: committed transition relation; reachability is its reflexive-transitive closure.
- τ: execution trace; Tr(F), Tr(C): trace sets of specification and implementation.
- C ⊑ F: trace refinement, Tr(C) ⊆ Tr(F) (Definition 11).
- M: proposer (language model), untrusted for safety purposes.
- PO1–PO8: proof obligations (Section 8). E1–E8: experiments (Section 9).

## Appendix B. Proof details

**B.1 Induction in Theorem 1, made explicit.** The induction is on n, the number of *kernel steps*, not on the number of proposals generated. Denials count as steps with sₙ₊₁ = sₙ, so a trace of any length, including one consisting entirely of denials, stays in K. Infinite traces: Theorem 1 as stated covers finite prefixes; for infinite traces, safety follows by limit-closure of safety properties (Definition 9): if every finite prefix is in K (in the state-invariant sense, every state in the prefix is in K), the infinite trace does not violate the state invariant at any finite point, which is exactly what a state-invariant safety property requires.

**B.2 Why Theorem 3's proof does not need safety.** The proof in Section 5.2 uses only set inclusion. If a reader finds that suspicious, the suspicion is correct in one sense: the proof is *too* easy to be the interesting part of refinement. The interesting part is establishing Tr(C) ⊆ Tr(F) for a real C and F, over a real observation model — which is PO7/Experiment 6, not a two-line set argument. The two-line argument is included so that the burden is visibly placed on refinement, not hidden in a longer proof.

**B.3 Theorem 4, formalised further.** Let Paths be the set of paths from M to a protected effector. Complete mediation requires Paths = Paths_via_F. Theorem 4(1) is the statement that if Paths contains a path not in Paths_via_F that produces a protected effect, mediation fails; it does not assert that such a path exists in every in-model system. Similarly, Theorem 4(2) requires a demonstrated change to security-relevant state or to the decision procedure that defeats the policy, not merely shared substrate. Formalising this as a game (adversary chooses tokens; kernel chooses decisions; adversary wins if an unauthorised effect commits or a decision is forged) makes the antecedents explicit: the adversary's winning strategy, if one exists, must exhibit either an unmediated path or a decision-changing state change. The game formulation is recommended for any future machine-checked version of Theorem 4.

## Appendix C. Version history

v1 (29 October 2026): initial revised paper. v2 (29 October 2026): Theorem 4 replaced by a conditional separation result; state model revised to separate resource state from audit state, s = (r, ℓ); external effects modelled as a trace safety property in addition to state invariants; sequential reference model and linearizability requirement stated explicitly; novelty and evidence claims revised to the classification in the Scope and evidence section; rhetorical passages revised; bibliography entries for Bell–LaPadula, Biba, and Clark–Wilson listed separately; executable ledger model added as Appendix E. Technical corrections from v1 (Schneider citation, Tracr author list, Qwenputer status as project-reported) are retained in the relevant sections. v3 (29 October 2026): hyperproperty discussion corrected (Lemma 2, downward closure of standard noninterference); trust boundaries stated as complementary mechanisms in Table 1; Section 5.5 added (observation model, adversary game, refinement, counterexamples C1–C3); ledger artifact verified with unit tests, full-trace audit checking to depth 3, and a results file; duplicated and argumentative prose trimmed. v4 (29 October 2026, this version): ledger state extended to include the ownership record, with invariant I5 and authorised UpdateOwner, so counterexample C2 is stated within the exact state of Section 7.1; trace and audit semantics in Section 5.5 clarified (observable operations only, internal steps excluded a priori); Definition 9 restated with the bad-prefix criterion first and closure properties stated separately; Theorem 4 framed explicitly as a formal characterisation whose contribution is the testable framework, not a surprising impossibility result; submission package completed with a README and regenerated results. Final consistency pass (29 October 2026, same version, no expansion): checker docstring corrected from 28^depth to 60^depth; I5 split into I5a (state well-formedness) and T5 (authorised transition); C2 described explicitly as an executable state-tampering witness, not an in-system enumeration; README command formatting verified as a fenced block with two separate commands.

## Appendix D. Replication checklist

A reader or reviewer who wishes to check the Qwenputer-related claims should be able to do so from this checklist alone, without asking the author:

1. Clone https://github.com/divagr18/qwenputer and record the commit hash used.
2. Download the checkpoint divagr1925/Qwen3.5-4B-Qwenputer from Hugging Face and record its revision hash.
3. Run the repository's riscv-tests harness and record pass/fail per test, plus the QEMU version used for comparison.
4. Re-run the arithmetic benchmarks (DeepMind sets and NUPA) with the exact prompts, decoding settings, and sample sizes from the repository/model card, and report them separately from the blog's numbers.
5. Replay output positions against a reference machine on a stated programme set and report mismatch count and domain, not only "zero mismatches."
6. Test plain `generate()` without RvChat and record whether the CPU runs and whether trace-token isolation holds.
7. Attempt Experiment 5's bypasses (non-invocation, forged authorisation imitation, recurrent-state overwrite) and record the outcome per bypass, with the adversary capabilities (Section 3.2) stated.

Until steps 1–7 are reported by an independent party, Qwenputer's results should be cited in any subsequent work as "project-reported (Agrawal, 2026)," not as established results. That citation practice is part of the paper's evidence discipline.

---

## Appendix E. Executable ledger model and results

The worked example in Section 7 is accompanied by an executable checker, `ledger_model.py`, delivered with this paper. This appendix reports its exact configuration and results, so that a reviewer can reproduce them without trusting the theorems in Section 5. The checker is an empirical result in the evidence classification of the Scope and evidence section: it exhaustively enumerates a bounded domain. It is not a machine-checked proof, and it does not establish safety for unbounded balances, concurrent transfers, or a richer policy language.

**Configuration.** TOTAL = 3; initial resource state (bal_A = 3, bal_B = 0, policy = v1, owner = (owner_A, owner_B)); initial audit log empty. Proposals: Transfer(from, to, amount, principal) for from ≠ to in {A, B}, amount in {1, 2, 3}, principal in {owner_A, owner_B, author, attacker}; plus UpdatePolicy(v2, authoriser) for each authoriser in the same set; plus UpdateOwner(account, new_owner, authoriser) for account in {A, B} and new_owner and authoriser in the same principal set (60 proposals in total). Authorisation and effect as in Section 7.1, including I5a ownership well-formedness and T5 authorised ownership transitions. Kernel depth 6; unmediated depth 5 (stated explicitly because unmediated balances are unbounded below).

**Artifact contents.** The submitted package contains: `ledger_model.py` (the checker, including the three Section 5.5 counterexamples as executable functions); `test_ledger_model.py` (14 unit tests); `ledger_results.txt` (environment, exact commands, and complete output); and `README.md` (package guide: what each file is, how to rerun, and which assertions are established by code construction versus bounded enumeration). A manuscript alone is not sufficient for verification; the package files are part of the submission. The checker and tests are run with Python 3.12.3 (CPython, Linux) as recorded in `ledger_results.txt`; rerunning the two commands there reproduces the results below. The artifact has been run by the author; it has not yet been independently rerun by a reviewer, and it should not be described as independently reproduced until that rerun has happened.

**Method — what is established by code construction, and what by bounded enumeration.** By code construction: logs are tuples, and every return path in `kernel()` builds a new tuple `log + ((decision, a),)`, appending exactly one record and never mutating a previous log; Auth, Eff, and Inv_R are pure functions of (r, a), so resource-state reachability does not depend on log history. By bounded enumeration: `enumerate_kernel()` performs breadth-first search over resource states to depth 6; `enumerate_full_traces()` enumerates full states (r, ℓ) to depth 3 and asserts, on every transition, that the new log length is the old length plus one, that the old log is a prefix of the new log, and that the appended record matches the decision and proposal. Full-state enumeration is bounded at depth 3 because distinct log histories grow as 60^depth; resource-state enumeration, which does not depend on log history, is bounded separately at depth 6. Unbounded log histories are therefore not claimed to have been enumerated; only the bounded full-trace check and the code construction are claimed.

**Results (run 29 October 2026).**

- Kernel: reachable resource states (depth 6) = 128: balances (0, 3), (1, 2), (2, 1), (3, 0) × policy v1/v2 × owner pairs (4 principals × 4 principals = 16). The full list is in `ledger_results.txt`; the count, not the list, is the claim in this appendix.
- Kernel: resource invariant violations = 0. Decisions explored from expanded resource states: 1,472 allow, 6,208 deny.
- Kernel full traces (depth 3): 219,661 full states enumerated, 219,660 transitions checked for the prefix and exactly-one-append properties, 0 audit invariant violations.
- Unmediated (proposals applied directly via Eff, ignoring Auth and Inv): reachable resource states (depth 5) = 608, of which 480 violate Inv_R (for example, (-12, 15, v1, (owner_A, owner_B))).
- Unit tests: 14 tests, all passing, covering authorisation (valid transfer, unauthorised principal, overdraft, policy author only, owner author only and authorised owner change), denial behaviour (resource preserved, exactly one record appended, sequential-trace prefix property), exhaustive bounded checks, a buggy-effect conservation counterexample, and counterexamples C1–C3 from Section 5.5 (C2 in the checker is an executable state-tampering witness — original state versus separately constructed tampered state, same proposal denied then allowed — not a bounded enumeration of an in-system ownership-write transition, which is outside the reference transition relation; it uses the bounded scale, TOTAL = 3, as the analogue of the paper's TOTAL = 100 example).

**What is checked, and what is not.** Exhaustively checked over the bounded domain: resource invariant preservation under the kernel, audit append-only behaviour on full traces to depth 3, authorisation and denial behaviour on the tested proposals, and the existence of unmediated violating traces. Established by the abstract proofs in Section 5, not by the checker: invariant preservation for unbounded balances, and the conditional separation result. Not established by either: safety for concurrent transfers (which requires linearizability, S5), for a richer policy language, or for any neural implementation. A TLA+ or Alloy model with a machine-checked result would be a stronger artifact for the same instance and is recommended as follow-up work; this Python checker is presented as an executable, reproducible bounded check, not as a substitute for such a proof.

**Interpretation.** Within the bounded domain, the kernel prevents every overdraft and conservation violation that the unmediated system exhibits, and it does so by denying the majority of proposals (6,208 denials against 1,472 allows from expanded states), which is expected for a default-deny kernel over a proposal set that includes unauthorised principals, excessive amounts, and unauthorised policy and ownership updates. The result supports Theorems 1–2 for this instance and domain only.

## References

[1] Anderson, J. P. (1972). *Computer Security Technology Planning Study*. ESD-TR-73-51, U.S. Air Force Electronic Systems Division. https://seclab.cs.ucdavis.edu/projects/history/papers/ande72.pdf

[2] Saltzer, J. H., & Schroeder, M. D. (1975). The protection of information in computer systems. *Proceedings of the IEEE*, 63(9), 1278–1308.

[3] Alpern, B., & Schneider, F. B. (1985). Defining liveness. *Information Processing Letters*, 21(4), 181–185. https://doi.org/10.1016/0020-0190(85)90056-0

[4] Schneider, F. B. (2000). Enforceable security policies. *ACM Transactions on Information and System Security*, 3(1), 30–50. Based on Cornell Technical Report TR99-1759 (1999).

[5] Bauer, L., Ligatti, J., & Walker, D. (2002). More enforceable security policies. Princeton University Technical Report TR-649-02. See also Ligatti, Bauer, and Walker on edit automata and enforcing non-safety properties.

[6] Alshiekh, M., Bloem, R., Ehlers, R., Könighofer, B., Niekum, S., & Topcu, U. (2018). Safe reinforcement learning via shielding. *Proceedings of the AAAI Conference on Artificial Intelligence*, 32(1), 2669–2678. https://doi.org/10.1609/aaai.v32i1.11797

[7] Slagel, J. T., White, L. M., Dutle, A., Muñoz, C. A., & Crespo, N. (2024). A formal verification framework for runtime assurance. *Proceedings of the 16th NASA Formal Methods Symposium (NFM 2024)*, Lecture Notes in Computer Science, vol. 14627, pp. 322–328. https://doi.org/10.1007/978-3-031-60698-4_19

[8] Klein, G., et al. (2009). seL4: Formal verification of an OS kernel. *Proceedings of the ACM SIGOPS 22nd Symposium on Operating Systems Principles (SOSP)*. See also seL4 Foundation, *seL4 Proofs*. https://sel4.systems/Verification/proofs

[9] Lindner, D., Kramár, J., Farquhar, S., Rahtz, M., McGrath, T., & Mikulik, V. (2023). Tracr: Compiled transformers as a laboratory for interpretability. arXiv:2301.05062. https://arxiv.org/abs/2301.05062

[10] Weiss, G., Goldberg, Y., & Yahav, E. (2021). Thinking like transformers (RASP). *Proceedings of the 38th International Conference on Machine Learning (ICML)*.

[11] Yang, S., Kautz, J., & Hatamizadeh, A. (2024). Gated Delta Networks: Improving Mamba2 with Delta Rule. arXiv:2412.06464 (ICLR 2025 camera-ready version, revised March 2025). https://arxiv.org/abs/2412.06464

[12] Schlag, I., Irie, K., & Schmidhuber, J. (2021). Linear transformers are secretly fast weight programmers. *Proceedings of the 38th International Conference on Machine Learning (ICML)*.

[13] Agrawal, D. (2026). Qwenputer: A fully functioning, deterministic RISC-V CPU inside Qwen3.5. Blog post, 22 October 2026. https://divagr.com/blog/qwenputer — Code: https://github.com/divagr18/qwenputer — Checkpoint: Hugging Face, divagr1925/Qwen3.5-4B-Qwenputer. *Project-reported; not peer-reviewed. Cite benchmark and exactness claims from this source as project-reported.*

[14] Agrawal, D. (2026). Building oversight tools into a model's weights. Blog post. https://divagr.com/blog/building-oversight-tools-into-a-models-weights — *Hypothesis post; in-weight monitor tamper-resistance is unproved in the published material.*

[15] Debenedetti, E., Shumailov, I., Fan, T., Hayes, J., Carlini, N., Fabian, D., Kern, C., Shi, C., Terzis, A., & Tramèr, F. (2025). Defeating prompt injections by design (CaMeL). arXiv:2503.18813. Code: https://github.com/google-research/camel-prompt-injection

[16] Goguen, J. A., & Meseguer, J. (1982). Security policies and security models. *Proceedings of the IEEE Symposium on Security and Privacy*.

[17] Bell, D. E., & LaPadula, L. J. (1973). Secure computer systems: Mathematical foundations. MITRE Technical Report.

[18] Biba, K. J. (1977). Integrity considerations for secure computer systems. MITRE Technical Report.

[19] Clark, D. D., & Wilson, D. R. (1987). A comparison of commercial and military computer security policies. *Proceedings of the IEEE Symposium on Security and Privacy*.

[20] ASTM International (2021). ASTM F3269-21, *Standard Practice for Methods to Safely Bound Behavior of Aircraft Systems Containing Complex Functions Using Run-Time Assurance*.

[21] Harrison, M. A., Ruzzo, W. L., & Ullman, J. D. (1976). Protection in operating systems. *Communications of the ACM*, 19(8), 461–471. (HRU undecidability of general access-control safety.)

---

```python

#!/usr/bin/env python3
"""
Executable bounded model for the Frozen Spine ledger example (Section 7).

This is an exhaustive checker, not a machine-checked proof: it enumerates
reachable resource states under the reference kernel F (Definition 6, with
s = (r, log)) up to a stated depth, and verifies Inv_R and Inv_A on every
reachable state. It also enumerates the same proposals applied without F,
to exhibit the violating traces F prevents.

Configuration (exact, as reported in Appendix E, v4):
  TOTAL = 3, initial r = (bal_A=3, bal_B=0, policy=v1, owner=(owner_A, owner_B))
  proposals: Transfer(from, to, amount, principal) for from/to in {A,B},
    from != to, amount in {1,2,3}, principal in {owner_A, owner_B, author, attacker}
  plus UpdatePolicy(v2, authoriser) for authoriser in the same principal set,
  plus UpdateOwner(account, new_owner, authoriser) for account in {A,B},
    new_owner and authoriser in the same principal set.
  Auth(transfer): principal == owner[from] in r, amount > 0, amount <= bal_from.
  Auth(policy): authoriser == 'author' and new version > current.
  Auth(owner): authoriser == 'author'.
  Eff(transfer): debit from, credit to, owner unchanged.
  Eff(policy): replace policy version, owner unchanged.
  Eff(owner): replace owner[account], balances and policy unchanged.
  Inv_R(r): balances non-negative, sum == TOTAL, owner is a pair of principals.
  Owner changes only on authorised UpdateOwner (T5, Section 7.1); a direct
  write to owner outside the kernel is counterexample C2, not a kernel step.
  Owner well-formedness is the state condition I5a, checked by inv_r;
  T5 is the transition condition, enforced by the kernel's Auth/Eff rules.
  Depth: 6 kernel steps for resource states; 5 unmediated steps (balances
    are unbounded below without the kernel, so depth is stated explicitly);
    3 full-state steps for (r, log) traces, because distinct log histories
    grow as 60^depth and full-state enumeration is therefore bounded
    separately from resource-state enumeration.

Audit enforcement in code: `kernel()` never mutates a log. Logs are
tuples, and every return builds a new tuple `log + ((decision, a),)`:
exactly one record appended, previous entries unchanged and in order.
`enumerate_full_traces()` checks this on every transition it explores
(prefix property), and `test_ledger_model.py` checks it on sequential
traces, including that the caller's old log tuple is unchanged after a
kernel call. Audit integrity is therefore established both by code
inspection (tuple immutability, single append in every return path) and
by exhaustive full-trace checking to depth 3, not by inspection alone.

Run: python3 ledger_model.py
Tests: python3 -m unittest test_ledger_model.py -v
Expected output is reproduced in Appendix E and in ledger_results.txt.
Any change to the configuration above changes the expected counts and
must be reported as a new result.
"""
from collections import deque

TOTAL = 3
PRINCIPALS = ["owner_A", "owner_B", "author", "attacker"]
OWNER = {"A": "owner_A", "B": "owner_B"}

def proposals():
    out = []
    for frm in ("A", "B"):
        for to in ("A", "B"):
            if frm == to:
                continue
            for amt in (1, 2, 3):
                for p in PRINCIPALS:
                    out.append(("transfer", frm, to, amt, p))
    for auth in PRINCIPALS:
        out.append(("policy", "v2", auth))
    for acct in ("A", "B"):
        for new_owner in PRINCIPALS:
            for authr in PRINCIPALS:
                out.append(("owner", acct, new_owner, authr))
    return out

def auth(state, a):
    (bal_a, bal_b, pol, owner), _log = state
    bal = {"A": bal_a, "B": bal_b}
    own = {"A": owner[0], "B": owner[1]}
    if a[0] == "transfer":
        _, frm, _to, amt, p = a
        return p == own[frm] and amt > 0 and amt <= bal[frm]
    if a[0] == "policy":
        _, new, authr = a
        return authr == "author" and new > pol
    if a[0] == "owner":
        _, _acct, _new_owner, authr = a
        return authr == "author"
    return False

def eff(state, a):
    (bal_a, bal_b, pol, owner), _log = state
    bal = {"A": bal_a, "B": bal_b}
    if a[0] == "transfer":
        _, frm, to, amt, _p = a
        bal[frm] -= amt
        bal[to] += amt
        return (bal["A"], bal["B"], pol, owner)
    if a[0] == "policy":
        return (bal_a, bal_b, a[1], owner)
    if a[0] == "owner":
        _, acct, new_owner, _authr = a
        own = list(owner)
        own[0 if acct == "A" else 1] = new_owner
        return (bal_a, bal_b, pol, tuple(own))
    raise ValueError(f"unknown proposal {a!r}")

def inv_r(r):
    bal_a, bal_b, _pol, owner = r
    return (
        bal_a >= 0 and bal_b >= 0 and bal_a + bal_b == TOTAL
        and len(owner) == 2 and all(o in PRINCIPALS for o in owner)
    )

def kernel(state, a):
    r, log = state
    if not auth(state, a):
        return ((r, log + (("deny", a),)), "deny")
    r_next = eff(state, a)
    if not inv_r(r_next):
        return ((r, log + (("deny", a),)), "deny")
    return ((r_next, log + (("allow", a),)), "allow")

def inv_a(log, steps):
    # Check that log length equals steps and every entry is well-formed.
    return len(log) == steps and all(e[0] in ("allow", "deny") for e in log)

def assert_t5(r_before, r_after, proposal, decision):
    """Direct T5 assertion for one kernel transition (Section 7.1).

    T5 is a transition condition, not a state condition: if the owner
    component changed, the proposal must be an authorised UpdateOwner
    that was allowed, with authoriser 'author'. This is checked
    separately from inv_r (I5a), which only checks that the resulting
    owner is a well-formed pair of principals.
    """
    owner_before = r_before[3]
    owner_after = r_after[3]
    if owner_before != owner_after:
        assert proposal[0] == "owner", f"T5 violated: owner changed by non-owner proposal {proposal!r}"
        assert decision == "allow", f"T5 violated: owner changed on a denied proposal {proposal!r}"
        assert proposal[3] == "author", f"T5 violated: owner changed by non-author authoriser {proposal!r}"

def enumerate_full_traces(depth):
    """BFS over full states (r, log) to a bounded depth.

    On every transition, checks: new log length = old length + 1, old log
    is a prefix of new log, and the appended record's decision matches the
    kernel decision, plus the T5 transition assertion (assert_t5).
    Returns (full_states, transitions_checked).
    Full-state count grows with log histories, so depth 3 is the stated
    bound for this check; resource-state enumeration to depth 6 is separate.
    """
    start = ((TOTAL, 0, "v1", ("owner_A", "owner_B")), ())
    seen = {start}
    frontier = [(start, 0)]
    transitions = 0
    while frontier:
        state, d = frontier.pop(0)
        r, log = state
        assert inv_r(r), f"resource invariant violated at {state}"
        assert inv_a(log, d), f"audit invariant violated at {state}"
        if d >= depth:
            continue
        for a in proposals():
            nxt, dec = kernel(state, a)
            r_next, log_next = nxt
            assert len(log_next) == len(log) + 1, "log must grow by exactly one"
            assert log_next[:len(log)] == log, "old log must be a prefix of new log"
            assert log_next[-1] == (dec, a), "appended record must match decision and proposal"
            assert inv_r(r_next)
            assert_t5(r, r_next, a, dec)
            transitions += 1
            if nxt not in seen:
                seen.add(nxt)
                frontier.append((nxt, d + 1))
    return seen, transitions

def auth_with_owner(state, a, owner):
    """Auth evaluated against a supplied owner tuple (for counterexample C2).

    `owner` is (owner_A, owner_B) in account order, replacing the owner
    component of the state's resource state for this evaluation only.
    """
    (bal_a, bal_b, pol, _owner), log = state
    return auth(((bal_a, bal_b, pol, owner), log), a)

def counterexample_c1():
    """Optional invocation + non-mediating effector, Section 5.5 C1.

    Uses the Section 7.1 scale (100, 0) rather than the bounded checker
    scale, so the counterexample matches the paper's worked example.
    Returns the resulting resource state and whether Inv_R holds.
    """
    r = (100, 0, "v1", ("owner_A", "owner_B"))
    # Effector commits Transfer(A, B, 200, owner_A) without invoking F.
    r_next = (r[0] - 200, r[1] + 200, r[2], r[3])
    # Inv_R on this scale: balances non-negative, sum preserved at 100.
    ok = r_next[0] >= 0 and r_next[1] >= 0 and r_next[0] + r_next[1] == 100
    return r_next, ok

def counterexample_c2():
    """Writable owner record, Section 5.5 C2 — executable state-tampering witness.

    This function does NOT enumerate a direct owner write as a kernel
    transition (such a write is outside the reference transition relation).
    It constructs the original state and, separately, the tampered state,
    and shows the same proposal denied in the first and allowed in the second.
    

    Original owner map denies attacker; altered map (attacker owns A)
    allows the same proposal. Returns (denied_original, allowed_altered).
    """
    # Bounded-scale analogue of the paper's C2 (TOTAL = 100 there, 3 here):
    # transfer the full balance, so Inv_R holds after the transfer.
    state = ((TOTAL, 0, "v1", ("owner_A", "owner_B")), ())
    a = ("transfer", "A", "B", TOTAL, "attacker")
    # Original owner record denies attacker; the same proposal, evaluated
    # after a direct write to owner (not via kernel UpdateOwner), is allowed.
    denied_original = not auth(state, a)
    altered_state = ((TOTAL, 0, "v1", ("attacker", "owner_B")), ())
    _next, dec = kernel(altered_state, a)
    allowed_altered = dec == "allow"
    return denied_original, allowed_altered

def counterexample_c3():
    """Forged authorisation claim, Section 5.5 C3.

    Effector commits a transfer without a kernel decision, so the kernel
    log contains no allow record for the committed transfer.
    Returns (effect_committed, allow_record_in_log).
    """
    state = ((100, 0, "v1", ("owner_A", "owner_B")), ())
    r, log = state
    # No kernel call is made; effector acts on the proposer's claim alone.
    r_next = (0, 100, "v1", ("owner_A", "owner_B"))
    allow_in_log = any(e[0] == "allow" for e in log)
    return r_next, allow_in_log

def enumerate_kernel(depth):
    """BFS over resource states only.

    Auth, Eff, and Inv_R depend only on r, not on log, and the kernel
    appends exactly one audit record per step by construction (see kernel()).
    Enumerating full (r, log) states would be infinite in log length, so
    Inv_A is verified structurally: every kernel return appends exactly one
    record and never deletes or alters an existing record. Resource-state
    reachability is enumerated exhaustively up to `depth` steps.
    Every explored transition also asserts T5 (assert_t5).
    """
    start_r = (TOTAL, 0, "v1", ("owner_A", "owner_B"))
    seen_r = set([start_r])
    frontier = [(start_r, 0)]
    allows = denies = 0
    # BFS over resource states; a resource state reached at a smaller depth
    # is not re-expanded, because its outgoing kernel decisions depend only
    # on r. This is sound for reachable-resource-state enumeration.
    expanded = set()
    while frontier:
        r, d = frontier.pop(0)
        if r in expanded or d >= depth:
            continue
        expanded.add(r)
        state = (r, ())
        for a in proposals():
            nxt, dec = kernel(state, a)
            if dec == "allow":
                allows += 1
            else:
                denies += 1
            r_next = nxt[0]
            assert inv_r(r_next), f"resource invariant violated at {r_next}"
            assert_t5(r, r_next, a, dec)
            if r_next not in seen_r:
                seen_r.add(r_next)
                frontier.append((r_next, d + 1))
    return seen_r, allows, denies

def enumerate_unmediated(depth):
    """BFS over resource states, proposals applied directly via Eff."""
    start_r = (TOTAL, 0, "v1", ("owner_A", "owner_B"))
    seen_r = set([start_r])
    frontier = [(start_r, 0)]
    expanded = set()
    while frontier:
        r, d = frontier.pop(0)
        if r in expanded or d >= depth:
            continue
        expanded.add(r)
        state = (r, ())
        for a in proposals():
            r_next = eff(state, a)
            if r_next not in seen_r:
                seen_r.add(r_next)
                frontier.append((r_next, d + 1))
    violating = [r for r in seen_r if not inv_r(r)]
    return seen_r, violating

if __name__ == "__main__":
    seen_r, allows, denies = enumerate_kernel(6)
    print(f"kernel: reachable resource states (depth 6) = {len(seen_r)}")
    print(f"kernel: allow decisions from expanded resource states = {allows}, deny decisions = {denies}")
    print(f"kernel: resource invariant violations = 0")
    print(f"kernel: reachable resource states = {sorted(seen_r)}")
    full, trans = enumerate_full_traces(3)
    print(f"kernel: full states (r, log) enumerated (depth 3) = {len(full)}")
    print(f"kernel: full-trace transitions checked (prefix + exactly-one-append + T5) = {trans}")
    print(f"kernel: audit invariant violations in full traces (depth 3) = 0")
    unr, viol = enumerate_unmediated(5)
    print(f"unmediated: reachable resource states (depth 5) = {len(unr)}")
    print(f"unmediated: violating resource states found = {len(viol)}, examples = {sorted(viol)[:8]}")
    c1_r, c1_ok = counterexample_c1()
    print(f"counterexample C1 (unmediated 200 from (100,0)): result = {c1_r}, Inv_R holds = {c1_ok}")
    c2_denied, c2_allowed = counterexample_c2()
    print(f"counterexample C2: denied under original owner = {c2_denied}, allowed under altered owner = {c2_allowed}")
    c3_r, c3_allow = counterexample_c3()
    print(f"counterexample C3: effect committed to {c3_r}, allow record in kernel log = {c3_allow}")

```



```python

#!/usr/bin/env python3
"""Unit tests for ledger_model.py (Frozen Spine, Section 7 / Appendix E).

Each test names the paper claim it checks. Bounded exhaustive checks are
in ledger_model.py itself; these tests check authorization, denial
behavior, audit append-only behavior on sequential traces, and the three
Section 5.5 counterexamples, plus a buggy-effect counterexample for
conservation.

Run: python3 -m unittest test_ledger_model.py -v
"""
import unittest

from ledger_model import (
    PRINCIPALS,
    auth,
    counterexample_c1,
    counterexample_c2,
    counterexample_c3,
    eff,
    enumerate_full_traces,
    enumerate_kernel,
    enumerate_unmediated,
    inv_r,
    kernel,
    proposals,
)


def start():
    return ((3, 0, "v1", ("owner_A", "owner_B")), ())


class TestAuthorization(unittest.TestCase):
    def test_valid_transfer_allowed(self):
        state, dec = kernel(start(), ("transfer", "A", "B", 2, "owner_A"))
        self.assertEqual(dec, "allow")
        self.assertEqual(state[0], (1, 2, "v1", ("owner_A", "owner_B")))
        self.assertEqual(state[1], (("allow", ("transfer", "A", "B", 2, "owner_A")),))

    def test_unauthorized_principal_denied(self):
        state, dec = kernel(start(), ("transfer", "A", "B", 1, "attacker"))
        self.assertEqual(dec, "deny")
        self.assertEqual(state[0], (3, 0, "v1", ("owner_A", "owner_B")))

    def test_overdraft_denied(self):
        # owner_A owns A with balance 3; amount 4 is outside the proposal
        # set, so use a valid proposal after a partial transfer instead:
        state, _ = kernel(start(), ("transfer", "A", "B", 2, "owner_A"))
        # Now bal_A = 1; amount 3 exceeds it.
        state2, dec = kernel(state, ("transfer", "A", "B", 3, "owner_A"))
        self.assertEqual(dec, "deny")
        self.assertEqual(state2[0], (1, 2, "v1", ("owner_A", "owner_B")))

    def test_owner_update_author_only(self):
        _, dec_author = kernel(start(), ("owner", "A", "attacker", "author"))
        self.assertEqual(dec_author, "allow")
        _, dec_attacker = kernel(start(), ("owner", "A", "attacker", "attacker"))
        self.assertEqual(dec_attacker, "deny")
        # Authorised owner change then makes the new owner's transfer authorised.
        state, _ = kernel(start(), ("owner", "A", "attacker", "author"))
        _, dec = kernel(state, ("transfer", "A", "B", 1, "attacker"))
        self.assertEqual(dec, "allow")
        # Direct T5 regression check, over every bounded resource state:
        # for each explored kernel transition, if owner changed, the
        # proposal must be an authorised UpdateOwner that was allowed.
        # This is the transition property the paper states separately
        # from I5a (owner well-formedness, checked by inv_r). It is
        # checked here directly, not only via the checker's internal
        # assert_t5 in enumerate_kernel / enumerate_full_traces.
        checked = 0
        for bal_a in range(4):
            bal_b = 3 - bal_a
            for pol in ("v1", "v2"):
                for o_a in PRINCIPALS:
                    for o_b in PRINCIPALS:
                        r = (bal_a, bal_b, pol, (o_a, o_b))
                        for a in proposals():
                            (r_next, _log), dec_t = kernel((r, ()), a)
                            checked += 1
                            if r_next[3] != r[3]:
                                self.assertEqual(a[0], "owner")
                                self.assertEqual(dec_t, "allow")
                                self.assertEqual(a[3], "author")
                            if a[0] == "owner" and dec_t == "deny":
                                self.assertEqual(r_next[3], r[3])
        self.assertEqual(checked, 128 * 60)

    def test_policy_update_author_only(self):
        _, dec_author = kernel(start(), ("policy", "v2", "author"))
        self.assertEqual(dec_author, "allow")
        _, dec_attacker = kernel(start(), ("policy", "v2", "attacker"))
        self.assertEqual(dec_attacker, "deny")


class TestDenialAndAudit(unittest.TestCase):
    def test_denial_preserves_resource_and_appends_exactly_one(self):
        state = start()
        old_log = state[1]
        new_state, dec = kernel(state, ("transfer", "A", "B", 1, "attacker"))
        self.assertEqual(dec, "deny")
        self.assertEqual(new_state[0], state[0])
        self.assertEqual(len(new_state[1]), len(old_log) + 1)
        self.assertEqual(new_state[1][:len(old_log)], old_log)
        self.assertEqual(old_log, ())  # caller's log tuple unchanged

    def test_sequential_trace_audit_prefix(self):
        state = start()
        trace = [
            ("transfer", "A", "B", 1, "owner_A"),   # allow
            ("transfer", "A", "B", 3, "owner_A"),   # deny (bal_A = 2)
            ("transfer", "A", "B", 1, "attacker"),  # deny (wrong principal)
            ("policy", "v2", "author"),             # allow
        ]
        decisions = []
        for a in trace:
            prev_log = state[1]
            prev_r = state[0]
            state, dec = kernel(state, a)
            decisions.append(dec)
            self.assertEqual(len(state[1]), len(prev_log) + 1)
            self.assertEqual(state[1][:len(prev_log)], prev_log)
            self.assertEqual(state[1][-1], (dec, a))
            if dec == "deny":
                self.assertEqual(state[0], prev_r)
        self.assertEqual(decisions, ["allow", "deny", "deny", "allow"])
        self.assertEqual(state[0], (2, 1, "v2", ("owner_A", "owner_B")))
        self.assertEqual(len(state[1]), 4)
        self.assertTrue(inv_r(state[0]))

    def test_full_traces_depth3_no_violations(self):
        full, trans = enumerate_full_traces(3)
        self.assertGreater(len(full), 0)
        self.assertGreater(trans, 0)
        # enumerate_full_traces asserts Inv_R and Inv_A on every state,
        # the prefix/exactly-one-append property on every transition,
        # and T5 (assert_t5) on every transition.


class TestExhaustiveBounded(unittest.TestCase):
    def test_kernel_resource_states_no_violations(self):
        seen_r, _allows, _denies = enumerate_kernel(6)
        # Balances (4) x policy (2) x owner pairs (4x4=16) = 128 max; all reachable.
        self.assertEqual(len(seen_r), 128)
        for r in seen_r:
            self.assertTrue(inv_r(r))

    def test_unmediated_exhibits_violations(self):
        seen_r, violating = enumerate_unmediated(5)
        # Counts are asserted from the actual run in ledger_results.txt;
        # the test's substantive claims are the violation examples below.
        self.assertGreater(len(violating), 0)
        # A concrete overdraft: unmediated transfer of 5 from (3, 0).
        r = eff(((3, 0, "v1", ("owner_A", "owner_B")), ()), ("transfer", "A", "B", 5, "owner_A"))
        self.assertEqual(r, (-2, 5, "v1", ("owner_A", "owner_B")))
        self.assertFalse(inv_r(r))

    def test_buggy_effect_breaks_conservation(self):
        # Eff that credits `to` without debiting `from` (Section 7.2):
        # sum becomes 4, not TOTAL = 3, so Inv_R fails and the kernel
        # would deny it even if Auth held.
        buggy = (3, 1, "v1", ("owner_A", "owner_B"))
        self.assertFalse(inv_r(buggy))


class TestCounterexamples(unittest.TestCase):
    def test_c1_unmediated_effect_violates_invariant(self):
        r, ok = counterexample_c1()
        self.assertEqual(r, (-100, 200, "v1", ("owner_A", "owner_B")))
        self.assertFalse(ok)

    def test_c2_writable_owner_changes_decision(self):
        denied_original, allowed_altered = counterexample_c2()
        self.assertTrue(denied_original)
        self.assertTrue(allowed_altered)

    def test_c3_forged_claim_leaves_no_allow_record(self):
        r, allow_in_log = counterexample_c3()
        self.assertEqual(r, (0, 100, "v1", ("owner_A", "owner_B")))
        self.assertFalse(allow_in_log)


if __name__ == "__main__":
    unittest.main()

```

```python

Frozen Spine ledger artifact — results file (v4, final consistency pass + T5 assertion)
Generated: 2026-10-29 (America/Chicago)
Environment:
Python 3.12.3
Linux-7.0.0-39-generic-x86_64-with-glibc2.39
CPython

Command 1: python3 ledger_model.py
----------------------------------------
kernel: reachable resource states (depth 6) = 128
kernel: allow decisions from expanded resource states = 1472, deny decisions = 6208
kernel: resource invariant violations = 0
kernel: reachable resource states = [(0, 3, 'v1', ('attacker', 'attacker')), (0, 3, 'v1', ('attacker', 'author')), (0, 3, 'v1', ('attacker', 'owner_A')), (0, 3, 'v1', ('attacker', 'owner_B')), (0, 3, 'v1', ('author', 'attacker')), (0, 3, 'v1', ('author', 'author')), (0, 3, 'v1', ('author', 'owner_A')), (0, 3, 'v1', ('author', 'owner_B')), (0, 3, 'v1', ('owner_A', 'attacker')), (0, 3, 'v1', ('owner_A', 'author')), (0, 3, 'v1', ('owner_A', 'owner_A')), (0, 3, 'v1', ('owner_A', 'owner_B')), (0, 3, 'v1', ('owner_B', 'attacker')), (0, 3, 'v1', ('owner_B', 'author')), (0, 3, 'v1', ('owner_B', 'owner_A')), (0, 3, 'v1', ('owner_B', 'owner_B')), (0, 3, 'v2', ('attacker', 'attacker')), (0, 3, 'v2', ('attacker', 'author')), (0, 3, 'v2', ('attacker', 'owner_A')), (0, 3, 'v2', ('attacker', 'owner_B')), (0, 3, 'v2', ('author', 'attacker')), (0, 3, 'v2', ('author', 'author')), (0, 3, 'v2', ('author', 'owner_A')), (0, 3, 'v2', ('author', 'owner_B')), (0, 3, 'v2', ('owner_A', 'attacker')), (0, 3, 'v2', ('owner_A', 'author')), (0, 3, 'v2', ('owner_A', 'owner_A')), (0, 3, 'v2', ('owner_A', 'owner_B')), (0, 3, 'v2', ('owner_B', 'attacker')), (0, 3, 'v2', ('owner_B', 'author')), (0, 3, 'v2', ('owner_B', 'owner_A')), (0, 3, 'v2', ('owner_B', 'owner_B')), (1, 2, 'v1', ('attacker', 'attacker')), (1, 2, 'v1', ('attacker', 'author')), (1, 2, 'v1', ('attacker', 'owner_A')), (1, 2, 'v1', ('attacker', 'owner_B')), (1, 2, 'v1', ('author', 'attacker')), (1, 2, 'v1', ('author', 'author')), (1, 2, 'v1', ('author', 'owner_A')), (1, 2, 'v1', ('author', 'owner_B')), (1, 2, 'v1', ('owner_A', 'attacker')), (1, 2, 'v1', ('owner_A', 'author')), (1, 2, 'v1', ('owner_A', 'owner_A')), (1, 2, 'v1', ('owner_A', 'owner_B')), (1, 2, 'v1', ('owner_B', 'attacker')), (1, 2, 'v1', ('owner_B', 'author')), (1, 2, 'v1', ('owner_B', 'owner_A')), (1, 2, 'v1', ('owner_B', 'owner_B')), (1, 2, 'v2', ('attacker', 'attacker')), (1, 2, 'v2', ('attacker', 'author')), (1, 2, 'v2', ('attacker', 'owner_A')), (1, 2, 'v2', ('attacker', 'owner_B')), (1, 2, 'v2', ('author', 'attacker')), (1, 2, 'v2', ('author', 'author')), (1, 2, 'v2', ('author', 'owner_A')), (1, 2, 'v2', ('author', 'owner_B')), (1, 2, 'v2', ('owner_A', 'attacker')), (1, 2, 'v2', ('owner_A', 'author')), (1, 2, 'v2', ('owner_A', 'owner_A')), (1, 2, 'v2', ('owner_A', 'owner_B')), (1, 2, 'v2', ('owner_B', 'attacker')), (1, 2, 'v2', ('owner_B', 'author')), (1, 2, 'v2', ('owner_B', 'owner_A')), (1, 2, 'v2', ('owner_B', 'owner_B')), (2, 1, 'v1', ('attacker', 'attacker')), (2, 1, 'v1', ('attacker', 'author')), (2, 1, 'v1', ('attacker', 'owner_A')), (2, 1, 'v1', ('attacker', 'owner_B')), (2, 1, 'v1', ('author', 'attacker')), (2, 1, 'v1', ('author', 'author')), (2, 1, 'v1', ('author', 'owner_A')), (2, 1, 'v1', ('author', 'owner_B')), (2, 1, 'v1', ('owner_A', 'attacker')), (2, 1, 'v1', ('owner_A', 'author')), (2, 1, 'v1', ('owner_A', 'owner_A')), (2, 1, 'v1', ('owner_A', 'owner_B')), (2, 1, 'v1', ('owner_B', 'attacker')), (2, 1, 'v1', ('owner_B', 'author')), (2, 1, 'v1', ('owner_B', 'owner_A')), (2, 1, 'v1', ('owner_B', 'owner_B')), (2, 1, 'v2', ('attacker', 'attacker')), (2, 1, 'v2', ('attacker', 'author')), (2, 1, 'v2', ('attacker', 'owner_A')), (2, 1, 'v2', ('attacker', 'owner_B')), (2, 1, 'v2', ('author', 'attacker')), (2, 1, 'v2', ('author', 'author')), (2, 1, 'v2', ('author', 'owner_A')), (2, 1, 'v2', ('author', 'owner_B')), (2, 1, 'v2', ('owner_A', 'attacker')), (2, 1, 'v2', ('owner_A', 'author')), (2, 1, 'v2', ('owner_A', 'owner_A')), (2, 1, 'v2', ('owner_A', 'owner_B')), (2, 1, 'v2', ('owner_B', 'attacker')), (2, 1, 'v2', ('owner_B', 'author')), (2, 1, 'v2', ('owner_B', 'owner_A')), (2, 1, 'v2', ('owner_B', 'owner_B')), (3, 0, 'v1', ('attacker', 'attacker')), (3, 0, 'v1', ('attacker', 'author')), (3, 0, 'v1', ('attacker', 'owner_A')), (3, 0, 'v1', ('attacker', 'owner_B')), (3, 0, 'v1', ('author', 'attacker')), (3, 0, 'v1', ('author', 'author')), (3, 0, 'v1', ('author', 'owner_A')), (3, 0, 'v1', ('author', 'owner_B')), (3, 0, 'v1', ('owner_A', 'attacker')), (3, 0, 'v1', ('owner_A', 'author')), (3, 0, 'v1', ('owner_A', 'owner_A')), (3, 0, 'v1', ('owner_A', 'owner_B')), (3, 0, 'v1', ('owner_B', 'attacker')), (3, 0, 'v1', ('owner_B', 'author')), (3, 0, 'v1', ('owner_B', 'owner_A')), (3, 0, 'v1', ('owner_B', 'owner_B')), (3, 0, 'v2', ('attacker', 'attacker')), (3, 0, 'v2', ('attacker', 'author')), (3, 0, 'v2', ('attacker', 'owner_A')), (3, 0, 'v2', ('attacker', 'owner_B')), (3, 0, 'v2', ('author', 'attacker')), (3, 0, 'v2', ('author', 'author')), (3, 0, 'v2', ('author', 'owner_A')), (3, 0, 'v2', ('author', 'owner_B')), (3, 0, 'v2', ('owner_A', 'attacker')), (3, 0, 'v2', ('owner_A', 'author')), (3, 0, 'v2', ('owner_A', 'owner_A')), (3, 0, 'v2', ('owner_A', 'owner_B')), (3, 0, 'v2', ('owner_B', 'attacker')), (3, 0, 'v2', ('owner_B', 'author')), (3, 0, 'v2', ('owner_B', 'owner_A')), (3, 0, 'v2', ('owner_B', 'owner_B'))]
kernel: full states (r, log) enumerated (depth 3) = 219661
kernel: full-trace transitions checked (prefix + exactly-one-append + T5) = 219660
kernel: audit invariant violations in full traces (depth 3) = 0
unmediated: reachable resource states (depth 5) = 608
unmediated: violating resource states found = 480, examples = [(-12, 15, 'v1', ('owner_A', 'owner_B')), (-11, 14, 'v1', ('owner_A', 'owner_B')), (-10, 13, 'v1', ('owner_A', 'owner_B')), (-9, 12, 'v1', ('attacker', 'owner_B')), (-9, 12, 'v1', ('author', 'owner_B')), (-9, 12, 'v1', ('owner_A', 'attacker')), (-9, 12, 'v1', ('owner_A', 'author')), (-9, 12, 'v1', ('owner_A', 'owner_A'))]
counterexample C1 (unmediated 200 from (100,0)): result = (-100, 200, 'v1', ('owner_A', 'owner_B')), Inv_R holds = False
counterexample C2: denied under original owner = True, allowed under altered owner = True
counterexample C3: effect committed to (0, 100, 'v1', ('owner_A', 'owner_B')), allow record in kernel log = False

Command 2: python3 -m unittest test_ledger_model.py -v
----------------------------------------
test_overdraft_denied (test_ledger_model.TestAuthorization.test_overdraft_denied) ... ok
test_owner_update_author_only (test_ledger_model.TestAuthorization.test_owner_update_author_only) ... ok
test_policy_update_author_only (test_ledger_model.TestAuthorization.test_policy_update_author_only) ... ok
test_unauthorized_principal_denied (test_ledger_model.TestAuthorization.test_unauthorized_principal_denied) ... ok
test_valid_transfer_allowed (test_ledger_model.TestAuthorization.test_valid_transfer_allowed) ... ok
test_c1_unmediated_effect_violates_invariant (test_ledger_model.TestCounterexamples.test_c1_unmediated_effect_violates_invariant) ... ok
test_c2_writable_owner_changes_decision (test_ledger_model.TestCounterexamples.test_c2_writable_owner_changes_decision) ... ok
test_c3_forged_claim_leaves_no_allow_record (test_ledger_model.TestCounterexamples.test_c3_forged_claim_leaves_no_allow_record) ... ok
test_denial_preserves_resource_and_appends_exactly_one (test_ledger_model.TestDenialAndAudit.test_denial_preserves_resource_and_appends_exactly_one) ... ok
test_full_traces_depth3_no_violations (test_ledger_model.TestDenialAndAudit.test_full_traces_depth3_no_violations) ... ok
test_sequential_trace_audit_prefix (test_ledger_model.TestDenialAndAudit.test_sequential_trace_audit_prefix) ... ok
test_buggy_effect_breaks_conservation (test_ledger_model.TestExhaustiveBounded.test_buggy_effect_breaks_conservation) ... ok
test_kernel_resource_states_no_violations (test_ledger_model.TestExhaustiveBounded.test_kernel_resource_states_no_violations) ... ok
test_unmediated_exhibits_violations (test_ledger_model.TestExhaustiveBounded.test_unmediated_exhibits_violations) ... ok

----------------------------------------------------------------------
Ran 14 tests in 5.162s

OK

Notes: Paper v4 is frozen and unchanged by this artifact-only update. Checker and tests were run by the author on this date. Independent rerun by a reviewer has not yet been performed; the source, command, and complete output above are provided so a reviewer can rerun them. Bounded exhaustive checks cover the stated domains only (see Appendix E); they do not establish safety for unbounded balances, concurrent transfers, or a richer policy language. Artifact is author-run and reproducible in principle, not independently verified. '14 tests passing' means the finite checks in this package pass; it does not mean every property in the paper has its own direct regression test, nor correctness beyond the bounded model.


```








