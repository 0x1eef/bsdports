## www/code-server

[code-server](https://github.com/coder/code-server) can run VS Code
in your browser, from anywhere. This project is a fork of
[Rob4226/code-server-freebsd-port](https://github.com/Rob4226/code-server-freebsd-port)
and tracks the code-server version declared by the port.

## /etc/rc.conf variables

- **code_server_enable** Defaults to "NO"
- **code_server_user**  Defaults to "nobody"
- **code_server_group** Defaults to "nobody"
- **code_server_config_file** *(path)*: Set to /home/nobody/.code-server/config.yaml by default. Set to the full filepath of the config file.
- **code_server_user_data_dir** *(path)*: Set to /home/nobody/.code-server/user-data by default. Set to the directory path to use for user data.
- **code_server_extensions_dir** *(path)*: Set to /home/nobody/.code-server/extensions by default. Set to the directory path to use for extensions.
- **code_server_service_url** *(url)*: Set to https://open-vsx.org/vscode/gallery by default. Set to the service url of an extensions marketplace.
- **code_server_item_url** *(url)*: Set to https://open-vsx.org/vscode/item by default. Set to the item url of an extensions marketplace.


## Usage

> NOTE:
> The file permissions one has when using VS Code from a web browser is dependent
> on the user/group you choose to run this service. It defaults to `nobody` for
> security reasons but you will probably want to specify a different user with
> the appropriate permissions for your use case in `/etc/rc.conf`

Run from the CLI:

```sh
$user@localhost /usr/local/bin/code-server
```

Or run as a service via rc.d:

```sh
service code-server enable  # Enable at start up
service code-server start   # Start service
service code-server stop    # Stop service
service code-server restart # Restart service
service code-server status  # Status of service
```

## Browser

`http://localhost:8080`

IP address, port, and more can be set in `config.yaml`
See `coder/code-server` repo for docs: https://github.com/coder/code-server

## Maintainers

The [build/](build/) subdirectory has its own Makefile and README. It
produces a tarball that includes a full code-server release. This is
expected to be done by a maintainer, and the tarball uploaded as a
GitHub release.

The port Makefile in the parent directory then downloads and
extracts the contents of the earlier build. This process avoids trying
to download assets outside the fetch phase - either during build or
install.

The maintainer build process:

    $ cd build/
    $ make clean build
    $ ls work/code-server-X.X.X.tgz

During the build we replace Microsoft's `@vscode/vsce-sign` package with
the open `node-ovsx-sign` package. This keeps extension signature checks
working on FreeBSD without pulling in a large lockfile rewrite.

The build removes GitHub Copilot and GitHub Copilot Chat, including their
bundled extensions, package dependencies, product metadata, and plist entries.

The parent port installs the maintainer tarball without rebuilding
code-server. It runs through the bundled Node binary at
`%%DATADIR%%/lib/node` instead of depending on the system `node` package.
This keeps code-server on the Node major version expected by the bundled
VS Code sources even when other installed packages require a newer Node.

On HardenedBSD, the port sets:

```make
MPROTECT_DISABLE=	${DATADIR}/lib/node
```

Node and native addons use executable memory patterns that can trip MPROTECT.
The setting is scoped to the bundled runtime binary rather than disabling
hardening for the service wrapper or the rest of the package.

If package dependencies need local changes, keep them as small as
possible. Prefer `package.json` changes first. Only carry lockfile
changes that are strictly needed for a reproducible `npm ci`.

To replace the tarball asset on the existing GitHub release tag:

    $ cd build/
    $ make upload-release-asset

This uses `gh release upload --clobber` against the existing
`${PORTNAME}` release tag in `0x1eef/myports` by default. Override
`RELEASE_REPO` or `RELEASE_TAG` on the command line if needed.

## Patches

The build port carries FreeBSD patches for VS Code, code-server, native
dependencies, extension signing, ripgrep wiring, and runtime metadata.
See [build/README.md](build/README.md) for maintainer notes about the
current patch set and the rationale for the file watcher/search changes.
