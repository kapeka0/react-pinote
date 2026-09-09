import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Pinote,
  PinoteHighlight,
  PinoteLayer,
  getPinotePosition,
} from "../dist/index.js";
import type { PinotePlacement, PinotePosition } from "../dist/index.js";
import { OneTimePinote } from "../../../apps/demo/src/components/OneTimePinote";

const logo = (
  <svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="10" fill="tomato" />
  </svg>
);

function ComposablePinote() {
  const editor = useRef<HTMLTextAreaElement>(null);
  const [details, setDetails] = useState(false);
  return (
    <PinoteLayer style={{ height: 200 }}>
      <Pinote
        id="composable"
        preview={false}
        aria-label="Composable pinote"
        position="center"
        variant="expand"
        icon={logo}
        leading={logo}
        header={
          <div>
            <strong>App header</strong>
            <button onClick={() => setDetails(!details)}>Toggle context</button>
          </div>
        }
        triggerAside={<span aria-hidden="true">App badge</span>}
        initialFocusRef={editor}
        style={{
          "--pinote-aside-offset": "17px",
          "--pinote-aside-reveal": "7px",
          "--pinote-hover-scale": "0.9",
          "--pinote-entrance-delay": "300ms",
          "--pinote-entrance-duration": "600ms",
          "--pinote-easing": "linear",
          "--pinote-expand-duration": "700ms",
          "--pinote-collapse-duration": "900ms",
        }}
        content={
          <>
            <textarea ref={editor} aria-label="App editor" />
            {details && (
              <p>
                Extra context from the application changes the panel height
                while it remains open.
              </p>
            )}
          </>
        }
      />
    </PinoteLayer>
  );
}

function Fixture() {
  const [position, setPosition] = useState<PinotePosition>({ x: 50, y: 50 });
  const [dragged, setDragged] = useState<PinotePosition>({ x: 50, y: 50 });
  const [dragEnds, setDragEnds] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);
  const [attachment, setAttachment] = useState("top-left");
  const [keepAttachedOpen, setKeepAttachedOpen] = useState(false);
  const [attachmentHeight, setAttachmentHeight] = useState(80);
  const [orientation, setOrientation] = useState<
    "auto" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >("auto");
  return (
    <>
      <h1>Pinote browser tests</h1>
      <div className="light">
        <div
          className="dark"
          data-testid="local-theme"
          style={{ width: "min(600px, 90vw)" }}
        >
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
                    <span style={{ display: "none" }}>
                      <button type="button">Hidden action</button>
                    </span>
                    <button type="button" style={{ visibility: "hidden" }}>
                      Invisible action
                    </button>
                    <button type="button" onClick={() => setClicks(clicks + 1)}>
                      Increase
                    </button>
                    <span>{clicks} clicks</span>
                    <a href="#after">Details</a>
                  </>
                }
              >
                This highlighted sentence wraps naturally across several lines
                of text.
              </PinoteHighlight>
            </p>
          </PinoteLayer>
        </div>
      </div>
      <button type="button" id="after">
        After layer
      </button>
      <PinoteLayer style={{ height: 100 }}>
        {(
          [
            ["neutral", undefined],
            ["blue", "#1d4ed8"],
            ["red", "#b91c1c"],
          ] as const
        ).map(([name, color], index) => (
          <Pinote
            key={name}
            id={name}
            aria-label={`${name} pinote`}
            {...(color ? { color } : {})}
            position={{ x: 20 + index * 30, y: 50 }}
            content={`${name} content`}
          />
        ))}
        <Pinote
          id="instant"
          aria-label="Instant pinote"
          position={{ x: 95, y: 50 }}
          animation="none"
          content="No panel animation"
        />
      </PinoteLayer>
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
            draggable
            onPositionChange={setPosition}
            style={{ pointerEvents: "auto" }}
            position={position}
            content="Positioned from your pointer"
          />
        </PinoteLayer>
      </div>
      <output>{JSON.stringify(position)}</output>
      <PinoteLayer
        style={{ height: 180, margin: 20, border: "8px solid silver" }}
      >
        <Pinote
          id="draggable"
          aria-label="Draggable pinote"
          draggable
          defaultPosition={{ x: 50, y: 50 }}
          onPositionChange={setDragged}
          onDragEnd={() => setDragEnds((count) => count + 1)}
          content="Drag content"
          entranceAnimation="none"
        />
      </PinoteLayer>
      <output data-testid="drag-position">{JSON.stringify(dragged)}</output>
      <output data-testid="drag-ends">{dragEnds}</output>
      <PinoteLayer style={{ height: 100 }}>
        <OneTimePinote
          id="hiding"
          position="center"
          aria-label="Hiding pinote"
          content={<button type="button">Reply</button>}
        />
      </PinoteLayer>
      <button type="button">After hiding pinote</button>
      <PinoteLayer style={{ height: 160, margin: 40 }}>
        <Pinote
          id="expand"
          aria-label="Expanding pinote"
          position={{ x: 35, y: 65 }}
          variant="expand"
          author={{
            name: "Maya",
            avatarUrl:
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%230d9488' d='M0 0h24v24H0z'/%3E%3Ccircle fill='%23fef3c7' cx='12' cy='10' r='6'/%3E%3C/svg%3E",
          }}
          content="An expanding message"
        />
      </PinoteLayer>
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
      <PinoteLayer style={{ height: 100 }}>
        <Pinote
          id="side-author"
          aria-label="Side author pinote"
          position="center"
          author={{
            name: "Maya",
            avatarUrl:
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle fill='%230d9488' cx='12' cy='12' r='12'/%3E%3C/svg%3E",
          }}
          authorPlacement="beside"
          icon="1"
          content="The author sits beside this trigger."
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
      <label>
        Tip orientation
        <select
          value={orientation}
          onChange={(event) =>
            setOrientation(event.target.value as typeof orientation)
          }
        >
          {["auto", "top-left", "top-right", "bottom-left", "bottom-right"].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={keepAttachedOpen}
          onChange={(event) => setKeepAttachedOpen(event.target.checked)}
        />
        Keep attachment open
      </label>
      <button type="button" onClick={() => setAttachmentHeight(140)}>
        Resize attachment
      </button>
      <PinoteLayer
        style={{ margin: 40 }}
        {...(keepAttachedOpen ? { openId: "attached" } : {})}
      >
        <Pinote
          id="attached"
          aria-label="Attached pinote"
          icon={logo}
          orientation={orientation}
          position={
            attachment === "coordinates"
              ? { x: 25, y: 75 }
              : (attachment as PinotePlacement)
          }
          content="Attached content"
        >
          <button
            type="button"
            style={{ width: 160, height: attachmentHeight }}
          >
            Attached component
          </button>
        </Pinote>
      </PinoteLayer>
      <ComposablePinote />
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
