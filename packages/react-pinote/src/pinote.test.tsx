import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pinote, PinoteLayer, PinoteProvider } from "./index";

describe("Pinote", () => {
  it("keeps a custom icon beside the author avatar", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="beside"
            position="center"
            author={{ name: "Maya", avatarUrl: "/maya.webp" }}
            authorPlacement="beside"
            icon="1"
            content="Side author"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    const trigger = screen.getByRole("button", {
      name: "Open pinote from Maya",
    });
    expect(trigger).toHaveTextContent("1");
    expect(trigger.querySelector("img")).toHaveClass("pn-b");
    expect(trigger.querySelector("img")).toHaveStyle({
      left: "var(--pinote-aside-offset,9px)",
      width: "100%",
    });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toHaveTextContent("Maya");
  });
  it("allows explicit activation without hover or focus previews", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="click"
            position="center"
            preview={false}
            content="Click content"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.hover(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.unhover(trigger);
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
    await user.click(document.body);
    expect(trigger).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports outside interactions without owning removal policy", async () => {
    const user = userEvent.setup();
    const outside = vi.fn();
    render(
      <>
        <PinoteProvider>
          <PinoteLayer>
            <Pinote
              id="events"
              position="center"
              preview={false}
              onInteractOutside={outside}
              content={
                <>
                  <button>Reply</button>
                  <button>Save</button>
                </>
              }
            />
          </PinoteLayer>
        </PinoteProvider>
        <button>Continue</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.click(document.body);
    expect(outside).toHaveBeenCalledOnce();
    expect(outside.mock.calls[0]![0].type).toBe("pointerdown");
    outside.mockClear();
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reply" })).toHaveFocus(),
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    expect(outside).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    expect(outside).toHaveBeenCalledOnce();
    expect(outside.mock.calls[0]![0].type).toBe("focusout");
    expect(trigger).toBeVisible();
  });

  it("allows apps to cancel outside pointer dismissal", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="keep"
            position="center"
            onInteractOutside={(event) => event.preventDefault()}
            content="Keep open"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open pinote" }));
    await user.click(document.body);
    expect(screen.getByRole("dialog")).toHaveTextContent("Keep open");
  });

  it("reveals an anonymous pinote without rendering invented author details", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="anonymous-copy"
            position={{ x: 25, y: 40 }}
            content="Tighten this sentence."
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="persistent-copy"
            position={{ x: 50, y: 50 }}
            content="This stays open."
          />
        </PinoteLayer>
      </PinoteProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.click(trigger);
    await user.unhover(trigger);

    expect(screen.getByRole("dialog")).toHaveTextContent("This stays open.");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports changes while a controlled provider keeps ownership of open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <PinoteProvider openId="first" onOpenChange={onOpenChange}>
        <PinoteLayer>
          <Pinote
            id="first"
            position={{ x: 20, y: 20 }}
            content="First pinote"
          />
          <Pinote
            id="second"
            position={{ x: 80, y: 80 }}
            content="Second pinote"
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            author={{ name: "Ada", avatarUrl: "/ada.png" }}
            id="authored-copy"
            position={{ x: 40, y: 60 }}
            content="Ship the clearer version."
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            author={{ name: "Grace", avatarUrl: "/grace.png" }}
            icon={<svg data-testid="custom-spark" />}
            id="custom-icon"
            position={{ x: 10, y: 90 }}
            content="Custom icon content"
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="keyboard-copy"
            position={{ x: 35, y: 35 }}
            content="Keyboard reachable content"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.tab();

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Keyboard reachable content",
    );
  });

  it("closes a persistent pinote after an outside interaction", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="outside-copy"
            position={{ x: 60, y: 30 }}
            content="Close me from outside."
          />
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open pinote" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("can render content inside the layer when its portal is disabled", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider portal={false}>
        <PinoteLayer>
          <Pinote
            id="inline-copy"
            position={{ x: 50, y: 50 }}
            content="Inline content"
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            animation="fade"
            id="animated-copy"
            position={{ x: 45, y: 55 }}
            content="Fade this content in."
          />
        </PinoteLayer>
      </PinoteProvider>,
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
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="edge-copy"
            position={{ x: 98, y: 40 }}
            content="Stay inside the viewport."
          />
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.hover(screen.getByRole("button", { name: "Open pinote" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "left");
    });
    expect(screen.getByRole("dialog")).toHaveStyle({ position: "fixed" });

    bounds.mockRestore();
  });

  it("renders an empty anonymous trigger when no icon is supplied", () => {
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="note"
            position={{ x: 25, y: 40 }}
            content="Could this sentence be shorter?"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Open pinote" });
    expect(trigger).toBeEmptyDOMElement();
  });
});
