export function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-12">
      <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
        <span aria-hidden="true" className="inline-block h-px w-8 bg-gold" />
        {kicker}
      </p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-bone md:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-2xl leading-relaxed text-bone-dim">{lede}</p>
      )}
    </div>
  );
}

export default SectionHeading;
