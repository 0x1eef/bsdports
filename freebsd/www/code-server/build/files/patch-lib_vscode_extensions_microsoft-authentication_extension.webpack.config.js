--- lib/vscode/extensions/microsoft-authentication/esbuild.mts.orig	2026-02-03 06:51:58 UTC
+++ lib/vscode/extensions/microsoft-authentication/esbuild.mts
@@ -17,7 +17,7 @@ const linuxArches = ['x64'];
 
 let platformFolder: string;
-switch (process.platform) {
+switch ('linux') {
 	case 'win32': platformFolder = 'windows'; break;
 	case 'darwin': platformFolder = 'macos'; break;
 	case 'linux': platformFolder = 'linux'; break;
