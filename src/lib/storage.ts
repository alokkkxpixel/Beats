import type { SongDetail } from "@/types/jiosaavn";
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
  id: "beats-app-storage",
  encryptionKey: "beats-secure-key", // In a real app, use a more secure way to store this
});

/**
 * Persister for TanStack Query using MMKV
 */
export const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

const MUSIC_LANG_KEY = "music-languages";
const DEFAULT_LANGS = ["english", "hindi"];
export type AudioQualityPreference =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "very_high";
const AUDIO_QUALITY_KEY = "audio-quality";
const DEFAULT_AUDIO_QUALITY: AudioQualityPreference = "high";

export const getMusicLanguages = (): string[] => {
  const langs = storage.getString(MUSIC_LANG_KEY);
  if (!langs) return DEFAULT_LANGS;
  try {
    return JSON.parse(langs);
  } catch (e) {
    return DEFAULT_LANGS;
  }
};

export const setMusicLanguages = (langs: string[]) => {
  storage.set(MUSIC_LANG_KEY, JSON.stringify(langs));
};

export const getAudioQualityPreference = (): AudioQualityPreference => {
  const quality = storage.getString(AUDIO_QUALITY_KEY);
  switch (quality) {
    case "very_low":
    case "low":
    case "medium":
    case "high":
    case "very_high":
      return quality;
    default:
      return DEFAULT_AUDIO_QUALITY;
  }
};

export const setAudioQualityPreference = (
  quality: AudioQualityPreference,
) => {
  storage.set(AUDIO_QUALITY_KEY, quality);
};

const SEARCH_HISTORY_KEY = "search-history";

export const getSearchHistory = (): any[] => {
  const history = storage.getString(SEARCH_HISTORY_KEY);
  if (!history) return [];
  try {
    return JSON.parse(history);
  } catch (e) {
    return [];
  }
};

export const setSearchHistory = (history: any[]) => {
  storage.set(SEARCH_HISTORY_KEY, JSON.stringify(history));
};

const RECENT_ACTIVITY_KEY = "recent-activity";

export const getRecentActivity = (): any[] => {
  const activity = storage.getString(RECENT_ACTIVITY_KEY);
  if (!activity) return [];
  try {
    return JSON.parse(activity);
  } catch (e) {
    return [];
  }
};

export const addToRecentActivity = (item: any) => {
  const current = getRecentActivity();
  // Filter out duplicates based on id and type
  const filtered = current.filter(
    (i) => !(i.id === item.id && i.type === item.type),
  );
  const updated = [item, ...filtered].slice(0, 50); // Keep last 50
  storage.set(RECENT_ACTIVITY_KEY, JSON.stringify(updated));
};

export const clearRecentActivity = () => {
  storage.remove(RECENT_ACTIVITY_KEY);
};

const LIKED_SONGS_KEY = "liked-songs";

export const getLikedSongs = (): any[] => {
  const songs = storage.getString(LIKED_SONGS_KEY);
  if (!songs) return [];
  try {
    return JSON.parse(songs);
  } catch {
    return [];
  }
};

export const saveLikedSongs = (songs: any[]) => {
  storage.set(LIKED_SONGS_KEY, JSON.stringify(songs));
};

const PLAYLISTS_KEY = "user-playlists";

export const getPlaylists = (): any[] => {
  const playlists = storage.getString(PLAYLISTS_KEY);
  if (!playlists) return [];
  try {
    return JSON.parse(playlists);
  } catch {
    return [];
  }
};

export const savePlaylists = (playlists: any[]) => {
  storage.set(PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const createPlaylist = (name: string, description?: string) => {
  const playlists = getPlaylists();
  const newPlaylist = {
    id: `playlist-${Date.now()}`,
    name,
    description,
    songs: [],
    image: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const updated = [newPlaylist, ...playlists];
  savePlaylists(updated);
  return newPlaylist;
};

export const addSongToPlaylist = (playlistId: string, song: any) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);
  if (playlistIndex === -1) return null;

  const playlist = playlists[playlistIndex];
  const songExists = playlist.songs.some((s: any) => s.id === song.id);
  if (songExists) return playlist;

  playlist.songs.push(song);
  playlist.updatedAt = Date.now();
  playlists[playlistIndex] = playlist;
  savePlaylists(playlists);
  return playlist;
};

export const removeSongFromPlaylist = (playlistId: string, songId: string) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);
  if (playlistIndex === -1) return null;

  const playlist = playlists[playlistIndex];
  playlist.songs = playlist.songs.filter((s: any) => s.id !== songId);
  playlist.updatedAt = Date.now();
  playlists[playlistIndex] = playlist;
  savePlaylists(playlists);
  return playlist;
};

export const deletePlaylist = (playlistId: string) => {
  const playlists = getPlaylists();
  const updated = playlists.filter((p) => p.id !== playlistId);
  savePlaylists(updated);
};

export const updatePlaylist = (playlistId: string, updates: Partial<any>) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);
  if (playlistIndex === -1) return null;

  playlists[playlistIndex] = {
    ...playlists[playlistIndex],
    ...updates,
    updatedAt: Date.now(),
  };
  savePlaylists(playlists);
  return playlists[playlistIndex];
};

const SAVED_ALBUMS_KEY = "saved-albums";

export const getSavedAlbums = (): any[] => {
  const albums = storage.getString(SAVED_ALBUMS_KEY);
  if (!albums) return [];
  try {
    return JSON.parse(albums);
  } catch {
    return [];
  }
};

export const saveSavedAlbums = (albums: any[]) => {
  storage.set(SAVED_ALBUMS_KEY, JSON.stringify(albums));
};

const PLAYER_STATE_KEY = "player-state";

const DOWNLOAD_TRACK_METADATA_PREFIX = "download-track-metadata:";

export interface PersistedPlayerState {
  currentTrack: any | null;
  queue: any[];
  currentIndex: number;
  position: number;
  duration: number;
  isPlaying: boolean;
  isShuffleEnabled: boolean;
  timestamp: number;
}

export const getPlayerState = (): PersistedPlayerState | null => {
  const state = storage.getString(PLAYER_STATE_KEY);
  if (!state) return null;
  try {
    return JSON.parse(state);
  } catch {
    return null;
  }
};

export const savePlayerState = (state: PersistedPlayerState) => {
  storage.set(PLAYER_STATE_KEY, JSON.stringify(state));
};

export const clearPlayerState = () => {
  storage.remove(PLAYER_STATE_KEY);
};

export const saveDownloadedTrackMetadata = (
  trackId: string,
  song: SongDetail,
) => {
  storage.set(
    `${DOWNLOAD_TRACK_METADATA_PREFIX}${trackId}`,
    JSON.stringify(song),
  );
};

export const getDownloadedTrackMetadata = (
  trackId: string,
): SongDetail | null => {
  const raw = storage.getString(`${DOWNLOAD_TRACK_METADATA_PREFIX}${trackId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SongDetail;
  } catch {
    return null;
  }
};

export const deleteDownloadedTrackMetadata = (trackId: string) => {
  storage.remove(`${DOWNLOAD_TRACK_METADATA_PREFIX}${trackId}`);
};

export const clearDownloadedTrackMetadata = () => {
  const keys = storage.getAllKeys();
  keys.forEach((key) => {
    if (key.startsWith(DOWNLOAD_TRACK_METADATA_PREFIX)) {
      storage.remove(key);
    }
  });
};

/**
 * Clear search history cache
 */
export const clearSearchHistory = () => {
  storage.remove(SEARCH_HISTORY_KEY);
};

/**
 * Clear all cache (search history + recent activity)
 */
export const clearAllCache = () => {
  clearSearchHistory();
  clearRecentActivity();
};

/**
 * Calculate storage usage in bytes
 */
export const calculateStorageUsage = async (): Promise<{
  downloads: number;
  cache: number;
  other: number;
  total: number;
}> => {
  try {
    const { DownloadManager } = await import("react-native-nitro-player");

    // Get downloaded tracks storage (estimated based on count)
    const downloadedTracks = await DownloadManager.getAllDownloadedTracks();
    // Estimate average song size as 3MB (320kbps quality)
    const downloadsSize = downloadedTracks.length * 3 * 1024 * 1024;

    // Calculate cache size (search history + recent activity + other MMKV data)
    const searchHistory = getSearchHistory();
    const recentActivity = getRecentActivity();
    const likedSongs = getLikedSongs();
    const playlists = getPlaylists();
    const savedAlbums = getSavedAlbums();

    const cacheSize =
      JSON.stringify(searchHistory).length * 2 + // UTF-16 encoding
      JSON.stringify(recentActivity).length * 2 +
      JSON.stringify(likedSongs).length * 2 +
      JSON.stringify(playlists).length * 2 +
      JSON.stringify(savedAlbums).length * 2;

    // Calculate other storage (track metadata)
    const keys = storage.getAllKeys();
    let metadataSize = 0;
    for (const key of keys) {
      if (key.startsWith(DOWNLOAD_TRACK_METADATA_PREFIX)) {
        const value = storage.getString(key);
        if (value) {
          metadataSize += value.length * 2;
        }
      }
    }

    const total = downloadsSize + cacheSize + metadataSize;

    return {
      downloads: downloadsSize,
      cache: cacheSize,
      other: metadataSize,
      total,
    };
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    return {
      downloads: 0,
      cache: 0,
      other: 0,
      total: 0,
    };
  }
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
