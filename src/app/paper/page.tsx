import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Sovereign Knowledge Systems — Research Whitepaper",
  description:
    "An architecture for governed agentic computation in which probabilistic model cognition is treated as an untrusted epistemic component, while authorization, execution, verification, and evidence are independently governed computational boundaries.",
};

const ABSTRACT = `We present an architecture for governed agentic computation in which probabilistic model cognition is deliberately treated as an untrusted epistemic component, while authorization, execution, verification, and evidence are implemented as independently governed computational boundaries. The architecture is organized around a single research object — an explicitly ordered trust-transition sequence (knowledge → compilation → retrieval → cognition → proposal → authorization → execution → verification → evidence) — and a formal principle, the Authority Non-Equivalence Principle: no probabilistic inference, regardless of confidence, capability, or semantic plausibility, constitutes authorization to perform a consequential operation. We state five architectural invariants and we formalize the distinction between three types of correctness the architecture separates — epistemic, authority, execution — none of which implies the others. The architecture is implemented and demonstrated across two cooperating codebases: A10 (the epistemic substrate: a knowledge compiler producing a versioned graph and search index behind a fail-closed gate) and Sovereign Agent Fleet (the authority and execution substrate: a frozen deterministic authorization function, cryptographic identity, human approval, bounded execution, and a tamper-evident audit ledger). We evaluate the architecture against its own invariants using its test suite as the benchmark (564 executable tests in the governance substrate, all passing; 18 fail-closed compiler-gate tests) and report the results, classified by adversarial condition. We add one genuinely blind adversary evaluation — a threat-model-agnostic fuzzing harness over the authorization boundary — and report its result: zero false authorizations across 5,000 randomized attack vectors. We organize the evaluation around four explicit research questions (RQ1–RQ4) and a structural baseline (direct tool-invoking agent versus governed architecture), specifying conditions, failure criteria, counts, and reproducibility. We claim precisely what the evidence constrains — that the authority available to probabilistic cognition is independently verifiable — and we close by stating the open problem, knowledge poisoning, exactly, as a case in which a perfectly authorized, perfectly executed action can still be wrong.`;

const KEYWORDS = [
  "agent governance",
  "knowledge compilation",
  "GraphRAG",
  "capability security",
  "formal verification",
  "verifiable execution",
  "threat model",
  "computational sovereignty",
  "authority separation",
  "adversarial evaluation",
];

const PRINCIPLES = [
  {
    name: "Authority Non-Equivalence Principle",
    text: "No probabilistic inference, regardless of confidence, capability, or semantic plausibility, constitutes authorization to perform a consequential operation.",
  },
  {
    name: "Trust-transition sequence",
    text: "Knowledge → compilation → retrieval → cognition → proposal → authorization → execution → verification → evidence — an explicitly ordered sequence of governance boundaries.",
  },
  {
    name: "Three correctnesses, separated",
    text: "Epistemic, authority, and execution correctness are formalized as distinct properties — none of which implies the others.",
  },
];

export default function PaperPage() {
  return (
    <article className="bg-ink text-paper">
      <Container className="pt-24 pb-14">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-moss mb-5">
          Research Whitepaper · v3.6 · August 2026
        </p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.05] max-w-4xl">
          Sovereign Knowledge Systems: Separating Probabilistic Cognition from
          Consequential Authority
        </h1>
        <div className="flex items-center gap-3 mt-8">
          <div className="w-10 h-10 bg-moss flex items-center justify-center">
            <span className="text-ink text-sm font-medium">DK</span>
          </div>
          <div>
            <p className="text-sm font-medium text-paper">Daniel Kliewer</p>
            <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-paper-dim">
              Author
            </p>
          </div>
        </div>
      </Container>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <SectionHeading kicker="Abstract" title="What the paper establishes" />
            <p className="text-paper-dim leading-relaxed text-lg mt-6">
              {ABSTRACT}
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <SectionHeading
              kicker="Core Contributions"
              title="The principles, stated plainly"
            />
            <div className="mt-8 space-y-px bg-hairline border border-hairline">
              {PRINCIPLES.map((p) => (
                <div key={p.name} className="bg-ink-card p-7">
                  <h3 className="font-display text-xl text-paper mb-3">{p.name}</h3>
                  <p className="text-paper-dim leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <SectionHeading kicker="Evaluation" title="Measured, not asserted" />
            <ul className="mt-8 space-y-4 text-paper-dim leading-relaxed">
              <li className="border-l-2 border-moss pl-5">
                564 executable tests in the governance substrate — all passing —
                plus 18 fail-closed compiler-gate tests, used as the benchmark.
              </li>
              <li className="border-l-2 border-moss pl-5">
                One genuinely blind adversary evaluation: a threat-model-agnostic
                fuzzing harness over the authorization boundary — zero false
                authorizations across 5,000 randomized attack vectors.
              </li>
              <li className="border-l-2 border-moss pl-5">
                Evaluation organized around four explicit research questions
                (RQ1–RQ4) and a structural baseline: direct tool-invoking agent
                versus governed architecture.
              </li>
              <li className="border-l-2 border-amber pl-5">
                The open problem, stated exactly: knowledge poisoning — a case in
                which a perfectly authorized, perfectly executed action can still
                be wrong.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <SectionHeading kicker="Keywords" title="Filed under" />
            <div className="flex flex-wrap gap-2 mt-6">
              {KEYWORDS.map((k) => (
                <span
                  key={k}
                  className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-paper-dim border border-hairline px-3 py-1.5"
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="mt-10 border border-hairline bg-ink-card p-7">
              <h3 className="font-display text-2xl text-paper mb-3">
                Full paper available on request
              </h3>
              <p className="text-paper-dim leading-relaxed mb-6">
                The complete whitepaper (v3.6, August 2026) is available as a
                PDF on request. Reach out and I&apos;ll send it over.
              </p>
              <Link
                href="/contact"
                className="inline-block border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper hover:border-moss hover:text-moss transition-colors"
              >
                Request the paper →
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 items-center">
              <Link
                href="/fleet"
                className="font-mono text-xs uppercase tracking-[0.16em] text-moss hover:underline"
              >
                ← The Fleet
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
