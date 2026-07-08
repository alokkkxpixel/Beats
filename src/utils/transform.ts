import { AlbumResponse } from "@/types/jiosaavn";
import { Track } from "../../constants/album-data";

export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatPlayCount = (count: number | string | null): string => {
  if (!count) return "0";
  const num = typeof count === "string" ? parseInt(count.replace(/,/g, ""), 10) : count;
  if (isNaN(num)) return "0";

  if (num < 1000) return num.toString();
  if (num < 100000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  if (num < 10000000) {
    const lakhs = (num / 100000).toFixed(1).replace(/\.0$/, "");
    return `${lakhs} ${parseFloat(lakhs) === 1 ? "Lakh" : "Lakhs"}`;
  }
  const crores = (num / 10000000).toFixed(1).replace(/\.0$/, "");
  return `${crores} ${parseFloat(crores) === 1 ? "Crore" : "Crores"}`;
};

export const decodeHtmlEntities = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®");
};

export const recursiveClean = (obj: any): any => {
  if (typeof obj === "string") {
    let cleaned = decodeHtmlEntities(obj);
    if (cleaned.startsWith("http://")) {
      cleaned = cleaned.replace("http://", "https://");
    }
    return cleaned;
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveClean);
  }
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = recursiveClean(obj[key]);
    }
    return newObj;
  }
  return obj;
};

const transformSongToTrack = (song: any): Track => {
  const artistName =
    song.artists?.primary?.[0]?.name ||
    song.artists?.[0]?.name ||
    "Unknown Artist";

  return {
    id: song.id,
    title: decodeHtmlEntities(song.name || song.title),
    artist: decodeHtmlEntities(artistName),
    duration: formatDuration(song.duration),
    plays: formatPlayCount(song.playCount),
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
    name: decodeHtmlEntities(album.name || album.title || ""),
    title: decodeHtmlEntities(album.title || album.name || ""),
    description: decodeHtmlEntities(album.description || ""),
    type: album.type || "album",
    year: album.year || "Unknown",
    playCount: album.playCount || 0,
    language: album.language || "",
    explicitContent: !!album.explicitContent,
    url: album.url || "",
    songCount: album.songCount || album.song_count || 0,
    artists: album.artists,
    image: Array.isArray(album.image) ? album.image : [],
    songs: Array.isArray(album.songs) ? recursiveClean(album.songs) : [],
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
    name: decodeHtmlEntities(playlist.name || playlist.title || "Untitled"),
    title: decodeHtmlEntities(playlist.title || playlist.name || "Untitled"),
    description: decodeHtmlEntities(playlist.description || ""),
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
    songs: Array.isArray(playlist.songs) ? recursiveClean(playlist.songs) : [],
  };
};
