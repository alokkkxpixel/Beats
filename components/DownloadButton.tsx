import DownloadDone from "@/assets/app-icons/Download-done.svg";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { SongDetail } from "@/types/jiosaavn";
import { DownloadCloud, Pause, Play, X } from "lucide-react-native";
import React, { useEffect } from "react";
import { ToastAndroid, TouchableOpacity, View } from "react-native";
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
    checkDownloadStatus,
    getDownloadProgress,
    downloadedTracks,
  } = useDownloadStore();

  const [isDownloaded, setIsDownloaded] = React.useState(false);
  const progress = getDownloadProgress(track.id);

  useEffect(() => {
    checkDownloadStatus(track.id).then(setIsDownloaded);
  }, [track.id, checkDownloadStatus]);

  const handlePress = async () => {
    if (isDownloaded) {
      await deleteDownload(track.id);
      setIsDownloaded(false);
      ToastAndroid.show("Download removed", ToastAndroid.SHORT);
      return;
    }

    if (progress?.state === "downloading") {
      await pauseDownload(progress.downloadId);
      ToastAndroid.show("Download paused", ToastAndroid.SHORT);
      return;
    }

    if (progress?.state === "paused") {
      await resumeDownload(progress.downloadId);
      ToastAndroid.show("Download resumed", ToastAndroid.SHORT);
      return;
    }

    if (progress?.state === "pending" || progress?.state === "failed") {
      await cancelDownload(progress.downloadId);
    }

    onDownloadStart?.();
    ToastAndroid.show("Download started", ToastAndroid.SHORT);
    await downloadTrack(track);
  };

  const getIcon = () => {
    if (isDownloaded) {
      return (
        <DownloadDone
          width={size}
          height={size}
          color="#ffffffff"
          fill="#ffffffff"
        />
      );
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

  const getIconColor = () => {
    if (isDownloaded) return "#22c55e";
    if (progress?.state === "downloading") return "#3b82f6";
    if (progress?.state === "paused") return "#f59e0b";
    if (progress?.state === "failed") return "#ef4444";
    return "#a1a1aa";
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
