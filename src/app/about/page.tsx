import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { OLD_BOOK } from "@/config";
import { seo } from "@/lib/seo";

export const metadata = seo({
  title: "About Daniel Kliewer",
  description:
    "Daniel Kliewer builds local-first AI systems in Austin, Texas. Author of Computational Sovereignty: Building Local-First AI Systems (hardcover, $88).",
  path: "/about",
  openGraph: {
    title: "About Daniel Kliewer",
    description:
      "Builder of local-first AI systems. Author of Computational Sovereignty.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Daniel Kliewer",
    description:
      "Builder of local-first AI systems. Author of Computational Sovereignty.",
  },
});

/* Rewritten register: flat, declarative, measured. */

const positions = [
  {
    title: "The short version",
    body: [
      "I build AI systems that run on hardware I own. Models, retrieval, knowledge graphs, agents — the full stack, local-first, with the numbers to back up every claim.",
      "I publish the work openly: the code on GitHub, the reasoning in 184 research posts, the synthesis in the book. If you can use any of it, it's yours.",
    ],
  },
  {
    title: "What I actually believe",
    body: [
      "A system you can't reproduce isn't engineering — it's a demo with good lighting. Determinism, measurement, and ownership aren't aesthetic preferences; they're the difference between infrastructure and luck.",
      "The cloud is a tool with a price tag, not a default. Price it explicitly, the way you'd price any dependency that can change its behavior without telling you.",
    ],
  },
  {
    title: "How the projects fit",
    body: [
      "SpecGen: deterministic code generation. Ganymede: governed claim compilation with frozen benchmarks. PersonaGen: quantified AI personalities. The Sovereign Agent Fleet: agents under a frozen governance substrate.",
      "Different instruments, one thesis: probabilistic cognition is powerful and untrustworthy, so the authority around it must be deterministic, inspected, and owned.",
    ],
  },
];

const ledger = [
  {
    year: "2026",
    title: "Computational Sovereignty ships",
    desc: "24 chapters, ~46,000 words, 214-page hardcover. The laboratory years compiled into the artifact.",
  },
  {
    year: "2025",
    title: "Governed agents",
    desc: "The Sovereign Agent Fleet: one frozen governance substrate exercised across eight domains. 564 tests, zero security invariants depending on model behavior.",
  },
  {
    year: "2025",
    title: "Knowledge compilation",
    desc: "Static claim-graph artifacts with no inference at view time. Reasoning done once, compiled for everyone.",
  },
  {
    year: "2024",
    title: "The laboratory opens",
    desc: "Research published in public — blog, GitHub, measurements and dead ends included.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HEAD */}
      <section className="border-b border-rule">
        <Container className="flex flex-col items-center gap-10 py-16 md:flex-row md:py-24">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-sm border border-rule">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/profile.jpeg"
              alt="Daniel Kliewer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="display-lg mb-3">
              Daniel Kliewer
            </h1>
            <p className="mb-2 font-display text-xl text-gold italic">
              Local-first AI, measured and owned.
            </p>
            <p className="font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase">
              Austin, TX
            </p>
          </div>
        </Container>
      </section>

      {/* POSITIONS */}
      <section className="border-b border-rule">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Positions" title="Stated plainly" />
          <div className="mt-10 space-y-12">
            {positions.map((s) => (
              <Reveal key={s.title}>
                <div>
                  <h3 className="mb-4 font-display text-2xl font-medium text-ink">
                    {s.title}
                  </h3>
                  <div className="space-y-4 text-base leading-relaxed text-ink-2">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* LEDGER */}
      <section className="border-b border-rule bg-void-2">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Record" title="The ledger" />
          <div className="mt-10 space-y-8">
            {ledger.map((t) => (
              <Reveal key={`${t.year}-${t.title}`}>
                <div className="flex gap-5">
                  <div className="w-16 shrink-0 text-right">
                    <span className="font-mono text-sm text-gold">{t.year}</span>
                  </div>
                  <div className="w-px shrink-0 bg-rule" />
                  <div className="pb-2">
                    <h3 className="font-display text-lg font-medium text-ink">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">
                      {t.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ALSO BY */}
      <section>
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Earlier work" title="Also by Daniel Kliewer" />
          <Reveal>
            <div className="mt-10 border border-rule bg-slate p-8">
              <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase">
                {OLD_BOOK.format}
              </p>
              <h3 className="mb-2 font-display text-2xl font-medium text-ink">
                {OLD_BOOK.title}
              </h3>
              <p className="mb-5 font-display text-lg text-ink-2 italic">
                {OLD_BOOK.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <p className="font-mono text-2xl text-ink">{OLD_BOOK.price}</p>
                <a
                  href={OLD_BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] tracking-[0.16em] text-gold uppercase transition-colors hover:text-ink"
                >
                  Buy on Amazon ↗
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
