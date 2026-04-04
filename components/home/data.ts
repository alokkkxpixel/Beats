import { HomeSection, Playlist, QuickPick, SpeedDialItem } from "./types";

export const quickPickColumns: QuickPick[][] = [
  [
    {
      id: "neon-drift",
      title: "Neon Drift",
      artist: "Synthwave Collective",
      cover:
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "midnight-echo",
      title: "Midnight Echo",
      artist: "Luna Ray",
      cover:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "glass-pillars",
      title: "Glass Pillars",
      artist: "The Architect",
      cover:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "solar-flare",
      title: "Solar Flare",
      artist: "Dune Walker",
      cover:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    },
  ],
  [
    {
      id: "ocean-pulse",
      title: "Ocean Pulse",
      artist: "Blue Current",
      cover:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "night-driver",
      title: "Night Driver",
      artist: "Chrome Hearts",
      cover:
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "electric-sky",
      title: "Electric Sky",
      artist: "Static Bloom",
      cover:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "dream-runnr",
      title: "Dream Runner",
      artist: "Nova Lane",
      cover:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    },
  ],
  [
    {
      id: "non-drft",
      title: "Neon Drift",
      artist: "Synthwave Collective",
      cover:
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "midight-cho",
      title: "Midnight Echo",
      artist: "Luna Ray",
      cover:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "glas-pilars",
      title: "Glass Pillars",
      artist: "The Architect",
      cover:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "solar-fare",
      title: "Solar Flare",
      artist: "Dune Walker",
      cover:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    },
  ],
];

export const speedDialItems: SpeedDialItem[] = [
  {
    id: "for-you",
    title: "For You",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "solstice",
    title: "Solstice",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "kairos",
    title: "Kairos",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "retro",
    title: "Retro",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=400&q=80",
  },
];

export const playlists: Playlist[] = [
  {
    id: "misty-mornings",
    title: "Misty Mornings",
    description: "The best indie folk for those early starts.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "street-rhythm",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "street-rhthm",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "street-rhyth",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stree-rhythm",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s=tret-rhythm",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stret-rhythm",
    title: "Street Rhythm",
    description: "Underground hip-hop and late-night urban beats.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80",
  },
];

export const homeSections: HomeSection[] = [
  { id: "quick-picks", type: "quickPicks" },
  { id: "speed-dial", type: "speedDial" },
  { id: "trending", type: "trending" },
];
