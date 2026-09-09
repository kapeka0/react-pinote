# Styling

[Overview](../README.md) · [API reference](api.md)

Styles load with `react-pinote`. Set CSS variables on a pinote, a layer or an ancestor. They follow content into its portal.

Your build tool must support CSS imports.

```tsx
<Pinote
  id="custom"
  position="center"
  style={{
    "--pinote-background": "#f8e5a4",
    "--pinote-foreground": "#45350e",
    "--pinote-size": "28px",
  }}
  content="A custom palette."
/>
```

## Color and size

| Variable                  | Default                        | Controls                                           |
| ------------------------- | ------------------------------ | -------------------------------------------------- |
| `--pinote-background`     | `color` prop, then `#2c2c2c`   | Marker and panel background.                       |
| `--pinote-foreground`     | `#fff`                         | Text and icon color.                               |
| `--pinote-size`           | `25px`                         | Marker size.                                       |
| `--pinote-trigger-radius` | From `orientation`             | Marker corner radii.                               |
| `--pinote-width`          | `280px`                        | Maximum panel width, also limited by the viewport. |
| `--pinote-radius`         | shadcn `--radius`, then `12px` | Panel corner radii.                                |
| `--pinote-accent`         | Current text color             | Highlight underline color.                         |
| `--pinote-aside-offset`   | `9px`                          | Side decoration offset at rest.                    |
| `--pinote-aside-reveal`   | `3px`                          | Extra side decoration movement on hover.           |

Panels size to their content up to the maximum width. Triggers include a 10px touch target extension on each side; leave space between nearby controls.

## Motion

| Variable                     | Default                        | Controls                                                                    |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `--pinote-duration`          | `140ms` for opening popovers   | Panel and hover duration. Overrides opening and closing durations when set. |
| `--pinote-easing`            | See below                      | Marker and panel easing.                                                    |
| `--pinote-entrance-delay`    | `0s`                           | Delay before a marker appears.                                              |
| `--pinote-entrance-duration` | `240ms`                        | Marker entrance duration.                                                   |
| `--pinote-hover-scale`       | `0.96`                         | Trigger scale on hover. Set to `1` to keep its size.                        |
| `--pinote-content-scale`     | `0.96`                         | Start and end scale for the `scale` preset.                                 |
| `--pinote-slide-distance`    | `6px`                          | Travel for the `slide` preset.                                              |
| `--pinote-expand-duration`   | `160ms`                        | Expansion duration.                                                         |
| `--pinote-collapse-duration` | `220ms`                        | Panel closing duration, including expansion.                                |
| `--pinote-expand-shadow`     | `drop-shadow(0 2px 3px #0002)` | Filter around the expansion.                                                |

The marker entrance runs once after hydration. Moving a marker or opening its panel does not replay it. Set `entranceAnimation="none"` to disable it.

Panels close with `cubic-bezier(.4,0,.2,1)` to spread the movement across the transition. Opening and marker animations use `cubic-bezier(.2,0,0,1)`. Set `--pinote-easing` to override both curves.

The `fade`, `scale` and `slide` presets animate both entry and exit by default. `slide` enters from 6 px below and returns there when closing. Use `animation="none"` to disable panel transitions.

Panels remain mounted during exit. Reopening reverses the current transition. Reduced motion removes scale, movement and clipping; panels fade over 200ms. Exiting content is inert and hidden from assistive technology.

## shadcn and dark mode

System color preference applies by default. A `.dark` or `.light` ancestor overrides it. The default background stays the same across themes.

To use shadcn's palette, set these variables on a class applied through `className`:

```css
.review-note {
  --pinote-background: var(--popover);
  --pinote-foreground: var(--popover-foreground);
}
```

The tokens must hold complete CSS colors such as `oklch(...)`, not bare HSL channels. The library carries these tokens and `--radius` into portals and updates them when the local theme changes.

## Target a part

Use `data-slot` selectors for individual elements. `className` applies to both the annotation wrapper and panel.

```css
.review-note[data-slot="pinote-content"] {
  padding: 12px;
}
```

| Part                             | `data-slot`                                 |
| -------------------------------- | ------------------------------------------- |
| Layer                            | `pinote-layer`                              |
| Standalone wrapper               | `pinote`                                    |
| Component wrapper                | `pinote-attachment`                         |
| Highlight wrapper and text       | `pinote-highlight`, `pinote-highlight-text` |
| Marker anchor and button         | `pinote-anchor`, `pinote-trigger`           |
| Panel and body                   | `pinote-content`, `pinote-body`             |
| Default author and avatar        | `pinote-author`, `pinote-avatar`            |
| Custom header and leading visual | `pinote-header`, `pinote-leading`           |
| Custom trigger content           | `pinote-icon`, `pinote-trigger-aside`       |

Wrappers expose `data-state="open|closed"`. Panels expose `data-side`, `data-animation` and `data-leaving` during exit.

Highlights trim extra font leading with `text-box` where supported. Override it on `pinote-highlight` when your typography needs different alignment.

## Portals

Panels render in `document.body` by default. Set `portalContainer` on `PinoteLayer` to choose another element, or `portal={false}` to render beside the annotation.

Keep custom portal containers outside transformed, filtered or paint-containing ancestors. Those ancestors change fixed-position coordinates. Inline panels may be clipped by ancestor overflow. At viewport edges, keeping the panel visible takes priority over exact alignment with the marker.
