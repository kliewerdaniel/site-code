"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { BOOK } from "@/config";
import { AmazonCta } from "./AmazonCta";

/* ============================================================
   ChapterStack — the /book centerpiece.
   A physical stack of 24 chapter cards that deal off the top as
   you scroll, one card per segment, resolving into the buy CTA.
   Reduced motion -> a plain static list. No JavaScript games.
   ============================================================ */

export interface Chapter {
  n: number;
  part: string;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { n: 1, part: "I — Why Sovereignty", title: "The Cloud Is a Liability" },
  { n: 2, part: "I — Why Sovereignty", title: "The Sovereignty Stack" },
  { n: 3, part: "I — Why Sovereignty", title: "Your First Local Model" },
  { n: 4, part: "II — Inference You Control", title: "Tokens, Context, and Sampling" },
  { n: 5, part: "II — Inference You Control", title: "Choosing Models Like an Engineer" },
  { n: 6, part: "II — Inference You Control", title: "Serving Models Locally" },
  { n: 7, part: "III — Memory That Isn't a Prompt", title: "Embeddings and Vector Search" },
  { n: 8, part: "III — Memory That Isn't a Prompt", title: "Building Local RAG" },
  { n: 9, part: "III — Memory That Isn't a Prompt", title: "Evaluating Retrieval Honestly" },
  { n: 10, part: "IV — Knowledge Graphs", title: "From Documents to Graphs" },
  { n: 11, part: "IV — Knowledge Graphs", title: "GraphRAG in Practice" },
  { n: 12, part: "IV — Knowledge Graphs", title: "Compile-Time Intelligence" },
  { n: 13, part: "V — Agents That Obey", title: "Tool Use, Locally" },
  { n: 14, part: "V — Agents That Obey", title: "State Machines Over Vibes" },
  { n: 15, part: "V — Agents That Obey", title: "The Auditor Pattern" },
  { n: 16, part: "VI — Personas and Routing", title: "Quantified Personas" },
  { n: 17, part: "VI — Personas and Routing", title: "Dynamic Routing (MoE-style)" },
  { n: 18, part: "VI — Personas and Routing", title: "Persona Systems in Production" },
  { n: 19, part: "VII — Verification Discipline", title: "The Refusal Discipline" },
  { n: 20, part: "VII — Verification Discipline", title: "Contradiction Detection at Scale" },
  { n: 21, part: "VII — Verification Discipline", title: "Gold Sets and Frozen Benchmarks" },
  { n: 22, part: "VIII — Privacy, Security, Shipping", title: "The Local-First Security Model" },
  { n: 23, part: "VIII — Privacy, Security, Shipping", title: "Shipping Sovereign Software" },
  { n: 24, part: "VIII — Privacy, Security, Shipping", title: "The Sovereign Practice" },
];

function ChapterCard({
  chapter,
  index,
  total,
  progress,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  // Each card: revealed at scale while buried, deals up-and-away
  // through its own scroll segment, gone by the segment's end.
  const scale = useTransform(
    progress,
    [Math.max(0, start - 1 / total), start],
    [0.92, 1]
  );
  const y = useTransform(progress, [start, end], ["0vh", "-72vh"]);
  const rotate = useTransform(progress, [start, end], [0, -9]);
  const opacity = useTransform(progress, [start, end], [1, 0]);

  return (
    <motion.article
      aria-label={`Chapter ${chapter.n}: ${chapter.title}`}
      style={{ y, rotate, opacity, scale, zIndex: total - index }}
      className="cover-keyline absolute left-1/2 top-1/2 w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-md bg-navy p-8 md:p-10"
    >
      <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-steel uppercase">
        {chapter.part}
      </p>
      <div className="flex items-baseline gap-5">
        <span className="font-mono text-5xl font-semibold text-gold md:text-6xl">
          {String(chapter.n).padStart(2, "0")}
        </span>
        <h3 className="font-display text-2xl font-medium leading-tight text-bone md:text-3xl">
          {chapter.title}
        </h3>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-bone-faint uppercase">
          {index + 1} / {total}
        </span>
      </div>
    </motion.article>
  );
}

function StaticList() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <ol className="divide-y divide-hairline border-y border-hairline">
        {CHAPTERS.map((c) => (
          <li key={c.n} className="flex items-baseline gap-5 py-4">
            <span className="w-10 shrink-0 font-mono text-sm text-gold">
              {String(c.n).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display text-lg text-bone">{c.title}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] text-bone-faint uppercase">
                {c.part}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ChapterStack() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  if (reduce) {
    return (
      <section aria-label="Table of contents">
        <StaticList />
        <BuyResolve />
      </section>
    );
  }

  return (
    <section aria-label="Table of contents">
      <div ref={trackRef} className="relative h-[420vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <p className="absolute top-16 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.28em] text-bone-faint uppercase">
            The full stack — keep scrolling
          </p>
          {CHAPTERS.map((c, i) => (
            <ChapterCard
              key={c.n}
              chapter={c}
              index={i}
              total={CHAPTERS.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
      <BuyResolve />
    </section>
  );
}

function BuyResolve() {
  return (
    <section className="border-y border-hairline bg-navy-deep">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <p className="mb-4 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
          All 24 chapters · {BOOK.words} words
        </p>
        <h2 className="mb-4 font-display text-3xl font-semibold text-bone md:text-5xl">
          Then you own the machine.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-bone-dim">
          Twenty-four chapters, eight parts, one working philosophy: every
          layer inspectable, every number measured, every dependency yours.
          Hardcover, 214 pages, printed to survive your desk.
        </p>
        <div className="flex flex-col items-center gap-4">
          <AmazonCta />
          <Link
            href="/sample"
            className="font-mono text-[12px] tracking-[0.16em] text-bone-dim uppercase transition-colors hover:text-gold"
          >
            Read chapter 1 free first →
          </Link>
        </div>
      </div>
    </section>
  );
}
