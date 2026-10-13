import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OLD_BOOK } from "@/config";

export const metadata: Metadata = {
  title: "About Daniel Kliewer",
  description:
    "Computer scientist and AI researcher based in Austin, Texas, working to reduce the cost of understanding human knowledge — through local-first AI, knowledge compilation, and inspectable systems.",
  openGraph: {
    title: "About Daniel Kliewer",
    description:
      "Computer scientist and AI researcher in Austin, Texas. Reducing the cost of understanding human knowledge.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Daniel Kliewer",
    description:
      "Computer scientist and AI researcher in Austin, Texas. Reducing the cost of understanding human knowledge.",
  },
};

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

const purpose = [
  {
    title: "Who I am",
    body: [
      "I am a computer scientist and AI researcher based in Austin, Texas. For several years my work has centered on a single question that has steadily overtaken the purely technical ones: how do we make human knowledge cheaper to understand?",
      "I publish the research openly — the code on GitHub, the reasoning in the blog, the synthesis in the book. If you are investigating similar questions, the work is yours to build on.",
    ],
  },
  {
    title: "The problem I am trying to solve",
    body: [
      "Civilization is, in many ways, a system for transferring accumulated knowledge from one generation to the next. The efficiency of that transfer determines how quickly society can progress. Today, acquiring professional knowledge remains expensive — years of education, scarce instructors, fragmented material — which makes qualified expertise rare and leaves essential work understaffed.",
      "I want to reduce the cost of understanding human knowledge: making it easier to learn a profession, easier to do better research, easier to preserve what institutions already know.",
    ],
  },
  {
    title: "How my projects contribute",
    body: [
      "None of my projects are the destination. They are experiments toward the same end.",
      "Knowledge compilation organizes human knowledge into structured, navigable artifacts before the question is asked. Compile-time AI performs reasoning once and compiles it into representations people can explore. Decision graphs make judgment inspectable. Sovereign memory preserves understanding across sessions. Local-first systems keep that knowledge transparent and under the user's control.",
      "Each is a different approach to reducing the cognitive cost of understanding.",
    ],
  },
];

const researchPhilosophy = [
  {
    title: "Knowledge over text",
    desc: "The goal is not to generate more language but to organize what already exists — making relationships explicit, navigable, and inspectable.",
  },
  {
    title: "Compile-time, not query-time",
    desc: "Much of the hard reasoning should happen once, ahead of time, and be compiled into structures people can explore — not rediscovered on every query.",
  },
  {
    title: "Local-first and inspectable",
    desc: "Knowledge systems should run on the user's own hardware, be transparent, and remain theirs to own and verify.",
  },
  {
    title: "Understanding compounds",
    desc: "Every hour saved from searching is an hour returned to discovery, teaching, and care. The savings multiply across millions of people.",
  },
];

const timeline = [
  {
    year: "2026",
    title: "Mission in Focus",
    desc: "The research converges on one explicit aim: reducing the cost of understanding human knowledge — from first principles through production systems.",
  },
  {
    year: "2025",
    title: "Cognitive Memory Architecture",
    desc: "Sovereign Memory Bank showed that persistent agent memory requires a multi-layered architecture: raw documents to synthesized abstractions.",
  },
  {
    year: "2025",
    title: "Knowledge Compilation",
    desc: "The Sovereign Knowledge Compiler turned heterogeneous corpora into static, navigable semantic artifacts — understanding ahead of the query.",
  },
  {
    year: "2025",
    title: "Compositional Intelligence",
    desc: "Dynamic Persona MoE RAG demonstrated that routing between specialized local models produces more coherent reasoning than any single model.",
  },
  {
    year: "2024",
    title: "Open Investigation Begins",
    desc: "Started publishing research in public. The blog and GitHub became the laboratory for systematic exploration.",
  },
];

export default function AboutPage() {
  const oldBookLive = OLD_BOOK.amazonUrl && !OLD_BOOK.amazonUrl.startsWith("#");
  return (
    <>
      {/* HEAD */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="flex flex-col items-center gap-10 py-16 md:flex-row md:py-24">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-sm border border-[#2c2720]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/profile.jpeg" alt="Daniel Kliewer" className="h-full w-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h1
              className={`${SERIF} mb-3 text-4xl font-semibold tracking-[-0.02em] text-[#ece7da] md:text-5xl`}
            >
              Daniel Kliewer
            </h1>
            <p className={`${SERIF} mb-2 text-xl italic text-[#6fa58b]`}>
              Reducing the Cost of Understanding Human Knowledge
            </p>
            <p className={`${MONO} text-[11px] tracking-[0.2em] uppercase text-[#a79d87]`}>
              Austin, TX
            </p>
          </div>
        </Container>
      </section>

      {/* PURPOSE */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Purpose" title="Why I do this work" />
          <div className="mt-10 space-y-12">
            {purpose.map((s) => (
              <div key={s.title}>
                <h3 className={`${SERIF} mb-4 text-2xl font-medium text-[#ece7da]`}>{s.title}</h3>
                <div className="space-y-4 text-base leading-relaxed text-[#a79d87]">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-b border-[#2c2720] bg-[#1a1712]">
        <Container className="py-16 md:py-24">
          <SectionHeading kicker="Method" title="Research philosophy" />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] md:grid-cols-2">
            {researchPhilosophy.map((s) => (
              <div key={s.title} className="bg-[#1a1712] p-7">
                <h3 className={`${SERIF} mb-3 text-lg font-medium text-[#ece7da]`}>{s.title}</h3>
                <p className="text-sm leading-relaxed text-[#a79d87]">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* TIMELINE */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Record" title="Timeline" />
          <div className="mt-10 space-y-8">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-16 shrink-0 text-right">
                  <span className={`${MONO} text-sm text-[#6fa58b]`}>{t.year}</span>
                </div>
                <div className="w-px shrink-0 bg-[#2c2720]" />
                <div className="pb-2">
                  <h3 className={`${SERIF} text-lg font-medium text-[#ece7da]`}>{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#a79d87]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ALSO BY */}
      <section className="bg-[#1a1712]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Earlier work" title="Also by Daniel Kliewer" />
          <div className="mt-10 border border-[#2c2720] bg-[#14120d] p-8">
            <p className={`${MONO} mb-3 text-[11px] tracking-[0.2em] uppercase text-[#a79d87]`}>
              {OLD_BOOK.format}
            </p>
            <h3 className={`${SERIF} mb-2 text-2xl font-medium text-[#ece7da]`}>
              {OLD_BOOK.title}
            </h3>
            <p className={`${SERIF} mb-5 text-lg italic text-[#a79d87]`}>{OLD_BOOK.subtitle}</p>
            <div className="flex flex-wrap items-center gap-6">
              <p className={`${MONO} text-2xl text-[#ece7da]`}>{OLD_BOOK.price}</p>
              <a
                href={OLD_BOOK.amazonUrl}
                target={oldBookLive ? "_blank" : undefined}
                rel={oldBookLive ? "noopener noreferrer" : undefined}
                className={`${MONO} text-[12px] tracking-[0.16em] uppercase text-[#6fa58b] hover:text-[#d9a648]`}
              >
                Buy on Amazon ↗
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
