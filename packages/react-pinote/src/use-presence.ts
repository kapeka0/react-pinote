import { useEffect, useState } from "react";
import type { RefObject } from "react";

/** Keep an exiting surface mounted through the final frame of its transition. */
export function usePresence(open: boolean, ref: RefObject<HTMLElement | null>) {
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    let cancelled = false;
    void Promise.allSettled(
      ref.current
        ?.getAnimations?.()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished) ?? [],
    ).then(() => {
      if (!cancelled) setPresent(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, ref]);
  return open || present;
}
