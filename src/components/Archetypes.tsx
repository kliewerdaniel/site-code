import type { ReactNode } from "react";
import { Container } from "./Container";

/* ============================================================
   The three v3 archetypes. Every page composes from these, and a
   page that uses the same one twice in a row is a bug — that
   repetition is exactly what made v2 read as a template.

   A. SCENE      full-bleed opener, object in void. Max one per page.
   B. EXHIBIT    gallery pacing: generous space, narrow measure.
   C. INSTRUMENT data display: ruled rows, tabular figures.
   ============================================================ */

/** A. SCENE — the object lit in a dark room. One per page. */
export function Scene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`scene border-b border-rule ${className}`}>
      <Container className="w-full">{children}</Container>
    </section>
  );
}

/** B. EXHIBIT — one idea, given room to breathe. */
export function Exhibit({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Default is the reading measure (max-w-3xl). `wide` for grids. */
  wide?: boolean;
}) {
  return (
    <section className={`exhibit border-b border-rule ${className}`}>
      <Container className={wide ? "" : "max-w-3xl"}>{children}</Container>
    </section>
  );
}

/** C. INSTRUMENT — the numbers, as a ruled readout. */
export function Instrument({
  children,
  className = "",
  wide = true,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section className={`instrument ${className}`}>
      <Container className={wide ? "" : "max-w-3xl"}>{children}</Container>
    </section>
  );
}

/** The kicker above a section title: mono, ruled, instrument voice. */
export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`label flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="inline-block h-px w-8 bg-gold" />
      {children}
    </p>
  );
}

/** A tabular figure: the site's ornament is measurement. */
export function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-void-2 px-8 py-10">
      <div className="data font-mono text-[clamp(2rem,3.4vw,3rem)] leading-none font-medium tracking-[-0.02em] text-gold">
        {value}
      </div>
      <div className="label mt-4 leading-relaxed">{label}</div>
    </div>
  );
}

/** Ruled figure row — the INSTRUMENT grid. */
export function FigureRow({ children }: { children: ReactNode }) {
  return (
    <div className="mt-16 grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-4">
      {children}
    </div>
  );
}

/** A ruled data row: the unboxed replacement for v2's bordered cards. */
export function RuledRow({
  lead,
  trailing,
  children,
}: {
  /** Left column: a mono label, chapter number, or date. */
  lead: ReactNode;
  /** Optional right column. */
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ruled-row grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-7 md:grid-cols-[7rem_1fr_auto] md:gap-x-9">
      <div className="label data pt-1 text-gold">{lead}</div>
      <div>{children}</div>
      {trailing && (
        <div className="label col-start-2 md:col-start-3 md:text-right">
          {trailing}
        </div>
      )}
    </div>
  );
}
