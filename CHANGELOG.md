# Changelog

## 0.3.0

- Add `PinoteProvider` for shared open state, animation and portal defaults without a DOM wrapper. Attachments work anywhere inside the provider.
- Make `PinoteLayer` a coordinate and drag area. Move its former state and configuration props to `PinoteProvider`, and rename `usePinoteLayer` to `usePinoteProvider`. See the [migration notes](README.md#upgrading-from-02).
- Add `render` for custom button elements and render callbacks. Preserve custom refs and handlers, keyboard focus, positioning and dragging without default marker styling. Expansions measure rectangular custom triggers.
- Update the landing's photo trigger and document root setup, Tailwind, shadcn buttons and trigger decoration.

## 0.2.0

- Remove the built-in trigger icon. Markers are empty by default unless an author photo is supplied. Pass `icon` to add a custom visual.
- Simplify installation guidance and document the new icon default.

## 0.1.3

- Give all panels a gradual 220 ms exit by default. The existing `--pinote-collapse-duration` variable now controls popover closing as well as expansion.
- Add a warm, sunlit photograph to the landing's yellow pinote, optimized as WebP.
- Reduce the landing's clipboard and checkmark icons by one pixel.
- Animate the landing's photo pinote with the existing slide preset and update the LLM conversation.

## 0.1.2

- Add a copy button to the landing's installation command, with animated clipboard and checkmark icons.
- Smooth the GitHub link's hover color transition and open the repository in a new tab.
- Add an optimized landing screenshot for link previews, Open Graph and Twitter card metadata, and a documented regeneration command.
- Highlight shadcn/ui compatibility in the README and remove internal landing deployment instructions from the library documentation.

## 0.1.1

- Smooth the expansion's closing curve while preserving its opening animation.
- Reduce the demo's marker entrance delay from 500ms to 250ms.
- Add the npm installation command and repository link to the landing.
- Document npm installation and require documentation updates with code changes.

## 0.1.0

Initial release.

- Attach pinotes to coordinates, elements or highlighted text.
- Use popovers or expand a marker into its content.
- Drag standalone markers with controlled or internal positioning.
- Compose headers, avatars and content with app-owned state and actions.
- Customize colors, motion and portal themes, including shadcn styles.
