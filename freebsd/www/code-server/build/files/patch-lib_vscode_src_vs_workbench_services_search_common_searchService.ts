--- lib/vscode/src/vs/workbench/services/search/common/searchService.ts.orig
+++ lib/vscode/src/vs/workbench/services/search/common/searchService.ts
@@ -4,7 +4,7 @@
  *--------------------------------------------------------------------------------------------*/
 
 import * as arrays from '../../../../base/common/arrays.js';
-import { DeferredPromise, raceCancellationError } from '../../../../base/common/async.js';
+import { DeferredPromise, raceCancellationError, raceTimeout } from '../../../../base/common/async.js';
 import { CancellationToken } from '../../../../base/common/cancellation.js';
 import { CancellationError } from '../../../../base/common/errors.js';
 import { Disposable, IDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
@@ -29,6 +29,8 @@
 
 	declare readonly _serviceBrand: undefined;
 
+	private static readonly WAIT_FOR_PROVIDER_TIMEOUT = 10 * 1000;
+
 	private readonly fileSearchProviders = new Map<string, ISearchResultProvider>();
 	private readonly textSearchProviders = new Map<string, ISearchResultProvider>();
 	private readonly aiTextSearchProviders = new Map<string, ISearchResultProvider>();
@@ -232,13 +234,23 @@
 
 	private async waitForProvider(queryType: QueryType, scheme: string): Promise<ISearchResultProvider> {
 		const deferredMap: Map<string, DeferredPromise<ISearchResultProvider>> = this.getDeferredTextSearchesByScheme(queryType);
+
+		const waitForProvider = (promise: Promise<ISearchResultProvider>) => raceTimeout(promise, SearchService.WAIT_FOR_PROVIDER_TIMEOUT, () => {
+			this.logService.error(`No search provider registered for scheme: ${scheme} after ${SearchService.WAIT_FOR_PROVIDER_TIMEOUT}ms`);
+		}).then(provider => {
+			if (!provider) {
+				throw new SearchError(`No search provider registered for scheme: ${scheme}. The remote extension host may be unresponsive.`, SearchErrorCode.other);
+			}
+
+			return provider;
+		});
 
 		if (deferredMap.has(scheme)) {
-			return deferredMap.get(scheme)!.p;
+			return waitForProvider(deferredMap.get(scheme)!.p);
 		} else {
 			const deferred = new DeferredPromise<ISearchResultProvider>();
 			deferredMap.set(scheme, deferred);
-			return deferred.p;
+			return waitForProvider(deferred.p);
 		}
 	}
 
