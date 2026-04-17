export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  plays: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  cover: string;
  description: string;
  tracks: Track[];
  songCount?: number;
  playCount?: number;
  explicitContent?: boolean;
}

export const ALBUMS: Album[] = [];
