// The monogram is the Fraunces Black "K" — the site's own display face, used
// verbatim. It replaces "The Sovereign Machine": a rounded navy square holding
// three ascending gold bars, a circuit line, three node dots and a blue
// baseline. That was four ideas and three colours in 48px; at 16px it was mush,
// and ascending bars read as an analytics startup, not as an author's mark.
//
// A colophon is the right form for a site built on editorial typography: one
// shape, one colour, drawn from the type it sits beside.

import { BARE, BOXED, GLYPH, MONOGRAM_PATH } from "./monogram-path";

interface MarkProps {
  size?: number;
  className?: string;
  title?: string;
  /** Void field behind the glyph. Needed where the mark sits on an unknown
   *  background (tab bars); the header mark is bare so it reads as a colophon
   *  rather than an app icon. */
  boxed?: boolean;
}

export function Monogram({
  size = 34,
  className,
  title,
  boxed = false,
}: MarkProps) {
  const g = boxed ? BOXED : BARE;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${g.box} ${g.box}`}
      role="img"
      aria-label={title ?? "Daniel Kliewer"}
      className={["text-gold", className].filter(Boolean).join(" ")}
    >
      {boxed ? <rect width={g.box} height={g.box} fill="#01040a" /> : null}
      <path
        transform={`translate(${g.tx} ${g.ty}) scale(${g.scale} ${-g.scale}) translate(${-GLYPH.xMin} ${-GLYPH.yMax})`}
        d={MONOGRAM_PATH}
        fill="currentColor"
      />
    </svg>
  );
}

/** @deprecated kept so older imports keep compiling; use Monogram. */
export const SovereignMark = Monogram;

interface LogotypeProps {
  markSize?: number;
  className?: string;
  wordmarkClassName?: string;
}

export function Logotype({
  markSize = 26,
  className,
  wordmarkClassName,
}: LogotypeProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Monogram size={markSize} />
      {/* Fraunces, not mono. The mark is drawn from this face, so setting the
          wordmark in it makes the lockup a masthead instead of a serif letter
          dropped beside typewriter text. Size and tracking chosen against
          rendered variants: 26px mark with 19px wordmark is the point where
          neither element overpowers the other. */}
      <span
        className={`font-display whitespace-nowrap text-[19px] uppercase tracking-[0.10em] text-ink ${
          wordmarkClassName ?? ""
        }`}
      >
        Daniel Kliewer
      </span>
    </span>
  );
}

export default Logotype;
