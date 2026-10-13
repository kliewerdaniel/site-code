import { BOOK } from "@/config";

/* The single buy button used everywhere.
   `amazonUrl` is a real listing now, so the button is always live — the
   `live` check is kept as a general guard (it reads the URL rather than
   asserting it) so that blanking the config can never ship a dead link
   with a buy label on it. */

export function AmazonCta({
  secondary = false,
  className = "",
}: {
  secondary?: boolean;
  className?: string;
}) {
  // `BOOK` is `as const`, so compare against a widened string to keep this
  // a runtime guard rather than a comparison TypeScript can prove constant.
  const url: string = BOOK.amazonUrl;
  const live = url.length > 0 && url !== "#";
  const label = `Buy the hardcover — ${BOOK.price}`;
  const base =
    "inline-flex items-center justify-center rounded-sm px-8 py-4 font-mono text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors";
  const styles = secondary
    ? "border border-rule bg-transparent text-ink hover:border-gold hover:text-gold"
    : "bg-gold text-void hover:bg-gold-2";

  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <a
        href={live ? url : "#"}
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
