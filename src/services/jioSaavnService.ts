import { fetch } from "expo/fetch";
import {
  AlbumResponse,
  ArtistType,
  GetAlbumResponse,
  GetPlaylistResponse,
  GlobalSearchResponse,
  RootResponse,
  SearchSongsResponse,
  SongDetail,
  SpecialForYou,
} from "../../types/jiosaavn";
import {
  mapAutocompleteToGlobalSearch,
  mapRawAlbumToAlbumDetail,
  mapRawPlaylistToPlaylistDetail,
  mapRawSongToSongDetail,
} from "../utils/jiosaavnTransform";
import { decodeHtmlEntities, recursiveClean } from "../utils/transform";

const JIOSAAVN_API = "https://www.jiosaavn.com/api.php";
const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.jiosaavn.com/",
  Accept: "application/json",
};

const extractTokenFromPermalink = (
  link: string | null | undefined,
): string | null => {
  if (!link) return null;
  const parts = link.split("?")[0].replace(/\/+$/, "").split("/");
  return parts.pop() || null;
};

const mapArtistResponse = (data: any): ArtistType => {
  const mapArtists = (artistMap: any) => ({
    primary:
      artistMap?.primary_artists?.map((a: any) => ({
        ...a,
        name: decodeHtmlEntities(a.name),
        url: a.perma_url || a.url || "",
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
    featured:
      artistMap?.featured_artists?.map((a: any) => ({
        ...a,
        name: decodeHtmlEntities(a.name),
        url: a.perma_url || a.url || "",
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
    all:
      artistMap?.artists?.map((a: any) => ({
        ...a,
        name: decodeHtmlEntities(a.name),
        url: a.perma_url || a.url || "",
        image: [{ quality: "150x150", url: a.image }],
      })) || [],
  });

  return {
    ...data,
    id: data.artistId || data.id,
    followerCount: data.follower_count,
    fanCount: data.fan_count,
    topSongs:
      data.topSongs?.map((item: any) => mapRawSongToSongDetail(item)) || [],
    topAlbums:
      data.topAlbums?.map((item: any) => ({
        ...item,
        name: decodeHtmlEntities(item.title || item.name),
        url: item.perma_url || item.url,
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
        name: decodeHtmlEntities(item?.title || item?.name),
        url: item?.perma_url || item?.url,
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
        name: decodeHtmlEntities(item.title || item.name),
        url: item.perma_url || item.url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
    featured_artist_playlist:
      data?.featured_artist_playlist?.map((item: any) => ({
        ...item,
        name: decodeHtmlEntities(item.title || item.name),
        url: item.perma_url || item.url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
    latest_release:
      data?.latest_release?.map((item: any) => ({
        ...item,
        name: decodeHtmlEntities(item.title || item.name),
        url: item.perma_url || item.url,
        image: [{ quality: "150x150", url: item.image }],
      })) || [],
  };
};

export const jioSaavnService = {
  getGlobalSearch: async (query: string): Promise<GlobalSearchResponse> => {
    try {
      const url = `${JIOSAAVN_API}?__call=autocomplete.get&query=${encodeURIComponent(
        query,
      )}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      const mapped = mapAutocompleteToGlobalSearch(data);
      return { success: true, data: mapped };
    } catch (error) {
      console.error("Global search failed:", error);
      return {
        success: false,
        data: {
          albums: { results: [], position: 0 },
          songs: { results: [], position: 0 },
          artists: { results: [], position: 0 },
          playlists: { results: [], position: 0 },
          topQuery: { results: [], position: 0 },
        },
      };
    }
  },

  getDetailedSearchResults: async (
    query: string,
    n = 20,
    p = 1,
  ): Promise<any> => {
    const params = `&q=${encodeURIComponent(
      query,
    )}&n=${n}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

    try {
      const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all(
        [
          fetch(`${JIOSAAVN_API}?__call=search.getResults${params}`, {
            headers: DEFAULT_HEADERS,
          }).then((r) => r.json()),
          fetch(`${JIOSAAVN_API}?__call=search.getAlbumResults${params}`, {
            headers: DEFAULT_HEADERS,
          }).then((r) => r.json()),
          fetch(`${JIOSAAVN_API}?__call=search.getArtistResults${params}`, {
            headers: DEFAULT_HEADERS,
          }).then((r) => r.json()),
          fetch(`${JIOSAAVN_API}?__call=search.getPlaylistResults${params}`, {
            headers: DEFAULT_HEADERS,
          }).then((r) => r.json()),
        ],
      );

      const rawSongs = songsRes?.results || [];
      const mappedSongs = rawSongs.map(mapRawSongToSongDetail);

      return recursiveClean({
        songs: mappedSongs,
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
    try {
      const p = Math.max(1, page + 1);
      const url = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(
        query,
      )}&n=${limit}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      const rawSongs = data?.results || [];
      const mappedSongs = rawSongs.map(mapRawSongToSongDetail);

      return {
        success: true,
        data: {
          total: data?.total || mappedSongs.length,
          start: data?.start || 0,
          results: mappedSongs,
        },
      };
    } catch (error) {
      console.error("Search songs failed:", error);
      return { success: false, data: { total: 0, start: 0, results: [] } };
    }
  },

  searchAlbums: async (query: string, page = 0, limit = 10): Promise<any> => {
    try {
      const p = Math.max(1, page + 1);
      const url = `${JIOSAAVN_API}?__call=search.getAlbumResults&q=${encodeURIComponent(
        query,
      )}&n=${limit}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      return {
        success: true,
        data: {
          total: data?.total || 0,
          start: data?.start || 0,
          results: recursiveClean(data?.results || []),
        },
      };
    } catch (error) {
      console.error("Search albums failed:", error);
      return { success: false, data: { total: 0, start: 0, results: [] } };
    }
  },

  searchArtists: async (query: string, page = 0, limit = 10): Promise<any> => {
    try {
      const p = Math.max(1, page + 1);
      const url = `${JIOSAAVN_API}?__call=search.getArtistResults&q=${encodeURIComponent(
        query,
      )}&n=${limit}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      return {
        success: true,
        data: {
          total: data?.total || 0,
          start: data?.start || 0,
          results: recursiveClean(data?.results || []),
        },
      };
    } catch (error) {
      console.error("Search artists failed:", error);
      return { success: false, data: { total: 0, start: 0, results: [] } };
    }
  },

  searchPlaylists: async (
    query: string,
    page = 0,
    limit = 10,
  ): Promise<any> => {
    try {
      const p = Math.max(1, page + 1);
      const url = `${JIOSAAVN_API}?__call=search.getPlaylistResults&q=${encodeURIComponent(
        query,
      )}&n=${limit}&p=${p}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      return {
        success: true,
        data: {
          total: data?.total || 0,
          start: data?.start || 0,
          results: recursiveClean(data?.results || []),
        },
      };
    } catch (error) {
      console.error("Search playlists failed:", error);
      return { success: false, data: { total: 0, start: 0, results: [] } };
    }
  },

  getSearchSuggestions: async (query: string): Promise<any> => {
    try {
      const url = `${JIOSAAVN_API}?__call=autocomplete.get&query=${encodeURIComponent(
        query,
      )}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();

      const combined: any[] = [];
      const mapItem = (item: any) => ({
        id: String(item.id || ""),
        title: decodeHtmlEntities(item.title || item.name || ""),
        subtitle: decodeHtmlEntities(
          item.subtitle || item.description || item.more_info?.album || "",
        ),
        type: item.type || "song",
        image:
          typeof item.image === "string"
            ? item.image
            : item.image?.[0]?.url || "",
        url: item.perma_url || item.url || "",
      });

      if (Array.isArray(data?.topquery?.data)) {
        combined.push(...data.topquery.data.map(mapItem));
      }
      if (Array.isArray(data?.songs?.data)) {
        combined.push(...data.songs.data.map(mapItem));
      }
      if (Array.isArray(data?.albums?.data)) {
        combined.push(...data.albums.data.map(mapItem));
      }
      if (Array.isArray(data?.artists?.data)) {
        combined.push(...data.artists.data.map(mapItem));
      }
      if (Array.isArray(data?.playlists?.data)) {
        combined.push(...data.playlists.data.map(mapItem));
      }

      return { success: true, data: combined };
    } catch (error) {
      console.error("Suggestions failed:", error);
      return { success: false, data: [] };
    }
  },

  getSongByIdandLink: async (ids: string, link?: string): Promise<any> => {
    try {
      const token = extractTokenFromPermalink(link);

      // Strategy 1: If token available from link, resolve via webapi.get
      if (token) {
        try {
          const url = `${JIOSAAVN_API}?__call=webapi.get&token=${token}&type=song&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
          const response = await fetch(url, { headers: DEFAULT_HEADERS });
          const json = await response.json();
          const songsList = json?.songs || (Array.isArray(json) ? json : []);
          if (songsList.length > 0) {
            const mapped = songsList.map(mapRawSongToSongDetail);
            return { success: true, data: mapped };
          }
        } catch (tokenErr) {
          console.warn(
            "Token resolution failed, falling back to pid:",
            tokenErr,
          );
        }
      }

      // Strategy 2: Directly fetch by song id(s)
      const url = `${JIOSAAVN_API}?__call=song.getDetails&pids=${ids}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();

      let songsList: any[] = [];
      if (Array.isArray(data?.songs)) {
        songsList = data.songs;
      } else if (data && typeof data === "object") {
        // If response is keyed by song id
        if (data[ids]) {
          songsList = [data[ids]];
        } else {
          // Look for any song object values
          const values = Object.values(data).filter(
            (v: any) => v && (v.id || v.song_id || v.title),
          );
          if (values.length > 0) songsList = values;
        }
      }

      const mapped = songsList.map(mapRawSongToSongDetail);
      return { success: true, data: mapped };
    } catch (error) {
      console.error("getSongByIdandLink failed:", error);
      return { success: false, data: [] };
    }
  },

  getAlbumById: async (id: string): Promise<GetAlbumResponse> => {
    try {
      const url = `${JIOSAAVN_API}?__call=content.getAlbumDetails&albumid=${id}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      const mapped = mapRawAlbumToAlbumDetail(data);
      return { success: true, data: mapped };
    } catch (error) {
      console.error("getAlbumById failed:", error);
      return { success: false, data: {} as any };
    }
  },

  getPlaylistById: async (id: string): Promise<GetPlaylistResponse> => {
    try {
      const url = `${JIOSAAVN_API}?__call=playlist.getDetails&listid=${id}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();
      const mapped = mapRawPlaylistToPlaylistDetail(data);
      return { success: true, data: mapped };
    } catch (error) {
      console.error("getPlaylistById failed:", error);
      return { success: false, data: {} as any };
    }
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
      const token = extractTokenFromPermalink(link);

      if (token) {
        const url = `${JIOSAAVN_API}?__call=webapi.get&token=${token}&type=${type}&p=${page}&n_song=${songCount}&n_album=${albumCount}&sub_type=&category=${sortBy}&sort_order=${sortOrder}&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const data = await response.json();
        return mapArtistResponse(data);
      }

      if (id) {
        const url = `${JIOSAAVN_API}?__call=artist.getArtistPageDetails&artistId=${id}&p=${page}&n_song=${songCount}&n_album=${albumCount}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const data = await response.json();
        return mapArtistResponse(data);
      }

      return null;
    } catch (error) {
      console.error("Artist detail fetch failed:", error);
      return null;
    }
  },

  getSuggestedSongs: async (
    id: string,
    limit: number = 25,
    stationId?: string | null,
  ): Promise<any> => {
    try {
      // 1. Direct song suggestions using reco.getreco (Android mobile endpoint)
      let url = `${JIOSAAVN_API}?__call=reco.getreco&_format=json&_marker=0&api_version=4&ctx=android&pid=${encodeURIComponent(
        id,
      )}&modules=false`;

      if (stationId) {
        url += `&stationid=${encodeURIComponent(stationId)}&next=1`;
      }

      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      const data = await response.json();

      let rawSongs: any[] = [];
      if (data && typeof data === "object") {
        if (Array.isArray(data[id])) {
          rawSongs = data[id];
        } else if (Array.isArray(data)) {
          rawSongs = data;
        } else {
          // Look for any array in the object values
          for (const val of Object.values(data)) {
            if (Array.isArray(val) && val.length > 0) {
              rawSongs = val;
              break;
            }
          }
        }
      }

      const results: SongDetail[] = [];
      const seenIds = new Set<string>([id]);

      if (rawSongs.length > 0) {
        for (const raw of rawSongs) {
          const mapped = mapRawSongToSongDetail(raw);
          if (mapped?.id && !seenIds.has(mapped.id)) {
            seenIds.add(mapped.id);
            results.push(mapped);
          }
        }
      }

      // If we already have enough recommendations (at least 12 or limit), return them
      if (results.length >= Math.min(limit, 12)) {
        return { success: true, data: results.slice(0, limit) };
      }

      // 2. Supplement/Fallback: Search similar songs using the song's primary artist
      try {
        const detailUrl = `${JIOSAAVN_API}?__call=song.getDetails&pids=${id}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
        const detailRes = await fetch(detailUrl, { headers: DEFAULT_HEADERS });
        const detailData = await detailRes.json();
        const song = detailData?.songs?.[0];
        const artist =
          song?.more_info?.artistMap?.primary_artists?.[0]?.name ||
          song?.primary_artists;

        if (artist) {
          const searchRes = await jioSaavnService.searchSongs(artist, 0, 20);
          const searchSongs = searchRes?.data?.results || [];
          for (const s of searchSongs) {
            if (s?.id && !seenIds.has(s.id)) {
              seenIds.add(s.id);
              results.push(s);
              if (results.length >= limit) break;
            }
          }
        }
      } catch (fbErr) {
        console.warn("Suggested songs fallback failed:", fbErr);
      }

      return { success: true, data: results.slice(0, limit) };
    } catch (error) {
      console.error("Suggested songs failed:", error);
      return { success: false, data: [] };
    }
  },

  getLyrics: async (
    trackName: string,
    artistCandidates: any[],
  ): Promise<any> => {
    for (const artist of artistCandidates) {
      try {
        const response = await fetch(
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(
            trackName as string,
          )}&artist_name=${encodeURIComponent(artist as string)}`,
          {
            headers: {
              "User-Agent":
                "BeatsApp/1.0.0 (https://github.com/alokkkxpixel/Beats)",
            },
          },
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lyric = data[0]?.syncedLyrics || data[0]?.plainLyrics;
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
      artist_recos: { title: "", subtitle: "", data: [] },
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
        `${JIOSAAVN_API}?__call=webapi.getLaunchData` +
        `&api_version=4&_format=json&_marker=0&ctx=web6dot0`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
        headers: {
          ...DEFAULT_HEADERS,
          cookie: `L=${langCookie}; DL=english;`,
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
        url = url.split("?")[0];

        const hasResolution = /-(50x50|150x150|500x500)\.jpg$/i.test(url);
        if (!hasResolution) {
          return [url, url, url];
        }

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
        const upgraded = {
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

        // If this item is a song, map full song details so downloadUrl is available
        if (upgraded.type === "song") {
          const detailed = mapRawSongToSongDetail(item);
          return {
            ...detailed,
            ...upgraded,
            downloadUrl: detailed.downloadUrl,
          };
        }

        return upgraded;
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

  async getSpecialForYou(languages: string[]) {
    try {
      const langCookie = languages.map((l) => l.toLowerCase()).join(",");
      const url =
        `${JIOSAAVN_API}?__call=webapi.get` +
        `&token=I3kvhipIy73uCJW60TJk1Q__&type=playlist&p=1&n=50&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
        headers: {
          ...DEFAULT_HEADERS,
          cookie: `L=${langCookie}; DL=english;`,
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
    playlistUrl: string | null = null,
    page: number = 0,
    limit: number = 50,
  ): Promise<any> {
    try {
      const token = extractTokenFromPermalink(playlistUrl);
      const p = Math.max(1, page + 1);

      if (token) {
        const url = `${JIOSAAVN_API}?__call=webapi.get&token=${token}&type=playlist&p=${p}&n=${limit}&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const json = await response.json();
        if (json) {
          const detail = mapRawPlaylistToPlaylistDetail(json);
          return { ...detail, songs: detail.songs };
        }
      }

      if (playlistId) {
        const url = `${JIOSAAVN_API}?__call=playlist.getDetails&listid=${playlistId}&p=${p}&n=${limit}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const json = await response.json();
        if (json) {
          const detail = mapRawPlaylistToPlaylistDetail(json);
          return { ...detail, songs: detail.songs };
        }
      }

      return null;
    } catch (error) {
      console.error("Playlist detail fetch failed:", error);
      return null;
    }
  },

  async getAlbumDetails(
    albumId: string | null,
    albumUrl: string | null = null,
  ): Promise<any> {
    try {
      const token = extractTokenFromPermalink(albumUrl);

      if (token) {
        const url = `${JIOSAAVN_API}?__call=webapi.get&token=${token}&type=album&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const json = await response.json();
        if (json) {
          const detail = mapRawAlbumToAlbumDetail(json);
          return { ...detail, songs: detail.songs };
        }
      }

      if (albumId && albumId !== "null") {
        const url = `${JIOSAAVN_API}?__call=content.getAlbumDetails&albumid=${albumId}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        const json = await response.json();
        if (json) {
          const detail = mapRawAlbumToAlbumDetail(json);
          return { ...detail, songs: detail.songs };
        }
      }

      return null;
    } catch (error) {
      console.error("Album detail fetch failed:", error);
      return null;
    }
  },

  async getCommunityPlaylists(): Promise<any[]> {
    try {
      const items: any[] = [];
      const seenIds = new Set<string>();

      // 1. Feature the user's community playlist (ANGREJI)
      try {
        const featuredUrl = `${JIOSAAVN_API}?__call=webapi.get&token=jQrktgDBu4VFMb4ZdYSGfQ__&type=playlist&_format=json&_marker=0&api_version=4&ctx=android`;
        const featuredRes = await fetch(featuredUrl, {
          headers: DEFAULT_HEADERS,
        });
        const featuredJson = await featuredRes.json();
        if (featuredJson && (featuredJson.id || featuredJson.listid)) {
          const fid = String(featuredJson.id || featuredJson.listid);
          seenIds.add(fid);
          items.push({
            id: fid,
            listid: fid,
            title: decodeHtmlEntities(featuredJson.title || "ANGREJI"),
            subtitle: "Member",
            type: "playlist",
            image:
              featuredJson.image ||
              "https://pli.saavncdn.com/07/17/1298930717.jpg",
            url:
              featuredJson.perma_url ||
              "https://www.jiosaavn.com/s/playlist/8cd4f5025e82e9537c778c0cb2e06673/angreji/jQrktgDBu4VFMb4ZdYSGfQ__",
          });
        }
      } catch (fErr) {
        console.warn("Featured community playlist fetch failed:", fErr);
      }

      // 2. Fetch popular public/member community playlists
      try {
        const searchUrl = `${JIOSAAVN_API}?__call=search.getPlaylistResults&q=favorite%20lofi%20chill%20vibes&n=15&p=1&_format=json&_marker=0&api_version=4&ctx=android`;
        const searchRes = await fetch(searchUrl, { headers: DEFAULT_HEADERS });
        const searchJson = await searchRes.json();
        const results = searchJson?.results || [];

        for (const item of results) {
          const pid = String(item.id || item.listid || "");
          if (!pid || seenIds.has(pid)) continue;
          seenIds.add(pid);

          items.push({
            id: pid,
            listid: pid,
            title: decodeHtmlEntities(item.title || item.name || "Playlist"),
            subtitle: "Member",
            type: "playlist",
            image: item.image,
            url: item.perma_url || item.url || "",
          });
        }
      } catch (sErr) {
        console.warn("Community search fetch failed:", sErr);
      }

      return items;
    } catch (error) {
      console.error("getCommunityPlaylists error:", error);
      return [];
    }
  },
};
