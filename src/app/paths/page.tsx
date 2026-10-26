import Link from "next/link";
import type { Metadata } from "next";
import { Exhibit, Kicker, RuledRow } from "@/components/Archetypes";
import { seo } from "@/lib/seo";
import { PATHS } from "@/lib/taxonomy";

export const metadata: Metadata = seo({
  title: "Learning paths",
  description:
    "Ordered routes through the work: local inference to governed agents, knowledge compilation end to end, and verified creative workflows.",
  path: "/paths",
  openGraph: { images: ["/images/og-home.jpg"] },
});

export default function PathsPage() {
  return (
    <>
      <Exhibit>
        <Kicker>Paths</Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">
          Three routes through the work, in the order the ideas depend on each
          other.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
          A list of articles is not a curriculum. Each path below states why its
          steps belong together and what you should understand before moving on.
          They reference existing material; nothing here is new documentation
          pretending to be a course.
        </p>
      </Exhibit>

      <section className="border-t border-rule bg-void-2">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          {PATHS.map((path) => (
            <RuledRow
              key={path.slug}
              lead={`${path.steps.length} steps`}
              trailing="→"
            >
              <Link href={`/paths/${path.slug}`} className="group block">
                <span className="display-md block transition-colors group-hover:text-gold">
                  {path.name}
                </span>
                <span className="mt-2 block max-w-2xl leading-relaxed text-ink-2">
                  {path.promise}
                </span>
                <span className="label mt-3 block">For: {path.audience}</span>
              </Link>
            </RuledRow>
          ))}
        </div>
      </section>
    </>
  );
}
