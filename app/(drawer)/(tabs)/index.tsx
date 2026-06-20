import CityHotSection from "@/components/home/CityHotSection";
import QuickPicksSection from "@/components/home/QuickPicksSection";
import TrendingSection from "@/components/home/TrendingSection";
import RecommendedArtist from "@/components/RecommendedArtist";
import { useHomePreviews, useSpecialForYou } from "@/src/hooks/useQueries";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
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

import Header from "@/components/Header";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { TopGenre } from "./explore";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export default function Index() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  // 1. Fetch Home Data using TanStack Query
  const { data, isLoading, refetch: refetchHomePreviews } = useHomePreviews();
  const {
    data: SpecialForYouData,
    isLoading: SpecialForYouLoading,
    refetch: refetchSpecialForYou,
  } = useSpecialForYou();
  const moodsAndGenres = data?.["promo:vx:data:76"] || [];
  // Time-based background logic
  const getBackgroundData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 16) {
      return {
        image: require("../../../assets/images/morning_default_image.png"),
        greeting: "Good Morning",
      };
    } else if (hour >= 16 && hour < 20) {
      return {
        // image: require("../../../assets/images/morning_default_image.png"),

        // image: require("../../../assets/images/night_bg.jpg"),
        image: require("../../../assets/images/evening_bg.jpg"),
        greeting: "Good Evening",
      };
    } else {
      return {
        // image: require("../../../assets/images/morning_default_image.png"),

        greeting: "Good Night",
      };
    }
  };

  const { image: bgImage, greeting } = getBackgroundData();

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-previews"] }),
        queryClient.invalidateQueries({ queryKey: ["special-for-you"] }),
      ]);

      await Promise.all([refetchHomePreviews(), refetchSpecialForYou()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetchHomePreviews, refetchSpecialForYou]);

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
      // transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
      // opacity: interpolate(
      //   translateY.value,
      //   [-TOTAL_HEADER_HEIGHT, 0],
      //   [0, 1],
      //   Extrapolation.CLAMP,
      // ),
    };
  });

  // Fix: Hooks must run before any conditional return
  const sections = React.useMemo(
    () => [
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
        id: "foryou",
        title: "For You",
        subtitle: "Music just for you",
        type: "foryou",
        data: SpecialForYouData?.list,
      },
      {
        id: "playlists",
        title: "Top Playlists",
        type: "playlists",
        data: data?.topPlaylists,
      },
      {
        id: "artist_recos",
        title: data?.artist_recos.title as string,
        type: "artistrecos",
        data: data?.artist_recos.data,
      },
      {
        id: "albums",
        title: "New Releases",
        type: "albums",
        data: data?.newreleases,
      },
      { id: "charts", title: "Top Charts", type: "charts", data: data?.charts },
      {
        id: "promo:vx:data:68",
        title: data?.["promo:vx:data:68"]?.title,
        subtitle: data?.["promo:vx:data:68"]?.subtitle,
        type: "promo:vx:data:68",
        data: data?.["promo:vx:data:68"].data,
      },
      {
        id: "promo:vx:data:185",
        title: data?.["promo:vx:data:185"]?.title,
        subtitle: data?.["promo:vx:data:185"]?.subtitle,
        type: "promo:vx:data:185",
        data: data?.["promo:vx:data:185"].data,
      },
      {
        id: "promo:vx:data:69",
        title: data?.["promo:vx:data:69"]?.title,
        subtitle: data?.["promo:vx:data:69"]?.subtitle,
        type: "promo:vx:data:69",
        data: data?.["promo:vx:data:69"].data,
      },
       {
        id: "moodsAndGenres",
        title: "Moods and Genres",
        subtitle: "Discover new music",
        type: "moodsAndGenres",
        data: moodsAndGenres,
      },
    ],
    [data, SpecialForYouData, moodsAndGenres],
  );

  // Loading State is handled inline below to keep the header and background visible

  return (
    <View style={[styles.container, { backgroundColor: "" }]}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          glowAnimatedStyle,
          { backgroundColor: "#050505" },
        ]}
      >
        <Image
          source={bgImage}
          style={{ width: "100%", height: 550, position: "absolute", top: 0 }}
          contentFit="cover"
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

      {isLoading || !data ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: TOTAL_HEADER_HEIGHT,
          }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <AnimatedFlashList
          data={sections}
          estimatedItemSize={280}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              progressViewOffset={TOTAL_HEADER_HEIGHT}
              tintColor="#ffffff"
              colors={["#ffffff"]}
              progressBackgroundColor="#050505"
            />
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any) => item.id}
          getItemType={(item: any) => item.type}
          drawDistance={400}
          removeClippedSubviews={true}
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
            if (item.type === "foryou")
              return <QuickPicksSection data={item.data} title={item.title} subtitle={item.subtitle} />;
            if (item.type === "artistrecos") {
              return <RecommendedArtist title={item.title} data={item.data} />;
            }
            if (item.type === "moodsAndGenres") {
              return <TopGenre data={Array.from(
                {
                  length: Math.ceil(item.data.length / 3),
                },
                (_, i) => item.data.slice(i * 3, i * 3 + 3),
              ) || []} title={item.title} subtitle={item.subtitle} />;
            }
            if (item.type === "promo:vx:data:68") {
              return (
                <TrendingSection
                  title={item.title}
                  data={item.data}
                  type={item.type}
                />
              );
            }

            return (
              <TrendingSection
                title={item.title}
                data={item.data}
                type={item.type}
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    // backgroundColor: "#000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "center",
  },
});
