import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PinoteHighlight, PinoteLayer, PinoteProvider } from "./index";

describe("PinoteHighlight", () => {
  it("keeps highlighted copy in the document flow and opens its pinote", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <p>
            react-
            <PinoteHighlight
              id="wordmark-copy"
              content="This is attached to highlighted text."
            >
              pinote
            </PinoteHighlight>
          </p>
        </PinoteLayer>
      </PinoteProvider>,
    );

    const highlightedCopy = screen.getByText("pinote");
    expect(highlightedCopy).toHaveAttribute(
      "data-slot",
      "pinote-highlight-text",
    );

    await user.hover(highlightedCopy);

    expect(screen.getByRole("dialog", { name: "Pinote" })).toHaveTextContent(
      "This is attached to highlighted text.",
    );
    expect(
      screen.getByRole("button", { name: "Open pinote" }),
    ).toBeEmptyDOMElement();
  });

  it("supports the same opening animation presets", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <PinoteHighlight
            animation="slide"
            id="animated-highlight"
            content="Slide from the highlighted copy."
          >
            highlighted copy
          </PinoteHighlight>
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.hover(screen.getByText("highlighted copy"));

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-animation",
      "slide",
    );
  });

  it("positions content from the inline trigger", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <PinoteHighlight
            id="positioned-highlight"
            content="Positioned from the final text fragment."
          >
            final fragment
          </PinoteHighlight>
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.hover(screen.getByText("final fragment"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveStyle({ position: "fixed" });
    });
  });

  it("opens from the inline trigger with the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <PinoteProvider>
        <PinoteLayer>
          <PinoteHighlight
            id="keyboard-highlight"
            content="Keyboard highlight content"
          >
            keyboard copy
          </PinoteHighlight>
        </PinoteLayer>
      </PinoteProvider>,
    );

    await user.tab();

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Keyboard highlight content",
    );
  });
});
