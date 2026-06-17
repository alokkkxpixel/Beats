import { Image } from "expo-image";
import React from "react";
import { Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  TrackPlayer,
  useOnPlaybackProgressChange,
} from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";

// Import SVGs
import MusicIcon from "@/assets/app-icons/album.svg";
import PauseIcon from "@/assets/app-icons/pause.svg";
import PlayIcon from "@/assets/app-icons/play.svg";

import TextTicker from "react-native-text-ticker";
import useTrackAccentColor from "../src/hooks/useTrackAccentColor";
const MiniPlayer = React.memo(function MiniPlayer() {
  // FIX: Removed all native hooks (useNowPlaying, useOnPlaybackStateChange)
  // These were likely triggering re-renders every second from the native side.
  // We now rely solely on our stable Zustand store.
  // const [accentColor, setAccentColor] = useState("#dadada");
  const { currentTrack, isPlaying } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
    })),
  );

  const originalSong =
    (currentTrack as any)?.extraPayload?.song || currentTrack;
  const isLoaded = !!currentTrack;

  if (!isLoaded) return null;

  const trackImage = isLoaded
    ? (currentTrack as any).image?.[1]?.url ||
      (originalSong as any)?.image?.[1]?.url ||
      (originalSong as any)?.image?.[0]?.url
    : "";
  const primaryArtists = (currentTrack as any)?.artists?.primary;
  const artistName = isLoaded
    ? originalSong?.primaryArtists ||
      (primaryArtists?.length
        ? primaryArtists.map((artist: any) => artist.name).join(", ")
        : null) ||
      originalSong?.subtitle ||
      "Unknown Artist"
    : "";
  const togglePlay = async () => {
    if (!isLoaded) return;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  useTrackAccentColor(trackImage);
  const accentColor = usePlayerStore((state) => state.accentColor);

  return (
    <View
      style={[
        styles.miniContainer,
        { backgroundColor: accentColor && accentColor },
      ]}
    >
      {/* <BlurredBackground height={12} accentColor={accentColor} /> */}
      <View style={styles.miniContent}>
        {trackImage ? (
          <Image
            source={{ uri: trackImage }}
            style={styles.miniArt}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.miniArt,
              {
                backgroundColor: "#333",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <MusicIcon width={24} height={24} fill="#666" />
          </View>
        )}
        <View style={styles.miniTextContainer}>
          <View style={{ height: 18, justifyContent: "center" }}>
            <TextTicker
              style={styles.miniTitle}
              duration={15000}
              animationType="scroll"
              loop
              bounce={false}
              repeatSpacer={10}
              scrollSpeed={100}
              marqueeDelay={1000}
              shouldAnimateTreshold={20}
              easing={Easing.linear}
            >
              {isLoaded
                ? (currentTrack as any).name || (originalSong as any).name
                : "Nothing to play"}
            </TextTicker>
          </View>

          <Text
            style={styles.miniArtist}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {artistName}
          </Text>
        </View>
        <View style={styles.miniControls}>
          <Pressable
            style={styles.iconSpacing}
            onPress={togglePlay}
            disabled={!isLoaded}
          >
            {isPlaying ? (
              <PauseIcon
                width={35}
                height={35}
                fill={isLoaded ? "white" : "#444"}
              />
            ) : (
              <PlayIcon
                width={35}
                height={35}
                fill={isLoaded ? "white" : "#444"}
              />
            )}
          </Pressable>
        </View>
      </View>
      <MiniProgressBar isLoaded={isLoaded} />
    </View>
  );
});

const MiniProgressBar = React.memo(({ isLoaded }: { isLoaded: boolean }) => {
  const progressData = useOnPlaybackProgressChange();
  const duration = usePlayerStore((s) => s.duration);
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    if (isLoaded && duration > 0) {
      const currentPos = progressData?.position ?? 0;
      progressValue.value = withTiming((currentPos / duration) * 100, {
        duration: 250,
      });
    } else {
      progressValue.value = 0;
    }
  }, [progressData.position, duration, isLoaded]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
    backgroundColor: isLoaded ? "#d7d7d0ff" : "transparent",
  }));

  return (
    <View style={styles.miniProgressBarBackground}>
      <Animated.View style={[styles.miniProgressBarFill, animatedStyle]} />
    </View>
  );
});
MiniProgressBar.displayName = "MiniProgressBar";

const styles = StyleSheet.create({
  miniContainer: {
    height: 70,
    // backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  miniProgressBarBackground: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  miniProgressBarFill: {
    height: 2,
  },
  miniContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  miniArt: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  miniTextContainer: {
    flex: 1,
    // backgroundColor: "red",
    marginLeft: 12,
    marginRight: 8, // gap before play button
    minWidth: 0, // important for ellipsis in flex layouts
  },
  miniTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 16, // important
    marginBottom: 0, // remove extra gap
  },
  miniArtist: {
    color: "#AAA",
    fontSize: 12,
    flexShrink: 1,
    marginTop: 0, // remove extra gap
  },
  miniControls: {
    justifyContent: "center",
    // backgroundColor: "blue",
    // height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginHorizontal: 6,
  },
});

export default MiniPlayer;
