import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import HeroBook from "@/components/HeroBook";
import { AmazonCta } from "@/components/AmazonCta";
import { BOOK } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";

export const metadata: Metadata = {
  title: "Computational Sovereignty — Daniel Kliewer",
  description:
    "Computational Sovereignty: Building Local-First AI Systems. A 214-page hardcover on running models, retrieval, graphs, and governed agents on your own machine. $88.",
  openGraph: {
    title: "Computational Sovereignty — Daniel Kliewer",
    description:
      "24 chapters. One working rule: if you can&apos;t run it on your own machine, you don&apos;t own it. Hardcover, 214 pages, $88.",
    type: "website",
    images: [BOOK.coverFront],
  },
  twitter: {
    card: "summary_large_image",
    title: "Computational Sovereignty — Daniel Kliewer",
    description:
      "24 chapters. One working rule: if you can&apos;t run it on your own machine, you don&apos;t own it. Hardcover, 214 pages, $88.",
  },
};

/* Six things you will have built by the last page. Not metaphors — systems. */
const builds = [
  {
    ch: "CH. 3–6",
    title: "A working inference stack",
    desc: "Open weights downloaded, quantized, and served from your own machine. You will know what the GPU is doing at every step, because you configured it.",
  },
  {
    ch: "CH. 7–9",
    title: "Retrieval you can defend",
    desc: "Embeddings, vector search, and a RAG pipeline evaluated against a frozen gold set. Recall is a number you measured, not a feeling you have.",
  },
  {
    ch: "CH. 10–12",
    title: "A compiled knowledge graph",
    desc: "Documents turned into entities and relations, reasoned over at compile time. The answers were organized before the question was asked.",
  },
  {
    ch: "CH. 13–15",
    title: "Agents that obey",
    desc: "Tool use through state machines, watched by an auditor pattern. No vibes, no silent failures, no agent improvising with your filesystem.",
  },
  {
    ch: "CH. 16–18",
    title: "Routed persona systems",
    desc: "Quantified personalities and MoE-style routing between specialized local models, running in production without phoning home.",
  },
  {
    ch: "CH. 19–24",
    title: "The verification discipline",
    desc: "Refusal logic, contradiction detection at scale, frozen benchmarks, a security model for air-gapped machines — and how to ship all of it.",
  },
];

/* The writing contract, stated plainly. */
const contract = [
  {
    n: "01",
    title: "Every claim has a number",
    desc: "Recall percentages, parameter counts, VRAM budgets, dollar costs. If a statement can&apos;t be measured, it doesn&apos;t survive the chapter.",
  },
  {
    n: "02",
    title: "Every pipeline has a repo",
    desc: "Nothing in the book is a screenshot of a demo that worked once. The systems described are built from components you can clone and run.",
  },
  {
    n: "03",
    title: "Every trade-off is priced",
    desc: "Local-first AI costs hardware, attention, and a capability ceiling. The book lists the price before it sells you the machine.",
  },
  {
    n: "04",
    title: "No cloud required",
    desc: "All 24 chapters assume a machine you own and a network you can unplug. The cloud appears only where it is honestly the right call — priced as a liability.",
  },
];

/* Deadpan audience filter. */
const friction = [
  {
    title: "Cloud-first teams",
    desc: "If your architecture diagram is a list of vendor logos, chapters 1 and 22 will read like an intervention. That is intentional.",
  },
  {
    title: "Demo builders",
    desc: "If your standard of done is a video that plays well on social media, this book&apos;s insistence on frozen benchmarks will bore you. Good.",
  },
  {
    title: "Prompt collectors",
    desc: "There are no prompt packs here. There are state machines, evaluators, and audit ledgers. The magic words are load-bearing code.",
  },
];

export default async function HomePage() {
  const posts = await getAllPosts();
  const latest = posts.slice(0, 3);

  return (
    <>
      {/* HERO — the machine you can hold */}
      <section className="border-b border-hairline">
        <Container className="grid items-center gap-12 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
          <div>
            <p className="mb-6 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
              Hardcover · 214 pages · {BOOK.price}
            </p>
            <h1 className="mb-5 font-display text-5xl leading-[1.02] font-semibold tracking-[-0.02em] text-bone md:text-7xl">
              Computational Sovereignty
            </h1>
            <p className="mb-6 font-display text-xl text-bone-dim italic md:text-2xl">
              {BOOK.subtitle}
            </p>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-bone-dim">
              Twenty-four chapters on building AI systems that run on hardware
              you own. Models, retrieval, knowledge graphs, governed agents —
              each one measured, each one reproducible, none of them rented.
              The cloud is treated as what it is: a liability to be priced,
              not a default to be accepted.
            </p>
            <div className="mb-10 flex flex-wrap items-center gap-6">
              <p className="font-mono text-3xl font-medium text-bone">
                {BOOK.price}
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-bone-dim uppercase">
                {BOOK.format}
                <br />
                {BOOK.chapters} chapters · {BOOK.words} words
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <AmazonCta />
              <Link
                href="/sample"
                className="inline-flex items-center justify-center rounded-sm border border-hairline bg-transparent px-7 py-4 font-mono text-[12px] tracking-[0.14em] text-bone uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Read chapter 1 free
              </Link>
            </div>
          </div>
          <div>
            <HeroBook className="mx-auto aspect-[4/5] w-full max-w-[440px]" />
            <p className="mt-4 text-center font-mono text-[10px] tracking-[0.24em] text-bone-faint uppercase">
              Drag to rotate — it runs on your machine
            </p>
          </div>
        </Container>
      </section>

      {/* THE BUILDS */}
      <section className="border-b border-hairline">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker={`${BOOK.chapters} chapters · ${BOOK.words} words`}
            title="What you will have built"
            lede="Not understood. Built. The book is organized around working systems, in the order you would actually construct them."
          />
          <div className="mt-4 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((b, i) => (
              <Reveal key={b.title} delay={Math.min(i * 0.05, 0.25)}>
                <div className="h-full bg-abyss p-7">
                  <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-steel">
                    {b.ch}
                  </p>
                  <h3 className="mb-2 font-display text-xl font-medium text-bone">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-bone-dim">
                    {b.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/book"
              className="font-mono text-[12px] tracking-[0.16em] text-bone-dim uppercase transition-colors hover:text-gold"
            >
              The full 24-chapter stack →
            </Link>
          </div>
        </Container>
      </section>

      {/* THE CONTRACT */}
      <section className="border-b border-hairline bg-navy-deep">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="The writing contract"
            title="How this book is written"
            lede="Four rules the manuscript obeyed for 46,000 words. You can verify all of them against the sample chapter."
          />
          <div className="mt-4 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            {contract.map((c, i) => (
              <Reveal key={c.n} delay={Math.min(i * 0.05, 0.2)}>
                <div className="h-full bg-navy-deep p-8">
                  <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-gold">
                    {c.n}
                  </p>
                  <h3 className="mb-2 font-display text-xl font-medium text-bone">
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-bone-dim">
                    {c.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FRICTION */}
      <section className="border-b border-hairline">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="Honest filter"
            title="Who this will annoy"
            lede="A book with a thesis should say who the thesis is against. This one does."
          />
          <div className="mt-4 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {friction.map((f, i) => (
              <Reveal key={f.title} delay={Math.min(i * 0.05, 0.15)}>
                <div className="h-full bg-abyss p-7">
                  <h3 className="mb-2 font-display text-xl font-medium text-bone">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-bone-dim">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* RESEARCH LOG */}
      <section className="border-b border-hairline">
        <Container className="py-16 md:py-24">
          <SectionHeading
            kicker="Research log"
            title="Tested in public first"
            lede="The open notebook behind the book. Every technique in these chapters was built, measured, and argued about here before it earned a page."
          />
          <div className="mt-4 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {latest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group bg-abyss p-7"
              >
                <p className="mb-4 font-mono text-[11px] tracking-[0.16em] text-bone-faint">
                  {formatDate(p.date)}
                </p>
                <h3 className="mb-3 font-display text-lg leading-snug font-medium text-bone transition-colors group-hover:text-gold">
                  {p.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-bone-dim">
                  {p.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/research"
              className="font-mono text-[12px] tracking-[0.16em] text-bone-dim uppercase transition-colors hover:text-gold"
            >
              All 184 posts →
            </Link>
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="bg-navy-deep">
        <Container className="py-16 text-center md:py-24">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
              Hardcover · 214 pages
            </p>
            <h2 className="mx-auto mb-4 max-w-2xl font-display text-3xl font-semibold text-bone md:text-5xl">
              Read the first chapter. Then decide if you want the other
              twenty-three.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-bone-dim">
              Chapter 1 is free, ungated, and representative. If its
              measurement discipline doesn&apos;t convince you, the book won&apos;t
              either.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sample"
                className="inline-flex items-center justify-center rounded-sm border border-hairline bg-transparent px-8 py-4 font-mono text-[12px] tracking-[0.14em] text-bone uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Read chapter 1 free
              </Link>
              <AmazonCta secondary />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
