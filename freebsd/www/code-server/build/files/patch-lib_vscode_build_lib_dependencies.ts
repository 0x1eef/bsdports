--- lib/vscode/build/lib/dependencies.ts.orig	2026-02-03 05:36:22 UTC
+++ lib/vscode/build/lib/dependencies.ts
@@ -12,7 +12,7 @@ function getNpmProductionDependencies(folder: string):
 	let raw: string;
 
 	try {
-		raw = cp.execSync('npm ls --all --omit=dev --parseable', { cwd: folder, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' }, stdio: [null, null, null] });
+		raw = cp.execSync('npm ls --all --omit=dev --parseable', { cwd: folder, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
 	} catch (err) {
 		const regex = /^npm ERR! .*$/gm;
 		let match: RegExpExecArray | null;
@@ -28,7 +28,7 @@ function getNpmProductionDependencies(folder: string):
 			}
 		}
 
-		raw = err.stdout;
+		raw = typeof err.stdout === 'string' ? err.stdout : err.stdout?.toString() ?? '';
 	}
 
 	return raw.split(/\r?\n/).filter(line => {
@@ -38,10 +38,11 @@ function getNpmProductionDependencies(folder: string):
 }
 
 export function getProductionDependencies(folderPath: string): string[] {
-	const result = getNpmProductionDependencies(folderPath);
+	const resolvedFolderPath = path.isAbsolute(folderPath) ? folderPath : path.join(root, folderPath);
+	const result = getNpmProductionDependencies(resolvedFolderPath);
 	// Account for distro npm dependencies
-	const realFolderPath = fs.realpathSync(folderPath);
+	const realFolderPath = fs.realpathSync(resolvedFolderPath);
 	const relativeFolderPath = path.relative(root, realFolderPath);
 	const distroFolderPath = `${root}/.build/distro/npm/${relativeFolderPath}`;
