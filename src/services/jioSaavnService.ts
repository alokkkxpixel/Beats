import { fetch } from "expo/fetch";
import {
  AlbumResponse,
  GetAlbumResponse,
  GetPlaylistResponse,
  GlobalSearchResponse,
  RootResponse,
  SearchSongsResponse,
} from "../../types/jiosaavn";
import { decodeHtmlEntities, recursiveClean } from "../utils/transform";
const BASE_URL =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app/api";
const API_SERVER =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app";

export const jioSaavnService = {
  getGlobalSearch: async (query: string): Promise<GlobalSearchResponse> => {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
    const data = await response.json();
    return recursiveClean(data);
  },

  searchSongs: async (
    query: string,
    page = 0,
    limit = 10,
  ): Promise<SearchSongsResponse> => {
    const response = await fetch(
      `${BASE_URL}/search/songs?query=${query}&page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    return recursiveClean(data);
  },

  getSongByIdandLink: async (ids: string, link?: string): Promise<any> => {
    // Construct the base URL
    let url = `${BASE_URL}/songs?ids=${ids}`;

    // Only append link if it's actually provided
    if (link) {
      url += `&link=${link}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return recursiveClean(data);
  },

  getAlbumById: async (id: string): Promise<GetAlbumResponse> => {
    const response = await fetch(`${BASE_URL}/albums?id=${id}`);
    const data = await response.json();
    return recursiveClean(data);
  },

  getPlaylistById: async (id: string): Promise<GetPlaylistResponse> => {
    const response = await fetch(`${BASE_URL}/playlists?id=${id}`);
    const data = await response.json();
    return recursiveClean(data);
  },
};

export const SaavnService = {
  async getHomePreviews(languages: string[]): Promise<RootResponse> {
    const EMPTY: RootResponse = {
      newtrending: [],
      topPlaylists: [],
      newreleases: [],
      raw_new_releases: [],
      quick_picks: [],
      "promo:vx:data:76": [],
      "promo:vx:data:68": [],
      "promo:vx:data:69": [],
      "promo:vx:data:185": [],
      "promo:vx:data:209": [],
      "promo:vx:data:113": [],
      "promo:vx:data:107": [],
      radio: [],
      artist_recos: [],
      city_mod: { title: "", subtitle: "", data: [] },
      charts: [],
      modules: {
        "promo:vx:data:76": {},
        "promo:vx:data:68": {},
        "promo:vx:data:69": {},
        "promo:vx:data:185": {},
        "promo:vx:data:209": {},
        "promo:vx:data:113": {},
        "promo:vx:data:107": {},
        radio: {},
        artist_recos: {},
        city_mod: {},
      },
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
      
      const rawTopPlaylists: AlbumResponse[] = json?.top_playlists || [];
      const rawNewAlbums: AlbumResponse[] = json?.new_albums || [];
      const rawNewTrending: any[] = json?.new_trending || [];
      const rawCharts: any[] = json?.charts || [];

      const mapImage = (item: any) => {
        let url = item.image || "";
        if (!url) return ["", "", ""];

        // Strip query string params (e.g. ?bch=493632)
        url = url.split("?")[0];

        // Check if the URL has a resolution suffix pattern like -150x150.jpg
        const hasResolution = /-(50x50|150x150|500x500)\.jpg$/i.test(url);

        if (!hasResolution) {
          // Editorial/playlist images — no resolution variants exist, use as-is
          return [url, url, url];
        }

        // Remove existing resolution suffix to get the clean base
        const base = url
          .replace(/-(50x50|150x150|500x500)\.jpg$/i, "")
          .replace(/\.(jpg|jpeg|png)$/i, "");

        return [
          `${base}-50x50.jpg`,
          `${base}-150x150.jpg`,
          `${base}-500x500.jpg`,
        ];
      };

      const mapItem = (item: any) => {
        if (!item) return item;
        const target = item.details || item;
        return {
          ...item,
          title: decodeHtmlEntities(item.title || item.name),
          subtitle: decodeHtmlEntities(item.subtitle),
          image: mapImage(target),
          url: target.perma_url || item.url,
          type: target.type || item.type,
          more_info: item.more_info
            ? recursiveClean(item.more_info)
            : undefined,
        };
      };

      const quick_picks: any[] = [];
      const new_releases: any[] = [];
      const raw_new_releases: any[] = [];

      rawNewAlbums.forEach((item: any) => {
        const upgraded = mapItem(item);
        raw_new_releases.push(upgraded);
        if (item.type === "song") {
          quick_picks.push(upgraded);
        } else {
          new_releases.push(upgraded);
        }
      });

      const new_trending: any[] = [];
      rawNewTrending.forEach((item: any) => {
        const upgraded = mapItem(item);
        if (item.type === "song") {
          quick_picks.push(upgraded);
        } else {
          new_trending.push(upgraded);
        }
      });

      const top_playlists = rawTopPlaylists.map(mapItem);
      const charts = rawCharts.map(mapItem);
      return {
        newtrending: new_trending,
        topPlaylists: top_playlists,
        newreleases: new_releases,
        raw_new_releases: raw_new_releases,
        quick_picks: quick_picks,
        "promo:vx:data:76": (json["promo:vx:data:76"] || []).map(mapItem),
        "promo:vx:data:68": (json["promo:vx:data:68"] || []).map(mapItem),
        "promo:vx:data:69": (json["promo:vx:data:69"] || []).map(mapItem),
        "promo:vx:data:185": (json["promo:vx:data:185"] || []).map(mapItem),
        "promo:vx:data:209": (json["promo:vx:data:209"] || []).map(mapItem),
        "promo:vx:data:113": (json["promo:vx:data:113"] || []).map(mapItem),
        "promo:vx:data:107": (json["promo:vx:data:107"] || []).map(mapItem),
        radio: (json?.radio || []).map(mapItem),
        artist_recos: (json?.artist_recos || []).map(mapItem),
        city_mod: {
          title: decodeHtmlEntities(json?.module?.city_mod?.title || json?.modules?.city_mod?.title || ""),
          subtitle: decodeHtmlEntities(json?.module?.city_mod?.subtitle || json?.modules?.city_mod?.subtitle || ""),
          data: (json?.city_mod || []).map(mapItem),
        },
        charts: charts,
        modules: json?.modules || {
          "promo:vx:data:76": {},
          "promo:vx:data:68": {},
          "promo:vx:data:69": {},
          "promo:vx:data:185": {},
          "promo:vx:data:209": {},
          "promo:vx:data:113": {},
          "promo:vx:data:107": {},
          radio: {},
          artist_recos: {},
          city_mod: {},
        },
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
      return json.success ? recursiveClean(json.data) : null;
    } catch (error) {
      console.error("Detail fetch failed:", error);
      return null;
    }
  },

  async getAlbumDetails(albumUrl: string): Promise<any> {
    try {
      const response = await fetch(`${API_SERVER}/api/albums?link=${albumUrl}`);
      const json = await response.json();
      return json.success ? recursiveClean(json.data) : null;
    } catch (error) {
      console.error("Album detail fetch failed:", error);
      return null;
    }
  },
};
