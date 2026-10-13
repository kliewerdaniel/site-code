import Link from "next/link";
import { OLD_BOOK, SECONDARY_NAV } from "@/config";
import Container from "@/components/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline mt-24">
      <Container className="py-12">
        <nav aria-label="Secondary" className="flex flex-wrap gap-x-7 gap-y-3 mb-10">
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-[0.15em] uppercase text-paper-dim hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-hairline pt-8">
          <p className="text-sm text-paper-dim">
            Also by Daniel Kliewer:{" "}
            <a
              href={OLD_BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper underline decoration-moss/40 underline-offset-4 hover:decoration-moss"
            >
              {OLD_BOOK.title} (paperback) →
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/feed.xml"
              className="font-mono text-xs text-paper-dim hover:text-paper transition-colors"
            >
              RSS
            </Link>
            <p className="font-mono text-xs text-paper-dim">
              © 2026 Daniel Kliewer
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}


export default SiteFooter;
