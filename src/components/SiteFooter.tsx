import Link from "next/link";
import { OLD_BOOK, SECONDARY_NAV } from "@/config";
import Container from "@/components/Container";
import { SovereignMark } from "@/components/Logotype";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-navy-deep">
      <Container className="py-12">
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <SovereignMark size={44} />
            <div>
              <p className="font-mono text-sm font-semibold tracking-[0.28em] text-bone">
                DANIEL&nbsp;KLIEWER
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-bone-dim">
                Local-first AI systems. Measured, reproducible, owned.
              </p>
            </div>
          </div>
          <nav
            aria-label="Secondary"
            className="flex flex-wrap gap-x-7 gap-y-3"
          >
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-xs tracking-[0.15em] text-bone-dim uppercase transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-hairline pt-8 md:flex-row md:items-center">
          <p className="text-sm text-bone-dim">
            Also by Daniel Kliewer:{" "}
            <a
              href={OLD_BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bone underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
            >
              {OLD_BOOK.title} (paperback) →
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/feed.xml"
              className="font-mono text-xs text-bone-dim transition-colors hover:text-gold"
            >
              RSS
            </Link>
            <p className="font-mono text-xs text-bone-dim">© 2026 Daniel Kliewer</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default SiteFooter;
