// knowledge-mcp — a lightweight Model Context Protocol adapter over the
// danielkliewer.com static knowledge corpus.
//
// It is a stdio JSON-RPC server. It has no hosted component, no database and
// no inference: it reads the same static artifacts the website serves, through
// the knowledge SDK. Retrieval limits are enforced here as well as in the SDK,
// so a tool call can never pull an unbounded graph or an unbounded context.
//
// Environment:
//   KNOWLEDGE_BASE_URL   default https://www.danielkliewer.com
//   KNOWLEDGE_CACHE_DIR  optional on-disk body cache
//
// Protocol: MCP (2024-11-05). Tools:
//   search_knowledge, get_article, traverse_graph, get_evidence,
//   get_learning_path, get_book_context

import readline from "node:readline";
import { pathToFileURL } from "node:url";
import { KnowledgeCorpus } from "../../knowledge-sdk/src/index.ts";

const BASE_URL = process.env.KNOWLEDGE_BASE_URL ?? "https://www.danielkliewer.com";
const CACHE_DIR = process.env.KNOWLEDGE_CACHE_DIR;

/** Hard retrieval limits. A tool call cannot exceed these. */
const LIMITS = {
  maxDocuments: 20,
  maxBytes: 500_000,
  maxDepth: 4,
  maxNodes: 200,
};

let corpus: KnowledgeCorpus | undefined;

async function getCorpus(): Promise<KnowledgeCorpus> {
  if (!corpus) {
    corpus = await KnowledgeCorpus.connect({ baseUrl: BASE_URL, cacheDir: CACHE_DIR });
  }
  return corpus;
}

function clamp(value: unknown, fallback: number, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(1, Math.min(max, Math.floor(n)));
}

function text(result: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

function error(textMessage: string) {
  return { content: [{ type: "text", text: textMessage }], isError: true };
}

const TOOLS = [
  {
    name: "search_knowledge",
    description:
      "Search the compiled corpus and return the most relevant documents with verified Markdown bodies. Results respect a byte budget.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The question or keywords." },
        maxDocuments: { type: "number", description: "Maximum documents (≤ 20)." },
        maxBytes: { type: "number", description: "Byte budget (≤ 500000)." },
        concepts: { type: "array", items: { type: "string" } },
        projects: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["query"],
    },
  },
  {
    name: "get_article",
    description:
      "Fetch one article by slug: metadata, verified Markdown body, content hash, related claims and citation.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "traverse_graph",
    description:
      "Traverse the typed relation graph breadth-first from a node, limited by relation type and depth.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Node id, e.g. /projects/ganymede." },
        types: { type: "array", items: { type: "string" } },
        maxDepth: { type: "number", description: "Maximum depth (≤ 4)." },
      },
      required: ["from"],
    },
  },
  {
    name: "get_evidence",
    description: "Return the supporting and contradictory evidence for one claim.",
    inputSchema: {
      type: "object",
      properties: { claimId: { type: "string" } },
      required: ["claimId"],
    },
  },
  {
    name: "get_learning_path",
    description: "Return a learning path with its steps resolved to titles.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "get_book_context",
    description:
      "Return the book's relationships to an article, the chapter list and a citation.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const c = await getCorpus();
  switch (name) {
    case "search_knowledge":
      return c.search({
        query: String(args.query ?? ""),
        maxDocuments: clamp(args.maxDocuments, 6, LIMITS.maxDocuments),
        maxBytes: clamp(args.maxBytes, 150_000, LIMITS.maxBytes),
        concepts: (args.concepts as string[] | undefined) ?? [],
        projects: (args.projects as string[] | undefined) ?? [],
        tags: (args.tags as string[] | undefined) ?? [],
      });
    case "get_article":
      return c.getArticle(String(args.slug ?? ""));
    case "traverse_graph": {
      const result = await c.traverseGraph({
        from: String(args.from ?? ""),
        types: (args.types as string[] | undefined) ?? [],
        maxDepth: clamp(args.maxDepth, 2, LIMITS.maxDepth),
      });
      // Guard against an unbounded node set even if the graph changes.
      return {
        ...result,
        nodes: result.nodes.slice(0, LIMITS.maxNodes),
        edges: result.edges.slice(0, LIMITS.maxNodes),
        truncated: result.nodes.length > LIMITS.maxNodes,
      };
    }
    case "get_evidence":
      return c.getEvidence(String(args.claimId ?? ""));
    case "get_learning_path":
      return c.getLearningPath(String(args.slug ?? ""));
    case "get_book_context":
      return c.getBookContext(String(args.slug ?? ""));
    default:
      throw new Error(`unknown tool ${name}`);
  }
}

function send(message: unknown): void {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function handle(message: any): Promise<void> {
  const id = message.id;
  const method = message.method;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "danielkliewer-knowledge", version: "0.1.0" },
      },
    });
    return;
  }

  // Notifications have no id and expect no response.
  if (id === undefined || id === null) return;

  if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
    return;
  }

  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }

  if (method === "tools/call") {
    const name = message.params?.name;
    const args = (message.params?.arguments ?? {}) as Record<string, unknown>;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      send({ jsonrpc: "2.0", id, result: error(`unknown tool ${name}`) });
      return;
    }
    try {
      const result = await callTool(name, args);
      send({ jsonrpc: "2.0", id, result: text(result) });
    } catch (e) {
      send({ jsonrpc: "2.0", id, result: error((e as Error).message) });
    }
    return;
  }

  send({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `method not found: ${method}` },
  });
}

export async function main(): Promise<void> {
  process.stderr.write(`knowledge-mcp: connecting to ${BASE_URL}\n`);
  try {
    await getCorpus();
    process.stderr.write("knowledge-mcp: ready\n");
  } catch (e) {
    process.stderr.write(`knowledge-mcp: connection failed: ${(e as Error).message}\n`);
  }

  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let message: any;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    await handle(message);
  }
}

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) {
  main().catch((e) => {
    process.stderr.write(`knowledge-mcp: fatal: ${(e as Error).message}\n`);
    process.exit(1);
  });
}
