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
    <div className="mb-10">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-moss mb-4">
        {kicker}
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-paper">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-2xl text-paper-dim leading-relaxed">{lede}</p>
      )}
    </div>
  );
}


export default SectionHeading;
