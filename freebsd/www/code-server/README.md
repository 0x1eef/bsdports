## www/code-server

[code-server](https://github.com/coder/code-server) can run VS Code
in your browser, from anywhere. This project is a fork of
[Rob4226/code-server-freebsd-port](https://github.com/Rob4226/code-server-freebsd-port)
and it has been updated to use a recent version of code-server.

## /etc/rc.conf variables

- **code_server_user**  Defaults to "nobody"
- **code_server_group** Defaults to "nobody"
- **code_server_config_file** *(path)*: Set to /home/nobody/.code-server/config.yaml by default. Set to the full filepath of the config file.
- **code_server_user_data_dir** *(path)*: Set to /home/nobody/.code-server/user-data by default. Set to the directory path to use for user data.
- **code_server_extensions_dir** *(path)*: Set to /home/nobody/.code-server/extensions by default. Set to the directory path to use for extensions.
- **code_server_service_url** *(url)*: Set to https://open-vsx.org/vscode/gallery by default. Set to the service url of an extensions marketplace.
- **code_server_item_url** *(url)*: Set to https://open-vsx.org/vscode/item by default. Set to the item url of an extensions marketplace.


## Usage

> NOTE:
> The file permissions one has when using vscode from a web browser is dependant
> on the user/group you choose to run this service. It defaults to `nobody` for
> security reasons but you will probably want to specify a different user with
> the appropriate permissions for your use case in `/etc/rc.conf`

Run from the CLI:

```sh
$user@localhost /usr/local/bin/code-server
```

Or run as a service via rc.d:

```sh
service code_server enable  # Enable at start up
service code_server start   # Start service
service code_server stop    # Stop service
service code_server restart # Restart service
service code_server status  # Status of service
```

## Browser

`http://localhost:8080`

IP address, port, and more can be set in `config.yaml`
See `coder/code-server` repo for docs: https://github.com/coder/code-server

## Maintainers

The [build/](build/) subdirectory has its own Makefile. It will produce
a tarball that includes a full code-server release. This is expected to
be done by a maintainer, and the tarball uploaded as a GitHub release.

The port Makefile in the parent directory then downloads and
extracts the contents of the earlier build. This process avoids trying
to download assets outside the fetch phase - either during build or
install.

The build process:

    $ cd build/
    $ make clean build
    $ ls work/code-server-X.X.X.tgz

During the build we replace Microsoft's `@vscode/vsce-sign` package with
the open `node-ovsx-sign` package. This keeps extension signature checks
working on FreeBSD without pulling in a large lockfile rewrite.

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

This port applies a patch that fixes terminal support on FreeBSD,
and another patch updates package.json to address a compile error
in mongodb-js/kerberos. See https://github.com/mongodb-js/kerberos/commit/d3e1a717b5cbb8de01b44d2c083d8f6db317e738.
At the time of writing the commit is not on NPM and it has been pulled in
via GitHub. The port also takes care of setting up ripgrep for fuzzy file
search support.
