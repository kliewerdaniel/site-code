import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Prose from "@/components/Prose";
import Container from "@/components/Container";
import { SITE } from "@/config";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";

export const dynamicParams = false;

const SITE_URL = SITE.url;

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

  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.image ? `${SITE_URL}${post.image}` : undefined;

  return {
    title: post.title,
    description: post.description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: image ? [image] : undefined,
    },
  };
}

const markdownComponents: Components = {
  pre: ({ node, ...props }) => (
    <pre
      {...props}
      className="bg-navy-deep font-mono text-sm overflow-x-auto rounded-lg p-4 my-6 border border-hairline"
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
        className="font-mono text-[0.85em] bg-navy-deep px-1.5 py-0.5 rounded border border-hairline"
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

  const related = getRelatedPosts(slug, 3);

  return (
    <Container className="py-16 md:py-24">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-xs text-bone-dim mb-8"
        >
          <Link href="/research" className="hover:text-gold transition-colors">
            Research
          </Link>
          <span className="mx-2">/</span>
          <span>{formatDate(post.date)}</span>
        </nav>

        {/* Header */}
        <h1 className="font-display text-3xl md:text-5xl text-bone leading-tight">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-bone-dim">
          <span>Daniel Kliewer</span>
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
                href={`/research?tag=${encodeURIComponent(t)}`}
                className="font-mono text-[11px] px-2 py-1 border border-hairline rounded text-bone-dim hover:text-bone hover:border-paper-dim transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Hero image */}
        {post.image && (
          <div className="relative w-full aspect-video mt-10 rounded-lg overflow-hidden border border-hairline">
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
          <section className="mt-16 pt-10 border-t border-hairline">
            <h2 className="font-display text-2xl text-bone mb-6">
              Related research
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group block border border-hairline rounded-lg p-5 hover:border-gold transition-colors"
                >
                  <p className="font-mono text-[11px] text-bone-dim mb-2">
                    {formatDate(r.date)}
                  </p>
                  <h3 className="font-display text-lg text-bone group-hover:text-gold transition-colors leading-snug">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-bone-dim line-clamp-3">
                    {r.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Container>
  );
}
