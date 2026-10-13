import Link from "next/link";
import { SITE, NAV_ITEMS } from "@/config";
import ThemeToggle from "@/components/ThemeToggle";
import Container from "@/components/Container";

export function SiteHeader() {
  return (
    <header className="border-b border-hairline">
      <Container className="flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-[0.25em] text-paper hover:text-moss transition-colors"
        >
          DANIEL KLIEWER
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-[0.15em] uppercase text-paper-dim hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/sample"
            className="rounded-md bg-moss text-ink px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] uppercase hover:bg-moss-deep transition-colors"
          >
            Get the sample
          </Link>
        </div>
      </Container>
      {/* Mobile nav */}
      <nav
        aria-label="Primary mobile"
        className="md:hidden border-t border-hairline"
      >
        <Container className="flex items-center gap-6 py-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-[0.15em] uppercase text-paper-dim hover:text-paper transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </nav>
    </header>
  );
}


export default SiteHeader;
