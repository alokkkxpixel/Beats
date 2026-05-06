import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect } from "react";
import {
  useOnPlaybackStateChange,
  useOnPlaybackProgressChange,
  useNowPlaying,
} from "react-native-nitro-player";

export default function GlobalAudioPlayer() {
  const { setPlaying, updateProgress } = usePlayerStore();
  
  // Sync Playback State (Playing/Paused)
  const playbackState = useOnPlaybackStateChange();
  useEffect(() => {
    setPlaying(playbackState.state === 'playing');
  }, [playbackState.state, setPlaying]);

  // Sync Playback Progress
  const progressData = useOnPlaybackProgressChange();
  const nowPlaying = useNowPlaying();

  useEffect(() => {
    const state = usePlayerStore.getState();
    const isDragging = state.isDragging;
    const storeTrackId = state.currentTrack?.id;
    const nativeTrackId = nowPlaying.currentTrack?.id;

    // Only update if not dragging AND the native player is on the same track as our store
    // This prevents the 'progress jump' when switching tracks
    if (!isDragging && nativeTrackId === storeTrackId && nativeTrackId !== undefined) {
      updateProgress(progressData.position, progressData.totalDuration);
    }
  }, [progressData.position, progressData.totalDuration, updateProgress, nowPlaying.currentTrack?.id]);

  // Sync Track Changes (e.g. from notification or next button)
  useEffect(() => {
    const nativeTrack = nowPlaying.currentTrack;
    if (nativeTrack) {
      const { currentTrack: storeTrack, queue } = usePlayerStore.getState();
      
      // If the native track changed and it's different from our store track
      if (nativeTrack.id !== storeTrack?.id) {
        const newIndex = queue.findIndex(t => t.id === nativeTrack.id);
        if (newIndex !== -1) {
          usePlayerStore.setState({
            currentIndex: newIndex,
            currentTrack: queue[newIndex],
            position: 0,
            duration: queue[newIndex].duration || 0,
          });
        }
      }
    }
  }, [nowPlaying.currentTrack?.id]);

  return null;
}
