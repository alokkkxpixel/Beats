import { useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { usePlayerStore } from "@/src/store/usePlayerStore";

export default function AudioEngine() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const updateProgress = usePlayerStore((state) => state.updateProgress);
  const next = usePlayerStore((state) => state.next);

  // Get the best download URL (usually the last one is the highest quality)
  const audioSource = currentTrack?.downloadUrl
    ? currentTrack.downloadUrl[currentTrack.downloadUrl.length - 1].url
    : null;

  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);
  const setLoading = usePlayerStore((state) => state.setLoading);

  // Sync isPlaying state from Store to Player
  useEffect(() => {
    if (player) {
      if (isPlaying && !player.playing) {
        player.play();
      } else if (!isPlaying && player.playing) {
        player.pause();
      }
    }
  }, [isPlaying, player.playing]); // Depend on player.playing to avoid loops

  // Sync progress from Player back to Store
  useEffect(() => {
    if (status) {
      updateProgress(status.currentTime, status.duration);
      setLoading(status.isBuffering);

      // Auto-next when finished
      if (status.didJustFinish) {
        next();
      }
    }
  }, [
    status.currentTime,
    status.duration,
    status.isBuffering,
    status.didJustFinish,
  ]);

  // Seek logic listener
  const storePosition = usePlayerStore((state) => state.position);
  useEffect(() => {
    // Only seek if the store position is significantly different from current player time
    if (player && Math.abs(player.currentTime - storePosition) > 2) {
      player.seekTo(storePosition);
    }
  }, [storePosition]);

  return null;
}
