import type { ReactNode } from "react";
import { Kicker } from "./Archetypes";

/* v3 section heading: display-lg (weight 400, clamp scale) instead of v2's
   text-3xl/4xl font-semibold. The kicker now comes from Archetypes so every
   section opener is identical across the site. */

export function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string | ReactNode;
}) {
  return (
    <div className="mb-16">
      <Kicker>{kicker}</Kicker>
      <h2 className="display-lg mt-5">{title}</h2>
      {lede && (
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">{lede}</p>
      )}
    </div>
  );
}

export default SectionHeading;
