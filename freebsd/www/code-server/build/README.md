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

The build port uses `npm-node22`. The installed parent port depends on
`npm-node24`.

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
