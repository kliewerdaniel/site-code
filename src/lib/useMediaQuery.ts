"use client";

import { useCallback, useSyncExternalStore } from "react";

/* ============================================================
   useMediaQuery — SSR-safe media query.

   Reading window.matchMedia during render (or in a useState
   initialiser) makes the client's first render disagree with the
   server's, which React reports as "Hydration failed because the
   server rendered HTML didn't match the client". That is what
   happened to every visitor who prefers reduced motion: the server
   cannot evaluate the query, so it emitted the animated tree while
   the client emitted the static one.

   useSyncExternalStore is the React API for a value that
   legitimately differs between server and client. It renders
   `serverValue` during SSR *and during hydration*, then re-renders
   with the live matchMedia value once hydration is complete, and it
   subscribes to `change` for us.

   `serverValue` MUST be the branch the server actually rendered:
     - false (default) when the server output is the UN-matched
       branch — Reveal / ChapterStack render the animated tree.
     - true when the server output is the MATCHED branch — HeroBook
       always server-renders the static cover, because it cannot
       know whether WebGL or a small viewport will be there.
   ============================================================ */

const MQL_CACHE = new Map<string, MediaQueryList>();

function getMql(query: string): MediaQueryList {
  let mq = MQL_CACHE.get(query);
  if (!mq) {
    mq = window.matchMedia(query);
    MQL_CACHE.set(query, mq);
  }
  return mq;
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = getMql(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => getMql(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;
