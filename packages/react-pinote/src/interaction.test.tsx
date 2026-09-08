import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Pinote, PinoteHighlight, PinoteLayer } from "./index";

describe.each(["coordinate", "highlight"] as const)(
  "%s keyboard interaction",
  (kind) => {
    it("lets the keyboard enter interactive content and Escape restore focus", async () => {
      const user = userEvent.setup();
      const content = <a href="#details">Read details</a>;
      render(
        <PinoteLayer>
          {kind === "coordinate" ? (
            <Pinote
              id="accessible"
              position={{ x: 50, y: 50 }}
              content={content}
            />
          ) : (
            <PinoteHighlight id="accessible" content={content}>
              A sentence
            </PinoteHighlight>
          )}
          <button type="button">Next action</button>
        </PinoteLayer>,
      );
      await user.tab();
      const trigger = screen.getByRole("button", { name: "Open pinote" });
      await user.tab();
      expect(screen.getByRole("link", { name: "Read details" })).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Next action" })).toHaveFocus();
    });

    it("keeps the preview available while moving into its content", async () => {
      const user = userEvent.setup();
      render(
        <PinoteLayer>
          {kind === "coordinate" ? (
            <Pinote
              id="hover"
              position={{ x: 50, y: 50 }}
              content="Readable preview"
            />
          ) : (
            <PinoteHighlight id="hover" content="Readable preview">
              Marked copy
            </PinoteHighlight>
          )}
        </PinoteLayer>,
      );
      const trigger = screen.getByRole("button", { name: "Open pinote" });
      await user.hover(trigger);
      const panel = screen.getByRole("dialog");
      await user.hover(panel);
      expect(panel).toBeInTheDocument();
      await user.unhover(panel);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  },
);
