# Sample knowledge corpus

A second, independent documentation archive used to prove that
`@danielkliewer/knowledge-compiler` is not tied to danielkliewer.com. It is
intentionally small and deliberately imperfect.

## Contents

| Path | Purpose |
|---|---|
| `docs/*.md` | Markdown sources with frontmatter. One draft, one record with no publication date. |
| `knowledge.json` | A structured JSON knowledge source. |
| `manifest.json` | The only input the compiler needs. |

## Compile it

```bash
node examples/sample-corpus/compile.mjs
```

That reads `manifest.json`, validates it, loads both sources, normalizes,
validates each document, proposes relations, applies the approval record,
asserts the frozen-spine governance rule, and writes the artifacts to `dist/`.

## What it demonstrates

- **Draft exclusion.** `docs/draft-post.md` never reaches the artifacts.
- **Deterministic rejection.** `docs/broken.md` has no publication date; it is
  reported in `counts.rejected`, never repaired.
- **Two source adapters.** Markdown and structured JSON in one compilation.
- **The approval gate.** One proposal is approved by a named human, at a time,
  for a reason, against a source fingerprint. The other stays non-authoritative.
- **Determinism.** Two compilations produce byte-identical artifacts.
