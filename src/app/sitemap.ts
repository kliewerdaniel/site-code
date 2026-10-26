import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { PROJECTS, CONCEPTS, PATHS } from "@/lib/taxonomy";

const SITE_URL = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/book",
    "/about",
    "/research",
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
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  return [...staticRoutes, ...postRoutes];
}
