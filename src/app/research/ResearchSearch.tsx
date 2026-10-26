"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

export interface SearchablePost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}



export default function ResearchSearch({
  posts,
  children,
}: {
  posts: SearchablePost[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const terms = q.split(/\s+/);
    return posts.filter((p) => {
      const haystack =
        `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [query, posts]);

  return (
    <div>
      {/* Sticky so search stays reachable through a 184-post archive — and,
          because it now floats over the scrolling list, it is the one place on
          this page where glass has something real to blur. `top` reads the
          header's measured height rather than a guessed constant. */}
      <div
        className="glass sticky z-40 -mx-6 mb-10 border-b px-6 py-4"
        style={{ top: "var(--header-h)" }}
      >
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 184 research posts…"
            aria-label="Search research posts"
            className="w-full rounded-lg border border-rule-2/70 bg-void/55 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-2/50 focus:border-gold focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-ink-2 hover:text-ink"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {results === null ? (
        children
      ) : (
        <div>
          <p className="font-mono text-xs text-ink-2 mb-6">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &ldquo;{query.trim()}&rdquo;
          </p>
          <ul className="divide-y divide-rule">
            {results.map((p) => (
              <li key={p.slug} className="py-6 first:pt-0">
                <Link href={`/blog/${p.slug}`} className="group block">
                  <p className="font-mono text-xs text-ink-2 mb-2">
                    {formatDate(p.date)}
                  </p>
                  <h2 className="font-display text-xl md:text-2xl text-ink group-hover:text-gold transition-colors">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                    {p.description}
                  </p>
                  {p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[11px] px-2 py-1 border border-rule rounded text-ink-2"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className="text-ink-2 text-sm">
              No posts match. Try different terms.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
