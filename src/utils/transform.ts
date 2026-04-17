import { AlbumResponse } from "@/types/jiosaavn";
import { Track } from "../../constants/album-data";

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const transformSongToTrack = (song: any): Track => {
  const artistName =
    song.artists?.primary?.[0]?.name ||
    song.artists?.[0]?.name ||
    "Unknown Artist";

  return {
    id: song.id,
    title: song.name,
    artist: artistName,
    duration: formatDuration(song.duration),
    plays: song.playCount ? `${(song.playCount / 1000000).toFixed(1)}M` : "0",
  };
};

export const transformAlbumToUI = (album: any): AlbumResponse => {
  if (!album)
    return {
      id: "",
      name: "",
      title: "",
      description: "",
      type: "album",
      year: "",
      playCount: 0,
      language: "",
      explicitContent: false,
      url: "",
      songCount: 0,
      image: [],
      songs: [],
    };

  return {
    id: album.id || "",
    name: album.name || album.title || "",
    title: album.title || album.name || "",
    description: album.description || "",
    type: album.type || "album",
    year: album.year || "Unknown",
    playCount: album.playCount || 0,
    language: album.language || "",
    explicitContent: !!album.explicitContent,
    url: album.url || "",
    songCount: album.songCount || album.song_count || 0,
    artists: album.artists,
    image: Array.isArray(album.image) ? album.image : [],
    songs: Array.isArray(album.songs) ? album.songs : [],
  };
};

export const transformPlaylistToUI = (playlist: any): AlbumResponse => {
  if (!playlist)
    return {
      id: "",
      name: "",
      title: "",
      description: "",
      type: "playlist",
      year: "",
      playCount: 0,
      language: "",
      explicitContent: false,
      url: "",
      songCount: 0,
      image: [],
      songs: [],
    };

  return {
    id: playlist.id || "",
    name: playlist.name || playlist.title || "Untitled",
    title: playlist.title || playlist.name || "Untitled",
    description: playlist.description || "",
    type: "playlist",
    year: playlist.year || "Mixed",
    playCount: playlist.playCount || 0,
    language: playlist.language || "",
    explicitContent: !!playlist.explicitContent,
    url: playlist.url || "",
    songCount: playlist.songCount || playlist.song_count || 0,
    artists: {
      primary: Array.isArray(playlist.artists) ? playlist.artists : [],
      featured: [],
      all: Array.isArray(playlist.artists) ? playlist.artists : [],
    },
    image: Array.isArray(playlist.image) ? playlist.image : [],
    songs: Array.isArray(playlist.songs) ? playlist.songs : [],
  };
};
