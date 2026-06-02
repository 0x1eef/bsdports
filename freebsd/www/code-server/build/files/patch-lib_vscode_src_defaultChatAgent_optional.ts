--- lib/vscode/src/vs/workbench/services/accounts/browser/defaultAccount.ts.orig
+++ lib/vscode/src/vs/workbench/services/accounts/browser/defaultAccount.ts
@@ -85,7 +85,21 @@
 	readonly mcp_registries: ReadonlyArray<IMcpRegistryProvider>;
 }
 
-function toDefaultAccountConfig(defaultChatAgent: IDefaultChatAgent): IDefaultAccountConfig {
+function toDefaultAccountConfig(defaultChatAgent: IDefaultChatAgent | undefined): IDefaultAccountConfig | undefined {
+	if (
+		!defaultChatAgent?.chatExtensionId ||
+		!defaultChatAgent.extensionId ||
+		!defaultChatAgent.provider?.default ||
+		!defaultChatAgent.provider.enterprise ||
+		!defaultChatAgent.completionsAdvancedSetting ||
+		!defaultChatAgent.providerUriSetting ||
+		!defaultChatAgent.providerScopes ||
+		!defaultChatAgent.entitlementUrl ||
+		!defaultChatAgent.tokenEntitlementUrl ||
+		!defaultChatAgent.mcpRegistryDataUrl
+	) {
+		return undefined;
+	}
 	return {
 		preferredExtensions: [
 			defaultChatAgent.chatExtensionId,
@@ -129,7 +143,7 @@
 	private readonly _onDidChangeCopilotTokenInfo = this._register(new Emitter<ICopilotTokenInfo | null>());
 	readonly onDidChangeCopilotTokenInfo = this._onDidChangeCopilotTokenInfo.event;
 
-	private readonly defaultAccountConfig: IDefaultAccountConfig;
+	private readonly defaultAccountConfig: IDefaultAccountConfig | undefined;
 	private defaultAccountProvider: IDefaultAccountProvider | null = null;
 
 	constructor(
@@ -137,6 +151,9 @@
 	) {
 		super();
 		this.defaultAccountConfig = toDefaultAccountConfig(productService.defaultChatAgent);
+		if (!this.defaultAccountConfig) {
+			this.initBarrier.open();
+		}
 	}
 
 	async getDefaultAccount(): Promise<IDefaultAccount | null> {
@@ -147,6 +164,9 @@
 	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider {
 		if (this.defaultAccountProvider) {
 			return this.defaultAccountProvider.getDefaultAccountAuthenticationProvider();
+		}
+		if (!this.defaultAccountConfig) {
+			return { id: '', name: '', enterprise: false };
 		}
 		return {
 			...this.defaultAccountConfig.authenticationProvider.default,
@@ -926,7 +946,11 @@
 		@IDefaultAccountService defaultAccountService: IDefaultAccountService,
 	) {
 		super();
-		const defaultAccountProvider = this._register(instantiationService.createInstance(DefaultAccountProvider, toDefaultAccountConfig(productService.defaultChatAgent)));
+		const defaultAccountConfig = toDefaultAccountConfig(productService.defaultChatAgent);
+		if (!defaultAccountConfig) {
+			return;
+		}
+		const defaultAccountProvider = this._register(instantiationService.createInstance(DefaultAccountProvider, defaultAccountConfig));
 		defaultAccountService.setDefaultAccountProvider(defaultAccountProvider);
 	}
 }
--- lib/vscode/src/vs/workbench/services/inlineCompletions/common/inlineCompletionsUnification.ts.orig
+++ lib/vscode/src/vs/workbench/services/inlineCompletions/common/inlineCompletionsUnification.ts
@@ -69,8 +69,8 @@
 		@IProductService productService: IProductService
 	) {
 		super();
-		this._completionsExtensionId = productService.defaultChatAgent?.extensionId.toLowerCase();
-		this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId.toLowerCase();
+		this._completionsExtensionId = productService.defaultChatAgent?.extensionId?.toLowerCase();
+		this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId?.toLowerCase();
 		const relevantExtensions = [this._completionsExtensionId, this._chatExtensionId].filter((id): id is string => !!id);
 
 		this.isRunningUnificationExperiment = isRunningUnificationExperiment.bindTo(this._contextKeyService);
--- lib/vscode/src/vs/workbench/services/extensionManagement/browser/extensionEnablementService.ts.orig
+++ lib/vscode/src/vs/workbench/services/extensionManagement/browser/extensionEnablementService.ts
@@ -101,8 +101,8 @@
 		this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this._onDidChangeExtensions([], [], false)));
 
 		// Extension unification
-		this._completionsExtensionId = productService.defaultChatAgent?.extensionId.toLowerCase();
-		this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId.toLowerCase();
+		this._completionsExtensionId = productService.defaultChatAgent?.extensionId?.toLowerCase();
+		this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId?.toLowerCase();
 		const unificationExtensions = [this._completionsExtensionId, this._chatExtensionId].filter(id => !!id);
 
 		// Disabling extension unification should immediately disable the unified extension flow
--- lib/vscode/src/vs/platform/configuration/common/configurationRegistry.ts.orig
+++ lib/vscode/src/vs/platform/configuration/common/configurationRegistry.ts
@@ -1023,4 +1023,4 @@
 }
 
 // Used for extension unification. Should be removed when complete.
-export const EXTENSION_UNIFICATION_EXTENSION_IDS: Set<string> = new Set(product.defaultChatAgent ? [product.defaultChatAgent.extensionId, product.defaultChatAgent.chatExtensionId].map(id => id.toLowerCase()) : []);
+export const EXTENSION_UNIFICATION_EXTENSION_IDS: Set<string> = new Set(product.defaultChatAgent ? [product.defaultChatAgent.extensionId, product.defaultChatAgent.chatExtensionId].filter((id): id is string => !!id).map(id => id.toLowerCase()) : []);
--- lib/vscode/src/vs/platform/extensionManagement/common/abstractExtensionManagementService.ts.orig
+++ lib/vscode/src/vs/platform/extensionManagement/common/abstractExtensionManagementService.ts
@@ -953,7 +953,8 @@
 		if (checked.indexOf(extension) !== -1) {
 			return [];
 		}
-		if (areSameExtensions(extension.identifier, { id: this.productService.defaultChatAgent.extensionId })) {
+		const defaultChatAgentExtensionId = this.productService.defaultChatAgent?.extensionId;
+		if (defaultChatAgentExtensionId && areSameExtensions(extension.identifier, { id: defaultChatAgentExtensionId })) {
 			return [];
 		}
 		checked.push(extension);
--- lib/vscode/src/vs/platform/extensionManagement/common/extensionGalleryService.ts.orig
+++ lib/vscode/src/vs/platform/extensionManagement/common/extensionGalleryService.ts
@@ -1170,10 +1170,11 @@
 
 			const result: IGalleryExtension[] = [];
 			let defaultChatAgentExtension: IGalleryExtension | undefined;
+			const defaultChatAgentExtensionId = this.productService.defaultChatAgent?.extensionId;
 			for (let index = 0; index < extensions.length; index++) {
 				const extension = extensions[index];
 				setTelemetry(extension, ((query.pageNumber - 1) * query.pageSize) + index, options.source);
-				if (areSameExtensions(extension.identifier, { id: this.productService.defaultChatAgent.extensionId, })) {
+				if (defaultChatAgentExtensionId && areSameExtensions(extension.identifier, { id: defaultChatAgentExtensionId, })) {
 					defaultChatAgentExtension = extension;
 				} else {
 					result.push(extension);
@@ -2005,15 +2006,18 @@
 			}
 		}
 
-		deprecated[this.productService.defaultChatAgent.extensionId.toLowerCase()] = {
-			disallowInstall: true,
-			extension: {
-				id: this.productService.defaultChatAgent.chatExtensionId,
-				displayName: 'GitHub Copilot Chat',
-				autoMigrate: { storage: false, donotDisable: true },
-				preRelease: this.productService.quality !== 'stable'
-			}
-		};
+		const defaultChatAgent = this.productService.defaultChatAgent;
+		if (defaultChatAgent?.extensionId && defaultChatAgent.chatExtensionId) {
+			deprecated[defaultChatAgent.extensionId.toLowerCase()] = {
+				disallowInstall: true,
+				extension: {
+					id: defaultChatAgent.chatExtensionId,
+					displayName: 'GitHub Copilot Chat',
+					autoMigrate: { storage: false, donotDisable: true },
+					preRelease: this.productService.quality !== 'stable'
+				}
+			};
+		}
 
 		return { malicious, deprecated, search, autoUpdate };
 	}
--- lib/vscode/src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts
@@ -340,6 +340,10 @@
 			}
 			// Do not allow updating system extensions in stable
 			if (this.type === ExtensionType.System && this.productService.quality === 'stable' && !this.productService.builtInExtensionsEnabledWithAutoUpdates?.some(id => id.toLowerCase() === this.identifier.id.toLowerCase())) {
+				return false;
+			}
+			// Do not update builtin extensions.
+			if (this.type !== ExtensionType.User) {
 				return false;
 			}
 			if (!this.local.preRelease && this.gallery.properties.isPreReleaseVersion) {
@@ -2758,7 +2762,8 @@
 		}
 
 		const extensionsToUninstall: UninstallExtensionInfo[] = [{ extension: extension.local }];
-		if (!areSameExtensions(extension.identifier, { id: this.productService.defaultChatAgent.extensionId })) {
+		const defaultChatAgentExtensionId = this.productService.defaultChatAgent?.extensionId;
+		if (!defaultChatAgentExtensionId || !areSameExtensions(extension.identifier, { id: defaultChatAgentExtensionId })) {
 			for (const packExtension of this.getAllPackedExtensions(extension, this.local)) {
 				if (packExtension.local && !extensionsToUninstall.some(e => areSameExtensions(e.extension.identifier, packExtension.identifier))) {
 					extensionsToUninstall.push({ extension: packExtension.local });
--- lib/vscode/src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.ts
@@ -710,8 +710,9 @@
 			return;
 		}
 
-		const providers = this.productService.defaultChatAgent?.provider;
-		if (!providers || !providers.default || !this.productService.defaultChatAgent?.termsStatementUrl || !this.productService.defaultChatAgent?.privacyStatementUrl) {
+		const defaultChatAgent = this.productService.defaultChatAgent;
+		const providers = defaultChatAgent?.provider;
+		if (!providers || !providers.default || !defaultChatAgent?.termsStatementUrl || !defaultChatAgent?.privacyStatementUrl) {
 			return;
 		}
 
@@ -740,8 +741,8 @@
 				{ key: 'tosDescription', comment: ['{Locked="]({1})"}', '{Locked="]({2})"}'] },
 				"By continuing, you agree to {0}'s [Terms]({1}) and [Privacy Statement]({2}).",
 				providers.default.name,
-				this.productService.defaultChatAgent.termsStatementUrl,
-				this.productService.defaultChatAgent.privacyStatementUrl
+				defaultChatAgent.termsStatementUrl,
+				defaultChatAgent.privacyStatementUrl
 			),
 			{ isTrusted: true }
 		);
--- lib/vscode/src/vs/workbench/api/browser/mainThreadLanguageModelTools.ts.orig
+++ lib/vscode/src/vs/workbench/api/browser/mainThreadLanguageModelTools.ts
@@ -122,8 +122,9 @@
 		}
 
 		// Convert source from DTO, matching the isBuiltinTool logic from languageModelToolsContribution
-		const isBuiltinTool = this._productService.defaultChatAgent?.chatExtensionId
-			? ExtensionIdentifier.equals(extensionId, this._productService.defaultChatAgent.chatExtensionId)
+		const defaultChatAgentExtensionId = this._productService.defaultChatAgent?.chatExtensionId;
+		const isBuiltinTool = defaultChatAgentExtensionId
+			? ExtensionIdentifier.equals(extensionId, defaultChatAgentExtensionId)
 			: false;
 		const source: ToolDataSource = isBuiltinTool
 			? ToolDataSource.Internal
--- lib/vscode/src/vs/workbench/contrib/chat/browser/actions/chatGettingStarted.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/chat/browser/actions/chatGettingStarted.ts
@@ -40,6 +40,9 @@
 	}
 
 	private registerListeners(defaultChatAgent: IDefaultChatAgent): void {
+		if (!defaultChatAgent.extensionId) {
+			return;
+		}
 
 		this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
 			for (const e of result) {
--- lib/vscode/src/vs/workbench/contrib/chat/common/tools/languageModelToolsContribution.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/chat/common/tools/languageModelToolsContribution.ts
@@ -257,8 +257,9 @@
 					}
 
 					// If OSS and the product.json is not set up, fall back to checking api proposal
-					const isBuiltinTool = productService.defaultChatAgent?.chatExtensionId ?
-						ExtensionIdentifier.equals(extension.description.identifier, productService.defaultChatAgent.chatExtensionId) :
+					const defaultChatAgentExtensionId = productService.defaultChatAgent?.chatExtensionId;
+					const isBuiltinTool = defaultChatAgentExtensionId ?
+						ExtensionIdentifier.equals(extension.description.identifier, defaultChatAgentExtensionId) :
 						isProposedApiEnabled(extension.description, 'chatParticipantPrivate');
 
 					const source: ToolDataSource = isBuiltinTool
@@ -299,8 +300,9 @@
 					continue;
 				}
 
-				const isBuiltinTool = productService.defaultChatAgent?.chatExtensionId ?
-					ExtensionIdentifier.equals(extension.description.identifier, productService.defaultChatAgent.chatExtensionId) :
+				const defaultChatAgentExtensionId = productService.defaultChatAgent?.chatExtensionId;
+				const isBuiltinTool = defaultChatAgentExtensionId ?
+					ExtensionIdentifier.equals(extension.description.identifier, defaultChatAgentExtensionId) :
 					isProposedApiEnabled(extension.description, 'chatParticipantPrivate');
 
 				const source: ToolDataSource = isBuiltinTool
--- lib/vscode/src/vs/workbench/contrib/chat/browser/widget/chatWidget.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/chat/browser/widget/chatWidget.ts
@@ -1045,9 +1045,10 @@
 			if (!numItems) {
 				const defaultAgent = this.chatAgentService.getDefaultAgent(this.location, this.input.currentModeKind);
 				let additionalMessage: string | IMarkdownString | undefined;
-				if (this.chatEntitlementService.anonymous && !this.chatEntitlementService.sentiment.completed) {
-					const providers = product.defaultChatAgent.provider;
-					additionalMessage = new MarkdownString(localize({ key: 'settings', comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3}).", providers.default.name, providers.default.name, product.defaultChatAgent.termsStatementUrl, product.defaultChatAgent.privacyStatementUrl), { isTrusted: true });
+				const defaultChatAgent = product.defaultChatAgent;
+				if (this.chatEntitlementService.anonymous && !this.chatEntitlementService.sentiment.completed && defaultChatAgent?.provider?.default && defaultChatAgent.termsStatementUrl && defaultChatAgent.privacyStatementUrl) {
+					const providers = defaultChatAgent.provider;
+					additionalMessage = new MarkdownString(localize({ key: 'settings', comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3}).", providers.default.name, providers.default.name, defaultChatAgent.termsStatementUrl, defaultChatAgent.privacyStatementUrl), { isTrusted: true });
 				} else {
 					additionalMessage = defaultAgent?.metadata.additionalWelcomeMessage;
 				}
--- lib/vscode/src/vs/workbench/contrib/welcomeOnboarding/browser/onboardingVariationA.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/welcomeOnboarding/browser/onboardingVariationA.ts
@@ -10,7 +10,6 @@
 import { StopWatch } from '../../../../base/common/stopwatch.js';
 import { URI } from '../../../../base/common/uri.js';
 import { isWindows, isMacintosh, isLinux } from '../../../../base/common/platform.js';
-import { assertDefined } from '../../../../base/common/types.js';
 import { FileAccess } from '../../../../base/common/network.js';
 import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
 import { KeyCode } from '../../../../base/common/keyCodes.js';
@@ -70,7 +69,6 @@
 	argument: string | undefined;
 };
 
-assertDefined(product.defaultChatAgent, 'Onboarding requires a default chat agent product configuration.');
 const defaultChat = product.defaultChatAgent;
 
 /**
@@ -158,6 +156,9 @@
 	}
 
 	show(): void {
+		if (!defaultChat) {
+			return;
+		}
 		if (this.overlay) {
 			return;
 		}
--- lib/vscode/src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusDashboard.ts.orig
+++ lib/vscode/src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusDashboard.ts
@@ -158,6 +158,11 @@
 	}
 
 	private render(): void {
+		if (!defaultChat) {
+			this.element.appendChild($('div.description', undefined, localize('chatUnavailable', "Chat is unavailable in this build.")));
+			return;
+		}
+
 		const token = cancelOnDispose(this._store);
 
 		const { chat, premiumChat, completions } = this.chatEntitlementService.quotas;
