import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Pinote,
  PinoteHighlight,
  PinoteLayer,
  getPinotePosition,
} from "../dist/index.js";
import type { PinotePlacement, PinotePosition } from "../dist/index.js";

function Fixture() {
  const [position, setPosition] = useState<PinotePosition>({ x: 50, y: 50 });
  const [openId, setOpenId] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);
  const [attachment, setAttachment] = useState("top-left");
  return (
    <>
      <h1>Pinote browser tests</h1>
      <div className="dark" style={{ width: "min(600px, 90vw)" }}>
        <PinoteLayer style={{ height: 180 }}>
          <Pinote
            id="edge"
            aria-label="Edge pinote"
            position={{ x: 100, y: 20 }}
            content="Edge content"
          />
          <p style={{ width: "min(220px, 70vw)", lineHeight: 2 }}>
            <PinoteHighlight
              id="multi"
              aria-label="Multiline pinote"
              content={
                <>
                  <button type="button" onClick={() => setClicks(clicks + 1)}>
                    Increase
                  </button>
                  <span>{clicks} clicks</span>
                  <a href="#after">Details</a>
                </>
              }
            >
              This highlighted sentence wraps naturally across several lines of
              text.
            </PinoteHighlight>
          </p>
        </PinoteLayer>
      </div>
      <button type="button" id="after">
        After layer
      </button>
      <div
        data-testid="surface"
        style={{ margin: 20, border: "8px solid silver" }}
        onPointerDown={(event) => {
          if (
            event.target === event.currentTarget ||
            (event.target as HTMLElement).dataset.slot === "pinote-layer"
          )
            setPosition(getPinotePosition(event, event.currentTarget));
        }}
      >
        <PinoteLayer style={{ height: 180, pointerEvents: "none" }}>
          <Pinote
            id="movable"
            aria-label="Movable pinote"
            style={{ pointerEvents: "auto" }}
            position={position}
            content="Positioned from your pointer"
          />
        </PinoteLayer>
      </div>
      <output>{JSON.stringify(position)}</output>
      <PinoteLayer
        openId={openId}
        onOpenChange={setOpenId}
        style={{ height: 100 }}
      >
        <Pinote
          id="controlled"
          aria-label="Controlled pinote"
          position={{ x: 50, y: 50 }}
          content="Controlled content"
        />
      </PinoteLayer>
      <button type="button" onClick={() => setOpenId("controlled")}>
        Open externally
      </button>
      <button type="button" onClick={() => setOpenId(null)}>
        Close externally
      </button>
      <label>
        Attachment position
        <select
          value={attachment}
          onChange={(event) => setAttachment(event.target.value)}
        >
          <option>top-left</option>
          <option>top-right</option>
          <option>bottom-left</option>
          <option>bottom-right</option>
          <option>coordinates</option>
        </select>
      </label>
      <PinoteLayer style={{ margin: 40 }}>
        <Pinote
          id="attached"
          aria-label="Attached pinote"
          position={
            attachment === "coordinates"
              ? { x: 25, y: 75 }
              : (attachment as PinotePlacement)
          }
          content="Attached content"
        >
          <button type="button" style={{ width: 160, height: 80 }}>
            Attached component
          </button>
        </Pinote>
      </PinoteLayer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
