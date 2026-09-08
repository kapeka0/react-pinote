import { describe, expect, it } from "vitest";

import { getPinotePosition } from "./index";

describe("getPinotePosition", () => {
  it("converts a pointer location into readable percentage coordinates", () => {
    const container = document.createElement("div");
    container.getBoundingClientRect = () =>
      ({
        bottom: 300,
        height: 200,
        left: 100,
        right: 500,
        top: 100,
        width: 400,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect;

    expect(
      getPinotePosition({ clientX: 300, clientY: 150 }, container),
    ).toEqual({ x: 50, y: 25 });
    expect(
      getPinotePosition({ clientX: -20, clientY: 600 }, container),
    ).toEqual({ x: 0, y: 100 });
    expect(() =>
      getPinotePosition({ clientX: NaN, clientY: 100 }, container),
    ).toThrow(RangeError);
  });
  it("rejects an area without dimensions", () => {
    expect(() =>
      getPinotePosition(
        { clientX: 10, clientY: 10 },
        document.createElement("div"),
      ),
    ).toThrow(RangeError);
  });
});
