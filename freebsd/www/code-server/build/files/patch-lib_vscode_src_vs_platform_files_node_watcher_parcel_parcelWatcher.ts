--- lib/vscode/src/vs/platform/files/node/watcher/parcel/parcelWatcher.ts.orig
+++ lib/vscode/src/vs/platform/files/node/watcher/parcel/parcelWatcher.ts
@@ -156,7 +156,7 @@
 		'linux': []
 	};
 
-	private static readonly PARCEL_WATCHER_BACKEND = isWindows ? 'windows' : isLinux ? 'inotify' : 'fs-events';
+	private static readonly PARCEL_WATCHER_BACKEND = isWindows ? 'windows' : isLinux ? 'inotify' : isMacintosh ? 'fs-events' : 'brute-force';
 
 	private readonly _onDidError = this._register(new Emitter<IWatcherErrorEvent>());
 	readonly onDidError = this._onDidError.event;
