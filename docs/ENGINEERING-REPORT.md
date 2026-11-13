# Engineering report — productizing the deterministic knowledge compiler

Branch `feat/knowledge-compiler-productization`. The branch was merged to
`main` (`f337df2`) and deployed to https://www.danielkliewer.com; the
deployment is verified in §12. This report distinguishes what is verified from
what is still pending.

## 1. Original architecture audit

`docs/PRODUCTIZATION-AUDIT-2026-11-13.md` re-measured the repository and the
live corpus. Verified baseline: 197 articles · 12 projects · 8 concepts · 3
paths · 24 chapters · 98 graph edges · 109 claims (99 authoritative, 10
proposed) · 109 evidence records · 197 Markdown mirrors. Seven gaps were
recorded (G1–G7); the ones this branch closes are G1 (graph explorer), G2
(MCP tools), G3 (SDK lookups), G4 (LLM benchmark), G5 (second corpus) and G6
(approval records). G7 (the site's build does not consume the extracted
compiler) is deliberately left open — see §11.

## 2. New architecture

```
SOURCES ──manifest──▶ ADAPTERS ──▶ NORMALIZE ──▶ VALIDATE ──▶ PROPOSE
                                                                │
                                          approval records ──▶ APPROVAL GATE
                                                                │
                                                                ▼
                                     ARTIFACTS (corpus bundle, mirrors, index)
                                                                │
                    ┌───────────────────────────────────────────┼─────────────┐
                    ▼                                           ▼             ▼
              knowledge-sdk                            knowledge-mcp      /graph
              (typed client)                           (11 tools)         (explorer)
```

The site remains the reference implementation and the source of truth for the
artifact shapes. The compiler is a library that can compile any manifest; the
SDK and MCP consume the artifacts; the explorer renders them.

## 3. Package structure

| Path | Role |
|---|---|
| `packages/knowledge-compiler` | Manifest, adapters, normalization, validation, approval gate, deterministic emission. No Next.js. |
| `packages/knowledge-sdk` | Typed, zero-dependency corpus client. |
| `packages/knowledge-mcp` | Stdio MCP adapter, 11 tools. |
| `src/lib/explorer-core.ts` | Pure graph model + deterministic layout for the explorer. |
| `examples/sample-corpus` | A second, independent documentation archive and its manifest. |
| `benchmarks/retrieval` | Adjudicated dataset, deterministic harness, agent harness. |

`knowledge-core` and `knowledge-schema` from the proposed structure were **not**
created: the compiler and SDK already own those boundaries, and a separate
schema package would duplicate the emitted types.

## 4. Implemented APIs

**SDK** (`packages/knowledge-sdk`): `connect`, `search`, `expand`,
`traverseGraph`, `traverse` (multi-start), `getArticle`, `getClaims`,
`getClaim`, `getEvidence(claimId | {claimIds})`, `getConcept`, `getProject`,
`getRelatedWork`, `getLearningPath`, `getBookContext`, `verifyCitation`,
`citation`, `fetchResource`, `parseMirror`, `sha256Hex`.

**Compiler** (`packages/knowledge-compiler`): `compileFromManifest`,
`compile`, `assertGoverned`, `declareRelation`, `normalizeDocument(s)`,
`splitFrontmatter`, `proposeTagOverlap`, `validateDocument`,
`approvalStore`, `validateManifest`, `readMarkdownSource`, `readJsonSource`,
`loadSources`, `emitArtifacts`, `writeArtifacts`, `slugify`.

## 5. MCP tool documentation

Eleven tools, all returning structured data with canonical identifiers:
`search_knowledge`, `get_article`, `get_concept`, `get_project`, `get_claim`,
`get_evidence`, `verify_citation`, `traverse_graph`, `get_related_work`,
`get_learning_path`, `get_book_context`. Limits: `maxDocuments ≤ 20`,
`maxBytes ≤ 500,000`, `maxDepth ≤ 4`, graph nodes/edges ≤ 200, with a
`truncated` flag. Full schemas and the Hermes `mcp_servers` block are in
`packages/knowledge-mcp/README.md`.

## 6. Graph explorer functionality

`/graph` renders the generated catalog and relation graph. A visitor can
search, filter by entity type and relation type, select an entity, follow
typed relations, open the claims that rest on an edge, and read the evidence.
The entity list is server-rendered as real links (no-JS fallback); claims and
evidence are fetched lazily; the rendered node set is bounded at 80. Provenance
and verification status appear on every edge, claim and evidence record.
Verified in a real browser: 244 SSR links, depth-2 neighbourhood 19 nodes /
25 edges, search narrowing to 3 entities, mobile stacking, labelled controls,
`aria-live` detail panel.

## 7. Security and governance analysis

Added to `docs/SECURITY.md`. The compiler enforces the frozen spine: a
proposal is never authoritative without an explicit approval record naming a
real proposal and matching its source fingerprint; validation failures are
rejected, never repaired; adapters confine paths and never execute source
material; drafts are excluded before emission. Not enforced: the site's bound
layer has no approval audit log, and the MCP server can label a proposal but
cannot force a caller to treat it as non-authoritative.

## 8. Benchmark methodology and results

**Deterministic** (`npm run benchmark`, 30 adjudicated questions): the compiled
catalog retrieves at Recall@5 1.000 and citation accuracy 1.000 against a
crawler's 0.313 / 0.417, at 265 KB one-time cost against 30.8 MB.

**Agent** (`npm run benchmark:agent`, local models, temperature 0, 256-token
budget, cold and warm passes). Cold results, two model families:

*lfm3-omni:latest*

| Architecture | Rule-correct | Citation | Abstain on no-support | Unsupported claim | Fabricated citation | Tokens/query | Latency/query |
|---|---|---|---|---|---|---|---|
| A · crawling | 33.3% | 0.0% | 100% | 0.0% | 16.7% | 6,196 | 2,545 ms |
| B · catalog + graph | **66.7%** | 26.7% | 83.3% | 33.3% | 3.3% | 8,703 | 2,790 ms |
| C · + Markdown | 63.3% | 26.7% | **100%** | **0.0%** | 3.3% | 15,456 | 4,922 ms |
| D · parametric | 23.3% | 0.0% | 0.0% | 16.7% | 6.7% | 66 | 186 ms |

*llama3.2:3b*

| Architecture | Rule-correct | Citation | Abstain on no-support | Unsupported claim | Fabricated citation | Tokens/query | Latency/query |
|---|---|---|---|---|---|---|---|
| A · crawling | 20.0% | 0.0% | 83.3% | 16.7% | 26.7% | 6,023 | 7,332 ms |
| B · catalog + graph | **70.0%** | **30.0%** | 83.3% | 16.7% | 6.7% | 8,109 | 10,086 ms |
| C · + Markdown | 60.0% | 26.7% | 33.3% | 33.3% | 0.0% | 14,684 | 15,157 ms |
| D · parametric | 20.0% | 0.0% | 66.7% | 16.7% | 0.0% | 80 | 298 ms |

What this supports: across both families the compiled catalog + graph (B) is the
most robust representation — highest rule-correct and citation accuracy, lowest
fabricated citations. Crawling (A) never produces a canonical citation and
fabricates the most. Markdown (C) improves the stronger model's epistemic
discipline (100% abstention, zero unsupported claims) but the weaker model is
confused by the longer context.

What it does not support: a claim that the architecture improves reasoning in
general. Two local model families, one machine, one corpus, a rule-based
correctness metric, and one hallucinated claim from B. Raw answers are
committed for review.

## 9. Test results

`npm test` under the pinned runtime (Node 22.23.4, from `.nvmrc`): **183 tests,
183 pass, 0 fail.** The two `REAL RUNTIME` Node-gate assertions fail closed on
an unpatched runtime by design: under Node 22.23.1 the suite reports 181/183,
and the same file passes 20/20 under 22.23.4. The build, all validators,
conformance and the route-parity check pass with 0 errors.

## 10. Performance measurements

- Graph explorer: 244 nodes / 98 edges rendered from a 211 KB static page;
  claims and evidence load lazily.
- SDK: byte-budgeted retrieval, ETag caching, SHA-256 verification.
- Compiler: sample corpus compiles in <100 ms; artifacts byte-identical across
  runs.
- Agent benchmark: tokens and latency in §8; warm prompts are ~8× faster
  (290 ms vs 2.5–4.9 s) because the model's KV cache is warm.

## 11. Known limitations

- **G7 open:** the site's build still uses `src/lib/agent-resources-core.ts`,
  not the extracted compiler. The package is a library; rewiring the site is a
  separate, riskier change.
- The compiler's approval store is an input, not a workflow: no audit log,
  revocation, or identity provider.
- Only markdown and JSON adapters exist; documentation websites, Git
  repositories, research archives and book manuscripts are not implemented.
- The agent benchmark used two local model families (`lfm3-omni`, `llama3.2`),
  not a frontier model. No remote inference was used.
- `chapter_covers` remains empty by evidence; the benchmark's correctness
  grader is rule-based, not human-adjudicated.
- The MCP server is verified over the stdio protocol but is not yet wired into
  the live Hermes profile (that needs the user's consent to edit `config.yaml`).

## 12. Commit references

| Commit | Change |
|---|---|
| `6081c71` | Productization audit |
| `5babff6` | SDK + MCP surface completed |
| `cada77e` | Interactive graph explorer |
| `1245432` | Manifest compiler + sample corpus |
| `2e791c3` | Agent benchmark + governance docs |
| `cb9d17c` | Final engineering report; sync benchmark numbers |
| `6d3f7b3` | Second model family in the agent benchmark |
| `f337df2` | Merge to `main` (production deploy) |

## 12. Deployment verification

Merged to `main` and pushed; Vercel deployed within two minutes.

- `npm run smoke:production` — **0 drift, 0 compile, 0 warning(s), 24 info**:
  all nine agent resources match the local build by byte hash, conditional
  requests return 304, 197 Markdown mirrors resolve, the draft mirror correctly
  404s, 109 claims / 109 evidence records resolve, and none of the 10 proposals
  appears in the authoritative graph.
- `https://www.danielkliewer.com/graph` — 200, title "Knowledge graph — Daniel
  Kliewer", 244 server-rendered entity links, `/graph` present in the sitemap.
- Real-browser check of production: 8 graph nodes on load, the **article**
  entity filter narrows the list 244 → 197, the **implements** relation filter
  narrows the graph to 7 nodes, reset restores 8, search input present,
  provenance text rendered in the detail panel.
- Live catalog: 197 articles · 12 projects · 8 concepts · 3 paths.

## 13. Recommended next phase

Deployed and verified (§12). Remaining work:

1. Wire the site's build to the extracted compiler behind the existing bound
   layer, so there is one compilation path (G7).
2. Add an approval workflow (who may approve, revocation, audit log) and a
   writer that refuses to promote an unapproved id.
3. Add the remaining source adapters against real archives.
4. Add a third model family and human adjudication of the 30 answers.
