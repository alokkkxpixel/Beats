import { useQuery } from "@tanstack/react-query";
import { jioSaavnService, SaavnService } from "../services/jioSaavnService";

export const useHomeData = (languages: string[] = ["english", "hindi"]) => {
  return useQuery({
    // THE FIX: Adding languages to the key
    queryKey: ["home-data", languages.join(",")],
    queryFn: () => SaavnService.getHomePreviews(languages),

    // For debugging, keep these low or commented out
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const usePlaylist = (
  playlistId: string | null,
  playlistUrl: string | null = null,
) => {
  return useQuery({
    queryKey: ["playlist", playlistId || playlistUrl],
    queryFn: () =>
      playlistUrl && (!playlistId || playlistId === "null")
        ? SaavnService.getPlaylistDetails(playlistId, playlistUrl) 
        : jioSaavnService.getPlaylistById(playlistId!),

    enabled: !!playlistId || !!playlistUrl,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
 
export const useAlbum = (
  albumId: string | null,
  albumUrl: string | null = null,
) => {
  return useQuery({
    queryKey: ["album", albumId || albumUrl],
    queryFn: () =>
      albumUrl && (!albumId || albumId === "null")
        ? SaavnService.getAlbumDetails(albumUrl) // URL-based fetch via Vercel
        : jioSaavnService.getAlbumById(albumId!),
    enabled: !!albumId || !!albumUrl,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: () => jioSaavnService.getGlobalSearch(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchSongs = (query: string, page = 0, limit = 10) => {
  return useQuery({
    queryKey: ["search-songs", query, page, limit],
    queryFn: () => jioSaavnService.searchSongs(query, page, limit),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
