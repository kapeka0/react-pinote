# Development

[Overview](../README.md)

Use Node 22.12 or later and pnpm 11.1.2. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The Astro demo runs at `http://127.0.0.1:4321`. Library changes rebuild through the watch process.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm size
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests use the built package with React 18 and 19 on Chromium, including mobile emulation. CSS targets Chrome 123+, Firefox 120+ and Safari 17.5+; those latter browsers are not part of the automated suite.

The size check limits JavaScript to under 6,500 bytes gzip and CSS to under 2,100 bytes minified, excluding React and source maps.

## Local package

```sh
pnpm --filter react-pinote pack
```

The prepack step builds the library and copies the README, license and documentation into the package. Install the resulting `.tgz` in a React app to test it before publication.
