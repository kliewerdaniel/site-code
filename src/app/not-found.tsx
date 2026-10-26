import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Kicker } from "@/components/Archetypes";

/* Branded 404. Next's default page returns a correct 404 status but is
   unstyled and offers no way back. This one keeps the site's voice and links
   the four places a lost reader most likely wanted. `robots: { index: false }`
   so the not-found shell is never itself indexed. */
export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist. Try the research archive, the projects index, or the book.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="border-b border-rule bg-void">
      <Container className="py-24 md:py-32">
        <div className="max-w-2xl">
          <Kicker>404</Kicker>
          <h1 className="display-lg mt-5">That page isn&rsquo;t here.</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-2">
            The link may be old, or the page may have moved. These are the four
            places it most likely lives now.
          </p>

          <div className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {[
              { href: "/research", title: "Research archive", note: "Every essay and experiment." },
              { href: "/projects", title: "Projects", note: "The systems, and the problem each answers." },
              { href: "/book", title: "The book", note: "Computational Sovereignty." },
              { href: "/concepts", title: "Concepts", note: "The ideas the work shares." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-void p-7 transition-colors hover:bg-void-2"
              >
                <span className="display-md block transition-colors group-hover:text-gold">
                  {item.title}
                </span>
                <span className="mt-2 block text-ink-2">{item.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
