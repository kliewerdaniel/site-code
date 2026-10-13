import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { EmailCapture } from "@/components/EmailCapture";
import { BOOK } from "@/config";

export const metadata: Metadata = {
  title: "Sample Chapter — Computational Sovereignty",
  description:
    "Read Chapter 1 of Computational Sovereignty: Building Local-First AI Systems free. Enter your email and get it straight to your inbox.",
  openGraph: {
    title: "Sample chapter — Computational Sovereignty",
    description:
      "Chapter 1 of Computational Sovereignty, free. Enter your email and get it straight to your inbox.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sample chapter — Computational Sovereignty",
    description:
      "Chapter 1 of Computational Sovereignty, free. Enter your email and get it straight to your inbox.",
  },
};

const SERIF = "font-['Fraunces',Georgia,serif]";
const MONO = "font-['JetBrains_Mono',ui-monospace,monospace]";

export default function SamplePage() {
  return (
    <section className="bg-[#14120d]">
      <Container className="max-w-2xl py-20 md:py-28">
        <p className={`${MONO} mb-6 text-[11px] tracking-[0.24em] uppercase text-[#d9a648]`}>
          Sample chapter
        </p>
        <h1
          className={`${SERIF} mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#ece7da] md:text-5xl`}
        >
          Chapter 1: The Cloud Is a Liability
        </h1>
        <p className={`${SERIF} mb-8 text-xl italic text-[#a79d87]`}>
          Why every dependency you don't own is a bill you haven't been sent yet.
        </p>
        <div className="mb-10 space-y-4 border-y border-[#2c2720] py-8 text-base leading-relaxed text-[#a79d87]">
          <p>
            The first chapter of <em className="text-[#ece7da]">{BOOK.title}</em> lays out
            the thesis the other twenty-three chapters prove: the cloud is a liability, and
            a local-first AI system is the working alternative.
          </p>
          <p>
            Enter your email and the chapter lands in your inbox — free. You'll also get
            the launch notice when the hardcover ships. No spam, unsubscribe anytime.
          </p>
        </div>
        <EmailCapture
          variant="gate"
          heading="Get Chapter 1"
          blurb="Free sample chapter + launch notice. No spam, unsubscribe anytime."
        />
      </Container>
    </section>
  );
}
