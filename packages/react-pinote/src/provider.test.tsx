import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  Pinote,
  PinoteHighlight,
  PinoteLayer,
  PinoteProvider,
  usePinoteProvider,
} from "./index";

function OpenFromApp() {
  const { open } = usePinoteProvider();
  return <button onClick={() => open("second")}>Open second from app</button>;
}

it("shares open state across layers and attachments without adding a provider wrapper", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <PinoteProvider>
      <main>
        <OpenFromApp />
        <Pinote id="attached" aria-label="Attached" content="Attached content">
          <h1>Heading</h1>
        </Pinote>
        <PinoteHighlight id="word" aria-label="Word" content="Word content">
          Word
        </PinoteHighlight>
        <PinoteLayer data-testid="first-layer">
          <Pinote
            id="first"
            position="center"
            aria-label="First"
            content="First content"
          />
        </PinoteLayer>
        <PinoteLayer data-testid="second-layer">
          <Pinote
            id="second"
            position="center"
            aria-label="Second"
            content="Second content"
          />
        </PinoteLayer>
      </main>
    </PinoteProvider>,
  );
  expect(container.firstElementChild?.tagName).toBe("MAIN");
  expect(
    screen.getByRole("heading").closest('[data-slot="pinote-layer"]'),
  ).toBeNull();
  for (const name of ["Attached", "Word", "First", "Second"]) {
    await user.click(screen.getByRole("button", { name }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog")).toHaveTextContent(`${name} content`);
  }
  await user.keyboard("{Escape}");
  await user.click(
    screen.getByRole("button", { name: "Open second from app" }),
  );
  expect(screen.getByRole("dialog")).toHaveTextContent("Second content");
});

it("scopes identifiers and defaults to the nearest provider", async () => {
  const user = userEvent.setup();
  render(
    <PinoteProvider animation="slide">
      <Pinote id="shared" aria-label="Outer" content="Outer content">
        <span>Outer target</span>
      </Pinote>
      <PinoteProvider animation="none" defaultOpenId="shared">
        <Pinote id="shared" aria-label="Inner" content="Inner content">
          <span>Inner target</span>
        </Pinote>
      </PinoteProvider>
    </PinoteProvider>,
  );
  expect(screen.getByRole("dialog", { name: "Inner" })).toHaveAttribute(
    "data-animation",
    "none",
  );
  await user.click(screen.getByRole("button", { name: "Outer" }));
  expect(screen.getByRole("dialog", { name: "Outer" })).toHaveAttribute(
    "data-animation",
    "slide",
  );
  // Outside clicks can dismiss either scope; opening one never assigns its ID to the other.
  expect(screen.getByRole("button", { name: "Inner" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

it("explains the missing provider and coordinate area separately", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    expect(() =>
      render(
        <Pinote id="missing" content="Missing">
          <span>Target</span>
        </Pinote>,
      ),
    ).toThrow("inside a PinoteProvider");
    expect(() =>
      render(
        <PinoteProvider>
          <Pinote id="missing-area" position="center" content="Missing" />
        </PinoteProvider>,
      ),
    ).toThrow("inside a PinoteLayer within a PinoteProvider");
  } finally {
    error.mockRestore();
  }
});
