import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SITE, BOOK } from "@/config";
import {
  DEFAULT_OG_IMAGE,
  FEED_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${BOOK.title}: ${BOOK.subtitle} — ${SITE.name}`,
    template: "%s — Daniel Kliewer",
  },
  description: SITE.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: `${BOOK.title}: ${BOOK.subtitle}`,
    description: BOOK.promise,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${BOOK.title}: ${BOOK.subtitle} — ${SITE.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BOOK.title}: ${BOOK.subtitle}`,
    description: BOOK.promise,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    types: { "application/rss+xml": FEED_URL },
  },
};

export const viewport: Viewport = {
  themeColor: "#01040a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain flex min-h-screen flex-col bg-void font-sans text-ink antialiased">
        {/* Skip link: the first focusable element on the page, so keyboard and
            screen-reader users are not forced through the 76px header and both
            nav bars before reaching content. Visually hidden until focused;
            `not-sr-only` on :focus puts it back into the flow as a gold-on-void
            chip that matches the site's tokens. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:rounded-sm focus:border focus:border-gold focus:bg-void focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:tracking-[0.16em] focus:text-gold focus:uppercase focus:outline-none"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="relative flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
