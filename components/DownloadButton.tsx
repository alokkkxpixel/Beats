import { useDownloadStore } from "@/src/store/useDownloadStore";
import { SongDetail } from "@/types/jiosaavn";
import { Check, DownloadCloud, Pause, Play, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface DownloadButtonProps {
  track: SongDetail;
  size?: number;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  track,
  size = 24,
  onDownloadStart,
  onDownloadComplete,
}) => {
  const {
    downloadTrack,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    deleteDownload,
    getDownloadProgress,
  } = useDownloadStore();

  const isDownloaded = useDownloadStore((s) => s.downloadedTracks.has(track.id));
  const progress = getDownloadProgress(track.id);
  const wasDownloadedRef = useRef(isDownloaded);

  useEffect(() => {
    if (!wasDownloadedRef.current && isDownloaded) {
      Toast.show({ type: "success", text1: "Download complete", text2: track.name });
      onDownloadComplete?.();
    }
    wasDownloadedRef.current = isDownloaded;
  }, [isDownloaded, onDownloadComplete, track.name]);

  const handlePress = async () => {
    if (isDownloaded) {
      await deleteDownload(track.id);
      Toast.show({ type: "success", text1: "Download removed" });
      return;
    }

    if (progress?.state === "downloading") {
      await pauseDownload(progress.downloadId);
      Toast.show({ type: "info", text1: "Download paused" });
      return;
    }

    if (progress?.state === "paused") {
      await resumeDownload(progress.downloadId);
      Toast.show({ type: "info", text1: "Download resumed" });
      return;
    }

    if (progress?.state === "pending" || progress?.state === "failed") {
      await cancelDownload(progress.downloadId);
    }

    onDownloadStart?.();
    Toast.show({ type: "info", text1: "Downloading...", text2: track.name });
    await downloadTrack(track);

  };

  const getIcon = () => {
    if (isDownloaded) {
      return <Check size={size} color="#22c55e" />;
    }

    if (progress?.state === "downloading") {
      return <Pause size={size} color="#3b82f6" />;
    }

    if (progress?.state === "paused") {
      return <Play size={size} color="#f59e0b" />;
    }

    if (progress?.state === "failed") {
      return <X size={size} color="#ef4444" />;
    }

    return <DownloadCloud size={size} color="#a1a1aa" />;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="p-2 rounded-full bg-neutral-800/50"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {getIcon()}
      {progress?.state === "downloading" && (
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500"
            style={{ width: `${progress.progress * 100}%` }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
