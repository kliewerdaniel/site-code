"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface SearchablePost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
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
      <div className="relative mb-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 184 research posts…"
          aria-label="Search research posts"
          className="w-full bg-ink-soft border border-hairline rounded-lg px-4 py-3 font-mono text-sm text-paper placeholder:text-paper-dim/50 focus:outline-none focus:border-moss"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-paper-dim hover:text-paper"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {results === null ? (
        children
      ) : (
        <div>
          <p className="font-mono text-xs text-paper-dim mb-6">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &ldquo;{query.trim()}&rdquo;
          </p>
          <ul className="divide-y divide-hairline">
            {results.map((p) => (
              <li key={p.slug} className="py-6 first:pt-0">
                <Link href={`/blog/${p.slug}`} className="group block">
                  <p className="font-mono text-xs text-paper-dim mb-2">
                    {formatDate(p.date)}
                  </p>
                  <h2 className="font-display text-xl md:text-2xl text-paper group-hover:text-moss transition-colors">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-paper-dim leading-relaxed">
                    {p.description}
                  </p>
                  {p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[11px] px-2 py-1 border border-hairline rounded text-paper-dim"
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
            <p className="text-paper-dim text-sm">
              No posts match. Try different terms.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
