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

      {/* ============ A. SCENE — one per page ============
          The thesis, not a slogan. The book is one artifact inside this, so it
          no longer occupies the only scene on the site. */}
      <Scene>
        <Kicker>Systems · Research · Writing</Kicker>
        <h1 className="display-hero mt-8 max-w-4xl">
          Systems that run on your hardware, and can prove what they did.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
          I build local-first AI systems: agent runtimes that separate what a
          model proposes from what the machine is permitted to do, knowledge
          compilers that keep every claim traceable to its evidence, and creative
          tooling that verifies what it actually rendered instead of trusting an
          exit code.
        </p>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-3">
          The projects look unrelated — a video pipeline, a claim graph, an agent
          stack. They are the same problem in different materials: a system that
          cannot account for itself is not trustworthy, however capable it looks.
        </p>

        <FigureRow>
          <Figure value={String(PROJECTS.length)} label="Systems in the index" />
          <Figure value={String(posts.length)} label="Published articles" />
          <Figure value={String(CONCEPTS.length)} label="Concepts they share" />
          <Figure value={String(BOOK.chapters)} label="Chapters in the book" />
        </FigureRow>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/projects"
            className="label border border-gold px-6 py-4 text-gold transition-colors hover:bg-gold hover:text-void"
          >
            Explore the systems
          </Link>
          <Link
            href="/paths"
            className="label border border-rule-2 px-6 py-4 text-ink-2 transition-colors hover:border-gold hover:text-gold"
          >
            Follow a learning path
          </Link>
        </div>
      </Scene>

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
    </>
  );
}
