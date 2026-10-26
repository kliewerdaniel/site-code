import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Exhibit, Kicker, Figure, FigureRow, RuledRow } from "@/components/Archetypes";
import { formatDate } from "@/lib/formatDate";
import { seo } from "@/lib/seo";
import {
  PROJECTS,
  MATURITY_LABEL,
  getProject,
  conceptsForProject,
  postsBySlug,
} from "@/lib/taxonomy";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return seo({ title: "Project", description: "", path: `/projects/${slug}` });
  return seo({
    title: project.name,
    description: project.role,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const concepts = conceptsForProject(project);
  const articles = postsBySlug(project.articles);

  return (
    <>
      <Exhibit>
        <Kicker>
          {MATURITY_LABEL[project.maturity]} · {project.signals.lastCommit}
        </Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">{project.name}</h1>
        <p className="display-md mt-6 max-w-2xl text-ink-2 italic">{project.role}</p>

        <div className="mt-12 max-w-2xl">
          <h2 className="label text-gold">The problem</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">{project.problem}</p>
        </div>

        <div className="mt-12 max-w-2xl">
          <h2 className="label text-gold">How it works</h2>
          <ol className="mt-4 space-y-4">
            {project.approach.map((step, i) => (
              <li key={i} className="grid grid-cols-[2rem_1fr] gap-x-4">
                <span className="label data pt-1 text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-relaxed text-ink-2">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Exhibit>

      <section className="border-y border-rule bg-void-2">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="label text-gold">Stack</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="label border border-rule-2 px-3 py-2 text-ink-2"
              >
                {s}
              </span>
            ))}
          </div>

          <FigureRow>
            <Figure value={project.signals.lastCommit} label="Last commit" />
            <Figure
              value={String(project.signals.testFiles)}
              label="Test files in repository"
            />
            <Figure value={MATURITY_LABEL[project.maturity]} label="Maturity" />
            <Figure
              value={String(concepts.length)}
              label="Linked concepts"
            />
          </FigureRow>
          <p className="mt-4 text-sm text-ink-3">
            Repository signals read on 25 October 2026. They describe the
            repository, not the project&rsquo;s importance.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {project.repo && (
              <a
                href={project.repo}
                className="label border border-gold px-4 py-3 text-gold transition-colors hover:bg-gold hover:text-void"
                rel="noopener noreferrer"
                target="_blank"
              >
                Source repository ↗
              </a>
            )}
            {project.site && (
              <a
                href={project.site}
                className="label border border-rule-2 px-4 py-3 text-ink-2 transition-colors hover:border-gold hover:text-gold"
                rel="noopener noreferrer"
                target="_blank"
              >
                Project site ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {concepts.length > 0 && (
        <Exhibit>
          <Kicker>Ideas</Kicker>
          <h2 className="display-md mt-5">Concepts this project implements</h2>
          <div className="mt-8">
            {concepts.map((c) => (
              <RuledRow key={c.slug} lead="Concept" trailing="→">
                <Link href={`/concepts/${c.slug}`} className="group block">
                  <span className="display-md block transition-colors group-hover:text-gold">
                    {c.name}
                  </span>
                  <span className="mt-1 block text-ink-2">{c.oneLiner}</span>
                </Link>
              </RuledRow>
            ))}
          </div>
        </Exhibit>
      )}

      {articles.length > 0 && (
        <section className="border-t border-rule bg-void-2">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <Kicker>Writing</Kicker>
            <h2 className="display-md mt-5">Where this was worked out in public</h2>
            <div className="mt-8">
              {articles.map((post) => (
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
          </div>
        </section>
      )}

      <Exhibit>
        <Link href="/projects" className="label text-gold hover:underline">
          ← All projects
        </Link>
      </Exhibit>
    </>
  );
}
