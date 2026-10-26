import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { seo } from "@/lib/seo";

export const metadata = seo({
  title: "Privacy Policy",
  description:
    "Privacy policy for danielkliewer.com and the Sovereign AI project.",
  path: "/privacy",
});

const sections = [
  {
    heading: "What This Site Collects",
    body: [
      "This site uses Vercel Analytics to measure basic traffic and performance. Vercel Analytics is privacy-first — it does not use cookies, does not track users across sites, and collects only anonymized, aggregated data.",
      "No other analytics load, and there is no consent banner. Nothing here asks permission to track you, because nothing here tracks you beyond the aggregate numbers above.",
      "No personal data is collected. There are no advertising cookies and no user accounts.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This site sets no cookies at all — no essential cookies, no analytics cookies, no advertising cookies, no marketing cookies. There is no consent mechanism and no preference to change. An ads.txt file is served for ads.txt verification, but this site sells no advertising and runs no ad network.",
    ],
  },
  {
    heading: "External Links",
    body: [
      "This site contains links to external services (Amazon, GitHub, X, LinkedIn). These sites have their own privacy policies. I am not responsible for their practices.",
    ],
  },
  {
    heading: "Book Purchases",
    body: [
      "The book is sold through Amazon. All purchase data, payment information, and order fulfillment is handled entirely by Amazon. I do not have access to your purchase details.",
    ],
  },
  {
    heading: "Open Source",
    body: [
      "The projects linked from this site are open source. Their respective repositories may have their own privacy considerations depending on how you use them.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="bg-void text-ink">
      <Container className="pt-24 pb-16">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold mb-5">
            Legal
          </p>
          <h1 className="display-lg mb-4">
            Privacy Policy
          </h1>
          <p className="font-mono text-xs text-ink-2 mb-12">
            Last updated: June 2026
          </p>

          <div className="space-y-px bg-rule border border-rule">
            {sections.map((s) => (
              <div key={s.heading} className="bg-slate p-7">
                <SectionHeading kicker="Policy" title={s.heading} />
                <div className="space-y-4 text-ink-2 leading-relaxed mt-4">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-rule pt-8">
            <h2 className="font-display text-xl text-ink mb-3">Contact</h2>
            <p className="text-ink-2 leading-relaxed">
              Questions about this policy? Reach out on{" "}
              <a
                href="https://x.com/kliewer_daniel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                X
              </a>{" "}
              or{" "}
              <a
                href="https://github.com/kliewerdaniel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
