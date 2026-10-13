// Central launch config — the single source of truth for site identity,
// the book, the old book, social links, and navigation.
// Page components should import from here, never hardcode these values.
// There is no email config: v2 ships with zero email capture anywhere.

export const SITE = {
  name: "Daniel Kliewer",
  url: "https://www.danielkliewer.com",
  description:
    "Daniel Kliewer writes and builds local-first AI systems. Author of Computational Sovereignty: Building Local-First AI Systems.",
} as const;

export const BOOK = {
  title: "Computational Sovereignty",
  subtitle: "Building Local-First AI Systems",
  promise:
    "Run serious AI on hardware you own — full applications, no cloud, no exfiltration.",
  price: "$88", // Hardcover price — decided 2026-10-13. Not a TODO.
  // Live Amazon listing — confirmed 2026-10-13.
  amazonUrl: "https://www.amazon.com/dp/B0HMWFR6G7",
  coverFront: "/images/book-front.png",
  coverSpine: "/images/book-spine.png",
  coverBack: "/images/book-back.png",
  pages: "214",
  format: "Hardcover · 6×9 in",
  chapters: 24,
  words: "~46,000",
} as const;

export const OLD_BOOK = {
  title: "Sovereign AI",
  subtitle: "An Architectural Investigation into Local-First Intelligence",
  format: "Paperback · 72 pages",
  price: "$88",
  amazonUrl: "https://www.amazon.com/dp/B0H6RB7D9J",
} as const;

export const SOCIAL = {
  email: "danielkliewer@gmail.com",
  x: "https://x.com/kliewer_daniel",
  github: "https://github.com/kliewerdaniel",
  linkedin: "https://www.linkedin.com/in/danielkliewer",
} as const;

export const NAV_ITEMS = [
  { label: "Book", href: "/book" },
  { label: "Research", href: "/research" },
  { label: "Sample", href: "/sample" },
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
] as const;

export const SECONDARY_NAV = [
  { label: "Mission", href: "/mission" },
  { label: "Fleet", href: "/fleet" },
  { label: "Whitepaper", href: "/paper" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
