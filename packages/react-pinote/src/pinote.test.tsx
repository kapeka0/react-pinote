import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pinote, PinoteLayer } from "./index";

describe("Pinote", () => {
  it("reveals an anonymous pinote without rendering invented author details", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          id="anonymous-copy"
          position={{ x: 25, y: 40 }}
          content="Tighten this sentence."
        />
      </PinoteLayer>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.hover(screen.getByRole("button", { name: "Open pinote" }));

    expect(screen.getByRole("dialog", { name: "Pinote" })).toHaveTextContent(
      "Tighten this sentence.",
    );
    expect(screen.queryByText(/anonymous/i)).not.toBeInTheDocument();
  });

  it("keeps a clicked pinote open until Escape closes it", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          id="persistent-copy"
          position={{ x: 50, y: 50 }}
          content="This stays open."
        />
      </PinoteLayer>,
    );

    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.click(trigger);
    await user.unhover(trigger);

    expect(screen.getByRole("dialog")).toHaveTextContent("This stays open.");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports changes while a controlled layer keeps ownership of open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <PinoteLayer openId="first" onOpenChange={onOpenChange}>
        <Pinote id="first" position={{ x: 20, y: 20 }} content="First pinote" />
        <Pinote
          id="second"
          position={{ x: 80, y: 80 }}
          content="Second pinote"
        />
      </PinoteLayer>,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("First pinote");

    await user.click(
      screen.getAllByRole("button", { name: "Open pinote" })[1]!,
    );

    expect(onOpenChange).toHaveBeenLastCalledWith("second");
    expect(screen.getByRole("dialog")).toHaveTextContent("First pinote");
  });

  it("uses the optional author identity in the trigger and content", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          author={{ name: "Ada", avatarUrl: "/ada.png" }}
          id="authored-copy"
          position={{ x: 40, y: 60 }}
          content="Ship the clearer version."
        />
      </PinoteLayer>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open pinote from Ada",
    });
    expect(trigger.querySelector("img")).toHaveAttribute("src", "/ada.png");

    await user.hover(trigger);

    const dialog = screen.getByRole("dialog", { name: "Ada's pinote" });
    expect(dialog).toHaveTextContent("Ada");
    expect(dialog).toHaveTextContent("Ship the clearer version.");
  });

  it("lets a custom icon override the authored trigger avatar", () => {
    render(
      <PinoteLayer>
        <Pinote
          author={{ name: "Grace", avatarUrl: "/grace.png" }}
          icon={<svg data-testid="custom-spark" />}
          id="custom-icon"
          position={{ x: 10, y: 90 }}
          content="Custom icon content"
        />
      </PinoteLayer>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open pinote from Grace",
    });

    expect(within(trigger).getByTestId("custom-spark")).toBeInTheDocument();
    expect(trigger.querySelector("img")).not.toBeInTheDocument();
  });

  it("opens a pinote when its trigger receives keyboard focus", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          id="keyboard-copy"
          position={{ x: 35, y: 35 }}
          content="Keyboard reachable content"
        />
      </PinoteLayer>,
    );

    await user.tab();

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Keyboard reachable content",
    );
  });

  it("closes a persistent pinote after an outside interaction", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          id="outside-copy"
          position={{ x: 60, y: 30 }}
          content="Close me from outside."
        />
      </PinoteLayer>,
    );

    await user.click(screen.getByRole("button", { name: "Open pinote" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("can render content inside the layer when its portal is disabled", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer portal={false}>
        <Pinote
          id="inline-copy"
          position={{ x: 50, y: 50 }}
          content="Inline content"
        />
      </PinoteLayer>,
    );

    await user.hover(screen.getByRole("button", { name: "Open pinote" }));

    const layer = screen
      .getByText("Inline content")
      .closest('[data-slot="pinote-layer"]');
    expect(layer).not.toBeNull();
  });

  it("applies the selected opening animation preset", async () => {
    const user = userEvent.setup();

    render(
      <PinoteLayer>
        <Pinote
          animation="fade"
          id="animated-copy"
          position={{ x: 45, y: 55 }}
          content="Fade this content in."
        />
      </PinoteLayer>,
    );

    await user.hover(screen.getByRole("button", { name: "Open pinote" }));

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-animation",
      "fade",
    );
  });

  it("moves portal content away from the nearest viewport edge", async () => {
    const user = userEvent.setup();
    const rect = (left: number, top: number, width: number, height: number) =>
      ({
        bottom: top + height,
        height,
        left,
        right: left + width,
        top,
        width,
        x: left,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
    const bounds = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return this.dataset.slot === "pinote-content"
          ? rect(0, 0, 240, 120)
          : rect(980, 240, 28, 28);
      });

    render(
      <PinoteLayer>
        <Pinote
          id="edge-copy"
          position={{ x: 98, y: 40 }}
          content="Stay inside the viewport."
        />
      </PinoteLayer>,
    );

    await user.hover(screen.getByRole("button", { name: "Open pinote" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "left");
    });
    expect(screen.getByRole("dialog")).toHaveStyle({ position: "fixed" });

    bounds.mockRestore();
  });

  it("uses a dependency-free note glyph for an anonymous trigger", () => {
    render(
      <PinoteLayer>
        <Pinote
          id="default-glyph"
          position={{ x: 50, y: 50 }}
          content="Default icon content"
        />
      </PinoteLayer>,
    );

    const trigger = screen.getByRole("button", { name: "Open pinote" });
    expect(trigger.querySelector("svg")).toBeInTheDocument();
  });
});
