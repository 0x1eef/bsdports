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
 
@@ -24,15 +25,22 @@
 		}
 	}
 
-	const args = ['tsgo', '--project', projectPath, '--pretty', 'false', '--incremental'];
+	const args = [...baseArgs, '--project', projectPath, '--pretty', 'false', '--incremental'];
 	if (config.noEmit) {
 		args.push('--noEmit');
 	} else {
 		args.push('--sourceMap', '--inlineSources');
 	}
-	const child = cp.spawn(npx, args, {
+	const env = { ...process.env };
+	if (process.platform === 'freebsd') {
+		env['NODE_OPTIONS'] = env['NODE_OPTIONS']
+			? `${env['NODE_OPTIONS']} --max-old-space-size=8192`
+			: '--max-old-space-size=8192';
+	}
+	const child = cp.spawn(runner, args, {
 		cwd: root,
 		stdio: ['ignore', 'pipe', 'pipe'],
+		env,
 		shell: true
 	});
 
