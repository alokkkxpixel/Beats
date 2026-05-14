import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { RepeatMode, TrackPlayer } from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";

// Import SVGs
import PauseIcon from "@/assets/app-icons/pause.svg";
import PlayIcon from "@/assets/app-icons/play.svg";
import QueueIcon from "@/assets/app-icons/queue.svg";
import RepeatOnIcon from "@/assets/app-icons/repeat-on.svg";
import RepeatOneIcon from "@/assets/app-icons/repeat-one.svg";
import RepeatIcon from "@/assets/app-icons/repeat.svg";
import ShareIcon from "@/assets/app-icons/share.svg"; // Fallback for share if not found
import ShuffleIcon from "@/assets/app-icons/shuffle.svg";
import SkipNextIcon from "@/assets/app-icons/skip-next.svg";
import SkipPreviousIcon from "@/assets/app-icons/skip-previous.svg";
import SpeakerIcon from "@/assets/app-icons/speaker.svg";

const PlayerControls = React.memo(() => {
  // FIX: Removed native hooks (useOnPlaybackStateChange).
  // We now use the synced `isPlaying` state from the store.
  const { expandQueue, isShuffleEnabled, toggleShuffle, isPlaying } =
    usePlayerStore(
      useShallow((s) => ({
        expandQueue: s.expandQueue,
        isShuffleEnabled: s.isShuffleEnabled,
        toggleShuffle: s.toggleShuffle,
        isPlaying: s.isPlaying,
      })),
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

  const renderRepeatIcon = () => {
    if (repeatMode === "track")
      return <RepeatOneIcon width={24} height={24} fill="#1DB954" />;
    if (repeatMode === "Playlist")
      return <RepeatOnIcon width={24} height={24} fill="#1DB954" />;
    return <RepeatIcon width={24} height={24} fill="#A3A3A3" />;
  };

  return (
    <>
      <View style={styles.mainControls}>
        <Pressable onPress={toggleShuffle} hitSlop={12}>
          <ShuffleIcon
            width={24}
            height={24}
            fill={isShuffleEnabled ? "#1DB954" : "#A3A3A3"}
          />
        </Pressable>
        <Pressable onPress={previous}>
          <SkipPreviousIcon width={50} height={50} fill="white" />
        </Pressable>
        <Pressable style={styles.playButton} onPress={togglePlay}>
          {isPlaying ? (
            <PauseIcon width={70} height={70} fill="white" />
          ) : (
            <PlayIcon width={70} height={70} fill="white" />
          )}
        </Pressable>
        <Pressable onPress={next}>
          <SkipNextIcon width={50} height={50} fill="white" />
        </Pressable>
        <Pressable onPress={cycleRepeatMode} hitSlop={12}>
          {renderRepeatIcon()}
        </Pressable>
      </View>

      <View style={styles.footerControls}>
        <View style={styles.deviceIndicator}>
          {/* Keep MaterialIcons for system-like icons if desired, or replace if SVG exists */}
          <View className="w-4 h-4 rounded-full items-center justify-center mr-2">
            <SpeakerIcon width={18} height={18} fill="#1DB954" />
          </View>
          <Text style={styles.deviceText}>SPEAKER</Text>
        </View>
        <View style={styles.footerRightIcons}>
          <ShareIcon
            width={22}
            height={22}
            fill="white"
            style={{ marginRight: 25 }}
          />
          <Pressable onPress={expandQueue}>
            <QueueIcon width={28} height={28} fill="white" />
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
    // width: 75,
    // height: 75,
    // borderRadius: 38,
    // backgroundColor: "white",
    // borderWidth: 2,
    // borderColor: "white",
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
