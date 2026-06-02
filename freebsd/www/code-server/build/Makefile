PORTNAME=	code-server
DISTVERSION=	4.118.0
CATEGORIES=	devel
MASTER_SITES= https://github.com/microsoft/vscode/archive/refs/tags/:vscode
DISTFILES= ${_VSCODE_VERSION}.tar.gz:vscode
DIST_SUBDIR=	code-server
_VSCODE_VERSION=1.118.0

BATCH=	1
MAINTAINER=	0x1eef@hardenedbsd.org
COMMENT=	Maintainer's makefile for code-server

USE_GITHUB=	yes
GH_ACCOUNT=	coder
GH_PROJECT=	code-server
GH_TAGNAME=	v${DISTVERSION}
RELEASE_REPO?=	0x1eef/myports
RELEASE_TAG?=	${PORTNAME}
RELEASE_ASSET=	code-server-${DISTVERSION}.tgz
RELEASE_FILE=	${WRKDIR}/${RELEASE_ASSET}

USES=		xorg tar:tgz shebangfix python:3.0+
USE_XORG=    x11 xkbfile
BUILD_DEPENDS=	npm-node22>0:www/npm-node22 rsync>0:net/rsync quilt>0:devel/quilt python3>0:lang/python3 jq:textproc/jq gh>0:devel/gh

post-patch:
	cd ${WRKSRC} && quilt push -a
	${RM} -rf ${WRKSRC}/lib/vscode/extensions/copilot
	${FIND} ${WRKSRC}/lib/vscode/src/vs/platform/agentHost/node/copilot -type f \
	  ! -name pendingEditContentStore.ts \
	  ! -name fileEditTracker.ts \
	  ! -name mapSessionEvents.ts \
	  -delete
	${RM} -f ${WRKSRC}/lib/vscode/src/vs/platform/agentHost/test/node/copilotAgent.test.ts
	cd ${WRKSRC}/lib/vscode && \
	  jq 'del(.dependencies["@github/copilot"], .dependencies["@github/copilot-sdk"])' package.json > package.json.tmp && \
	  ${MV} package.json.tmp package.json && \
	  jq 'del(.packages[""].dependencies["@github/copilot"], .packages[""].dependencies["@github/copilot-sdk"], .dependencies["@github/copilot"], .dependencies["@github/copilot-sdk"]) | .packages |= with_entries(select(.key | test("^node_modules/@github/copilot") | not))' package-lock.json > package-lock.json.tmp && \
	  ${MV} package-lock.json.tmp package-lock.json && \
	  jq 'del(.defaultChatAgent) | .trustedExtensionAuthAccess = ((.trustedExtensionAuthAccess // []) | map(select(. != "github.copilot" and . != "github.copilot-chat"))) | .builtInExtensionsEnabledWithAutoUpdates = ((.builtInExtensionsEnabledWithAutoUpdates // []) | map(select(. != "GitHub.copilot" and . != "GitHub.copilot-chat")))' product.json > product.json.tmp && \
	  ${MV} product.json.tmp product.json

post-extract:
	@${MKDIR} ${WRKSRC}/lib/vscode
	@${CP} -R ${WRKDIR}/vscode-${_VSCODE_VERSION}/ ${WRKSRC}/lib/vscode
	@${RM} -rf ${WRKDIR}/vscode-${_VSCODE_VERSION}

do-build:
	cd ${WRKSRC} && \
	  ${MKDIR} ${WRKSRC}/vendor && \
	  (cd ${.CURDIR}/vendor/node-ovsx-sign && npm ci --ignore-scripts --no-audit --no-fund) && \
	  rsync -a --delete ${.CURDIR}/vendor/vsce-sign-wrapper/ ${WRKSRC}/vendor/vsce-sign-wrapper/ && \
	  ${MKDIR} ${WRKSRC}/vendor/vsce-sign-wrapper/node_modules && \
	  rsync -a --delete ${.CURDIR}/vendor/node-ovsx-sign/node_modules/ ${WRKSRC}/vendor/vsce-sign-wrapper/node_modules/ && \
	  ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci && \
	  ${MKDIR} ${WRKSRC}/lib/vscode/node_modules/@vscode && \
	  rsync -a --delete ${.CURDIR}/vendor/vsce-sign-wrapper/ ${WRKSRC}/lib/vscode/node_modules/@vscode/vsce-sign/ && \
	  ${MKDIR} ${WRKSRC}/lib/vscode/node_modules/@vscode/vsce-sign/node_modules && \
	  rsync -a --delete ${.CURDIR}/vendor/node-ovsx-sign/node_modules/ ${WRKSRC}/lib/vscode/node_modules/@vscode/vsce-sign/node_modules/ && \
	  npm run build && \
	  cd lib/vscode && ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci && \
	  ${MKDIR} ${WRKSRC}/lib/vscode/node_modules/@vscode/ripgrep/bin && \
	  ${LN} -sf ${LOCALBASE}/bin/rg ${WRKSRC}/lib/vscode/node_modules/@vscode/ripgrep/bin/rg && \
	  ${MKDIR} ${WRKSRC}/lib/vscode/remote/node_modules/@vscode/ripgrep/bin && \
	  ${LN} -sf ${LOCALBASE}/bin/rg ${WRKSRC}/lib/vscode/remote/node_modules/@vscode/ripgrep/bin/rg && \
	  cd ../.. && VERSION=${DISTVERSION} npm run build:vscode && \
	  KEEP_MODULES=1 npm run release
	find ${WRKSRC} -type f -name '*.pyc' -delete
	cd ${WRKDIR} && \
	  tar -czf ${RELEASE_ASSET} ${PORTNAME}-${DISTVERSION}/release
	@${ECHO_MSG} "${RELEASE_FILE}"

upload-release-asset:
	@if [ ! -f "${RELEASE_FILE}" ]; then \
		${ECHO_MSG} "Missing ${RELEASE_FILE}. Run 'make clean build' first."; \
		exit 1; \
	fi
	@if ! command -v gh >/dev/null 2>&1; then \
		${ECHO_MSG} "'gh' is required for upload-release-asset."; \
		exit 1; \
	fi
	gh release upload "${RELEASE_TAG}" "${RELEASE_FILE}" \
		--repo "${RELEASE_REPO}" \
		--clobber

.include <bsd.port.mk>
