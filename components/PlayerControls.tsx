import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

import { useDownloadStore } from "@/src/store/useDownloadStore";
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
import DownloadOfflineIcon from "@/assets/app-icons/downloadOffline.svg";
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
import Toast from "react-native-toast-message";

const PlayerControls = React.memo(() => {
  // FIX: Removed native hooks (useOnPlaybackStateChange).
  // We now use the synced `isPlaying` state from the store.
  const {
    currentTrack,
    expandQueue,
    expandAudioDevice,
    isShuffleEnabled,
    toggleShuffle,
    isPlaying,
    isLoading,
  } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      expandQueue: s.expandQueue,
      expandAudioDevice: s.expandAudioDevice,
      isShuffleEnabled: s.isShuffleEnabled,
      toggleShuffle: s.toggleShuffle,
      isPlaying: s.isPlaying,
      isLoading: s.isLoading,
    })),
  );

  const {
    downloadTrack,
    deleteDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    checkDownloadStatus,
    getDownloadProgress,
    downloadedTracks,
  } = useDownloadStore();

  useEffect(() => {
    if (currentTrack?.id) {
      checkDownloadStatus(currentTrack.id);
    }
  }, [currentTrack?.id, checkDownloadStatus]);

  const isDownloaded = currentTrack?.id
    ? downloadedTracks.has(currentTrack.id)
    : false;
  const progress = currentTrack?.id
    ? getDownloadProgress(currentTrack.id)
    : undefined;

  const handleDownloadPress = useCallback(async () => {
    if (!currentTrack) return;

    if (isDownloaded) {
      return;
    }

    if (progress?.state === "downloading") {
      await pauseDownload(progress.downloadId);
      ToastAndroid.show("Download paused", ToastAndroid.LONG);
      return;
    }

    if (progress?.state === "paused") {
      await resumeDownload(progress.downloadId);

      ToastAndroid.show("Download resumed", ToastAndroid.LONG);
      return;
    }

    if (progress?.state === "pending" || progress?.state === "failed") {
      await cancelDownload(progress.downloadId);
    }

    Toast.show({
      type: "success",
      text1: "Downloading started !",
      text2: "Check your downloads for more info",
    });
    ToastAndroid.show("Download started", ToastAndroid.LONG);
    await downloadTrack(currentTrack);
  }, [
    currentTrack,
    isDownloaded,
    progress,
    downloadTrack,
    deleteDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
  ]);

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
            prevActiveId.current = activeDevice?.id ?? null;
          }
          return newDevices;
        }

        return prev;
      });
    };

    fetchDevices();
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

  const renderDownloadIcon = () => {
    if (isDownloaded) {
      return <DownloadOfflineIcon width={28} height={28} fill="white" />;
    }

    if (progress?.state === "downloading" || progress?.state === "pending") {
      const pct = Math.round((progress.progress || 0) * 100);
      return (
        <View className="flex-row items-center">
          <ActivityIndicator
            size="small"
            color="#3b82f6"
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: "#3b82f6", fontSize: 12, fontWeight: "600" }}>
            {pct}%
          </Text>
        </View>
      );
    }

    if (progress?.state === "paused") {
      const pct = Math.round((progress.progress || 0) * 100);
      return (
        <View className="flex-row items-center">
          <DownloadCircleIcon
            width={24}
            height={24}
            fill="#f59e0b"
            style={{ marginRight: 4 }}
          />
          <Text style={{ color: "#f59e0b", fontSize: 12, fontWeight: "600" }}>
            {pct}%
          </Text>
        </View>
      );
    }

    return (
      <DownloadCircleIcon width={28} height={28} fill="white" opacity={0.5} />
    );
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
          onPress={handleDownloadPress}
          hitSlop={10}
        >
          {renderDownloadIcon()}
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
