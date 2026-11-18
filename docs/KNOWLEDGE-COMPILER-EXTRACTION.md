# Knowledge compiler extraction — evaluation

Phase 6 of the agent-native knowledge system evolution.

This document evaluates whether the compilation engine in `site-code` should
be extracted into a reusable project, and what that project would look like.
It is an evaluation, not a commitment: the recommendation is at the end.

## 1. Where the seams already are

The current implementation was built with a pure-core / bound-layer split, so
the reusable parts are already identifiable:

| Concern | Current location | Reusable? |
|---|---|---|
| Source normalization | `src/lib/posts.ts` (`gray-matter`) | Partly — tied to one directory and one frontmatter shape. |
| Validation | `scripts/validate-content.mjs`, `validate-markdown.mjs` | The rules are source-specific; the pattern is reusable. |
| Proposal rules | `src/lib/claim-evidence.ts` (`buildProposals`) | Yes — deterministic, already separated. |
| Provenance and governance | `src/lib/relation-vocabulary.ts` | Yes — the vocabulary, status and fingerprint model is source-agnostic. |
| Claim/evidence model | `src/lib/claim-evidence-core.ts` | Yes — pure types and builders. |
| Artifact emission | `src/lib/agent-resources-core.ts` | Partly — the pure builders are reusable; the six paths are site-specific. |
| Artifact serving | `src/app/agents/*.json/route.ts` | No — Next.js-specific. |
| Agent consumption | `packages/knowledge-sdk` | Yes — already standalone. |

The reusable core is roughly: normalization, deterministic validation, the
proposal/approval gate, the claim/evidence model, and the artifact builders.
The site-specific part is: the content directory, the taxonomy, the chapter
manifest, the book links, and the HTTP serving.

## 2. What a reusable compiler would look like

```
SOURCE MATERIAL
  |
  v
SOURCE NORMALIZATION        <- source adapters (markdown, docs tree, repo, PDF)
  |
  v
PROBABILISTIC ANALYSIS      <- optional; may propose, never authorize
  |
  v
CLAIM AND RELATIONSHIP PROPOSALS
  |
  v
DETERMINISTIC VALIDATION    <- rejects invalid records; never repairs
  |
  v
PROVENANCE AND GOVERNANCE   <- approval gate, fingerprints, audit
  |
  v
KNOWLEDGE COMPILATION       <- pure builders
  |
  v
STATIC KNOWLEDGE ARTIFACTS  <- schema versioned, hashed, deterministic
  |
  v
AGENT DISCOVERY AND RETRIEVAL
```

`packages/knowledge-compiler` is a working proof of the core of this
architecture: normalization, deterministic validation, deterministic
proposals, the approval gate, and governed artifact emission. It is
source-agnostic and has no Next.js dependency.

## 3. What the proof of concept establishes

- The frozen-spine boundary is implementable and testable: a proposal is never
  authoritative without an explicit approval (`assertGoverned`).
- Draft exclusion, validation rejection and content-hash verification are
  deterministic and source-independent.
- The claim/evidence model generalizes: a claim records what the evidence
  establishes, which is never confused with schema validity.
- The compiler is deterministic across runs.

## 4. What it does not establish

- **Scale.** The proof of concept runs on a handful of documents. The site's
  197-article corpus exercises it more, but the site's pipeline is still the
  bound layer, not the extracted package.
- **Source adapters.** Only markdown-with-frontmatter is implemented. A
  documentation tree, a Git repository, a PDF or a book each need an adapter.
- **Probabilistic analysis.** No model is wired in, by design. The
  `PROBABILISTIC ANALYSIS` stage is a seam, not an implementation.
- **Governance workflow.** Approval is a `Set<string>` in the compiler. A real
  system needs an audit log, an approval identity, and a revocation path.
- **Artifact schema evolution.** The compiler emits in-memory structures; a
  reusable project needs versioned artifact schemas and a migration story.

## 5. Risks of extracting now

| Risk | Mitigation |
|---|---|
| The site's pipeline and the extracted package drift apart | Extract only after the site's invariants are stable; keep the site as the reference implementation. |
| A reusable abstraction becomes speculative | Ship the compiler only with a second real source adapter. |
| The approval workflow is simplified to a set | Treat the approval store as an interface; do not ship a governance claim the code cannot support. |
| Two build paths to maintain | The site keeps its bound layer; the package is a library, not a fork. |

## 6. Recommendation

**Extract, but not yet as a standalone project.** The right next step is:

1. Keep `site-code` as the reference implementation and the source of truth for
   the schemas.
2. Grow `packages/knowledge-compiler` against a **second real source** (the
   book manuscript, or a documentation tree) before it becomes a standalone
   project. One source proves the concept; two sources prove the abstraction.
3. Move the artifact builders (`agent-resources-core.ts`) into the package once
   the second source can emit the same artifact shapes.
4. Keep the SDK and MCP adapter as consumers of the artifacts, not of the
   compiler, so the compiler can change without breaking retrieval.

The architectural boundary that matters — probabilistic systems propose,
deterministic validation and human approval authorize — is already enforced in
the site and demonstrated in the package. That boundary is the reusable idea;
the package is its first expression.
