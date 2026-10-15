import { BrowserWindow, ipcMain } from "electron";
import { createRecordingEditorNavigation } from "../../recordingEditorNavigation";

/**
 * Navigation between the project dashboard and the editor.
 *
 * In the full Recordly these handlers return from the recording HUD. Recordly
 * Lite has no HUD, so the window asking to switch is the editor itself — it is
 * registered as the return window so `switch-to-editor` reloads it. The reload
 * matters: picking a new video updates main-process state, and the editor only
 * reads that state while mounting.
 */
export function registerWindowNavigationHandlers(createEditorWindow: () => void) {
	const navigation = createRecordingEditorNavigation(createEditorWindow);

	ipcMain.handle("show-project-dashboard", (event) => {
		navigation.setReturnWindow(BrowserWindow.fromWebContents(event.sender));
		navigation.open(false);
	});

	ipcMain.handle("switch-to-editor", (event) => {
		navigation.setReturnWindow(BrowserWindow.fromWebContents(event.sender));
		navigation.open();
	});
}
