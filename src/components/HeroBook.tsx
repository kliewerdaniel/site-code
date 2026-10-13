"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BOOK } from "@/config";

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

function initialMode(): "static" | "scene" {
  if (typeof window === "undefined") return "static";
  return window.matchMedia(MOTION_QUERY).matches ? "static" : "scene";
}

export default function HeroBook({ className }: { className?: string }) {
  const [mode, setMode] = useState<"static" | "scene">(initialMode);

  useEffect(() => {
    const mq = window.matchMedia(MOTION_QUERY);
    const onChange = (e: MediaQueryListEvent) =>
      setMode(e.matches ? "static" : "scene");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className={className}
      role="img"
      aria-label="Interactive 3D hardcover of Computational Sovereignty — drag to rotate"
    >
      {mode === "scene" ? (
        <SceneErrorBoundary>
          <BookScene />
        </SceneErrorBoundary>
      ) : (
        <StaticCover />
      )}
    </div>
  );
}
