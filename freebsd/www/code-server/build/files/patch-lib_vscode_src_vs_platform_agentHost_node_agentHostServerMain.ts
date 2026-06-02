--- lib/vscode/src/vs/platform/agentHost/node/agentHostServerMain.ts.orig
+++ lib/vscode/src/vs/platform/agentHost/node/agentHostServerMain.ts
@@ -30,9 +30,7 @@
 import { IProductService } from '../../product/common/productService.js';
 import { InstantiationService } from '../../instantiation/common/instantiationService.js';
 import { ServiceCollection } from '../../instantiation/common/serviceCollection.js';
-import { CopilotAgent } from './copilot/copilotAgent.js';
 import { AgentService } from './agentService.js';
-import { IAgentHostTerminalManager } from './agentHostTerminalManager.js';
 import { WebSocketProtocolServer } from './webSocketTransport.js';
 import { ProtocolServerHandler } from './protocolServerHandler.js';
 import { FileService } from '../../files/common/fileService.js';
@@ -40,16 +38,12 @@
 import { DiskFileSystemProvider } from '../../files/node/diskFileSystemProvider.js';
 import { Schemas } from '../../../base/common/network.js';
 import { ISessionDataService } from '../common/sessionDataService.js';
-import { IDiffComputeService } from '../common/diffComputeService.js';
-import { NodeWorkerDiffComputeService } from './diffComputeService.js';
 import { SessionDataService } from './sessionDataService.js';
 import { AgentHostClientFileSystemProvider } from '../common/agentHostClientFileSystemProvider.js';
 import { AGENT_CLIENT_SCHEME } from '../common/agentClientUri.js';
 import { resolveServerUrls } from './serverUrls.js';
-import { AgentPluginManager } from './agentPluginManager.js';
-import { IAgentPluginManager } from '../common/agentPluginManager.js';
 import { registerPendingEditContentProvider } from './copilot/pendingEditContentStore.js';
-import { AgentHostGitService, IAgentHostGitService } from './agentHostGitService.js';
+import { AgentHostGitService } from './agentHostGitService.js';
 
 /** Log to stderr so messages appear in the terminal alongside the process. */
 function log(msg: string): void {
@@ -179,19 +173,6 @@
 	const agentService = new AgentService(logService, fileService, sessionDataService, productService, gitService);
 	disposables.add(agentService);
 
-	// Register agents
-	if (!options.quiet) {
-		// Production agents (require DI)
-		const pluginManager = new AgentPluginManager(URI.file(environmentService.userDataPath), fileService, logService);
-		diServices.set(IAgentPluginManager, pluginManager);
-		diServices.set(IDiffComputeService, disposables.add(new NodeWorkerDiffComputeService(logService)));
-		diServices.set(IAgentHostTerminalManager, agentService.terminalManager);
-		diServices.set(IAgentHostGitService, gitService);
-		const copilotAgent = disposables.add(instantiationService.createInstance(CopilotAgent));
-		agentService.registerProvider(copilotAgent);
-		log('CopilotAgent registered');
-	}
-
 	if (options.enableMockAgent) {
 		// Dynamic import to avoid bundling test code in production
 		import('../test/node/mockAgent.js').then(({ ScriptedMockAgent }) => {
