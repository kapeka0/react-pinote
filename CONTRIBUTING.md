# Contributing

Pinote provides annotation UI, positioning and interaction. Apps own their data, editing permissions and storage. Keep changes small and the public API general.

## Issues

Report bugs with a minimal reproduction, expected and actual behavior, and the package, React and browser versions. For layout or motion bugs, include the viewport size and a recording if possible.

Open an issue before working on a substantial feature or API change. Explain the use case and why the current API cannot support it. Small fixes and documentation changes do not need an issue.

## Commits and pull requests

Maintainers commit and push small, low-risk changes directly to `main` after reviewing the diff and running appropriate checks. This includes documentation, copy, minor styling and simple fixes.

Use PRs for substantial features, important bug fixes, public API changes and broad refactors, or when branch protection requires them. Contributors without write access submit changes through a PR.

For a PR, create a short-lived branch from `main`. Keep it focused on one change, link an existing issue when relevant, and describe the problem, resulting behavior and validation. PRs are reviewed and squash-merged after checks pass.

For either workflow, update the relevant documentation and record user-visible changes under `Unreleased` in `CHANGELOG.md`. Add a regression test for a bug when it can exercise the reported behavior. Keep unrelated cleanup in a separate change. Pushing commits or merging a PR does not publish an npm release.

## Local development

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

Browser tests cover React 18 and 19 on Chromium, including mobile emulation. CSS targets Chrome 123+, Firefox 120+ and Safari 17.5+; Firefox and Safari are not part of the automated suite.

The size check limits JavaScript to 7,000 bytes gzip and CSS to 2,100 bytes minified, excluding React and source maps. Avoid adding runtime dependencies.

When a change affects the landing, run `pnpm og` and inspect `apps/demo/public/og-image.png`. Include any image changes in the same commit. See [landing maintenance](apps/demo/README.md#open-graph-image).

## Local package

```sh
pnpm --filter react-pinote pack
```

The prepack step builds the library and copies its README, license and public documentation. Install the resulting `.tgz` in a React app to check the packaged output.

## Releases

The maintainer decides when to publish. Keep the package version unchanged until a release is explicitly confirmed. At release time, update the version and changelog, then push a matching `v<version>` tag. The [publish workflow](.github/workflows/publish.yml) runs the checks and publishes to npm through its trusted publisher using OIDC.
