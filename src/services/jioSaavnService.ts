import { fetch } from "expo/fetch";
import {
  GetAlbumResponse,
  GetPlaylistResponse,
  GlobalSearchResponse,
  RootResponse,
  SearchSongsResponse,
} from "../../types/jiosaavn";
const BASE_URL =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app/api";
const API_SERVER =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app";

export const jioSaavnService = {
  getGlobalSearch: async (query: string): Promise<GlobalSearchResponse> => {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
    return response.json();
  },

  searchSongs: async (
    query: string,
    page = 0,
    limit = 10,
  ): Promise<SearchSongsResponse> => {
    const response = await fetch(
      `${BASE_URL}/search/songs?query=${query}&page=${page}&limit=${limit}`,
    );
    return response.json();
  },

  getSongById: async (ids: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/songs?ids=${ids}`);
    return response.json();
  },

  getAlbumById: async (id: string): Promise<GetAlbumResponse> => {
    const response = await fetch(`${BASE_URL}/albums?id=${id}`);
    return response.json();
  },

  getPlaylistById: async (id: string): Promise<GetPlaylistResponse> => {
    const response = await fetch(`${BASE_URL}/playlists?id=${id}`);
    return response.json();
  },
};

export const SaavnService = {
  async getHomePreviews(languages: string[]): Promise<RootResponse> {
    const EMPTY: RootResponse = {
      newtrending: [],
      topPlaylists: [],
      newreleases: [],
      quick_picks: [],
      charts: [],
    };
    try {
      const langCookie = languages.map((l) => l.toLowerCase()).join(",");

      const url =
        `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData` +
        `&api_version=4&_format=json&_marker=0&ctx=web6dot0`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
        headers: {
          cookie: `L=${langCookie}; DL=english;`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://www.jiosaavn.com/",
          Accept: "application/json",
        },
      });

      const json = await response.json();
      const rawTopPlaylists: any[] = json?.top_playlists || [];
      const rawNewAlbums: any[] = json?.new_albums || [];
      const rawNewTrending: any[] = json?.new_trending || [];
      const rawCharts: any[] = json?.charts || [];

      const mapImage = (item: any) => {
        let imageUrl = item.image || "";
        if (imageUrl.includes("150x150"))
          imageUrl = imageUrl.replace("150x150", "500x500");
        else if (!imageUrl.includes("500x500"))
          imageUrl = imageUrl.replace(".jpg", "_500x500.jpg");
        return imageUrl;
      };

      const quick_picks: any[] = [];

      // 1. Process New Releases (Songs -> QuickPicks, Albums -> NewReleases)
      const new_releases: any[] = [];
      rawNewAlbums.forEach((item: any) => {
        const upgraded = { ...item, url: item.perma_url, image: mapImage(item) };
        if (item.type === "song") {
          quick_picks.push(upgraded);
        } else {
          new_releases.push(upgraded);
        }
      });

      // 2. Process Trending (Songs -> QuickPicks, Others -> Trending)
      const new_trending: any[] = [];
      rawNewTrending.forEach((item: any) => {
        // Handle both flat and nested structures
        const target = item.details || item;
        const upgraded = {
          ...item,
          details: item.details ? { ...item.details, image: mapImage(item.details) } : undefined,
          image: !item.details ? mapImage(item) : item.image,
          url: target.perma_url || item.url,
        };

        const type = target.type || item.type;
        if (type === "song") {
          quick_picks.push(upgraded.details || upgraded);
        } else {
          new_trending.push(upgraded);
        }
      });

      const top_playlists = rawTopPlaylists.map((item: any) => ({
        ...item,
        url: item.perma_url,
        image: mapImage(item),
      }));

      console.log(
        `✅ top_playlists: ${top_playlists.length}, new_releases: ${new_releases.length}, trending: ${new_trending.length}, quick_picks: ${quick_picks.length}`,
      );

      return {
        newtrending: new_trending,
        topPlaylists: top_playlists,
        newreleases: new_releases,
        quick_picks: quick_picks,
        charts: rawCharts,
      };
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return EMPTY;
    }
  },


  async getPlaylistDetails(
    playlistId: string | null,
    playlistUrl: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_SERVER}/api/playlists?id=${playlistId}&link=${playlistUrl}`,
      );
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error("Detail fetch failed:", error);
      return null;
    }
  },

  async getAlbumDetails(albumUrl: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_SERVER}/api/albums?link=${albumUrl}`,
      );
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error("Album detail fetch failed:", error);
      return null;
    }
  },
};
