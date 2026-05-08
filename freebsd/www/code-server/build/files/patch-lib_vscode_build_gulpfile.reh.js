--- lib/vscode/build/gulpfile.reh.ts.orig	2026-05-08 15:33:38 UTC
+++ lib/vscode/build/gulpfile.reh.ts
@@ -343,7 +343,7 @@
 			// filter out unnecessary files, no source maps in server build
 			.pipe(filter(['**', '!**/package-lock.json', '!**/*.{js,css}.map']))
 			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, '.moduleignore')))
-			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, `.moduleignore.${process.platform}`)))
+			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, `.moduleignore.linux`)))
 			.pipe(filter(getCopilotExcludeFilter(platform, arch)))
 			.pipe(jsFilter)
 			.pipe(util.stripSourceMappingURL())
 			.pipe(jsFilter.restore);
