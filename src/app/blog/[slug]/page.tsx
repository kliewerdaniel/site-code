import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Prose from "@/components/Prose";
import Container from "@/components/Container";
import { SITE } from "@/config";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getArchiveNeighbors,
  tagSlug,
} from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import {
  DEFAULT_OG_IMAGE,
  articleSchema,
  breadcrumbSchema,
  canonical,
  seo,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };

  // `seoTitle` / `seoDescription` frontmatter override the display title and
  // the derived excerpt for search and social without changing the headline
  // the reader sees on the page.
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.description;
  const image = post.image ? `${SITE.url}${post.image}` : undefined;
  // The social card falls back to the shared 1200×630 default when the post has
  // no image of its own, so a post is never published without a preview image.
  const cardImage = image ?? canonical(DEFAULT_OG_IMAGE);

  return seo({
    title,
    description,
    path: `/blog/${post.slug}`,
    type: "article",
    // A headline plus "%s — Daniel Kliewer" routinely exceeds a search-result
    // slot; the headline alone is the correct title for these pages.
    absoluteTitle: true,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      ...(post.image ? { images: [{ url: cardImage, alt: post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardImage],
    },
  });
}

const markdownComponents: Components = {
  // Demote every markdown heading one level: the post's <h1> is the title,
  // rendered in JSX above. Post bodies use "#" for top-level sections, which
  // would otherwise emit a second <h1> per section (mindbroadcast: 32).
  // Markdown # -> h2, ## -> h3, ### -> h4, etc.
  h1: ({ node, ...props }) => <h2 {...props} className="font-display text-2xl font-semibold text-ink tracking-tight pt-4" />,
  h2: ({ node, ...props }) => <h3 {...props} className="font-display text-xl font-semibold text-ink tracking-tight pt-2" />,
  h3: ({ node, ...props }) => <h4 {...props} className="font-display text-lg font-semibold text-ink tracking-tight pt-2" />,
  h4: ({ node, ...props }) => <h5 {...props} className="font-display text-base font-semibold text-ink tracking-tight pt-2" />,
  h5: ({ node, ...props }) => <h6 {...props} className="font-display text-sm font-semibold text-ink tracking-tight pt-2" />,
  h6: ({ node, ...props }) => <h6 {...props} className="font-display text-sm font-semibold text-ink tracking-tight pt-2" />,
  pre: ({ node, ...props }) => (
    <pre
      {...props}
      className="bg-void-2 font-mono text-sm overflow-x-auto rounded-lg p-4 my-6 border border-rule"
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = className?.includes("language-") ?? false;
    if (isBlock) {
      return (
        <code {...props} className={`font-mono ${className ?? ""}`}>
          {children}
        </code>
      );
    }
    return (
      <code
        {...props}
        className="font-mono text-[0.85em] bg-void-2 px-1.5 py-0.5 rounded border border-rule"
      >
        {children}
      </code>
    );
  },
  img: ({ node, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ""} className="rounded-lg max-w-full h-auto my-6" />
  ),
};



export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 6);
  const neighbors = getArchiveNeighbors(slug, 8)
    .filter((p) => !related.some((r) => r.slug === p.slug))
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: articleSchema({
            title: post.title,
            description: post.description,
            slug: post.slug,
            date: post.date,
            updated: post.updated,
            image: post.image,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        }}
      />
      <Container className="py-16 md:py-24">
        <article className="max-w-3xl mx-auto">
          {/* Breadcrumb — matches the BreadcrumbList schema emitted above. */}
          <nav
          aria-label="Breadcrumb"
          className="font-mono text-xs text-ink-2 mb-8"
        >
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/research" className="hover:text-gold transition-colors">
            Research
          </Link>
          <span className="mx-2">/</span>
          <span>{post.title}</span>
        </nav>

        {/* Header */}
        <h1 className="display-lg">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-ink-2">
          <address className="not-italic">
            By{" "}
            <Link
              rel="author"
              href="/about"
              className="text-ink transition-colors hover:text-gold"
            >
              Daniel Kliewer
            </Link>
          </address>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/research?tag=${tagSlug(t)}`}
                className="font-mono text-[11px] px-2 py-1 border border-rule rounded text-ink-2 hover:text-ink hover:border-rule-2 transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Hero image */}
        {post.image && (
          <div className="relative w-full aspect-video mt-10 rounded-lg overflow-hidden border border-rule">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Body */}
        <Prose>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </Prose>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-rule">
            <h2 className="font-display text-2xl text-ink mb-6">
              Related research
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group block border border-rule rounded-lg p-5 hover:border-gold transition-colors"
                >
                  <p className="font-mono text-[11px] text-ink-2 mb-2">
                    {formatDate(r.date)}
                  </p>
                  <h3 className="font-display text-lg text-ink group-hover:text-gold transition-colors leading-snug">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-2 line-clamp-3">
                    {r.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* More from the archive — second-order cross-links. Tag overlap first,
            then temporal neighbors, so every post links deeper into the graph
            instead of ending as a dead-end leaf. This is what distributes
            authority across the 184-post tail rather than concentrating it on
            the /research hub. */}
        {neighbors.length > 0 && (
          <section className="mt-14 pt-10 border-t border-rule">
            <h2 className="font-display text-2xl text-ink mb-6">
              More from the archive
            </h2>
            <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {neighbors.map((r) => (
                <li key={r.slug} className="ruled-row">
                  <Link
                    href={`/blog/${r.slug}`}
                    className="group block"
                    title={r.title}
                  >
                    <span className="label data block text-ink-3">
                      {formatDate(r.date)}
                    </span>
                    <span className="mt-1 block font-display text-base text-ink transition-colors group-hover:text-gold leading-snug">
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        </article>
      </Container>
    </>
  );
}
