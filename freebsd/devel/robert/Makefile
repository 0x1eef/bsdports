PORTNAME=	robert
DISTVERSION=	0.1.0
CATEGORIES=	education deskutils

MAINTAINER=	0x1eef@hardenedbsd.org
COMMENT=	Robert is designed to help you learn about FreeBSD
WWW=		https://llmrb.github.io/robert

LICENSE=	BSD0CLAUSE

LIB_DEPENDS=	libcurl.so:ftp/curl libmbedtls.so:security/mbedtls3
BUILD_DEPENDS= ${LOCALBASE}/bin/rake:devel/rubygem-rake

USES=		localbase ruby:build

ROBERT_COMMIT=		v0.1.0.beta
MRUBY_COMMIT=		b1adab4e87659dc880d8bcc60a1134ace14124c1
MRUBY_LLM_COMMIT=	v0.1.0.beta
MRUBY_TUI_COMMIT=	1a422a62408430d1bb8d71f5dfe2264b5223fd04
MRUBY_TUI_CHAT_COMMIT=	4e42aa0da1b2a95a7e8e875409e3144f9c90b53a
MRUBY_MARKDOWN_COMMIT=	56ba9c05679a15dd2d888776e1c47ee35ed8cfbd
MRUBY_COMMAND_COMMIT=	d6060c09b4b29bdd98dba8806e6f472815332843
MRUBY_TERMBOX2_COMMIT=	c6325d2c01c4013239989a4e2b5611e373019027
MRUBY_HTTP_COMMIT=	003c2af0a059c50a3546001860108ff4bf3a2cac
MRUBY_CURL_COMMIT=	15c8d98e31a41bb80ba30444210c0861904e1c07
MRUBY_JSON_COMMIT=	f99d9428025469f2400f93c53b185f65f963e507
MRUBY_STRINGIO_COMMIT=	32acb9ea9ad1aa1db8088625252988e98770188a
MRUBY_PROCESS_COMMIT=	5b51c4a11abc1444f89a61302fc8b7d0a8ab77df

USE_GITHUB=	yes
GH_ACCOUNT=	llmrb
GH_PROJECT=	robert
GH_TAGNAME=	${ROBERT_COMMIT}
GH_TUPLE=	mruby:mruby:${MRUBY_COMMIT}:mruby \
		llmrb:mruby-llm:${MRUBY_LLM_COMMIT}:mruby_llm \
		mrbgemz:mruby-tui:${MRUBY_TUI_COMMIT}:mruby_tui \
		mrbgemz:mruby-tui-chat:${MRUBY_TUI_CHAT_COMMIT}:mruby_tui_chat \
		mrbgemz:mruby-markdown:${MRUBY_MARKDOWN_COMMIT}:mruby_markdown \
		0x1eef:mruby-command:${MRUBY_COMMAND_COMMIT}:mruby_command \
		0x1eef:mruby-termbox2:${MRUBY_TERMBOX2_COMMIT}:mruby_termbox2 \
		mattn:mruby-http:${MRUBY_HTTP_COMMIT}:mruby_http \
		llmrb:mruby-curl:${MRUBY_CURL_COMMIT}:mruby_curl \
		mattn:mruby-json:${MRUBY_JSON_COMMIT}:mruby_json \
		ksss:mruby-stringio:${MRUBY_STRINGIO_COMMIT}:mruby_stringio \
		0x1eef:mruby-process:${MRUBY_PROCESS_COMMIT}:mruby_process

post-extract:
	@${MKDIR} ${WRKSRC_mruby}/mrbgems
	@${CP} -R ${WRKSRC_mruby_tui} ${WRKSRC_mruby}/mrbgems/mruby-tui
	@${CP} -R ${WRKSRC_mruby_tui_chat} ${WRKSRC_mruby}/mrbgems/mruby-tui-chat
	@${CP} -R ${WRKSRC_mruby_markdown} ${WRKSRC_mruby}/mrbgems/mruby-markdown
	@${CP} -R ${WRKSRC_mruby_llm} ${WRKSRC_mruby}/mrbgems/mruby-llm
	@${CP} -R ${WRKSRC_mruby_command} ${WRKSRC_mruby}/mrbgems/mruby-command
	@${CP} -R ${WRKSRC_mruby_termbox2} ${WRKSRC_mruby}/mrbgems/mruby-termbox2
	@${CP} -R ${WRKSRC_mruby_http} ${WRKSRC_mruby}/mrbgems/mruby-http
	@${CP} -R ${WRKSRC_mruby_curl} ${WRKSRC_mruby}/mrbgems/mruby-curl
	@${CP} -R ${WRKSRC_mruby_json} ${WRKSRC_mruby}/mrbgems/mruby-json
	@${CP} -R ${WRKSRC_mruby_stringio} ${WRKSRC_mruby}/mrbgems/mruby-stringio
	@${CP} -R ${WRKSRC_mruby_process} ${WRKSRC_mruby}/mrbgems/mruby-process

post-patch:
	@${CP} ${FILESDIR}/build.rb ${WRKSRC}/build.rb

do-build:
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} MRUBY_DIR=${WRKSRC_mruby} BUILD=production ${MAKE_CMD}

do-install:
	${INSTALL_PROGRAM} ${WRKSRC}/bin/${PORTNAME} ${STAGEDIR}${PREFIX}/bin/${PORTNAME}

.include <bsd.port.mk>
