import type { PinoteOrientation, PinotePosition } from "./types";

export function pinoteCorner(
  orientation: PinoteOrientation,
  point: PinotePosition,
  attached: boolean,
) {
  if (orientation !== "auto") return orientation;
  if (!attached) return "bottom-left";
  return `${point.y <= 50 ? "bottom" : "top"}-${point.x < 50 ? "right" : "left"}`;
}

export function pinoteRadius(corner: string, radius: string) {
  return ["top-left", "top-right", "bottom-right", "bottom-left"]
    .map((value) => (value === corner ? "0" : radius))
    .join(" ");
}

/** Collapse at the marker's measured position, including viewport adjustments. */
export function pinoteClip(
  radius: string,
  center: PinotePosition,
  size: { width: number; height: number },
) {
  const left = center.x - size.width / 2;
  const top = center.y - size.height / 2;
  return `inset(${top}px calc(100% - ${left + size.width}px) calc(100% - ${top + size.height}px) ${left}px round ${radius})`;
}
