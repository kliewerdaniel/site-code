"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/* Scroll reveal with a reduced-motion escape hatch.
   If the user prefers reduced motion, content renders plainly.

   v3: near-invisible. Opacity only (v2 also moved 26px, which read as a
   template animation), a shorter duration, and the per-block `delay`
   cascade clamped to 60ms — v2 staggered cards up to 250ms, which made
   every grid feel like a slideshow.

   The preference is read through useMediaQuery, which is SSR-safe.
   Reading it during render made the client's first pass emit a plain
   <div> while the server had emitted the animated <motion.div> — a
   hydration mismatch on every page that uses Reveal. */

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
const MAX_DELAY = 0.06;

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useMediaQuery(REDUCE_MOTION);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(delay, MAX_DELAY),
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
