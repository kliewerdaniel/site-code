import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "The Mission",
  description:
    "Intelligence is the accumulated decisions that shaped it. The Sovereign Agent Fleet is the empirical proof: one frozen governance substrate, exercised across many domains, with zero security invariants depending on model behavior.",
};

const sections = [
  {
    id: "the-thesis",
    kicker: "The Thesis",
    heading: "Intelligence is the accumulated decisions that shaped it.",
    body: [
      "Not the model. Not the prompt. Not the dataset on its own. What makes a system intelligent is the accumulation of decisions it has carried forward — the judgments it preserved, reused, and improved instead of rediscovering from scratch each time.",
      "A single conversation is not intelligent. A system that remembers what it decided, why it decided it, and can be held to that decision across domains — that is intelligence. The architecture is the accumulated decisions that shaped it.",
    ],
  },
  {
    id: "the-fleet",
    kicker: "The Empirical Proof",
    heading: "One substrate. Many minds.",
    body: [
      "The Sovereign Agent Fleet is how we test that thesis in practice. We built one frozen governance substrate — fleet.epistemic.decide() — and proved it across eight domains without editing the substrate a single time.",
      "Eight domains. One frozen implementation. Zero security invariants that depend on what the model happens to do. That is the claim, and it is falsifiable: show a domain that requires a substrate edit, and the thesis weakens.",
    ],
  },
  {
    id: "compile-time",
    kicker: "The Mechanism",
    heading: "Compile-time, not query-time",
    body: [
      "Large language models are remarkable at producing answers on demand. But much of today's AI rediscovers the same relationships on every query — re-deriving what was already known, burning time and tokens to reach a conclusion someone reached before.",
      "The Fleet does the reasoning once and compiles it. Knowledge is organized before the question is asked: into decision graphs, semantic artifacts, and a static knowledge graph emitted at build time. The objective is not faster search. It is reducing the cognitive cost of understanding.",
    ],
  },
  {
    id: "the-bottleneck",
    kicker: "Why It Matters",
    heading: "Knowledge is the constraint",
    body: [
      "Every profession depends on knowledge someone else already discovered. Civilization is, in many ways, a system for transferring accumulated knowledge from one generation to the next — and the efficiency of that transfer determines how quickly society progresses.",
      "When knowledge is expensive to acquire, qualified people become scarce; scarcity raises cost; cost limits how many we can employ; and each individual must care for more patients, teach more students, manage more systems. Time becomes the scarce resource.",
      "Reduce the cost of understanding, and you return time to the people who care for other people.",
    ],
  },
  {
    id: "the-choice",
    kicker: "The Choice",
    heading: "Cooperation or conflict",
    body: [
      "Like every powerful technology, AI can be directed toward conflict or toward cooperation. History suggests technological advantage is often centralized and weaponized. That reality is difficult to ignore — especially as AI expands into military application.",
      "But knowledge has a unique property: unlike physical resources, it can be shared without being consumed. If we make human knowledge easier to understand, preserve, and distribute, then every discovery, breakthrough, and advancement becomes more accessible to everyone.",
      "That is why this work is local-first, open, and inspectable. The substrate is frozen so you can audit it. The knowledge graph is compiled so you can read it. Nothing here asks you to trust a model you cannot see.",
    ],
  },
  {
    id: "the-hope",
    kicker: "The Hope",
    heading: "A future worth building",
    body: [
      "My hope is not to build machines that replace human intelligence. It is to build tools that make humanity's collective knowledge easier for every person to understand — and a fleet of agents whose intelligence is the accumulated, inspectable decisions we chose to keep.",
      "That, to me, is a future worth building.",
    ],
  },
];

const invariants = [
  { value: "1", label: "Frozen governance substrate — fleet.epistemic.decide()" },
  { value: "8", label: "Domains proven on the same substrate, zero substrate edits" },
  { value: "0", label: "Security invariants depending on model behavior" },
];

export default function MissionPage() {
  return (
    <article className="bg-ink text-paper">
      <Container className="pt-24 pb-14">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-moss mb-5">
          The Mission
        </p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight max-w-4xl">
          Intelligence is the{" "}
          <span className="text-moss">accumulated decisions</span> that shaped it.
        </h1>
        <p className="text-lg text-paper-dim leading-relaxed max-w-2xl mt-6">
          The Sovereign Agent Fleet is the empirical proof. One frozen governance
          substrate, exercised across many domains — with zero security
          invariants depending on model behavior.
        </p>
      </Container>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="border-t border-hairline">
          <Container className="py-12 md:py-16">
            <div className="max-w-3xl">
              <SectionHeading kicker={section.kicker} title={section.heading} />
              <div className="space-y-5 text-paper-dim leading-relaxed text-lg mt-6">
                {section.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <SectionHeading
            kicker="The Proof, In Numbers"
            title="The Fleet invariants"
          />
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline border border-hairline mt-8">
            {invariants.map((s) => (
              <div key={s.label} className="bg-ink-card p-6 sm:p-8">
                <div className="font-display text-5xl sm:text-6xl leading-none text-paper">
                  {s.value}
                </div>
                <dd className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-paper-dim mt-4 leading-relaxed">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Link
              href="/fleet"
              className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
            >
              Meet the Fleet →
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading kicker="Where To Begin" title="Explore the work" />
            <p className="text-paper-dim mt-6 mb-8">
              The mission is one thread. The Fleet is the proof. The research
              log is the record.
            </p>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <Link
                href="/fleet"
                className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
              >
                Meet the Fleet →
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
    </article>
  );
}
