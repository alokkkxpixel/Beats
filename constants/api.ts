export const MUSIC_API_URL =
  process.env.EXPO_PUBLIC_MUSIC_API_URL || "https://www.jiosaavn.com/api.php";

export const LRCLIB_API_URL = (
  process.env.EXPO_PUBLIC_LRCLIB_API_URL || "https://lrclib.net"
).replace(/\/+$/, "");
