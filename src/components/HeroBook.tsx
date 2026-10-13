"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BOOK } from "@/config";
import { useMediaQuery } from "@/lib/useMediaQuery";

/* ============================================================
   HeroBook — the signature of the site.
   Lazy-loads the interactive 3D hardcover (ssr: false). Falls back
   to the static front-cover render when:
     - prefers-reduced-motion is set,
     - the viewport is small (<=640px) — mobile gets the image,
     - the 3D scene throws (WebGL unavailable, texture failure).
   ============================================================ */

const BookScene = dynamic(() => import("./BookScene"), {
  ssr: false,
  loading: () => <StaticCover />,
});

function StaticCover() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BOOK.coverFront}
        alt="Computational Sovereignty — hardcover front cover"
        className="max-h-full w-auto rounded-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        loading="eager"
      />
    </div>
  );
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticCover /> : this.props.children;
  }
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce), (max-width: 640px)";

export default function HeroBook({ className }: { className?: string }) {
  /* serverValue = true: the server cannot evaluate matchMedia, so it always
     renders the static cover — and hydration must reproduce that same output
     before opting into the live scene. Computing the mode during render
     (useState(initialMode)) made the client's first pass emit the BookScene
     <Suspense> tree while the server had emitted StaticCover, which React
     reported as a hydration failure. There is no flash on the way in: the
     dynamic import's loading fallback IS StaticCover, so the cover stays
     painted until the scene is ready. */
  const isStatic = useMediaQuery(MOTION_QUERY, true);

  return (
    <div
      className={className}
      role="img"
      aria-label="Interactive 3D hardcover of Computational Sovereignty — drag to rotate"
    >
      {isStatic ? (
        <StaticCover />
      ) : (
        <SceneErrorBoundary>
          <BookScene />
        </SceneErrorBoundary>
      )}
    </div>
  );
}
