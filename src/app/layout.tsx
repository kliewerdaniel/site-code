import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SITE, BOOK } from "@/config";
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
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: `${BOOK.title}: ${BOOK.subtitle}`,
    description: BOOK.promise,
    images: [BOOK.coverImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BOOK.title}: ${BOOK.subtitle}`,
    description: BOOK.promise,
    images: [BOOK.coverImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#14120d",
};

// Pre-hydration theme init: default is dark; "light" stored in
// localStorage key "dk-theme" adds the .light class before first paint.
const themeInitScript = `(function(){try{var t=localStorage.getItem("dk-theme");if(t==="light"){document.documentElement.classList.add("light")}}catch(e){}})();`;

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
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <body className="bg-ink text-paper font-sans antialiased min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
