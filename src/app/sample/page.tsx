import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { AmazonCta } from "@/components/AmazonCta";
import { BOOK } from "@/config";
import { seo } from "@/lib/seo";

export const metadata = seo({
  title: "Chapter 1: The Cloud Is a Liability — Free Excerpt",
  description: `Read the opening of Computational Sovereignty: Building Local-First AI Systems, free and ungated. The full 214-page hardcover is ${BOOK.price}.`,
  path: "/sample",
  openGraph: {
    title: "Chapter 1: The Cloud Is a Liability",
    description:
      "The free, ungated opening of Computational Sovereignty. Price the cloud as a liability, then decide if you want the other 23 chapters.",
    type: "article",
    images: [BOOK.coverFront],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chapter 1: The Cloud Is a Liability",
    description:
      "The free, ungated opening of Computational Sovereignty. Price the cloud as a liability, then decide if you want the other 23 chapters.",
  },
});

/* Excerpted verbatim from Chapter 1 of the manuscript.
   No gate, no form, no email. Read it here; the CTA is at the end. */

export default function SamplePage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container className="max-w-2xl py-16 md:py-24">
          <p className="mb-6 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
            Free excerpt · No gate · Chapter 1 of 24
          </p>
          <h1 className="display-lg mb-5">
            The Cloud Is a Liability
          </h1>
          <p className="mb-10 font-display text-xl text-ink-2 italic">
            Why every dependency you don&apos;t own is a bill you haven&apos;t
            been sent yet.
          </p>

          <article className="space-y-6 text-base leading-relaxed text-ink-2">
            <p>
              Every AI system you build on someone else&apos;s API rests on a
              bet: that the provider&apos;s incentives stay aligned with yours
              forever. That bet has lost enough times, in enough ways, that a
              serious engineer should price it like any other dependency risk —
              explicitly, in writing, before the first API key is pasted into
              an env file.
            </p>
            <p>
              This chapter is that pricing exercise. It is not an argument that
              cloud AI is useless. It is an argument that cloud AI is a
              liability you carry, and liabilities should be measured.
            </p>

            <h2 className="display-md">
              The five liabilities
            </h2>

            <p>
              <strong className="text-ink">
                1. Data exfiltration by design.
              </strong>{" "}
              When you send a prompt to a hosted model, you send your data to
              someone else&apos;s computer. Full stop. &ldquo;We don&apos;t
              train on API data&rdquo; is a policy, and policies change with
              leadership, acquisition, and subpoenas. In 2023, Samsung
              engineers pasted proprietary source code into ChatGPT; the code
              entered Samsung&apos;s incident reports and the training-data
              discourse within weeks. The mechanism wasn&apos;t malice — it was
              the default behavior of the tool. Any workflow where private
              context leaves your machine is a workflow where your
              confidentiality boundary is a Terms of Service document.
            </p>
            <p>
              <strong className="text-ink">2. Silent model changes.</strong>{" "}
              Hosted models are versioned the way weather is versioned.
              Providers update weights, adjust system prompts, and tune
              refusal behavior without notice, and your application&apos;s
              behavior shifts underneath you. If you have ever debugged a
              prompt that &ldquo;used to work,&rdquo; you have paid this tax.
              Deterministic systems cannot be built on nondeterministic
              dependencies. A model that changes without a changelog is not
              infrastructure; it is a rumor.
            </p>
            <p>
              <strong className="text-ink">
                3. Vendor lock-in through API surface.
              </strong>{" "}
              Every provider-specific parameter — the exact shape of a
              function-calling schema, a proprietary reranker endpoint, a
              fine-tuning API — is a migration cost you are accruing. The
              lock-in is rarely contractual. It is the hundred small
              conveniences that make leaving feel expensive, which is exactly
              why they are offered.
            </p>
            <p>
              <strong className="text-ink">
                4. Cost curves that punish success.
              </strong>{" "}
              API pricing is linear in usage and set unilaterally. A prototype
              that costs $40/month at ten users costs $4,000/month at a
              thousand, and the provider can reprice at will. Local inference
              inverts this: the hardware is a fixed cost, and marginal queries
              are electricity. If your unit economics only work while usage is
              low, you don&apos;t have a business — you have a demo with a
              meter running.
            </p>
            <p>
              <strong className="text-ink">
                5. Availability as someone else&apos;s decision.
              </strong>{" "}
              Rate limits, outages, account suspensions, and geographic
              restrictions are all remote decisions about your system&apos;s
              uptime. An air-gapped laptop runs your model during an outage, on
              a plane, in a country under sanctions, or after your account is
              flagged by an automated fraud system at 2 AM. &ldquo;The cloud is
              just someone else&apos;s computer&rdquo; stops being a joke the
              first time someone else turns their computer off.
            </p>

            <h2 className="display-md">
              When the cloud is the right call
            </h2>

            <p>Honesty requires the other side. Run the model remotely when:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                You need frontier capability (the largest models still
                don&apos;t fit on consumer hardware, and for some tasks nothing
                smaller suffices).
              </li>
              <li>
                Your workload is bursty and tiny — a few hundred queries a day
                is cheaper as API calls than as a GPU idling.
              </li>
              <li>
                You have no operational capacity and the alternative is not
                shipping at all.
              </li>
            </ul>
            <p>
              The sovereign position is not &ldquo;never use APIs.&rdquo; It is:{" "}
              <strong className="text-ink">
                default to local, escalate to cloud deliberately, and know the
                price of the escalation.
              </strong>{" "}
              Most systems built in 2024–2025 defaulted the other way — cloud
              first, local never — because the APIs were convenient, not
              because the trade-off was analyzed.
            </p>

            <h2 className="display-md">
              The sovereignty test
            </h2>

            <p>
              Before this book&apos;s technical chapters, apply this test to
              any AI system you operate or plan:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>If the provider doubled prices tomorrow, what breaks?</li>
              <li>
                If the provider deprecated the exact model version you use, how
                long to recover?
              </li>
              <li>
                Which of your users&apos; data has left your infrastructure, and
                under what legal instrument?
              </li>
              <li>
                Can your system run, degraded but alive, with no network at
                all?
              </li>
            </ol>
            <p>
              If you can&apos;t answer all four, you don&apos;t have an
              architecture — you have an integration. The rest of this book is
              about building architectures.
            </p>

            <h2 className="display-md">
              What sovereignty costs
            </h2>

            <p>Nothing in this book is free. Local-first AI costs:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-ink">Hardware.</strong> A machine with
                24GB+ of VRAM (or a Mac with unified memory) is the entry
                ticket for serious local work. This is a capital expense, not
                a subscription — budget it once.
              </li>
              <li>
                <strong className="text-ink">Operational attention.</strong>{" "}
                You are now the SRE for your inference stack. Updates,
                monitoring, and debugging are yours.
              </li>
              <li>
                <strong className="text-ink">Capability ceiling.</strong> You
                will not run a 400B-parameter model on a laptop. You will
                learn, in Chapter 5, how often that actually matters. (Less
                than the marketing suggests.)
              </li>
            </ul>
            <p>
              What it buys: deterministic behavior, a confidentiality boundary
              you control, fixed costs, and systems that work on airplanes.
              Whether that trade is worth it is your call — but after this
              chapter, it&apos;s an <em>informed</em> call, which is the entire
              point.
            </p>
          </article>

          <p className="mt-10 border-t border-rule pt-6 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase">
            End of excerpt · Chapter 1 of {BOOK.chapters} · {BOOK.words} words total
          </p>
        </Container>
      </section>

      <section className="bg-void-2">
        <Container className="py-16 text-center md:py-20">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
              {BOOK.title} · {BOOK.format} · {BOOK.pages} pages
            </p>
            <h2 className="display-lg mx-auto mb-4 max-w-2xl">
              {Number(BOOK.chapters) - 1} chapters where that came from.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-ink-2">
              Models, retrieval, knowledge graphs, governed agents — built on
              your machine, measured honestly, priced without apology.
            </p>
            <AmazonCta />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
