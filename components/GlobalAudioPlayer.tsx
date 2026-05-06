import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect } from "react";
import {
  useNowPlaying,
  useOnPlaybackProgressChange,
  useOnPlaybackStateChange,
} from "react-native-nitro-player";

export default function GlobalAudioPlayer() {
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const updateProgress = usePlayerStore((s) => s.updateProgress);
  const fetchAndAppendSuggestions = usePlayerStore(
    (s) => s.fetchAndAppendSuggestions,
  );
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
      // Throttle updates: Only update store when the second changes (once per second)
      // This drastically reduces re-renders of any component listening to store.position
      const currentPos = Math.floor(progressData.position);
      const storePos = Math.floor(state.position);

      if (
        currentPos !== storePos ||
        progressData.totalDuration !== state.duration
      ) {
        updateProgress(progressData.position, progressData.totalDuration);
      }
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
  }, [
    nowPlaying.currentTrack?.id,
    currentTrack?.id,
    queue,
    fetchAndAppendSuggestions,
  ]);

  // Delayed suggestion fetch for single-song queues
  const position = usePlayerStore((s) => s.position);
  useEffect(() => {
    if (queue.length === 1 && currentTrack && position > 10) {
      fetchAndAppendSuggestions(currentTrack.id);
    }
  }, [position, queue.length, currentTrack, fetchAndAppendSuggestions]);

  return null;
}
