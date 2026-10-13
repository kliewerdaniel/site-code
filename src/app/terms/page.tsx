import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for danielkliewer.com and the Sovereign AI project.",
};

const sections = [
  {
    heading: "Site Content",
    body: [
      "The content on this site — blog posts, project descriptions, and code examples — is provided for informational purposes. Everything I write reflects my own experience and opinions. Your results will vary.",
    ],
  },
  {
    heading: "The Book",
    body: [
      <>
        <em>Sovereign AI: An Architectural Investigation into Local-First
        Intelligence</em> is sold through Amazon. The content is provided
        as-is. I am not responsible for issues arising from following the
        instructions in the book. Use your judgment.
      </>,
    ],
  },
  {
    heading: "Open Source Projects",
    body: [
      "The code linked from this site is open source and available on GitHub. Each project has its own license. Use them at your own risk. I provide no warranty or support guarantee.",
    ],
  },
  {
    heading: "No Professional Advice",
    body: [
      "Nothing on this site constitutes legal, financial, or professional advice. I am a software engineer, not a lawyer. Consult appropriate professionals for decisions that matter.",
    ],
  },
  {
    heading: "Links",
    body: [
      "This site links to third-party services. I have no control over their content or practices. Access them at your own discretion.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "I may update these terms at any time. The \u201CLast updated\u201D date at the top reflects the most recent revision.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="bg-ink text-paper">
      <Container className="pt-24 pb-16">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-moss mb-5">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
            Terms of Use
          </h1>
          <p className="font-mono text-xs text-paper-dim mb-12">
            Last updated: June 2026
          </p>

          <div className="space-y-px bg-hairline border border-hairline">
            {sections.map((s) => (
              <div key={s.heading} className="bg-ink-card p-7">
                <SectionHeading kicker="Terms" title={s.heading} />
                <div className="space-y-4 text-paper-dim leading-relaxed mt-4">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
