import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

export type PinoteSide = "bottom" | "left" | "right" | "top";

type FloatingPosition = {
  side: PinoteSide;
  style: CSSProperties;
};

const GAP = 12;
const VIEWPORT_PADDING = 12;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function usePinotePosition(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  portalRoot: HTMLElement | null | false,
) {
  const [position, setPosition] = useState<FloatingPosition>({
    side: "right",
    style: { left: 0, position: "fixed", top: 0, visibility: "hidden" },
  });

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) {
        return;
      }

      const trigger = triggerRef.current.getBoundingClientRect();
      const measured = contentRef.current.getBoundingClientRect();
      // offset sizes exclude the opening scale animation.
      const content = {
        width: contentRef.current.offsetWidth || measured.width,
        height: contentRef.current.offsetHeight || measured.height,
      };
      const available = {
        bottom: window.innerHeight - trigger.bottom,
        left: trigger.left,
        right: window.innerWidth - trigger.right,
        top: trigger.top,
      };
      const side: PinoteSide =
        available.right >= content.width + GAP + VIEWPORT_PADDING
          ? "right"
          : available.left >= content.width + GAP + VIEWPORT_PADDING
            ? "left"
            : available.bottom >= content.height + GAP + VIEWPORT_PADDING
              ? "bottom"
              : "top";

      let left = trigger.right + GAP;
      let top = trigger.top + trigger.height / 2 - content.height / 2;

      if (side === "left") {
        left = trigger.left - content.width - GAP;
      } else if (side === "bottom") {
        left = trigger.left + trigger.width / 2 - content.width / 2;
        top = trigger.bottom + GAP;
      } else if (side === "top") {
        left = trigger.left + trigger.width / 2 - content.width / 2;
        top = trigger.top - content.height - GAP;
      }

      setPosition({
        side,
        style: {
          left: clamp(
            left,
            VIEWPORT_PADDING,
            window.innerWidth - content.width - VIEWPORT_PADDING,
          ),
          position: "fixed",
          top: clamp(
            top,
            VIEWPORT_PADDING,
            window.innerHeight - content.height - VIEWPORT_PADDING,
          ),
          visibility: "visible",
        },
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, {
      capture: true,
      passive: true,
    });
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updatePosition);
    observer?.observe(triggerRef.current);
    observer?.observe(contentRef.current);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [contentRef, isOpen, triggerRef, portalRoot]);

  return position;
}
