import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "The Fleet",
  description:
    "The Sovereign Agent Fleet: one frozen governance substrate, exercised across eight domains, with zero security invariants depending on model behavior.",
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
      "Heterogeneous knowledge compiled into structured, navigable artifacts — organized before the question is asked.",
    icon: "◆",
    systemCount: 7,
  },
  {
    slug: "compile-time-ai",
    name: "Compile-Time AI",
    description:
      "Reasoning done once and compiled into explorable representations, instead of re-derived on every query.",
    icon: "◆",
    systemCount: 3,
  },
  {
    slug: "scientific-knowledge-systems",
    name: "Scientific Knowledge Systems",
    description:
      "Semantic infrastructure for preserving science and accelerating the people who build on it.",
    icon: "◆",
    systemCount: 8,
  },
  {
    slug: "local-first-ai",
    name: "Local-First AI",
    description:
      "Knowledge systems on your own hardware: transparent, inspectable, and nobody else's to revoke.",
    icon: "◆",
    systemCount: 6,
  },
  {
    slug: "cognitive-memory",
    name: "Cognitive Memory",
    description:
      "Persistent structured memory that compounds understanding across sessions instead of resetting it.",
    icon: "◆",
    systemCount: 6,
  },
  {
    slug: "research-automation",
    name: "Research Automation",
    description:
      "Agents that ingest, synthesize, and broadcast — returning human hours to judgment and care.",
    icon: "◆",
    systemCount: 10,
  },
  {
    slug: "knowledge-representation",
    name: "Knowledge Representation",
    description:
      "Making understanding explicit: from intermediate representations to structured publishing.",
    icon: "◆",
    systemCount: 4,
  },
  {
    slug: "decision-graphs",
    name: "Decision Graphs",
    description:
      "Judgment rendered as inspectable graphs — reusable, improvable, teachable.",
    icon: "◆",
    systemCount: 1,
  },
];

const NARRATIVE =
  "Every project here is an experiment in the same direction: probabilistic models are powerful and untrustworthy, so the authority around them must be deterministic, inspectable, and frozen.";

export default function FleetPage() {
  return (
    <div>
      <Container className="pt-24 pb-14">
        <p className="mb-5 font-mono text-xs tracking-[0.28em] text-gold uppercase">
          The Sovereign Agent Fleet
        </p>
        <h1 className="display-lg">
          One substrate.
          <br />
          Eight domains. Zero edits.
        </h1>
        <p className="mt-7 max-w-3xl font-display text-xl leading-snug text-ink md:text-2xl">
          The claim is falsifiable: a single frozen governance substrate runs
          every system below, and no domain has required a substrate edit.
          Show one that does, and the thesis weakens.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">
          {NARRATIVE}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href="/mission"
            className="inline-block border border-rule px-6 py-3 font-mono text-xs tracking-[0.16em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            Read the Mission →
          </Link>
          <Link
            href="/research"
            className="font-mono text-xs tracking-[0.16em] text-gold uppercase hover:underline"
          >
            Explore the Research →
          </Link>
        </div>
      </Container>

      <section className="border-t border-rule">
        <Container className="py-12 md:py-16">
          <div className="mb-10 max-w-2xl">
            <SectionHeading
              kicker="The topology"
              title="Eight domains, one frozen substrate"
              lede="Each domain below is a separate proof attempt. Same decision function, zero edits, zero security invariants that depend on what the model happens to do."
            />
          </div>
          <div className="grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2">
            {FLEET_LAYERS.map((layer, i) => (
              <Reveal key={layer.slug} delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  href={`/fleet/${layer.slug}`}
                  className="group block h-full bg-void p-7 transition-colors hover:bg-void-2"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-lg text-gold">{layer.icon}</span>
                    <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-gold">
                      {layer.name}
                    </h3>
                  </div>
                  <p className="mb-5 leading-relaxed text-ink-2">
                    {layer.description}
                  </p>
                  <p className="font-mono text-[0.65rem] tracking-[0.14em] text-ink-3 uppercase">
                    {layer.systemCount} system
                    {layer.systemCount === 1 ? "" : "s"} · frozen substrate →
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-rule">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading kicker="Where to begin" title="Start with the mission" />
            <p className="mt-6 mb-8 text-ink-2">
              The mission states the thesis. The fleet is the evidence. The
              research log is the record.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/mission"
                className="inline-block border border-rule px-6 py-3 font-mono text-xs tracking-[0.16em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
              >
                The Mission →
              </Link>
              <Link
                href="/research"
                className="font-mono text-xs tracking-[0.16em] text-gold uppercase hover:underline"
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
