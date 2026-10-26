import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SOCIAL } from "@/config";
import { seo } from "@/lib/seo";

export const metadata = seo({
  title: "Contact — Daniel Kliewer",
  description:
    "Contact Daniel Kliewer: email, X, GitHub, LinkedIn. No contact form — pick the channel that fits.",
  path: "/contact",
});

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
        <h1 className="display-lg mb-5">
          Pick a channel.
        </h1>
        <p className="mb-4 max-w-xl text-base leading-relaxed text-ink-2">
          No contact form. Forms get spammed; email gets read. Business,
          technical questions, and corrections to the book&apos;s numbers are
          all welcome.
        </p>
        <p className="mb-12 max-w-xl text-base leading-relaxed text-ink-2">
          Interviews and review copies go to the same address — it reaches me
          directly, and I read all of it.
        </p>
        <Reveal>
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-void p-7"
              >
                <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase">
                  {l.label}
                </p>
                <p className="font-display text-lg break-all text-ink transition-colors group-hover:text-gold">
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
