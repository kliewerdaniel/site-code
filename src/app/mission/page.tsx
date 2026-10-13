import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "The Mission",
  description:
    "Intelligence is the accumulated decisions that shaped it. The Sovereign Agent Fleet is the empirical proof: one frozen governance substrate, eight domains, zero security invariants depending on model behavior.",
};

const sections = [
  {
    id: "the-observation",
    kicker: "The Observation",
    heading: "Intelligence is the accumulated decisions that shaped it.",
    body: [
      "Not the model weights. Not the prompt. Not the dataset. What makes a system intelligent is the decisions it carried forward — the judgments it kept, reused, and refined instead of rediscovering from nothing on every run.",
      "A single clever answer is not intelligence. A system that remembers what it decided, why, and can be held to that decision across domains — that is the thing worth building.",
    ],
  },
  {
    id: "the-experiment",
    kicker: "The Experiment",
    heading: "One substrate, eight domains, zero edits.",
    body: [
      "The Sovereign Agent Fleet is the thesis under test. We froze one governance substrate — a deterministic decision function — and exercised it across eight domains without touching it.",
      "The claim is deliberately falsifiable: produce a domain that requires a substrate edit and the thesis weakens. So far, eight domains, zero edits.",
    ],
  },
  {
    id: "the-constraint",
    kicker: "The Constraint",
    heading: "Nothing security-critical may depend on the model.",
    body: [
      "Models are probabilistic: powerful, fluent, and untrustworthy by construction. They hallucinate, they drift, they get quietly re-versioned underneath you.",
      "So the architecture draws the line in the right place: cognition proposes, deterministic machinery disposes. Authorization, execution, verification, and evidence are governed boundaries — none of them may depend on what the model happens to do.",
    ],
  },
  {
    id: "the-wager",
    kicker: "The Wager",
    heading: "Knowledge shared is knowledge multiplied.",
    body: [
      "Unlike physical resources, knowledge can be shared without being consumed. Making it cheaper to understand — easier to learn, easier to preserve, easier to verify — returns time to the people who care for other people.",
      "That is why the work is local-first, open, and inspectable. The substrate is frozen so you can audit it. The graphs are compiled so you can read them. Nothing here asks you to trust what you cannot see.",
    ],
  },
];

const invariants = [
  { value: "1", label: "Frozen governance substrate" },
  { value: "8", label: "Domains proven, zero substrate edits" },
  { value: "0", label: "Security invariants depending on model behavior" },
];

export default function MissionPage() {
  return (
    <article>
      <Container className="pt-24 pb-14">
        <p className="mb-5 font-mono text-xs tracking-[0.28em] text-gold uppercase">
          The Mission
        </p>
        <h1 className="max-w-4xl font-display text-4xl leading-[1.02] tracking-tight text-bone md:text-5xl lg:text-6xl">
          Intelligence is the{" "}
          <span className="text-gold">accumulated decisions</span> that shaped
          it.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-dim">
          The Sovereign Agent Fleet is the empirical proof. One frozen
          governance substrate, exercised across eight domains — with zero
          security invariants depending on model behavior.
        </p>
      </Container>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="border-t border-hairline">
          <Container className="py-12 md:py-16">
            <div className="max-w-3xl">
              <SectionHeading kicker={section.kicker} title={section.heading} />
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-bone-dim">
                {section.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-hairline bg-navy-deep">
        <Container className="py-12 md:py-16">
          <SectionHeading
            kicker="The proof, in numbers"
            title="The Fleet invariants"
          />
          <dl className="mt-8 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {invariants.map((s) => (
              <div key={s.label} className="bg-navy-deep p-6 sm:p-8">
                <div className="font-display text-5xl leading-none text-bone sm:text-6xl">
                  {s.value}
                </div>
                <dd className="mt-4 font-mono text-[0.65rem] leading-relaxed tracking-[0.14em] text-bone-dim uppercase">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Link
              href="/fleet"
              className="inline-block border border-hairline px-6 py-3 font-mono text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Meet the Fleet →
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading kicker="Where to begin" title="Explore the work" />
            <p className="mt-6 mb-8 text-bone-dim">
              The mission is one thread. The Fleet is the proof. The research
              log is the record.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/fleet"
                className="inline-block border border-hairline px-6 py-3 font-mono text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Meet the Fleet →
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
    </article>
  );
}
