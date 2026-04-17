import QuickPicksSection from "@/components/home/QuickPicksSection";
import { useHomeData } from "@/src/hooks/useQueries";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
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
import TrendingSection from "../../components/home/TrendingSection";

// ... your other imports
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export default function Index() {
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;

  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  // 1. Fetch Home Data using TanStack Query
  const { data, isLoading } = useHomeData();

  [1,2,3,4,5,6,7].forEach((i) => {
    console.log(JSON.stringify(data?.newtrending[i].url || data?.newtrending[i].perma_url));
  });
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      scrollY.value = currentOffset;
      const diff = currentOffset - lastContentOffset.value;

      if (currentOffset <= 0) {
        translateY.value = withTiming(0);
      } else {
        translateY.value = Math.max(
          -TOTAL_HEADER_HEIGHT,
          Math.min(0, translateY.value - diff),
        );
      }
      lastContentOffset.value = currentOffset;
    },
  });

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["transparent", "#000000"],
    );

    return {
      transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
      opacity: interpolate(
        translateY.value,
        [-TOTAL_HEADER_HEIGHT, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  // Loading State
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // Map home data to flat list items
  const sections = [
    {
      id: "quick",
      title: "Quick Picks",
      type: "quickPicks",
      data: data?.quick_picks,
    },
    {
      id: "trending",
      title: "New & Trending",
      type: "trending",
      data: data?.newtrending,
    },
    {
      id: "playlists",
      title: "Top Playlists",
      type: "playlists",
      data: data?.topPlaylists,
    },
    {
      id: "albums",
      title: "New Releases",
      type: "albums",
      data: data?.newreleases,
    },
    { id: "charts", title: "Top Charts", type: "charts", data: data?.charts },
  ];

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <StatusBar barStyle="light-content" />

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
        data={sections}
        estimatedItemSize={320}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT,
          paddingBottom: 100,
        }}
        renderItem={({ item }: any) => {
          if (item.type === "quickPicks")
            return <QuickPicksSection data={item.data} />;

          return (
            <TrendingSection
              title={item.title}
              data={item.data}
              type={item.type}
            />
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
