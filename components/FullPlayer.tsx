import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useNowPlaying } from "react-native-nitro-player";
// import BlurredBackground from "./BlurredBackground";
import { LinearGradient } from "expo-linear-gradient";
import PlayerControls from "./PlayerControls";
import ProgressSection from "./ProgressSection";
const { width } = Dimensions.get("window");

// ─── FIX #1: Module-level util — not recreated on every render ───────────────
const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins}:${s < 10 ? "0" : ""}${s}`;
};

// ─────────────────────────────────────────────────────────────────────────────

const FullPlayer = ({
  handleCloseSheet,
  handleCloseMoreSheet,
}: {
  handleCloseSheet: () => void;
  handleCloseMoreSheet: () => void;
}) => {
  const { height, width: windowWidth } = useWindowDimensions();

  // FullPlayer only reads track identity — zero playback state here.
  // play/pause, shuffle, repeat all live in PlayerControls below.
  const nowPlaying = useNowPlaying();
  const currentTrack = nowPlaying.currentTrack;

  const originalSong =
    (currentTrack as any)?.extraPayload?.song || currentTrack;
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

  if (!currentTrack) {
    return null;
  }

  const trackImage =
    originalSong?.image?.[2]?.url ||
    currentTrack.artwork ||
    originalSong?.image?.[0]?.url;

  const label = originalSong?.label;
  const copyright = originalSong?.copyright;
  const aboutArtist =
    originalSong?.artists?.primary?.[0]?.name ||
    originalSong?.artist ||
    currentTrack?.artist ||
    "Artist";
  const bioDisplayText = label || copyright || "No artist biography available.";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* FIX #4: Memoized blurred backdrop — expensive blur never re-renders */}
      <BlurredBackground imageUri={trackImage} height={height} />
      <ScrollView
        style={[styles.container, { backgroundColor: "transparent" }]}
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCloseSheet}
            style={styles.headerIconButton}
            hitSlop={20}
          >
            <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {typeof originalSong?.album === "string"
              ? originalSong.album
              : originalSong?.album?.name || currentTrack?.title}
          </Text>

          <Pressable
            style={styles.headerIconButton}
            onPress={() => {
              setSelectedSongOption(null);
              expandMoreOption();
            }}
            hitSlop={20}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </Pressable>
        </View>

        {/* --- Album Artwork --- */}
        <View style={styles.artWrapper}>
          <Image
            source={{ uri: trackImage }}
            style={styles.mainArt}
            contentFit="cover"
          />
        </View>

        {/* --- Track Info --- */}
        <View style={styles.trackInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Pressable onPress={handleArtistPress}>
              <Text style={styles.songArtist} numberOfLines={1}>
                {artistName}
              </Text>
            </Pressable>
          </View>
          <Ionicons name="heart-outline" size={28} color="white" />
        </View>

        {/* --- FIX #5: ProgressSection is fully self-contained ─────────────────
            Parent FullPlayer no longer subscribes to position/duration at all.
            All per-second re-renders are isolated inside ProgressSection only. */}
        <ProgressSection />

        {/* ── PlayerControls — the ONLY component aware of play/pause state ──
            Tapping play only re-renders this ~60-line component.
            Everything above (backdrop, artwork, track info) stays frozen. */}
        <PlayerControls />

        {/* --- Artist Card --- */}
        <Pressable style={styles.artistCard} onPress={handleArtistPress}>
          <View style={styles.artistHeader}>
            <Image
              source={{ uri: getArtistImage() }}
              style={styles.artistPhoto}
              contentFit="cover"
            />
            <Text style={styles.artistCardLabel}>ABOUT THE ARTIST</Text>
          </View>
          <View style={styles.artistDetailsBody}>
            <Text style={styles.artistNameText}>{aboutArtist}</Text>
            <Text style={styles.artistDescription}>{bioDisplayText}</Text>
          </View>
        </Pressable>

        {/* --- Credits Section --- */}
        <View style={styles.creditsCard}>
          <View>
            <Text style={styles.creditsTitle}>Credits</Text>
          </View>
          <View>
            {/* FIX #6: key only on outermost element — removed duplicate key on inner View */}
            {originalSong?.artists?.primary?.map((item: any, index: number) => (
              <Pressable
                key={`primary-${item.id ?? index}`}
                onPress={() => {
                  if (item.id) navigateToArtist(item);
                }}
              >
                <View className="flex-row justify-between items-start py-3 border-b border-gray-700 last:border-b-0">
                  <View className="flex-1 pr-3">
                    <Text className="text-white text-sm font-semibold">
                      {item.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1 capitalize">
                      {item.role.split("_").join(" ")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.id) navigateToArtist(item);
                    }}
                    className="border border-gray-500 px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs">View</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
            {originalSong?.artists?.featured?.map(
              (item: any, index: number) => (
                <Pressable
                  key={`featured-${item.id ?? index}`}
                  onPress={() => {
                    if (item?.id) navigateToArtist(item);
                  }}
                >
                  <View className="flex-row justify-between items-start py-3 border-b border-gray-700 last:border-b-0">
                    <View className="flex-1 pr-3">
                      <Text className="text-white text-sm font-semibold">
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1 capitalize">
                        {item.role.split("_").join(" ")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (item.id) navigateToArtist(item);
                      }}
                      className="border border-gray-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs">View</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ),
            )}
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

// ─── PlayerControls ───────────────────────────────────────────────────────────
// Owns ALL playback state: isPlaying, shuffle, repeat.
// BEFORE this fix: play/pause re-rendered the entire 750-line FullPlayer tree.
// AFTER: only this ~60-line component re-renders. Everything else stays frozen.
// const PlayerControls = React.memo(
//   ({ expandQueue }: { expandQueue: () => void }) => {
//     const playbackState = useOnPlaybackStateChange();
//     const isPlaying = playbackState.state === "playing";

//     const isShuffleEnabled = usePlayerStore((s) => s.isShuffleEnabled);
//     const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

//     const [repeatMode, setRepeatMode] = React.useState<RepeatMode>("off");

//     useEffect(() => {
//       setRepeatMode(TrackPlayer.getRepeatMode());
//     }, []);

//     const togglePlay = useCallback(async () => {
//       if (isPlaying) await TrackPlayer.pause();
//       else await TrackPlayer.play();
//     }, [isPlaying]);

//     const next = useCallback(async () => {
//       await TrackPlayer.skipToNext();
//     }, []);

//     const previous = useCallback(async () => {
//       await TrackPlayer.skipToPrevious();
//     }, []);

//     const cycleRepeatMode = useCallback(async () => {
//       const currentMode = TrackPlayer.getRepeatMode();
//       const nextMode: RepeatMode =
//         currentMode === "off"
//           ? "Playlist"
//           : currentMode === "Playlist"
//             ? "track"
//             : "off";
//       await TrackPlayer.setRepeatMode(nextMode);
//       setRepeatMode(nextMode);
//     }, []);

//     const repeatIconName = repeatMode === "track" ? "repeat-one" : "repeat";
//     const repeatIconColor = repeatMode === "off" ? "#A3A3A3" : "#1DB954";

//     return (
//       <>
//         <View style={styles.mainControls}>
//           <Pressable onPress={toggleShuffle} hitSlop={12}>
//             <Ionicons
//               name="shuffle"
//               size={24}
//               color={isShuffleEnabled ? "#1DB954" : "#A3A3A3"}
//             />
//           </Pressable>
//           <Pressable onPress={previous}>
//             <Ionicons name="play-skip-back" size={38} color="white" />
//           </Pressable>
//           <Pressable style={styles.playButton} onPress={togglePlay}>
//             <Ionicons
//               name={isPlaying ? "pause" : "play"}
//               size={40}
//               color="black"
//             />
//           </Pressable>
//           <Pressable onPress={next}>
//             <Ionicons name="play-skip-forward" size={38} color="white" />
//           </Pressable>
//           <Pressable onPress={cycleRepeatMode} hitSlop={12}>
//             <MaterialIcons
//               name={repeatIconName}
//               size={24}
//               color={repeatIconColor}
//             />
//           </Pressable>
//         </View>

//         <View style={styles.footerControls}>
//           <View style={styles.deviceIndicator}>
//             <MaterialIcons name="speaker" size={16} color="#1DB954" />
//             <Text style={styles.deviceText}>SPEAKER</Text>
//           </View>
//           <View style={styles.footerRightIcons}>
//             <Ionicons
//               name="share-outline"
//               size={22}
//               color="white"
//               style={{ marginRight: 25 }}
//             />
//             <Pressable onPress={expandQueue}>
//               <MaterialIcons name="playlist-play" size={28} color="white" />
//             </Pressable>
//           </View>
//         </View>
//       </>
//     );
//   },
// );

// ─── BlurredBackground ───────────────────────────────────────────────────────
// React.memo with custom comparator — only re-renders when imageUri actually changes.
// The expensive blur + gradient never fires on playback state changes.
const BlurredBackground = React.memo(
  ({ imageUri, height }: { imageUri: string; height: number }) => (
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
        source={{ uri: imageUri }}
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
  ),
  (prev, next) =>
    prev.imageUri === next.imageUri && prev.height === next.height,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7a1b16",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    height: 40,
    position: "relative",
  },
  headerIconButton: {
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 60,
    right: 60,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  artWrapper: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 40,
  },
  mainArt: {
    width: width * 0.88,
    height: width * 0.88,
    borderRadius: 8,
  },
  trackInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginRight: 20,
  },
  songTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  songArtist: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginTop: 4,
    marginBottom: 5,
  },
  progressArea: {
    paddingHorizontal: 25,
    marginTop: 5,
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    position: "relative",
  },
  fill: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    position: "absolute",
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "white",
    position: "absolute",
    marginLeft: -7,
    top: -5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginVertical: 20,
  },
  playButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  footerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginVertical: 40,
  },
  deviceIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceText: {
    color: "#1DB954",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
  },
  footerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  lyricsCard: {
    backgroundColor: "#e06126",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 15,
    padding: 20,
    minHeight: 200,
  },
  lyricsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  lyricsPreview: {
    color: "white",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },
  artistCard: {
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  artistHeader: {
    position: "relative",
    height: 200,
    width: "100%",
  },
  artistPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  artistCardLabel: {
    position: "absolute",
    top: 15,
    left: 15,
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
  artistDetailsBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  artistNameText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  artistDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
  creditsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  creditsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default FullPlayer;
