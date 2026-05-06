import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect } from "react";
import {
  useNowPlaying,
  useOnPlaybackProgressChange,
  useOnPlaybackStateChange,
} from "react-native-nitro-player";

export default function GlobalAudioPlayer() {
  const { setPlaying, updateProgress, fetchAndAppendSuggestions } =
    usePlayerStore();

  // Sync Playback State (Playing/Paused)
  const playbackState = useOnPlaybackStateChange();
  useEffect(() => {
    setPlaying(playbackState.state === "playing");
  }, [playbackState.state, setPlaying]);

  // Sync Playback Progress
  const progressData = useOnPlaybackProgressChange();
  const nowPlaying = useNowPlaying();

  useEffect(() => {
    const state = usePlayerStore.getState();
    const isDragging = state.isDragging;
    const storeTrackId = state.currentTrack?.id;
    const nativeTrackId = nowPlaying.currentTrack?.id;

    if (
      !isDragging &&
      nativeTrackId === storeTrackId &&
      nativeTrackId !== undefined
    ) {
      updateProgress(progressData.position, progressData.totalDuration);
    }
  }, [
    progressData.position,
    progressData.totalDuration,
    updateProgress,
    nowPlaying.currentTrack?.id,
  ]);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);

  // Sync Track Changes and handle Infinite Autoplay
  useEffect(() => {
    const nativeTrack = nowPlaying.currentTrack;
    if (nativeTrack) {
      // 1. Sync store metadata if native track changed
      if (nativeTrack.id !== currentTrack?.id) {
        const newIndex = queue.findIndex((t) => t.id === nativeTrack.id);
        if (newIndex !== -1) {
          usePlayerStore.setState({
            currentIndex: newIndex,
            currentTrack: queue[newIndex],
            position: 0,
            duration: queue[newIndex].duration || 0,
          });

          // 2. INFINITE AUTOPLAY: If we just switched to the 2nd to last song, fetch more!
          // Only trigger if we have a substantial queue to avoid race conditions with initial loading
          if (queue.length > 2 && newIndex >= queue.length - 2) {
            fetchAndAppendSuggestions(nativeTrack.id);
          }
        }
      }
    }
  }, [nowPlaying.currentTrack?.id, currentTrack?.id, queue, fetchAndAppendSuggestions]);

  return null;
}
