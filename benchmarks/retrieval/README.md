# Agent retrieval benchmark

An empirical comparison of three retrieval architectures over the published
corpus. The dataset and harness are committed; the report is generated from the
local build.

```bash
npm run benchmark
```

## The three architectures

| | A · Conventional crawling | B · Catalog + graph | C · Catalog + graph + Markdown |
|---|---|---|---|
| Discovery | Fetch the sitemap, crawl every HTML page into a local index | Fetch `/agents/catalog.json` + `/agents/graph.json` once | Same as B |
| Ranking | Term overlap over raw HTML text (chrome + RSC payload included) | Term weighting over catalog metadata; graph for relational queries | Same as B |
| Body fetch | None after the crawl (the index already holds the pages) | Fetch the top 5 HTML pages | Fetch the top 5 Markdown mirrors |
| Graph | None | Typed relation graph | Typed relation graph |

## Results (30 questions, 197 articles)

| Metric | A · Crawling | B · Catalog + graph | C | 
|---|---|---|---|
| Recall@5 | 0.433 | **1.000** | **1.000** |
| Precision@5 | 0.087 | 0.467 | 0.467 |
| Citation accuracy | 0.433 | **1.000** | **1.000** |
| One-time bytes | 31,549 KB (198 requests) | **265 KB (2 requests)** | **265 KB (2 requests)** |
| Total bytes | 31,549 KB | 24,780 KB | **6,317 KB** |
| Requests / query | 6.6 | 4.0 | 3.9 |
| Latency / query (local) | 27.4 ms | 0.8 ms | 0.9 ms |
| Context efficiency | 0.070 | 0.280 | 0.275 |

## What the experiment establishes

1. **The compiled catalog changes retrieval, not just cost.** Recall@5 rises
   from 0.433 to 1.000 and citation accuracy from 0.433 to 1.000. The graph
   answers the relational questions directly; a crawler has no graph.
2. **The one-time cost drops by two orders of magnitude.** Crawling every page
   costs 31.5 MB and 198 requests; the catalog and graph cost 265 KB and 2
   requests.
3. **Canonical Markdown is the cheapest body transport.** For the same
   ranking, Markdown mirrors cost 6.3 MB across the benchmark against 24.8 MB
   for the HTML pages — a 3.9× reduction on top of the catalog saving, and a
   5.0× reduction against crawling.
4. **Precision@5 is limited by the question mix, not the architecture.** The
   10 relational questions have multiple ground-truth documents; the 20 topical
   questions have one. Both B and C return the same top 5 for the same query,
   so their precision is identical. A's 0.087 reflects noisy full-text ranking
   over raw HTML.

## What it does not establish

- **Network latency.** The benchmark runs against the local build. Latency
  figures are local processing time; bytes transferred are the artifact sizes a
  real client would download, which is the dominant term on a network.
- **Answer quality.** The benchmark measures whether the right document is
  retrieved, not whether an agent's answer is correct. A successful retrieval
  supports only the proposition that the document was found.
- **Naturalistic questions.** The question set is generated deterministically
  from the corpus (article descriptions as queries; graph edges as relational
  questions). That favours metadata matching, which is exactly what the
  compiled catalog publishes. Hand-written questions might rank differently.
- **A production crawler.** Architecture A uses naive HTML text extraction
  (chrome, scripts stripped, RSC payload left mangled). A crawler with better
  extraction and a real inverted index would improve recall, but would still
  pay the full crawl cost and would still lack the typed graph.
- **Generalization.** One site, one corpus, one point in time. The absolute
  numbers will differ elsewhere; the direction — a compact catalog plus typed
  metadata retrieves at least as well as crawling and costs far less — is the
  claim.

## Reproducing

```bash
npm run build
npm run benchmark
```

The harness reads `.next/server/app`, writes `data/questions.json` and
`data/benchmark-report.json`, and prints the table above. The dataset is
deterministic: the same build produces the same questions and the same numbers.

## Files

| Path | Purpose |
|---|---|
| `src/benchmark.mjs` | Dataset generation, the three architectures, the metrics. |
| `data/questions.json` | The 30-question evaluation dataset with ground truth. |
| `data/benchmark-report.json` | The full machine-readable report. |
