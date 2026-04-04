export type QuickPick = {
  id: string;
  title: string;
  artist: string;
  cover: string;
};

export type SpeedDialItem = {
  id: string;
  title: string;
  image: string;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type HomeSection =
  | { id: "quick-picks"; type: "quickPicks" }
  | { id: "speed-dial"; type: "speedDial" }
  | { id: "trending"; type: "trending" };
