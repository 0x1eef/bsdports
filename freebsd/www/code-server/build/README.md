## code-server build port

This directory contains the maintainer build port for `www/code-server`.
It builds the upstream `coder/code-server` release together with the
matching `microsoft/vscode` source tree, then packages
`work/code-server-${DISTVERSION}/release` as
`work/code-server-${DISTVERSION}.tgz`.

The parent port downloads that tarball from the `code-server` release tag
in `0x1eef/myports` and installs it. The parent port does not build
code-server itself.

## Build

```sh
make clean build
```

The build port uses `npm-node22` and bundles that Node binary into the
release tarball. The installed parent port runs code-server through the
bundled Node and does not depend on the global `node` package.

## Upload

```sh
make upload-release-asset
```

This uploads `work/code-server-${DISTVERSION}.tgz` to the configured
GitHub release with `gh release upload --clobber`.

## Local Changes

The build applies the patches in `files/`, replaces Microsoft's
`@vscode/vsce-sign` package with the local `node-ovsx-sign` wrapper,
wires ripgrep for FreeBSD, and removes GitHub Copilot and GitHub Copilot
Chat from the shipped release.

Keep package and lockfile changes narrow. Prefer targeted `package.json`
changes and avoid broad upstream lockfile rewrites.

## Why These Patches Exist

This port carries a full VS Code server build because upstream code-server
assumes Linux in several places. The local patches keep the FreeBSD package
self-contained and predictable:

- The build uses `npm-node22`, seeds VS Code's expected Node location, and
  bundles that Node into the release so runtime behavior is not tied to the
  system `node` package.
- Native and platform patches make VS Code treat FreeBSD like a supported
  server target where possible, including device identity, terminal behavior,
  ripgrep, and extension signature checks.
- File watcher patches force remote recursive watches onto polling on FreeBSD.
  Parcel's native FreeBSD `brute-force` subscribe path can abort, which then
  breaks the remote extension host and file search.
- Search patches add bounded failures and clearer logs when the remote search
  provider does not register or respond. They are diagnostics and guardrails,
  not the root watcher fix.
- Copilot is removed from the shipped build to avoid carrying large upstream
  product metadata and dependency changes unrelated to the FreeBSD port.
