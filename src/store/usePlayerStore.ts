import { SongDetail } from "@/types/jiosaavn";
// ===== COMMENTED OUT: RNTP imports =====
// import TrackPlayer, { State } from "react-native-track-player";

// ===== NEW: Nitro Player imports =====
import { TrackPlayer, PlayerQueue, TrackItem } from "react-native-nitro-player";
import { create } from "zustand";

const mapToTrackItem = (song: SongDetail): TrackItem => ({
  id: song.id,
  title: song.name,
  artist: song.primaryArtists || song.artists?.primary?.[0]?.name || 'Unknown Artist',
  album: typeof song.album === "string" ? song.album : (song.album?.name || "Unknown Album"),
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
  isPlaying: boolean;
  isLoading: boolean;
  isFullPlayerOpen: boolean;
  selectedSongOption: SongDetail | null | string;
  isMoreOptionOpen: boolean;
  isDrawerOpen: boolean;
  // --- Progress / Seekbar ---
  position: number; // Current playback time in seconds
  duration: number; // Total duration in seconds
  buffered: number; // Buffered amount (optional)

  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;

  // --- Actions ---
  setCurrentTrack: (track: SongDetail) => void;

  setQueue: (tracks: SongDetail[], startIndex?: number) => void;
  expandFullPlayer: () => void;
  setSelectedSongOption: (track: SongDetail | null) => void;
  minimizeFullPlayer: () => void;
  expandMoreOption: () => void;
  minizeMoreOption: () => void;
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
  isPlaying: false,
  isLoading: false,
  isFullPlayerOpen: false,
  position: 0,
  duration: 0,
  buffered: 0,
  isMoreOptionOpen: false,
  isDrawerOpen: false,
  selectedSongOption: "",
  isDragging: false,

  setIsDragging: (isDragging) => set({ isDragging }),
  // set individual track info
  setSelectedSongOption: (track) => set({ selectedSongOption: track }),
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  
  // Set individual track and start playing
  setCurrentTrack: async (track) => {
    try {
      // 1. Update store metadata IMMEDIATELY so GlobalAudioPlayer syncs correctly
      set({ 
        currentTrack: track,
        queue: [track],
        currentIndex: 0,
        position: 0, 
        duration: track.duration || 0, 
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true
      });

      const trackItem = mapToTrackItem(track);
      
      // 2. Create and load playlist in native player
      const playlistId = await PlayerQueue.createPlaylist(
        `Playing: ${track.name}`,
        "Quick Play"
      );
      
      await PlayerQueue.addTracksToPlaylist(playlistId, [trackItem]);
      await PlayerQueue.loadPlaylist(playlistId);
      
      // 3. Ensure we start at the beginning
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
      
      // 1. Update store metadata IMMEDIATELY
      set({
        queue: tracks,
        currentIndex: startIndex,
        currentTrack: selectedTrack,
        position: 0,
        duration: selectedTrack.duration || 0,
        isLoading: true,
        isFullPlayerOpen: true,
        isPlaying: true
      });

      const trackItems = tracks.map(mapToTrackItem);
      
      // 2. Create and load playlist in native player
      const playlistId = await PlayerQueue.createPlaylist(
        "Queue",
        "Playback Queue"
      );
      
      await PlayerQueue.addTracksToPlaylist(playlistId, trackItems);
      await PlayerQueue.loadPlaylist(playlistId);
      
      // 3. Navigate to correct index and play
      if (startIndex > 0) {
        await TrackPlayer.skipToIndex(startIndex);
      }
      
      await TrackPlayer.seek(0);
      await TrackPlayer.play();

      set({ isLoading: false });
    } catch (error) {
      console.error("Error setting queue:", error);
      set({ isLoading: false });
    }
  },

  expandFullPlayer: () => set({ isFullPlayerOpen: true }),
  minimizeFullPlayer: () => set({ isFullPlayerOpen: false }),

  expandMoreOption: () => set({ isMoreOptionOpen: true }),
  minizeMoreOption: () => set({ isMoreOptionOpen: false }),

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
