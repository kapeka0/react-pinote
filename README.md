# react-pinote

React annotations attached to a position, a component or a word. Hover to preview. Click to keep the content open.

Compatible with React 18, React 19 and [shadcn/ui](docs/styling.md#shadcn-and-dark-mode). Includes TypeScript types and CSS. React and React DOM are the only runtime dependencies.

[API reference](docs/api.md) · [React, Next.js and Astro](docs/frameworks.md) · [Styling](docs/styling.md) · [Development](docs/development.md)

## Install

```sh
npm i react-pinote
```

Styles are included. No separate CSS import is needed.

Try the [live demo](https://react-pinote.vercel.app). To build or install the package from source, see [development](docs/development.md#local-package).

## Usage

```tsx
import { Pinote, PinoteProvider } from "react-pinote";

export function Example() {
  return (
    <PinoteProvider>
      <Pinote id="save" position="top-left" content="Save a draft first.">
        <button type="button">Save</button>
      </Pinote>
    </PinoteProvider>
  );
}
```

Every pinote needs a `PinoteProvider`. Place one at your app root or around the section that uses pinotes. It adds no HTML wrapper. Each provider keeps one pinote open, so IDs must be unique within it. See [root setup](docs/frameworks.md) for React, Next.js and Astro.

Markers have no icon by default. Pass `icon={<YourIcon />}` to add one. A supplied author photo appears in the marker unless an icon replaces it.

### Attach to text

```tsx
import { PinoteHighlight, PinoteProvider } from "react-pinote";

<PinoteProvider>
  <p>
    A thought attached to a{" "}
    <PinoteHighlight
      id="word"
      variant="expand"
      content="A little context, right here."
    >
      word
    </PinoteHighlight>
    .
  </p>
</PinoteProvider>;
```

`variant="expand"` turns the marker into the content panel. The default `popover` variant opens a separate panel. Both work with or without an author.

Text and component attachments position the marker relative to their content. They do not need a layer and do not support dragging.

### Place and drag a marker

```tsx
import { Pinote, PinoteLayer, PinoteProvider } from "react-pinote";

<PinoteProvider>
  <PinoteLayer style={{ height: 320 }}>
    <Pinote
      id="movable"
      draggable
      defaultPosition={{ x: 25, y: 40 }}
      content="Drag me around."
    />
  </PinoteLayer>
</PinoteProvider>;
```

Standalone markers need a `PinoteLayer` as their coordinate area. Give it a nonzero size, zero padding and no positioned wrapper between it and the marker. Coordinates are percentages measured from the layer's top-left corner. Multiple layers can share one provider.

Use `defaultPosition` for internal position state. To control it from your app, pass `position` and `onPositionChange`. Save completed moves with `onDragEnd`.

### Use your own trigger

```tsx
import { Pinote, PinoteProvider } from "react-pinote";

<PinoteProvider>
  <Pinote
    id="heading"
    content="Could this heading be shorter?"
    render={
      <button
        type="button"
        className="rounded-full bg-blue-600 px-3 py-2 text-white"
      >
        Comment
      </button>
    }
  >
    <h1>Get started</h1>
  </Pinote>
</PinoteProvider>;
```

`render` replaces the whole trigger. `children` remains the content being annotated. Use plain CSS, Tailwind classes or a shadcn button that forwards its ref and props. The library handles activation, positioning and focus. It does not apply the default marker's appearance to your button.

For state-based rendering, use `render={(props, state) => <button {...props}>...</button>}`. See [the render contract](docs/api.md#custom-triggers) for props, state and event composition.

To keep the default marker appearance, use the exported `PinoteTrigger`. It accepts normal button props and your own non-interactive children:

```tsx
import { Pinote, PinoteProvider, PinoteTrigger } from "react-pinote";

<PinoteProvider>
  <Pinote
    id="review"
    aria-label="Read review"
    content="Could this heading be shorter?"
    render={
      <PinoteTrigger>
        <span aria-hidden="true">?</span>
      </PinoteTrigger>
    }
  >
    <h1>Get started</h1>
  </Pinote>
</PinoteProvider>;
```

An empty `<PinoteTrigger />` has no icon. Compose any badges, images or overlapping decoration inside it with your app's components and CSS.

## Use your own content

`content`, `header` and `leading` accept your components. `icon` adds an optional visual to the default marker. The optional `author` prop supplies a name and photo without a custom layout. A custom `render` owns its entire trigger, including any decoration.

`usePinote()` gives content and visual slots access to `isPreview`, `open()` and `close()`. Your app owns comment data, editing permissions and storage. See [composition and focus](docs/api.md#composition-and-focus).

## Interaction

- Hover or keyboard focus opens a preview. Set `preview={false}` for explicit activation only.
- Click, tap, Enter or Space keeps the content open. An outside click or Escape closes it.
- Explicit opening focuses the first available control, or the panel itself. Use `initialFocusRef` to choose another target. Hover never moves focus.
- Tab moves through the content without trapping focus. Escape restores focus to the trigger when focus was inside.

Panels open after hydration and use a portal. They stay within the viewport. Motion respects the user's reduced-motion preference.

## License

[MIT](LICENSE)
