import { ipcMain, shell } from "electron";

/**
 * Recordly Lite does not record, so it needs no camera, microphone, screen or
 * accessibility permission handlers. Opening external links is all that is
 * left of the original permissions module.
 */
export function registerExternalLinkHandlers() {
	ipcMain.handle("open-external-url", async (_, url: string) => {
		try {
			// Security: only allow http/https URLs to prevent file:// or custom protocol abuse
			const parsed = new URL(url);
			if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
				return { success: false, error: `Blocked non-HTTP URL: ${parsed.protocol}` };
			}
			await shell.openExternal(url);
			return { success: true };
		} catch (error) {
			console.error("Failed to open URL:", error);
			return { success: false, error: String(error) };
		}
	});
}
