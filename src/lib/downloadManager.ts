import { PermissionsAndroid, Platform } from "react-native";
import { DownloadManager } from "react-native-nitro-player";
import { useDownloadStore } from "@/src/store/useDownloadStore";

export const configureDownloadManager = () => {
  DownloadManager.configure({
    maxConcurrentDownloads: 3,
    autoRetry: true,
    maxRetryAttempts: 3,
    backgroundDownloadsEnabled: true,
    downloadArtwork: true,
    wifiOnlyDownloads: false,
    storageLocation: "private",
  });

  // Set playback to prefer local files when available
  DownloadManager.setPlaybackSourcePreference("auto");

  // Refresh downloaded tracks in store on initialization
  useDownloadStore.getState().refreshDownloadedTracks();
};

export { requestNotificationPermission } from "@/src/lib/permissions";
