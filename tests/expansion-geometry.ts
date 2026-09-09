import type { Locator } from "@playwright/test";

/** Let CSS resolve the animated clip's percentages into viewport coordinates. */
export async function clippedBounds(panel: Locator) {
  return panel.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const insets =
      getComputedStyle(node).clipPath.match(/^inset\((.+?) round /)?.[1];
    if (!insets) throw new Error("Expected an inset clipping animation");
    const container = document.createElement("div");
    const clipped = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      left: `${box.x}px`,
      top: `${box.y}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      visibility: "hidden",
      pointerEvents: "none",
    });
    Object.assign(clipped.style, { position: "absolute", inset: insets });
    container.append(clipped);
    document.body.append(container);
    try {
      return clipped.getBoundingClientRect().toJSON() as {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    } finally {
      container.remove();
    }
  });
}
