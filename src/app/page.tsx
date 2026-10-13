import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { BookCover } from "@/components/BookCover";
import { EmailCapture } from "@/components/EmailCapture";
import { BOOK } from "@/config";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Computational Sovereignty — Daniel Kliewer",
  description:
    "Computational Sovereignty: Building Local-First AI Systems. A 214-page hardcover on running models, retrieval, graphs, and governed agents on your own machine — no cloud required.",
  openGraph: {
    title: "Computational Sovereignty — Daniel Kliewer",
    description:
      "Build local-first AI systems: models, RAG, knowledge graphs, and governed agents that run on your machine.",
    type: "website",
    images: [BOOK.coverImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Computational Sovereignty — Daniel Kliewer",
    description:
      "Build local-first AI systems: models, RAG, knowledge graphs, and governed agents that run on your machine.",
  },
};

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

const outcomes = [
  {
    ch: "CH.3",
    title: "Run models locally",
    desc: "From terminal to first tokens: download open weights, run them on your machine, understand what the GPU is actually doing.",
  },
  {
    ch: "CH.8",
    title: "Build local RAG",
    desc: "Embeddings, vector search, and grounded answers — a retrieval pipeline where your documents never leave the building.",
  },
  {
    ch: "CH.11",
    title: "Compile knowledge into graphs",
    desc: "GraphRAG in practice: entities, relations, and reasoning over structure instead of flat, forgetful search.",
  },
  {
    ch: "CH.14+19",
    title: "Ship governed agents that refuse safely",
    desc: "State machines over vibes. Agents with explicit refusal logic, auditable decisions, and no silent failures.",
  },
  {
    ch: "CH.22",
    title: "Air-gap the whole system",
    desc: "A local-first security model: every layer inspectable, every dependency accounted for, no outbound calls required.",
  },
  {
    ch: "CH.9",
    title: "Measure everything honestly",
    desc: "Evaluate retrieval like someone who'll be checked: gold sets, frozen benchmarks, and recall numbers you can defend.",
  },
];

const audiences = [
  {
    title: "Practitioners & builders",
    desc: "Engineers shipping local AI into real products. Comfortable in a terminal. You want working systems, not demos.",
  },
  {
    title: "Regulated & compliance fields",
    desc: "Law, healthcare, finance — anywhere data can't leave the building and every decision needs an audit trail.",
  },
  {
    title: "Autonomous systems",
    desc: "Builders of agents and pipelines that must behave the same way on every run, with or without a network.",
  },
];

function BuyCta({ secondary }: { secondary?: boolean }) {
  const live = BOOK.amazonUrl && !BOOK.amazonUrl.startsWith("#");
  return (
    <div className="flex flex-col gap-2">
      <a
        href={BOOK.amazonUrl}
        aria-disabled={!live}
        className={
          secondary
            ? `inline-flex items-center justify-center rounded-sm border border-[#2c2720] bg-transparent px-7 py-3.5 ${MONO} text-[12px] tracking-[0.14em] uppercase text-[#ece7da] transition-colors hover:border-[#d9a648] hover:text-[#d9a648]`
            : "inline-flex items-center justify-center rounded-sm bg-[#3e6b52] px-7 py-3.5 font-['JetBrains_Mono',ui-monospace,monospace] text-[12px] tracking-[0.14em] uppercase text-[#0f110c] transition-colors hover:bg-[#4a7d62]"
        }
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

export default async function HomePage() {
  const posts = await getAllPosts();
  const latest = posts.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="grid gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:py-24">
          <div>
            <p className={`${MONO} mb-6 text-[11px] tracking-[0.24em] uppercase text-[#d9a648]`}>
              Coming soon — hardcover &amp; ebook
            </p>
            <h1
              className={`${SERIF} mb-5 text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-[#ece7da] md:text-7xl`}
            >
              Computational Sovereignty
            </h1>
            <p className={`${SERIF} mb-5 text-xl italic text-[#a79d87] md:text-2xl`}>
              {BOOK.subtitle}
            </p>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-[#a79d87]">
              {BOOK.promise}
            </p>
            <div className="mb-8 flex flex-wrap items-center gap-6">
              <div>
                <p className={`${MONO} text-3xl font-medium text-[#ece7da]`}>{BOOK.price}</p>
                <p className={`${MONO} mt-1 text-[10px] tracking-[0.2em] uppercase text-[#a79d87]`}>
                  {BOOK.format} · {BOOK.pages} pages
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <BuyCta />
              <Link
                href="/sample"
                className={`inline-flex items-center justify-center rounded-sm border border-[#2c2720] bg-transparent px-7 py-3.5 ${MONO} text-[12px] tracking-[0.14em] uppercase text-[#ece7da] transition-colors hover:border-[#d9a648] hover:text-[#d9a648]`}
              >
                Read the sample chapter
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[340px]">
            <BookCover priority />
            <p className={`${MONO} mt-4 text-center text-[10px] tracking-[0.2em] uppercase text-[#a79d87]`}>
              Cover · {BOOK.format} 6×9
            </p>
          </div>
        </Container>
      </section>

      {/* OUTCOMES */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="24 chapters · ~46,000 words"
            title="What you'll be able to build"
            lede="No API wrappers. No demos. Working systems on your own machine, measured and reproducible."
          />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((o) => (
              <div key={o.title} className="bg-[#14120d] p-7">
                <p className={`${MONO} mb-4 text-[11px] tracking-[0.2em] text-[#6fa58b]`}>
                  {o.ch}
                </p>
                <h3 className={`${SERIF} mb-2 text-xl font-medium text-[#ece7da]`}>{o.title}</h3>
                <p className="text-sm leading-relaxed text-[#a79d87]">{o.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/book"
              className={`${MONO} text-[12px] tracking-[0.16em] uppercase text-[#6fa58b] hover:text-[#d9a648]`}
            >
              Full 24-chapter table of contents →
            </Link>
          </div>
        </Container>
      </section>

      {/* WHO IT'S FOR */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="py-16 md:py-24">
          <SectionHeading kicker="Audience" title="Who it's for" />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] md:grid-cols-3">
            {audiences.map((a, i) => (
              <div key={a.title} className="bg-[#14120d] p-7">
                <p className={`${MONO} mb-4 text-[11px] tracking-[0.2em] text-[#d9a648]`}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className={`${SERIF} mb-2 text-xl font-medium text-[#ece7da]`}>{a.title}</h3>
                <p className="text-sm leading-relaxed text-[#a79d87]">{a.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* AUTHOR STRIP */}
      <section className="border-b border-[#2c2720] bg-[#1a1712]">
        <Container className="flex flex-col items-start gap-6 py-12 md:flex-row md:items-center">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-[#2c2720]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/profile.jpeg" alt="Daniel Kliewer" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className={`${MONO} mb-1 text-[11px] tracking-[0.24em] uppercase text-[#a79d87]`}>
              The author
            </p>
            <h3 className={`${SERIF} text-2xl font-medium text-[#ece7da]`}>Daniel Kliewer</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#a79d87]">
              Computer scientist and AI researcher in Austin, Texas. For years his work has
              centered on one question: how do we make human knowledge cheaper to understand?
            </p>
          </div>
          <Link
            href="/about"
            className={`${MONO} shrink-0 text-[12px] tracking-[0.16em] uppercase text-[#6fa58b] hover:text-[#d9a648]`}
          >
            About →
          </Link>
        </Container>
      </section>

      {/* RESEARCH LOG */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="Research log"
            title="From the research log"
            lede="The open notebook behind the book. Every claim in these pages was tested in public first."
          />
          <div className="mt-12 grid gap-px border border-[#2c2720] bg-[#2c2720] md:grid-cols-3">
            {latest.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group bg-[#14120d] p-7">
                <p className={`${MONO} mb-4 text-[11px] tracking-[0.16em] text-[#a79d87]`}>
                  {p.date}
                </p>
                <h3
                  className={`${SERIF} mb-3 text-lg font-medium leading-snug text-[#ece7da] transition-colors group-hover:text-[#d9a648]`}
                >
                  {p.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-[#a79d87]">
                  {p.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* EMAIL BAND */}
      <section className="bg-[#14120d]">
        <Container className="py-16 md:py-20">
          <EmailCapture
            variant="band"
            heading="Get the sample chapter"
            blurb="Chapter 1, free. Plus the launch notice when the hardcover ships. No spam, unsubscribe anytime."
          />
        </Container>
      </section>
    </>
  );
}
