"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/* Scroll reveal with a reduced-motion escape hatch.
   If the user prefers reduced motion, content renders plainly.

   v4: framer-motion is gone. It was 121 KB uncompressed (~39 KB gzipped) and
   sat in the shared chunk, so every route paid for it — including the ones that
   never render a Reveal — to animate a single opacity value. The replacement
   is the same fade expressed as a CSS transition driven by an
   IntersectionObserver, with the same semantics as the previous version:

     - opacity 0 until the element enters the viewport, then opacity 1;
     - `once`: the observer disconnects on first intersection, so a block that
       scrolls out and back in does not re-fade;
     - viewport margin -70px, matching framer's `viewport={{ margin: "-70px" }}`;
     - 0.4s ease-out, with the per-block delay clamped to 60ms;
     - reduced motion renders plainly, with no observer and no transition.

   SSR is unchanged: useMediaQuery's serverValue is false, so the server and the
   hydration pass both render the animated branch (opacity 0) and the effect
   flips it to 1 once the element is in view. If IntersectionObserver is absent
   the content is shown immediately rather than left invisible.

   v3 (kept for the record): near-invisible — opacity only (v2 also moved 26px,
   which read as a template animation), a shorter duration, and the per-block
   `delay` cascade clamped to 60ms, because v2 staggered cards up to 250ms and
   made every grid feel like a slideshow.
*/

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
const MAX_DELAY = 0.06;
const DURATION = 0.4;
/** framer's `viewport={{ margin: "-70px" }}` shrinks all four sides. */
const ROOT_MARGIN = "-70px -70px -70px -70px";

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
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce || shown) return;
    const el = ref.current;
    // No observer (very old engine, or a test environment): show rather than
    // leave the block permanently invisible.
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, shown]);

  const style = reduce
    ? undefined
    : {
        opacity: shown ? 1 : 0,
        transition: `opacity ${DURATION}s ease-out ${Math.min(delay, MAX_DELAY)}s`,
      };

  return (
    <div ref={reduce ? undefined : ref} className={className} style={style}>
      {children}
    </div>
  );
}

export default Reveal;
