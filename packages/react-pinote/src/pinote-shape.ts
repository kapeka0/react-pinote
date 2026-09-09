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

/** A custom trigger can be rectangular; default markers use the CSS size token. */
export function pinoteClip(
  corner: string,
  radius: string,
  size?: { width: number; height: number },
) {
  const insets = ["bottom", "left", "top", "right"].map((edge) => {
    const dimension = size
      ? `${edge === "top" || edge === "bottom" ? size.height : size.width}px`
      : "var(--pinote-size,25px)";
    return corner.includes(edge) ? `calc(100% - ${dimension})` : "0";
  });
  return `inset(${insets.join(" ")} round ${radius})`;
}
