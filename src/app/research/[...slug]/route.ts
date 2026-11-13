import { AGENT_CACHE_CONTROL, getMarkdownMirror } from "@/lib/agent-resources";
import { getAllPosts } from "@/lib/posts";

/* Canonical Markdown mirror of one published article, at
   /research/<slug>.md. Generated at build time from the same source the blog
   page renders, so the mirror cannot disagree with the article.

   A catch-all is used because Next's router does not treat `[slug].md` as a
   dynamic segment; `[...slug]` matches the single `<slug>.md` path and the
   handler refuses anything that is not exactly one *.md segment. Drafts are
   absent from generateStaticParams and from getMarkdownMirror, so they 404. */

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: [`${p.slug}.md`] }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  if (slug.length !== 1 || !slug[0].endsWith(".md")) {
    return new Response("not found", { status: 404 });
  }
  const postSlug = slug[0].slice(0, -".md".length);
  const resource = getMarkdownMirror(postSlug);
  if (!resource) return new Response("not found", { status: 404 });

  return new Response(resource.body, {
    headers: {
      "Content-Type": resource.contentType,
      "Cache-Control": AGENT_CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
