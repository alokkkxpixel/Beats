import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Play, Search, Share } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuickPicksSection from "@/components/home/QuickPicksSection";
import TrendingSection from "@/components/home/TrendingSection";
import RecommendedArtist from "@/components/RecommendedArtist";
import { useArtist } from "@/src/hooks/useQueries";
import { decodeHtmlEntities, formatPlayCount } from "@/src/utils/transform";
import { FlashList } from "@shopify/flash-list";
const IMAGE_HEIGHT = 450;
const AnimatedFlashList: any = Animated.createAnimatedComponent(
  FlashList as any,
);

type ArtistSection = {
  id: string;
  type:
    | "spacer"
    | "top_songs"
    | "albums"
    | "singles"
    | "dedicated_artist_playlist"
    | "featured_artist_playlist"
    | "latest_release"
    | "recommended_artists";
  title?: string;
  data?: any;
};

const getImageUri = (img: any): string => {
  let imageUrl = "";

  if (Array.isArray(img)) {
    imageUrl = img[2]?.url || img[1]?.url || img[0]?.url || "";
  } else if (typeof img === "string") {
    imageUrl = img;
  }

  if (imageUrl.includes("150x150")) {
    imageUrl = imageUrl.replace("150x150", "500x500");
  } else if (imageUrl.includes("50x50")) {
    imageUrl = imageUrl.replace("50x50", "500x500");
  }

  if (
    imageUrl === "https://static.saavncdn.com/_i/share-image-2.png" ||
    !imageUrl
  ) {
    return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
  }

  return imageUrl;
};

export default function ArtistScreen() {
  const { id, url } = useLocalSearchParams<{ id: string; url: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { data: artist, isLoading } = useArtist(id, url);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [IMAGE_HEIGHT - 100, IMAGE_HEIGHT - 50],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      backgroundColor: "#050505",
      paddingTop: insets.top,
      height: insets.top + 50,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT],
      [0, -50],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const openCatalog = (tab: "songs" | "albums") => {
    router.push({
      pathname: "/artist-catalog" as any,
      params: { id, url, tab },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Artist details not available</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.topBarIcon, { backgroundColor: "#333" }]}
        >
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
      </View>
    );
  }

  const sections: ArtistSection[] = [
    {
      id: "header_spacer",
      type: "spacer",
    },
    {
      id: "top_songs",
      type: "top_songs",
      title: artist?.modules?.topSongs?.title || "Top songs",
      data: artist?.topSongs || [],
    },
    {
      id: "albums",
      type: "albums",
      title: artist?.modules?.topAlbums?.title || "Top albums",
      data: artist?.topAlbums || [],
    },
    {
      id: "singles",
      type: "singles",
      title: artist?.modules?.singles?.title,
      data: artist?.singles || [],
    },
    {
      id: "dedicated_artist_playlist",
      type: "dedicated_artist_playlist",
      title: artist?.modules?.dedicated_artist_playlist?.title,
      data: artist?.dedicated_artist_playlist,
    },
    {
      id: "featured_artist_playlist",
      type: "featured_artist_playlist",
      title: artist?.modules?.featured_artist_playlist?.title,
      data: artist?.featured_artist_playlist,
    },
    {
      id: "latest_release",
      type: "latest_release",
      title: artist?.modules?.latest_release?.title,
      data: artist?.latest_release,
    },
    {
      id: "recommended_artists",
      type: "recommended_artists",
      title: "You might also like",
      data: artist?.similarArtists || [],
    },
  ];

  const renderHeader = () => {
    const artistImage = getImageUri(artist?.image);

    return (
      <View style={styles.headerContent}>
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image
            source={{ uri: artistImage }}
            style={styles.artistImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.6)", "#050505"]}
            locations={[0, 0.7, 1]}
            style={styles.gradient}
          />
        </Animated.View>

        <View style={styles.infoContainer}>
          <Text style={styles.artistName} numberOfLines={2}>
            {decodeHtmlEntities(artist?.name || "")}
          </Text>

          <View style={styles.actionsRow}>
            <Text style={styles.audienceText}>
              {formatPlayCount(artist?.fanCount || artist?.followerCount || 0)}{" "}
              monthly listeners
            </Text>
            <Pressable
              style={styles.playButtonCircle}
              onPress={() => openCatalog("songs")}
            >
              <Play size={24} color="#000" fill="#000" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <View style={[styles.topBar, { top: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.topBarIcon}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable style={styles.topBarIcon}>
            <Share size={22} color="#fff" />
          </Pressable>
          <Pressable
            style={styles.topBarIcon}
            onPress={() => router.push("/search")}
          >
            <Search size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.stickyHeader, headerAnimatedStyle]}>
        <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
          {decodeHtmlEntities(artist?.name || "")}
        </Text>
      </Animated.View>

      <AnimatedFlashList
        data={sections}
        estimatedItemSize={260}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader()}
        keyExtractor={(item: ArtistSection) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
        renderItem={({ item }: { item: ArtistSection }) => {
          if (item.type === "spacer") {
            return <View style={{ height: 20 }} />;
          }

          if (item.type === "top_songs") {
            return (
              <View style={styles.sectionWrapper}>
                <QuickPicksSection
                  data={(item.data as any)?.slice?.(0, 12) || []}
                  title="Top songs"
                  subtitle=""
                  onMorePress={() => openCatalog("songs")}
                />
              </View>
            );
          }

          if (item.type === "albums") {
            return (
              <TrendingSection
                title={item.title}
                data={(item.data as any)?.slice?.(0, 10) || []}
                type="albums"
                onMorePress={() => openCatalog("albums")}
              />
            );
          }

          if (item.type === "singles") {
            return (
              <TrendingSection
                title={item.title}
                data={item.data as any}
                type="single"
              />
            );
          }

          if (item.type === "dedicated_artist_playlist") {
            return (
              <TrendingSection
                title={item.title}
                data={item.data as any}
                type="playlist"
              />
            );
          }

          if (item.type === "featured_artist_playlist") {
            return (
              <TrendingSection
                title={item.title}
                data={item.data as any}
                type="playlist"
              />
            );
          }

          if (item.type === "latest_release") {
            return (
              <TrendingSection
                title={item.title}
                data={item.data as any}
                type="albums"
              />
            );
          }

          if (item.type === "recommended_artists") {
            return (
              <RecommendedArtist title={item.title} data={item.data as any} />
            );
          }

          return null;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 50,
    alignItems: "center",
  },
  topBarRight: {
    flexDirection: "row",
    gap: 20,
  },
  topBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 110,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  stickyHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "sans-bold",
    textAlign: "center",
  },
  headerContent: {
    height: 450,
  },
  imageContainer: {
    width: "100%",
    height: 450,
    position: "absolute",
  },
  artistImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  infoContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 25,
  },
  artistName: {
    color: "#fff",
    fontSize: 52,
    fontFamily: "sans-extrabold",
    lineHeight: 56,
    letterSpacing: -1,
    marginBottom: 8,
  },
  audienceText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "sans-medium",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionWrapper: {
    marginTop: -20,
  },
});
