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

## Publishing

Use npm 11.15 or later. The first version needs a manual `npm publish` because npm requires the package to exist before adding a trusted publisher:

```sh
npm login
cd packages/react-pinote
npm publish --access public
npm trust github react-pinote --repo kapeka0/react-pinote --file publish.yml --allow-publish --yes
```

npm requires two-factor authentication for the trust setup. Later releases use `.github/workflows/publish.yml` with OIDC. No npm token is stored in GitHub.

For each release, update the package version and changelog, commit the changes, then push a matching tag:

```sh
git tag -a v0.1.1 -m "Release 0.1.1"
git push origin main v0.1.1
```

The workflow checks the project and verifies that the tag matches `package.json` before publishing. npm generates provenance for these GitHub Actions releases. The initial manual release does not have provenance.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for the registry requirements.
