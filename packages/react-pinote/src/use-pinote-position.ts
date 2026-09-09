import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { PinotePosition } from "./types";

export type PinoteSide = "bottom" | "left" | "right" | "top";

type FloatingPosition = {
  side: PinoteSide;
  style: CSSProperties;
  anchorCenter: { x: number; y: number };
};

const GAP = 12;
const VIEWPORT_PADDING = 12;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function usePinotePosition(
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  portalRoot: HTMLElement | null | false,
  anchorPosition: PinotePosition,
  alignCorner: string | false,
) {
  const [position, setPosition] = useState<FloatingPosition>({
    side: "right",
    anchorCenter: { x: 0, y: 0 },
    style: { left: 0, position: "fixed", top: 0, visibility: "hidden" },
  });

  useEffect(() => {
    if (!isOpen || !anchorRef.current || !contentRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current || !contentRef.current) {
        return;
      }

      const trigger = anchorRef.current.getBoundingClientRect();
      // Include overflowing trigger decoration for a separate popover.
      if (!alignCorner)
        trigger.width *= Math.max(
          1,
          anchorRef.current.scrollWidth / anchorRef.current.clientWidth || 1,
        );
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

      if (alignCorner) {
        left = alignCorner.includes("left")
          ? trigger.left
          : trigger.right - content.width;
        top = alignCorner.includes("top")
          ? trigger.top
          : trigger.bottom - content.height;
      }
      left = clamp(
        left,
        VIEWPORT_PADDING,
        window.innerWidth - content.width - VIEWPORT_PADDING,
      );
      top = clamp(
        top,
        VIEWPORT_PADDING,
        window.innerHeight - content.height - VIEWPORT_PADDING,
      );
      setPosition({
        side,
        anchorCenter: {
          x: trigger.left + trigger.width / 2 - left,
          y: trigger.top + trigger.height / 2 - top,
        },
        style: {
          left,
          position: "fixed",
          top,
          transformOrigin:
            side[0] === "r"
              ? "left"
              : side[0] === "l"
                ? "right"
                : side[0] === "t"
                  ? "bottom"
                  : "top",
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
    observer?.observe(anchorRef.current);
    observer?.observe(contentRef.current);
    for (
      let ancestor = anchorRef.current.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer?.observe(ancestor);
      if (ancestor.dataset.slot === "pinote-layer") break;
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [
    contentRef,
    isOpen,
    anchorRef,
    portalRoot,
    anchorPosition.x,
    anchorPosition.y,
    alignCorner,
  ]);

  return position;
}
