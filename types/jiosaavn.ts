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
  id: string;
  name: string;
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

// New Album Item
export interface NewAlbumItem {
  query: string;
  text: string;
  year: string;
  image: string;
  albumid: string;
  title: string;
  Artist: {
    music: MusicContributor[];
  };
  weight: number;
  language: string;
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
// Root Object
export interface RootResponse {
  new_trending: TrendingItem[];
  top_playlists: PlaylistItem[];
  new_albums: NewAlbumItem[];
  charts: ChartItem[];
}