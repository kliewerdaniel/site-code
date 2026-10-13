import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SOCIAL } from "@/config";

export const metadata: Metadata = {
  title: "Contact — Daniel Kliewer",
  description:
    "Contact Daniel Kliewer: email, X, GitHub, LinkedIn. No contact form — pick the channel that fits.",
};

const links = [
  {
    label: "Email",
    display: SOCIAL.email,
    href: `mailto:${SOCIAL.email}`,
  },
  {
    label: "X",
    display: "@kliewer_daniel",
    href: SOCIAL.x,
  },
  {
    label: "GitHub",
    display: "kliewerdaniel",
    href: SOCIAL.github,
  },
  {
    label: "LinkedIn",
    display: "danielkliewer",
    href: SOCIAL.linkedin,
  },
];

export default function ContactPage() {
  return (
    <section>
      <Container className="max-w-3xl py-20 md:py-28">
        <p className="mb-6 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
          Contact
        </p>
        <h1 className="mb-5 font-display text-4xl leading-[1.05] font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          Pick a channel.
        </h1>
        <p className="mb-4 max-w-xl text-base leading-relaxed text-bone-dim">
          No contact form. Forms get spammed; email gets read. Business,
          technical questions, and corrections to the book&apos;s numbers are
          all welcome.
        </p>
        <p className="mb-12 max-w-xl text-base leading-relaxed text-bone-dim">
          Press goes through the{" "}
          <a href="/press" className="text-gold transition-colors hover:text-bone">
            press kit
          </a>
          .
        </p>
        <Reveal>
          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-abyss p-7"
              >
                <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-bone-faint uppercase">
                  {l.label}
                </p>
                <p className="font-display text-lg break-all text-bone transition-colors group-hover:text-gold">
                  {l.display}{" "}
                  <span className="font-mono text-sm">↗</span>
                </p>
              </a>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
