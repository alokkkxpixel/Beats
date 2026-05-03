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
  useWindowDimensions,
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
import { formatPlayCount } from "@/src/utils/transform";

export default function ArtistScreen() {
  const { id, url } = useLocalSearchParams<{ id: string; url: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollY = useSharedValue(0);

  const { data: artist, isLoading } = useArtist(id, url);
  // console.log("artist", JSON.stringify(artist?.topSongs[0], null, 2));
  const IMAGE_HEIGHT = 450;

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
        <Text style={{ color: "#fff", marginBottom: 20, fontSize: 16 }}>
          Artist details not available
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.topBarIcon, { backgroundColor: "#333" }]}
        >
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
      </View>
    );
  }

  const sections = [
    {
      id: "header_spacer",
      type: "spacer",
    },
    {
      id: "top_songs",
      type: "top_songs",
      title: artist?.modules?.topSongs?.title,
      data: artist?.topSongs || [],
    },
    {
      id: "albums",
      type: "albums",
      title: artist?.modules?.topAlbums?.title,
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
    const getImageUri = (img: any): string => {
      let url = "";
      if (Array.isArray(img)) {
        url = img[2]?.url || img[1]?.url || img[0]?.url || "";
      } else if (typeof img === "string") {
        url = img;
      }

      if (url.includes("150x150")) {
        url = url.replace("150x150", "500x500");
      } else if (url.includes("50x50")) {
        url = url.replace("50x50", "500x500");
      }

      if (url === "https://static.saavncdn.com/_i/share-image-2.png" || !url) {
        return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
      }
      return url;
    };

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
            {artist?.name}
          </Text>

          <View style={styles.actionsRow}>
            <Text
              style={styles.audienceText}
              className="text-md font-sans-medium"
            >
              {formatPlayCount(artist?.fanCount || artist?.followerCount || 0)}{" "}
              monthly listeners
            </Text>
            <Pressable style={styles.playButtonCircle}>
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

      {/* Floating Header Icons */}
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

      {/* Sticky Header when scrolled */}
      <Animated.View style={[styles.stickyHeader, headerAnimatedStyle]}>
        <Text
          style={styles.stickyHeaderTitle}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {artist?.name}
        </Text>
      </Animated.View>

      <Animated.FlatList
        data={sections}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 200 }}
        renderItem={({ item }) => {
          if (item.type === "spacer") {
            return <View style={{ height: 20 }} />;
          }
          if (item.type === "top_songs") {
            return (
              <View style={styles.sectionWrapper}>
                <QuickPicksSection
                  data={item.data as any}
                  title="Top songs"
                  subtitle=""
                />
              </View>
            );
          }
          if (item.type === "albums") {
            return (
              <TrendingSection
                title={item.title}
                data={item.data as any}
                type="albums"
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
    paddingHorizontal: 110, // Prevent overlap with top bar icons
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
    // backgroundColor: "red",
  },
  imageContainer: {
    width: "100%",
    // backgroundColor: "red",
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
    // marginTop: 10,
    width: "100%",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subscribeButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 25,
  },
  subscribeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "sans-semibold",
  },
  iconButtonPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  sectionWrapper: {
    marginTop: -20,
  },
});
