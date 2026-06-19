import { Playlist } from "@/types/jiosaavn";
import {
  addSongToPlaylist,
  createPlaylist as createPlaylistStorage,
  deletePlaylist as deletePlaylistStorage,
  getPlaylists,
  removeSongFromPlaylist,
  savePlaylists,
  updatePlaylist as updatePlaylistStorage,
  getSavedAlbums,
  saveSavedAlbums,
} from "@/src/lib/storage";
import { SongDetail } from "@/types/jiosaavn";
import { create } from "zustand";

interface PlaylistState {
  playlists: Playlist[];
  savedAlbums: any[];
  isPlaylistModalOpen: boolean;
  selectedSongForPlaylist: SongDetail | null;
  
  // Actions
  loadPlaylists: () => void;
  loadSavedAlbums: () => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  addSongToPlaylist: (playlistId: string, song: SongDetail) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  
  openPlaylistModal: (song: SongDetail) => void;
  closePlaylistModal: () => void;
  addAlbumToLibrary: (album: any) => void;
  removeAlbumFromLibrary: (albumId: string) => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  savedAlbums: [],
  isPlaylistModalOpen: false,
  selectedSongForPlaylist: null,

  loadPlaylists: () => {
    const playlists = getPlaylists();
    set({ playlists });
  },

  loadSavedAlbums: () => {
    const savedAlbums = getSavedAlbums();
    set({ savedAlbums });
  },

  createPlaylist: (name, description) => {
    const newPlaylist = createPlaylistStorage(name, description);
    get().loadPlaylists();
    return newPlaylist;
  },

  addSongToPlaylist: (playlistId, song) => {
    addSongToPlaylist(playlistId, song);
    get().loadPlaylists();
  },

  removeSongFromPlaylist: (playlistId, songId) => {
    removeSongFromPlaylist(playlistId, songId);
    get().loadPlaylists();
  },

  deletePlaylist: (playlistId) => {
    deletePlaylistStorage(playlistId);
    get().loadPlaylists();
  },

  updatePlaylist: (playlistId, updates) => {
    updatePlaylistStorage(playlistId, updates);
    get().loadPlaylists();
  },

  openPlaylistModal: (song) => {
    get().loadPlaylists();
    set({ 
      isPlaylistModalOpen: true, 
      selectedSongForPlaylist: song 
    });
  },

  closePlaylistModal: () => {
    set({ 
      isPlaylistModalOpen: false, 
      selectedSongForPlaylist: null 
    });
  },

  addAlbumToLibrary: (album) => {
    const albums = getSavedAlbums();
    if (albums.some((a) => a.id === album.id)) return;

    const artistName = album.artists?.primary?.[0]?.name || album.artist || "Various Artists";
    const yearText = album.year ? ` • ${album.year}` : "";

    const newAlbum = {
      id: album.id,
      title: album.name || album.title,
      subtitle: `${artistName}${yearText}`,
      type: "album",
      image: album.image,
      createdAt: Date.now(),
    };

    const updated = [newAlbum, ...albums];
    saveSavedAlbums(updated);
    get().loadSavedAlbums();
  },

  removeAlbumFromLibrary: (albumId) => {
    const albums = getSavedAlbums();
    const updated = albums.filter((a) => a.id !== albumId);
    saveSavedAlbums(updated);
    get().loadSavedAlbums();
  },
}));
