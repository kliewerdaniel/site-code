import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { getAllPosts, getAllTags } from "@/lib/posts";
import ResearchSearch from "./ResearchSearch";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The full research archive — local-first AI systems, deterministic pipelines, and computational sovereignty.",
};

const PAGE_SIZE = 20;

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
    <Container className="py-16 md:py-24">
      <SectionHeading
        kicker="Research Archive"
        title="Research"
        lede="Every essay, tutorial, and experiment in the open — the working notes behind computational sovereignty."
      />

      <p className="font-mono text-xs text-paper-dim mb-8">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {tag ? (
          <>
            {" "}tagged <span className="text-moss">{tag}</span>{" "}
            <Link
              href="/research"
              className="underline underline-offset-2 hover:text-paper"
            >
              clear
            </Link>
          </>
        ) : null}
      </p>

      <ResearchSearch posts={searchable}>
        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {topTags.map(({ tag: t, count }) => {
            const active = tag === t;
            return (
              <Link
                key={t}
                href={active ? "/research" : pageHref(1, t)}
                className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-moss text-ink border-moss"
                    : "border-hairline text-paper-dim hover:text-paper hover:border-paper-dim"
                }`}
              >
                {t} <span className="opacity-60">{count}</span>
              </Link>
            );
          })}
        </div>

        {/* Paginated post list */}
        <ul className="divide-y divide-hairline">
          {pagePosts.map((p) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-center gap-2 font-mono text-sm"
            aria-label="Pagination"
          >
            {currentPage > 1 && (
              <Link
                href={pageHref(currentPage - 1, tag)}
                className="px-3 py-2 border border-hairline rounded text-paper-dim hover:text-paper hover:border-paper-dim"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) =>
                  n === 1 ||
                  n === totalPages ||
                  Math.abs(n - currentPage) <= 2
              )
              .map((n, idx, arr) => (
                <span key={n} className="flex items-center gap-2">
                  {idx > 0 && arr[idx - 1] !== n - 1 && (
                    <span className="text-paper-dim">…</span>
                  )}
                  <Link
                    href={pageHref(n, tag)}
                    aria-current={n === currentPage ? "page" : undefined}
                    className={`px-3 py-2 rounded border ${
                      n === currentPage
                        ? "bg-moss text-ink border-moss"
                        : "border-hairline text-paper-dim hover:text-paper hover:border-paper-dim"
                    }`}
                  >
                    {n}
                  </Link>
                </span>
              ))}
            {currentPage < totalPages && (
              <Link
                href={pageHref(currentPage + 1, tag)}
                className="px-3 py-2 border border-hairline rounded text-paper-dim hover:text-paper hover:border-paper-dim"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </ResearchSearch>
    </Container>
  );
}
