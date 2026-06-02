--- lib/vscode/src/vs/platform/agentHost/node/agentHostMain.ts.orig
+++ lib/vscode/src/vs/platform/agentHost/node/agentHostMain.ts
@@ -17,7 +17,6 @@
 import { AgentHostIpcChannels, IAgentHostInspectInfo, IAgentHostSocketInfo, IConnectionTrackerService } from '../common/agentService.js';
 import { AgentService } from './agentService.js';
 import { IAgentHostTerminalManager } from './agentHostTerminalManager.js';
-import { CopilotAgent } from './copilot/copilotAgent.js';
 import { ProtocolServerHandler } from './protocolServerHandler.js';
 import { WebSocketProtocolServer } from './webSocketTransport.js';
 import { INativeEnvironmentService } from '../../environment/common/environment.js';
@@ -106,7 +105,6 @@
 		diServices.set(IDiffComputeService, diffComputeService);
 
 		diServices.set(IAgentHostTerminalManager, agentService.terminalManager);
-		agentService.registerProvider(instantiationService.createInstance(CopilotAgent));
 	} catch (err) {
 		logService.error('Failed to create AgentService', err);
 		throw err;
