import { fetch } from "expo/fetch";
import {
  GetAlbumResponse,
  GetPlaylistResponse,
  GlobalSearchResponse,
  SearchSongsResponse,
} from "../../types/jiosaavn";
const BASE_URL = "https://saavn.sumit.co/api";
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
  async getHomePreviews(languages: string[]): Promise<any[]> {
    try {
      // ROOT CAUSE: JioSaavn's server sends `Set-Cookie: L=hindi` on first response
      // (based on India IP geolocation). Android's OkHttp cookie jar stores this and
      // re-injects L=hindi on every subsequent request, overriding any L=english we send.
      //
      // FIX: Use `credentials: "omit"` — this tells OkHttp to NOT consult its cookie jar
      // for this request. We then manually set the `cookie` header with our desired language.
      // Confirmed: p_langs URL param is completely ignored by JioSaavn's server.
      const langCookie = languages.map((l) => l.toLowerCase()).join(",");

      const url =
        `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData` +
        `&api_version=4&_format=json&_marker=0&ctx=web6dot0`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "omit", // Prevents OkHttp/URLSession from injecting stored L=hindi cookie
        headers: {
          cookie: `L=${langCookie}; DL=english;`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://www.jiosaavn.com/",
          Accept: "application/json",
        },
      });

      const json = await response.json();
      console.log("First playlist:", json.top_playlists?.[0]?.title);
      const topPlaylists = json?.top_playlists || [];

      if (!topPlaylists.length) {
        return [];
      }

      const data = topPlaylists.map((item: any) => {
        let imageUrl = item.image || "";
        if (imageUrl.includes("150x150")) {
          imageUrl = imageUrl.replace("150x150", "500x500");
        } else if (!imageUrl.includes("500x500")) {
          imageUrl = imageUrl.replace(".jpg", "_500x500.jpg");
        }

        return {
          url: item.perma_url,
          image: imageUrl,
          title: item.title || "Untitled Playlist",
          subtitle: item.subtitle || "Featured Playlist",
          isLoaded: false,
        };
      });

      const uniqueData = Array.from(
        new Map(data.map((item: any) => [item.url, item])).values(),
      );

      console.log(
        `✅ Successfully fetched ${uniqueData.length} valid playlists`,
      );
      return uniqueData;
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return [];
    }
  },

  async getPlaylistDetails(playlistUrl: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_SERVER}/api/playlists?link=${playlistUrl}`,
      );
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error("Detail fetch failed:", error);
      return null;
    }
  },
};
