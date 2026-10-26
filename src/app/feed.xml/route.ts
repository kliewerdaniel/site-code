import { SITE } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { feedXml } from "@/lib/seo-core";

/* Static: the feed is a pure function of the archive, so it is rendered once
   at build time and served from the edge. Before this it was dynamic (ƒ) with
   no Cache-Control, so every request re-rendered 195 items and nothing cached
   it. */
export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();

  const items = posts.map((post) => {
    const link = `${SITE.url}/blog/${post.slug}`;
    const pubDate = new Date(post.date);
    return {
      title: post.title,
      link,
      description: post.description,
      pubDate: isNaN(pubDate.getTime())
        ? new Date().toUTCString()
        : pubDate.toUTCString(),
      creator: SITE.name,
      // One <category> per tag, so a subscriber can filter by subject.
      categories: post.tags,
    };
  });

  const newest = posts[0];
  const lastBuildDate = newest
    ? new Date(newest.date).toUTCString()
    : new Date().toUTCString();

  return new Response(
    feedXml({
      title: `${SITE.name} — Research`,
      link: SITE.url,
      description: SITE.description,
      lastBuildDate,
      items,
    }),
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
