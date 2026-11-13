# @danielkliewer/knowledge-compiler

A reusable compile-time knowledge compiler. A source manifest in, governed,
content-addressed knowledge artifacts out. No Next.js, no runtime inference, no
database.

## The pipeline

```
MANIFEST
  -> validate manifest
  -> load sources        (markdown, structured JSON)
  -> normalize           (source format -> SourceDocument)
  -> validate            (deterministic; a failure rejects, never repairs)
  -> propose             (deterministic rules; proposals only)
  -> approval gate       (an explicit human approval promotes a proposal)
  -> governance assertion
  -> static artifacts    (corpus bundle, Markdown mirrors, resource index)
```

The frozen-spine rule: a proposal is never authoritative. It becomes a
relation only when a human has approved its id **and** deterministic validation
passes **and** the approval's source fingerprint matches the proposal's
evidence. Everything else is carried as a proposal with `authoritative: false`,
or rejected outright.

## Use

### Manifest-driven (recommended)

```ts
import { compileFromManifest } from "@danielkliewer/knowledge-compiler";

const manifest = {
  schema: "knowledge-source/1",
  site: { name: "My Corpus", url: "https://example.com" },
  sources: [
    { kind: "markdown", root: "docs" },
    { kind: "json", file: "knowledge.json" },
  ],
  approvals: [
    {
      proposalId: "proposal:related_to:a.md->b.md",
      approvedBy: "A human",
      reason: "Both documents describe the same system.",
      at: "2026-11-13T00:00:00.000Z",
      sourceFingerprint: "<sha256 of the proposal evidence>",
    },
  ],
  output: { directory: "dist", baseUrl: "https://example.com/knowledge" },
};

const { bundle, files, result } = compileFromManifest(manifest, { write: true });
```

A working example lives in [`examples/sample-corpus`](../../examples/sample-corpus):
a second, independent documentation archive (Markdown + JSON, one draft, one
invalid record, one human approval). Compile it with
`node examples/sample-corpus/compile.mjs`.

### Direct

```ts
import { compile, normalizeDocument } from "@danielkliewer/knowledge-compiler";

const documents = sources.map((s) => normalizeDocument(s.raw, s.path));

const result = compile({
  documents,
  approved: new Set(["proposal:related_to:a.md->b.md"]), // human-approved only
});

result.documents;   // published, validated
result.relations;   // declared + approved
result.claims;      // every proposal, with its assessment
result.rejected;    // invalid documents, with reasons
result.excludedDrafts;
```

## Modules

| Module | Responsibility |
|---|---|
| `manifest.ts` | The source manifest schema and its structural validation. |
| `adapters.ts` | Markdown and JSON source adapters. Paths are confined to the declared root; content is hashed, never executed. |
| `normalize.ts` | Parse source frontmatter and body; hash the body. |
| `propose.ts` | Deterministic proposal rules (tag overlap by default). |
| `validate.ts` | Structural validation: title, dates, body, content hash. |
| `approval.ts` | Explicit approval records: who, why, when, against which fingerprint. |
| `compile.ts` | The governed pipeline and the frozen-spine assertion. |
| `emit.ts` | Deterministic artifact emission: corpus bundle, Markdown mirrors, resource index. |
| `compileFromManifest.ts` | The manifest-driven entry point. |

## Artifacts

| Artifact | Purpose |
|---|---|
| `corpus.json` | Versioned bundle (`knowledge-corpus/1`): documents, relations, claims, proposals, evidence, counts. |
| `mirrors/<slug>.md` | Canonical Markdown mirror per published document, with a verifying `content_hash`. |
| `index.json` | Every artifact with its byte size, content type and SHA-256. |

Two compilations of the same manifest produce byte-identical artifacts.

## Rules the compiler enforces

- A draft never reaches the artifacts.
- A document that fails validation is rejected with reasons, never repaired.
- A proposal is never authoritative without an explicit approval.
- An approval must name a real proposal and match its source fingerprint.
- A relation carries provenance and a modification fingerprint; an approved
  relation also carries who approved it, when and why.
- A claim records what the evidence establishes (`implemented`, `tested`,
  `demonstrated`, `independently_verified`, `hypothesized`), which is never
  confused with schema validity.

## Tests

```bash
node --test packages/knowledge-compiler/tests/compiler.test.mjs
node --test packages/knowledge-compiler/tests/manifest.test.mjs
```

## License

UNLICENSED — reference-implementation material.
