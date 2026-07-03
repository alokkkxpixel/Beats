import { getPreferredTrackUrl } from "@/src/lib/audioQuality";
import { requestNotificationPermission } from "@/src/lib/downloadManager";
import {
  deleteDownloadedTrackMetadata,
  getAudioQualityPreference,
  saveDownloadedTrackMetadata,
} from "@/src/lib/storage";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { SongDetail } from "@/types/jiosaavn";
import { ToastAndroid } from "react-native";
import { DownloadManager } from "react-native-nitro-player";
import { create } from "zustand";

interface DownloadProgress {
  downloadId: string;
  trackId: string;
  progress: number;
  state: "pending" | "downloading" | "paused" | "completed" | "failed";
  error?: string;
}

interface DownloadState {
  downloadedTracks: Set<string>;
  downloadProgress: Map<string, DownloadProgress>;
  isDownloading: boolean;

  // Actions
  downloadTrack: (track: SongDetail, playlistId?: string) => Promise<void>;
  downloadPlaylist: (playlistId: string, tracks: SongDetail[]) => Promise<void>;
  cancelDownload: (downloadId: string) => Promise<void>;
  pauseDownload: (downloadId: string) => Promise<void>;
  resumeDownload: (downloadId: string) => Promise<void>;
  deleteDownload: (trackId: string) => Promise<void>;
  checkDownloadStatus: (trackId: string) => Promise<boolean>;
  refreshDownloadedTracks: () => Promise<void>;
  getDownloadProgress: (trackId: string) => DownloadProgress | undefined;
}

const mapToTrackItem = (song: SongDetail) => {
  const audioQuality = getAudioQualityPreference();
  return {
    id: song.id,
    title: song.name,
    artist:
      song.primaryArtists ||
      song.artists?.primary?.[0]?.name ||
      "Unknown Artist",
    album:
      typeof song.album === "string"
        ? song.album
        : song.album?.name || "Unknown Album",
    duration: song.duration || 0,
    url: getPreferredTrackUrl(song, audioQuality),
    artwork: Array.isArray(song.image)
      ? typeof song.image[song.image.length - 1] === "string"
        ? song.image[song.image.length - 1]
        : (song.image[song.image.length - 1] as any)?.url || ""
      : typeof song.image === "string"
        ? song.image
        : "",
    extraPayload: { song: song as any },
  };
};

const isActiveDownloadState = (state: DownloadProgress["state"]) =>
  state === "pending" || state === "downloading";

const computeIsDownloading = (progress: Map<string, DownloadProgress>) =>
  Array.from(progress.values()).some((entry) =>
    isActiveDownloadState(entry.state),
  );

let downloadListenersRegistered = false;

const registerDownloadListeners = () => {
  if (downloadListenersRegistered) return;

  DownloadManager.onDownloadProgress((progress) => {
    useDownloadStore.setState((state) => {
      const newProgress = new Map(state.downloadProgress);
      const existing = newProgress.get(progress.trackId);

      if (existing) {
        newProgress.set(progress.trackId, {
          ...existing,
          progress: progress.progress,
          state: "downloading",
        });
      } else {
        newProgress.set(progress.trackId, {
          downloadId: progress.downloadId,
          trackId: progress.trackId,
          progress: progress.progress,
          state: "downloading",
        });
      }

      return {
        downloadProgress: newProgress,
        isDownloading: computeIsDownloading(newProgress),
      };
    });
  });

  DownloadManager.onDownloadComplete((downloadedTrack) => {
    const trackId = downloadedTrack.originalTrack.id;
    ToastAndroid.show(
      `Downloaded: ${downloadedTrack.originalTrack.title}`,
      ToastAndroid.SHORT,
    );

    useDownloadStore.setState((state) => {
      const newProgress = new Map(state.downloadProgress);
      const existing = newProgress.get(trackId);

      if (existing) {
        newProgress.set(trackId, {
          ...existing,
          progress: 1,
          state: "completed",
        });
      }

      const newDownloaded = new Set(state.downloadedTracks);
      newDownloaded.add(trackId);

      return {
        downloadProgress: newProgress,
        downloadedTracks: newDownloaded,
        isDownloading: computeIsDownloading(newProgress),
      };
    });
  });

  DownloadManager.onDownloadStateChange((downloadId, trackId, state, error) => {
    if (state !== "failed") return;

    deleteDownloadedTrackMetadata(trackId);

    useDownloadStore.setState((currentState) => {
      const newProgress = new Map(currentState.downloadProgress);
      const existing = newProgress.get(trackId);

      if (existing) {
        newProgress.set(trackId, {
          ...existing,
          downloadId,
          state: "failed",
          error: error?.message,
        });
      } else {
        newProgress.set(trackId, {
          downloadId,
          trackId,
          progress: 0,
          state: "failed",
          error: error?.message,
        });
      }

      return {
        downloadProgress: newProgress,
        isDownloading: computeIsDownloading(newProgress),
      };
    });
  });

  downloadListenersRegistered = true;
};

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloadedTracks: new Set(),
  downloadProgress: new Map(),
  isDownloading: false,

  downloadTrack: async (track: SongDetail, playlistId?: string) => {
    try {
      // console.log("Starting download for track:", track.id, track.name);

      // Request notification permission before downloading
      await requestNotificationPermission();

      let fullTrack = track;
      const isPartial = !track.downloadUrl || track.downloadUrl.length === 0;
      if (isPartial) {
        // console.log("Track details are partial, fetching full details for download...");
        const response = await jioSaavnService.getSongByIdandLink(
          track.id,
          track.url || (track as any).perma_url || "",
        );
        if (response.success && response.data[0]) {
          fullTrack = response.data[0];
        } else {
          console.warn(
            "Failed to fetch full track details for download, using original track metadata",
          );
        }
      }

      const trackItem = mapToTrackItem(fullTrack);
      // console.log("Track item mapped:", trackItem);

      saveDownloadedTrackMetadata(track.id, fullTrack);

      set((state) => ({
        isDownloading: true,
        downloadProgress: new Map(state.downloadProgress).set(track.id, {
          downloadId: track.id,
          trackId: track.id,
          progress: 0,
          state: "pending",
        }),
      }));

      const downloadId = await DownloadManager.downloadTrack(
        trackItem,
        playlistId || "downloads",
      );

      // console.log("Download started with ID:", downloadId);

      set({
        isDownloading: true,
        downloadProgress: new Map(get().downloadProgress).set(track.id, {
          downloadId,
          trackId: track.id,
          progress: 0,
          state: "pending",
        }),
      });
    } catch (error) {
      console.error("Error downloading track:", error);
      deleteDownloadedTrackMetadata(track.id);
      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        const existing = newProgress.get(track.id);
        if (existing) {
          newProgress.set(track.id, {
            ...existing,
            state: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        return {
          downloadProgress: newProgress,
          isDownloading: computeIsDownloading(newProgress),
        };
      });
    }
  },

  downloadPlaylist: async (playlistId: string, tracks: SongDetail[]) => {
    try {
      // console.log("Starting download for playlist:", playlistId);

      await requestNotificationPermission();

      const downloadedTracks = get().downloadedTracks;
      const downloadProgress = get().downloadProgress;
      const tracksToDownload = tracks.filter(
        (t) =>
          !downloadedTracks.has(t.id) &&
          downloadProgress.get(t.id)?.state !== "downloading" &&
          downloadProgress.get(t.id)?.state !== "pending",
      );

      if (tracksToDownload.length === 0) {
        // console.log("All tracks in playlist are already downloaded or downloading.");
        return;
      }

      const resolvedTracks = await Promise.all(
        tracksToDownload.map(async (track) => {
          let fullTrack = track;
          const isPartial =
            !track.downloadUrl || track.downloadUrl.length === 0;
          if (isPartial) {
            try {
              const response = await jioSaavnService.getSongByIdandLink(
                track.id,
                track.url || (track as any).perma_url || "",
              );
              if (response.success && response.data[0]) {
                fullTrack = response.data[0];
              }
            } catch (err) {
              console.warn(
                "Failed to fetch full track details for",
                track.id,
                err,
              );
            }
          }
          return fullTrack;
        }),
      );

      const trackItems = resolvedTracks.map((track) => {
        saveDownloadedTrackMetadata(track.id, track);
        return mapToTrackItem(track);
      });

      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        for (const track of resolvedTracks) {
          newProgress.set(track.id, {
            downloadId: track.id,
            trackId: track.id,
            progress: 0,
            state: "pending",
          });
        }
        return {
          isDownloading: true,
          downloadProgress: newProgress,
        };
      });

      const downloadIds = await DownloadManager.downloadPlaylist(
        playlistId || "playlist",
        trackItems,
      );

      // console.log("Playlist downloads started with IDs:", downloadIds);
      ToastAndroid.show("Downloading playlist...", ToastAndroid.SHORT);

      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        resolvedTracks.forEach((track, index) => {
          const downloadId = downloadIds[index] || track.id;
          newProgress.set(track.id, {
            downloadId,
            trackId: track.id,
            progress: 0,
            state: "pending",
          });
        });
        return {
          isDownloading: true,
          downloadProgress: newProgress,
        };
      });
    } catch (error) {
      console.error("Error downloading playlist:", error);
    }
  },

  cancelDownload: async (downloadId: string) => {
    try {
      await DownloadManager.cancelDownload(downloadId);
      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        let removedTrackId: string | null = null;
        for (const [trackId, progress] of newProgress.entries()) {
          if (progress.downloadId === downloadId) {
            removedTrackId = trackId;
            newProgress.delete(trackId);
            break;
          }
        }
        if (removedTrackId) {
          deleteDownloadedTrackMetadata(removedTrackId);
        }
        return {
          downloadProgress: newProgress,
          isDownloading: computeIsDownloading(newProgress),
        };
      });
    } catch (error) {
      console.error("Error canceling download:", error);
    }
  },

  pauseDownload: async (downloadId: string) => {
    try {
      await DownloadManager.pauseDownload(downloadId);
      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        for (const [trackId, progress] of newProgress.entries()) {
          if (progress.downloadId === downloadId) {
            newProgress.set(trackId, { ...progress, state: "paused" });
            break;
          }
        }
        return {
          downloadProgress: newProgress,
          isDownloading: computeIsDownloading(newProgress),
        };
      });
    } catch (error) {
      console.error("Error pausing download:", error);
    }
  },

  resumeDownload: async (downloadId: string) => {
    try {
      await DownloadManager.resumeDownload(downloadId);
      set((state) => {
        const newProgress = new Map(state.downloadProgress);
        for (const [trackId, progress] of newProgress.entries()) {
          if (progress.downloadId === downloadId) {
            newProgress.set(trackId, { ...progress, state: "downloading" });
            break;
          }
        }
        return {
          downloadProgress: newProgress,
          isDownloading: computeIsDownloading(newProgress),
        };
      });
    } catch (error) {
      console.error("Error resuming download:", error);
    }
  },

  deleteDownload: async (trackId: string) => {
    try {
      await DownloadManager.deleteDownloadedTrack(trackId);
      deleteDownloadedTrackMetadata(trackId);
      ToastAndroid.show("Download removed", ToastAndroid.SHORT);
      set((state) => {
        const newDownloaded = new Set(state.downloadedTracks);
        newDownloaded.delete(trackId);
        const newProgress = new Map(state.downloadProgress);
        newProgress.delete(trackId);
        return {
          downloadedTracks: newDownloaded,
          downloadProgress: newProgress,
          isDownloading: computeIsDownloading(newProgress),
        };
      });
    } catch (error) {
      console.error("Error deleting download:", error);
    }
  },

  checkDownloadStatus: async (trackId: string) => {
    try {
      const isDownloaded = await DownloadManager.isTrackDownloaded(trackId);
      set((state) => {
        const newDownloaded = new Set(state.downloadedTracks);
        if (isDownloaded) {
          newDownloaded.add(trackId);
        } else {
          newDownloaded.delete(trackId);
        }
        return { downloadedTracks: newDownloaded };
      });
      return isDownloaded;
    } catch (error) {
      console.error("Error checking download status:", error);
      return false;
    }
  },

  refreshDownloadedTracks: async () => {
    try {
      const allDownloaded = await DownloadManager.getAllDownloadedTracks();
      const downloadedIds = new Set(
        allDownloaded.map((t) => t.originalTrack.id),
      );
      set({ downloadedTracks: downloadedIds });
    } catch (error) {
      console.error("Error refreshing downloaded tracks:", error);
    }
  },

  getDownloadProgress: (trackId: string) => {
    return get().downloadProgress.get(trackId);
  },
}));

registerDownloadListeners();
useDownloadStore.getState().refreshDownloadedTracks();
