import QuickPicksSection from "@/components/home/QuickPicksSection";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { homeSections } from "../../components/home/data";
import TrendingSection from "../../components/home/TrendingSection";

// ... your other imports
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export default function Index() {
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;

  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0); // <--- Added to track absolute scroll
  const lastContentOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;

      // 1. Update absolute scroll for background/header transparency
      scrollY.value = currentOffset;

      // 2. Header Hide/Show Logic
      const diff = currentOffset - lastContentOffset.value;

      if (currentOffset <= 0) {
        translateY.value = withTiming(0);
      } else {
        translateY.value = Math.max(
          -TOTAL_HEADER_HEIGHT, // Use Total height to hide behind notch
          Math.min(0, translateY.value - diff),
        );
      }

      lastContentOffset.value = currentOffset;
    },
  });

  // NEW: Style for the background glows
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 50], // Fades out completely after 50px of scroll
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Determine the background color based on scroll position
    // If scrollY is 0, it's transparent. By 50px scroll, it's solid black.
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["transparent", "#000000"],
    );

    return {
      transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor, // Apply the dynamic color here
      opacity: interpolate(
        translateY.value,
        [-TOTAL_HEADER_HEIGHT, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <StatusBar barStyle="light-content" />

      {/* Wrap glows in Animated.View to fade them out */}
      <Animated.View style={[StyleSheet.absoluteFill, glowAnimatedStyle]}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowCenter} />
      </Animated.View>

      <Animated.View
        style={[
          styles.headerWrapper,
          headerAnimatedStyle,
          { height: TOTAL_HEADER_HEIGHT, paddingTop: insets.top },
        ]}
      >
        <Header title="Beats" />
      </Animated.View>

      <AnimatedFlashList
        data={homeSections}
        estimatedItemSize={320}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT,
          paddingBottom: 40,
        }}
        renderItem={({ item }: any) => {
          if (item.type === "quickPicks") return <QuickPicksSection />;
          // if (item.type === "speedDial") return <SpeedDialSection />;
          return (
            <>
              <TrendingSection />
              <TrendingSection />
              <TrendingSection />
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "center",
  },
  // ... your existing glow styles remain the same
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(165, 42, 42, 0.45)",
  },
  backgroundGlowCenter: {
    position: "absolute",
    top: 120,
    left: 140,
    width: 140,
    height: 320,
    borderRadius: 80,
    backgroundColor: "rgba(255, 166, 77, 0.12)",
  },
});
