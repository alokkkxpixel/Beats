import { usePlayerStore } from "@/src/store/usePlayerStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Easing,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useShallow } from "zustand/shallow";
import PlayerControls from "./PlayerControls";
import ProgressSection from "./ProgressSection";
// Import SVGs
import Statminus from "@/assets/app-icons/stat-minus.svg";

import LikeUnfill from "@/assets/app-icons/like-unfill.svg";
import MoreIcon from "@/assets/app-icons/more.svg";
import TextTicker from "react-native-text-ticker";

const { width } = Dimensions.get("window");
const fallbackAccentColor = "#050505";

type ImageColorsResult =
  | {
      platform: "ios";
      background?: string;
      primary?: string;
    }
  | {
      platform: "android" | "web";
      dominant?: string;
      vibrant?: string;
    };

const getAccentColor = (colors: ImageColorsResult) => {
  if (colors.platform === "ios") {
    return colors.background || colors.primary || fallbackAccentColor;
  }

  return colors.dominant || colors.vibrant || fallbackAccentColor;
};

const hasImageColorsNativeModule = () => {
  const expoModules = (globalThis as any).expo?.modules;
  const legacyExpoModules = NativeModules.NativeUnimoduleProxy?.exportedMethods;

  return Boolean(expoModules?.ImageColors || legacyExpoModules?.ImageColors);
};

const FullPlayer = React.memo(
  ({
    handleCloseSheet,
    handleCloseMoreSheet,
  }: {
    handleCloseSheet: () => void;
    handleCloseMoreSheet: () => void;
  }) => {
    const { height } = useWindowDimensions();
    // const [accentColor, setAccentColor] = React.useState(fallbackAccentColor);
    const accentColor = usePlayerStore((state) => state.accentColor);

    // FIX: Removed native hooks (useNowPlaying). Using stable store instead.
    const {
      currentTrack,
      expandMoreOption,
      expandLyrics,
      setSelectedSongOption,
      isLoading,
    } = usePlayerStore(
      useShallow((s) => ({
        currentTrack: s.currentTrack,
        expandMoreOption: s.expandMoreOption,
        expandLyrics: s.expandLyrics,
        setSelectedSongOption: s.setSelectedSongOption,
        isLoading: s.isLoading,
      })),
    );

    const originalSong =
      (currentTrack as any)?.extraPayload?.song || currentTrack;
    const primaryArtists = (currentTrack as any)?.artists?.primary;

    const artistName =
      originalSong?.primaryArtists ||
      (primaryArtists?.length
        ? primaryArtists.map((artist: any) => artist.name).join(", ")
        : null) ||
      originalSong?.subtitle ||
      "Unknown Artist";
    const trackImage =
      originalSong?.image?.[3]?.url ||
      (currentTrack as any)?.image?.[2]?.url ||
      originalSong?.image?.[0]?.url;

    const router = useRouter();

    const navigateToArtist = useCallback(
      (artist: any) => {
        if (artist?.id) {
          handleCloseSheet();
          router.push({
            pathname: "/artist/[id]",
            params: { id: artist.id, url: artist.url || artist.perma_url },
          });
        }
      },
      [handleCloseSheet, router],
    );

    const handleArtistPress = useCallback(() => {
      const artist = originalSong?.artists?.primary?.[0];
      navigateToArtist(artist);
    }, [originalSong, navigateToArtist]);

    const getArtistImage = useCallback(() => {
      const rawImage = originalSong?.artists?.primary?.[0]?.image;
      let url = "";

      if (Array.isArray(rawImage)) {
        url = rawImage[2]?.url || rawImage[1]?.url || rawImage[0]?.url || "";
      } else if (typeof rawImage === "string") {
        url = rawImage;
      }

      if (
        !url ||
        url.includes("share-image-2.png") ||
        url.includes("default-artist")
      ) {
        return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
      }
      return url;
    }, [originalSong]);

    if (!currentTrack) {
      return null;
    }
    const label = originalSong?.label;
    const copyright = originalSong?.copyright;
    const aboutArtist =
      originalSong?.artists?.primary?.[0]?.name ||
      originalSong?.artist ||
      (currentTrack as any)?.primaryArtists ||
      "Artist";
    const bioDisplayText =
      label || copyright || "No artist biography available.";

    return (
      <GestureHandlerRootView
        style={[
          { backgroundColor: accentColor && accentColor },
          //   styles.container,
          { flex: 1 },
        ]}
      >
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: accentColor && accentColor },
          ]}
          bounces={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* --- Header --- */}
          <View style={styles.header}>
            <Pressable
              onPress={handleCloseSheet}
              style={styles.headerIconButton}
              hitSlop={20}
            >
              <Statminus width={28} height={28} fill="white" />
            </Pressable>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {typeof originalSong?.album === "string"
                ? originalSong.album
                : originalSong?.album?.name || currentTrack?.name}
            </Text>

            <Pressable
              style={styles.headerIconButton}
              onPress={() => {
                setSelectedSongOption(null);
                expandMoreOption();
              }}
              hitSlop={20}
            >
              <MoreIcon width={24} height={24} fill="white" />
            </Pressable>
          </View>

          {/* --- Album Artwork --- */}
          <View style={styles.artWrapper}>
            <View style={styles.artContainer}>
              <Image
                source={{ uri: trackImage }}
                style={styles.mainArt}
                contentFit="cover"
              />
              {isLoading && (
                <View style={styles.imageLoaderContainer}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </View>
          </View>

          {/* --- Track Info --- */}
          <View style={styles.trackInfo}>
            <View style={styles.titleContainer}>
              <TextTicker
                style={styles.songTitle}
                duration={15000}
                loop
                animationType="scroll"
                easing={Easing.linear}
                bounce={false}
                repeatSpacer={20}
                scrollSpeed={100}
                marqueeDelay={1000}
                shouldAnimateTreshold={20}
              >
                {currentTrack.name}
              </TextTicker>
              <Pressable onPress={handleArtistPress}>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {artistName}
                </Text>
              </Pressable>
            </View>
            <LikeUnfill width={28} height={28} fill="white" />
          </View>

          <ProgressSection />
          <PlayerControls />

          <Pressable
            className="items-center mb-2"
            onPress={() => expandLyrics()}
          >
            <Text className="text-white">View Lyrics</Text>
          </Pressable>
          {/* --- Artist Card --- */}
          <Pressable style={styles.artistCard} onPress={handleArtistPress}>
            <View style={styles.artistHeader}>
              <Image
                source={{ uri: getArtistImage() }}
                style={styles.artistPhoto}
                contentFit="cover"
              />
              <Text style={styles.artistCardLabel}>ABOUT THE ARTIST</Text>
            </View>
            <View style={styles.artistDetailsBody}>
              <Text style={styles.artistNameText}>{aboutArtist}</Text>
              <Text style={styles.artistDescription}>{bioDisplayText}</Text>
            </View>
          </Pressable>

          {/* --- Credits Section --- */}
          <View style={styles.creditsCard}>
            <View>
              <Text style={styles.creditsTitle}>Credits</Text>
            </View>
            <View>
              {originalSong?.artists?.primary?.map(
                (item: any, index: number) => (
                  <Pressable
                    key={`primary-${item.id ?? index}`}
                    onPress={() => {
                      if (item.id) navigateToArtist(item);
                    }}
                  >
                    <View className="flex-row justify-between items-start py-3 border-b border-gray-700 last:border-b-0">
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-sm font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1 capitalize">
                          {item.role.split("_").join(" ")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.id) navigateToArtist(item);
                        }}
                        className="border border-gray-500 px-3 py-1 rounded-full"
                      >
                        <Text className="text-white text-xs">View</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                ),
              )}
              {originalSong?.artists?.featured?.map(
                (item: any, index: number) => (
                  <Pressable
                    key={`featured-${item.id ?? index}`}
                    onPress={() => {
                      if (item?.id) navigateToArtist(item);
                    }}
                  >
                    <View className="flex-row justify-between items-start py-3 border-b border-gray-700 last:border-b-0">
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-sm font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1 capitalize">
                          {item.role.split("_").join(" ")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.id) navigateToArtist(item);
                        }}
                        className="border border-gray-500 px-3 py-1 rounded-full"
                      >
                        <Text className="text-white text-xs">View</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    );
  },
);
FullPlayer.displayName = "FullPlayer";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    height: 40,
    position: "relative",
  },
  headerIconButton: {
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 60,
    right: 60,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  artWrapper: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 40,
  },
  artContainer: {
    position: "relative",
  },
  mainArt: {
    width: width * 0.88,
    height: width * 0.88,
    borderRadius: 8,
  },
  imageLoaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  trackInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginRight: 20,
  },
  songTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  songArtist: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginTop: 4,
    marginBottom: 5,
  },
  artistCard: {
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  artistHeader: {
    position: "relative",
    height: 200,
    width: "100%",
  },
  artistPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  artistCardLabel: {
    position: "absolute",
    top: 15,
    left: 15,
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
  artistDetailsBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  artistNameText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  artistDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
  creditsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  creditsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default FullPlayer;
