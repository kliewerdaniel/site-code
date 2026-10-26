import type { ReactNode } from "react";

import { Container } from "./Container";
import { HeroFilm } from "./HeroFilm";

/**
 * The photographic opener: a plate behind the page's headline.
 *
 * One pattern for every page that gets a plate (home, research, projects,
 * about) rather than a copy per page, so the band geometry, the scrims and
 * the still-is-the-hero rule cannot drift between them.
 *
 * The two scrims are not decoration, they are the legibility budget:
 *   - the diagonal gradient keeps the left third void on desktop (the grid is
 *     left-aligned, so the type needs dark behind it) while `object-cover`
 *     drags the lit area under the text on narrow viewports;
 *   - the top scrim darkens only the band the header occupies, because at
 *     rest the header is transparent and the rightmost nav items would
 *     otherwise sit straight on the plate's brightest tile (~149/255).
 *
 * Band height is matched to the plate's aspect: 2304x960 at a 1440-wide band
 * of ~600px is a 0.625 scale, i.e. a downscale. `object-cover` upscales
 * whenever the container is taller than the image, and a soft-focus plate
 * upscaled ~1.3x reads as a low-resolution image rather than as bokeh.
 */
export function HeroBand({
  poster,
  srcMp4,
  srcWebm,
  alt,
  children,
  className = "",
}: {
  poster: string;
  srcMp4: string;
  srcWebm?: string;
  alt: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-rule">
      <HeroFilm
        poster={poster}
        srcMp4={srcMp4}
        srcWebm={srcWebm}
        alt={alt}
        className="absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/80 to-void/20 md:bg-gradient-to-r md:from-void md:via-void/30 md:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-void via-void/70 to-transparent"
      />

      <Container
        className={`relative flex min-h-[540px] flex-col justify-center py-14 md:min-h-[620px] md:py-16 ${className}`}
      >
        {children}
      </Container>
    </section>
  );
}
