import {
  Pinote,
  PinoteHighlight,
  PinoteProvider,
  PinoteLayer,
  PinoteTrigger,
} from "../dist/index.js";
import type {
  PinoteColor,
  PinoteAuthorPlacement,
  PinoteOrientation,
  PinotePosition,
  PinoteProps,
} from "../dist/index.js";

// Compiled against the published declaration entry, not source aliases.
const color: PinoteColor = "#1d4ed8";
const authorPlacement: PinoteAuthorPlacement = "beside";
const orientation: PinoteOrientation = "bottom-right";
const position: PinotePosition = { x: 20, y: 30 };
export const controlled = (
  <Pinote
    id="typed"
    content="Typed"
    draggable
    position={position}
    color={color}
    authorPlacement={authorPlacement}
    orientation={orientation}
    onPositionChange={(next) => next.x.toFixed(2)}
    onDragEnd={(next) => next.y.toFixed(2)}
  />
);
export const uncontrolled = (
  <Pinote
    id="local"
    content="Local"
    defaultPosition="center"
    draggable
    entranceAnimation="none"
    preview={false}
    onInteractOutside={(event) => event.preventDefault()}
    header={<strong>App header</strong>}
    leading={<span>App visual</span>}
  />
);
export const attached = (
  <Pinote id="attached" content="Attached" position="top-left">
    <button>Save</button>
  </Pinote>
);
export const providerAndRender = (
  <PinoteProvider animation="slide" onOpenChange={(id) => id?.toUpperCase()}>
    <Pinote
      id="custom-button"
      content="App styling"
      render={<button>Comment</button>}
    >
      <h1>Title</h1>
    </Pinote>
    <PinoteLayer
      className="relative"
      style={{ height: 200, "--pinote-size": "28px" }}
    >
      <Pinote
        id="callback"
        position="center"
        content="Callback"
        render={(props, state) => (
          <PinoteTrigger {...props}>
            {state.isOpen ? "Open" : state.isDragging ? "Dragging" : "Closed"}
          </PinoteTrigger>
        )}
      />
    </PinoteLayer>
  </PinoteProvider>
);
export const wrongRender = (
  // @ts-expect-error A render trigger must be a React element or render callback.
  <Pinote id="bad-render" position="center" content="Bad" render="Comment" />
);
export const removedAside = (
  <Pinote
    id="old-aside"
    position="center"
    content="Old"
    // @ts-expect-error Compose trigger decoration through render instead.
    triggerAside={<span />}
  />
);
// @ts-expect-error Open state belongs to PinoteProvider, not the coordinate area.
export const layerWithState = <PinoteLayer openId="legacy" />;
export const wrongColor = (
  // @ts-expect-error Colors use hexadecimal strings, not named presets.
  <Pinote id="bad" content="Bad" position="center" color="blue" />
);
// @ts-expect-error Only supported author placements are accepted.
export const wrongAuthorPlacement: PinoteProps["authorPlacement"] = "outside";
// @ts-expect-error A standalone pinote needs a position or defaultPosition.
export const missingPosition = <Pinote id="bad" content="Bad" />;
export const conflictingPosition = (
  // @ts-expect-error Controlled and uncontrolled positions cannot be combined.
  <Pinote
    id="bad"
    content="Bad"
    position={position}
    defaultPosition={position}
  />
);
export const draggableAttachment = (
  // @ts-expect-error Component attachments are not draggable.
  <Pinote id="bad" content="Bad" draggable>
    <button>Save</button>
  </Pinote>
);
export const draggableHighlight = (
  // @ts-expect-error Text highlights stay anchored to their text.
  <PinoteHighlight id="text" content="Attached text" draggable>
    Text
  </PinoteHighlight>
);
