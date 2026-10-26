"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/config";
import { Logotype } from "@/components/Logotype";

/* v3 chrome: transparent over the SCENE, then a hairline + void blur once
   the page moves. No background box at rest — the object should sit in the
   dark room, not in a container.

   Hydration contract: the server cannot know scroll position, so the first
   client render MUST match the server's (unscrolled). State starts false
   and is corrected in an effect after mount. Reading scrollY during render
   would reintroduce the mismatch fixed in HeroBook/Reveal — see
   references/hydration-mismatch.md. */

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled ? "glass-strong" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          aria-label="Daniel Kliewer — home"
          className="text-ink transition-colors hover:text-gold"
        >
          <Logotype />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label text-ink transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/book"
          className="rounded-sm bg-gold px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-void uppercase transition-colors hover:bg-gold-2"
        >
          The book
        </Link>
      </div>
      {/* Mobile nav */}
      <nav
        aria-label="Primary mobile"
        className={`md:hidden ${scrolled ? "border-t border-rule" : "border-t border-transparent"}`}
      >
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 overflow-x-auto px-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              /* py-2 raises the tappable box from 17px to ~33px. Measured in a
                 390px viewport: the label alone was below the 24px minimum
                 target size, and this row is the only navigation on a phone. */
              className="label inline-flex min-h-[44px] items-center whitespace-nowrap py-2 text-ink transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
