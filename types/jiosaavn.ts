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
  url: string;
  copyright: string | null;
  album: SongAlbumInfo;
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
  play_count?: string;
  more_info: {
    firstname?: string;
    song_count?: string;
    follower_count?: string;
    last_updated?: number | string;
    uid?: string;
    editorial_language?: string;
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
  artist_recos: ArtistRecos[];
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
    music?:string;
    album?:string;
    album_id?:string;
    song_count?: string;
    album_url?:string;
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
  title:string,
  subtitle:string,
  header_desc?:string,
  image?:string,
  perma_url:string,
  type:string,
  list_count?:string,
  list:Lists[],
  more_info?:{
    uid?:string, 
  }
  
}