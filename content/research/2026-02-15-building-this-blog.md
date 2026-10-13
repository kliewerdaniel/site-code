---
book_reference: true
canonical_url: /blog/2026-02-15-building-this-blog
date: 02-15-2026
description: An in-depth look at the technical architecture behind this blog - how
  I built a performant, AI-powered publishing system with Next.js, Vercel AI SDK,
  MCP, semantic search, and knowledge graph visualization.
image: /images/1021019.png
layout: post
og:description: Discover the technical architecture behind this AI-powered blog built
  with Next.js, Vercel AI SDK, MCP, and local LLM integration.
og:image: https://danielkliewer.com/images/1021019.png
og:title: 'Building This Blog: A Technical Deep Dive'
og:type: article
og:url: https://danielkliewer.com/blog/building-this-blog
tags:
  - ai-agents
  - architecture
  - knowledge-graph
  - local-ai
  - next-js
  - ollama
  - rag
  - sovereign-ai
title: 'Building This Blog: A Technical Deep Dive into My Next.js AI-Powered Publishing
  Platform'
twitter:card: summary_large_image
twitter:description: How I built an AI-powered blog with Next.js, MCP, semantic search,
  and knowledge graph visualization.
twitter:image: https://danielkliewer.com/images/1021019.png
twitter:title: 'Building This Blog: AI-Powered Technical Architecture'
wiki_references: ["ai-agents", "ai-sovereignty", "data-sovereignty", "embeddings", "knowledge-graphs", "local-first-ai", "local-inference", "mcp", "ollama", "rag", "sentence-transformers", "typescript"]
---



# Building This Blog: A Technical Deep Dive into My Next.js AI-Powered Publishing Platform

I've been meaning to write this post for a while now. After all those blog posts about AI agents, local LLMs, RAG systems, and the Model Context Protocol, it seems only fitting to turn the lens inward and explain how this very blog actually works. This isn't just navel-gazing - understanding your tools deeply makes you a better developer, and I think there's genuine value in sharing the architectural decisions that make this system tick.

What makes this blog unique isn't just that it's a markdown-powered publishing platform - it's that the blog itself demonstrates the very AI technologies I write about. The site features an AI assistant with tool calling, MCP integration, semantic search powered by local embeddings, and an interactive knowledge graph. It's a working demonstration of local-first, sovereign AI infrastructure.

## The Foundation: Why Next.js?

When I set out to build this blog, I had several requirements in mind:

1. **Static site generation (SSG)** for performance and SEO
2. **Markdown support** because I wanted to write posts in plain text
3. **Type safety** given my background in TypeScript projects
4. **Easy deployment** with Vercel or similar platforms
5. **AI integration capabilities** to demonstrate agentic workflows
6. **Flexibility** to add features like semantic search and knowledge graphs later

Next.js checked all these boxes. The App Router provides excellent SSG support, and the React foundation means I can embed interactive components when needed. With Next.js 16 and React 19, we're at the cutting edge of React Server Components architecture.

## The Tech Stack

Here's what this blog is built on:

```json
{
  "framework": "Next.js 16.1.6",
  "language": "TypeScript (strict mode)",
  "ui": "React 19 + Tailwind CSS v4",
  "animations": "Framer Motion 12",
  "ai": "Vercel AI SDK 4.3",
  "llm": "Ollama + OpenAI + Anthropic",
  "protocol": "MCP (Model Context Protocol)",
  "markdown": "gray-matter + react-markdown",
  "visualization": "react-force-graph-3d + Three.js",
  "deployment": "Vercel"
}
```

The key differentiator from a typical blog is the AI layer. This isn't just a static site - it's an agentic platform that can search its own content, answer questions about my work, and demonstrate MCP in action.

## The File Structure

Let me walk you through how this blog is organized:

```
a01/
├── blog/                    # All markdown blog posts live here (100+ posts!)
│   ├── 2024-10-04-detailed-description-of-insight-journal.md
│   ├── 2025-03-24-model-context-protocol.md
│   ├── 2026-01-25-synthetic-intelligence.md
│   └── ... (many more posts on AI, LLMs, autonomous agents)
├── public/
│   ├── images/              # Blog post images
│   └── art/                 # AI-generated artwork (ComfyUI)
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/
│   │   │   ├── chat/       # AI Chat API endpoint
│   │   │   └── search/     # Semantic search API
│   │   └── blog/           # Blog listing and post pages
│   ├── components/
│   │   ├── ai/             # AI chat components with personas
│   │   ├── knowledge-graph.tsx  # 3D interactive knowledge graph
│   │   └── related-posts.tsx    # AI-powered recommendations
│   └── lib/
│       ├── blog.ts         # Core blog API with reading time & TOC
│       ├── semantic-search.ts    # Ollama-powered embeddings
│       ├── ai/
│       │   ├── tools.ts   # Tool definitions for AI agent
│       │   └── types.ts   # Persona definitions & schemas
│       └── mcp/
│           └── server.ts  # MCP server integration
└── package.json
```

The simplicity is intentional. Every markdown file in the `blog/` directory automatically becomes a blog post. No database, no CMS, no external dependencies. Just files - embodying the local-first philosophy I advocate for in my writing.

## The Core: blog.ts

The heart of this system is `src/lib/blog.ts`. Let me walk you through the key components:

### The BlogPost Interface

First, I defined a TypeScript interface that captures everything we need for a blog post:

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  author?: string;
  image?: string;
  content: string;
  layout?: string;
  canonical_url?: string;
  readingTime?: number; // Auto-calculated
  tableOfContents?: TableOfContentsItem[];
  og?: { /* Open Graph metadata */ };
  twitter?: { /* Twitter Card metadata */ };
}
```

This interface handles not just the basics (title, date, content) but also SEO metadata, reading time estimation, and auto-generated table of contents. The reading time is calculated based on an average reading speed of 200 words per minute:

```typescript
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
```

### Parsing Markdown with gray-matter

The magic happens through the `gray-matter` library, which parses YAML frontmatter from markdown files:

```typescript
const { data, content } = matter(fileContents);
```

- `data` contains the frontmatter (title, date, tags, etc.)
- `content` contains the actual markdown body

This separation is elegant because it lets me write metadata alongside content without any special syntax beyond standard YAML.

### Auto-Generating Table of Contents

For a technical blog, having a table of contents is essential. I extract headings from the markdown content automatically:

```typescript
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ id, title, level });
  }

  return headings;
}
```

This creates clickable anchor links for each heading, allowing readers to jump to specific sections.

## The AI Layer: Vercel AI SDK with Tool Calling

This is where the blog becomes more than a static site. I integrated the Vercel AI SDK to create an interactive AI assistant that can answer questions about the blog, search content, and demonstrate agentic workflows.

### The Chat API (`src/app/api/chat/route.ts`)

The chat endpoint handles streaming responses with tool calling support:

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  const { messages, personaId } = body;
  
  // Get the selected persona
  const persona = personas.find(p => p.id === personaId);
  
  // Build system prompt with persona context
  const systemPrompt = buildSystemPrompt(defaultAgent, persona);
  
  // Stream the response back to the client
  const stream = new ReadableStream({
    async start(controller) {
      // ... streaming logic
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
```

### Multiple AI Personas

The blog features four distinct AI personas, each tailored to different visitor needs:

| Persona | Description | Best For |
|---------|-------------|----------|
| **Technical Engineer** | Deep technical details, code examples, architecture diagrams | Developers |
| **Recruiter/HR** | High-level overview, business value, measurable achievements | Recruiters |
| **Researcher** | Academic depth, citations, theoretical foundations | Researchers |
| **General** | Balanced, accessible responses | General visitors |

Each persona has its own system prompt that guides the AI's tone and depth:

```typescript
export const personas: Persona[] = [
  {
    id: 'engineer',
    name: 'Technical Engineer',
    description: 'Deep technical depth with code examples, architecture diagrams, and implementation details',
    systemPrompt: `You are a Senior Software Engineer and AI Architect providing highly technical, detailed responses.
- Include code snippets, architectural patterns, and implementation details
- Reference specific libraries, APIs, and best practices
- Provide diagrams using Mermaid.js when explaining architectures`,
    tone: 'technical',
    responseStyle: 'detailed',
  },
  // ... more personas
];
```

## Tool Calling: The AI Can Search My Blog

One of the most powerful features is that the AI assistant can actually search and retrieve content from the blog. This demonstrates real tool calling - the same pattern used in production AI agents.

### Available Tools (`src/lib/ai/tools.ts`)

```typescript
export const availableTools: AITool[] = [
  {
    name: 'search_documentation',
    description: 'Search through blog posts and project documentation by keywords or topics',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or keywords' },
        limit: { type: 'number', description: 'Maximum number of results (default: 5)' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_blog_post',
    description: 'Get the full content of a specific blog post by its slug',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The blog post slug' }
      },
      required: ['slug']
    }
  },
  {
    name: 'list_personas',
    description: 'List available AI personas that can be used to tailor responses',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'get_site_info',
    description: 'Get information about this portfolio site, its architecture, and the owner',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'list_skills',
    description: 'List all technical skills and areas of expertise',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'get_featured_projects',
    description: 'Get information about featured projects on the site',
    parameters: { type: 'object', properties: {} }
  }
];
```

When you ask the AI about a topic, it can actually search through all 100+ blog posts and provide relevant answers with links. This is RAG (Retrieval-Augmented Generation) in action.

## Semantic Search with Ollama Embeddings

Beyond keyword search, I implemented semantic search that understands the meaning behind queries. This uses Ollama to generate embeddings locally:

```typescript
// src/lib/semantic-search.ts
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.embedding;
    }
  } catch (error) {
    console.log('Ollama not available, using fallback embedding');
  }
  
  // Fallback to simple hash-based embeddings
  return simpleHash(text);
}

export async function semanticSearch(
  query: string,
  posts: BlogPost[],
  limit: number = 5
): Promise<BlogPost[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const postsWithScores = posts.map(post => {
    const postEmbedding = await getEmbeddingForPost({...});
    const score = cosineSimilarity(queryEmbedding, postEmbedding);
    return { post, score };
  });
  
  return postsWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
```

The search API endpoint (`src/app/api/search/route.ts`) exposes this functionality:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');
  
  const posts = getBlogPosts();
  const results = await semanticSearch(query, posts, limit);
  
  return NextResponse.json({
    query,
    count: results.length,
    results: results.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      tags: post.tags,
      readingTime: post.readingTime,
    })),
  });
}
```

## MCP (Model Context Protocol) Integration

This blog demonstrates the Model Context Protocol - a standardized way for AI models to interact with external tools and data sources. The MCP server (`src/lib/mcp/server.ts`) exposes blog functionality as tools that can be called by MCP-enabled AI clients:

```typescript
const tools: ToolDefinition[] = [
  {
    name: 'search_blog',
    description: 'Search through blog posts by keywords or topics',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_post',
    description: 'Get full content of a specific blog post',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Blog post slug' }
      },
      required: ['slug']
    }
  },
  {
    name: 'list_posts',
    description: 'List all available blog posts',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_site_info',
    description: 'Get information about the portfolio site',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_skills',
    description: 'Get technical skills and expertise areas',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_projects',
    description: 'Get featured projects and their details',
    inputSchema: { type: 'object', properties: {} }
  }
];
```

You can connect this MCP server to Claude Desktop or other MCP clients:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "npx",
      "args": ["tsx", "src/lib/mcp/server.ts"]
    }
  }
}
```

This is the same infrastructure I write about in my posts about building sovereign AI systems - the blog itself is a working demonstration.

## Knowledge Graph Visualization

One of the most visually impressive features is the interactive 3D knowledge graph. This uses `react-force-graph-3d` to visualize connections between blog posts, tags, categories, and projects:

```typescript
// src/components/knowledge-graph.tsx
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => <div>Loading knowledge graph...</div>,
});

// Nodes represent: blog posts, projects, tags, categories
// Links represent: has_tag, in_category, related_to
<ForceGraph3D
  graphData={graphData}
  nodeLabel="name"
  nodeColor={getNodeColor}
  onNodeClick={handleNodeClick}
  linkColor={() => 'rgba(255, 255, 255, 0.1)'}
/>
```

The graph shows:
- **Blue nodes**: Blog posts (100+ articles)
- **Purple nodes**: Projects (15 featured projects)
- **Green nodes**: Tags (topics and technologies)
- **Orange nodes**: Categories

Clicking on any node navigates to that content or highlights related nodes. It's a visual representation of how all my work connects together.

## The Frontmatter Schema

Every blog post follows a comprehensive frontmatter schema:

```markdown
---
layout: post
title: "Your Post Title"
date: "02-15-2026"
author: "Daniel Kliewer"
description: "A brief description for SEO and previews"
tags: ["tag1", "tag2", "ai", "llm", "mcp"]
canonical_url: "https://example.com/your-post"
image: "/images/your-image.png"
og:title: "Custom OG title"
og:description: "Custom OG description"
og:image: "https://example.com/image.png"
og:url: "https://example.com/your-post"
og:type: "article"
twitter:card: "summary_large_image"
twitter:title: "Custom Twitter title"
twitter:description: "Custom Twitter description"
twitter:image: "https://example.com/image.png"
---
```

This comprehensive frontmatter enables:
- **SEO optimization** through meta tags and structured data
- **Social sharing** through Open Graph and Twitter cards
- **Categorization** through tags and categories
- **Canonical URLs** to prevent duplicate content issues

## Rendering Posts

In the Next.js App Router, individual posts use dynamic routes with static generation:

```typescript
// src/app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  
  if (!post) return <div>Post not found</div>;
  
  return <BlogPostContent post={post} />;
}
```

The `generateStaticParams` function enables SSG - Next.js pre-builds all blog post pages at build time for optimal performance.

## The AI Chat Component

The chat interface itself is a polished React component with:

- **Streaming responses** using the Vercel AI SDK
- **Persona selection** via a dropdown
- **Loading states** with animated indicators
- **Message history** with proper roles (user/assistant)
- **Collapsible panel** that can be minimized
- **Responsive design** for mobile

```typescript
// src/components/ai/ai-chat.tsx
export function AIChat({ defaultPersona = 'engineer' }) {
  const [messages, setMessages] = useState([...]);
  const [selectedPersona, setSelectedPersona] = useState(defaultPersona);
  const [isLoading, setIsLoading] = useState(false);
  
  // Streaming response handling
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, personaId: selectedPersona })
  });
  
  const reader = response.body?.getReader();
  // ... stream chunks and update UI
}
```

## Why This Approach Works

After maintaining this blog for a while, here's what I've learned:

### Pros

1. **Simplicity**: No database, no CMS, no authentication. Just files.
2. **Version control**: Every post is a text file. Git handles history and collaboration.
3. **Performance**: Static generation means fast page loads.
4. **Portability**: If I ever want to move platforms, I just take my markdown files.
5. **Developer experience**: Writing in markdown with a good editor is a pleasure.
6. **AI demonstration**: The site itself shows rather than tells the capabilities of modern AI.
7. **Data sovereignty**: Everything runs locally-first, no external dependencies for core functionality.

### Cons

1. **No dynamic features**: Comments, likes, and real-time updates require additional infrastructure.
2. **Build times**: As the blog grows, build times increase (though this hasn't been an issue yet).
3. **Image management**: Manually managing images in a folder requires discipline.
4. **AI dependency**: Some features require Ollama running locally for full functionality.

## Features I've Added

1. **✅ Semantic search**: Using local embeddings (Ollama) for concept-based search
2. **✅ Related posts**: AI-generated recommendations based on content similarity
3. **✅ Reading time**: Auto-calculated based on word count
4. **✅ Table of contents**: Auto-generated from headings
5. **✅ Syntax highlighting**: Using Shiki for beautiful code blocks
6. **✅ AI Assistant**: Interactive chat with tool calling and personas
7. **✅ Knowledge Graph**: 3D visualization of content relationships
8. **✅ MCP Integration**: Protocol-compliant server for external AI clients

## The Philosophy: Local-First, Sovereign AI

This blog embodies the principles I write about:

- **Local-first**: The core functionality works without cloud dependencies
- **Data sovereignty**: Your content lives in your files, not in someone else's database
- **Open protocols**: MCP demonstrates standardized AI-tool communication
- **Practical AI**: Real tool calling, not just chatbots

The key insight isn't any particular technology - it's the principle of **local-first, file-based architecture**. When your content lives as plain text files, you gain flexibility, durability, and simplicity that no CMS can match. And when your AI infrastructure can run locally, you gain privacy, control, and resilience.

## Conclusion

Building this blog taught me a lot about the intersection of simplicity and capability. By leveraging Next.js static generation, TypeScript type safety, and markdown's elegance, I created a system that's easy to maintain, fast to deploy, and pleasant to write for. The AI layer transforms it from a static blog into an interactive platform that demonstrates the very technologies I write about.

If you're building a personal blog or portfolio, I highly recommend this approach. Start simple, add AI capabilities when they add genuine value, and always prioritize your writing experience over fancy features. The blog is, first and foremost, a place for ideas - the technology should serve that purpose, not distract from it.

The future of the web is agentic, tool-using, and local-first. This blog is a small demonstration of that future, running today.

Happy blogging!

![Blog Architecture](/images/1021018.png)
