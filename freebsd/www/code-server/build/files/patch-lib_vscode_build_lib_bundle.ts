--- lib/vscode/build/lib/bundle.ts.orig
+++ lib/vscode/build/lib/bundle.ts
@@ -14,18 +14,18 @@
 
 // Taken from typescript compiler => emitFiles
 const BOILERPLATE = [
-	{ start: /^var __extends/, end: /^}\)\(\);$/ },
-	{ start: /^var __assign/, end: /^};$/ },
-	{ start: /^var __decorate/, end: /^};$/ },
-	{ start: /^var __metadata/, end: /^};$/ },
-	{ start: /^var __param/, end: /^};$/ },
-	{ start: /^var __awaiter/, end: /^};$/ },
-	{ start: /^var __generator/, end: /^};$/ },
-	{ start: /^var __createBinding/, end: /^}\)\);$/ },
-	{ start: /^var __setModuleDefault/, end: /^}\);$/ },
-	{ start: /^var __importStar/, end: /^};$/ },
-	{ start: /^var __addDisposableResource/, end: /^};$/ },
-	{ start: /^var __disposeResources/, end: /^}\);$/ },
+	{ start: /^var __extends =/, end: /^}\)\(\);$/ },
+	{ start: /^var __assign =/, end: /^};$/ },
+	{ start: /^var __decorate =/, end: /^};$/ },
+	{ start: /^var __metadata =/, end: /^};$/ },
+	{ start: /^var __param =/, end: /^};$/ },
+	{ start: /^var __awaiter =/, end: /^};$/ },
+	{ start: /^var __generator =/, end: /^};$/ },
+	{ start: /^var __createBinding =/, end: /^}\)\);$/ },
+	{ start: /^var __setModuleDefault =/, end: /^}\);$/ },
+	{ start: /^var __importStar =/, end: /^};$/ },
+	{ start: /^var __addDisposableResource =/, end: /^};$/ },
+	{ start: /^var __disposeResources =/, end: /^}\);$/ },
 ];
 
 function removeDuplicateTSBoilerplate(source: string, SEEN_BOILERPLATE: boolean[] = []): string {
