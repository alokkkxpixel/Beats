import CityHotSection from "@/components/home/CityHotSection";
import QuickPicksSection from "@/components/home/QuickPicksSection";
import { useHomePreviews } from "@/src/hooks/useQueries";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
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
  const { data, isLoading } = useHomePreviews();
  // Time-based background logic
  const getBackgroundData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 16) {
      return {
        image: require("../../assets/images/morning_default_image.png"),
        greeting: "Good Morning",
      };
    } else if (hour >= 16 && hour < 20) {
      return {
        image: require("../../assets/images/evening_bg.jpg"),
        greeting: "Good Evening",
      };
    } else {
      return {
        image: require("../../assets/images/night_bg.jpg"),
        greeting: "Good Night",
      };
    }
  };

  const { image: bgImage, greeting } = getBackgroundData();

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
      id: "citymod",
      title: data?.city_mod.title,
      subtitle: data?.city_mod.subtitle,
      type: "cityHot",
      data: data?.city_mod.data,
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

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          glowAnimatedStyle,
          { backgroundColor: "#050505" },
        ]}
      >
        <RNImage
          source={bgImage}
          style={{ width: "100%", height: 550, position: "absolute", top: 0 }}
          resizeMode="cover"
          blurRadius={0}
        />
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.6)",
            "rgba(0, 0, 0, 0.7)",
            "rgba(5, 5, 5, 0.8)",
            "#050505",
          ]}
          locations={[0, 0.4, 0.7, 1]}
          style={{ width: "100%", height: 600, position: "absolute", top: 0 }}
        />
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
          paddingBottom: 250,
        }}
        renderItem={({ item }: any) => {
          if (item.type === "quickPicks")
            return <QuickPicksSection data={item.data} />;

          if (item.type === "cityHot")
            return (
              <CityHotSection
                title={item.title}
                subtitle={item.subtitle}
                data={item.data}
              />
            );

          return (
            <TrendingSection
              title={item.title}
              data={item.data}
              type={item.type}
            />
          );
        }}
        //  contentContainerStyle={{ paddingBottom: 150 }}
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
});
