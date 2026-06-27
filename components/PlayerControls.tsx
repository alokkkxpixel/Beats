import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View
} from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  AudioDevices,
  RepeatMode,
  TAudioDevice,
  TrackPlayer,
} from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";

// Import SVGs
import DownloadCircleIcon from "@/assets/app-icons/download-circle.svg";
import PauseIcon from "@/assets/app-icons/pause.svg";
import PlayIcon from "@/assets/app-icons/play.svg";
import QueueIcon from "@/assets/app-icons/queue.svg";
import RepeatOnIcon from "@/assets/app-icons/repeat-on.svg";
import RepeatOneIcon from "@/assets/app-icons/repeat-one.svg";
import RepeatIcon from "@/assets/app-icons/repeat.svg";
import ShuffleIcon from "@/assets/app-icons/shuffle.svg";
import SkipNextIcon from "@/assets/app-icons/skip-next.svg";
import SkipPreviousIcon from "@/assets/app-icons/skip-previous.svg";
import SpeckerGroup from "@/assets/app-icons/speaker-group.svg";
const PlayerControls = React.memo(() => {
  // FIX: Removed native hooks (useOnPlaybackStateChange).
  // We now use the synced `isPlaying` state from the store.
  const {
    expandQueue,
    expandAudioDevice,
    isShuffleEnabled,
    toggleShuffle,
    isPlaying,
    isLoading,
  } = usePlayerStore(
    useShallow((s) => ({
      expandQueue: s.expandQueue,
      expandAudioDevice: s.expandAudioDevice,
      isShuffleEnabled: s.isShuffleEnabled,
      toggleShuffle: s.toggleShuffle,
      isPlaying: s.isPlaying,
      isLoading: s.isLoading,
    })),
  );

  const [repeatMode, setRepeatMode] = React.useState<RepeatMode>("off");
  const [devices, setDevices] = React.useState<TAudioDevice[]>([]);

  useEffect(() => {
    // Initial fetch of repeat mode
    const fetchRepeatMode = async () => {
      const mode = await TrackPlayer.getRepeatMode();
      setRepeatMode(mode);
    };
    fetchRepeatMode();
  }, []);

  const prevActiveId = useRef<number | null>(null);

  useEffect(() => {
    const fetchDevices = () => {
      const newDevices = AudioDevices?.getAudioDevices() ?? [];

      setDevices((prev) => {
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(newDevices);

        if (hasChanged) {
          const activeDevice = newDevices.find((d) => d.isActive);

          if (prevActiveId.current !== activeDevice?.id) {
            // console.log(
            //   "Audio output changed:",
            //   activeDevice?.name ?? "Speaker",
            // );

            prevActiveId.current = activeDevice?.id ?? null;
          }
          // console.log("Audio output changed1:", activeDevice);
          return newDevices;
        }

        return prev;
      });
    };
    //
    // Initial fetch
    fetchDevices();

    // Poll every second
    const interval = setInterval(fetchDevices, 1000);

    return () => clearInterval(interval);
  }, []);
  const activeDevice = devices.find((d) => d.isActive);

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
      return <RepeatOneIcon width={24} height={24} fill="#FFF" />;
    if (repeatMode === "Playlist")
      return <RepeatOnIcon width={24} height={24} fill="#fff" />;
    return <RepeatIcon width={24} height={24} fill="#A3A3A3" />;
  };

  return (
    <>
      <View style={styles.mainControls}>
        <Pressable onPress={toggleShuffle} hitSlop={15}>
          <ShuffleIcon
            width={25}
            height={25}
            fill={isShuffleEnabled ? "#fff" : "#A3A3A3"}
          />
        </Pressable>
        <Pressable onPress={previous}>
          <SkipPreviousIcon width={50} height={50} fill="white" />
        </Pressable>
        <Pressable
          style={styles.playButton}
          onPress={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="white"
              style={{ width: 70, height: 70 }}
            />
          ) : isPlaying ? (
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
        <Pressable
          style={styles.deviceIndicator}
          hitSlop={10}
        >
          <View className="w-4 h-4 rounded-full bg-[#333333] items-center justify-center mr-2">
            <DownloadCircleIcon width={28} height={28} fill="white" opacity={0.5} />
          </View>
         
        </Pressable>
        <View style={styles.footerRightIcons}>
         <Pressable
          style={styles.deviceIndicator}
          onPress={expandAudioDevice}
          className="mr-3"
          hitSlop={10}
        >
          {/* Keep MaterialIcons for system-like icons if desired, or replace if SVG exists */}
          <View className="w-4 h-4 rounded-full items-center justify-center mr-2">
            <SpeckerGroup width={20} height={20} fill="white" />
          </View>
         
        </Pressable>
          <Pressable onPress={expandQueue}>
            <QueueIcon width={35} height={35} fill="white" />
          </Pressable>
        </View>
      </View>
    </>
  );
});
PlayerControls.displayName = "PlayerControls";

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
    marginVertical: 20,
  },
  deviceIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  footerRightIcons: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
