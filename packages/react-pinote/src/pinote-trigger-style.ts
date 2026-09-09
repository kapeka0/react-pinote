import type { CSSProperties } from "react";
import type { PinotePosition } from "./types";
import { pinoteRadius } from "./pinote-shape";

/** Only set active behavior styles, so inactive fields cannot erase app styles. */
export function pinoteTriggerStyle({
  draggable,
  expand,
  hidden,
  entering,
  highlight,
  custom,
  corner,
}: {
  draggable: boolean;
  expand: boolean;
  hidden: boolean;
  entering: boolean;
  highlight: PinotePosition | undefined;
  custom: boolean;
  corner: string;
}): CSSProperties {
  return {
    ...(draggable && { touchAction: "none" }),
    ...(hidden && { opacity: 0 }),
    // Swap the marker and expansion in one frame, without cross-fading.
    ...(expand && { transitionProperty: "scale" }),
    ...(entering && { visibility: "hidden" }),
    ...(highlight && {
      transformOrigin: `${highlight.x < 50 ? "100%" : highlight.x > 50 ? "0%" : "50%"} ${highlight.y <= 50 ? "100%" : "0%"}`,
    }),
    ...(!custom && {
      borderRadius: `var(--pinote-trigger-radius, ${pinoteRadius(corner, "50%")})`,
    }),
  };
}
