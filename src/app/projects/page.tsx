import Link from "next/link";
import type { Metadata } from "next";
import { Exhibit, Kicker, RuledRow } from "@/components/Archetypes";
import { seo } from "@/lib/seo";
import { PROJECTS, MATURITY_LABEL, type Maturity } from "@/lib/taxonomy";

export const metadata: Metadata = seo({
  title: "Projects",
  description:
    "The systems: governed agent runtimes, knowledge compilers, local inference tooling and creative automation. Each entry states what it does, how it works, and what state it is actually in.",
  path: "/projects",
  openGraph: { images: ["/images/og-home.jpg"] },
});

const ORDER: Maturity[] = ["implementation", "prototype", "research"];

export default function ProjectsPage() {
  return (
    <>
      <Exhibit>
        <Kicker>Systems</Kicker>
        <h1 className="display-lg mt-6 max-w-3xl">
          Twelve systems, and the problem each one was built to answer.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
          These are not portfolio pieces. Each one exists because a specific
          failure was intolerable: an agent that could act without permission, a
          retrieval system that could not tell a claim from a passage, a creative
          tool that reported success while doing nothing.
        </p>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-3">
          Maturity labels describe the code, not the ambition. Repository signals
          are a dated snapshot read on 25 October 2026 — a last-commit date and a
          count of test files. They are not benchmarks and not adoption figures.
        </p>
      </Exhibit>

      <section className="border-t border-rule bg-void-2">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          {ORDER.map((maturity) => {
            const group = PROJECTS.filter((p) => p.maturity === maturity);
            if (group.length === 0) return null;
            return (
              <div key={maturity} className="mb-16 last:mb-0">
                <h2 className="label mb-2 text-gold">
                  {MATURITY_LABEL[maturity]} · {group.length}
                </h2>
                {group.map((project) => (
                  <RuledRow
                    key={project.slug}
                    lead={project.signals.lastCommit}
                    trailing={
                      <span className="data">
                        {project.signals.testFiles} test files
                      </span>
                    }
                  >
                    <Link href={`/projects/${project.slug}`} className="group block">
                      <span className="display-md block transition-colors group-hover:text-gold">
                        {project.name}
                      </span>
                      <span className="mt-2 block max-w-2xl leading-relaxed text-ink-2">
                        {project.role}
                      </span>
                      <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        {project.stack.slice(0, 4).map((s) => (
                          <span key={s} className="label">
                            {s}
                          </span>
                        ))}
                      </span>
                    </Link>
                  </RuledRow>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <Exhibit>
        <Kicker>Other ways in</Kicker>
        <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {[
            { href: "/concepts", label: "Concepts", note: "The ideas the projects share." },
            { href: "/paths", label: "Learning paths", note: "Ordered routes through the work." },
            { href: "/research", label: "Research", note: "195 articles, 2024 to now." },
            { href: "/book", label: "The book", note: "Computational Sovereignty." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-void p-8 transition-colors hover:bg-void-2"
            >
              <span className="display-md block transition-colors group-hover:text-gold">
                {item.label}
              </span>
              <span className="mt-2 block text-ink-2">{item.note}</span>
            </Link>
          ))}
        </div>
      </Exhibit>
    </>
  );
}
