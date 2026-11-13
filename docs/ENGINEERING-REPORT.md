# Engineering report — productizing the deterministic knowledge compiler

Branch `feat/knowledge-compiler-productization`. Production was **not**
deployed; this report distinguishes what is verified locally from what is
still pending.

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

**Agent** (`npm run benchmark:agent`, local `lfm3-omni:latest`, temperature 0,
256-token budget, cold and warm passes). Cold results:

| Architecture | Rule-correct | Citation | Abstain on no-support | Unsupported claim | Fabricated citation | Tokens/query | Latency/query |
|---|---|---|---|---|---|---|---|
| A · crawling | 33.3% | 0.0% | 100% | 0.0% | 16.7% | 6,196 | 2,545 ms |
| B · catalog + graph | **66.7%** | 26.7% | 83.3% | 33.3% | 3.3% | 8,703 | 2,790 ms |
| C · + Markdown | 63.3% | 26.7% | **100%** | **0.0%** | 3.3% | 15,456 | 4,922 ms |
| D · parametric | 23.3% | 0.0% | 0.0% | 16.7% | 6.7% | 66 | 186 ms |

What this supports: the compiled catalog+graph answers more questions correctly
than crawling or the parametric control; crawling never produces a canonical
citation and fabricates URLs; Markdown improves epistemic discipline (100%
abstention, zero unsupported claims) at 1.8× the tokens and latency of B.

What it does not support: a claim that the architecture improves reasoning in
general. The correctness metric is rule-based, one model family was available,
and B hallucinated on one claim question and mangled one slug. Raw answers are
committed for review.

## 9. Test results

`npm test`: **183 tests, 181 pass, 2 fail**. Both failures are the
`REAL RUNTIME` Node gate, which requires Node 22.23.4 and a clean bundled trust
store; this shell runs 22.23.1. The same file passes 20/20 under 22.23.4. The
build, all validators and conformance pass under 22.23.4 with 0 errors.

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
- The agent benchmark used one local model family. No remote inference was used.
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

## 13. Recommended next phase

1. Human review, then deploy the branch and run `npm run smoke:production`.
2. Wire the site's build to the extracted compiler behind the existing bound
   layer, so there is one compilation path.
3. Add an approval workflow (who may approve, revocation, audit log) and a
   writer that refuses to promote an unapproved id.
4. Add the remaining source adapters against real archives, and run the agent
   benchmark on a second model family.
