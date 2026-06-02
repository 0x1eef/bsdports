--- lib/vscode/src/vs/server/node/remoteFileSystemProviderServer.ts.orig
+++ lib/vscode/src/vs/server/node/remoteFileSystemProviderServer.ts
@@ -83,6 +83,10 @@
 			}
 		}
 
+		if (process.platform === 'freebsd') {
+			return { usePolling: true, pollingInterval: 5000 };
+		}
+
 		return undefined;
 	}
 
