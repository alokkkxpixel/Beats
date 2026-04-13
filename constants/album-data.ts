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
}

export const ALBUMS: Album[] = [
  {
    id: "1",
    title: "After Hours",
    artist: "The Weeknd",
    year: "2020",
    cover:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop",
    description:
      "After Hours is the fourth studio album by Canadian singer The Weeknd, released on March 20, 2020, by XO and Republic Records.",
    tracks: [
      {
        id: "t1",
        title: "Alone Again",
        artist: "The Weeknd",
        duration: "4:10",
        plays: "150M",
      },
      {
        id: "t2",
        title: "Too Late",
        artist: "The Weeknd",
        duration: "3:59",
        plays: "120M",
      },
      {
        id: "t3",
        title: "Hardest To Love",
        artist: "The Weeknd",
        duration: "3:31",
        plays: "95M",
      },
      {
        id: "t4",
        title: "Scared To Live",
        artist: "The Weeknd",
        duration: "3:11",
        plays: "210M",
      },
      {
        id: "t5",
        title: "Snowchild",
        artist: "The Weeknd",
        duration: "4:07",
        plays: "88M",
      },
      {
        id: "t6",
        title: "Escape from LA",
        artist: "The Weeknd",
        duration: "5:55",
        plays: "75M",
      },
      {
        id: "t7",
        title: "Heartless",
        artist: "The Weeknd",
        duration: "3:18",
        plays: "890M",
      },
      {
        id: "t8",
        title: "Faith",
        artist: "The Weeknd",
        duration: "4:43",
        plays: "110M",
      },
      {
        id: "t9",
        title: "Blinding Lights",
        artist: "The Weeknd",
        duration: "3:20",
        plays: "3.4B",
      },
      {
        id: "t10",
        title: "In Your Eyes",
        artist: "The Weeknd",
        duration: "3:57",
        plays: "650M",
      },
    ],
  },
  {
    id: "2",
    title: "Divide (÷)",
    artist: "Ed Sheeran",
    year: "2017",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
    description:
      "÷ is the third studio album by English singer-songwriter Ed Sheeran, released on 3 March 2017.",
    tracks: [
      {
        id: "e1",
        title: "Eraser",
        artist: "Ed Sheeran",
        duration: "3:47",
        plays: "180M",
      },
      {
        id: "e2",
        title: "Castle on the Hill",
        artist: "Ed Sheeran",
        duration: "4:21",
        plays: "950M",
      },
      {
        id: "e3",
        title: "Dive",
        artist: "Ed Sheeran",
        duration: "3:58",
        plays: "310M",
      },
      {
        id: "e4",
        title: "Shape of You",
        artist: "Ed Sheeran",
        duration: "3:53",
        plays: "3.6B",
      },
      {
        id: "e5",
        title: "Perfect",
        artist: "Ed Sheeran",
        duration: "4:23",
        plays: "2.8B",
      },
      {
        id: "e6",
        title: "Galway Girl",
        artist: "Ed Sheeran",
        duration: "2:50",
        plays: "1.1B",
      },
      {
        id: "e7",
        title: "Happier",
        artist: "Ed Sheeran",
        duration: "3:27",
        plays: "780M",
      },
      {
        id: "e8",
        title: "New Man",
        artist: "Ed Sheeran",
        duration: "3:09",
        plays: "240M",
      },
    ],
  },
  {
    id: "3",
    title: "Midnights",
    artist: "Taylor Swift",
    year: "2022",
    cover:
      "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=800&fit=crop",
    description:
      "Midnights is the tenth studio album by American singer-songwriter Taylor Swift, released on October 21, 2022.",
    tracks: [
      {
        id: "ts1",
        title: "Lavender Haze",
        artist: "Taylor Swift",
        duration: "3:22",
        plays: "410M",
      },
      {
        id: "ts2",
        title: "Maroon",
        artist: "Taylor Swift",
        duration: "3:38",
        plays: "290M",
      },
      {
        id: "ts3",
        title: "Anti-Hero",
        artist: "Taylor Swift",
        duration: "3:20",
        plays: "980M",
      },
      {
        id: "ts4",
        title: "Snow On The Beach",
        artist: "Taylor Swift",
        duration: "4:16",
        plays: "250M",
      },
      {
        id: "ts5",
        title: "You're On Your Own, Kid",
        artist: "Taylor Swift",
        duration: "3:14",
        plays: "320M",
      },
      {
        id: "ts6",
        title: "Midnight Rain",
        artist: "Taylor Swift",
        duration: "2:54",
        plays: "380M",
      },
      {
        id: "ts7",
        title: "Bejeweled",
        artist: "Taylor Swift",
        duration: "3:14",
        plays: "270M",
      },
    ],
  },
  {
    id: "4",
    title: "Divide (÷)",
    artist: "Ed Sheeran",
    year: "2017",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
    description:
      "÷ is the third studio album by English singer-songwriter Ed Sheeran, released on 3 March 2017.",
    tracks: [
      {
        id: "e1",
        title: "Eraser",
        artist: "Ed Sheeran",
        duration: "3:47",
        plays: "180M",
      },
      {
        id: "e2",
        title: "Castle on the Hill",
        artist: "Ed Sheeran",
        duration: "4:21",
        plays: "950M",
      },
      {
        id: "e3",
        title: "Dive",
        artist: "Ed Sheeran",
        duration: "3:58",
        plays: "310M",
      },
      {
        id: "e4",
        title: "Shape of You",
        artist: "Ed Sheeran",
        duration: "3:53",
        plays: "3.6B",
      },
      {
        id: "e5",
        title: "Perfect",
        artist: "Ed Sheeran",
        duration: "4:23",
        plays: "2.8B",
      },
      {
        id: "e6",
        title: "Galway Girl",
        artist: "Ed Sheeran",
        duration: "2:50",
        plays: "1.1B",
      },
      {
        id: "e7",
        title: "Happier",
        artist: "Ed Sheeran",
        duration: "3:27",
        plays: "780M",
      },
      {
        id: "e8",
        title: "New Man",
        artist: "Ed Sheeran",
        duration: "3:09",
        plays: "240M",
      },
    ],
  },
  {
    id: "5",
    title: "Midnights",
    artist: "Taylor Swift",
    year: "2022",
    cover:
      "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=800&fit=crop",
    description:
      "Midnights is the tenth studio album by American singer-songwriter Taylor Swift, released on October 21, 2022.",
    tracks: [
      {
        id: "ts1",
        title: "Lavender Haze",
        artist: "Taylor Swift",
        duration: "3:22",
        plays: "410M",
      },
      {
        id: "ts2",
        title: "Maroon",
        artist: "Taylor Swift",
        duration: "3:38",
        plays: "290M",
      },
      {
        id: "ts3",
        title: "Anti-Hero",
        artist: "Taylor Swift",
        duration: "3:20",
        plays: "980M",
      },
      {
        id: "ts4",
        title: "Snow On The Beach",
        artist: "Taylor Swift",
        duration: "4:16",
        plays: "250M",
      },
      {
        id: "ts5",
        title: "You're On Your Own, Kid",
        artist: "Taylor Swift",
        duration: "3:14",
        plays: "320M",
      },
      {
        id: "ts6",
        title: "Midnight Rain",
        artist: "Taylor Swift",
        duration: "2:54",
        plays: "380M",
      },
      {
        id: "ts7",
        title: "Bejeweled",
        artist: "Taylor Swift",
        duration: "3:14",
        plays: "270M",
      },
    ],
  },
];
