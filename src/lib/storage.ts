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
