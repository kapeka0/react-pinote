import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { PinotePosition } from "./types";

export type PinoteSide = "bottom" | "left" | "right" | "top";

type FloatingPosition = {
  side: PinoteSide;
  corner?: string | false;
  style: CSSProperties;
  anchorCenter: { x: number; y: number };
  anchorSize: { width: number; height: number };
};

const GAP = 12;
const VIEWPORT_PADDING = 12;

/** Keep at least half the preferred size before choosing the other direction. */
function fitExpansionWidth(
  panel: HTMLElement,
  start: number,
  end: number,
  viewport: number,
  atStart: boolean,
  flip: boolean,
) {
  const after = viewport - start - VIEWPORT_PADDING;
  const before = end - VIEWPORT_PADDING;
  const size = panel.offsetWidth;
  const room = atStart ? after : before;
  if (flip && room < Math.min(size / 2, atStart ? before : after))
    atStart = !atStart;
  panel.style.setProperty(
    "--pn-w",
    `${Math.max(end - start, atStart ? after : before)}px`,
  );
  return atStart;
}

export function usePinotePosition(
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  portalRoot: HTMLElement | null | false,
  anchorPosition: PinotePosition,
  alignCorner: string | false,
  autoCorner: boolean,
) {
  const [position, setPosition] = useState<FloatingPosition>({
    side: "right",
    anchorCenter: { x: 0, y: 0 },
    anchorSize: { width: 0, height: 0 },
    style: { position: "fixed", visibility: "hidden" },
  });

  useEffect(() => {
    if (!isOpen || !anchorRef.current || !contentRef.current) {
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const panel = contentRef.current;
      if (!anchor || !panel) {
        return;
      }

      const trigger = anchor.getBoundingClientRect();
      const { innerWidth: width, innerHeight: height } = window;
      // Include overflowing trigger decoration for a separate popover.
      if (!alignCorner)
        trigger.width *= Math.max(
          1,
          anchor.scrollWidth / anchor.clientWidth || 1,
        );
      let corner = alignCorner;
      if (corner) {
        // Measure the preferred width again after resize or a content change.
        panel.style.removeProperty("--pn-w");
        panel.style.removeProperty("--pn-h");
        const left = fitExpansionWidth(
          panel,
          trigger.left,
          trigger.right,
          width,
          corner.includes("left"),
          autoCorner,
        );
        // Preserve the vertical attachment as wrapped content grows or scrolls.
        const top = corner.includes("top");
        panel.style.setProperty(
          "--pn-h",
          `${Math.max(trigger.height, (top ? height - trigger.top : trigger.bottom) - VIEWPORT_PADDING)}px`,
        );
        corner = `${top ? "top" : "bottom"}-${left ? "left" : "right"}`;
      }
      // offset sizes exclude the opening scale animation.
      const contentWidth = panel.offsetWidth;
      const contentHeight = panel.offsetHeight;
      const side: PinoteSide =
        width - trigger.right >= contentWidth + GAP + VIEWPORT_PADDING
          ? "right"
          : trigger.left >= contentWidth + GAP + VIEWPORT_PADDING
            ? "left"
            : height - trigger.bottom >= contentHeight + GAP + VIEWPORT_PADDING
              ? "bottom"
              : "top";

      const horizontal = side === "left" || side === "right";
      let left = horizontal
        ? side === "left"
          ? trigger.left - contentWidth - GAP
          : trigger.right + GAP
        : trigger.left + (trigger.width - contentWidth) / 2;
      let top = horizontal
        ? trigger.top + (trigger.height - contentHeight) / 2
        : side === "top"
          ? trigger.top - contentHeight - GAP
          : trigger.bottom + GAP;

      if (corner) {
        left = corner.includes("left")
          ? trigger.left
          : trigger.right - contentWidth;
        top = corner.includes("top")
          ? trigger.top
          : trigger.bottom - contentHeight;
      } else {
        left = Math.max(
          VIEWPORT_PADDING,
          Math.min(left, width - contentWidth - VIEWPORT_PADDING),
        );
        top = Math.max(
          VIEWPORT_PADDING,
          Math.min(top, height - contentHeight - VIEWPORT_PADDING),
        );
      }
      setPosition({
        side,
        corner,
        anchorSize: trigger,
        anchorCenter: {
          x: trigger.left + trigger.width / 2 - left,
          y: trigger.top + trigger.height / 2 - top,
        },
        style: {
          left,
          position: "fixed",
          top,
          transformOrigin: horizontal
            ? side === "left"
              ? "right"
              : "left"
            : side === "top"
              ? "bottom"
              : "top",
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
    autoCorner,
  ]);

  return position;
}
