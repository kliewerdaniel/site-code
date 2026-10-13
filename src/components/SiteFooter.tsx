import Link from "next/link";
import { OLD_BOOK, SECONDARY_NAV, SOCIAL } from "@/config";
import Container from "@/components/Container";
import { SovereignMark } from "@/components/Logotype";

/* v3 footer: an instrument readout, not a link farm.
   Every link that existed in v2 is still here — this is a navigation
   surface, so nothing may be dropped for looks. */

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-void">
      <Container className="py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex items-start gap-4">
            <SovereignMark size={44} />
            <div>
              <p className="label text-ink">Daniel Kliewer</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
                Local-first AI systems. Measured, reproducible, owned.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-label="Secondary">
              <p className="label mb-4">More</p>
              <ul className="flex flex-col gap-2">
                {SECONDARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="label transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Elsewhere">
              <p className="label mb-4">Elsewhere</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href={SOCIAL.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label transition-colors hover:text-gold"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={SOCIAL.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label transition-colors hover:text-gold"
                  >
                    X
                  </a>
                </li>
                <li>
                  <a
                    href={SOCIAL.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label transition-colors hover:text-gold"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SOCIAL.email}`}
                    className="label transition-colors hover:text-gold"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-rule pt-8 md:flex-row md:items-center">
          <p className="text-sm text-ink-2">
            Also by Daniel Kliewer:{" "}
            <a
              href={OLD_BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold"
            >
              {OLD_BOOK.title} (paperback) →
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/feed.xml"
              className="label transition-colors hover:text-gold"
            >
              RSS
            </Link>
            <p className="label">© 2026 Daniel Kliewer</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default SiteFooter;
