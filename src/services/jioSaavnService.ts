import { fetch } from "expo/fetch";
import {
  AlbumResponse,
  ArtistType,
  GetAlbumResponse,
  GetPlaylistResponse,
  GlobalSearchResponse,
  RootResponse,
  SearchSongsResponse,
  SpecialForYou,
} from "../../types/jiosaavn";
import { decodeHtmlEntities, recursiveClean } from "../utils/transform";
const BASE_URL =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app/api";
const API_SERVER =
  "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app";

const Search = `https://www.jiosaavn.com/api.php?`;

// https://www.jiosaavn.com/api.php?__call=search.getResults&q=butter&n=20&p=1&_format=json&_marker=0&api_version=4&ctx=web6dot0
const song = "search.getResults";
const artist = "search.getArtistResults";
const album = "search.getAlbumResults";
const playlist = "search.getPlaylistResults";
const extractTokenFromPermalink = (link: string | null | undefined) => {
  if (!link) return null;
  return link.split("?")[0].replace(/\/+$/, "").split("/").pop() || null;
};
// n=20 no of results to fetch
// p=1 page number
// q=query
// etc
//  type = podcast
// &_format=json&_marker=0&api_version=4&ctx=web6dot0
const mapArtistResponse = (data: any): ArtistType => {
  const mapArtists = (artistMap: any) => ({
    primary:
      artistMap?.primary_artists?.map((a: any) => ({
        ...a,
        name: a.name,
        url: a.perma_url,
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
    featured:
      artistMap?.featured_artists?.map((a: any) => ({
        ...a,
        name: a.name,
        url: a.perma_url,
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
    all:
      artistMap?.artists?.map((a: any) => ({
        ...a,
        name: a.name,
        url: a.perma_url,
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
  });

  return {
    ...data,
    id: data.artistId,
    followerCount: data.follower_count,
    fanCount: data.fan_count,
    topSongs:
      data.topSongs?.map((item: any) => ({
        ...item,
        name: item.title,
        url: item.perma_url,
        explicitContent: item.explicit_content === "1",
        duration: item.more_info?.duration
          ? parseInt(item.more_info.duration)
          : 0,
        image: [{ quality: "150x150", url: item.image }],
        album: {
          id: item.more_info?.album_id,
          name: item.more_info?.album,
          url: item.more_info?.album_url,
        },
        artists: mapArtists(item.artistMap),
      })) || [],
    topAlbums:
      data.topAlbums?.map((item: any) => ({
        ...item,
        name: item.title,
        url: item.perma_url,
        image: [{ quality: "150x150", url: item.image }],
        playCount: item.play_count,
        explicitContent: item.explicit_content,
        releaseDate: item.release_date,
        songCount: item.more_info?.song_count,
        artists: mapArtists(item.more_info),
      })) || [],
    singles:
      data?.singles?.map((item: any) => ({
        ...item,
        name: item?.title,
        url: item?.perma_url,
        image: [{ quality: "150x150", url: item.image }],
        playCount: item.play_count,
        explicitContent: item.explicit_content,
        releaseDate: item.release_date,
        songCount: item.more_info?.song_count,
        artists: mapArtists(item.more_info),
      })) || [],
    dedicated_artist_playlist:
      data?.dedicated_artist_playlist?.map((item: any) => ({
        ...item,
        name: item.title,
        url: item.perma_url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
    featured_artist_playlist:
      data?.featured_artist_playlist?.map((item: any) => ({
        ...item,
        name: item.title,
        url: item.perma_url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
    latest_release:
      data?.latest_release?.map((item: any) => ({
        ...item,
        name: item.title,
        url: item.perma_url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
  };
};

export const jioSaavnService = {
  getGlobalSearch: async (query: string): Promise<GlobalSearchResponse> => {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
    const data = await response.json();
    return recursiveClean(data);
  },

  getDetailedSearchResults: async (
    query: string,
    n = 20,
    p = 1,
  ): Promise<any> => {
    const params = `&q=${query}&n=${n}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

    try {
      const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all(
        [
          fetch(`${Search}__call=${song}${params}`).then((r) => r.json()),
          fetch(`${Search}__call=${album}${params}`).then((r) => r.json()),
          fetch(`${Search}__call=${artist}${params}`).then((r) => r.json()),
          fetch(`${Search}__call=${playlist}${params}`).then((r) => r.json()),
        ],
      );

      return recursiveClean({
        songs: songsRes?.results || [],
        albums: albumsRes?.results || [],
        artists: artistsRes?.results || [],
        playlists: playlistsRes?.results || [],
      });
    } catch (error) {
      console.error("Detailed search fetch failed:", error);
      return { songs: [], albums: [], artists: [], playlists: [] };
    }
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

  searchAlbums: async (query: string, page = 0, limit = 10): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/search/albums?query=${query}&page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    return recursiveClean(data);
  },

  searchArtists: async (query: string, page = 0, limit = 10): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/search/artists?query=${query}&page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    return recursiveClean(data);
  },

  searchPlaylists: async (
    query: string,
    page = 0,
    limit = 10,
  ): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/search/playlists?query=${query}&page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    return recursiveClean(data);
  },

  getSearchSuggestions: async (query: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
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

  getArtistDetails: async (
    id: string | null,
    link: string | null = null,
    type: string = "artist",
    page: number = 0,
    songCount: number = 10,
    albumCount: number = 10,
    sortBy: string = "",
    sortOrder: string = "desc",
  ): Promise<ArtistType | null> => {
    try {
      if (id && link) {
        const token = extractTokenFromPermalink(link);
        if (!token) return null;
        const url = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${token}&type=${type}&p=${page}&n_song=${songCount}&n_album=${albumCount}&sub_type=&category=${sortBy}&sort_order=${sortOrder}&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
        const response = await fetch(url);
        const data = await response.json();
        return mapArtistResponse(data);
      }

      // Fallback path
      const response = await fetch(
        `${API_SERVER}/api/artists?id=${id}&page=${page}&songCount=${10}&albumCount=${10}`,
      );
      const json = await response.json();
      const token = extractTokenFromPermalink(json.data?.url);

      if (!token) return null;

      const url = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${token}&type=${type}&p=${page}&n_song=${songCount}&n_album=${albumCount}&sub_type=&category=${sortBy}&sort_order=${sortOrder}&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
      const artistResponse = await fetch(url);
      const artistData = await artistResponse.json();
      return mapArtistResponse(artistData);
    } catch (error) {
      console.error("Artist detail fetch failed:", error);
      return null;
    }
  },

  getSuggestedSongs: async (id: string, limit: number = 5): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/songs/${id}/suggestions?limit=${limit}`,
    );
    const data = await response.json();
    return recursiveClean(data);
  },
  getLyrics: async (
    trackName: string,
    artistCandidates: any[],
  ): Promise<any> => {
    for (const artist of artistCandidates) {
      try {
        // console.log("trackName:", JSON.stringify(trackName));
        // console.log("artist:", JSON.stringify(artist));
        const response = await fetch(
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(
            trackName as string,
          )}&artist_name=${encodeURIComponent(artist as string)}`,
        );

        const data = await response.json();
        // console.log("lyr data", JSON.stringify(data, null, 2));
        if (Array.isArray(data) && data.length > 0) {
          const lyric = data[0]?.syncedLyrics || data[0]?.plainLyrics;
          // console.log("lyrics", lyric);
          if (lyric) return lyric;
        }
      } catch (error) {
        console.log(`Failed for ${artist}`, error);
      }
    }
    return null;
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
      "promo:vx:data:68": { title: "", subtitle: "", data: [] },
      "promo:vx:data:69": { title: "", subtitle: "", data: [] },
      "promo:vx:data:185": { title: "", subtitle: "", data: [] },
      "promo:vx:data:209": { title: "", subtitle: "", data: [] },
      "promo:vx:data:113": { title: "", subtitle: "", data: [] },
      "promo:vx:data:107": { title: "", subtitle: "", data: [] },
      radio: [],
      artist_recos: {
        title: "",
        subtitle: "",
        data: [],
      },
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

        if (url.startsWith("http://")) {
          url = url.replace("http://", "https://");
        }

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
        "promo:vx:data:68": {
          title:
            json?.module?.["promo:vx:data:68"]?.title ||
            json?.modules?.["promo:vx:data:68"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:68"]?.subtitle ||
            json?.modules?.["promo:vx:data:68"]?.subtitle ||
            "",
          data: (json["promo:vx:data:68"] || []).map(mapItem),
        },
        "promo:vx:data:69": {
          title:
            json?.module?.["promo:vx:data:69"]?.title ||
            json?.modules?.["promo:vx:data:69"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:69"]?.subtitle ||
            json?.modules?.["promo:vx:data:69"]?.subtitle ||
            "",
          data: (json["promo:vx:data:69"] || []).map(mapItem),
        },
        "promo:vx:data:185": {
          title:
            json?.module?.["promo:vx:data:185"]?.title ||
            json?.modules?.["promo:vx:data:185"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:185"]?.subtitle ||
            json?.modules?.["promo:vx:data:185"]?.subtitle ||
            "",
          data: (json["promo:vx:data:185"] || []).map(mapItem),
        },
        "promo:vx:data:209": {
          title:
            json?.module?.["promo:vx:data:209"]?.title ||
            json?.modules?.["promo:vx:data:209"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:209"]?.subtitle ||
            json?.modules?.["promo:vx:data:209"]?.subtitle ||
            "",
          data: (json["promo:vx:data:209"] || []).map(mapItem),
        },
        "promo:vx:data:113": {
          title:
            json?.module?.["promo:vx:data:113"]?.title ||
            json?.modules?.["promo:vx:data:113"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:113"]?.subtitle ||
            json?.modules?.["promo:vx:data:113"]?.subtitle ||
            "",
          data: (json["promo:vx:data:113"] || []).map(mapItem),
        },
        "promo:vx:data:107": {
          title:
            json?.module?.["promo:vx:data:107"]?.title ||
            json?.modules?.["promo:vx:data:107"]?.title ||
            "",
          subtitle:
            json?.module?.["promo:vx:data:107"]?.subtitle ||
            json?.modules?.["promo:vx:data:107"]?.subtitle ||
            "",
          data: (json["promo:vx:data:107"] || []).map(mapItem),
        },
        radio: (json?.radio || []).map(mapItem),
        artist_recos: {
          title: decodeHtmlEntities(
            json?.module?.artist_recos?.title ||
              json?.modules?.artist_recos?.title ||
              "",
          ),
          data: (json?.artist_recos || []).map(mapItem),
        },
        city_mod: {
          title: decodeHtmlEntities(
            json?.module?.city_mod?.title ||
              json?.modules?.city_mod?.title ||
              "",
          ),
          subtitle: decodeHtmlEntities(
            json?.module?.city_mod?.subtitle ||
              json?.modules?.city_mod?.subtitle ||
              "",
          ),
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

  // async getPlaylistDetails(
  //   playlistId: string | null,
  //   playlistUrl: string,
  // ): Promise<any> {
  //   try {
  //     const response = await fetch(
  //       `${API_SERVER}/api/playlists?id=${playlistId}&link=${playlistUrl}`,
  //     );
  //     const json = await response.json();
  //     return json.success ? recursiveClean(json.data) : null;
  //   } catch (error) {
  //     console.error("Detail fetch failed:", error);
  //     return null;
  //   }
  // },

  async getSpecialForYou(languages: string[]) {
    try {
      const langCookie = languages.map((l) => l.toLowerCase()).join(",");
      const url =
        `https://www.jiosaavn.com/api.php?__call=webapi.get` +
        `&token=I3kvhipIy73uCJW60TJk1Q__&type=playlist&p=1&n=50&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;

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

      const data: SpecialForYou = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch failed:", error);
      return null;
    }
  },

  async getPlaylistDetails(
    playlistId: string | null,
    playlistUrl: string,
    page: number = 0,
    limit: number = 10,
  ): Promise<any> {
    try {
      const res = await fetch(
        `${API_SERVER}/api/playlists?id=${playlistId}&link=${playlistUrl}&page=${page}&limit=${limit}`,
      );

      const json = await res.json();

      return json.success ? json.data : null;
    } catch (error) {
      console.error("Fetch failed:", error);
      return null;
    }
  },
  async getAlbumDetails(
    albumId: string | null,
    albumUrl: string | null,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_SERVER}/api/albums?id=${albumId}&link=${albumUrl}`,
      );
      const json = await response.json();
      return json.success ? recursiveClean(json.data) : null;
    } catch (error) {
      console.error("Album detail fetch failed:", error);
      return null;
    }
  },
};
