import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { getAllPosts } from "@/lib/posts";

const SITE_URL = SITE.url;

const FLEET_DOMAINS = [
  "knowledge-compilation",
  "compile-time-ai",
  "scientific-knowledge-systems",
  "local-first-ai",
  "cognitive-memory",
  "research-automation",
  "knowledge-representation",
  "decision-graphs",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/book",
    "/about",
    "/research",
    "/press",
    "/contact",
    "/sample",
    "/mission",
    "/fleet",
    ...FLEET_DOMAINS.map((d) => `/fleet/${d}`),
    "/paper",
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
