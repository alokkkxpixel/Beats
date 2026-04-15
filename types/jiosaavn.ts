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
