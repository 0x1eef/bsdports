--- lib/vscode/src/vs/platform/terminal/node/terminalProcess.ts.orig	2026-02-03 05:36:22 UTC
+++ lib/vscode/src/vs/platform/terminal/node/terminalProcess.ts
@@ -540,10 +540,7 @@ export class TerminalProcess extends Disposable impleme
 			this._logService.trace('node-pty.IPty#resize', cols, rows);
 			try {
-				const pixelSize = pixelWidth !== undefined && pixelHeight !== undefined
-					? { width: pixelWidth, height: pixelHeight }
-					: undefined;
-				this._ptyProcess.resize(cols, rows, pixelSize);
+				this._ptyProcess.resize(cols, rows);
 			} catch (e) {
 				// Swallow error if the pty has already exited
 				this._logService.trace('node-pty.IPty#resize exception ' + e.message);
