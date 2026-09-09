# React, Next.js and Astro

[Overview](../README.md) · [API reference](api.md)

Every pinote needs a `PinoteProvider`. It adds no DOM element. One provider can serve your entire React tree, including multiple `PinoteLayer` areas. Use separate providers when sections should manage their open state independently. IDs must be unique within each provider.

## React

Wrap your app at its entry point:

```tsx
import { createRoot } from "react-dom/client";
import { PinoteProvider } from "react-pinote";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <PinoteProvider>
    <App />
  </PinoteProvider>,
);
```

Descendants can now use attachments without another wrapper:

```tsx
import { Pinote } from "react-pinote";

export default function App() {
  return (
    <Pinote id="save" position="top-left" content="Save a draft first.">
      <button type="button">Save</button>
    </Pinote>
  );
}
```

For standalone markers, add a `PinoteLayer` around the area they annotate. The provider does not define coordinates.

## Next.js App Router

The package declares its client boundary. You can import `PinoteProvider` in a server layout, following [Next.js's context-provider pattern](https://nextjs.org/docs/app/getting-started/server-and-client-components#context-providers).

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { PinoteProvider } from "react-pinote";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PinoteProvider>{children}</PinoteProvider>
      </body>
    </html>
  );
}
```

The layout can remain a Server Component. If only one route needs pinotes, put the provider in that route's layout. Components that pass callbacks, use hooks or manage editor state need `"use client"`:

```tsx
// app/heading-note.tsx
"use client";

import { Pinote } from "react-pinote";

export function HeadingNote() {
  return (
    <Pinote
      id="heading"
      content="Could this heading be shorter?"
      render={(props, state) => (
        <button {...props}>{state.isOpen ? "Reading" : "Read note"}</button>
      )}
    >
      <h1>Get started</h1>
    </Pinote>
  );
}
```

## Astro

With the [React integration configured](https://docs.astro.build/en/guides/integrations-guide/react/), put the provider and its pinotes in one React island:

```tsx
// src/components/Notes.tsx
import { PinoteHighlight, PinoteProvider } from "react-pinote";

export default function Notes() {
  return (
    <PinoteProvider>
      <p>
        A thought attached to a{" "}
        <PinoteHighlight id="word" content="A little context.">
          word
        </PinoteHighlight>
        .
      </p>
    </PinoteProvider>
  );
}
```

```astro
---
// src/pages/index.astro
import Notes from "../components/Notes";
---

<Notes client:load />
```

Hydrate the parent island with `client:load`. Separate islands do not share React context, even when their HTML is nested. Give each island its own provider, or combine related pinotes in the same island. See [Astro framework components](https://docs.astro.build/en/guides/framework-components/).
