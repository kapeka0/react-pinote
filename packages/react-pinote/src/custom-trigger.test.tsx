import { createRef, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Pinote, PinoteProvider, PinoteTrigger } from "./index";

const AppButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>((props, ref) => <button {...props} ref={ref} />);

it("composes a custom component's ref, events and styles with activation and focus restoration", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  const click = vi.fn();
  render(
    <PinoteProvider>
      <Pinote
        id="custom"
        preview={false}
        author={{ name: "Ada", avatarUrl: "/ada.png" }}
        icon="ignored"
        render={
          <AppButton
            ref={ref}
            className="app-button"
            style={{ width: 90, borderRadius: 6 }}
            onClick={click}
          >
            Discuss
          </AppButton>
        }
        content={<textarea aria-label="Reply" />}
      >
        <h1>Target</h1>
      </Pinote>
    </PinoteProvider>,
  );
  const button = screen.getByRole("button", { name: "Discuss" });
  expect(ref.current).toBe(button);
  expect(button).toHaveClass("app-button");
  expect(button).not.toHaveClass("pn-t");
  expect(button).toHaveStyle({ width: "90px", borderRadius: "6px" });
  expect(button.querySelector("button,img")).toBeNull();
  expect(button).toHaveAttribute("type", "button");
  await user.tab();
  await user.keyboard("{Enter}");
  expect(click).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
  expect(button).toHaveAttribute(
    "aria-controls",
    screen.getByRole("dialog").id,
  );
  await user.keyboard("{Escape}");
  expect(button).toHaveFocus();
  expect(ref.current).toBe(button);
});

it("allows custom handlers to cancel previews and activation", async () => {
  const user = userEvent.setup();
  const cancel = vi.fn((event: { preventDefault: () => void }) =>
    event.preventDefault(),
  );
  render(
    <PinoteProvider>
      <Pinote
        id="cancel"
        content="Cancelled"
        render={
          <button onMouseEnter={cancel} onFocus={cancel} onClick={cancel}>
            Cancel
          </button>
        }
      >
        <span>Target</span>
      </Pinote>
    </PinoteProvider>,
  );
  const button = screen.getByRole("button", { name: "Cancel" });
  await user.hover(button);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(button);
  expect(cancel).toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("reuses the default trigger with app children, composed refs and keyboard activation", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  const click = vi.fn();
  render(
    <PinoteProvider>
      <Pinote
        id="reused"
        preview={false}
        orientation="top-right"
        content={<input aria-label="Draft" />}
        render={
          <PinoteTrigger ref={ref} onClick={click}>
            <span>Read note</span>
          </PinoteTrigger>
        }
      >
        <h1>Target</h1>
      </Pinote>
    </PinoteProvider>,
  );
  const button = screen.getByRole("button", { name: "Read note" });
  expect(ref.current).toBe(button);
  expect(screen.getAllByRole("button")).toHaveLength(1);
  expect(button).toHaveClass("pn-t");
  expect(button).toHaveAttribute("data-orientation", "top-right");
  expect(button.style.borderRadius).toContain("50% 0 50% 50%");
  await user.tab();
  await user.keyboard("{Enter}");
  expect(click).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
  await user.keyboard("{Escape}");
  expect(button).toHaveFocus();
});

it("renders the exported trigger as a plain button without a provider", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <PinoteTrigger
      ref={ref}
      aria-label="Plain marker"
      style={{ borderRadius: 8 }}
    />,
  );
  const button = screen.getByRole("button", { name: "Plain marker" });
  expect(button).toBeEmptyDOMElement();
  expect(button).toHaveStyle({ borderRadius: "8px" });
  expect(button).toHaveAttribute("type", "button");
  expect(button).not.toHaveAttribute("aria-haspopup");
  expect(ref.current).toBe(button);
});

it("does not preview a disabled custom button", async () => {
  const user = userEvent.setup();
  render(
    <PinoteProvider>
      <Pinote
        id="disabled"
        content="Disabled"
        render={<button disabled>Unavailable</button>}
      >
        <span>Target</span>
      </Pinote>
    </PinoteProvider>,
  );
  await user.hover(screen.getByRole("button", { name: "Unavailable" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("passes preview and open state to a render callback", async () => {
  const user = userEvent.setup();
  render(
    <PinoteProvider>
      <Pinote
        id="callback"
        content="Callback content"
        render={(props, state) => (
          <PinoteTrigger
            {...props}
            className={`${props.className} callback`}
            data-testid="callback"
          >
            {state.isOpen ? (state.isPreview ? "Preview" : "Open") : "Closed"}
          </PinoteTrigger>
        )}
      >
        <span>Target</span>
      </Pinote>
    </PinoteProvider>,
  );
  const button = screen.getByTestId("callback");
  expect(button).toHaveTextContent("Closed");
  await user.hover(button);
  expect(button).toHaveTextContent("Preview");
  await user.click(button);
  expect(button).toHaveTextContent("Open");
  await user.keyboard("{Escape}");
  expect(button).toHaveTextContent("Closed");
});

it("keeps callback refs stable through state changes and runs React 19 ref cleanup on unmount", async () => {
  const user = userEvent.setup();
  const cleanup = vi.fn();
  const ref = vi.fn(() => cleanup);
  const { unmount } = render(
    <PinoteProvider>
      <Pinote
        id="refs"
        preview={false}
        content="Ref content"
        render={<button ref={ref}>Refs</button>}
      >
        <span>Target</span>
      </Pinote>
    </PinoteProvider>,
  );
  expect(ref).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Refs" }));
  await user.keyboard("{Escape}");
  expect(ref).toHaveBeenCalledOnce();
  expect(cleanup).not.toHaveBeenCalled();
  unmount();
  expect(cleanup).toHaveBeenCalledOnce();
});
