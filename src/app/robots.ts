import type { MetadataRoute } from "next";
import { SITE } from "@/config";

/* Crawler policy.
   This site exists to be discovered — by search engines and by AI agents — so
   the policy is permissive. robots.txt is a preference, not an access-control
   mechanism: it does not prevent fetching, and an agent that ignores it is not
   stopped by this file. Enforcement (rate limits, challenges, blocks) belongs
   at the edge; see docs/TRAFFIC.md.

   AI crawlers are explicitly allowed, because blocking them would defeat the
   purpose of the agent interface. Known good-faith research crawlers are
   listed for clarity, not because they are treated differently. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Named for documentation; same allow-all policy as `*`.
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
