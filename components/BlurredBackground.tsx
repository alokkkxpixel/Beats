import { usePlayerStore } from "@/src/store/usePlayerStore";
import { handleCloseSheet } from "@/src/utils/helper";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useNowPlaying } from "react-native-nitro-player";
const { height, width: windowWidth } = useWindowDimensions();

// FullPlayer only reads track identity — zero playback state here.
// play/pause, shuffle, repeat all live in PlayerControls below.
const nowPlaying = useNowPlaying();
const currentTrack = nowPlaying.currentTrack;

const originalSong = (currentTrack as any)?.extraPayload?.song || currentTrack;
const artistName =
  originalSong?.primaryArtists ||
  currentTrack?.artist ||
  originalSong?.subtitle ||
  "Unknown Artist";

// Only the actions that the parent shell actually needs
const expandMoreOption = usePlayerStore((s) => s.expandMoreOption);
const setSelectedSongOption = usePlayerStore((s) => s.setSelectedSongOption);
const expandQueue = usePlayerStore((s) => s.expandQueue);

const router = useRouter();

// ─── FIX #3 cont: useCallback for navigation and image helpers ────────────
const navigateToArtist = useCallback(
  (artist: any) => {
    if (artist?.id) {
      handleCloseSheet();
      router.push({
        pathname: "/artist/[id]",
        params: { id: artist.id, url: artist.url || artist.perma_url },
      });
    }
  },
  [handleCloseSheet, router],
);

const handleArtistPress = useCallback(() => {
  const artist = originalSong?.artists?.primary?.[0];
  navigateToArtist(artist);
}, [originalSong, navigateToArtist]);

const getArtistImage = useCallback(() => {
  const rawImage = originalSong?.artists?.primary?.[0]?.image;
  let url = "";

  if (Array.isArray(rawImage)) {
    url = rawImage[2]?.url || rawImage[1]?.url || rawImage[0]?.url || "";
  } else if (typeof rawImage === "string") {
    url = rawImage;
  }

  if (
    !url ||
    url.includes("share-image-2.png") ||
    url.includes("default-artist")
  ) {
    return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
  }
  return url;
}, [originalSong]);
// ─────────────────────────────────────────────────────────────────────────

const trackImage =
  originalSong?.image?.[2]?.url ||
  currentTrack?.artwork ||
  originalSong?.image?.[0]?.url;
const BlurredBackground = React.memo(() => (
  <View
    style={{
      height: height + 100,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    <Image
      source={{ uri: trackImage }}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      blurRadius={10}
      cachePolicy="memory-disk"
    />
    <LinearGradient
      colors={[
        "rgba(5,5,5,0.2)",
        "rgba(5,5,5,0.8)",
        "rgba(5,5,5,0.9)",
        "#050505",
      ]}
      style={StyleSheet.absoluteFill}
    />
  </View>
));

export default BlurredBackground;

const styles = StyleSheet.create({});
