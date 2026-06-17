import { getPreferredTrackUrl } from "@/src/lib/audioQuality";
import {
  AudioQualityPreference,
  getAudioQualityPreference,
  setAudioQualityPreference,
  getLikedSongs,
  saveLikedSongs,
} from "@/src/lib/storage";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { SongDetail } from "@/types/jiosaavn";
// ===== COMMENTED OUT: RNTP imports =====
// import TrackPlayer, { State } from "react-native-track-player";

// ===== NEW: Nitro Player imports =====
import { PlayerQueue, TrackItem, TrackPlayer } from "react-native-nitro-player";
import { create } from "zustand";

const mapToTrackItem = (
  song: SongDetail,
  audioQuality: AudioQualityPreference = getAudioQualityPreference(),
): TrackItem => ({
  id: song.id,
  title: song.name,
  artist:
    song.primaryArtists || song.artists?.primary?.[0]?.name || "Unknown Artist",
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
  extraPayload: { song: song as any }, // Store the full original song data
});

const shuffleSongs = (songs: SongDetail[]) => {
  const shuffled = [...songs];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const reorderQueueInPlaylist = async (
  playlistId: string,
  currentQueue: SongDetail[],
  targetQueue: SongDetail[],
) => {
  const workingQueue = [...currentQueue];

  for (
    let targetIndex = 0;
    targetIndex < targetQueue.length;
    targetIndex += 1
  ) {
    const desiredTrackId = targetQueue[targetIndex]?.id;
    const currentIndex = workingQueue.findIndex(
      (track) => track.id === desiredTrackId,
    );

    if (currentIndex === -1 || currentIndex === targetIndex) {
      continue;
    }

    await PlayerQueue.reorderTrackInPlaylist(
      playlistId,
      desiredTrackId,
      targetIndex,
    );

    const [movedTrack] = workingQueue.splice(currentIndex, 1);
    workingQueue.splice(targetIndex, 0, movedTrack);
  }
};

interface PlayerState {
  // --- Data ---
  currentTrack: SongDetail | null;
  audioQuality: AudioQualityPreference;
  queue: SongDetail[];
  likedSongs: SongDetail[];
  currentIndex: number;
  activePlaylistId: string | null;
  originalQueue: SongDetail[] | null;
  isPlaying: boolean;
  isLoading: boolean;
  isShuffleEnabled: boolean;
  isFullPlayerOpen: boolean;
  selectedSongOption: SongDetail | null | string;
  isMoreOptionOpen: boolean;
  isQueueOpen: boolean;

  isDrawerOpen: boolean;
  isLyricsOpen: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  // --- Progress / Seekbar ---
  position: number;
  duration: number;
  buffered: number;

  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isFetchingSuggestions: boolean;

  // --- Actions ---
  setCurrentTrack: (track: SongDetail, contextQueue?: SongDetail[]) => void;
  setAudioQuality: (quality: AudioQualityPreference) => Promise<void>;

  setQueue: (tracks: SongDetail[], startIndex?: number) => void;
  fetchAndAppendSuggestions: (trackId: string) => Promise<void>;
  expandFullPlayer: () => void;
  setSelectedSongOption: (track: SongDetail | null) => void;
  minimizeFullPlayer: () => void;
  expandMoreOption: () => void;
  minizeMoreOption: () => void;
  expandQueue: () => void;
  minimizeQueue: () => void;
  expandLyrics: () => void;
  minimizeLyrics: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  toggleLike: (song: SongDetail) => Promise<void>;
  syncLikedPlaylist: () => Promise<void>;

  // --- Playback Controls ---
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  addToQueue: (track: SongDetail) => Promise<void>;
  playNext: (track: SongDetail) => Promise<void>;

  // --- Seek Bar Logic ---
  seek: (position: number) => Promise<void>;

  // --- Internal State Updates (Used by the audio engine) ---
  updateProgress: (position: number, duration: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial State
  currentTrack: null,
  audioQuality: getAudioQualityPreference(),
  queue: [],
  likedSongs: getLikedSongs(),
  currentIndex: -1,
  activePlaylistId: null,
  originalQueue: null,
  isPlaying: false,
  isLoading: false,
  isShuffleEnabled: false,
  isFullPlayerOpen: false,
  position: 0,
  duration: 0,
  buffered: 0,
  isMoreOptionOpen: false,
  isQueueOpen: false,
  isLyricsOpen: false,
  isDrawerOpen: false,
  selectedSongOption: "",
  isDragging: false,
  isFetchingSuggestions: false,
  accentColor: "#222222ff",

  setAccentColor: (color) =>
    set({
      accentColor: color,
    }),

  setIsDragging: (isDragging) => set({ isDragging }),
  // set individual track info
  setSelectedSongOption: (track) => set({ selectedSongOption: track }),
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  toggleLike: async (song) => {
    const { likedSongs } = get();
    const isLiked = likedSongs.some((s) => s.id === song.id);
    let updated: SongDetail[];
    if (isLiked) {
      updated = likedSongs.filter((s) => s.id !== song.id);
    } else {
      updated = [song, ...likedSongs];
    }
    saveLikedSongs(updated);
    set({ likedSongs: updated });

    // Sync with Nitro Player Queue Playlist
    try {
      const playlists = PlayerQueue.getAllPlaylists();
      let likedPlaylist = playlists.find((p) => p.name === "Liked music");
      let playlistId = likedPlaylist?.id;

      if (!playlistId) {
        playlistId = await PlayerQueue.createPlaylist(
          "Liked music",
          "like by the user",
          "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-songs-delhi-1200.png"
        );
      }

      if (!isLiked) {
        // Just got liked, so add it
        const audioQuality = get().audioQuality;
        const trackItem = mapToTrackItem(song, audioQuality);
        const playlistObj = PlayerQueue.getPlaylist(playlistId);
        const exists = playlistObj?.tracks.some((t) => t.id === song.id);
        if (!exists) {
          await PlayerQueue.addTrackToPlaylist(playlistId, trackItem);
        }
      } else {
        // Just got unliked, so remove it
        await PlayerQueue.removeTrackFromPlaylist(playlistId, song.id);
      }
    } catch (e) {
      console.error("Error syncing liked songs with Nitro Player Queue", e);
    }
  },

  syncLikedPlaylist: async () => {
    const { likedSongs, audioQuality } = get();
    try {
      const playlists = PlayerQueue.getAllPlaylists();
      let likedPlaylist = playlists.find((p) => p.name === "Liked music");
      if (likedPlaylist) {
        await PlayerQueue.deletePlaylist(likedPlaylist.id);
      }
      const playlistId = await PlayerQueue.createPlaylist(
        "Liked music",
        "like by the user",
        "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-songs-delhi-1200.png"
      );
      if (likedSongs.length > 0) {
        const trackItems = likedSongs.map((s) => mapToTrackItem(s, audioQuality));
        await PlayerQueue.addTracksToPlaylist(playlistId, trackItems);
      }
    } catch (error) {
      console.error("Error syncing liked playlist to native:", error);
    }
  },
  setAudioQuality: async (quality) => {
    const {
      activePlaylistId,
      audioQuality,
      currentIndex,
      isPlaying,
      position,
      queue,
    } = get();

    setAudioQualityPreference(quality);

    if (audioQuality === quality) {
      set({ audioQuality: quality });
      return;
    }

    set({ audioQuality: quality });

    if (!activePlaylistId || queue.length === 0) {
      return;
    }

    try {
      const updatedTrackItems = queue.map((track) =>
        mapToTrackItem(track, quality),
      );
      const playlistId = await PlayerQueue.createPlaylist(
        `Queue_${Date.now()}`,
        "Playback Queue",
      );

      await PlayerQueue.addTracksToPlaylist(playlistId, updatedTrackItems);
      await PlayerQueue.loadPlaylist(playlistId, Math.max(currentIndex, 0));
      await TrackPlayer.seek(position);

      if (isPlaying) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }

      set({ activePlaylistId: playlistId });
    } catch (error) {
      console.error("Error applying audio quality:", error);
    }
  },

  // Set individual track and start playing
  setCurrentTrack: async (track, contextQueue) => {
    try {
      // Normalize the track first to handle both full SongDetail and partial listing/search items
      const normalizedTrack = {
        ...track,
        id: track.id,
        name: track.name || (track as any).title || "",
        image: track.image,
        primaryArtists:
          track.primaryArtists ||
          track.artists?.primary?.[0]?.name ||
          (track as any).subtitle ||
          (track as any).artist ||
          "Unknown Artist",
        album:
          typeof track.album === "string"
            ? track.album
            : track.album?.name || (track as any).album || "",
        url: track.url || (track as any).perma_url || "",
      };

      // 1. If we have a context queue (like an album/playlist), use it instead of suggestions
      if (contextQueue && contextQueue.length > 0) {
        const index = contextQueue.findIndex(
          (t) => t.id === normalizedTrack.id,
        );
        if (index !== -1) {
          get().setQueue(contextQueue, index);
          return;
        }
      }

      // 2. Update store metadata IMMEDIATELY with the normalized track
      set({
        currentTrack: normalizedTrack as any,
        queue: [normalizedTrack] as any,
        currentIndex: 0,
        position: 0,
        duration: normalizedTrack.duration || 0,
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true,
        isShuffleEnabled: false,
        originalQueue: null,
      });

      let fullTrack = normalizedTrack as any;
      const isPartial =
        !normalizedTrack.downloadUrl ||
        normalizedTrack.downloadUrl.length === 0;

      if (isPartial) {
        const response = await jioSaavnService.getSongByIdandLink(
          normalizedTrack.id,
          normalizedTrack.url,
        );
        if (response.success && response.data[0]) {
          fullTrack = response.data[0];
          // Update store with full details
          set({
            currentTrack: fullTrack,
            queue: [fullTrack],
            duration: fullTrack.duration || 0,
          });
        } else {
          throw new Error("Failed to fetch song details");
        }
      }

      const trackItems = [fullTrack].map((item) =>
        mapToTrackItem(item, get().audioQuality),
      );

      // 3. Create and load playlist in native player
      const playlistId = await PlayerQueue.createPlaylist(
        `Quick Play: ${fullTrack.name}`,
        "Auto Queue",
      );

      set({ activePlaylistId: playlistId });
      await PlayerQueue.addTracksToPlaylist(playlistId, trackItems);
      await PlayerQueue.loadPlaylist(playlistId);

      // 4. Force skip to the first track
      await TrackPlayer.skipToIndex(0);
      await TrackPlayer.seek(0);
      await TrackPlayer.play();

      set({ isLoading: false });
    } catch (error) {
      console.error("Error playing track:", error);
      set({ isLoading: false });
    }
  },

  // Set a whole queue (e.g. from an album or playlist)
  setQueue: async (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;

    try {
      const selectedTrack = tracks[startIndex];

      const normalizedSelectedTrack = {
        ...selectedTrack,
        id: selectedTrack.id,
        name: selectedTrack.name || (selectedTrack as any).title || "",
        image: selectedTrack.image,
        primaryArtists:
          selectedTrack.primaryArtists ||
          selectedTrack.artists?.primary?.[0]?.name ||
          (selectedTrack as any).subtitle ||
          (selectedTrack as any).artist ||
          "Unknown Artist",
        album:
          typeof selectedTrack.album === "string"
            ? selectedTrack.album
            : selectedTrack.album?.name || (selectedTrack as any).album || "",
        url: selectedTrack.url || (selectedTrack as any).perma_url || "",
      };

      const normalizedQueue = tracks.map((track) => ({
        ...track,
        id: track.id,
        name: track.name || (track as any).title || "",
        image: track.image,
        primaryArtists:
          track.primaryArtists ||
          track.artists?.primary?.[0]?.name ||
          (track as any).subtitle ||
          (track as any).artist ||
          "Unknown Artist",
        album:
          typeof track.album === "string"
            ? track.album
            : track.album?.name || (track as any).album || "",
        url: track.url || (track as any).perma_url || "",
      }));

      // 1. Update store metadata IMMEDIATELY
      set({
        queue: normalizedQueue as any,
        currentIndex: startIndex,
        currentTrack: normalizedSelectedTrack as any,
        position: 0,
        duration: normalizedSelectedTrack.duration || 0,
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true,
        isShuffleEnabled: false,
        originalQueue: null,
      });

      let fullTrack = normalizedSelectedTrack as any;
      const isPartial =
        !normalizedSelectedTrack.downloadUrl ||
        normalizedSelectedTrack.downloadUrl.length === 0;

      if (isPartial) {
        const response = await jioSaavnService.getSongByIdandLink(
          normalizedSelectedTrack.id,
          normalizedSelectedTrack.url,
        );
        if (response.success && response.data[0]) {
          fullTrack = response.data[0];

          const updatedQueue = [...normalizedQueue];
          updatedQueue[startIndex] = fullTrack;

          set({
            currentTrack: fullTrack,
            queue: updatedQueue as any,
            duration: fullTrack.duration || 0,
          });
        } else {
          throw new Error("Failed to fetch song details");
        }
      }

      const trackItems = get().queue.map((item) =>
        mapToTrackItem(item, get().audioQuality),
      );

      // 2. Create and load playlist in native player
      const playlistId = await PlayerQueue.createPlaylist(
        `Queue_${Date.now()}`,
        "Playback Queue",
      );

      set({ activePlaylistId: playlistId });
      await PlayerQueue.addTracksToPlaylist(playlistId, trackItems);
      await PlayerQueue.loadPlaylist(playlistId);

      // 3. Navigate to correct index and play
      // Small delay to ensure native side has processed the tracks
      await new Promise((resolve) => setTimeout(resolve, 200));
      await TrackPlayer.skipToIndex(startIndex);
      await TrackPlayer.seek(0);
      await TrackPlayer.play();

      set({ isLoading: false });
    } catch (error) {
      console.error("Error setting queue:", error);
      set({ isLoading: false });
    }
  },

  fetchAndAppendSuggestions: async (trackId: string) => {
    try {
      const { queue, activePlaylistId, isFetchingSuggestions } = get();
      if (!activePlaylistId || isFetchingSuggestions) return;

      // console.log("🔄 Fetching more suggestions for autoplay...");
      set({ isFetchingSuggestions: true });

      const response = await jioSaavnService.getSuggestedSongs(trackId, 10);
      const suggestions: SongDetail[] = Array.isArray(response)
        ? response
        : response?.data || [];

      if (suggestions.length === 0) {
        set({ isFetchingSuggestions: false });
        return;
      }

      // Filter out songs already in queue to avoid duplicates
      const newSongs = suggestions.filter(
        (s) => !queue.some((q) => q.id === s.id),
      );
      if (newSongs.length === 0) {
        set({ isFetchingSuggestions: false });
        return;
      }

      const updatedQueue = [...queue, ...newSongs];
      set({ queue: updatedQueue });

      // Add to native player queue
      const trackItems = newSongs.map((item) =>
        mapToTrackItem(item, get().audioQuality),
      );
      await PlayerQueue.addTracksToPlaylist(activePlaylistId, trackItems);
      // console.log(`✅ Appended ${newSongs.length} new songs to queue`);
      set({ isFetchingSuggestions: false });
    } catch (error) {
      console.error("Error fetching more suggestions:", error);
      set({ isFetchingSuggestions: false });
    }
  },

  expandFullPlayer: () => set({ isFullPlayerOpen: true }),
  minimizeFullPlayer: () => set({ isFullPlayerOpen: false }),

  expandMoreOption: () => set({ isMoreOptionOpen: true }),
  minizeMoreOption: () => set({ isMoreOptionOpen: false }),

  expandQueue: () => set({ isQueueOpen: true }),
  minimizeQueue: () => set({ isQueueOpen: false }),
  expandLyrics: () => set({ isLyricsOpen: true }),
  minimizeLyrics: () => set({ isLyricsOpen: false }),
  // Playback Controls
  play: async () => {
    await TrackPlayer.play();
    set({ isPlaying: true });
  },

  pause: async () => {
    await TrackPlayer.pause();
    set({ isPlaying: false });
  },

  togglePlay: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await TrackPlayer.pause();
      set({ isPlaying: false });
    } else {
      await TrackPlayer.play();
      set({ isPlaying: true });
    }
  },

  next: async () => {
    try {
      await TrackPlayer.skipToNext();
      // Store update will be handled by GlobalAudioPlayer sync
    } catch (error) {
      console.error("Error skipping to next:", error);
    }
  },

  previous: async () => {
    try {
      const { position } = get();
      if (position > 3) {
        await TrackPlayer.seek(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (error) {
      console.error("Error skipping to previous:", error);
    }
  },

  seek: async (position) => {
    await TrackPlayer.seek(position);
    set({ position });
  },

  toggleShuffle: async () => {
    const {
      currentTrack,
      currentIndex,
      activePlaylistId,
      isShuffleEnabled,
      originalQueue,
      queue,
    } = get();

    if (!currentTrack || !activePlaylistId || queue.length < 2) return;

    try {
      if (isShuffleEnabled && originalQueue?.length) {
        const playedTrackIds = new Set(
          queue.slice(0, currentIndex).map((track) => track.id),
        );
        playedTrackIds.add(currentTrack.id);

        const restoredUpcoming = originalQueue.filter(
          (track) => !playedTrackIds.has(track.id),
        );
        const restoredQueue = [
          ...queue.slice(0, currentIndex),
          currentTrack,
          ...restoredUpcoming,
        ];

        await reorderQueueInPlaylist(activePlaylistId, queue, restoredQueue);

        set({
          isShuffleEnabled: false,
          originalQueue: null,
          queue: restoredQueue,
        });

        return;
      }

      const trackAfterCurrent = queue
        .slice(currentIndex + 1)
        .filter((track) => track.id !== currentTrack.id);
      const shuffledQueue = [
        ...queue.slice(0, currentIndex + 1),
        ...shuffleSongs(trackAfterCurrent),
      ];

      await reorderQueueInPlaylist(activePlaylistId, queue, shuffledQueue);

      set({
        isShuffleEnabled: true,
        originalQueue: [...queue],
        queue: shuffledQueue,
      });
    } catch (error) {
      console.error("Error toggling shuffle:", error);
    }
  },

  addToQueue: async (track) => {
    const { activePlaylistId, originalQueue, queue } = get();
    if (!track?.id) return;

    if (!activePlaylistId || queue.length === 0) {
      await get().setCurrentTrack(track);
      return;
    }

    if (queue.some((queuedTrack) => queuedTrack.id === track.id)) {
      return;
    }

    try {
      await PlayerQueue.addTrackToPlaylist(
        activePlaylistId,
        mapToTrackItem(track, get().audioQuality),
      );

      set({
        originalQueue: originalQueue ? [...originalQueue, track] : null,
        queue: [...queue, track],
      });
    } catch (error) {
      console.error("Error adding track to queue:", error);
    }
  },

  playNext: async (track) => {
    const { activePlaylistId, currentIndex, originalQueue, queue } = get();
    if (!track?.id) return;

    if (!activePlaylistId || queue.length === 0) {
      await get().setCurrentTrack(track);
      return;
    }

    const existingIndex = queue.findIndex(
      (queuedTrack) => queuedTrack.id === track.id,
    );
    const insertIndex = Math.min(currentIndex + 1, queue.length);

    try {
      let nextQueue = [...queue];

      if (existingIndex === -1) {
        await PlayerQueue.addTrackToPlaylist(
          activePlaylistId,
          mapToTrackItem(track, get().audioQuality),
        );
        await PlayerQueue.reorderTrackInPlaylist(
          activePlaylistId,
          track.id,
          insertIndex,
        );
        nextQueue.splice(insertIndex, 0, track);
      } else {
        await PlayerQueue.reorderTrackInPlaylist(
          activePlaylistId,
          track.id,
          insertIndex,
        );

        const [existingTrack] = nextQueue.splice(existingIndex, 1);
        const adjustedIndex =
          existingIndex < insertIndex ? insertIndex - 1 : insertIndex;
        nextQueue.splice(adjustedIndex, 0, existingTrack);
      }

      const nextOriginalQueue = originalQueue ? [...originalQueue] : null;
      if (nextOriginalQueue) {
        const originalExistingIndex = nextOriginalQueue.findIndex(
          (queuedTrack) => queuedTrack.id === track.id,
        );
        if (originalExistingIndex !== -1) {
          const [existingTrack] = nextOriginalQueue.splice(
            originalExistingIndex,
            1,
          );
          nextOriginalQueue.splice(
            Math.min(currentIndex + 1, nextOriginalQueue.length),
            0,
            existingTrack,
          );
        } else {
          nextOriginalQueue.splice(
            Math.min(currentIndex + 1, nextOriginalQueue.length),
            0,
            track,
          );
        }
      }

      set({
        originalQueue: nextOriginalQueue,
        queue: nextQueue,
      });
    } catch (error) {
      console.error("Error moving track to play next:", error);
    }
  },

  // Updates from audio engine
  updateProgress: (position, duration) => {
    const state = get();
    if (state.position === position && state.duration === duration) return;
    set({ position, duration });
  },

  setPlaying: (isPlaying) => {
    if (get().isPlaying === isPlaying) return;
    set({ isPlaying });
  },
  setLoading: (isLoading) => {
    if (get().isLoading === isLoading) return;
    set({ isLoading });
  },
}));
