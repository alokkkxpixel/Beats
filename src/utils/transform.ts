import { Album, Track } from "../../constants/album-data";
import { AlbumDetail, PlaylistDetail, SongDetail } from "../../types/jiosaavn";

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const transformSongToTrack = (song: SongDetail): Track => ({
  id: song.id,
  title: song.name,
  artist: song.artists.primary[0]?.name || "Unknown Artist",
  duration: formatDuration(song.duration),
  plays: song.playCount ? `${(song.playCount / 1000000).toFixed(1)}M` : "0",
});

export const transformAlbumToUI = (album: AlbumDetail): Album => ({
  id: album.id,
  title: album.name,
  artist: album.artists.primary[0]?.name || "Unknown Artist",
  year: album.year?.toString() || "Unknown",
  cover: album.image[album.image.length - 1]?.url || "",
  description: album.description || "",
  tracks: album.songs.map(transformSongToTrack),
});

export const transformPlaylistToUI = (playlist: PlaylistDetail): Album => ({
  id: playlist.id,
  title: playlist.name,
  artist: playlist.artists[0]?.name || "Various Artists",
  year: playlist.year?.toString() || "Mixed",
  cover: playlist.image[playlist.image.length - 1]?.url || "",
  description: playlist.description || "",
  tracks: playlist.songs.map(transformSongToTrack),
});
