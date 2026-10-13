// Logotype v2 — "The Sovereign Machine" monogram.
// Derived from the book cover's geometry: a navy field, a gold keyline,
// and three ascending towers joined by a circuit line with node dots.
// A machine you can read at a glance: build height, networked, owned.

interface MarkProps {
  size?: number;
  className?: string;
  title?: string;
}

export function SovereignMark({ size = 40, className, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title ?? "Daniel Kliewer monogram"}
      className={className}
    >
      {/* field */}
      <rect x="1.5" y="1.5" width="45" height="45" rx="7" fill="#1a2332" />
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="7"
        stroke="#d9a648"
        strokeWidth="2.5"
      />
      {/* circuit line across the towers' tops */}
      <line x1="9" y1="11" x2="39" y2="11" stroke="#d9a648" strokeWidth="2" />
      {/* node dots */}
      <circle cx="9" cy="11" r="2.6" fill="#d9a648" />
      <circle cx="39" cy="11" r="2.6" fill="#d9a648" />
      <circle cx="24" cy="11" r="2.6" fill="#0b1119" stroke="#d9a648" strokeWidth="2" />
      {/* three ascending towers */}
      <rect x="12" y="26" width="5" height="12" fill="#d9a648" />
      <rect x="21.5" y="19" width="5" height="19" fill="#d9a648" />
      <rect x="31" y="12.5" width="5" height="25.5" fill="#d9a648" />
      {/* baselines */}
      <line x1="9" y1="38" x2="39" y2="38" stroke="#5b7ba3" strokeWidth="2" />
    </svg>
  );
}

interface LogotypeProps {
  markSize?: number;
  className?: string;
  wordmarkClassName?: string;
}

export function Logotype({
  markSize = 34,
  className,
  wordmarkClassName,
}: LogotypeProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <SovereignMark size={markSize} />
      <span
        className={`font-mono text-sm font-semibold tracking-[0.28em] text-bone ${
          wordmarkClassName ?? ""
        }`}
      >
        DANIEL&nbsp;KLIEWER
      </span>
    </span>
  );
}

export default Logotype;
