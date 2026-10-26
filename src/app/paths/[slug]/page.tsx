import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Exhibit, Kicker } from "@/components/Archetypes";
import { breadcrumbSchema, seo } from "@/lib/seo";
import { PATHS, getPath, resolveStep } from "@/lib/taxonomy";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) return seo({ title: "Path", description: "", path: `/paths/${slug}` });
  return seo({ title: path.name, description: path.promise, path: `/paths/${path.slug}` });
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  const steps = path.steps
    .map((step) => ({ step, resolved: resolveStep(step) }))
    .filter((s) => s.resolved);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Paths", path: "/paths" },
            { name: path.name, path: `/paths/${path.slug}` },
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
          <Link href="/paths" className="hover:text-gold transition-colors">
            Paths
          </Link>
          <span className="mx-2">/</span>
          <span>{path.name}</span>
        </nav>
        <Kicker>Learning path · {steps.length} steps</Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">{path.name}</h1>
        <p className="display-md mt-6 max-w-2xl text-ink-2 italic">{path.promise}</p>
        <p className="label mt-8">For: {path.audience}</p>
      </Exhibit>

      <section className="border-t border-rule bg-void-2">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <ol>
            {steps.map(({ step, resolved }, i) => (
              <li
                key={`${step.kind}-${step.ref}`}
                className="ruled-row grid grid-cols-[3rem_1fr] gap-x-6 py-9 md:grid-cols-[3rem_1fr] md:gap-x-10"
              >
                <span className="data font-mono text-2xl leading-none text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="label">{resolved!.kicker}</span>
                  <Link
                    href={resolved!.href}
                    className="display-md mt-2 block transition-colors hover:text-gold"
                  >
                    {resolved!.title}
                  </Link>
                  <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">
                    {step.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Exhibit>
        <div className="flex flex-wrap gap-6">
          <Link href="/paths" className="label text-gold hover:underline">
            ← All paths
          </Link>
          <Link href="/concepts" className="label text-ink-3 hover:text-gold">
            Concepts
          </Link>
          <Link href="/projects" className="label text-ink-3 hover:text-gold">
            Projects
          </Link>
        </div>
      </Exhibit>
    </>
  );
}
