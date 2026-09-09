# API reference

[Overview](../README.md) · [Styling](styling.md)

Import components, hooks and types from `react-pinote`.

## PinoteProvider

Shares open state and defaults without adding a DOM element. Required for every pinote. Put it at the app root or around one section. IDs must be unique within the nearest provider. Multiple layers and attachments can share that provider.

| Prop              | Type                           | Default         | Description                                  |
| ----------------- | ------------------------------ | --------------- | -------------------------------------------- |
| `children`        | `ReactNode`                    | Required        | Pinotes and the UI they annotate.            |
| `openId`          | `string \| null`               | Uncontrolled    | The open pinote. Pass `null` to close all.   |
| `defaultOpenId`   | `string`                       | None            | Opens this pinote after hydration.           |
| `onOpenChange`    | `(id: string \| null) => void` | None            | Receives requests to change the open pinote. |
| `animation`       | `PinoteAnimation`              | `"scale"`       | Default panel animation.                     |
| `portal`          | `boolean`                      | `true`          | Renders panels in a portal.                  |
| `portalContainer` | `HTMLElement \| null`          | `document.body` | Portal destination.                          |

With `openId`, your app must update the value in response to `onOpenChange`. Externally opened pinotes stay open until the app closes them.

## PinoteLayer

A `div` with `position: relative` that defines the coordinates and drag bounds for standalone markers. It accepts normal div props and `style`, including `--pinote-*` variables. Give it a nonzero size, zero padding and no positioned wrapper between it and the marker.

Place layers inside a `PinoteProvider`. A layer does not create its own open state. Attachments to text or components need only the provider. Put theme variables on the layer or an app-owned ancestor; the provider has no `className` or `style`.

## Pinote

With `children`, the marker attaches to their wrapper. Without children, it uses the layer's coordinates.

| Prop               | Type                                 | Default   | Description                                        |
| ------------------ | ------------------------------------ | --------- | -------------------------------------------------- |
| `id`               | `string`                             | Required  | Unique within the provider.                        |
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
| `animation`          | `PinoteAnimation`                             | Provider setting          | Panel animation.                                                                    |
| `entranceAnimation`  | `"pop" \| "none"`                             | `"pop"`                   | Marker entrance after hydration.                                                    |
| `preview`            | `boolean`                                     | `true`                    | Allows hover and keyboard-focus previews.                                           |
| `author`             | `{ name: string; avatarUrl?: string }`        | None                      | Default author name and avatar.                                                     |
| `authorPlacement`    | `"inside" \| "beside"`                        | `"inside"`                | Places the author avatar in or beside the trigger.                                  |
| `icon`               | `ReactNode`                                   | Avatar or empty marker    | Optional trigger icon. Overrides the avatar. Use `null` to leave the marker empty.  |
| `render`             | `PinoteRender`                                | Default marker            | Custom trigger element or callback. See below.                                      |
| `header`             | `ReactNode`                                   | Author name               | Replaces the panel heading. Use `null` to omit it.                                  |
| `leading`            | `ReactNode`                                   | Author avatar             | Replaces the panel's leading visual. Use `null` to omit it.                         |
| `triggerAside`       | `ReactNode`                                   | Side avatar               | Custom decoration beside the trigger. Works without an author.                      |
| `initialFocusRef`    | `RefObject<HTMLElement \| null>`              | First control, then panel | Visible, focusable target for explicit opening.                                     |
| `onInteractOutside`  | `(event: PointerEvent \| FocusEvent) => void` | None                      | Reports outside pointer presses or focus leaving the attachment and panel.          |
| `aria-label`         | `string`                                      | Based on author           | Accessible label for the trigger and panel.                                         |
| `className`, `style` | React DOM types                               | None                      | Applied to the wrapper and panel. Supports `--pinote-*` variables.                  |

`PinoteAnimation` accepts `"fade"`, `"scale"`, `"slide"` or `"none"`. The selected preset applies to both entry and exit. Panels close over 220 ms by default; `"none"` disables the transition. See [motion variables](styling.md#motion) to adjust the timing. Corner names are `"top-left"`, `"top-right"`, `"bottom-left"` and `"bottom-right"`.

## Custom triggers

`render` replaces the entire trigger. `children` still identifies the content to annotate. It accepts an element or a callback, following the [composition pattern used by Base UI](https://base-ui.com/react/handbook/composition).

```tsx
import { Pinote, PinoteProvider } from "react-pinote";

<PinoteProvider>
  <Pinote
    id="review"
    content="Review this heading."
    render={<button className="review-button">Review</button>}
  >
    <h1>Get started</h1>
  </Pinote>
</PinoteProvider>;
```

Use one native button, or a component that forwards its ref and all received props to a native button. Avoid fragments, links, non-button elements and nested controls. Give an empty or icon-only button an accessible name with `aria-label`.

For an element, the library merges refs, class names and styles. Your handlers run first; `event.preventDefault()` skips the matching library handler. The library maintains `aria-controls`, `aria-expanded`, `aria-haspopup` and its trigger identity. Styles needed for dragging and the expansion handoff take precedence. Your button owns its dimensions, colors, shape, focus ring and hover styles.

For a callback, spread the supplied props, including `ref`, onto the button:

```tsx
<PinoteProvider>
  <Pinote
    id="review-state"
    content="Review this heading."
    render={(props, state) => (
      <button {...props} className={`${props.className} review-button`}>
        {state.isOpen ? "Reviewing" : "Review"}
      </button>
    )}
  >
    <h1>Get started</h1>
  </Pinote>
</PinoteProvider>
```

The callback receives `PinoteTriggerProps` and `PinoteTriggerState`. State contains `id`, `isOpen`, `isPreview`, `isDragging`, `open()` and `close()`. If you add styles or handlers in the callback, merge `props.style` and call the supplied handlers yourself. Do not call hooks directly in the callback; return a component that uses them.

Both forms support preview, focus, pointer dragging for standalone markers, entrance animation and `variant="expand"`. Expansion measures the custom button's width and height. Set `entranceAnimation="none"` to own the entrance too. Default marker props such as `icon`, `triggerAside` and `authorPlacement` do not decorate a custom trigger; the author still supplies panel content.

## triggerAside

Adds a non-interactive visual beside and partly behind the default marker. It replaces the side author avatar and works without `author`. For example, pass `triggerAside={<AvatarStack />}` for app-owned participant images.

It is part of the same trigger button and shares its activation and hover behavior. Do not put buttons, inputs or links inside it. Use `--pinote-aside-offset` for the resting position and `--pinote-aside-reveal` for the extra hover movement. With `render`, put any decoration in your custom button instead.

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

Render it inside a `PinoteLayer` within a `PinoteProvider`. An editor loaded asynchronously should focus itself when ready. Keep state above the pinote if it must survive closing.

## Hooks

| Hook                  | Returns                                  | Where to use it                                       |
| --------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `usePinote()`         | `{ id, isOpen, isPreview, open, close }` | Inside a pinote's content or visual slots.            |
| `usePinoteProvider()` | `{ openId, open(id), close }`            | Anywhere inside a provider, including outside layers. |

Use `isPreview` to show a summary on hover and full content after activation. `isOpen` becomes false when closing starts; content remains mounted until its exit finishes. `open()` requests a persistent open state. `close()` requests dismissal. Provider-controlled state still belongs to the app.

## Outside interactions

`onInteractOutside` receives native DOM events, including while the pinote is closed. Focus moving between the trigger and portaled content stays inside the group. Calling `event.preventDefault()` on an outside pointer press cancels the default close. Focus leaving dismisses a preview, but does not close persistent content by itself.

The library never consumes a pinote. To remove one after viewing, combine `preview={false}`, the provider hook and conditional rendering in your app. This replaces the former `dismissOnOutsideClick` prop.

## getPinotePosition

```ts
declare function getPinotePosition(
  pointer: Pick<PointerEvent, "clientX" | "clientY">,
  container: Element,
): PinotePosition;
```

Converts viewport pointer coordinates to percentages of the container's inner box. Accounts for borders and simple scaling, then clamps to 0–100. Use a container matching the layer's dimensions. Rotated or skewed containers are unsupported. Empty containers and non-finite pointer coordinates throw `RangeError`.
