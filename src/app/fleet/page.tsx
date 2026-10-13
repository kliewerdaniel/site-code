import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "The Fleet",
  description:
    "The Sovereign Agent Fleet: one frozen governance substrate, exercised across eight domains, with zero security invariants depending on model behavior. Intelligence is the accumulated decisions that shaped it.",
};

export interface FleetLayer {
  slug: string;
  name: string;
  description: string;
  icon: string;
  systemCount: number;
}

export const FLEET_LAYERS: FleetLayer[] = [
  {
    slug: "knowledge-compilation",
    name: "Knowledge Compilation",
    description:
      "Transforming heterogeneous human knowledge into structured, navigable semantic artifacts — organized before the question is asked.",
    icon: "◆",
    systemCount: 7,
  },
  {
    slug: "compile-time-ai",
    name: "Compile-Time AI",
    description:
      "Performing reasoning once and compiling it into representations people can explore, instead of rediscovering relationships on every query. An active, recent direction of the research.",
    icon: "◆",
    systemCount: 3,
  },
  {
    slug: "scientific-knowledge-systems",
    name: "Scientific Knowledge Systems",
    description:
      "Semantic infrastructure for preserving scientific knowledge and accelerating discovery — making research easier to build upon.",
    icon: "◆",
    systemCount: 8,
  },
  {
    slug: "local-first-ai",
    name: "Local-First AI",
    description:
      "Knowledge systems that run on your own hardware — transparent, inspectable, and under the user's control rather than a third party's cloud.",
    icon: "◆",
    systemCount: 6,
  },
  {
    slug: "cognitive-memory",
    name: "Cognitive Memory",
    description:
      "Persistent, structured memory that compounds understanding across sessions instead of forgetting it between conversations.",
    icon: "◆",
    systemCount: 6,
  },
  {
    slug: "research-automation",
    name: "Research Automation",
    description:
      "Autonomous and semi-autonomous agents that ingest, synthesize, and broadcast knowledge — returning time to human discovery and care.",
    icon: "◆",
    systemCount: 10,
  },
  {
    slug: "knowledge-representation",
    name: "Knowledge Representation",
    description:
      "How understanding is modeled and made explicit — from intermediate representations to structured publishing of what we know.",
    icon: "◆",
    systemCount: 4,
  },
  {
    slug: "decision-graphs",
    name: "Decision Graphs",
    description:
      "Explicit representations of judgment that make reasoning inspectable, reusable, and improvable over time.",
    icon: "◆",
    systemCount: 1,
  },
];

const NARRATIVE =
  "None of these projects is the destination. Each is a different approach toward the same goal — making human knowledge cheaper to understand, preserve, and share.";

export default function FleetPage() {
  return (
    <div className="bg-ink text-paper">
      <Container className="pt-24 pb-14">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-moss mb-5">
          The Sovereign Agent Fleet
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
          One substrate.
          <br />
          Many minds.
        </h1>
        <p className="font-display text-xl md:text-2xl text-paper leading-snug max-w-3xl mt-7">
          Intelligence is the accumulated decisions that shaped it. The Fleet is
          the empirical proof: a single frozen governance substrate, exercised
          across eight domains, with zero security invariants depending on
          model behavior.
        </p>
        <p className="text-paper-dim max-w-2xl leading-relaxed mt-4">{NARRATIVE}</p>
        <div className="flex flex-wrap gap-6 mt-8 items-center">
          <Link
            href="/mission"
            className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
          >
            Read the Mission →
          </Link>
          <Link
            href="/research"
            className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline"
          >
            Explore the Research →
          </Link>
        </div>
      </Container>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-2xl mb-10">
            <SectionHeading
              kicker="Topology"
              title="Many domains, one substrate"
              lede="Every domain below runs on the same frozen decision substrate. Proving a new domain requires zero edits to that substrate — that is the whole point."
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-2xl mb-10">
            <SectionHeading
              kicker="Fleet Domains"
              title="Proven against the substrate"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
            {FLEET_LAYERS.map((layer) => (
              <Link
                key={layer.slug}
                href={`/fleet/${layer.slug}`}
                className="bg-ink-card p-7 hover:bg-ink-soft transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-moss text-lg">{layer.icon}</span>
                  <h3 className="font-display text-2xl text-paper group-hover:text-moss transition-colors">
                    {layer.name}
                  </h3>
                </div>
                <p className="text-paper-dim leading-relaxed mb-5">
                  {layer.description}
                </p>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper-dim">
                  {layer.systemCount} system{layer.systemCount === 1 ? "" : "s"} ·
                  running on the frozen substrate →
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading kicker="Where to begin" title="Start with the mission" />
            <p className="text-paper-dim mt-6 mb-8">
              Start with the mission, or dive into the compiled research log.
            </p>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <Link
                href="/mission"
                className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
              >
                The Mission →
              </Link>
              <Link
                href="/research"
                className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline"
              >
                Browse the research log →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
