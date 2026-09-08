import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Pinote, PinoteLayer } from "./index";

it("carries the local dark theme across a body portal", () => {
  render(
    <div className="dark">
      <PinoteLayer defaultOpenId="theme">
        <Pinote id="theme" position={{ x: 50, y: 50 }} content="Dark preview" />
      </PinoteLayer>
    </div>,
  );
  expect(screen.getByRole("dialog")).toHaveAttribute(
    "data-pinote-theme",
    "dark",
  );
});

it("keeps the theme when an open layer changes its portal container", () => {
  const target = document.createElement("div");
  document.body.append(target);
  const example = (portalContainer: HTMLElement | null) => (
    <div className="dark">
      <PinoteLayer openId="theme" portalContainer={portalContainer}>
        <Pinote id="theme" position="top-right" content="Retargeted preview" />
      </PinoteLayer>
    </div>
  );
  const { rerender, unmount } = render(example(null));
  rerender(example(target));
  expect(target).toContainElement(screen.getByRole("dialog"));
  expect(screen.getByRole("dialog")).toHaveAttribute(
    "data-pinote-theme",
    "dark",
  );
  unmount();
  target.remove();
});
