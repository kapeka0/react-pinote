// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { Pinote, PinoteHighlight, PinoteLayer, PinoteProvider } from "./index";

it("renders initially open pinotes on a server without accessing the DOM", () => {
  expect(() =>
    renderToString(
      <PinoteProvider defaultOpenId="server">
        <PinoteLayer>
          <Pinote
            id="server"
            position={{ x: 50, y: 50 }}
            content="Hydrate me"
          />
          <PinoteHighlight id="copy" content="Inline content">
            Server copy
          </PinoteHighlight>
        </PinoteLayer>
      </PinoteProvider>,
    ),
  ).not.toThrow();
});
