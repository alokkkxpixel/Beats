import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  RepeatMode,
  TrackPlayer,
  useOnPlaybackStateChange,
} from "react-native-nitro-player";
const { width } = Dimensions.get("window");
// ─── PlayerControls ───────────────────────────────────────────────────────────
// Owns ALL playback state: isPlaying, shuffle, repeat.
// BEFORE this fix: play/pause re-rendered the entire 750-line FullPlayer tree.
// AFTER: only this ~60-line component re-renders. Everything else stays frozen.
const PlayerControls = React.memo(() => {
  const expandQueue = usePlayerStore((s) => s.expandQueue);

  const playbackState = useOnPlaybackStateChange();
  const isPlaying = playbackState.state === "playing";

  const isShuffleEnabled = usePlayerStore((s) => s.isShuffleEnabled);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const [repeatMode, setRepeatMode] = React.useState<RepeatMode>("off");

  useEffect(() => {
    setRepeatMode(TrackPlayer.getRepeatMode());
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }, [isPlaying]);

  const next = useCallback(async () => {
    await TrackPlayer.skipToNext();
  }, []);

  const previous = useCallback(async () => {
    await TrackPlayer.skipToPrevious();
  }, []);

  const cycleRepeatMode = useCallback(async () => {
    const currentMode = TrackPlayer.getRepeatMode();
    const nextMode: RepeatMode =
      currentMode === "off"
        ? "Playlist"
        : currentMode === "Playlist"
          ? "track"
          : "off";
    await TrackPlayer.setRepeatMode(nextMode);
    setRepeatMode(nextMode);
  }, []);

  const repeatIconName = repeatMode === "track" ? "repeat-one" : "repeat";
  const repeatIconColor = repeatMode === "off" ? "#A3A3A3" : "#1DB954";

  return (
    <>
      <View style={styles.mainControls}>
        <Pressable onPress={toggleShuffle} hitSlop={12}>
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffleEnabled ? "#1DB954" : "#A3A3A3"}
          />
        </Pressable>
        <Pressable onPress={previous}>
          <Ionicons name="play-skip-back" size={38} color="white" />
        </Pressable>
        <Pressable style={styles.playButton} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="black"
          />
        </Pressable>
        <Pressable onPress={next}>
          <Ionicons name="play-skip-forward" size={38} color="white" />
        </Pressable>
        <Pressable onPress={cycleRepeatMode} hitSlop={12}>
          <MaterialIcons
            name={repeatIconName}
            size={24}
            color={repeatIconColor}
          />
        </Pressable>
      </View>

      <View style={styles.footerControls}>
        <View style={styles.deviceIndicator}>
          <MaterialIcons name="speaker" size={16} color="#1DB954" />
          <Text style={styles.deviceText}>SPEAKER</Text>
        </View>
        <View style={styles.footerRightIcons}>
          <Ionicons
            name="share-outline"
            size={22}
            color="white"
            style={{ marginRight: 25 }}
          />
          <Pressable onPress={expandQueue}>
            <MaterialIcons name="playlist-play" size={28} color="white" />
          </Pressable>
        </View>
      </View>
    </>
  );
});

export default PlayerControls;

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
