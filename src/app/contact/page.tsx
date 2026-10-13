import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SOCIAL } from "@/config";

export const metadata: Metadata = {
  title: "Contact — Daniel Kliewer",
  description:
    "Contact Daniel Kliewer: email, X, GitHub, LinkedIn. For press inquiries, use the press kit.",
  openGraph: {
    title: "Contact — Daniel Kliewer",
    description: "Email, X, GitHub, LinkedIn. For press, use the press kit.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact — Daniel Kliewer",
    description: "Email, X, GitHub, LinkedIn. For press, use the press kit.",
  },
};

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

const links = [
  { label: "Email", href: `mailto:${SOCIAL.email}`, display: SOCIAL.email },
  { label: "X", href: SOCIAL.x, display: "@kliewer_daniel" },
  { label: "GitHub", href: SOCIAL.github, display: "github.com/kliewerdaniel" },
  { label: "LinkedIn", href: SOCIAL.linkedin, display: "Daniel Kliewer" },
];

export default function ContactPage() {
  return (
    <section className="bg-[#14120d]">
      <Container className="max-w-3xl py-20 md:py-28">
        <p className={`${MONO} mb-6 text-[11px] tracking-[0.24em] uppercase text-[#d9a648]`}>
          Contact
        </p>
        <h1
          className={`${SERIF} mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#ece7da] md:text-5xl`}
        >
          Get in touch
        </h1>
        <p className="mb-4 max-w-xl text-base leading-relaxed text-[#a79d87]">
          No contact form — forms get spammed and the email gets read. Pick whichever
          channel fits.
        </p>
        <p className="mb-12 max-w-xl text-base leading-relaxed text-[#a79d87]">
          For press, use the{" "}
          <a href="/press" className="text-[#6fa58b] hover:text-[#d9a648]">
            press kit
          </a>
          .
        </p>
        <div className="grid gap-px border border-[#2c2720] bg-[#2c2720] sm:grid-cols-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group bg-[#14120d] p-7"
            >
              <p className={`${MONO} mb-2 text-[11px] tracking-[0.2em] uppercase text-[#a79d87]`}>
                {l.label}
              </p>
              <p className={`${SERIF} text-lg text-[#ece7da] transition-colors group-hover:text-[#d9a648]`}>
                {l.display} <span className={MONO}>↗</span>
              </p>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
