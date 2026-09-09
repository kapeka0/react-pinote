# Landing maintenance

The Astro demo uses the local `react-pinote` workspace package. Each deployment includes the library from the same commit, which can differ from the latest npm release.

The installation button copies `npm i react-pinote` and shows a checkmark for two seconds after a successful copy. If clipboard access fails, the command stays selectable and a message explains how to copy it manually. Reduced motion uses a crossfade for the icons.

## Open Graph image

From the repository root, run `pnpm og` after changing the landing. On a fresh checkout, install the capture browser once with `pnpm exec playwright install chromium`.

The command builds the library and demo, opens a temporary local preview, and captures the page at 1200 × 630 with fresh browser storage. It waits for hydration and fonts, disables motion, and compresses the capture into a PNG palette with Sharp. It closes the preview and browser when finished.

Inspect `public/og-image.png` and commit it with the landing changes. The command also updates the local build's image. Production builds serve the committed PNG, referenced by the page's Open Graph and Twitter card tags.

## Photography

The yellow pinote displays [a curtain photographed by Pushparaj S](https://unsplash.com/photos/a-close-up-of-a-curtain-y6kUbpYKp5k), used under the [Unsplash License](https://unsplash.com/license). The source is `src/assets/sunlit-curtain.jpg`. Astro crops it to a 496 × 372 WebP at build time for a 248 × 186 display, and the browser loads it when the pinote opens.
