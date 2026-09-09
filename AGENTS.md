# Documentation

Every code or configuration change must include the corresponding documentation update in the same commit.

Keep installation and usage in `README.md`, detailed API, styling and development instructions in `docs/`, and user-visible changes in `CHANGELOG.md`. Before finishing, verify that the documented examples, props and defaults match the implementation.

Keep landing maintenance notes in `apps/demo/README.md`, outside the published library documentation.

# Landing image

Whenever the landing changes, regenerate its Open Graph image with `pnpm og`, inspect `apps/demo/public/og-image.png`, and include the updated image in the same commit. This also applies when library changes affect the landing's appearance. See [the generation workflow](apps/demo/README.md#open-graph-image).
