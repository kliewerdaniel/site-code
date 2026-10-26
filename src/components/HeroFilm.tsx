"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic hero plate.
 *
 * The static image is the hero. The video is an enhancement layered on top of it
 * once it can actually play, which means:
 *   - the page is complete and readable before any video byte is fetched
 *   - a blocked, failed or slow video leaves a correct page, not a hole
 *   - reduced-motion and data-saver users get the still, by preference and not
 *     as a fallback after a wasted download
 *
 * Muted, looping, no audio track, no controls. It is decoration and is marked
 * as such for assistive tech; the alt text lives on the image.
 */
export function HeroFilm({
  poster,
  srcMp4,
  srcWebm,
  alt,
  className = "",
}: {
  poster: string;
  srcMp4: string;
  srcWebm?: string;
  alt: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData =
      "connection" in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

    const decide = () => setAllowed(!reduce.matches && !saveData);
    decide();

    reduce.addEventListener("change", decide);
    return () => reduce.removeEventListener("change", decide);
  }, []);

  // Start playback on mount rather than waiting for an intersection callback.
  // Measured in the verification browser: IntersectionObserver never fired for
  // this element even though it filled the viewport (a hand-made observer
  // returned null too). Gating start-up on that event meant the film silently
  // never played. The observer below is now only an optimisation.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !allowed) return;
    void el.play().catch(() => setPlaying(false));
  }, [allowed]);

  // Pause when the hero scrolls away so a background tab or a scrolled page is
  // not decoding frames. Best-effort: if the observer never fires, the film
  // simply keeps looping, which is the pre-existing behaviour and harmless.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !allowed) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => setPlaying(false));
        } else {
          el.pause();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [allowed]);

  return (
    <div className={`overflow-hidden bg-void ${className || "relative"}`}>
      {/* The still. Always present, always the fallback. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        className="h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />

      {allowed ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        >
          {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
          <source src={srcMp4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
