--- lib/vscode/src/vs/platform/agentHost/node/copilot/copilotToolDisplay.ts.orig	2026-06-02 15:20:00 UTC
+++ lib/vscode/src/vs/platform/agentHost/node/copilot/copilotToolDisplay.ts
@@ -3,7 +3,6 @@
  *  Licensed under the MIT License. See License.txt in the project root for license information.
  *--------------------------------------------------------------------------------------------*/
 
-import type { PermissionRequest } from '@github/copilot-sdk';
 import { hasKey } from '../../../../base/common/types.js';
 import { URI } from '../../../../base/common/uri.js';
 import { appendEscapedMarkdownInlineCode, escapeMarkdownLinkLabel } from '../../../../base/common/htmlContent.js';
@@ -595,11 +594,14 @@ export function tryStringify(value: unknown): string |
 // =============================================================================
 
 /**
- * Extends the SDK's {@link PermissionRequest} with the known extra properties
- * that arrive on the index-signature. The SDK defines these as `[key: string]: unknown`
- * so this interface adds proper types for the fields we actually use.
+ * Permission request fields used by the tool confirmation UI.
  */
-export interface ITypedPermissionRequest extends PermissionRequest {
+export interface ITypedPermissionRequest {
+	/** Permission kind requested by the agent host. */
+	kind: NonNullable<IAgentToolReadyEvent['permissionKind']>;
+	/** Preserve the SDK's loose index signature without importing the SDK. */
+	[key: string]: unknown;
+
 	/** File path — set for `read` permission requests. */
 	path?: string;
 	/** File path — set for `write` permission requests. */
