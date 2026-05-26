PORTNAME=	code-server
DISTVERSION=	4.118.0
CATEGORIES=	www
MASTER_SITES= https://github.com/0x1eef/myports/releases/download/${PORTNAME}/:codeserver
DISTFILES=	code-server-${DISTVERSION}.tgz:codeserver
DIST_SUBDIR=	${PORTNAME}

MAINTAINER=	0x1eef@hardenedbsd.org
COMMENT=	VS Code in the browser

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/release/LICENSE

LIB_DEPENDS=	libinotify.so:devel/libinotify
RUN_DEPENDS=	npm-node24>0:www/npm-node24 \
		rg:textproc/ripgrep

NO_BUILD=	yes

USES=		tar:tgz shebangfix python:3.0+
SHEBANG_FILES=	${WRKSRC}/release/lib/vscode/node_modules/jschardet/scripts/run-workflow.sh \
		${WRKSRC}/release/lib/vscode/node_modules/jschardet/scripts/show-size-changes.sh \
		${WRKSRC}/release/lib/vscode/out/vs/base/node/cpuUsage.sh

post-patch:
	@${MV} ${WRKSRC}/release/out/node/entry.js ${WRKSRC}/release/out/node/entry.js.orig
	@${PRINTF} '%s\n' 'if (process.platform === "freebsd") { Object.defineProperty(process, "platform", { value: "linux" }); }' > ${WRKSRC}/release/out/node/entry.js
	@${CAT} ${WRKSRC}/release/out/node/entry.js.orig >> ${WRKSRC}/release/out/node/entry.js
	@${RM} ${WRKSRC}/release/out/node/entry.js.orig
	@${MV} ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js.orig
	@${PRINTF} '%s\n' 'if (process.platform === "freebsd") { Object.defineProperty(process, "platform", { value: "linux" }); }' > ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js
	@${CAT} ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js.orig >> ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js
	@${RM} ${WRKSRC}/release/lib/vscode/out/bootstrap-fork.js.orig

do-install:
	${MKDIR} ${STAGEDIR}${DATADIR}
	${INSTALL_SCRIPT} ${FILESDIR}/code-server.in ${STAGEDIR}${PREFIX}/etc/rc.d/code-server
	${CP} -R ${WRKSRC}/release/* ${STAGEDIR}${DATADIR}
	${RLN} ${STAGEDIR}${DATADIR}/out/node/entry.js ${STAGEDIR}${PREFIX}/bin/${PORTNAME}
	${MKDIR} ${STAGEDIR}${PREFIX}/share/code-server/lib/vscode/node_modules/@vscode/ripgrep/bin
	${LN} -sf ${PREFIX}/bin/rg ${STAGEDIR}${PREFIX}/share/code-server/lib/vscode/node_modules/@vscode/ripgrep/bin/rg

.include <bsd.port.mk>
