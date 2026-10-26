import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Exhibit, Kicker, RuledRow } from "@/components/Archetypes";
import { formatDate } from "@/lib/formatDate";
import { breadcrumbSchema, seo } from "@/lib/seo";
import {
  CONCEPTS,
  getConcept,
  articlesForConcept,
  projectsForConcept,
} from "@/lib/taxonomy";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return seo({ title: "Concept", description: "", path: `/concepts/${slug}` });
  return seo({
    title: concept.name,
    description: concept.oneLiner,
    path: `/concepts/${concept.slug}`,
  });
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const articles = articlesForConcept(concept);
  const projects = projectsForConcept(concept);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Concepts", path: "/concepts" },
            { name: concept.name, path: `/concepts/${concept.slug}` },
          ]),
        }}
      />
      <Exhibit>
        {/* Breadcrumb — matches the BreadcrumbList schema above. */}
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-ink-2 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/concepts" className="hover:text-gold transition-colors">
            Concepts
          </Link>
          <span className="mx-2">/</span>
          <span>{concept.name}</span>
        </nav>
        <Kicker>Concept</Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">{concept.name}</h1>
        <p className="display-md mt-6 max-w-2xl text-ink-2 italic">
          {concept.oneLiner}
        </p>
        <div className="mt-10 max-w-2xl space-y-6">
          {concept.body.map((para, i) => (
            <p key={i} className="text-lg leading-relaxed text-ink-2">
              {para}
            </p>
          ))}
        </div>
      </Exhibit>

      {projects.length > 0 && (
        <section className="border-y border-rule bg-void-2">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <Kicker>Implementation</Kicker>
            <h2 className="display-md mt-5">Where this runs</h2>
            <p className="mt-4 max-w-2xl text-ink-3">
              A concept that never left a document is a hypothesis. These are the
              systems that implement it.
            </p>
            <div className="mt-8">
              {projects.map((project) => (
                <RuledRow
                  key={project.slug}
                  lead={project.signals.lastCommit}
                  trailing="→"
                >
                  <Link href={`/projects/${project.slug}`} className="group block">
                    <span className="display-md block transition-colors group-hover:text-gold">
                      {project.name}
                    </span>
                    <span className="mt-1 block max-w-2xl text-ink-2">
                      {project.role}
                    </span>
                  </Link>
                </RuledRow>
              ))}
            </div>
          </div>
        </section>
      )}

      <Exhibit wide>
        <Kicker>Writing</Kicker>
        <h2 className="display-md mt-5">
          {articles.length} {articles.length === 1 ? "article" : "articles"} on this
        </h2>
        {articles.length === 0 ? (
          <p className="mt-6 max-w-2xl text-ink-3">
            Nothing in the archive carries this concept&rsquo;s tags yet. The
            implementation links above are the current record.
          </p>
        ) : (
          <div className="mt-8">
            {articles.slice(0, 40).map((post) => (
              <RuledRow
                key={post.slug}
                lead={formatDate(post.date)}
                trailing={`${post.readingMinutes} min`}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <span className="display-md block transition-colors group-hover:text-gold">
                    {post.title}
                  </span>
                  <span className="mt-1 block max-w-2xl text-ink-2">
                    {post.description}
                  </span>
                </Link>
              </RuledRow>
            ))}
          </div>
        )}
        {articles.length > 40 && (
          <p className="mt-6 text-ink-3">
            Showing the 40 most recent.{" "}
            <Link href={`/research?tag=${concept.tags[0]}`} className="text-gold hover:underline">
              See the full tag archive →
            </Link>
          </p>
        )}
      </Exhibit>

      <Exhibit>
        <Link href="/concepts" className="label text-gold hover:underline">
          ← All concepts
        </Link>
      </Exhibit>
    </>
  );
}
