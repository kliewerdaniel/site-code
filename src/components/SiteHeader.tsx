"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/config";
import { Logotype } from "@/components/Logotype";

/* v3 chrome: transparent over the SCENE, then a hairline + void blur once
   the page moves. No background box at rest — the object should sit in the
   dark room, not in a container.

   Breakpoints: the full desktop row (wordmark + seven links + CTA) needs
   ~1000px. Measured, it overflows at 768px (scrollWidth 952 against a 768
   viewport, with the CTA crushed to 36px). So the desktop row is `lg` and
   up, and below that the primary nav collapses into a hamburger.

   Mobile: the hamburger opens a dropdown panel in flow, not a sheet. It
   pushes the page down while open and never covers the hero. It closes on
   navigation, Escape, outside click, or a resize to desktop. The book CTA
   lives at the bottom of the panel, because the header row cannot fit the
   wordmark, the CTA and a 44px target below ~640px.

   Hydration contract: the server cannot know scroll position, so the first
   client render MUST match the server's (unscrolled). State starts false
   and is corrected in an effect after mount. Reading scrollY during render
   would reintroduce the mismatch fixed in HeroBook/Reveal — see
   references/hydration-mismatch.md. */

const DESKTOP_MIN = 1024;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_MIN) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-[100] border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || open ? "glass-strong" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          aria-label="Daniel Kliewer — home"
          className="flex-shrink-0 text-ink transition-colors hover:text-gold"
        >
          <Logotype />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:gap-8 lg:flex">
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

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="hidden flex-shrink-0 rounded-sm bg-gold px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-void uppercase whitespace-nowrap transition-colors hover:bg-gold-2 lg:inline-flex"
          >
            Get the book
          </Link>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-gold lg:hidden"
          >
            <span
              className="relative flex h-4 w-5 flex-col justify-between"
              aria-hidden="true"
            >
              <span
                className={`h-px w-5 bg-current transition-transform duration-200 ${
                  open ? "translate-y-[7.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-5 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-px w-5 bg-current transition-transform duration-200 ${
                  open ? "-translate-y-[7.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu. In flow: it pushes the page down while open. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`border-t border-rule lg:hidden ${open ? "" : "hidden"}`}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6">
          <ul className="py-2">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.href}
                className="border-b border-rule last:border-b-0"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="label flex min-h-[52px] items-center text-ink transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="py-5">
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-4 font-mono text-[12px] font-semibold tracking-[0.14em] text-void uppercase transition-colors hover:bg-gold-2"
            >
              Get the book
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
