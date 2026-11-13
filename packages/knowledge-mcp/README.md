# @danielkliewer/knowledge-mcp

A lightweight Model Context Protocol adapter over the
[danielkliewer.com](https://www.danielkliewer.com) static knowledge corpus.

It is a stdio JSON-RPC server. There is no hosted service, no database and no
inference: it reads the same static artifacts the website serves, through
[`@danielkliewer/knowledge-sdk`](../knowledge-sdk). It is separate from the
website's Next.js deployment runtime.

## Run

```bash
node packages/knowledge-mcp/src/server.ts
```

Or point it at another corpus:

```bash
KNOWLEDGE_BASE_URL=https://www.danielkliewer.com \
KNOWLEDGE_CACHE_DIR=/tmp/knowledge-cache \
node packages/knowledge-mcp/src/server.ts
```

## Configure an agent

Claude Desktop / compatible clients, `claude mcp add` or the config file:

```json
{
  "mcpServers": {
    "danielkliewer-knowledge": {
      "command": "node",
      "args": ["/absolute/path/to/site-code/packages/knowledge-mcp/src/server.ts"],
      "env": {
        "KNOWLEDGE_BASE_URL": "https://www.danielkliewer.com"
      }
    }
  }
}
```

Hermes and other local agents can use the same stdio transport.

## Tools

| Tool | Input | Output |
|---|---|---|
| `search_knowledge` | `query`, `maxDocuments?`, `maxBytes?`, `concepts?`, `projects?`, `tags?` | Ranked documents with verified Markdown bodies. |
| `get_article` | `slug` | Metadata, verified body, content hash, claims, citation. |
| `traverse_graph` | `from`, `types?`, `maxDepth?` | Breadth-first nodes and edges. |
| `get_evidence` | `claimId` | Supporting and contradictory evidence. |
| `get_learning_path` | `slug` | The path with steps resolved to titles. |
| `get_book_context` | `slug` | The book's relationships to the article, chapters, citation. |

## Limits

The adapter enforces hard retrieval limits on top of the SDK:

| Limit | Value |
|---|---|
| `maxDocuments` | 20 |
| `maxBytes` | 500,000 |
| `maxDepth` | 4 |
| graph nodes / edges per traversal | 200 |

A tool call cannot exceed these. The SDK applies its own lower defaults (6
documents, 150,000 bytes) when the caller does not specify them.

## Protocol

MCP `2024-11-05` over stdio. The server handles `initialize`, `ping`,
`tools/list` and `tools/call`. Tool results are JSON in a `text` content block;
failures return `isError: true` with the message, so a broken corpus degrades to
a readable error rather than a crashed session.

## License

UNLICENSED — reference-implementation material.
