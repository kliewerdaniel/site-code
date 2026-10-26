import Link from "next/link";
import type { Metadata } from "next";
import { Exhibit, Kicker } from "@/components/Archetypes";
import { HeroBand } from "@/components/HeroBand";
import { getAllPosts, getAllTags, tagSlug } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import { collectionPageSchema, seo } from "@/lib/seo";
import ResearchSearch from "./ResearchSearch";

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

/** Canonical path for a research view. Mirrors `pageHref` below so the
 *  canonical a page declares is exactly the URL the pagination links emit. */
function canonicalPath(page: number, tag?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/research?${qs}` : "/research";
}

/** Below this a tag view is a near-empty page: it exists to be reachable and
 *  to link its one or two posts, not to occupy index space. */
const MIN_TAG_POSTS_FOR_INDEXING = 3;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const allPosts = getAllPosts();
  const allTags = getAllTags();
  const activeTag = tag
    ? allTags.find((t) => t.slug === tagSlug(tag))
    : undefined;
  const count = activeTag
    ? allPosts.filter((p) =>
        p.tags.some((t) => tagSlug(t) === activeTag.slug)
      ).length
    : allPosts.length;

  const isPaged = page >= 2;
  const title = activeTag
    ? `${activeTag.tag} research — ${count} posts${isPaged ? ` — Page ${page}` : ""}`
    : isPaged
      ? `Research — Page ${page}`
      : "Research";
  const description = activeTag
    ? `Research posts tagged ${activeTag.tag}: ${count} essays on local-first AI, deterministic pipelines, and computational sovereignty.`
    : "The full research archive — local-first AI systems, deterministic pipelines, and computational sovereignty.";

  return seo({
    title,
    description: isPaged ? `${description} Page ${page} of the archive.` : description,
    // Self-referential even when paginated: `/research?page=3` used to
    // canonicalise to page 1, telling crawlers the pagination did not exist.
    path: canonicalPath(page, activeTag?.slug),
    ...(activeTag && count < MIN_TAG_POSTS_FOR_INDEXING
      ? { robots: { index: false, follow: true } }
      : {}),
  });
}

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

  // Resolve the incoming ?tag= to a canonical tag entry by slug, so "RAG",
  // "rag" and "RAG " all land on the same page with the same display spelling.
  const activeTag = tag
    ? allTags.find((t) => t.slug === tagSlug(tag))
    : undefined;

  const filtered = activeTag
    ? allPosts.filter((p) => p.tags.some((t) => tagSlug(t) === activeTag.slug))
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionPageSchema() }}
      />
    <HeroBand
      poster="/images/hero/hero-research.jpg"
      srcMp4="/images/hero/hero-research-loop.mp4"
      srcWebm="/images/hero/hero-research-loop.webm"
      alt="A dark stone reading desk with a stack of archival manuscript folios under a single warm brass lamp"
    >
      <Kicker>
        {activeTag ? `${activeTag.tag} · research archive` : "Research archive"}
      </Kicker>
      <h1 className="display-lg mt-5">
        {activeTag ? `${activeTag.tag} research` : "Research"}
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
        {activeTag
          ? `${filtered.length} ${filtered.length === 1 ? "post" : "posts"} tagged ${activeTag.tag} — essays and experiments on ${activeTag.tag.toLowerCase()}, drawn from the working notes behind computational sovereignty.`
          : "Every essay, tutorial, and experiment in the open — the working notes behind computational sovereignty."}
      </p>

      <p className="label data mt-10">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {activeTag ? (
          <>
            {" "}
            tagged <span className="text-gold">{activeTag.tag}</span>{" "}
            <Link
              href="/research"
              className="underline underline-offset-2 hover:text-gold"
            >
              clear
            </Link>
          </>
        ) : null}
      </p>
    </HeroBand>

    <Exhibit wide>
      <ResearchSearch posts={searchable} total={allPosts.length}>
        {/* Tag filter chips — a chip is right here because these are a
            filter control, not content. */}
        <div className="mb-14 flex flex-wrap gap-2">
          {topTags.map(({ tag: t, slug, count }) => {
            const active = activeTag?.slug === slug;
            return (
              <Link
                key={slug}
                href={active ? "/research" : pageHref(1, slug)}
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

        {/* Complete archive. Every post link is present in the DOM inside a
            <details>, so crawlers reach all {allPosts.length} posts in one hop
            from the research hub instead of burying the tail behind pagination
            at depth 4+. The disclosure keeps the UI clean without hiding
            content from crawlers — <details> renders in the HTML whether or
            not it is open. */}
        <details className="mt-16 border-t border-rule pt-10">
          <summary className="label cursor-pointer text-gold hover:underline underline-offset-4">
            Full archive — all {allPosts.length} posts
          </summary>
          <ul className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {allPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block"
                  title={`${p.title} — ${formatDate(p.date)}`}
                >
                  <span className="label data block text-ink-3">
                    {formatDate(p.date)}
                  </span>
                  <span className="mt-1 block font-display text-base text-ink transition-colors group-hover:text-gold leading-snug">
                    {p.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>

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
    </>
  );
}
