import { useQuery } from "@tanstack/react-query";
import { jioSaavnService, SaavnService } from "../services/jioSaavnService";

export const useHomeData = (languages: string[] = ["english","hindi"]) => {
  return useQuery({
    // THE FIX: Adding languages to the key
    queryKey: ["home-data", languages.join(",")],
    queryFn: () => SaavnService.getHomePreviews(languages),
    
    // For debugging, keep these low or commented out
    staleTime: 0, 
    gcTime: 0,
  });
};

export const usePlaylist = (playlistId: string | null) => {
  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => jioSaavnService.getPlaylistById(playlistId!),
    enabled: !!playlistId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useAlbum = (albumId: string | null) => {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => jioSaavnService.getAlbumById(albumId!),
    enabled: !!albumId,
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
