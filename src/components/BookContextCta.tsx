import Link from "next/link";
import { AmazonCta } from "./AmazonCta";
import { BOOK } from "@/config";

/* A contextual book recommendation.
   The rule: every instance states WHY the book is relevant to this page, from
   data the page already has (a concept, a project, a path, a chapter). No
   instance is the generic button repeated — the reason is the component. */

export function BookContextCta({
  subject,
  reason,
  className = "",
}: {
  /** What the reader is already looking at: a concept, project, path or chapter. */
  subject: string;
  /** One or two sentences, derived from that subject — not a slogan. */
  reason: string;
  className?: string;
}) {
  return (
    <section className={`border-t border-rule pt-10 ${className}`}>
      <p className="label text-gold">The book</p>
      <p className="mt-3 font-display text-xl leading-snug text-ink">
        {subject}
      </p>
      <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">{reason}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <AmazonCta secondary />
        <Link
          href={BOOK.sampleUrl}
          className="label transition-colors hover:text-gold"
        >
          Read chapter 1 free →
        </Link>
      </div>
    </section>
  );
}

export default BookContextCta;
