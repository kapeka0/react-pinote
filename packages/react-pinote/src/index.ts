import type { PinotePosition } from "./types";
import "./styles.css";

export { Pinote } from "./pinote";
export type { PinoteProps } from "./pinote";
export type {
  PinoteAnimation,
  PinoteAuthor,
  PinotePlacement,
  PinotePosition,
} from "./types";
export { PinoteHighlight } from "./pinote-highlight";
export type { PinoteHighlightProps } from "./pinote-highlight";
export { PinoteLayer } from "./pinote-layer";
export type { PinoteLayerProps } from "./pinote-layer";

type PointerCoordinates = Pick<PointerEvent, "clientX" | "clientY">;

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function getPinotePosition(
  pointer: PointerCoordinates,
  container: Element,
): PinotePosition {
  const bounds = container.getBoundingClientRect();
  const scaleX =
    container instanceof HTMLElement && container.offsetWidth
      ? bounds.width / container.offsetWidth
      : 1;
  const scaleY =
    container instanceof HTMLElement && container.offsetHeight
      ? bounds.height / container.offsetHeight
      : 1;
  const width = container.clientWidth
    ? container.clientWidth * scaleX
    : bounds.width;
  const height = container.clientHeight
    ? container.clientHeight * scaleY
    : bounds.height;

  if (width <= 0 || height <= 0) {
    throw new RangeError("Cannot position a pinote inside an empty container.");
  }
  if (!Number.isFinite(pointer.clientX) || !Number.isFinite(pointer.clientY)) {
    throw new RangeError("Provide finite clientX and clientY coordinates.");
  }

  return {
    x: clampPercentage(
      ((pointer.clientX - bounds.left - container.clientLeft * scaleX) /
        width) *
        100,
    ),
    y: clampPercentage(
      ((pointer.clientY - bounds.top - container.clientTop * scaleY) / height) *
        100,
    ),
  };
}
