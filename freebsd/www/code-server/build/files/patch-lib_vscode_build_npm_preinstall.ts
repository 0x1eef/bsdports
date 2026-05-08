--- lib/vscode/build/npm/preinstall.ts.orig
+++ lib/vscode/build/npm/preinstall.ts
@@ -43,7 +43,7 @@
 
 const npmUserAgent = process.env.npm_config_user_agent;
 const npmVersionMatch = npmUserAgent?.match(/npm\/(\d+)\.(\d+)\.(\d+)/);
-if (npmVersionMatch) {
+if (process.platform !== 'freebsd' && npmVersionMatch) {
 	const npmMajor = parseInt(npmVersionMatch[1]);
 	const npmMinor = parseInt(npmVersionMatch[2]);
 	if (npmMajor > 11 || (npmMajor === 11 && npmMinor >= 2)) {
