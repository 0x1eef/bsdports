--- lib/vscode/src/vs/workbench/api/browser/mainThreadSearch.ts.orig
+++ lib/vscode/src/vs/workbench/api/browser/mainThreadSearch.ts
@@ -4,17 +4,19 @@
  *--------------------------------------------------------------------------------------------*/
 
 import { CancellationToken } from '../../../base/common/cancellation.js';
+import { raceTimeout } from '../../../base/common/async.js';
 import { DisposableStore, dispose, IDisposable } from '../../../base/common/lifecycle.js';
 import { URI, UriComponents } from '../../../base/common/uri.js';
 import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
 import { ITelemetryData, ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
 import { extHostNamedCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
-import { IFileMatch, IFileQuery, IRawFileMatch2, ISearchComplete, ISearchCompleteStats, ISearchProgressItem, ISearchQuery, ISearchResultProvider, ISearchService, ITextQuery, QueryType, SearchProviderType } from '../../services/search/common/search.js';
+import { IFileMatch, IFileQuery, IRawFileMatch2, ISearchComplete, ISearchCompleteStats, ISearchProgressItem, ISearchQuery, ISearchResultProvider, ISearchService, ITextQuery, QueryType, SearchError, SearchErrorCode, SearchProviderType } from '../../services/search/common/search.js';
 import { ExtHostContext, ExtHostSearchShape, MainContext, MainThreadSearchShape } from '../common/extHost.protocol.js';
 import { revive } from '../../../base/common/marshalling.js';
 import * as Constants from '../../contrib/search/common/constants.js';
 import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
 import { AISearchKeyword } from '../../services/search/common/searchExtTypes.js';
+import { ILogService } from '../../../platform/log/common/log.js';
 
 @extHostNamedCustomer(MainContext.MainThreadSearch)
 export class MainThreadSearch implements MainThreadSearchShape {
@@ -29,6 +31,7 @@
 		@ITelemetryService private readonly _telemetryService: ITelemetryService,
 		@IConfigurationService _configurationService: IConfigurationService,
 		@IContextKeyService protected contextKeyService: IContextKeyService,
+		@ILogService private readonly _logService: ILogService,
 	) {
 		this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSearch);
 		this._proxy.$enableExtensionHostSearch();
@@ -42,18 +45,20 @@
 	}
 
 	$registerTextSearchProvider(handle: number, scheme: string): void {
-		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.text, scheme, handle, this._proxy));
+		this._logService.debug(`MainThreadSearch#$registerTextSearchProvider: scheme=${scheme}`);
+		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.text, scheme, handle, this._proxy, this._logService));
 	}
 
 	$registerAITextSearchProvider(handle: number, scheme: string): void {
 		Constants.SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(true);
 
 		this._aiSearchProviderHandles.add(handle);
-		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.aiText, scheme, handle, this._proxy));
+		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.aiText, scheme, handle, this._proxy, this._logService));
 	}
 
 	$registerFileSearchProvider(handle: number, scheme: string): void {
-		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.file, scheme, handle, this._proxy));
+		this._logService.debug(`MainThreadSearch#$registerFileSearchProvider: scheme=${scheme}`);
+		this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, SearchProviderType.file, scheme, handle, this._proxy, this._logService));
 	}
 
 	$unregisterProvider(handle: number): void {
@@ -134,6 +139,8 @@
 
 class RemoteSearchProvider implements ISearchResultProvider, IDisposable {
 
+	private static readonly PROVIDE_SEARCH_RESULTS_TIMEOUT = 2 * 60 * 1000;
+
 	private readonly _registrations = new DisposableStore();
 	private readonly _searches = new Map<number, SearchOperation>();
 	private cachedAIName: string | undefined;
@@ -143,7 +150,8 @@
 		type: SearchProviderType,
 		private readonly _scheme: string,
 		private readonly _handle: number,
-		private readonly _proxy: ExtHostSearchShape
+		private readonly _proxy: ExtHostSearchShape,
+		private readonly _logService: ILogService,
 	) {
 		this._registrations.add(searchService.registerSearchResultProvider(this._scheme, type, this));
 	}
@@ -175,8 +183,16 @@
 		const search = new SearchOperation(onProgress);
 		this._searches.set(search.id, search);
 
-		const searchP = this._provideSearchResults(query, search.id, token);
+		const searchP = raceTimeout(this._provideSearchResults(query, search.id, token), RemoteSearchProvider.PROVIDE_SEARCH_RESULTS_TIMEOUT, () => {
+			this._logService.error(`Remote search provider for scheme ${this._scheme} did not respond after ${RemoteSearchProvider.PROVIDE_SEARCH_RESULTS_TIMEOUT}ms`);
+		}).then(result => {
+			if (!result) {
+				throw new SearchError(`Remote search provider for scheme ${this._scheme} did not respond. The remote extension host may be unresponsive.`, SearchErrorCode.other);
+			}
 
+			return result;
+		});
+
 		return Promise.resolve(searchP).then((result: ISearchCompleteStats) => {
 			this._searches.delete(search.id);
 			return { results: Array.from(search.matches.values()), aiKeywords: Array.from(search.keywords), stats: result.stats, limitHit: result.limitHit, messages: result.messages };
