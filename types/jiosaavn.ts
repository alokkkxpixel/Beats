export interface ImageQuality {
  quality: string;
  url: string;
}

// ----------------------------------------------------
// 1. SHARED DETAIL TYPES (For full API Fetch Responses)
// ----------------------------------------------------

export interface SongArtistDetails {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ImageQuality[];
  url: string;
}

export interface SongAlbumInfo {
  id: string | null;
  name: string | null;
  url: string | null;
}

export interface SongArtistsMap {
  primary: SongArtistDetails[];
  featured: SongArtistDetails[];
  all: SongArtistDetails[];
}

export interface SongDetail {
  id: string;
  name: string;
  type: string;
  year: string | number | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  primaryArtists?: string;
  singers?: string;
  description?: string;
  subtitle?: string;
  url: string;
  copyright: string | null;
  album?: SongAlbumInfo | string;
  artists: SongArtistsMap;
  image: ImageQuality[];
  downloadUrl: ImageQuality[];
}

// ----------------------------------------------------
// 2. SEARCH SPECIFIC TYPES (Global Search Endpoint)
// ----------------------------------------------------

export interface SearchAlbum {
  id: string;
  title: string;
  image: ImageQuality[];
  artist: string;
  url: string;
  type: string;
  description: string;
  year: string;
  language: string;
  songIds: string;
}

export interface SearchSong {
  id: string;
  title: string;
  image: ImageQuality[];
  album: string;
  url: string;
  type: string;
  description: string;
  primaryArtists: string;
  singers: string;
  language: string;
}

export interface SearchArtist {
  id: string;
  title: string;
  image: ImageQuality[];
  type: string;
  description: string;
  position: number;
}

export interface SearchPlaylist {
  id: string;
  title: string;
  image: ImageQuality[];
  url: string;
  language: string;
  type: string;
  description: string;
}

export interface GlobalSearchData {
  albums: {
    results: SearchAlbum[];
    position: number;
  };
  songs: {
    results: SearchSong[];
    position: number;
  };
  artists: {
    results: SearchArtist[];
    position: number;
  };
  playlists: {
    results: SearchPlaylist[];
    position: number;
  };
  topQuery: {
    results: SearchSong[];
    position: number;
  };
}

export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  image: string;
  url: string;
}

export interface SearchSuggestionResponse {
  success: boolean;
  data: SearchSuggestion[];
}

// ----------------------------------------------------
// 3. FULL ENDPOINT RESPONSE TYPES
// ----------------------------------------------------

export interface GlobalSearchResponse {
  success: boolean;
  data: GlobalSearchData;
}

export interface SearchSongsData {
  total: number;
  start: number;
  results: SongDetail[];
}

export interface SearchSongsResponse {
  success: boolean;
  data: SearchSongsData;
}

export interface GetSongsResponse {
  success: boolean;
  data: SongDetail[];
}

export interface AlbumDetail {
  id: string;
  name: string;
  description: string;
  year: string | number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: SongArtistsMap;
  songCount: number | null;
  url: string;
  image: ImageQuality[];
  songs: SongDetail[];
}

export interface GetAlbumResponse {
  success: boolean;
  data: AlbumDetail;
}

export interface PlaylistDetail {
  id: string;
  name: string;
  description: string | null;
  year: string | number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  songCount: number | null;
  url: string;
  image: ImageQuality[];
  songs: SongDetail[];
  artists: SongArtistDetails[];
}

export interface GetPlaylistResponse {
  success: boolean;
  data: PlaylistDetail;
}

// Nested Artist details for the Trending section
export interface TrendingArtist {
  id?: string;
  name?: string;
  role?: string;
  type?: string;
  image?: ImageQuality[] | string;
  url?: string;
  perma_url?: string | null;
}

// Nested Music details for the New Albums section
export interface MusicContributor {
  id: string;
  name: string;
}

// Main Trending Item
export interface TrendingItem {
  type: string;
  details: {
    title: string;
    secondary_subtitle: string;
    image: string;
    albumid: string;
    release_date: string;
    song_count: string; // Note: provided as string in your data
    language: string;
    perma_url: string;
    artist: TrendingArtist;
  };
  weight: number;
  language: string;
}

// Playlist Item
export interface PlaylistItem {
  listid: string;
  secondary_subtitle: string;
  firstname: string;
  listname: string;
  data_type: string;
  count: number;
  image: string;
  sponsored: boolean;
  perma_url: string;
  follower_count: string;
  uid: string;
  last_updated: number; // Unix timestamp
}

// Common types
export interface Image {
  quality: string;
  url: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  image: Image[];
  type: "artist";
  url: string;
}

export interface ArtistGroup {
  primary: Artist[];
  featured: Artist[];
  all: Artist[];
}

// Album (light version used inside song)
export interface AlbumRef {
  id: string;
  name: string;
  url: string;
}

// Song type
export interface Song {
  id: string;
  name: string;
  type: "song";
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string;

  album: AlbumRef;
  artists: ArtistGroup;

  image: Image[];
  downloadUrl: DownloadUrl[];
}

// Main Album type
export interface AlbumResponse {
  id: string;
  name: string;
  title: string;
  description: string;
  type: "album" | "playlist";
  year: number | string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  url: string;
  songCount: number;

  artists?: ArtistGroup;
  image: Image[];
  songs: Song[];
}

// Root response
// export interface AlbumResponse {
//   data: Album;
// }

// New Album Item
export interface NewAlbumItem {
  query: string;
  text: string;
  id: string;
  year: string;
  image: string;
  albumid: string;
  title: string;
  description?: string;
  subtitle?: string;
  url?: string;
  artists: {
    music: MusicContributor[];
  };
  weight: number;
  play_count?: string;
  language?: string;
  song_count?: string;
  explicit_content?: string;
  songs: [];
}

// New specific type for Chart items
export interface ChartItem {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  perma_url: string;
  more_info: {
    firstname: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}

export interface NewRelease {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count: string;
  song_count?: string;

  more_info: {
    firstname?: string;
    song_count?: string;
    artistMap: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}
export interface TopPlaylists {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  perma_url?: string;
  description?: string;
  play_count?: string;
  artists?: {
    primary?: TrendingArtist[];
    featured?: TrendingArtist[];
    all?: TrendingArtist[];
  };
  more_info?: {
    firstname?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;
    editorial_language?: string;
    artist_name?: string[];
    entity_type?: string;
    entity_sub_type?: string;
    video_available?: boolean | string;
    id_dolby_content?: boolean | string | null | undefined;
    sub_type?: string | null;
    images?: null | string;
    lastname?: string;
    language?: string;
    description?: string;
    show_id?: string;
    show_title?: string;
    season_no?: string;
    season_title?: string;
    episode_number?: string;
    artistMap?: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };

    release_date?: string;
    release_time?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
  numsongs?: null | string;
}

export interface Charts {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;

  url: string;
  count?: string;
  more_info: {
    firstname?: string;
  };
  explicit_content?: string; // "0" for false, "1" for true
  mini_obj?: boolean;
  language?: string;
}
export interface NewTrending {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count?: string;
  song_count?: string;
  year?: string;
  perma_url?: string;
  more_info: {
    firstname?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;
    artistMap?: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}

interface ModulesCommanData {
  title?: string;
  subtitle?: string;
  highlights?: string;
  source?: string;
}

export interface Modules {
  new_trending?: ModulesCommanData;
  top_playlists?: ModulesCommanData;
  new_releases?: ModulesCommanData;
  raw_new_releases?: ModulesCommanData;
  quick_picks?: ModulesCommanData;
  charts?: ModulesCommanData;
  "promo:vx:data:76": ModulesCommanData;
  "promo:vx:data:68": ModulesCommanData;
  "promo:vx:data:69": ModulesCommanData;
  "promo:vx:data:185": ModulesCommanData;
  "promo:vx:data:209": ModulesCommanData;
  "promo:vx:data:113": ModulesCommanData;
  "promo:vx:data:107": ModulesCommanData;
  radio: ModulesCommanData;
  artist_recos: ModulesCommanData;
  city_mod: ModulesCommanData;
}
export interface Radio {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count?: string;
  song_count?: string;
  year?: string;
  perma_url?: string;
  more_info: {
    description?: string;
    firstname?: string;
    featured_station_type?: string;
    language?: string;
    region?: string;
    station_display_text?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;

    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}
export interface ArtistRecos {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count?: string;
  song_count?: string;
  year?: string;
  perma_url?: string;
  more_info: {
    description?: string;
    firstname?: string;
    featured_station_type?: string;
    query?: string;
    language?: string;
    region?: string;
    station_display_text?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;

    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}
export interface CityMod {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count?: string;
  song_count?: string;
  year?: string;
  perma_url?: string;
  more_info: {
    description?: string;
    firstname?: string;
    featured_station_type?: string;
    query?: string;
    language?: string;
    region?: string;
    station_display_text?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;
    artistMap?: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
      album_id?: string;
      album?: string;
      rights?: any;
    };
    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
}
// Root Object

export interface RootResponse {
  newtrending: NewTrending[];
  topPlaylists: TopPlaylists[];
  newreleases: NewRelease[];
  raw_new_releases: NewRelease[];
  quick_picks: any[];
  "promo:vx:data:68": TopPlaylists[];
  "promo:vx:data:209": TopPlaylists[];
  "promo:vx:data:76": TopPlaylists[];
  "promo:vx:data:185": TopPlaylists[];
  "promo:vx:data:69": TopPlaylists[];
  "promo:vx:data:107": TopPlaylists[];
  "promo:vx:data:113": TopPlaylists[];
  radio: Radio[];
  artist_recos: {
    title: string;
    subtitle?: string;
    data: ArtistRecos[];
  };
  city_mod: {
    title: string;
    subtitle: string;
    data: any[];
  };
  charts: Charts[];
  modules: Modules;
}

export interface Lists {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g., "playlist"
  image: string;
  url: string;
  play_count?: string;
  song_count?: string;
  year?: string;
  perma_url?: string;
  more_info: {
    music?: string;
    album?: string;
    album_id?: string;
    song_count?: string;
    album_url?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;
    has_lyrics?: string;
    lyrics_snippet?: string;
    copyright_text?: string;
    artistMap?: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
    release_date?: string;
  };
  explicit_content: string; // "0" for false, "1" for true
  mini_obj: boolean;
  language: string;
  release_date?: string;
}

export interface SpecialForYou {
  id: string;
  title: string;
  subtitle: string;
  header_desc?: string;
  image?: string;
  perma_url: string;
  type: string;
  list_count?: string;
  list: Lists[];
  more_info?: {
    uid?: string;
  };
}

export interface ArtistType {
  id?: string;
  artistId?: string;
  name: string;
  subtitle?: string;
  url?: string;
  type: string;
  image: Image[];
  followerCount?: string;
  follower_count?: string;
  fanCount?: string | null;
  fan_count?: string | null;
  isVerified: string | boolean | null;
  dominantLanguage: string | null;
  dominantType: string | null;
  bio: {
    text: string;
    title: string;
    sequence: number;
  }[];
  dob: string | null;
  fb: string | null;
  twitter: string | null;
  wiki: string | null;
  urls?: {
    albums: string;
    bio: string;
    comments: string;
    songs: string;
    overview: string;
  };
  availableLanguages: string[] | null;
  isRadioPresent?: boolean | string | null;
  topSongs: SongType[];
  topAlbums: AlbumType[];
  dedicated_artist_playlist?: TopPlaylists[];
  featured_artist_playlist?: TopPlaylists[];
  singles: singleType[];
  latest_release?: TopPlaylists[];
  similarArtists: similarArtistsType[];
  topEpisodes?: TopPlaylists[];
  modules?: {
    topSongs?: {
      title: string;
      subtitle: string;
    };
    latest_release?: {
      title: string;
      subtitle: string;
    };
    topAlbums?: {
      title: string;
      subtitle: string;
    };
    dedicated_artist_playlist?: {
      title: string;
      subtitle: string;
    };
    featured_artist_playlist?: {
      title: string;
      subtitle: string;
    };
    singles?: {
      title: string;
      subtitle: string;
    };
  };
}
export interface SongType {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  header_desc?: string;
  perma_url?: string | null;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: string | null;
  label: string | null;
  explicitContent: string | null;
  playCount: string | null;
  language: string | null;
  hasLyrics: string | null;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  more_info?: {
    music?: string | null;
    song_count?: string | number | null;
    album?: string | null;
    album_id?: string | null;
    label?: string | null;
    album_url?: string | null;
    has_lyrics?: string | boolean | null;
    lyrics_snippet?: string | null;
    copyright_text?: string | null;
    artistMap?: {
      primary?: TrendingArtist[];
      featured?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
  };
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary?: TrendingArtist[];
    featured?: TrendingArtist[];
    all?: TrendingArtist[];
    artists?: TrendingArtist[];
  };
  image: Image[];
  downloadUrl?: Image[];
}
export interface AlbumType {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  header_desc?: string;
  description: string | null;
  year: string | null;
  type: string | null;
  playCount: string | null;
  language: string | null;
  explicitContent: string | null;
  more_info?: {
    query?: string | null;
    text?: string | null;
    music?: string;
    song_count?: string | number;
    artistMap?: {
      primary_artists?: TrendingArtist[];
      featured_artists?: TrendingArtist[];
      all?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
  };
  artists: {
    primary?: TrendingArtist[];
    featured?: TrendingArtist[];
    all?: TrendingArtist[];
    artists?: TrendingArtist[];
  };
  songCount: string | null;
  url: string;
  image: Image[];
  songs: SongType[];
}
export interface singleType {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  header_desc?: string | null;
  type: string;
  perma_url?: string | null;
  year: null | string;
  releaseDate: null | string;
  duration: null | string;
  label: null | string;
  explicitContent: string | boolean;
  playCount?: null | string;
  play_count?: string | null;
  explicit_content?: string | boolean;
  list_count?: string | null;
  list_type?: string | null;
  more_info?: {
    query?: string | null;
    text?: string | null;
    music?: string | null;
    song_count?: string | null;
    language?: string | null;
    region?: string | null;
    station_display_text?: string | null;
    follower_count?: string | null;
    last_updated?: string | null;
    uid?: string | null;
    artistMap: {
      primary_artists?: TrendingArtist[];
      featured_artists?: TrendingArtist[];
      artists?: TrendingArtist[];
    };
    release_date?: string | null;
  };
  language: string;
  hasLyrics: true;
  lyricsId: null;
  url: string;
  copyright: null;
  album: {
    id: null;
    name: null;
    url: null;
  };
  artists: {
    primary?: TrendingArtist[];
    featured?: TrendingArtist[];
    all?: TrendingArtist[];
    artists?: TrendingArtist[];
  };
  image: Image[] | string;
  downloadUrl: Image[];
}
export interface similarArtistsType {
  id: string;
  name: string;
  url: string;
  perma_url?: string | null;
  image: Image[];
  image_url?: Image[];
  languages: {
    additionalProperty: string;
  };
  wiki?: string;
  fb?: string;
  twitter?: string;
  dob?: string;
  isRadioPresent: boolean;
  type?: string;
  dominantType?: string;
  dominantLanguage?: string;
  aka?: string;
  bio?: string | null;
  similarArtists?: TrendingArtist[];
}
export interface Image {
  quality: string;
  url: string;
}
