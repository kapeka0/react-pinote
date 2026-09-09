# Documentation

Every code or configuration change must include the corresponding documentation update.

Keep installation and usage in `README.md`, public API and styling instructions in `docs/`, contributor workflow and local setup in `CONTRIBUTING.md`, and user-visible changes in `CHANGELOG.md`. Before finishing, verify that the documented examples, props and defaults match the implementation.

Keep landing maintenance notes in `apps/demo/README.md`, outside the published library documentation.

Document the current API. While the library has no users, add upgrade or migration guides only if the user requests them.

# Commits and releases

Keep changes local and uncommitted until the user requests a commit or upload. For authorized uploads, commit and push small, low-risk changes directly to `main`, including documentation, copy, minor styling and simple fixes. Review the diff and run checks appropriate to the change before pushing.

Reserve short-lived `codex/` branches and PRs for substantial features, important bug fixes, public API changes and broad refactors, or when the user or branch protection requires a PR. Follow [the contribution workflow](CONTRIBUTING.md#commits-and-pull-requests), including review, passing checks and squash merges. A request to upload an already approved change authorizes the applicable workflow.

Use issues for unresolved bugs and substantial proposals; small changes do not need an issue. Record pending user-visible changes under `Unreleased` in `CHANGELOG.md`, keeping the published package version unchanged.

Create or publish a release only after explicit user confirmation. Version bumps, tags, pushes and deployments are not automatic follow-ups to edits.

# Landing image

Whenever the landing changes, regenerate its Open Graph image with `pnpm og`, inspect `apps/demo/public/og-image.png`, and keep the updated image with the pending changes. This also applies when library changes affect the landing's appearance. See [the generation workflow](apps/demo/README.md#open-graph-image).
