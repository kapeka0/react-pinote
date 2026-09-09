# react-pinote

Lightweight annotations for React. Attach notes to elements, text or coordinates. Hover to preview, click to keep them open.

Compatible with React 18, React 19 and [shadcn/ui](docs/styling.md#shadcn-and-dark-mode). TypeScript and styles included. React and React DOM are the only runtime dependencies.

[Live demo](https://react-pinote.vercel.app)

## Install

```sh
npm i react-pinote
```

## Usage

Wrap your app in `PinoteProvider`, then place a `Pinote` around the element you want to annotate:

```tsx
import { Pinote, PinoteProvider } from "react-pinote";

export default function App() {
  return (
    <PinoteProvider>
      <Pinote id="heading" content="Could this heading be shorter?">
        <h1>Get started</h1>
      </Pinote>
    </PinoteProvider>
  );
}
```

The provider adds no HTML wrapper and keeps one note open at a time. Give each note a unique `id` within its provider.

Use `PinoteHighlight` to annotate text. To place and drag notes by coordinates, use `PinoteLayer`.

Content can be text or your own React components. Pinote handles positioning, motion and focus. Your app owns the data and actions.

## Documentation

- [React, Next.js and Astro setup](docs/frameworks.md)
- [Text annotations](docs/api.md#pinotehighlight) and [draggable notes](docs/api.md#pinotelayer)
- [Custom triggers](docs/api.md#custom-triggers) and [content](docs/api.md#composition-and-focus)
- [Styling, Tailwind and shadcn/ui](docs/styling.md)
- [Full API reference](docs/api.md)

## License

[MIT](LICENSE)
