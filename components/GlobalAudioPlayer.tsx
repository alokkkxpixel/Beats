import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect, useRef } from "react";
import {
  useNowPlaying,
  useOnPlaybackProgressChange,
  useOnPlaybackStateChange,
} from "react-native-nitro-player";

export default function GlobalAudioPlayer() {
  // ── Stable action refs from Zustand (never cause re-renders) ────────────────
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const updateProgress = usePlayerStore((s) => s.updateProgress);
  const fetchAndAppendSuggestions = usePlayerStore(
    (s) => s.fetchAndAppendSuggestions,
  );
  // FIX #3: Subscribe only to the id scalar, not the full currentTrack object.
  // Previously: usePlayerStore((s) => s.currentTrack) — any metadata change
  // (artwork, label, subtitle) creates a new object reference and re-renders
  // GlobalAudioPlayer even though nothing here uses those fields.
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);

  // ── Native Nitro Player hooks ────────────────────────────────────────────────
  const playbackState = useOnPlaybackStateChange();
  const progressData = useOnPlaybackProgressChange();
  const nowPlaying = useNowPlaying();

  // ── Ref: fire single-song suggestion fetch exactly once per track ────────────
  const hasFetchedSingleTrackSuggestions = useRef(false);

  // Sync playing/paused state to store
  useEffect(() => {
    setPlaying(playbackState.state === "playing");
  }, [playbackState.state, setPlaying]);

  // ── Progress sync + single-song suggestion trigger ───────────────────────────
  // All store reads are imperative (getState) — this effect does NOT subscribe
  // to position/duration/queue, so it never causes extra re-renders.
  // Throttled: only writes to the store when the floored second actually changes.
  useEffect(() => {
    const state = usePlayerStore.getState();

    // Guard: don't update while user is manually scrubbing
    if (state.isDragging) return;

    // Guard: native and store must agree on which track is playing
    const nativeTrackId = nowPlaying.currentTrack?.id;
    if (!nativeTrackId || nativeTrackId !== state.currentTrack?.id) return;

    // Throttle: skip if neither the floored second nor duration changed
    const currentPos = Math.floor(progressData.position);
    const storePos = Math.floor(state.position);
    const durationChanged = progressData.totalDuration !== state.duration;

    if (currentPos !== storePos || durationChanged) {
      updateProgress(progressData.position, progressData.totalDuration);
    }

    // Single-song autoplay suggestion — fires once, then the ref blocks it
    if (
      !hasFetchedSingleTrackSuggestions.current &&
      state.queue.length === 1 &&
      state.currentTrack &&
      progressData.position > 10
    ) {
      hasFetchedSingleTrackSuggestions.current = true;
      fetchAndAppendSuggestions(state.currentTrack.id);
    }
  }, [
    progressData.position,
    progressData.totalDuration,
    nowPlaying.currentTrack?.id,
    updateProgress,
    fetchAndAppendSuggestions,
  ]);

  // Reset suggestion ref when track changes
  // FIX #3 cont: depends on currentTrackId (scalar) not currentTrack (object)
  useEffect(() => {
    hasFetchedSingleTrackSuggestions.current = false;
  }, [currentTrackId]);

  // ── Track change sync + infinite autoplay ────────────────────────────────────
  // FIX #2 (already applied): queue is read imperatively — not in dep array.
  // FIX #4: currentTrack?.id comparison is now done via getState() snapshot,
  // not the JS-subscribed `currentTrackId`. This closes the race condition where
  // a fast double-skip could read a stale JS value and skip the store update.
  useEffect(() => {
    const nativeTrack = nowPlaying.currentTrack;
    if (!nativeTrack) return;

    // FIX #4: read store id imperatively so we always compare against the
    // latest committed state, not the React-render-cycle snapshot.
    const { currentTrack, queue } = usePlayerStore.getState();

    if (nativeTrack.id === currentTrack?.id) return;

    const newIndex = queue.findIndex((t) => t.id === nativeTrack.id);
    if (newIndex === -1) return;

    usePlayerStore.setState({
      currentIndex: newIndex,
      currentTrack: queue[newIndex],
      position: 0,
      duration: queue[newIndex].duration || 0,
    });

    // Infinite autoplay: approaching end of queue — fetch more tracks
    if (queue.length > 2 && newIndex >= queue.length - 2) {
      fetchAndAppendSuggestions(nativeTrack.id);
    }
  }, [nowPlaying.currentTrack?.id, fetchAndAppendSuggestions]);
  // FIX #4 cont: removed `currentTrackId` from deps — the comparison is now
  // done via getState() so there's no reason to re-run on every store update.
  // The effect only needs to fire when the native player reports a new track.

  return null;
}

/*
 * ── Store action to add (usePlayerStore.ts) ─────────────────────────────────
 *
 * Add this to your Zustand store slice for FIX #5:
 *
 *   syncTrackChange: (newIndex: number, track: Track) =>
 *     set({
 *       currentIndex: newIndex,
 *       currentTrack: track,
 *       position: 0,
 *       duration: track.duration || 0,
 *     }),
 *
 * This makes track changes visible by name in Zustand devtools and ensures
 * any persist/immer/logger middleware wraps the mutation correctly.
 */
