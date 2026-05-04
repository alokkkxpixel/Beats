import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect, useRef } from "react";
import TrackPlayer, {
  Event,
  State,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";

const events = [
  Event.PlaybackState,
  Event.PlaybackError,
  Event.PlaybackActiveTrackChanged,
];

export default function GlobalAudioPlayer() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isDragging = usePlayerStore((state) => state.isDragging);
  const updateProgress = usePlayerStore((state) => state.updateProgress);
  const lastSeekTime = useRef(0);
  const next = usePlayerStore((state) => state.next);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setLoading = usePlayerStore((state) => state.setLoading);
  const storePosition = usePlayerStore((state) => state.position);

  const { position, duration } = useProgress(500); // Update every 500ms

  // Reset seek cooldown when track changes to prevent stale progress from previous song
  useEffect(() => {
    lastSeekTime.current = Date.now();
  }, [currentTrack?.id]);

  // Track manual seeks to prevent "snap back"
  useEffect(() => {
    if (isDragging) {
      lastSeekTime.current = Date.now();
    }
  }, [storePosition, isDragging]);

  // Sync progress back to store
  useEffect(() => {
    const isRecentlySeeked = Date.now() - lastSeekTime.current < 2000;
    
    if (duration > 0 && !isDragging && !isRecentlySeeked) {
      updateProgress(position, duration);
    }
  }, [position, duration, isDragging]);

  // Handle Track Player Events
  useTrackPlayerEvents(events, (event) => {
    if (event.type === Event.PlaybackError) {
      console.warn("An error occurred during playback: ", event);
    }
    if (event.type === Event.PlaybackState) {
      setLoading(
        event.state === State.Buffering || event.state === State.Loading,
      );
      setPlaying(event.state === State.Playing);

      // Auto-next when track ends
      if (event.state === State.Ended) {
        next();
      }
    }
  });

  // Load track when it changes in store
  useEffect(() => {
    async function loadTrack() {
      if (!currentTrack) {
        await TrackPlayer.reset();
        return;
      }

      const audioSource = currentTrack.downloadUrl
        ? currentTrack.downloadUrl[currentTrack.downloadUrl.length - 1].url
        : null;

      if (audioSource) {
        await TrackPlayer.reset();
        await TrackPlayer.add([
          {
            id: currentTrack.id,
            url: audioSource,
            title: currentTrack.name,
            artist:
              typeof currentTrack.artists?.primary === "string"
                ? currentTrack.artists.primary
                : currentTrack.artists?.primary?.[0]?.name || "Unknown Artist",
            artwork: currentTrack.image?.[currentTrack.image.length - 1]?.url,
            duration: currentTrack.duration ?? undefined,
          },
        ]);

        if (isPlaying) {
          await TrackPlayer.play();
        }
      }
    }

    loadTrack();
  }, [currentTrack?.id]);

  // Sync play/pause state
  useEffect(() => {
    async function syncPlayback() {
      const state = await TrackPlayer.getState();
      if (isPlaying && state !== State.Playing) {
        await TrackPlayer.play();
      } else if (!isPlaying && state === State.Playing) {
        await TrackPlayer.pause();
      }
    }
    syncPlayback();
  }, [isPlaying]);

  // Sync seek position
  useEffect(() => {
    async function syncSeek() {
      if (isDragging) return; // Don't sync while dragging

      const playerPosition = await TrackPlayer.getPosition();
      if (Math.abs(playerPosition - storePosition) > 2) {
        await TrackPlayer.seekTo(storePosition);
      }
    }
    syncSeek();
  }, [storePosition, isDragging]);

  return null;
}
