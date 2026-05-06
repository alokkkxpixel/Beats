import { jioSaavnService } from "@/src/services/jioSaavnService";
import { SongDetail } from "@/types/jiosaavn";
// ===== COMMENTED OUT: RNTP imports =====
// import TrackPlayer, { State } from "react-native-track-player";

// ===== NEW: Nitro Player imports =====
import { PlayerQueue, TrackItem, TrackPlayer } from "react-native-nitro-player";
import { create } from "zustand";

const mapToTrackItem = (song: SongDetail): TrackItem => ({
  id: song.id,
  title: song.name,
  artist:
    song.primaryArtists || song.artists?.primary?.[0]?.name || "Unknown Artist",
  album:
    typeof song.album === "string"
      ? song.album
      : song.album?.name || "Unknown Album",
  duration: song.duration || 0,
  url: song.downloadUrl?.[song.downloadUrl.length - 1]?.url || song.url,
  artwork: song.image?.[song.image.length - 1]?.url || "",
  extraPayload: { song: song as any }, // Store the full original song data
});

interface PlayerState {
  // --- Data ---
  currentTrack: SongDetail | null;
  queue: SongDetail[];
  currentIndex: number;
  activePlaylistId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  isFullPlayerOpen: boolean;
  selectedSongOption: SongDetail | null | string;
  isMoreOptionOpen: boolean;
  isQueueOpen: boolean;
  isDrawerOpen: boolean;
  // --- Progress / Seekbar ---
  position: number;
  duration: number;
  buffered: number;

  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isFetchingSuggestions: boolean;

  // --- Actions ---
  setCurrentTrack: (track: SongDetail, contextQueue?: SongDetail[]) => void;

  setQueue: (tracks: SongDetail[], startIndex?: number) => void;
  fetchAndAppendSuggestions: (trackId: string) => Promise<void>;
  expandFullPlayer: () => void;
  setSelectedSongOption: (track: SongDetail | null) => void;
  minimizeFullPlayer: () => void;
  expandMoreOption: () => void;
  minizeMoreOption: () => void;
  expandQueue: () => void;
  minimizeQueue: () => void;
  setDrawerOpen: (isOpen: boolean) => void;

  // --- Playback Controls ---
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;

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
  queue: [],
  currentIndex: -1,
  activePlaylistId: null,
  isPlaying: false,
  isLoading: false,
  isFullPlayerOpen: false,
  position: 0,
  duration: 0,
  buffered: 0,
  isMoreOptionOpen: false,
  isQueueOpen: false,
  isDrawerOpen: false,
  selectedSongOption: "",
  isDragging: false,
  isFetchingSuggestions: false,

  setIsDragging: (isDragging) => set({ isDragging }),
  // set individual track info
  setSelectedSongOption: (track) => set({ selectedSongOption: track }),
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  // Set individual track and start playing
  setCurrentTrack: async (track, contextQueue) => {
    try {
      // 1. If we have a context queue (like an album/playlist), use it instead of suggestions
      if (contextQueue && contextQueue.length > 0) {
        const index = contextQueue.findIndex((t) => t.id === track.id);
        if (index !== -1) {
          console.log(
            `Context-aware play: Found ${track.name} in current collection. Using provided queue.`,
          );
          get().setQueue(contextQueue, index);
          return;
        }
      }

      console.log(`Single-Track Play: ${track.name}. Playback starting...`);

      // 2. Update store metadata IMMEDIATELY with just the selected track
      set({
        currentTrack: track,
        queue: [track],
        currentIndex: 0,
        position: 0,
        duration: track.duration || 0,
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true,
      });

      const trackItems = [track].map(mapToTrackItem);

      // 3. Create and load playlist in native player
      const playlistId = await PlayerQueue.createPlaylist(
        `Quick Play: ${track.name}`,
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
      console.log(
        `Setting Queue: ${tracks.length} tracks, starting at index ${startIndex}`,
      );

      // 1. Update store metadata IMMEDIATELY
      set({
        queue: tracks,
        currentIndex: startIndex,
        currentTrack: selectedTrack,
        position: 0,
        duration: selectedTrack.duration || 0,
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true,
      });

      const trackItems = tracks.map(mapToTrackItem);

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

      console.log("🔄 Fetching more suggestions for autoplay...");
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
      const trackItems = newSongs.map(mapToTrackItem);
      await PlayerQueue.addTracksToPlaylist(activePlaylistId, trackItems);
      console.log(`✅ Appended ${newSongs.length} new songs to queue`);
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

  // Updates from audio engine
  updateProgress: (position, duration) => {
    set({ position, duration });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
  setLoading: (isLoading) => set({ isLoading }),
}));
