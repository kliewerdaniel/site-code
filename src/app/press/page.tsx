import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { BOOK, SOCIAL } from "@/config";

export const metadata: Metadata = {
  title: "Press Kit — Daniel Kliewer",
  description:
    "Press kit for Daniel Kliewer: bios, downloadable assets, and interview topics on computational sovereignty, local-first AI, and governed agents.",
  openGraph: {
    title: "Press kit — Daniel Kliewer",
    description:
      "Bios, downloadable assets, and interview topics on computational sovereignty and local-first AI.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Press kit — Daniel Kliewer",
    description:
      "Bios, downloadable assets, and interview topics on computational sovereignty and local-first AI.",
  },
};

const topics = [
  "Pricing the cloud as a liability: what changes when you own every layer",
  "Local-first AI as the precondition for systems you can audit",
  "Deterministic infrastructure around probabilistic models",
  "AI in regulated industries: law, healthcare, and the evidence trail",
  "The refusal discipline: building agents that know when to say no",
  "Open weights and the economics of owning your inference",
];

const assets = [
  {
    title: "Author photo",
    desc: "Portrait of Daniel Kliewer. Free for editorial use with credit.",
    href: "/images/profile.jpeg",
    note: "Download JPEG ↓",
  },
  {
    title: "Book cover — front",
    desc: "Front cover render of the Computational Sovereignty hardcover.",
    href: BOOK.coverFront,
    note: "Download PNG ↓",
  },
  {
    title: "Book cover — spine",
    desc: "Spine render, for shelf and lineup graphics.",
    href: BOOK.coverSpine,
    note: "Download PNG ↓",
  },
  {
    title: "Book cover — back",
    desc: "Back cover render with the full jacket copy.",
    href: BOOK.coverBack,
    note: "Download PNG ↓",
  },
];

export default function PressPage() {
  return (
    <>
      {/* HEAD */}
      <section className="border-b border-hairline">
        <Container className="max-w-3xl py-16 md:py-24">
          <p className="mb-6 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
            Press
          </p>
          <h1 className="mb-5 font-display text-4xl leading-[1.05] font-semibold tracking-[-0.02em] text-bone md:text-5xl">
            Press kit
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-bone-dim">
            Everything below is cleared for editorial use with credit. The
            through-line of every interview: what becomes possible when you
            own every layer of the stack.
          </p>
        </Container>
      </section>

      {/* BIO */}
      <section className="border-b border-hairline">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Bio" title="The two-sentence version" />
          <Reveal>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-bone-dim">
              <p>
                Daniel Kliewer is an AI developer in Austin, Texas, who builds
                systems that run on hardware he owns — models, retrieval,
                knowledge graphs, and governed agents, each measured and
                reproducible.
              </p>
              <p>
                He is the author of{" "}
                <em className="text-bone">
                  Computational Sovereignty: Building Local-First AI Systems
                </em>{" "}
                (hardcover, 214 pages, {BOOK.price}), the earlier{" "}
                <em className="text-bone">Sovereign AI</em>, and 184 open
                research posts documenting the work as it happened.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-10 border border-hairline bg-navy p-7">
              <p className="mb-3 font-mono text-[11px] tracking-[0.24em] text-gold uppercase">
                The longer version
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-bone-dim">
                <p>
                  Kliewer&apos;s work starts from a single priced claim: cloud
                  AI is a liability — data exfiltration by design, silent model
                  changes, lock-in through API surface, cost curves that
                  punish success, availability as someone else&apos;s decision.
                  The alternative he builds is local-first: open weights on
                  owned hardware, retrieval evaluated against frozen gold
                  sets, knowledge compiled into graphs ahead of query time,
                  and agents governed by deterministic substrates that treat
                  model cognition as untrusted.
                </p>
                <p>
                  His projects include SpecGen (deterministic code
                  generation), Ganymede (governed claim compilation), and the
                  Sovereign Agent Fleet — one frozen governance substrate
                  exercised across eight domains, with 564 tests and zero
                  security invariants depending on model behavior. He publishes
                  the code, the measurements, and the dead ends.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ASSETS */}
      <section className="border-b border-hairline bg-navy-deep">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Media" title="Downloadable assets" />
          <div className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {assets.map((a) => (
              <div key={a.title} className="bg-navy-deep p-7">
                <h3 className="mb-3 font-display text-lg font-medium text-bone">
                  {a.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-bone-dim">
                  {a.desc}
                </p>
                <a
                  href={a.href}
                  download
                  className="font-mono text-[11px] tracking-[0.16em] text-gold uppercase transition-colors hover:text-bone"
                >
                  {a.note}
                </a>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* INTERVIEW TOPICS */}
      <section className="border-b border-hairline">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Interviews" title="Suggested topics" />
          <div className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {topics.map((t) => (
              <div key={t} className="flex items-center gap-3 bg-abyss p-5">
                <span className="shrink-0 font-mono text-gold">→</span>
                <span className="text-sm leading-relaxed text-bone">{t}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT */}
      <section>
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Booking" title="Press contact" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-bone-dim">
            Interviews, speaking, review copies:{" "}
            <a
              href={`mailto:${SOCIAL.email}`}
              className="text-gold transition-colors hover:text-bone"
            >
              {SOCIAL.email}
            </a>
            . One request: read chapter 1 first. It&apos;s free, ungated, and
            it will make the conversation better.
          </p>
        </Container>
      </section>
    </>
  );
}
