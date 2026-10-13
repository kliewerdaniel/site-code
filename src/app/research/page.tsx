import Link from "next/link";
import type { Metadata } from "next";
import { Exhibit, Kicker } from "@/components/Archetypes";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import ResearchSearch from "./ResearchSearch";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The full research archive — local-first AI systems, deterministic pipelines, and computational sovereignty.",
};

const PAGE_SIZE = 20;

function pageHref(page: number, tag?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/research?${qs}` : "/research";
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const allPosts = getAllPosts();
  const allTags = getAllTags();
  const topTags = allTags.slice(0, 30);

  const filtered = tag
    ? allPosts.filter((p) => p.tags.includes(tag))
    : allPosts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const searchable = allPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
    tags: p.tags,
  }));

  return (
    <Exhibit wide>
      <Kicker>Research archive</Kicker>
      <h1 className="display-lg mt-5">Research</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
        Every essay, tutorial, and experiment in the open — the working notes
        behind computational sovereignty.
      </p>

      <p className="label data mt-10">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {tag ? (
          <>
            {" "}
            tagged <span className="text-gold">{tag}</span>{" "}
            <Link
              href="/research"
              className="underline underline-offset-2 hover:text-gold"
            >
              clear
            </Link>
          </>
        ) : null}
      </p>

      <ResearchSearch posts={searchable}>
        {/* Tag filter chips — a chip is right here because these are a
            filter control, not content. */}
        <div className="mb-14 flex flex-wrap gap-2">
          {topTags.map(({ tag: t, count }) => {
            const active = tag === t;
            return (
              <Link
                key={t}
                href={active ? "/research" : pageHref(1, t)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] transition-colors ${
                  active
                    ? "border-gold bg-gold text-void"
                    : "border-rule text-ink-2 hover:border-rule-2 hover:text-ink"
                }`}
              >
                {t} <span className="opacity-60">{count}</span>
              </Link>
            );
          })}
        </div>

        {/* Ruled entries. v2 boxed every post; the rules carry the
            structure instead, which is what gives the page its pace. */}
        <ul className="border-t border-rule">
          {pagePosts.map((p) => (
            <li key={p.slug} className="ruled-row">
              <Link
                href={`/blog/${p.slug}`}
                className="group grid grid-cols-1 items-baseline gap-x-9 gap-y-2 py-7 md:grid-cols-[9rem_1fr]"
              >
                <span className="label data">{formatDate(p.date)}</span>
                <span>
                  <span className="display-md block transition-colors group-hover:text-gold">
                    {p.title}
                  </span>
                  <span className="mt-3 block max-w-3xl leading-relaxed text-ink-2">
                    {p.description}
                  </span>
                  {p.tags.length > 0 && (
                    <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {p.tags.slice(0, 6).map((t) => (
                        <span key={t} className="label">
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-16 flex items-center justify-center gap-2 font-mono text-sm"
            aria-label="Pagination"
          >
            {currentPage > 1 && (
              <Link
                href={pageHref(currentPage - 1, tag)}
                className="rounded border border-rule px-3 py-2 text-ink-2 transition-colors hover:border-rule-2 hover:text-ink"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) =>
                  n === 1 || n === totalPages || Math.abs(n - currentPage) <= 2
              )
              .map((n, idx, arr) => (
                <span key={n} className="flex items-center gap-2">
                  {idx > 0 && arr[idx - 1] !== n - 1 && (
                    <span className="text-ink-3">…</span>
                  )}
                  <Link
                    href={pageHref(n, tag)}
                    aria-current={n === currentPage ? "page" : undefined}
                    className={`rounded border px-3 py-2 transition-colors ${
                      n === currentPage
                        ? "border-gold bg-gold text-void"
                        : "border-rule text-ink-2 hover:border-rule-2 hover:text-ink"
                    }`}
                  >
                    {n}
                  </Link>
                </span>
              ))}
            {currentPage < totalPages && (
              <Link
                href={pageHref(currentPage + 1, tag)}
                className="rounded border border-rule px-3 py-2 text-ink-2 transition-colors hover:border-rule-2 hover:text-ink"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </ResearchSearch>
    </Exhibit>
  );
}
