import Link from "next/link";
import { AmazonCta } from "@/components/AmazonCta";
import {
  Exhibit,
  Figure,
  FigureRow,
  Instrument,
  Kicker,
  RuledRow,
  Scene,
} from "@/components/Archetypes";
import { BoundaryDiagram } from "@/components/BoundaryDiagram";
import { Container } from "@/components/Container";
import { HeroFilm } from "@/components/HeroFilm";
import { BOOK } from "@/config";
import { formatDate } from "@/lib/formatDate";
import { getAllPosts } from "@/lib/posts";
import { orgWebsiteGraph, seo } from "@/lib/seo";
import { CONCEPTS, MATURITY_LABEL, PATHS, PROJECTS } from "@/lib/taxonomy";

export const metadata = seo({
  title: "Daniel Kliewer — local-first AI, governed execution, knowledge compilation",
  description:
    "Engineering work on local-first AI: agent runtimes that separate proposal from permission, knowledge compilers that keep claims traceable to evidence, and creative tooling that verifies what it rendered rather than trusting an exit code.",
  path: "/",
  openGraph: {
    title: "Daniel Kliewer — local-first AI systems",
    description:
      "Twelve systems built on one constraint: if a system cannot account for itself, it is not trustworthy, however capable it looks.",
    type: "website",
    images: ["/images/og-home.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Kliewer — local-first AI systems",
    description:
      "Governed agent runtimes, knowledge compilers, and creative tooling that verifies what it rendered.",
  },
});

/* Landmark posts spanning the whole archive. The homepage is the site's
   highest-authority node, so it links into significant older work directly
   instead of funneling every crawler through /research. Kept from the previous
   version deliberately: this is link equity, not decoration. */
const LANDMARK_SLUGS = [
  "2026-09-03-pagerank-seo-information-architecture-problem",
  "2026-01-03-american-phoenix",
  "2025-12-04-critical-nextjs-rce-cve-2025-66478-security-guide",
  "2025-11-15-building-evaluating-local-research-assistant-graphrag-vero-eval",
  "2025-07-06-demystifying-large-language-models",
];

const FEATURED_PROJECTS = [
  "sovereign-agent-stack",
  "ganymede",
  "hermes-local-video-studio",
  "artcraft",
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Own the runtime",
    body: "If inference runs on someone else's hardware, then availability, cost and acceptable use are their decisions, not yours. Local-first is a claim about who can stop your system.",
    href: "/concepts/local-first",
    label: "Local-first inference",
  },
  {
    n: "02",
    title: "Govern the execution",
    body: "A model may propose an operation. A deterministic layer decides whether it may run. Collapsing those two steps turns model confidence into system permission.",
    href: "/concepts/governed-execution",
    label: "Governed execution",
  },
  {
    n: "03",
    title: "Verify, don't assert",
    body: "A command returning zero means it was accepted, not that it worked. Every project here separates what it requested from what it measured.",
    href: "/concepts/reproducibility",
    label: "Reproducibility",
  },
];

export default async function HomePage() {
  const posts = getAllPosts();
  const recent = posts.slice(0, 3);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const landmarks = LANDMARK_SLUGS.map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .filter((p) => !recent.some((r) => r.slug === p.slug));
  const featured = FEATURED_PROJECTS.map((slug) =>
    PROJECTS.find((p) => p.slug === slug)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: orgWebsiteGraph() }}
      />

      {/* ============ A. SCENE — the cinematic plate ============
          The thesis over the archive. The still is the hero; the 13-second film
          (archive -> graph -> instrument -> archive) layers on top only when the
          visitor has not asked for reduced motion and is not on a metered
          connection. Measured: the plate's left third is pure black (mean
          luminance 0.0), so the type column sits on true void and needs no
          scrim on desktop. The scrim below exists for narrow viewports, where
          object-cover pushes the lit archive under the text. */}
      <section className="relative isolate overflow-hidden border-b border-rule">
        <HeroFilm
          poster="/images/hero/hero-archive.jpg"
          srcMp4="/images/hero/hero-loop.mp4"
          srcWebm="/images/hero/hero-loop.webm"
          alt="A monumental archive of dark metal plates receding into blackness, lit by a single warm amber light"
          className="absolute inset-0 -z-10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/80 to-void/20 md:bg-gradient-to-r md:from-void md:via-void/30 md:to-transparent"
        />
        {/* Top scrim: only the band the header occupies is darkened. Without it
            the rightmost nav items sit directly on the plate's brightest tile
            (~149/255) while the header is transparent at rest. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-void via-void/70 to-transparent"
        />

        <Container className="relative flex min-h-[540px] flex-col justify-center py-14 md:min-h-[620px] md:py-16">
          <Kicker>Local-first AI systems</Kicker>
          <h1 className="display-hero mt-8 max-w-3xl">
            Systems that run on your hardware, and can prove what they did.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-2">
            I build local-first AI systems: agent runtimes that separate what a
            model proposes from what the machine is permitted to do, knowledge
            compilers that keep every claim traceable to its evidence, and
            creative tooling that verifies what it actually rendered instead of
            trusting an exit code.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/projects"
              className="label border border-gold px-6 py-4 text-gold transition-colors hover:bg-gold hover:text-void"
            >
              Explore the systems
            </Link>
            <Link
              href="/research"
              className="label border border-rule-2 px-6 py-4 text-ink-2 transition-colors hover:border-gold hover:text-gold"
            >
              Read the research
            </Link>
          </div>
        </Container>
      </section>

      {/* The counts, out of the cinematic frame. They are evidence, not decor,
          and the hero brief was explicit: no statistics competing with the
          headline. */}
      <section className="border-b border-rule bg-void-2">
        <Container className="py-8">
          <FigureRow>
            <Figure value={String(PROJECTS.length)} label="Systems in the index" />
            <Figure value={String(posts.length)} label="Published articles" />
            <Figure value={String(CONCEPTS.length)} label="Concepts they share" />
            <Figure value={String(BOOK.chapters)} label="Chapters in the book" />
          </FigureRow>
        </Container>
      </section>

      {/* ============ B. EXHIBIT — why this is one body of work ============ */}
      <Exhibit wide>
        <Kicker>01 — The argument</Kicker>
        <h2 className="display-lg mt-5 max-w-3xl">
          Three constraints that recur in everything here.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          The systems differ in language, domain and maturity. They keep solving
          the same three problems, which is why they belong together.
        </p>

        <div className="mt-16 grid gap-px border border-rule bg-rule md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <Link
              key={item.n}
              href={item.href}
              className="group bg-void p-9 transition-colors hover:bg-void-2"
            >
              <span className="label data text-gold">{item.n}</span>
              <span className="display-md mt-4 block transition-colors group-hover:text-gold">
                {item.title}
              </span>
              <span className="mt-4 block leading-relaxed text-ink-2">
                {item.body}
              </span>
              <span className="label mt-6 block text-ink-3">{item.label} →</span>
            </Link>
          ))}
        </div>

        <div className="mt-16 border border-rule bg-void-2 p-8 md:p-12">
          <p className="label text-gold">The execution boundary</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">
            This shape appears in the agent stack, the video studio and the
            specification engine. It is a diagram rather than generated artwork
            because the labels have to be correct — a model cannot be relied on
            to spell &ldquo;allowlist&rdquo;, and a diagram that mislabels the
            architecture is worse than none.
          </p>
          <div className="figure-scroll mt-10">
            <BoundaryDiagram className="w-full text-ink-2" />
          </div>
        </div>
      </Exhibit>

      {/* ============ C. INSTRUMENT — systems as ruled rows, not cards ============ */}
      <Instrument>
        <Kicker>02 — Selected systems</Kicker>
        <h2 className="display-lg mt-5 max-w-3xl">
          Four entries, and the problem each was built to answer.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          Maturity labels describe the code. Dates are the last commit, read from
          the repository — not a promise about the roadmap.
        </p>

        <div className="mt-14 border-t border-rule">
          {featured.map((project) => (
            <RuledRow
              key={project.slug}
              lead={MATURITY_LABEL[project.maturity]}
              trailing={project.signals.lastCommit}
            >
              <Link href={`/projects/${project.slug}`} className="group block">
                <span className="display-md block transition-colors group-hover:text-gold">
                  {project.name}
                </span>
                <span className="mt-3 block max-w-2xl leading-relaxed text-ink-2">
                  {project.role}
                </span>
              </Link>
            </RuledRow>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/projects" className="label transition-colors hover:text-gold">
            All {PROJECTS.length} systems →
          </Link>
        </div>
      </Instrument>

      {/* ============ B. EXHIBIT — ways in ============ */}
      <Exhibit wide>
        <Kicker>03 — Ways in</Kicker>
        <h2 className="display-lg mt-5 max-w-3xl">
          Start from the idea, the system, or the argument.
        </h2>

        <div className="mt-16 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {[
            {
              href: "/concepts",
              title: "Concepts",
              body: "Eight ideas stated once, with the projects that implement them and the articles that work them out.",
            },
            {
              href: "/paths",
              title: "Learning paths",
              body: `${PATHS.length} ordered routes through the material, each explaining why its steps belong together and what you should understand before moving on.`,
            },
            {
              href: "/research",
              title: "Research archive",
              body: `${posts.length} articles from 2024 to now, including the post-mortems where things failed and what that changed.`,
            },
            {
              href: "/book",
              title: BOOK.title,
              body: `${BOOK.chapters} chapters on running serious AI on hardware you own. One artifact inside the program, not the program itself.`,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-void p-9 transition-colors hover:bg-void-2"
            >
              <span className="display-md block transition-colors group-hover:text-gold">
                {item.title}
              </span>
              <span className="mt-3 block leading-relaxed text-ink-2">
                {item.body}
              </span>
            </Link>
          ))}
        </div>
      </Exhibit>

      {/* ============ C. INSTRUMENT — the research log ============ */}
      <Instrument>
        <Kicker>04 — Research log</Kicker>
        <h2 className="display-lg mt-5">Tested in public first.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
          The open notebook. Every technique in the systems was built, measured
          and argued about here before it earned a place in one.
        </p>

        <div className="mt-14 border-t border-rule">
          {[...recent, ...landmarks].map((p) => (
            <Link
              key={p.slug}
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
          ))}
        </div>

        <div className="mt-12">
          <Link href="/research" className="label transition-colors hover:text-gold">
            All {posts.length} articles →
          </Link>
        </div>
      </Instrument>

      {/* ============ B. EXHIBIT — the book, in its place ============ */}
      <Exhibit>
        <Kicker>05 — Book</Kicker>
        <h2 className="display-lg mt-5 max-w-3xl">
          {BOOK.title}: {BOOK.subtitle}
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
          {BOOK.promise} It is the long-form version of the argument the systems
          make: that owning your execution environment is a precondition for
          trusting what it produces. {BOOK.pages} pages, {BOOK.chapters}{" "}
          chapters, {BOOK.price}.
        </p>
        <div className="mt-11 flex flex-wrap items-center gap-4">
          <AmazonCta />
          <Link
            href="/sample"
            className="inline-flex items-center justify-center rounded-sm border border-rule-2 px-8 py-4 font-mono text-[12px] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            Read chapter 1 free
          </Link>
          <Link href="/book" className="label transition-colors hover:text-gold">
            About the book →
          </Link>
        </div>
      </Exhibit>

      {/* ============ C. INSTRUMENT — who is behind it ============
          The brief asks the homepage to answer "can a professional evaluate this
          person quickly". Every line below is sourced: Amazon and the art work
          from the employment record, the counts from this build, the repos from
          GitHub. Nothing here is inferred. */}
      <Instrument>
        <Kicker>06 — The engineer</Kicker>
        <h2 className="display-lg mt-5 max-w-3xl">
          Ten years of search relevance, twenty of painting, and the same question
          in both.
        </h2>
        <div className="mt-10 grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 text-base leading-relaxed text-ink-2">
            <p>
              I spent 2010 to 2020 at Amazon in Austin measuring whether
              information actually satisfied the query — relevance as a
              measurable property rather than a vibe. Before that and throughout,
              I painted: figurative oil work, then two-hour films made by wiring
              televisions through modulators to refurbished computers, one of
              which screened at Austin Film Society in 2012.
            </p>
            <p>
              The AI work is the same question one level up. A search result
              either deserves to be surfaced or it does not. A generated claim
              either survives its evidence or it does not. Both are answered by
              inspection, not by confidence — which is why these projects publish
              their tests, their measurements and their failures.
            </p>
            <p className="text-ink-3">
              Self-directed computer science through MIT OpenCourseWare, 2017 to
              2021 — the curriculum, not the credential.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="label mb-3 text-ink-3">Find the code</p>
              <a
                href="https://github.com/kliewerdaniel"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-lg text-gold transition-colors hover:text-ink"
              >
                github.com/kliewerdaniel ↗
              </a>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
                221 public repositories since 2014
              </p>
            </div>
            <div>
              <p className="label mb-3 text-ink-3">What I work on</p>
              <ul className="space-y-1.5 text-sm text-ink-2">
                <li>Local inference and owned execution environments</li>
                <li>Deterministic governance around model output</li>
                <li>Knowledge compilation, provenance and claim graphs</li>
                <li>Evaluation that measures instead of asserting</li>
              </ul>
            </div>
            <div>
              <p className="label mb-3 text-ink-3">Elsewhere</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/about" className="text-sm text-gold transition-colors hover:text-ink">
                  Full background →
                </Link>
                <Link href="/contact" className="text-sm text-gold transition-colors hover:text-ink">
                  Get in touch →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Instrument>
    </>
  );
}
