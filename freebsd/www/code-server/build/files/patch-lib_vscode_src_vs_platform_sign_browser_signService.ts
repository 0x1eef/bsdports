--- lib/vscode/src/vs/platform/sign/browser/signService.ts.orig
+++ lib/vscode/src/vs/platform/sign/browser/signService.ts
@@ -58,6 +58,10 @@ export class SignService extends AbstractSignService implemen
 
 	@memoize
 	private async vsda(): Promise<typeof vsda_web> {
+		if (!this.productService.serverLicense?.length) {
+			throw new Error('vsda unavailable');
+		}
+
 		const checkInterval = new WindowIntervalTimer();
 		let [wasm] = await Promise.all([
 			this.getWasmBytes(),
