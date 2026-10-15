import fs from "node:fs/promises";
import { ipcMain } from "electron";
import { normalizeCursorTelemetrySamples } from "../cursor/telemetry";
import { getCompanionAudioFallbackInfo } from "../recording/diagnostics";
import { rememberApprovedLocalReadPath } from "../project/manager";
import { currentVideoPath } from "../state";
import {
	getTelemetryPathForVideo,
	normalizeVideoSourcePath,
	parseJsonWithByteOrderMark,
} from "../utils";

/**
 * Sidecar files that may sit next to a video: cursor telemetry and separate
 * audio tracks. Recordly Lite cannot produce them (recording is removed), but
 * it still reads them so projects created by the full Recordly open correctly.
 */
export function registerMediaSidecarHandlers() {
	ipcMain.handle("get-cursor-telemetry", async (_, videoPath?: string) => {
		const targetVideoPath = normalizeVideoSourcePath(videoPath ?? currentVideoPath);
		if (!targetVideoPath) {
			return { success: true, samples: [] };
		}

		const telemetryPath = getTelemetryPathForVideo(targetVideoPath);
		try {
			const content = await fs.readFile(telemetryPath, "utf-8");
			const samples = normalizeCursorTelemetrySamples(
				parseJsonWithByteOrderMark<unknown>(content),
			);
			return { success: true, samples };
		} catch (error) {
			const nodeError = error as NodeJS.ErrnoException;
			if (nodeError.code === "ENOENT") {
				return { success: true, samples: [] };
			}
			console.error("Failed to load cursor telemetry:", error);
			return {
				success: false,
				message: "Failed to load cursor telemetry",
				error: String(error),
				samples: [],
			};
		}
	});

	ipcMain.handle("get-video-audio-fallback-paths", async (_event, videoPath: string) => {
		if (!videoPath) {
			return { success: true, paths: [], startDelayMsByPath: {} };
		}

		try {
			const { paths, startDelayMsByPath } = await getCompanionAudioFallbackInfo(videoPath);
			await Promise.all([
				rememberApprovedLocalReadPath(videoPath),
				...paths.map((fallbackPath) => rememberApprovedLocalReadPath(fallbackPath)),
			]);
			return { success: true, paths, startDelayMsByPath };
		} catch (error) {
			console.error("Failed to resolve companion audio fallback paths:", error);
			return { success: false, paths: [], startDelayMsByPath: {}, error: String(error) };
		}
	});
}
