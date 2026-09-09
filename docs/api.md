# API reference

[Overview](../README.md) · [Styling](styling.md)

Import components, hooks and types from `react-pinote`.

## PinoteLayer

Groups pinotes and manages which one is open.

| Prop                 | Type                           | Default         | Description                                      |
| -------------------- | ------------------------------ | --------------- | ------------------------------------------------ |
| `children`           | `ReactNode`                    | Required        | Pinotes and the UI they annotate.                |
| `openId`             | `string \| null`               | Uncontrolled    | The open pinote. Pass `null` to close all.       |
| `defaultOpenId`      | `string`                       | None            | Opens this pinote after hydration.               |
| `onOpenChange`       | `(id: string \| null) => void` | None            | Receives requests to change the open pinote.     |
| `animation`          | `PinoteAnimation`              | `"scale"`       | Default panel animation.                         |
| `portal`             | `boolean`                      | `true`          | Renders panels in a portal.                      |
| `portalContainer`    | `HTMLElement \| null`          | `document.body` | Portal destination.                              |
| `className`, `style` | React DOM types                | None            | Layer styles, including inherited CSS variables. |

With `openId`, your app must update the value in response to `onOpenChange`. Externally opened pinotes stay open until the app closes them.

## Pinote

With `children`, the marker attaches to their wrapper. Without children, it uses the layer's coordinates.

| Prop               | Type                                 | Default   | Description                                        |
| ------------------ | ------------------------------------ | --------- | -------------------------------------------------- |
| `id`               | `string`                             | Required  | Unique within the layer.                           |
| `content`          | `ReactNode`                          | Required  | Panel content.                                     |
| `children`         | `ReactNode`                          | None      | Component to annotate.                             |
| `position`         | `PinotePosition \| PinotePlacement`  | See below | Controlled position.                               |
| `defaultPosition`  | `PinotePosition \| PinotePlacement`  | See below | Initial standalone position.                       |
| `draggable`        | `boolean`                            | `false`   | Enables pointer dragging on standalone markers.    |
| `onPositionChange` | `(position: PinotePosition) => void` | None      | Runs during dragging and on cancellation rollback. |
| `onDragEnd`        | `(position: PinotePosition) => void` | None      | Runs after a completed move.                       |

Standalone pinotes require either `position` or `defaultPosition`, never both. Attachments accept `position` and default to `"top-right"`.

### Position

```ts
type PinotePosition = { x: number; y: number };

type PinotePlacement =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";
```

Supply finite percentages from 0 to 100. The marker's center sits at that point. Attachments measure their wrapper; standalone markers measure their layer. Positions use physical edges, including in right-to-left layouts. Keep overflow visible if markers sit on an edge.

Dragging clamps coordinates to 0–100. Cancellation restores the starting position; clicks and cancelled moves do not call `onDragEnd`. Dragging closes the panel and pauses hover previews until the pointer leaves. It has no keyboard shortcuts.

### Appearance and behavior

These props also apply to `PinoteHighlight`.

| Prop                 | Type                                          | Default                   | Description                                                                         |
| -------------------- | --------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `variant`            | `"popover" \| "expand"`                       | `"popover"`               | Separate panel or expansion from the marker.                                        |
| `color`              | Hexadecimal string                            | `"#2c2c2c"`               | Marker and panel background.                                                        |
| `orientation`        | `"auto"` or a corner name                     | `"auto"`                  | Pointed corner. Auto points toward attachments; standalone markers use bottom-left. |
| `animation`          | `PinoteAnimation`                             | Layer setting             | Panel animation.                                                                    |
| `entranceAnimation`  | `"pop" \| "none"`                             | `"pop"`                   | Marker entrance after hydration.                                                    |
| `preview`            | `boolean`                                     | `true`                    | Allows hover and keyboard-focus previews.                                           |
| `author`             | `{ name: string; avatarUrl?: string }`        | None                      | Default author name and avatar.                                                     |
| `authorPlacement`    | `"inside" \| "beside"`                        | `"inside"`                | Places the author avatar in or beside the trigger.                                  |
| `icon`               | `ReactNode`                                   | Avatar or note glyph      | Replaces the trigger visual. Use `null` for an empty marker.                        |
| `header`             | `ReactNode`                                   | Author name               | Replaces the panel heading. Use `null` to omit it.                                  |
| `leading`            | `ReactNode`                                   | Author avatar             | Replaces the panel's leading visual. Use `null` to omit it.                         |
| `triggerAside`       | `ReactNode`                                   | Side avatar               | Custom decoration beside the trigger. Works without an author.                      |
| `initialFocusRef`    | `RefObject<HTMLElement \| null>`              | First control, then panel | Visible, focusable target for explicit opening.                                     |
| `onInteractOutside`  | `(event: PointerEvent \| FocusEvent) => void` | None                      | Reports outside pointer presses or focus leaving the attachment and panel.          |
| `aria-label`         | `string`                                      | Based on author           | Accessible label for the trigger and panel.                                         |
| `className`, `style` | React DOM types                               | None                      | Applied to the wrapper and panel. Supports `--pinote-*` variables.                  |

`PinoteAnimation` accepts `"fade"`, `"scale"`, `"slide"` or `"none"`. Corner names are `"top-left"`, `"top-right"`, `"bottom-left"` and `"bottom-right"`.

## PinoteHighlight

Underlines text and attaches a marker to it. Requires `id`, `content` and `children`. Accepts the appearance props above and an optional `position`.

The marker's pointed corner touches the text's top-right corner by default. The highlight is an inline-block box; longer text can wrap inside it. Use text or non-interactive inline markup as children. Put controls in `content`. Highlights do not support dragging.

## Composition and focus

Your components can use `usePinote()` in any content or visual slot, including a portal.

```tsx
import { usePinote } from "react-pinote";

function NoteHeader() {
  const { close } = usePinote();
  return <button onClick={close}>Close note</button>;
}
```

Pass `header={<NoteHeader />}` to use this header. Keep `icon` and `triggerAside` non-interactive because they render inside the trigger button. In an expansion, `leading` moves between the marker center and its place in the panel.

To focus an editor instead of the first control:

```tsx
import { useRef } from "react";
import { Pinote } from "react-pinote";

function EditableNote() {
  const editor = useRef<HTMLTextAreaElement>(null);
  return (
    <Pinote
      id="draft"
      position="center"
      initialFocusRef={editor}
      content={<textarea ref={editor} aria-label="Draft" />}
    />
  );
}
```

Render it inside a `PinoteLayer`. An editor loaded asynchronously should focus itself when ready. Keep state above the pinote if it must survive closing.

## Hooks

| Hook               | Returns                                  | Where to use it                            |
| ------------------ | ---------------------------------------- | ------------------------------------------ |
| `usePinote()`      | `{ id, isOpen, isPreview, open, close }` | Inside a pinote's content or visual slots. |
| `usePinoteLayer()` | `{ openId, open(id), close }`            | Anywhere inside a layer.                   |

Use `isPreview` to show a summary on hover and full content after activation. `isOpen` becomes false when closing starts; content remains mounted until its exit finishes. `open()` requests a persistent open state. `close()` requests dismissal. Layer-controlled state still belongs to the app.

## Outside interactions

`onInteractOutside` receives native DOM events, including while the pinote is closed. Focus moving between the trigger and portaled content stays inside the group. Calling `event.preventDefault()` on an outside pointer press cancels the default close. Focus leaving dismisses a preview, but does not close persistent content by itself.

The library never consumes a pinote. To remove one after viewing, combine `preview={false}`, the layer hook and conditional rendering in your app. This replaces the former `dismissOnOutsideClick` prop.

## getPinotePosition

```ts
declare function getPinotePosition(
  pointer: Pick<PointerEvent, "clientX" | "clientY">,
  container: Element,
): PinotePosition;
```

Converts viewport pointer coordinates to percentages of the container's inner box. Accounts for borders and simple scaling, then clamps to 0–100. Use a container matching the layer's dimensions. Rotated or skewed containers are unsupported. Empty containers and non-finite pointer coordinates throw `RangeError`.
