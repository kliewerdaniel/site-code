# Productization audit — 2026-11-13

Scope: `kliewerdaniel/site-code` @ `c274ff3` (local `main`, in sync with
`origin/main`), the production deployment at `https://www.danielkliewer.com`,
and the sibling compiler projects under `~/Projects/`. Branch
`feat/knowledge-compiler-productization` was created before any change.

Every figure below was re-measured on this machine or against the live
deployment. Nothing is carried over from an earlier session's notes.

## 1. Verified current state

| Check | Result |
|---|---|
| `npm test` | **151 tests, 149 pass, 2 fail** |
| Failing tests | the two `REAL RUNTIME` Node-gate assertions |
| Cause | environmental: this shell runs Node **v22.23.1**; the gate requires **22.23.4**. `nvm` has 22.23.4 installed. CI installs it from `.nvmrc` and never sets `DK_ALLOW_NODE_VERSION`. The gate is failing closed as designed. |
| Production `/agents/catalog.json` | 197 articles · 12 projects · 8 concepts · 3 paths · 24 chapters |
| Production `/agents/graph.json` | 98 edges; 27 `implements`, 16 `documents`, 12 `prerequisite_for`, 43 `recommends_reading`; 11 absent types; 0 dangling |
| Production `/agents/claims.json` | 109 claims: 99 authoritative, 10 proposed |
| Production `/agents/evidence.json` | 109 evidence records |
| Production `/agents/proposals.json` | 10 non-authoritative relation proposals |
| Markdown mirrors | 197 live `/research/<slug>.md`, each with a verifying `content_hash`; 2 drafts excluded |
| `npm run conformance` | passes (see `data/conformance-report.json`) |
| `npm run smoke:production` | passes with 0 drift / 0 compile errors / 0 warnings |
| CI | `.github/workflows/ci.yml` runs the full gate on every push/PR; `smoke.yml` runs after a successful CI deploy |

## 2. What already exists (real, not aspirational)

- **Compilation pipeline (site bound layer).** `src/lib/agent-resources-core.ts`
  (664 lines) is pure: no clock, no randomness, no filesystem, no `@/` imports.
  `src/lib/agent-resources.ts` binds it to config/posts/taxonomy. Artifacts are
  emitted as nine resources plus the Markdown mirrors.
- **Claim/evidence model.** `src/lib/claim-evidence-core.ts` defines assessments,
  verification levels, evidence types and a validator;
  `src/lib/relation-vocabulary.ts` defines the controlled vocabulary, relation
  status (`declared`/`proposed`/`approved`/`rejected`), fingerprints and
  `makeEdge`. Proposals are structurally excluded from the authoritative graph.
- **Validators and conformance.** `validate:content`, `validate:build`,
  `validate:agents`, `validate:markdown`, `validate:claims`, `conformance`,
  `audit`, `check:routes`, `smoke:production`.
- **`packages/knowledge-compiler`** — a source-agnostic proof: normalization,
  deterministic validation, tag-overlap proposals, an approval gate
  (`assertGoverned`) and `declareRelation`. 135 lines of tests.
- **`packages/knowledge-sdk`** — a zero-dependency typed client: `connect`,
  `search`, `expand`, `traverseGraph`, `getArticle`, `getEvidence`,
  `getLearningPath`, `getBookContext`, `citation`; ETag + disk cache, byte
  budget, SHA-256 mirror verification.
- **`packages/knowledge-mcp`** — stdio JSON-RPC server exposing 6 tools with
  clamped limits and a truncation flag.
- **Retrieval benchmark.** 30 manually adjudicated questions, three
  architectures (crawl / catalog+graph / catalog+graph+Markdown), deterministic
  metrics only.

## 3. Gaps against the directive

| # | Gap | Evidence |
|---|---|---|
| G1 | **No interactive graph explorer.** `/agents` is a static human guide; there is no route that lets a visitor select a concept, follow typed relations, open claims and inspect evidence. | `src/app` has no graph/explorer route; `src/components` has no graph UI. |
| G2 | **MCP exposes 6 of the 10 required tools.** Missing `get_concept`, `get_project`, `get_claim`, `verify_citation`, `get_related_work`. | `packages/knowledge-mcp/src/server.ts` `TOOLS` array. |
| G3 | **SDK has no concept/project/claim lookup.** `getClaims`, `getConcept`, `getProject` are absent; the directive's `traverse({startingNodes, relations})` and `getEvidence({claimIds})` shapes are not offered. | `packages/knowledge-sdk/src/client.ts`. |
| G4 | **Benchmark has no LLM agent experiments.** Only deterministic retrieval is measured; no model versions, prompts, cold/warm cache, or token consumption. | `benchmarks/retrieval/src/benchmark.mjs`; README "What it does not establish". |
| G5 | **No second independently compiled corpus.** The compiler package is a proof; it has never compiled a source other than the site's own markdown. | `packages/knowledge-compiler` has no adapter beyond frontmatter markdown and no manifest. |
| G6 | **Approval is a bare `Set<string>`.** No approval identity, reason, timestamp or revocation; no audit log. | `compile(options)` in `packages/knowledge-compiler/src/compile.ts`. |
| G7 | **The site's build does not consume the extracted compiler.** `agent-resources-core.ts` is the bound layer; the package is not on the build path. | `src/lib/agent-resources.ts` imports the site core, not the package. |

## 4. Duplication check (sibling projects)

| Project | Language | Relation to this directive |
|---|---|---|
| `knowledge-compiler-sdk` (`@kliewerdaniel/discoverable-knowledge-sdk`) | Node/TS CLI | Compiles a `dataset.json` graph into a static agent-discoverable site. Different data contract (pre-built graph) and different output (HTML site) from the manifest-driven compiler here. No API overlap with `knowledge-sdk`. |
| `sovereign-knowledge-compiler`, `kc-sdk`, `authority-graph-compiler` | Python | Earlier Python compilers. Not TypeScript, not consumed by the site. |
| `research-compiler-agent-sdk`, `clinical-research-compiler-sdk` | Python | Domain-specific research compilers. |

**Verdict:** the TypeScript SDK and MCP adapter in `site-code` are the only
ones that consume the compiled corpus; no overlapping package was created.
The Node CLI above is a site *generator*, not a corpus *consumer*.

## 5. Plan (dependency-ordered)

1. **Phase 1** — this audit; extend `knowledge-compiler` with a source manifest,
   markdown/JSON adapters, explicit approval records and deterministic
   artifact emission; tests.
2. **Phase 2** — SDK: `getClaims`, `getConcept`, `getProject`, `verifyCitation`,
   directive-shaped aliases, tests.
3. **Phase 3** — MCP: the five missing tools, limits, tests, Hermes config docs;
   verify with a real stdio handshake.
4. **Phase 4** — interactive graph explorer on the site, fed by the generated
   `graph.json`/`claims.json`/`evidence.json`, with a list fallback.
5. **Phase 5** — LLM agent experiment harness over the adjudicated set; run it
   against the local Ollama model and report honestly, including the
   single-model limitation.
6. **Phase 6** — second corpus compiled by the package, sample config,
   versioning and installation docs.

Production deployment is **not** performed here; it waits for human review.
