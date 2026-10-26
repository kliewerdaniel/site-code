import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { PROJECTS, CONCEPTS, PATHS } from "@/lib/taxonomy";

const SITE_URL = SITE.url;

/**
 * Freshness policy.
 *
 * A static page has no modification date in the repo, so the previous
 * implementation stamped every one of them with `new Date()` — which put the
 * build timestamp in all 34 `<lastmod>` elements. A build timestamp is not a
 * modification date and it lies on every deploy, so static routes now carry
 * **no** `lastModified` at all. Only two pages can state a truthful date:
 * `/` and `/research`, which list the archive and therefore change when a post
 * is published. They use the newest post's date.
 *
 * Posts use `updated ?? date` (see `resolveUpdated` in src/lib/seo-core.ts), so
 * the sitemap, `articleSchema.dateModified` and `article:modified_time` can
 * never disagree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newestPost = posts[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    ...["/", "/research"].map((route) => ({
      url: `${SITE_URL}${route}`,
      // Truthful only because these two pages list the archive.
      ...(newestPost ? { lastModified: new Date(newestPost.date) } : {}),
    })),
    ...[
      "/book",
      "/about",
      "/contact",
      "/sample",
      "/projects",
      "/concepts",
      "/paths",
      ...PROJECTS.map((p) => `/projects/${p.slug}`),
      ...CONCEPTS.map((c) => `/concepts/${c.slug}`),
      ...PATHS.map((p) => `/paths/${p.slug}`),
      "/privacy",
      "/terms",
    ].map((route) => ({ url: `${SITE_URL}${route}` })),
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
  }));

  return [...staticRoutes, ...postRoutes];
}
