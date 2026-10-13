import { BOOK } from "@/config";

/* The single buy button used everywhere. Price is decided ($88);
   the Amazon URL is the only remaining TODO (config comment). */

export function AmazonCta({
  secondary = false,
  className = "",
}: {
  secondary?: boolean;
  className?: string;
}) {
  const live = BOOK.amazonUrl !== "#";
  const label = `Buy the hardcover — ${BOOK.price}`;
  const base =
    "inline-flex items-center justify-center rounded-sm px-8 py-4 font-mono text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors";
  const styles = secondary
    ? "border border-hairline bg-transparent text-bone hover:border-gold hover:text-gold"
    : "bg-gold text-abyss hover:bg-gold-deep";

  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <a
        href={BOOK.amazonUrl}
        aria-disabled={!live}
        title={live ? label : "Amazon listing opens at launch"}
        className={`${base} ${styles}`}
      >
        {label} ↗
      </a>
      {!live && (
        <span className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
          Amazon listing opens at launch
        </span>
      )}
    </span>
  );
}

export default AmazonCta;
