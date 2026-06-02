--- lib/vscode/src/vs/platform/files/node/diskFileSystemProviderServer.ts.orig
+++ lib/vscode/src/vs/platform/files/node/diskFileSystemProviderServer.ts
@@ -291,7 +291,7 @@
 	) {
 		super();
 
-		this.fileWatcher = this._register(new DiskFileSystemProvider(logService));
+		this.fileWatcher = this._register(new DiskFileSystemProvider(logService, { watcher: { recursive: this.getRecursiveWatcherOptions(environmentService) } }));
 
 		this.registerListeners(sessionEmitter);
 	}
