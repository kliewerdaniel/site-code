import Link from "next/link";
import { NAV_ITEMS } from "@/config";
import { Logotype } from "@/components/Logotype";

export function SiteHeader() {
  return (
    <header className="border-b border-hairline bg-abyss/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Daniel Kliewer — home">
          <Logotype />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-[0.15em] text-bone-dim uppercase transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/sample"
          className="rounded-sm bg-gold px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-abyss uppercase transition-colors hover:bg-gold-deep"
        >
          Read chapter 1
        </Link>
      </div>
      {/* Mobile nav */}
      <nav
        aria-label="Primary mobile"
        className="border-t border-hairline md:hidden"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-[0.15em] whitespace-nowrap text-bone-dim uppercase transition-colors hover:text-gold"
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
