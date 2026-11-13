# @danielkliewer/knowledge-compiler

A reusable compile-time knowledge compiler. Source material in, governed
knowledge artifacts out. No Next.js, no runtime inference, no database.

## The pipeline

```
SOURCE MATERIAL
  -> normalize            (source format -> SourceDocument)
  -> validate             (deterministic; a failure rejects, never repairs)
  -> propose              (deterministic rules; proposals only)
  -> approval gate        (an explicit human approval promotes a proposal)
  -> compile              (documents, relations, claims, rejected, excluded)
  -> static artifacts
```

The frozen-spine rule: a proposal is never authoritative. It becomes a
relation only when a human has approved its id **and** deterministic validation
passes. Everything else is carried as a proposal with `authoritative: false`,
or rejected outright.

## Use

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
| `normalize.ts` | Parse source frontmatter and body; hash the body. |
| `propose.ts` | Deterministic proposal rules (tag overlap by default). |
| `validate.ts` | Structural validation: title, dates, body, content hash. |
| `compile.ts` | The governed pipeline and the frozen-spine assertion. |

## Rules the compiler enforces

- A draft never reaches the artifacts.
- A document that fails validation is rejected with reasons, never repaired.
- A proposal is never authoritative without an explicit approval.
- A relation carries provenance and a modification fingerprint.
- A claim records what the evidence establishes (`implemented`, `tested`,
  `demonstrated`, `independently_verified`, `hypothesized`), which is never
  confused with schema validity.

## Tests

```bash
node --test packages/knowledge-compiler/tests/compiler.test.mjs
```

## License

UNLICENSED — reference-implementation material.
