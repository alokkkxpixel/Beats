import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
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

export default function ProgressSection() {
  const { width: windowWidth } = useWindowDimensions();
  const progressData = useOnPlaybackProgressChange();
  const position = progressData?.position ?? 0;
  const duration = progressData?.totalDuration ?? 0;

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

  // Give padding to match px-8 (32 * 2 = 64)
  const TRACK_WIDTH = windowWidth - 64;

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
      // Centering offset: half of knob width (16px / 2 = 8)
      { translateX: -8 },
      {
        scale: withSpring(isDragging.value ? 1.3 : 1),
      },
    ],
  }));

  const displayPosition = isDraggingJS
    ? (scrubPosition / 100) * duration
    : position;

  return (
    <>
      <View className="px-8 ">
        <GestureDetector gesture={gesture}>
          {/* HITBOX CONTAINER: Provides plenty of space so the knob never clips */}
          <View style={styles.sliderContainer}>
            {/* The actual background track */}
            <View className="w-full h-[3px] rounded-full bg-white/30 relative">
              {/* Active fill progress */}
              <Animated.View
                style={animatedFillStyle}
                className="h-full rounded-full bg-white absolute left-0 top-0"
              />

              {/* The Knob: Lifted to clear parents and self-centered vertically */}
              <Animated.View
                // style={animatedKnobStyle}
                className="absolute w-3.5 h-3.5 rounded-full bg-white top-1/2 -mt-1.5 JSON-shadow-fix"
                style={[
                  {
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  },
                  animatedKnobStyle,
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>
      <TimeDisplay position={displayPosition} duration={duration} />
    </>
  );
}

const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins}:${s < 10 ? "0" : ""}${s}`;
};

const TimeDisplay = React.memo(
  ({ position, duration }: { position: number; duration: number }) => (
    <View style={styles.progressArea}>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  ),
);
TimeDisplay.displayName = "TimeDisplay";

const styles = StyleSheet.create({
  progressArea: {
    paddingHorizontal: 25,
    marginTop: 5,
  },
  sliderContainer: {
    height: 30, // Generous height for fingers to touch easily
    justifyContent: "center", // Vertically aligns the track inside the 40px block
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginTop: 2,
  },
  timeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "sans-regular",
  },
});
