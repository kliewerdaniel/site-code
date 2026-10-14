import Link from "next/link";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import HeroBook from "@/components/HeroBook";
import { AmazonCta } from "@/components/AmazonCta";
import {
  Exhibit,
  Figure,
  FigureRow,
  Instrument,
  Kicker,
  RuledRow,
} from "@/components/Archetypes";
import { BOOK } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import { orgWebsiteGraph, seo } from "@/lib/seo";

export const metadata = seo({
  title: "Computational Sovereignty — Daniel Kliewer",
  description:
    "Computational Sovereignty: Building Local-First AI Systems. A 214-page hardcover on running models, retrieval, graphs, and governed agents on your own machine. $88.",
  path: "/",
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
});

/* Six things you will have built by the last page. Not metaphors — systems. */
const builds = [
  {
    ch: "CH 3–6",
    title: "A working inference stack",
    desc: "Open weights downloaded, quantized, and served from your own machine. You will know what the GPU is doing at every step, because you configured it.",
  },
  {
    ch: "CH 7–9",
    title: "Retrieval you can defend",
    desc: "Embeddings, vector search, and a RAG pipeline evaluated against a frozen gold set. Recall is a number you measured, not a feeling you have.",
  },
  {
    ch: "CH 10–12",
    title: "A compiled knowledge graph",
    desc: "Documents turned into entities and relations, reasoned over at compile time. The answers were organized before the question was asked.",
  },
  {
    ch: "CH 13–15",
    title: "Agents that obey",
    desc: "Tool use through state machines, watched by an auditor pattern. No vibes, no silent failures, no agent improvising with your filesystem.",
  },
  {
    ch: "CH 16–18",
    title: "Routed persona systems",
    desc: "Quantified personalities and MoE-style routing between specialized local models, running in production without phoning home.",
  },
  {
    ch: "CH 19–24",
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
  // Curated, spread across the archive: 3 most recent plus landmark posts from
  // across the history. The home page is the highest-PageRank node on the site,
  // so linking significant posts directly from here distributes authority to
  // content instead of funneling it all through the /research hub.
  const recent = posts.slice(0, 3);
  const featuredSlugs = [
    "2026-09-03-pagerank-seo-information-architecture-problem",
    "2026-01-03-american-phoenix",
    "2025-12-04-critical-nextjs-rce-cve-2025-66478-security-guide",
    "2025-11-15-building-evaluating-local-research-assistant-graphrag-vero-eval",
    "2025-07-06-demystifying-large-language-models",
  ];
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const featured = featuredSlugs
    .map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .filter((p) => !recent.some((r) => r.slug === p.slug));
  const latest = [...recent, ...featured];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: orgWebsiteGraph() }}
      />
      {/* ============ A. SCENE ============
          The object lit in a dark room. One per page. */}
      <section className="scene border-b border-rule">
        <Container className="grid w-full items-center gap-16 py-20 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Kicker>Hardcover · {BOOK.pages} pages · {BOOK.price}</Kicker>
            <h1 className="display-xl mt-8">Computational Sovereignty</h1>
            <p className="display-md mt-7 text-ink-2 italic">
              {BOOK.subtitle}
            </p>
            <p className="mt-8 max-w-xl leading-relaxed text-ink-2">
              Twenty-four chapters on building AI systems that run on hardware
              you own. Models, retrieval, knowledge graphs, governed agents —
              each one measured, each one reproducible, none of them rented.
              The cloud is treated as what it is: a liability to be priced,
              not a default to be accepted.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              <AmazonCta />
              <Link
                href="/sample"
                className="inline-flex items-center justify-center rounded-sm border border-rule-2 px-8 py-4 font-mono text-[12px] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Read chapter 1 free
              </Link>
            </div>
          </div>
          <div className="relative">
            <HeroBook className="mx-auto aspect-[4/5] w-full max-w-[420px]" />
            <p className="label mt-6 text-center">
              Drag to rotate — it runs on your machine
            </p>
          </div>
        </Container>
      </section>

      {/* ============ B. EXHIBIT ============
          Ruled entries, not bordered cards. v2 boxed all six of these;
          the boxes were what made the page read as a template. */}
      <Exhibit wide>
        <Kicker>01 — What you will have built</Kicker>
        <h2 className="display-lg mt-5">
          Six systems, running on your own machine.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          Not understood. Built. The book is organized around working systems,
          in the order you would actually construct them.
        </p>

        <div className="mt-20 border-t border-rule">
          {builds.map((b) => (
            <Reveal key={b.title}>
              <RuledRow lead={b.ch}>
                <h3 className="display-md">{b.title}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
                  {b.desc}
                </p>
              </RuledRow>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/book"
            className="label transition-colors hover:text-gold"
          >
            The full {BOOK.chapters}-chapter stack →
          </Link>
        </div>
      </Exhibit>

      {/* ============ C. INSTRUMENT ============
          The ornament is measurement. v2 said "every claim has a number"
          and then showed no numbers. */}
      <Instrument>
        <Kicker>02 — The instrument</Kicker>
        <h2 className="display-lg mt-5">The numbers are the point.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          A book that insists on measurement should be willing to measure
          itself. These are the specifications, not the marketing.
        </p>
        <FigureRow>
          <Figure value={String(BOOK.chapters)} label="Chapters" />
          <Figure value={BOOK.pages} label="Pages" />
          <Figure value={BOOK.words.replace("~", "")} label="Words" />
          <Figure value="0" label="Cloud dependencies" />
        </FigureRow>
      </Instrument>

      {/* ============ B. EXHIBIT ============ */}
      <Exhibit wide>
        <Kicker>03 — The writing contract</Kicker>
        <h2 className="display-lg mt-5">How this book is written.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          Four rules the manuscript obeyed for 46,000 words. You can verify all
          of them against the sample chapter.
        </p>

        <div className="mt-20 border-t border-rule">
          {contract.map((c) => (
            <Reveal key={c.n}>
              <RuledRow lead={c.n}>
                <h3 className="display-md">{c.title}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
                  {c.desc}
                </p>
              </RuledRow>
            </Reveal>
          ))}
        </div>
      </Exhibit>

      {/* ============ B. EXHIBIT ============ */}
      <Exhibit wide>
        <Kicker>04 — Honest filter</Kicker>
        <h2 className="display-lg mt-5">Who this will annoy.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          A book with a thesis should say who the thesis is against. This one
          does.
        </p>

        <div className="mt-20 grid gap-px border-t border-rule md:grid-cols-3">
          {friction.map((f) => (
            <Reveal key={f.title} className="md:pr-10">
              <div className="ruled-row py-7">
                <h3 className="display-md">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Exhibit>

      {/* ============ B. EXHIBIT ============ */}
      <Exhibit wide>
        <Kicker>05 — Research log</Kicker>
        <h2 className="display-lg mt-5">Tested in public first.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          The open notebook behind the book. Every technique in these chapters
          was built, measured, and argued about here before it earned a page.
        </p>

        <div className="mt-20 border-t border-rule">
          {latest.map((p) => (
            <Reveal key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group ruled-row grid grid-cols-1 items-baseline gap-x-9 gap-y-2 py-7 md:grid-cols-[9rem_1fr]"
              >
                <span className="label data">{formatDate(p.date)}</span>
                <span>
                  <span className="display-md block transition-colors group-hover:text-gold">
                    {p.title}
                  </span>
                  <span className="mt-3 block max-w-2xl leading-relaxed text-ink-2">
                    {p.description}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/research"
            className="label transition-colors hover:text-gold"
          >
            All {posts.length} posts →
          </Link>
        </div>
      </Exhibit>

      {/* ============ FINAL ============ */}
      <section className="bg-void-2">
        <Container className="py-28 text-center">
          <Reveal>
            <p className="label justify-center">
              Hardcover · {BOOK.pages} pages
            </p>
            <h2 className="display-lg mx-auto mt-6 max-w-3xl">
              Read the first chapter. Then decide if you want the other
              twenty-three.
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ink-2">
              Chapter 1 is free, ungated, and representative. If its measurement
              discipline doesn&apos;t convince you, the book won&apos;t either.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sample"
                className="inline-flex items-center justify-center rounded-sm border border-rule-2 px-8 py-4 font-mono text-[12px] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
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
