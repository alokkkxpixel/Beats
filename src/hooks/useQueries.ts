import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getMusicLanguages } from "../lib/storage";
import { jioSaavnService, SaavnService } from "../services/jioSaavnService";

export const useHomePreviews = (
  languages: string[] = getMusicLanguages(),
) => {
  return useQuery({
    // THE FIX: Adding languages to the key
    queryKey: ["home-previews", languages.join(",")],
    queryFn: () => SaavnService.getHomePreviews(languages),

    // For debugging, keep these low or commented out
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useSpecialForYou = (
  languages: string[] = getMusicLanguages(),
) => {
  return useQuery({
    // THE FIX: Adding languages to the key
    queryKey: ["special-for-you", languages.join(",")],
    queryFn: () => SaavnService.getSpecialForYou(languages),

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
    // staleTime: 1000 * 60 * 5, // 5 minutes
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

export const useDetailedSearch = (query: string, n = 20, p = 1) => {
  return useQuery({
    queryKey: ["detailed-search", query, n, p],
    queryFn: () => jioSaavnService.getDetailedSearchResults(query, n, p),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => jioSaavnService.getSearchSuggestions(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchInfinite = (
  query: string,
  type: "songs" | "albums" | "artists" | "playlists",
) => {
  return useInfiniteQuery({
    queryKey: ["search-infinite", query, type],
    queryFn: ({ pageParam = 0 }) => {
      switch (type) {
        case "songs":
          return jioSaavnService.searchSongs(query, pageParam, 20);
        case "albums":
          return jioSaavnService.searchAlbums(query, pageParam, 20);
        case "artists":
          return jioSaavnService.searchArtists(query, pageParam, 20);
        case "playlists":
          return jioSaavnService.searchPlaylists(query, pageParam, 20);
        default:
          return jioSaavnService.searchSongs(query, pageParam, 20);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const results = lastPage?.data?.results || [];
      if (results.length < 20) return undefined;
      return (lastPage?.data?.start || 0) + 20;
    },
    enabled: !!query && !!type,
    staleTime: 1000 * 60 * 5,
  });
};
export const useArtist = (
  artistId: string | null,
  artistUrl: string | null = null,
  options?: {
    page?: number;
    songCount?: number;
    albumCount?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  const artistKey = artistId || artistUrl;
  const page = options?.page ?? 0;
  const songCount = options?.songCount ?? 10;
  const albumCount = options?.albumCount ?? 10;
  const sortBy = options?.sortBy ?? "";
  const sortOrder = options?.sortOrder ?? "desc";

  return useQuery({
    queryKey: ["artist", artistKey, page, songCount, albumCount, sortBy, sortOrder],
    queryFn: () =>
      jioSaavnService.getArtistDetails(
        artistId,
        artistUrl,
        "artist",
        page,
        songCount,
        albumCount,
        sortBy,
        sortOrder,
      ),
    placeholderData: (previousData, previousQuery) => {
      const previousArtistKey = previousQuery?.queryKey?.[1];
      return previousArtistKey === artistKey ? previousData : undefined;
    },
    enabled: !!artistId || !!artistUrl,
    staleTime: 1000 * 60 * 15,
    // 15 minutes
  });
};

export const useArtistInfinite = (
  artistId: string | null,
  artistUrl: string | null = null,
  options?: {
    tab?: "songs" | "albums";
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  const artistKey = artistId || artistUrl;
  const tab = options?.tab ?? "songs";
  const pageSize = options?.pageSize ?? 10;
  const sortBy = options?.sortBy ?? "";
  const sortOrder = options?.sortOrder ?? "desc";

  return useInfiniteQuery({
    queryKey: [
      "artist-infinite",
      artistKey,
      tab,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: ({ pageParam = 0 }) =>
      jioSaavnService.getArtistDetails(
        artistId,
        artistUrl,
        "artist",
        pageParam,
        tab === "songs" ? pageSize : 0,
        tab === "albums" ? pageSize : 0,
        sortBy,
        sortOrder,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const currentItems =
        tab === "songs" ? lastPage?.topSongs ?? [] : lastPage?.topAlbums ?? [];

      if (!currentItems.length || currentItems.length < pageSize) {
        return undefined;
      }

      if (allPages.length > 1) {
        const previousPage = allPages[allPages.length - 2];
        const previousItems =
          tab === "songs"
            ? previousPage?.topSongs ?? []
            : previousPage?.topAlbums ?? [];

        const previousIds = previousItems.map((item: any) => item.id).join(",");
        const currentIds = currentItems.map((item: any) => item.id).join(",");

        if (previousIds === currentIds) {
          return undefined;
        }
      }

      return allPages.length;
    },
    placeholderData: (previousData, previousQuery) => {
      const previousArtistKey = previousQuery?.queryKey?.[1];
      const previousTab = previousQuery?.queryKey?.[2];

      if (previousArtistKey === artistKey && previousTab === tab) {
        return previousData;
      }

      return undefined;
    },
    enabled: !!artistId || !!artistUrl,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
  });
};
