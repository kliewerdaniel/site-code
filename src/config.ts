// Central launch config — the single source of truth for site identity,
// the book, the old book, email, social links, and navigation.
// Page components should import from here, never hardcode these values.

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
  price: "$39.99", // TODO(Daniel): confirm at launch
  amazonUrl: "#", // TODO(Daniel): paste live Amazon URL at launch
  coverImage: "/images/book-cover.png",
  pages: "214",
  format: "Hardcover, 6×9",
} as const;

export const OLD_BOOK = {
  title: "Sovereign AI",
  subtitle: "An Architectural Investigation into Local-First Intelligence",
  format: "Paperback · 72 pages",
  price: "$88",
  amazonUrl: "https://www.amazon.com/dp/B0H6RB7D9J",
} as const;

export const EMAIL = {
  // TODO(Daniel): paste Buttondown form endpoint at launch.
  // While this starts with "#", <EmailCapture/> renders a disabled placeholder.
  buttondownEndpoint: "#",
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
