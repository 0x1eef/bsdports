--- lib/vscode/build/lib/tsgo.ts.orig
+++ lib/vscode/build/lib/tsgo.ts
@@ -10,7 +10,8 @@
 import * as path from 'path';
 
 const root = path.dirname(path.dirname(import.meta.dirname));
-const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
+const runner = process.platform === 'freebsd' ? (process.platform === 'win32' ? 'tsc.cmd' : 'tsc') : (process.platform === 'win32' ? 'npx.cmd' : 'npx');
+const baseArgs = process.platform === 'freebsd' ? [] : ['tsgo'];
 const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
 const timestampRegex = /^\[\d{2}:\d{2}:\d{2}\]\s*/;
 
@@ -26,13 +27,13 @@
 		}
 	}
 
-	const args = ['tsgo', '--project', projectPath, '--pretty', 'false'];
+	const args = [...baseArgs, '--project', projectPath, '--pretty', 'false'];
 	if (config.noEmit) {
 		args.push('--noEmit');
 	} else {
 		args.push('--sourceMap', '--inlineSources');
 	}
-	const child = cp.spawn(npx, args, {
+	const child = cp.spawn(runner, args, {
 		cwd: root,
 		stdio: ['ignore', 'pipe', 'pipe'],
 		shell: true
@@ -63,6 +64,9 @@
 			if (code === 0) {
 				Promise.resolve(onComplete?.()).then(() => resolve(), reject);
 			} else {
+				for (const line of lines) {
+					fancyLog(line);
+				}
 				reject(new Error(`tsgo exited with code ${code ?? 'unknown'}`));
 			}
 		});
