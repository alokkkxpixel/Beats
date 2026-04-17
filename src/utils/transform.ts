import { AlbumResponse, Song } from "@/types/jiosaavn";

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  // JioSaavn often returns centiseconds or milliseconds. Converting to seconds.
  const totalSeconds = seconds > 1000 ? Math.floor(seconds / 1000) : seconds;
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
};

const transformSongToTrack = (song: any): Song => {
  if (!song) return {} as Song;
  const artistName =
    song.artists?.primary?.[0]?.name ||
    song.artists?.[0]?.name ||
    "Unknown Artist";

  return {
    ...song,
    id: song.id,
    name: song.name || song.title || "Untitled",
    title: song.title || song.name || "Untitled",
    artist: artistName,
    duration: song.duration, // Keep raw duration for detail screen to format
    playCount: song.playCount || 0,
    explicitContent: !!song.explicitContent,
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

  const processedSongs = Array.isArray(album.songs)
    ? album.songs.map(transformSongToTrack)
    : [];

  return {
    ...album,
    id: album.id || "",
    name: album.name || album.title || "Untitled",
    title: album.title || album.name || "Untitled",
    description: album.description || "",
    type: album.type || "album",
    year: album.year?.toString() || "Unknown",
    playCount: album.playCount || 0,
    language: album.language || "",
    explicitContent: !!album.explicitContent,
    url: album.url || "",
    songCount: album.songCount || album.song_count || processedSongs.length,
    artists: album.artists || { primary: [], featured: [], all: [] },
    image: Array.isArray(album.image) ? album.image : [],
    songs: processedSongs,
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

  const processedSongs = Array.isArray(playlist.songs)
    ? playlist.songs.map(transformSongToTrack)
    : [];

  return {
    ...playlist,
    id: playlist.id || "",
    name: playlist.name || playlist.title || "Untitled",
    title: playlist.title || playlist.name || "Untitled",
    description: playlist.description || "",
    type: "playlist",
    year: playlist.year?.toString() || "Mixed",
    playCount: playlist.playCount || 0,
    language: playlist.language || "",
    explicitContent: !!playlist.explicitContent,
    url: playlist.url || "",
    songCount: playlist.songCount || playlist.song_count || processedSongs.length,
    artists: playlist.artists ? 
      (Array.isArray(playlist.artists) ? { primary: playlist.artists, featured: [], all: playlist.artists } : playlist.artists) 
      : { primary: [], featured: [], all: [] },
    image: Array.isArray(playlist.image) ? playlist.image : [],
    songs: processedSongs,
  };
};
