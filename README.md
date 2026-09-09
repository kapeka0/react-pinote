# react-pinote

React annotations attached to a position, a component or a word. Hover to preview. Click to keep the content open.

Supports React 18 and 19. Includes TypeScript types and CSS. React and React DOM are the only runtime dependencies.

[API reference](docs/api.md) · [Styling](docs/styling.md) · [Development](docs/development.md)

## Install from this repository

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter react-pinote pack
```

Install the generated package in your React app:

```sh
pnpm add /path/to/react-pinote-0.1.0.tgz
```

Use matching React and React DOM versions with a CSS-aware bundler such as Vite or Astro. Styles load with the JavaScript import.

## Usage

```tsx
import { Pinote, PinoteLayer } from "react-pinote";

export function Example() {
  return (
    <PinoteLayer style={{ height: 320 }}>
      <Pinote
        id="note"
        position={{ x: 25, y: 40 }}
        content="Could this sentence be shorter?"
      />
    </PinoteLayer>
  );
}
```

Coordinates are percentages of the layer, measured from its top-left corner. Give the layer a nonzero size and keep its padding at zero. Each layer keeps one pinote open, and every pinote needs a unique `id` within that layer.

Place the following examples inside a `PinoteLayer`.

### Attach to text

```tsx
import { PinoteHighlight } from "react-pinote";

<p>
  A thought attached to a{" "}
  <PinoteHighlight
    id="word"
    variant="expand"
    icon={null}
    content="A little context, right here."
  >
    word
  </PinoteHighlight>
  .
</p>;
```

`variant="expand"` turns the marker into the content panel. The default `popover` variant opens a separate panel. Both work with or without an author.

### Attach to a component

```tsx
<Pinote id="save" position="top-left" content="Save a draft first.">
  <button type="button">Save</button>
</Pinote>
```

The position is relative to the wrapped component. Component and text attachments do not support dragging.

### Enable dragging

```tsx
<Pinote
  id="movable"
  draggable
  defaultPosition="center"
  content="Drag me around."
/>
```

Use `defaultPosition` for internal position state. To control it from your app, pass `position` and `onPositionChange`. Save completed moves with `onDragEnd`.

## Use your own content

`content`, `header`, `leading`, `icon` and `triggerAside` accept React nodes. Use them for your app's controls, labels or avatars. The optional `author` prop supplies a name and photo without a custom layout.

`usePinote()` gives content and visual slots access to `isPreview`, `open()` and `close()`. Your app owns comment data, editing permissions and storage. See [composition and focus](docs/api.md#composition-and-focus).

## Interaction

- Hover or keyboard focus opens a preview. Set `preview={false}` for explicit activation only.
- Click, tap, Enter or Space keeps the content open. An outside click or Escape closes it.
- Explicit opening focuses the first available control, or the panel itself. Use `initialFocusRef` to choose another target. Hover never moves focus.
- Tab moves through the content without trapping focus. Escape restores focus to the trigger when focus was inside.

Panels open after hydration and use a portal. They stay within the viewport. Motion respects the user's reduced-motion preference.

## License

[MIT](LICENSE)
