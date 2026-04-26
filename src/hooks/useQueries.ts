import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { jioSaavnService, SaavnService } from "../services/jioSaavnService";

export const useHomePreviews = (languages: string[] = ["english", "hindi"]) => {
  return useQuery({
    // THE FIX: Adding languages to the key
    queryKey: ["home-previews", languages.join(",")],
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

export const usePlaylistInfinite = (
  playlistId: string | null,
  playlistUrl: string | null,
) => {
  return useInfiniteQuery({
    queryKey: ["playlist-infinite", playlistId || playlistUrl],

    queryFn: ({ pageParam = 0 }) =>
      SaavnService.getPlaylistDetails(playlistId, playlistUrl!, pageParam, 10),

    initialPageParam: 0,

    getNextPageParam: (lastPage: any, allPages) => {
      const songs = lastPage?.songs ?? lastPage?.list ?? [];
      // If the API returned fewer songs than the limit, we've reached the end
      if (!songs || songs.length < 10) return undefined;
      // Next page index = number of pages fetched so far
      return allPages.length;
    },

    enabled: !!playlistId || !!playlistUrl,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
  });
};

export const useAlbumInfinite = (
  albumId: string | null,
  albumUrl: string | null,
) => {
  return useInfiniteQuery({
    queryKey: ["album-infinite", albumId || albumUrl],

    queryFn: ({ pageParam = 0 }) =>
      // SaavnService.getAlbumDetails(albumId, albumUrl!, pageParam, 10),
      SaavnService.getAlbumDetails(albumId, albumUrl!),

    initialPageParam: 0,

    getNextPageParam: (lastPage: any, allPages) => {
      const songs = lastPage?.songs ?? [];

      if (!songs.length) return undefined;

      // 🔥 stop if same as previous page
      if (allPages.length > 1) {
        const prev = allPages[allPages.length - 2];

        const prevIds = prev?.songs?.map((s: any) => s.id).join(",");
        const currIds = songs.map((s: any) => s.id).join(",");

        if (prevIds === currIds) {
          return undefined; // 🚫 STOP pagination
        }
      }

      return allPages.length;
    },

    enabled: !!albumId || !!albumUrl,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
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
        ? SaavnService.getAlbumDetails(albumId, albumUrl!)
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
