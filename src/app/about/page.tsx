import { Container } from "@/components/Container";
import { HeroBand } from "@/components/HeroBand";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { BOOK, OLD_BOOK } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { profilePageSchema, seo } from "@/lib/seo";

export const metadata = seo({
  title: "About",
  description:
    "Daniel Kliewer is an AI engineer in Austin, Texas. Ten years in search relevance at Amazon, a self-directed computer science education through MIT OpenCourseWare, twenty years of painting and animation, and local-first AI systems built on hardware he owns.",
  path: "/about",
  openGraph: {
    title: "About Daniel Kliewer",
    description:
      "AI engineer in Austin. Search relevance, local-first systems, and twenty years of painting.",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Daniel Kliewer",
    description:
      "AI engineer in Austin. Search relevance, local-first systems, and twenty years of painting.",
  },
});

/* Every fact on this page is sourced: employment and education dates from the
   public LinkedIn record, repository counts from the GitHub API, publication
   counts from the build. Nothing here is inferred, and no capability is claimed
   that does not have code or a dated artifact behind it. */

const POST_COUNT = getAllPosts().length;

const current = [
  {
    title: "Local-first AI systems",
    body: "I build systems that run on hardware I own — local inference, retrieval evaluated against frozen sets, knowledge compiled into graphs before query time, and agents whose authority sits in a deterministic substrate rather than in the model's judgment. The code is public; so are the measurements and the dead ends.",
  },
  {
    title: "Search quality, one level up",
    body: "I also contract on search-quality evaluation — the Page Quality and Needs Met frameworks — work that asks whether an output deserves to be surfaced at all. It is the same question I spent a decade on at Amazon, applied to machine-generated claims instead of web pages.",
  },
  {
    title: "Writing it down",
    body: `The synthesis is ${BOOK.title}: ${BOOK.chapters} chapters on building systems you can own, audit and reproduce. The working notes are the research log — ${POST_COUNT} posts published as the work happened, including the parts that failed.`,
  },
];

interface Entry {
  year: string;
  title: string;
  desc: string;
}

const history: Entry[] = [
  {
    year: "2003",
    title: "History, and a plan to study law",
    desc: "Began a BA in History at the University of Mary Hardin-Baylor, on a course of study aimed at law school. Finished in 2007. I did not go.",
  },
  {
    year: "2006",
    title: "Painting, then painting with televisions",
    desc: "Figurative and experimental time-lapse oil painting. Then a stranger version: old televisions wired through modulators to refurbished computers, painting on a Wacom tablet in Photoshop, capturing the screen, cutting the result in After Effects. Shown at Co-Lab Space in Austin in March 2012 as 'possible and remembered time'.",
  },
  {
    year: "2007",
    title: "Machine learning, self-employed",
    desc: "Started taking ML work under my own name — retrieval systems, human-in-the-loop annotation platforms, and later agent frameworks. Still doing it.",
  },
  {
    year: "2010",
    title: "A decade of search at Amazon",
    desc: "Ten years in Austin on keyword research, competitive analysis, content optimization and behavioural data. The work was measuring whether information actually satisfied the query — relevance as a measurable property rather than a vibe. This is where the question that runs through everything else came from.",
  },
  {
    year: "2010",
    title: "A two-hour film that turned televisions into a moving painting",
    desc: "Screen capture, Photoshop and a Wacom tablet, assembled into an experimental film and shown at Austin Film Society's Avant Cinema program in October 2012. Around the same period I built danielkliewer.com, kadaligogh.com and eastsidechess.org.",
  },
  {
    year: "2017",
    title: "The MIT curriculum, without the enrollment",
    desc: "MIT publishes its course materials free through OpenCourseWare. From 2017 to 2021 I worked through the computer science curriculum that way — lectures, problem sets, exams — at the depth of a degree and with none of the credential. No enrollment, no credit, no degree. The material is what I was after; the credential would have been someone else's signature on my work.",
  },
  {
    year: "2024",
    title: "The research log goes public",
    desc: "Publishing as the work happens — 221 public repositories on GitHub since 2014, and a post for most things that worked, plus the ones that didn't.",
  },
  {
    year: "2026",
    title: "Computational Sovereignty",
    desc: `${BOOK.chapters} chapters, ${BOOK.pages} pages. The laboratory years compiled into a single artifact.`,
  },
];

const beliefs = [
  {
    title: "A system you can't reproduce isn't engineering",
    body: "It's a demo with good lighting. Determinism, measurement and ownership aren't aesthetic preferences — they're the difference between infrastructure and luck. This is why the projects publish their tests and their failures alongside their results.",
  },
  {
    title: "The cloud is a priced dependency, not a default",
    body: "Price it explicitly, the way you'd price anything that can change its behaviour, its cost or its availability without telling you. Sometimes the price is fine. Often it's the largest line item in a system nobody is accounting for.",
  },
  {
    title: "Breadth is not a distraction",
    body: "Painting taught me to finish things that have no specification. Search taught me to measure whether a thing was worth surfacing. Machine learning taught me that both of those are the same problem wearing different clothes.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: profilePageSchema() }}
      />
      {/* HEAD */}
      <HeroBand
        poster="/images/hero/hero-about.jpg"
        srcMp4="/images/hero/hero-about-loop.mp4"
        srcWebm="/images/hero/hero-about-loop.webm"
        alt="A painter's workbench and easel in a dark room under a single warm lamp"
      >
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-sm border border-rule">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/profile.jpeg"
              alt="Daniel Kliewer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="display-lg mb-3">Daniel Kliewer</h1>
            <p className="mb-3 font-display text-xl text-gold italic">
              AI engineer. Search relevance, local-first systems, and twenty
              years of painting.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">
              Austin, Texas · 2006 — present
            </p>
          </div>
        </div>
      </HeroBand>

      {/* NOW */}
      <section className="border-b border-rule">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Currently" title="What I actually do" />
          <div className="mt-10 space-y-12">
            {current.map((s) => (
              <Reveal key={s.title}>
                <div>
                  <h3 className="mb-4 font-display text-2xl font-medium text-ink">
                    {s.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-2">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* HISTORY */}
      <section className="border-b border-rule bg-void-2">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Record" title="How I got here" />
          <div className="mt-10 space-y-8">
            {history.map((t) => (
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

      {/* BELIEFS */}
      <section className="border-b border-rule">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Positions" title="What I believe" />
          <div className="mt-10 space-y-12">
            {beliefs.map((s) => (
              <Reveal key={s.title}>
                <div>
                  <h3 className="mb-4 font-display text-2xl font-medium text-ink">
                    {s.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-2">
                    {s.body}
                  </p>
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
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">
                {OLD_BOOK.format}
              </p>
              <h3 className="mb-2 font-display text-2xl font-medium text-ink">
                {OLD_BOOK.title}
              </h3>
              <p className="mb-5 font-display text-lg italic text-ink-2">
                {OLD_BOOK.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <p className="font-mono text-2xl text-ink">{OLD_BOOK.price}</p>
                <a
                  href={OLD_BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-colors hover:text-ink"
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
