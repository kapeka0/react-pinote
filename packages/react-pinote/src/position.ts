import type { PinotePosition } from "./types";

export function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

/** Convert viewport pointer coordinates to clamped percentages of a layer's padding box. */
export function getPinotePosition(
  pointer: Pick<PointerEvent, "clientX" | "clientY">,
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
