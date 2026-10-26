import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { CHAPTERS, PARTS } from "@/lib/chapters";
import { Figure, FigureRow, Kicker } from "@/components/Archetypes";
import { AmazonCta } from "@/components/AmazonCta";
import { BOOK } from "@/config";
import { bookSchema, seo } from "@/lib/seo";

export const metadata = seo({
  title: `The Book — ${BOOK.title}`,
  description: `Computational Sovereignty: Building Local-First AI Systems. 24 chapters, 8 parts, 214 pages of measured, reproducible local-first AI engineering. Hardcover, ${BOOK.price}.`,
  path: "/book",
  openGraph: {
    title: `${BOOK.title} — the full 24-chapter stack`,
    description: `Models, retrieval, knowledge graphs, governed agents — built on your machine, measured honestly. Hardcover, ${BOOK.price}.`,
    type: "website",
    images: [BOOK.coverFront],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BOOK.title} — the full 24-chapter stack`,
    description: `Models, retrieval, knowledge graphs, governed agents — built on your machine, measured honestly. Hardcover, ${BOOK.price}.`,
  },
});

/* Eight parts, stated as the claims they make. */
const parts = [
  {
    n: "I",
    name: "Why Sovereignty",
    claim: "The cloud is a priced liability, and the stack you need to replace it is five layers tall.",
  },
  {
    n: "II",
    name: "Inference You Control",
    claim: "Tokens, sampling, and model selection are engineering decisions with measurable consequences — treat them that way.",
  },
  {
    n: "III",
    name: "Memory That Isn&apos;t a Prompt",
    claim: "Retrieval is only as honest as its evaluation. Build the gold set first, then believe your numbers.",
  },
  {
    n: "IV",
    name: "Knowledge Graphs",
    claim: "Reason once, compile the result. A knowledge graph is a decision you made ahead of time.",
  },
  {
    n: "V",
    name: "Agents That Obey",
    claim: "An agent without a state machine is a rumor with tool access. Govern the transitions or inherit the incidents.",
  },
  {
    n: "VI",
    name: "Personas and Routing",
    claim: "Personalities can be quantified, and routing between specialists beats one generalist — measured, not asserted.",
  },
  {
    n: "VII",
    name: "Verification Discipline",
    claim: "Refusal is a feature, contradiction is data, and benchmarks are frozen or they are fiction.",
  },
  {
    n: "VIII",
    name: "Privacy, Security, Shipping",
    claim: "Air-gapped systems have a security model, shipping has a checklist, and the practice compounds.",
  },
];

const faq = [
  {
    q: "Do I need a GPU?",
    a: "For the serious chapters, yes — 24GB of VRAM or a Mac with unified memory is the entry ticket, and chapter 1 says so up front. The early chapters run fine on a CPU so you can start before the hardware arrives.",
  },
  {
    q: "Is this just anti-cloud ideology?",
    a: "No. Chapter 1 lists exactly when the cloud is the right call — frontier capability, tiny bursty workloads, no operational capacity — and prices the rest as a liability. The position is default-local, not never-cloud.",
  },
  {
    q: "What skill level does it assume?",
    a: "Comfort in a terminal, working Python, and no fear of a config file. It does not assume ML training experience — it does assume you have shipped software and been paged for it.",
  },
  {
    q: "How is this different from the blog?",
    a: "The 184 research posts are the laboratory: experiments, measurements, dead ends. The book is the compiled artifact — the reasoning done once, organized so you don&apos;t have to rediscover it across three years of archives.",
  },
  {
    q: "Ebook or paperback?",
    a: "Hardcover. 214 pages, 6×9, built to live on a desk next to the machine it describes. There is no DRM to strip because there is no DRM.",
  },
  {
    q: "When does it ship?",
    a: "The manuscript is complete and reviewed — 24 chapters, ~46,000 words. The Amazon listing opens at launch; the button below goes live the moment it does.",
  },
];

const specs: [string, string][] = [
  ["Title", `${BOOK.title}: ${BOOK.subtitle}`],
  ["Format", BOOK.format],
  ["Pages", BOOK.pages],
  ["Chapters", `${BOOK.chapters} chapters · 8 parts`],
  ["Words", BOOK.words],
  ["Price", BOOK.price],
  ["Author", "Daniel Kliewer"],
];

export default function BookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: bookSchema() }}
      />
      {/* HEAD */}
      <section className="border-b border-rule">
        <Container className="py-16 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_1.2fr]">
            <div>
              {/* Vitrine: the cover is a physical object, so it gets a display
                  case rather than sitting loose on the page. The glass here has
                  the warm radial behind it — without that, transparency over a
                  flat void shows nothing and the panel just reads as a card. */}
              <div className="glass relative overflow-hidden rounded-lg border p-8 md:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,195,112,0.10),transparent_70%)]"
                />
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={BOOK.coverFront}
                    alt="Computational Sovereignty — hardcover front cover"
                    className="mx-auto w-full max-w-[300px] rounded-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                  />
                  <div className="mt-6 flex items-center justify-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BOOK.coverSpine}
                      alt="Book spine"
                      className="h-24 w-auto rounded-[2px] shadow-lg"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BOOK.coverBack}
                      alt="Book back cover"
                      className="h-24 w-auto rounded-[2px] shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-6 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
                The book · Hardcover · {BOOK.price}
              </p>
              <h1 className="display-lg mb-5">
                {BOOK.title}
              </h1>
              <p className="mb-6 font-display text-xl text-ink-2 italic md:text-2xl">
                {BOOK.subtitle}
              </p>
              <p className="mb-4 max-w-xl text-base leading-relaxed text-ink-2">
                Most AI engineering in 2024–2026 was integration work: call
                someone else&apos;s model, parse the output, hope the weights don&apos;t
                change overnight. This book is about the other discipline —
                building the whole stack on machines you own, where every
                behavior is reproducible and every number is yours.
              </p>
              <p className="mb-8 max-w-xl text-base leading-relaxed text-ink-2">
                It starts by pricing the cloud as a liability and ends with a
                practice for shipping sovereign software. In between: 24
                chapters of models, retrieval, graphs, agents, personas, and
                verification — each one measured, each one runnable.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <AmazonCta />
                <Link
                  href="/sample"
                  className="inline-flex items-center justify-center rounded-sm border border-rule bg-transparent px-7 py-4 font-mono text-[12px] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
                >
                  Read chapter 1 free
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* THE ARGUMENT — eight parts */}
      <section className="border-b border-rule">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="The argument"
            title="Eight parts, one thesis"
            lede="Each part makes a single claim and then spends three chapters proving it with working systems."
          />
          <div className="mt-4 grid gap-px border border-rule bg-rule md:grid-cols-2">
            {parts.map((p, i) => (
              <Reveal key={p.n} delay={Math.min(i * 0.04, 0.2)}>
                <div className="h-full bg-void p-7">
                  <p className="mb-3 font-mono text-[11px] tracking-[0.24em] text-gold">
                    PART {p.n} — {p.name.toUpperCase()}
                  </p>
                  <p className="font-display text-lg leading-relaxed text-ink">
                    {p.claim}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CHAPTERS — INSTRUMENT. Replaces v2's 24-card scroll animation
          with a ruled readout: the whole table of contents, readable at
          a glance, identical in both motion modes. */}
      <section className="instrument">
        <Container>
          <Kicker>Table of contents</Kicker>
          <h2 className="display-lg mt-5">
            Twenty-four chapters, eight parts.
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
            Each part builds on the one before it. Every chapter ends with
            something running on your own machine.
          </p>

          <FigureRow>
            <Figure value={String(BOOK.chapters)} label="Chapters" />
            <Figure value={BOOK.pages} label="Pages" />
            <Figure value={BOOK.words} label="Words" />
            <Figure value={String(PARTS.length)} label="Parts" />
          </FigureRow>

          <div className="mt-20">
            {PARTS.map((part) => (
              <div key={part} className="mb-2">
                <p className="label mt-10 mb-1 text-ink-3">{part}</p>
                <div className="border-t border-rule">
                  {CHAPTERS.filter((c) => c.part === part).map((c) => (
                    <div
                      key={c.n}
                      className="ruled-row grid grid-cols-[3rem_1fr] items-baseline gap-x-6 py-4"
                    >
                      <span className="label data text-gold">
                        {String(c.n).padStart(2, "0")}
                      </span>
                      <span className="display-md">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SPECS */}
      <section className="border-b border-rule">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Specifications" title="The physical facts" />
          <dl className="divide-y divide-rule border-y border-rule">
            {specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase">
                  {k}
                </dt>
                <dd className="text-right text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-b border-rule bg-void-2">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Questions" title="Asked and answered" />
          <div className="mt-4 space-y-8">
            {faq.map((f) => (
              <Reveal key={f.q}>
                <div>
                  <h3 className="mb-2 font-display text-xl font-medium text-ink">
                    {f.q}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-2">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CLOSE */}
      <section>
        <Container className="py-16 text-center md:py-24">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
              {BOOK.chapters} chapters · {BOOK.words} words · {BOOK.price}
            </p>
            <h2 className="display-lg mx-auto mb-4 max-w-2xl">
              Own every layer.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-ink-2">
              The cloud will still be there when you need it. After this book,
              you&apos;ll know exactly what each API call costs you — and you&apos;ll
              have the machine to replace it.
            </p>
            <AmazonCta />
            <p className="mt-6">
              <Link
                href="/sample"
                className="font-mono text-[12px] tracking-[0.16em] text-ink-2 uppercase transition-colors hover:text-gold"
              >
                Or read chapter 1 free first →
              </Link>
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
