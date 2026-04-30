import { SongDetail } from "@/types/jiosaavn";
import { create } from "zustand";

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
  // --- Progress / Seekbar ---
  position: number; // Current playback time in seconds
  duration: number; // Total duration in seconds
  buffered: number; // Buffered amount (optional)

  // --- Actions ---
  setCurrentTrack: (track: SongDetail) => void;

  setQueue: (tracks: SongDetail[], startIndex?: number) => void;
  expandFullPlayer: () => void;
  setSelectedSongOption: (track: SongDetail | null) => void;
  minimizeFullPlayer: () => void;
  expandMoreOption: () => void | null;
  minizeMoreOption: () => void;

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
  selectedSongOption: "",

  // set individual track info
  setSelectedSongOption: (track) => set({ selectedSongOption: track }),
  // Set individual track and start playing
  setCurrentTrack: (track) => {
    set({
      currentTrack: track,
      duration: track.duration || 0,
      position: 0,
      isPlaying: true,
      isFullPlayerOpen: true, // Auto open when track selected
    });
  },

  // Set a whole queue (e.g. from an album or playlist)
  setQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex],
      duration: tracks[startIndex].duration || 0,
      position: 0,
      isPlaying: true,
      isFullPlayerOpen: true,
    });
  },

  expandFullPlayer: () => set({ isFullPlayerOpen: true }),
  minimizeFullPlayer: () => set({ isFullPlayerOpen: false }),

  expandMoreOption: () => set({ isMoreOptionOpen: true }),
  minizeMoreOption: () => set({ isMoreOptionOpen: false }),

  // Playback Controls (Placeholders - will be connected to audio engine)
  play: async () => {
    set({ isPlaying: true });
  },

  pause: async () => {
    set({ isPlaying: false });
  },

  togglePlay: async () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  next: async () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextTrack = queue[nextIndex];
      set({
        currentIndex: nextIndex,
        currentTrack: nextTrack,
        duration: nextTrack.duration || 0,
        position: 0,
        isPlaying: true,
      });
    }
  },

  previous: async () => {
    const { queue, currentIndex, position } = get();

    // If we've played more than 3 seconds, restart the current track
    if (position > 3) {
      set({ position: 0 });
      return;
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevTrack = queue[prevIndex];
      set({
        currentIndex: prevIndex,
        currentTrack: prevTrack,
        duration: prevTrack.duration || 0,
        position: 0,
        isPlaying: true,
      });
    }
  },

  seek: async (position) => {
    set({ position });
  },

  // Updates from audio engine
  updateProgress: (position, duration) => {
    set({ position, duration });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
  setLoading: (isLoading) => set({ isLoading }),
}));
