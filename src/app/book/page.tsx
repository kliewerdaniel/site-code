import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { BookCover } from "@/components/BookCover";
import { EmailCapture } from "@/components/EmailCapture";
import { BOOK } from "@/config";

export const metadata: Metadata = {
  title: "The Book — Computational Sovereignty",
  description:
    "Computational Sovereignty: Building Local-First AI Systems. 24 chapters, ~46,000 words: local models, RAG, GraphRAG, governed agents, air-gapped security. Hardcover 6×9, 214 pages.",
  openGraph: {
    title: "Computational Sovereignty — the book",
    description:
      "24 chapters, ~46,000 words: local models, RAG, GraphRAG, governed agents, air-gapped security. Hardcover 6×9, 214 pages.",
    type: "website",
    images: [BOOK.coverImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Computational Sovereignty — the book",
    description:
      "24 chapters, ~46,000 words: local models, RAG, GraphRAG, governed agents, air-gapped security. Hardcover 6×9, 214 pages.",
  },
};

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

const chapters = [
  "The Cloud Is a Liability",
  "The Sovereignty Stack",
  "Your First Local Model",
  "Tokens, Context, and Sampling",
  "Choosing Models Like an Engineer",
  "Serving Models Locally",
  "Embeddings and Vector Search",
  "Building Local RAG",
  "Evaluating Retrieval Honestly",
  "From Documents to Graphs",
  "GraphRAG in Practice",
  "Compile-Time Intelligence",
  "Tool Use Locally",
  "State Machines Over Vibes",
  "The Auditor Pattern",
  "Quantified Personas",
  "Dynamic Routing, MoE-Style",
  "Persona Systems in Production",
  "The Refusal Discipline",
  "Contradiction Detection at Scale",
  "Gold Sets and Frozen Benchmarks",
  "The Local-First Security Model",
  "Shipping Sovereign Software",
  "The Sovereign Practice",
];

const forReaders = [
  "Engineers who ship software and want AI on their own hardware",
  "People in regulated fields who can't send data to a cloud",
  "Researchers who need results they can reproduce",
  "Anyone who suspects the demo is lying and wants the measurements",
];

const notFor = [
  "You're looking for API wrappers around someone else's model",
  "You want hype, vibes, and a forty-chapter sermon on the singularity",
  "You need a framework comparison matrix instead of working systems",
];

const faqs = [
  {
    q: "What are the prerequisites?",
    a: "Basic Python and comfort in a terminal. You don't need a math degree or a GPU cluster — one machine with a decent GPU (or even CPU, for the smaller models) is enough to follow every chapter hands-on.",
  },
  {
    q: "Is code included?",
    a: "Yes. The book is built around runnable code — models you can download, pipelines you can run, measurements you can repeat. Every major claim comes with something you can execute and check.",
  },
  {
    q: "Why local-first?",
    a: "Because dependence is a liability: on a vendor's pricing, on their uptime, on their policy changes, on their ability to see your data. A system you run is a system you can inspect, audit, and keep.",
  },
  {
    q: "When is it available?",
    a: "The hardcover and ebook launch together. Join the email list for the launch notice — you'll also get the sample chapter free.",
  },
  {
    q: "Is the ebook priced yet?",
    a: "Ebook pricing will be announced at launch alongside the hardcover.",
  },
  {
    q: "How is this different from your earlier book, Sovereign AI?",
    a: "Sovereign AI is an architectural investigation — the reasoning, the first principles. Computational Sovereignty is the practitioner's book: the systems, the code, the measurements.",
  },
];

function BuyCta() {
  const live = BOOK.amazonUrl && !BOOK.amazonUrl.startsWith("#");
  return (
    <div className="flex flex-col items-center gap-2">
      <a
        href={BOOK.amazonUrl}
        aria-disabled={!live}
        className={`inline-flex items-center justify-center rounded-sm bg-[#3e6b52] px-9 py-4 ${MONO} text-[13px] tracking-[0.14em] uppercase text-[#0f110c] transition-colors hover:bg-[#4a7d62]`}
      >
        Buy on Amazon — {BOOK.price}
      </a>
      {!live && (
        <p className={`${MONO} text-[10px] tracking-[0.2em] uppercase text-[#d9a648]`}>
          Available at launch
        </p>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <>
      {/* PROMISE */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="grid gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
          <div>
            <p className={`${MONO} mb-6 text-[11px] tracking-[0.24em] uppercase text-[#d9a648]`}>
              The book
            </p>
            <h1
              className={`${SERIF} mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#ece7da] md:text-6xl`}
            >
              {BOOK.title}
            </h1>
            <p className={`${SERIF} mb-6 text-xl italic text-[#a79d87]`}>{BOOK.subtitle}</p>
            <p className="mb-6 max-w-xl text-base leading-relaxed text-[#a79d87]">
              {BOOK.promise}
            </p>
            <dl className={`mb-10 grid max-w-xl grid-cols-3 gap-4 border-y border-[#2c2720] py-5 ${MONO} text-[11px] tracking-[0.12em] uppercase`}>
              <div>
                <dt className="mb-1 text-[#a79d87]">Chapters</dt>
                <dd className="text-lg text-[#ece7da]">24</dd>
              </div>
              <div>
                <dt className="mb-1 text-[#a79d87]">Words</dt>
                <dd className="text-lg text-[#ece7da]">~46,000</dd>
              </div>
              <div>
                <dt className="mb-1 text-[#a79d87]">Pages</dt>
                <dd className="text-lg text-[#ece7da]">{BOOK.pages}</dd>
              </div>
            </dl>
            <BuyCta />
          </div>
          <div className="mx-auto w-full max-w-[340px]">
            <BookCover priority />
          </div>
        </Container>
      </section>

      {/* WHAT THIS BOOK IS */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Practitioner tone" title="What this book is" />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-[#a79d87]">
            <p>
              Twenty-four chapters, about 46,000 words, written end to end by the author —
              not generated filler. Each chapter builds a real piece of a local-first AI
              system: running models, retrieval, knowledge graphs, governed agents,
              refusal logic, security, and the measurement discipline that holds it all
              together.
            </p>
            <p>
              The tone is practitioner, not academic and not hype. Terminal commands you can
              run, numbers you can check, decisions you can audit. If a claim can't be
              measured, it doesn't make it into the book.
            </p>
            <p>
              By the last chapter you won't just understand local-first AI — you'll have
              built one: a system that runs on your machine, answers from your documents,
              refuses when it should, and survives an air gap.
            </p>
          </div>
        </Container>
      </section>

      {/* TOC */}
      <section className="border-b border-[#2c2720] bg-[#1a1712]">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="Table of contents"
            title="All 24 chapters"
            lede="Basics to advanced. Every chapter builds on the systems from the ones before it."
          />
          <ol className="mt-12 grid gap-x-10 gap-y-px border-y border-[#2c2720] bg-[#2c2720] md:grid-cols-2">
            {chapters.map((title, i) => (
              <li key={title} className="flex items-baseline gap-5 bg-[#1a1712] px-5 py-4">
                <span className={`${MONO} shrink-0 text-[11px] tracking-[0.16em] text-[#6fa58b]`}>
                  CH.{String(i + 1).padStart(2, "0")}
                </span>
                <span className={`${SERIF} text-lg text-[#ece7da]`}>{title}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* FOR / NOT FOR */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="py-16 md:py-24">
          <SectionHeading kicker="Read this first" title="Who it's for" />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] md:grid-cols-2">
            <div className="bg-[#14120d] p-8">
              <h3 className={`${SERIF} mb-6 text-2xl font-medium text-[#6fa58b]`}>For you</h3>
              <ul className="space-y-4">
                {forReaders.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-[#a79d87]">
                    <span className={`${MONO} shrink-0 text-[#6fa58b]`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#14120d] p-8">
              <h3 className={`${SERIF} mb-6 text-2xl font-medium text-[#d9a648]`}>Not for you</h3>
              <ul className="space-y-4">
                {notFor.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-[#a79d87]">
                    <span className={`${MONO} shrink-0 text-[#d9a648]`}>✕</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* FORMATS */}
      <section className="border-b border-[#2c2720] bg-[#1a1712]">
        <Container className="py-16 md:py-24">
          <SectionHeading kicker="Formats" title="Get the book" />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] md:grid-cols-2">
            <div className="flex flex-col bg-[#1a1712] p-8">
              <p className={`${MONO} mb-4 text-[11px] tracking-[0.2em] uppercase text-[#6fa58b]`}>
                Hardcover
              </p>
              <h3 className={`${SERIF} mb-2 text-2xl font-medium text-[#ece7da]`}>
                {BOOK.format} · {BOOK.pages} pages
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[#a79d87]">
                Print edition, 6×9. The one for your shelf — and the one that survives the
                air gap.
              </p>
              <p className={`${MONO} mb-6 mt-auto text-3xl text-[#ece7da]`}>{BOOK.price}</p>
              <BuyCta />
            </div>
            <div className="flex flex-col bg-[#1a1712] p-8">
              <p className={`${MONO} mb-4 text-[11px] tracking-[0.2em] uppercase text-[#d9a648]`}>
                Ebook
              </p>
              <h3 className={`${SERIF} mb-2 text-2xl font-medium text-[#ece7da]`}>
                Ebook edition
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[#a79d87]">
                The same 24 chapters, in digital form.
              </p>
              <p className={`${MONO} mb-6 mt-auto text-3xl text-[#ece7da]`}>—</p>
              <p className={`${MONO} text-[11px] tracking-[0.16em] uppercase text-[#d9a648]`}>
                Price announced at launch
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="FAQ" title="Honest answers" />
          <div className="mt-10 divide-y divide-[#2c2720] border-y border-[#2c2720]">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary
                  className={`${SERIF} cursor-pointer list-none text-lg font-medium text-[#ece7da] transition-colors hover:text-[#d9a648] [&::-webkit-details-marker]:hidden`}
                >
                  <span className={`${MONO} mr-3 text-[11px] tracking-[0.16em] text-[#6fa58b]`}>
                    +
                  </span>
                  {f.q}
                </summary>
                <p className="mt-3 pl-7 text-sm leading-relaxed text-[#a79d87]">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* EMAIL */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="py-16 md:py-20">
          <EmailCapture
            variant="inline"
            heading="Read Chapter 1 free"
            blurb="The sample chapter, straight to your inbox. Plus the launch notice. No spam, unsubscribe anytime."
          />
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#1a1712]">
        <Container className="max-w-3xl py-16 text-center md:py-24">
          <h2 className={`${SERIF} mb-4 text-3xl font-semibold tracking-[-0.01em] text-[#ece7da] md:text-5xl`}>
            Own your intelligence.
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#a79d87]">
            {BOOK.promise}
          </p>
          <BuyCta />
          <p className="mt-6">
            <Link
              href="/sample"
              className={`${MONO} text-[12px] tracking-[0.16em] uppercase text-[#6fa58b] hover:text-[#d9a648]`}
            >
              Or read the sample chapter first →
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
