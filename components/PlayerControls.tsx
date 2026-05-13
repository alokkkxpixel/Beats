import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  RepeatMode,
  TrackPlayer,
} from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";

const PlayerControls = React.memo(() => {
  // FIX: Removed native hooks (useOnPlaybackStateChange).
  // We now use the synced `isPlaying` state from the store.
  const { 
    expandQueue, 
    isShuffleEnabled, 
    toggleShuffle, 
    isPlaying 
  } = usePlayerStore(
    useShallow((s) => ({
      expandQueue: s.expandQueue,
      isShuffleEnabled: s.isShuffleEnabled,
      toggleShuffle: s.toggleShuffle,
      isPlaying: s.isPlaying,
    }))
  );

  const [repeatMode, setRepeatMode] = React.useState<RepeatMode>("off");

  useEffect(() => {
    // Initial fetch of repeat mode
    const fetchRepeatMode = async () => {
      const mode = await TrackPlayer.getRepeatMode();
      setRepeatMode(mode);
    };
    fetchRepeatMode();
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
    const currentMode = await TrackPlayer.getRepeatMode();
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
});
