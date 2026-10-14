import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  canonicalUrl: string;
  content: string;
  readingMinutes: number;
}

const POSTS_DIR = path.join(process.cwd(), "content", "research");

let cache: Post[] | null = null;

function normalizeDate(raw: unknown): string {
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? "" : raw.toISOString();
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
    return raw;
  }
  return "";
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
  return [];
}

function plainTextExcerpt(markdown: string, maxLen: number): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

function firstBodyImage(markdown: string): string | undefined {
  const m = markdown.match(/\]\((\/images\/[^)\s"']+)\)/);
  return m ? m[1] : undefined;
}

function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .trim();
  if (text.length === 0) return 0;
  return text.split(/\s+/).length;
}

function parsePostFile(filename: string): Post {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const image: string | undefined =
    typeof data.image === "string" && data.image.trim().length > 0
      ? data.image.trim()
      : firstBodyImage(content);

  const description =
    typeof data.description === "string" && data.description.trim().length > 0
      ? data.description.trim()
      : plainTextExcerpt(content, 160);

  const canonical =
    (typeof data.canonical_url === "string" && data.canonical_url.trim()) ||
    (typeof data.canonicalUrl === "string" && data.canonicalUrl.trim()) ||
    `/blog/${slug}`;

  return {
    slug,
    title: typeof data.title === "string" ? data.title : String(data.title ?? slug),
    date: normalizeDate(data.date),
    description,
    tags: normalizeTags(data.tags),
    image,
    canonicalUrl: canonical,
    content,
    readingMinutes: Math.max(1, Math.ceil(countWords(content) / 200)),
  };
}

function loadPosts(): Post[] {
  if (cache) return cache;
  if (!fs.existsSync(POSTS_DIR)) {
    cache = [];
    return cache;
  }
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));
  const posts = files.map(parsePostFile);
  posts.sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    const aBad = isNaN(ta);
    const bBad = isNaN(tb);
    if (aBad && bBad) return 0;
    if (aBad) return 1;
    if (bBad) return -1;
    return tb - ta;
  });
  cache = posts;
  return cache;
}

/** All posts, newest first. Posts with unparsable dates sort last. */
export function getAllPosts(): Post[] {
  return loadPosts();
}

/** Single post by exact slug (filename minus ".md"), or undefined. */
export function getPostBySlug(slug: string): Post | undefined {
  return loadPosts().find((p) => p.slug === slug);
}

/** Canonical slug for a tag: lowercase, hyphen-joined. Both the ?tag= URL and
 *  tag matching normalize through this so "RAG", "rag" and "RAG " all resolve
 *  to one page — never two crawlable spellings of the same content. */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Tag usage counts, keyed by canonical slug, sorted by count descending.
 *  `tag` is the most common original spelling; `count` is the summed usage. */
export function getAllTags(): { tag: string; slug: string; count: number }[] {
  const bySlug = new Map<string, { tag: string; count: number }>();
  for (const post of loadPosts()) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag);
      if (!slug) continue;
      const entry = bySlug.get(slug) ?? { tag, count: 0 };
      entry.count += 1;
      if (tag.length < entry.tag.length) entry.tag = tag;
      bySlug.set(slug, entry);
    }
  }
  return [...bySlug.entries()]
    .map(([slug, e]) => ({ tag: e.tag, slug, count: e.count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Posts sharing tags with the given post, excluding itself.
 * Ranked by shared-tag overlap (desc), tie-broken newest first.
 */
export function getRelatedPosts(slug: string, n = 3): Post[] {
  const target = getPostBySlug(slug);
  if (!target || target.tags.length === 0) return [];
  const tagSet = new Set(target.tags);
  return loadPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      overlap: p.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter((r) => r.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return (
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
      );
    })
    .slice(0, n)
    .map((r) => r.post);
}

/**
 * Cross-links for a post's "More from the archive" block. Unlike
 * getRelatedPosts this never returns empty: posts with no tag overlap (or no
 * tags at all) fall back to their chronological neighbors, so every post
 * contributes outbound links into the graph instead of being a dead-end leaf.
 * Tag-overlap results always take precedence; temporal fill only pads to n.
 */
export function getArchiveNeighbors(slug: string, n = 6): Post[] {
  const all = loadPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return [];

  const primary = getRelatedPosts(slug, n);
  const seen = new Set([slug, ...primary.map((p) => p.slug)]);
  const out = [...primary];

  // Temporal fill: walk outward from the post's position in the
  // newest-first ordering, alternating before/after so the links stay
  // contextually near in time.
  let before = idx - 1;
  let after = idx + 1;
  while (out.length < n && (before >= 0 || after < all.length)) {
    if (after < all.length) {
      const p = all[after++];
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        out.push(p);
      }
    }
    if (out.length < n && before >= 0) {
      const p = all[before--];
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        out.push(p);
      }
    }
  }
  return out;
}
