import React, { useCallback, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  TrackPlayer,
  useOnPlaybackProgressChange,
} from "react-native-nitro-player";

const { width } = Dimensions.get("window");
export default function ProgressSection() {
  const { height, width: windowWidth } = useWindowDimensions();
  // ── Single subscription: native hook only ────────────────────────────────
  const progressData = useOnPlaybackProgressChange();
  const position = progressData?.position ?? 0;
  const duration = progressData?.totalDuration ?? 0;

  // Dragging state stays local — no reason to put it in Zustand
  const isDragging = useSharedValue(false);
  const [isDraggingJS, setIsDraggingJS] = React.useState(false);
  const [scrubPosition, setScrubPosition] = React.useState(0);

  const progress = useSharedValue(0);

  // Sync shared value from native progress, only when not dragging
  useEffect(() => {
    if (!isDraggingJS && duration > 0) {
      progress.value = (position / duration) * 100;
    }
  }, [position, duration, isDraggingJS]);

  const TRACK_WIDTH = windowWidth - 40;

  const seek = useCallback(async (pos: number) => {
    await TrackPlayer.seek(pos);
  }, []);

  const gesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          isDragging.value = true;
          runOnJS(setIsDraggingJS)(true);
        })
        .onUpdate((event) => {
          const newProgress = Math.min(
            100,
            Math.max(0, (event.x / TRACK_WIDTH) * 100),
          );
          progress.value = newProgress;
          runOnJS(setScrubPosition)(newProgress);
        })
        .onEnd(() => {
          isDragging.value = false;
          runOnJS(setIsDraggingJS)(false);
          const newPosition = (progress.value / 100) * duration;
          runOnJS(seek)(newPosition);
        }),
    [TRACK_WIDTH, duration, seek],
  );

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const animatedKnobStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
    transform: [
      { translateX: -8 },
      { scale: withSpring(isDragging.value ? 1.5 : 1) },
    ],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    height: withSpring(isDragging.value ? 6 : 4),
  }));

  const displayPosition = isDraggingJS
    ? (scrubPosition / 100) * duration
    : position;

  return (
    <>
      <View className="px-8 mt-5">
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={animatedTrackStyle}
            className="w-full rounded-full bg-zinc-500 justify-center"
          >
            <Animated.View
              style={animatedFillStyle}
              className="h-full rounded-full bg-white"
            />
            <Animated.View
              style={animatedKnobStyle}
              className="absolute w-4 h-4 rounded-full bg-white"
            />
          </Animated.View>
        </GestureDetector>
      </View>
      {/* FIX #5 cont: TimeDisplay is a separate memo'd child ────────────────
            The time strings update every second but only this tiny component
            re-renders — not the whole ProgressSection. */}
      <TimeDisplay position={displayPosition} duration={duration} />
    </>
  );
}

const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins}:${s < 10 ? "0" : ""}${s}`;
};
// ─── FIX #5 cont: Isolated time display ──────────────────────────────────────
// Receives pre-computed values as props so it only re-renders when they change.
// Previously this lived inline inside ProgressSection (line 736-742) and also
// had a broken duplicate at line 377-391 that caused a compile error.
const TimeDisplay = React.memo(
  ({ position, duration }: { position: number; duration: number }) => (
    <View style={styles.progressArea}>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)} "jkjhjhjh"</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  ),
);

const styles = StyleSheet.create({
  progressArea: {
    paddingHorizontal: 25,
    marginTop: 5,
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    position: "relative",
  },
  fill: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    position: "absolute",
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "white",
    position: "absolute",
    marginLeft: -7,
    top: -5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginVertical: 20,
  },
  playButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  footerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginVertical: 40,
  },
  deviceIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceText: {
    color: "#1DB954",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
  },
  footerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
