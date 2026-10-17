import CryptoJS from "crypto-js";
import {
  AlbumDetail,
  GlobalSearchData,
  ImageQuality,
  PlaylistDetail,
  SearchAlbum,
  SearchArtist,
  SearchPlaylist,
  SearchSong,
  SongArtistsMap,
  SongDetail,
} from "../../types/jiosaavn";
import { decodeHtmlEntities } from "./transform";

const DES_KEY_STRING = "38346591";
const DES_KEY = CryptoJS.enc.Utf8.parse(DES_KEY_STRING);

/**
 * Decrypts JioSaavn's DES-ECB encrypted media URL into direct AAC/MP4 stream link.
 */
export function decryptMediaUrl(encryptedBase64?: string | null): string | null {
  if (!encryptedBase64 || typeof encryptedBase64 !== "string") return null;

  try {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64.trim()),
    });

    const decrypted = CryptoJS.DES.decrypt(cipherParams, DES_KEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8).trim();
    return decryptedText.startsWith("http") ? decryptedText : null;
  } catch (err) {
    console.warn("Failed to decrypt JioSaavn media URL:", err);
    return null;
  }
}

/**
 * Builds 5 quality bitrate options (12kbps, 48kbps, 96kbps, 160kbps, 320kbps).
 */
export function buildDownloadUrls(baseMediaUrl?: string | null): ImageQuality[] {
  if (!baseMediaUrl) return [];

  // Remove existing bitrate suffix like _96.mp4 or _320.mp4
  const clean = baseMediaUrl.replace(/_(12|48|96|160|320)\.mp4$/i, "");

  return [
    { quality: "12kbps", url: `${clean}_12.mp4` },
    { quality: "48kbps", url: `${clean}_48.mp4` },
    { quality: "96kbps", url: `${clean}_96.mp4` },
    { quality: "160kbps", url: `${clean}_160.mp4` },
    { quality: "320kbps", url: `${clean}_320.mp4` },
  ];
}

/**
 * Builds standard 50x50, 150x150, 500x500 image variants.
 */
export function buildImageQualities(imageUrl?: string | null): ImageQuality[] {
  if (!imageUrl) return [];

  let url = imageUrl.replace(/^http:\/\//i, "https://").split("?")[0];
  const resMatch = url.match(
    /(?:-|_)((?:50|150|500)x(?:50|150|500))(?:\.(jpg|jpeg|png|webp))?$/i,
  );

  if (!resMatch) {
    return [
      { quality: "50x50", url },
      { quality: "150x150", url },
      { quality: "500x500", url },
    ];
  }

  const ext = resMatch[2] ? `.${resMatch[2]}` : ".jpg";
  const base = url.slice(0, resMatch.index);

  return [
    { quality: "50x50", url: `${base}-50x50${ext}` },
    { quality: "150x150", url: `${base}-150x150${ext}` },
    { quality: "500x500", url: `${base}-500x500${ext}` },
  ];
}

/**
 * Maps raw artist map to SongArtistsMap.
 */
function mapArtists(artistMap: any): SongArtistsMap {
  const mapList = (list: any[]) =>
    Array.isArray(list)
      ? list.map((a: any) => ({
          id: String(a.id || ""),
          name: decodeHtmlEntities(a.name || a.title || ""),
          role: a.role || "artist",
          type: a.type || "artist",
          image: buildImageQualities(a.image),
          url: a.perma_url || a.url || "",
        }))
      : [];

  return {
    primary: mapList(artistMap?.primary_artists),
    featured: mapList(artistMap?.featured_artists),
    all: mapList(artistMap?.artists || artistMap?.primary_artists),
  };
}

/**
 * Maps a raw JioSaavn song object into standard SongDetail.
 */
export function mapRawSongToSongDetail(raw: any): SongDetail {
  if (!raw) return {} as any;

  const more = raw.more_info || {};
  const encryptedUrl =
    more.encrypted_media_url || raw.encrypted_media_url || null;
  const decryptedUrl = decryptMediaUrl(encryptedUrl);
  const downloadUrl = buildDownloadUrls(decryptedUrl);
  const images = buildImageQualities(raw.image);

  const durationStr = more.duration || raw.duration;
  const duration = durationStr ? parseInt(String(durationStr), 10) : 0;

  const playCountStr = raw.play_count || more.play_count;
  const playCount = playCountStr ? parseInt(String(playCountStr), 10) : 0;

  const primaryArtistsStr =
    more.artistMap?.primary_artists
      ?.map((a: any) => a.name)
      .filter(Boolean)
      .join(", ") ||
    raw.primary_artists ||
    more.music ||
    "";

  return {
    id: String(raw.id || raw.song_id || ""),
    name: decodeHtmlEntities(raw.title || raw.song || raw.name || ""),
    type: "song",
    year: raw.year ? String(raw.year) : null,
    releaseDate: more.release_date || null,
    duration: Number.isFinite(duration) ? duration : 0,
    label: more.label ? decodeHtmlEntities(more.label) : null,
    explicitContent:
      raw.explicit_content === "1" || more.explicit_content === "1",
    playCount: Number.isFinite(playCount) ? playCount : null,
    language: raw.language || more.language || "",
    hasLyrics:
      more.has_lyrics === "true" ||
      more.has_lyrics === true ||
      raw.has_lyrics === "true",
    lyricsId: more.lyrics_id || null,
    primaryArtists: decodeHtmlEntities(primaryArtistsStr),
    singers: decodeHtmlEntities(more.singers || more.music || ""),
    description: decodeHtmlEntities(raw.description || raw.header_desc || ""),
    subtitle: decodeHtmlEntities(raw.subtitle || more.album || ""),
    url: raw.perma_url || raw.url || "",
    copyright: more.copyright_text
      ? decodeHtmlEntities(more.copyright_text)
      : null,
    album: {
      id: more.album_id ? String(more.album_id) : null,
      name: more.album ? decodeHtmlEntities(more.album) : null,
      url: more.album_url || null,
    },
    artists: mapArtists(more.artistMap || raw.artistMap || {}),
    image: images,
    downloadUrl: downloadUrl,
  };
}

/**
 * Maps raw JioSaavn album object to AlbumDetail.
 */
export function mapRawAlbumToAlbumDetail(raw: any): AlbumDetail {
  const more = raw.more_info || {};
  const songsList = Array.isArray(raw.list)
    ? raw.list
    : Array.isArray(raw.songs)
    ? raw.songs
    : [];

  const songs: SongDetail[] = songsList.map(mapRawSongToSongDetail);
  const images = buildImageQualities(raw.image);

  const songCount =
    songs.length ||
    (raw.list_count ? parseInt(String(raw.list_count), 10) : 0);

  const playCount = raw.play_count ? parseInt(String(raw.play_count), 10) : 0;

  return {
    id: String(raw.id || raw.album_id || ""),
    name: decodeHtmlEntities(raw.title || raw.name || ""),
    description: decodeHtmlEntities(raw.header_desc || more.description || ""),
    year: raw.year || more.release_date?.slice(0, 4) || null,
    type: "album",
    playCount: Number.isFinite(playCount) ? playCount : null,
    language: raw.language || "",
    explicitContent: raw.explicit_content === "1",
    artists: mapArtists(more.artistMap || raw.artistMap || {}),
    songCount: Number.isFinite(songCount) ? songCount : 0,
    url: raw.perma_url || raw.url || "",
    image: images,
    songs: songs,
  };
}

/**
 * Maps raw JioSaavn playlist object to PlaylistDetail.
 */
export function mapRawPlaylistToPlaylistDetail(raw: any): PlaylistDetail {
  const songsList = Array.isArray(raw.list)
    ? raw.list
    : Array.isArray(raw.songs)
    ? raw.songs
    : [];

  const songs: SongDetail[] = songsList.map(mapRawSongToSongDetail);
  const images = buildImageQualities(raw.image);

  const songCount =
    songs.length ||
    (raw.list_count ? parseInt(String(raw.list_count), 10) : 0);

  const playCount = raw.play_count ? parseInt(String(raw.play_count), 10) : 0;

  return {
    id: String(raw.id || raw.listid || ""),
    name: decodeHtmlEntities(raw.title || raw.listname || raw.name || ""),
    description: decodeHtmlEntities(raw.header_desc || raw.description || null),
    year: raw.year || null,
    type: "playlist",
    playCount: Number.isFinite(playCount) ? playCount : null,
    language: raw.language || "",
    explicitContent: raw.explicit_content === "1",
    songCount: Number.isFinite(songCount) ? songCount : 0,
    url: raw.perma_url || raw.url || "",
    image: images,
    songs: songs,
    artists: [],
  };
}

/**
 * Maps JioSaavn autocomplete response to GlobalSearchData.
 */
export function mapAutocompleteToGlobalSearch(raw: any): GlobalSearchData {
  const mapSongs = (list: any[]): SearchSong[] =>
    (list || []).map((s: any) => ({
      id: String(s.id || ""),
      title: decodeHtmlEntities(s.title || s.name || ""),
      image: buildImageQualities(s.image),
      album: decodeHtmlEntities(s.more_info?.album || s.subtitle || ""),
      url: s.perma_url || s.url || "",
      type: "song",
      description: decodeHtmlEntities(s.description || s.subtitle || ""),
      primaryArtists: decodeHtmlEntities(
        s.more_info?.primary_artists || s.more_info?.singers || "",
      ),
      singers: decodeHtmlEntities(s.more_info?.singers || ""),
      language: s.more_info?.language || "",
    }));

  const mapAlbums = (list: any[]): SearchAlbum[] =>
    (list || []).map((a: any) => ({
      id: String(a.id || ""),
      title: decodeHtmlEntities(a.title || a.name || ""),
      image: buildImageQualities(a.image),
      artist: decodeHtmlEntities(a.more_info?.artist || a.subtitle || ""),
      url: a.perma_url || a.url || "",
      type: "album",
      description: decodeHtmlEntities(a.description || a.subtitle || ""),
      year: String(a.more_info?.year || a.year || ""),
      language: a.more_info?.language || "",
      songIds: a.more_info?.song_pids || "",
    }));

  const mapArtistsList = (list: any[]): SearchArtist[] =>
    (list || []).map((a: any, idx: number) => ({
      id: String(a.id || ""),
      title: decodeHtmlEntities(a.name || a.title || ""),
      image: buildImageQualities(a.image),
      type: "artist",
      description: decodeHtmlEntities(a.description || a.subtitle || ""),
      position: idx,
    }));

  const mapPlaylists = (list: any[]): SearchPlaylist[] =>
    (list || []).map((p: any) => ({
      id: String(p.id || ""),
      title: decodeHtmlEntities(p.title || p.name || ""),
      image: buildImageQualities(p.image),
      url: p.perma_url || p.url || "",
      language: p.more_info?.language || "",
      type: "playlist",
      description: decodeHtmlEntities(p.description || p.subtitle || ""),
    }));

  return {
    albums: {
      results: mapAlbums(raw?.albums?.data || []),
      position: raw?.albums?.position ?? 0,
    },
    songs: {
      results: mapSongs(raw?.songs?.data || []),
      position: raw?.songs?.position ?? 0,
    },
    artists: {
      results: mapArtistsList(raw?.artists?.data || []),
      position: raw?.artists?.position ?? 0,
    },
    playlists: {
      results: mapPlaylists(raw?.playlists?.data || []),
      position: raw?.playlists?.position ?? 0,
    },
    topQuery: {
      results: mapSongs(raw?.topquery?.data || []),
      position: raw?.topquery?.position ?? 0,
    },
  };
}
