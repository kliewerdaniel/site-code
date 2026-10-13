import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SOCIAL } from "@/config";

export const metadata: Metadata = {
  title: "Press Kit — Daniel Kliewer",
  description:
    "Press kit for Daniel Kliewer: bios, downloadable assets, and interview topics on computational sovereignty, local-first AI, and the refusal discipline.",
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

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

const topics = [
  "Computational sovereignty: what changes when you own every layer",
  "Local-first AI as the precondition for trustworthy systems",
  "Deterministic systems: why reproducibility beats vibes",
  "AI in regulated industries: law, healthcare, and the audit trail",
  "The refusal discipline: teaching agents when to say no",
  "Open weights and the economics of owning your models",
];

const assets = [
  {
    title: "Author photo",
    desc: "Headshot for articles, event listings, and promotional materials.",
    href: "/images/profile.jpeg",
    note: "Download photo ↓",
  },
  {
    title: "Book cover",
    desc: "Computational Sovereignty hardcover art for features and reviews.",
    href: "/images/book-cover.png",
    note: "Download cover ↓",
  },
];

export default function PressPage() {
  return (
    <>
      {/* HEAD */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <p className={`${MONO} mb-6 text-[11px] tracking-[0.24em] uppercase text-[#d9a648]`}>
            Press
          </p>
          <h1
            className={`${SERIF} mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#ece7da] md:text-5xl`}
          >
            Press kit
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#a79d87]">
            Resources for podcasts, conferences, and interviews covering one question: what
            happens when you own every layer of your AI stack?
          </p>
        </Container>
      </section>

      {/* BIO */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Bio" title="About Daniel Kliewer" />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-[#a79d87]">
            <p>
              Daniel Kliewer researches how to reduce the cost of understanding human
              knowledge. His work examines knowledge compilation, compile-time AI,
              cognitive memory, and the local-first systems that make knowledge easier to
              preserve, navigate, and share.
            </p>
            <p>
              Rather than treating AI as a generator of more text, his work treats it as
              infrastructure for understanding — systems that organize what we already know
              so more people can learn it, teach it, and build on it. Each project tests a
              specific hypothesis about how knowledge transfers between people.
            </p>
            <p>
              He is the author of the forthcoming{" "}
              <em className="text-[#ece7da]">
                Computational Sovereignty: Building Local-First AI Systems
              </em>{" "}
              and the earlier <em className="text-[#ece7da]">Sovereign AI</em>, and he
              publishes his research openly so the knowledge itself can be shared without
              being consumed.
            </p>
          </div>
        </Container>
      </section>

      {/* ASSETS */}
      <section className="border-b border-[#2c2720] bg-[#1a1712]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Media" title="Downloadable assets" />
          <div className="mt-10 grid gap-px border border-[#2c2720] bg-[#2c2720] sm:grid-cols-2">
            {assets.map((a) => (
              <div key={a.title} className="bg-[#1a1712] p-7">
                <h3 className={`${SERIF} mb-3 text-lg font-medium text-[#ece7da]`}>{a.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#a79d87]">{a.desc}</p>
                <a
                  href={a.href}
                  download
                  className={`${MONO} text-[11px] tracking-[0.16em] uppercase text-[#6fa58b] hover:text-[#d9a648]`}
                >
                  {a.note}
                </a>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* INTERVIEW TOPICS */}
      <section className="border-b border-[#2c2720] bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Interviews" title="Suggested topics" />
          <div className="mt-10 grid gap-px border border-[#2c2720] bg-[#2c2720] sm:grid-cols-2">
            {topics.map((t) => (
              <div key={t} className="flex items-center gap-3 bg-[#14120d] p-5">
                <span className={`${MONO} shrink-0 text-[#6fa58b]`}>→</span>
                <span className="text-sm leading-relaxed text-[#ece7da]">{t}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT */}
      <section className="bg-[#14120d]">
        <Container className="max-w-3xl py-16 md:py-24">
          <SectionHeading kicker="Booking" title="Press contact" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[#a79d87]">
            For interviews, speaking, and press inquiries:{" "}
            <a href={`mailto:${SOCIAL.email}`} className="text-[#6fa58b] hover:text-[#d9a648]">
              {SOCIAL.email}
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
