import Link from "next/link";
import type { Metadata } from "next";
import { Exhibit, Kicker, RuledRow } from "@/components/Archetypes";
import { seo } from "@/lib/seo";
import { CONCEPTS, articlesForConcept } from "@/lib/taxonomy";

export const metadata: Metadata = seo({
  title: "Concepts",
  description:
    "The recurring ideas across the work: local-first inference, governed execution, knowledge compilation, provenance, graph retrieval, evaluation, creative automation and reproducibility.",
  path: "/concepts",
  openGraph: { images: ["/images/og-home.jpg"] },
});

export default function ConceptsPage() {
  const counts = CONCEPTS.map((c) => ({ concept: c, n: articlesForConcept(c).length }));

  return (
    <>
      <Exhibit>
        <Kicker>Concepts</Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">
          Eight ideas that recur across every project here.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
          The projects look different — a video pipeline, an agent runtime, a
          knowledge compiler — but they keep solving the same problems. These are
          those problems, stated once, with the articles and code that address
          them attached.
        </p>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-3">
          Article counts are derived from the archive&rsquo;s own tags rather than
          maintained by hand, so a concept cannot claim writing that does not
          exist.
        </p>
      </Exhibit>

      <section className="border-t border-rule bg-void-2">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          {counts.map(({ concept, n }) => (
            <RuledRow
              key={concept.slug}
              lead={`${n} ${n === 1 ? "article" : "articles"}`}
              trailing={`${concept.projects.length} projects`}
            >
              <Link href={`/concepts/${concept.slug}`} className="group block">
                <span className="display-md block transition-colors group-hover:text-gold">
                  {concept.name}
                </span>
                <span className="mt-2 block max-w-2xl leading-relaxed text-ink-2">
                  {concept.oneLiner}
                </span>
              </Link>
            </RuledRow>
          ))}
        </div>
      </section>
    </>
  );
}
