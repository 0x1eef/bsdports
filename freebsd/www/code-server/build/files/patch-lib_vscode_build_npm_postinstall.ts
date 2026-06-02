--- lib/vscode/build/npm/postinstall.ts.orig
+++ lib/vscode/build/npm/postinstall.ts
@@ -57,10 +57,12 @@
 		env: { ...process.env },
 		...(opts ?? {}),
 		cwd: path.join(root, dir),
-		shell: true,
+		shell: process.platform !== 'freebsd',
 	};
 
-	const command = process.env['npm_command'] || 'install';
+	const command = (process.env['npm_command'] || 'install').split(' ');
+	const npmCommand = process.platform === 'freebsd' && process.env['npm_execpath'] ? process.execPath : npm;
+	const npmArgs = process.platform === 'freebsd' && process.env['npm_execpath'] ? [process.env['npm_execpath'], ...command] : command;
 
 	if (process.env['VSCODE_REMOTE_DEPENDENCIES_CONTAINER_NAME'] && /^(.build\/distro\/npm\/)?remote$/.test(dir)) {
 		const syncOpts: child_process.SpawnSyncOptions = {
@@ -88,7 +90,7 @@
 		run('sudo', ['chown', '-R', `${userinfo.uid}:${userinfo.gid}`, `${path.resolve(root, dir)}`], syncOpts);
 	} else {
 		log(dir, 'Installing dependencies...');
-		const output = await spawnAsync(npm, command.split(' '), finalOpts);
+		const output = await spawnAsync(npmCommand, npmArgs, finalOpts);
 		if (output.trim()) {
 			for (const line of output.trim().split('\n')) {
 				log(dir, line);
