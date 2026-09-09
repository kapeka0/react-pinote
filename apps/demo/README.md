# Landing maintenance

The Astro demo uses the local `react-pinote` workspace package. Each deployment includes the library from the same commit, which can differ from the latest npm release.

The React island wraps the landing in one `PinoteProvider`. `PinoteLayer` supplies the page-sized coordinate area. The photo pinote uses `render` with an app-styled button. The conversation uses `render` with `ConversationTrigger`, which composes the exported `PinoteTrigger` with app-owned logos, overlap and hover styles. The remaining pinotes use default markers without passing `icon`. Author photos are supplied explicitly.

The installation button copies `npm i react-pinote` and shows a checkmark for two seconds after a successful copy. If clipboard access fails, the command stays selectable and a message explains how to copy it manually. Reduced motion uses a crossfade for the icons.

## Saved positions

All five draggable markers save their layer percentages to `localStorage` after a completed drag. They mount after storage is read, then use `defaultPosition` so dragging stays local to each marker. Invalid or unavailable storage falls back to that marker's initial position. The text attachment stays fixed.

The blue marker keeps its existing `react-pinote:demo-position:v1` key. The others append their Pinote ID, such as `react-pinote:demo-position:v1:kapeka`. Bump the shared key version in `Demo.tsx` when changing the landing layout to start from fresh positions. Resizing keeps the saved percentages relative to the layer.

The red marker's disappearance lasts only for the current visit. Reloading brings it back at its last saved position. All storage and dismissal behavior belongs to the demo; the library API is unchanged.

## Open Graph image

From the repository root, run `pnpm og` after changing the landing. On a fresh checkout, install the capture browser once with `pnpm exec playwright install chromium`.

The command builds the library and demo, opens a temporary local preview, and captures the page at 1200 × 630 with fresh browser storage. It waits for hydration and fonts, disables motion, and compresses the capture into a PNG palette with Sharp. It closes the preview and browser when finished.

Inspect `public/og-image.png` and commit it with the landing changes. The command also updates the local build's image. Production builds serve the committed PNG, referenced by the page's Open Graph and Twitter card tags.

## Photography

The yellow pinote displays [a curtain photographed by Pushparaj S](https://unsplash.com/photos/a-close-up-of-a-curtain-y6kUbpYKp5k), used under the [Unsplash License](https://unsplash.com/license). The source is `src/assets/sunlit-curtain.jpg`. Astro crops it to a 496 × 372 WebP at build time for a 248 × 186 display, and the browser loads it when the pinote opens.

The photo panel uses the library's `slide` animation, moving up 6 px as it opens and down 6 px during its 220 ms exit. Entry and exit use the library defaults.
