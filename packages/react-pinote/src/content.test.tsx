import { useRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Pinote,
  PinoteLayer,
  PinoteProvider,
  PinoteTrigger,
  usePinote,
  usePinoteProvider,
} from "./index";

function AppContent() {
  const { isPreview, close } = usePinote();
  return isPreview ? (
    <p>Short preview</p>
  ) : (
    <>
      <textarea aria-label="App input" />
      <button onClick={close}>Close content</button>
    </>
  );
}

describe("app-owned pinote content", () => {
  it("lets an app-owned header close its containing pinote", async () => {
    function Header() {
      const { close } = usePinote();
      return <button onClick={close}>Close from header</button>;
    }
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="header"
            position="center"
            header={<Header />}
            content="App content"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.click(trigger);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Close from header" }),
      ).toHaveFocus(),
    );
    await user.click(screen.getByRole("button", { name: "Close from header" }));
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focuses the first control without preferring an editable input", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="ordered"
            position="center"
            content={
              <>
                <button>First action</button>
                <textarea aria-label="Editor" />
              </>
            }
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open pinote" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "First action" }),
      ).toHaveFocus(),
    );
  });

  it("allows a custom header and leading visual without author data", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="slots"
            position="center"
            variant="expand"
            header={<strong>Release status</strong>}
            leading={<svg aria-label="App mark" />}
            content="Ready"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open pinote" }));
    const panel = screen.getByRole("dialog");
    expect(panel).toHaveTextContent("Release status");
    expect(
      panel.querySelector('[data-slot="pinote-leading"] svg'),
    ).toBeInTheDocument();
    expect(
      panel.querySelector('[data-slot="pinote-author"]'),
    ).not.toBeInTheDocument();
  });

  it("can omit the default author header and avatar independently", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote
            id="slots"
            position="center"
            author={{ name: "Ada", avatarUrl: "/ada.png" }}
            header={null}
            leading={null}
            content="Ready"
          />
        </PinoteLayer>
      </PinoteProvider>,
    );
    await user.click(
      screen.getByRole("button", { name: "Open pinote from Ada" }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Ready");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Ada");
    expect(
      screen.getByRole("dialog").querySelector("img"),
    ).not.toBeInTheDocument();
  });

  it("does not reclaim focus if the user moves it before the opening frame", async () => {
    let frame: FrameRequestCallback | undefined;
    const animationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    try {
      const user = userEvent.setup();
      render(
        <>
          <PinoteProvider>
            <PinoteLayer>
              <Pinote id="custom" position="center" content={<AppContent />} />
            </PinoteLayer>
          </PinoteProvider>
          <button>Outside action</button>
        </>,
      );
      await user.click(screen.getByRole("button", { name: "Open pinote" }));
      expect(frame).toBeTypeOf("function");
      const outside = screen.getByRole("button", { name: "Outside action" });
      act(() => outside.focus());
      act(() => frame!(performance.now()));
      expect(outside).toHaveFocus();
    } finally {
      animationFrame.mockRestore();
    }
  });

  it("previews without stealing focus and focuses app inputs on pointer activation", async () => {
    const user = userEvent.setup();
    render(
      <PinoteProvider>
        <PinoteLayer>
          <Pinote id="custom" position="center" content={<AppContent />} />
        </PinoteLayer>
      </PinoteProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Open pinote" });
    await user.hover(trigger);
    expect(screen.getByText("Short preview")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(document.body);
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Close content" }));
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets apps override focus and supply their own trigger content", async () => {
    const user = userEvent.setup();
    function App() {
      const focus = useRef<HTMLButtonElement>(null);
      return (
        <PinoteProvider>
          <PinoteLayer>
            <Pinote
              id="custom"
              position="center"
              render={
                <PinoteTrigger>
                  <span>App badge</span>
                </PinoteTrigger>
              }
              initialFocusRef={focus}
              content={
                <>
                  <input aria-label="Other input" />
                  <button ref={focus}>Chosen target</button>
                </>
              }
            />
          </PinoteLayer>
        </PinoteProvider>
      );
    }
    render(<App />);
    expect(screen.getByText("App badge")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "App badge" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Chosen target" }),
      ).toHaveFocus(),
    );
  });

  it("keeps layer hook requests controlled by the app", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controls() {
      const { open } = usePinoteProvider();
      return <button onClick={() => open("custom")}>App action</button>;
    }
    render(
      <PinoteProvider openId={null} onOpenChange={onOpenChange}>
        <PinoteLayer>
          <Controls />
          <Pinote id="custom" position="center" content="App content" />
        </PinoteLayer>
      </PinoteProvider>,
    );
    await user.click(screen.getByRole("button", { name: "App action" }));
    expect(onOpenChange).toHaveBeenLastCalledWith("custom");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
