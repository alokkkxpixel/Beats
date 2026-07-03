import * as BackgroundFetch from "expo-background-fetch";
import * as FileSystem from "expo-file-system";
import * as TaskManager from "expo-task-manager";

/**
 * Background task name for download manager.
 */
const DOWNLOAD_TASK = "download-manager-task";

/**
 * Registers a background task that can be used to process queued downloads.
 * Call this once (e.g., in the root layout) to enable the manager.
 */
export async function configureDownloadManager() {
  // Define the task if not already defined.
  TaskManager.defineTask(DOWNLOAD_TASK, async () => {
    // console.log("🔄 Download manager background task triggered");
    // TODO: Pull pending download queue from persistent storage and process.
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    await BackgroundFetch.registerTaskAsync(DOWNLOAD_TASK, {
      // Adjust interval as needed; 15 minutes is a reasonable default.
      minimumInterval: 60 * 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    // console.log("✅ Download manager registered");
  } else {
    console.warn("⚠️ Background fetch not available on this device");
  }
}

/**
 * Simple helper to download a file to the app's document directory.
 * Returns the local URI on success.
 */
export async function downloadFile(
  remoteUrl: string,
  localFileName: string,
): Promise<string> {
  const downloadRes = await FileSystem.downloadAsync(
    remoteUrl,
    `${FileSystem.documentDirectory}${localFileName}`,
  );
  if (downloadRes.status !== 200) {
    throw new Error(`Download failed with status ${downloadRes.status}`);
  }
  return downloadRes.uri;
}
