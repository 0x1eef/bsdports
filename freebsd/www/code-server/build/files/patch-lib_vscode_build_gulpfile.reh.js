--- lib/vscode/build/gulpfile.reh.ts.orig	2026-06-02 15:49:12 UTC
+++ lib/vscode/build/gulpfile.reh.ts
@@ -28,13 +28,13 @@
 import { promisify } from 'util';
 import rceditCallback from 'rcedit';
 import { compileBuildWithManglingTask } from './gulpfile.compile.ts';
-import { cleanExtensionsBuildTask, compileNonNativeExtensionsBuildTask, compileNativeExtensionsBuildTask, compileExtensionMediaBuildTask, compileCopilotExtensionBuildTask } from './gulpfile.extensions.ts';
+import { cleanExtensionsBuildTask, compileNonNativeExtensionsBuildTask, compileNativeExtensionsBuildTask, compileExtensionMediaBuildTask } from './gulpfile.extensions.ts';
 import { vscodeWebResourceIncludes, createVSCodeWebFileContentMapper } from './gulpfile.vscode.web.ts';
 import * as cp from 'child_process';
 import log from 'fancy-log';
 import buildfile from './buildfile.ts';
 import { fetchUrls, fetchGithub } from './lib/fetch.ts';
-import { getCopilotExcludeFilter, prepareBuiltInCopilotRipgrepShim } from './lib/copilot.ts';
+import { getCopilotExcludeFilter } from './lib/copilot.ts';
 import jsonEditor from 'gulp-json-editor';
 
 
@@ -343,7 +343,7 @@
 			// filter out unnecessary files, no source maps in server build
 			.pipe(filter(['**', '!**/package-lock.json', '!**/*.{js,css}.map']))
 			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, '.moduleignore')))
-			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, `.moduleignore.${process.platform}`)))
+			.pipe(util.cleanNodeModules(path.join(import.meta.dirname, `.moduleignore.linux`)))
 			.pipe(filter(getCopilotExcludeFilter(platform, arch)))
 			.pipe(jsFilter)
 			.pipe(util.stripSourceMappingURL())
@@ -466,16 +466,6 @@
 	};
 }
 
-function prepareCopilotRipgrepShimTaskREH(platform: string, arch: string, destinationFolderName: string) {
-	return async () => {
-		const outputDir = path.join(BUILD_ROOT, destinationFolderName);
-		const nodeModulesDir = path.join(outputDir, 'node_modules');
-
-		const builtInCopilotExtensionDir = path.join(outputDir, 'extensions', 'copilot');
-		prepareBuiltInCopilotRipgrepShim(platform, arch, builtInCopilotExtensionDir, nodeModulesDir);
-	};
-}
-
 /**
  * @param product The parsed product.json file contents
  */
@@ -521,8 +510,7 @@
 				compileNativeExtensionsBuildTask,
 				gulp.task(`node-${platform}-${arch}`) as task.Task,
 				util.rimraf(path.join(BUILD_ROOT, destinationFolderName)),
-				packageTask(type, platform, arch, sourceFolderName, destinationFolderName),
-				prepareCopilotRipgrepShimTaskREH(platform, arch, destinationFolderName)
+				packageTask(type, platform, arch, sourceFolderName, destinationFolderName)
 			];
 
 			if (platform === 'win32') {
@@ -536,7 +524,6 @@
 				compileBuildWithManglingTask,
 				cleanExtensionsBuildTask,
 				compileNonNativeExtensionsBuildTask,
-				compileCopilotExtensionBuildTask,
 				compileExtensionMediaBuildTask,
 				minified ? minifyTask : bundleTask,
 				serverTaskCI
