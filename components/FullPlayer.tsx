import {
  upgradeArtworkTo500,
  usePlayerStore,
} from "@/src/store/usePlayerStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useShallow } from "zustand/shallow";
import PlayerControls from "./PlayerControls";
import ProgressSection from "./ProgressSection";
// Import SVGs
import Statminus from "@/assets/app-icons/stat-minus.svg";

import LikeFill from "@/assets/app-icons/like-fill.svg";
import LikeUnfill from "@/assets/app-icons/like-unfill.svg";
import MoreIcon from "@/assets/app-icons/more.svg";
import TextTicker from "react-native-text-ticker";
// 🟢 CORRECT (For default exports)
import defaultCover from "@/assets/app-icons/defualt-cover.png";
import { forceHighQualityImageUrl } from "@/src/utils/artwork";
import { formatPlayCount } from "@/src/utils/transform";
import { useArtist } from "@/src/hooks/useQueries";
import { LinearGradient } from "expo-linear-gradient";
import ArtistCredits from "./ArtistCredits";
import LyricsPreview from "./LyricsPreview";
import SwipeArtwork from "./SwipeArtwork";

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

const FullPlayer = React.memo(
  ({
    handleCloseSheet,
    handleCloseMoreSheet,
  }: {
    handleCloseSheet: () => void;
    handleCloseMoreSheet: () => void;
  }) => {
    const { width, height } = useWindowDimensions();
    const isShortScreen = height < 700;
    const artworkSize = Math.min(
      width * 0.82,
      isShortScreen ? height * 0.35 : height * 0.42,
    );
    // const [accentColor, setAccentColor] = React.useState(fallbackAccentColor);
    const accentColor = usePlayerStore((state) => state.accentColor);
    const [imageError, setImageError] = React.useState(false);

    // FIX: Removed native hooks (useNowPlaying). Using stable store instead.
    const {
      currentTrack,
      expandMoreOption,
      expandLyrics,
      setSelectedSongOption,
      isLoading,
      setLoading,
      likedSongs,
      toggleLike,
      next,
      previous,
      queue,
      currentIndex,
    } = usePlayerStore(
      useShallow((s) => ({
        currentTrack: s.currentTrack,
        expandMoreOption: s.expandMoreOption,
        expandLyrics: s.expandLyrics,
        setSelectedSongOption: s.setSelectedSongOption,
        isLoading: s.isLoading,
        setLoading: s.setLoading,
        likedSongs: s.likedSongs,
        toggleLike: s.toggleLike,
        next: s.next,
        previous: s.previous,
        queue: s.queue,
        currentIndex: s.currentIndex,
      })),
    );

    const isLiked = currentTrack
      ? likedSongs.some((s) => s.id === currentTrack.id)
      : false;

    const isLoaded = !!currentTrack;
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

    const extractArtworkUrl = (t: any): string => {
      if (!t) return "";
      const orig = (t as any)?.extraPayload?.song || t;
      const local = (t as any)?.localArtworkPath || orig?.localArtworkPath;
      if (local) {
        return local.startsWith("file://") ? local : `file://${local}`;
      }
      if (typeof t?.artwork === "string" && t.artwork) return t.artwork;
      if (typeof orig?.artwork === "string" && orig.artwork) return orig.artwork;

      const img = t?.image || orig?.image;
      if (typeof img === "string" && img) return img;
      if (Array.isArray(img) && img.length > 0) {
        // Check 500x500 first (index 2 or last item), then 150x150, then 50x50
        const order = [img[2], img[img.length - 1], img[1], img[0]];
        for (const item of order) {
          if (typeof item === "string" && item.trim()) return item.trim();
          if (item && typeof item === "object" && typeof item.url === "string" && item.url.trim()) {
            return item.url.trim();
          }
        }
      }
      return "";
    };

    const rawTrackImage = extractArtworkUrl(currentTrack);
    const trackImage = upgradeArtworkTo500(rawTrackImage) || rawTrackImage;

    // Get previous and next track images for carousel
    const previousTrackImage = React.useMemo(() => {
      if (currentIndex > 0 && queue[currentIndex - 1]) {
        const rawPrev = extractArtworkUrl(queue[currentIndex - 1]);
        return upgradeArtworkTo500(rawPrev) || rawPrev;
      }
      return undefined;
    }, [currentIndex, queue]);

    const nextTrackImage = React.useMemo(() => {
      if (currentIndex < queue.length - 1 && queue[currentIndex + 1]) {
        const rawNext = extractArtworkUrl(queue[currentIndex + 1]);
        return upgradeArtworkTo500(rawNext) || rawNext;
      }
      return undefined;
    }, [currentIndex, queue]);

    // Reset error state when track changes
    React.useEffect(() => {
      setImageError(false);
    }, [trackImage]);

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

    const primaryArtistObj = React.useMemo(() => {
      return (
        originalSong?.artists?.primary?.[0] ||
        (originalSong as any)?.artistMap?.primary_artists?.[0] ||
        (originalSong as any)?.more_info?.artistMap?.primary_artists?.[0] ||
        (originalSong as any)?.artists?.all?.[0] ||
        (currentTrack as any)?.artists?.primary?.[0] ||
        null
      );
    }, [originalSong, currentTrack]);

    const artistId = React.useMemo(() => {
      const id =
        primaryArtistObj?.id ||
        (originalSong as any)?.artistId ||
        (currentTrack as any)?.artistId ||
        null;
      return id ? String(id) : null;
    }, [primaryArtistObj, originalSong, currentTrack]);

    const artistUrl = React.useMemo(() => {
      return (
        primaryArtistObj?.url ||
        primaryArtistObj?.perma_url ||
        (originalSong as any)?.artistUrl ||
        null
      );
    }, [primaryArtistObj, originalSong]);

    const { data: artistData } = useArtist(artistId, artistUrl);

    const handleArtistPress = useCallback(() => {
      const targetArtist = primaryArtistObj || originalSong?.artists?.primary?.[0];
      if (targetArtist?.id) {
        navigateToArtist(targetArtist);
      } else if (artistId) {
        navigateToArtist({
          id: artistId,
          name: primaryArtistObj?.name || originalSong?.artists?.primary?.[0]?.name || "Artist",
          url: artistUrl,
        });
      }
    }, [primaryArtistObj, originalSong, navigateToArtist, artistId, artistUrl]);

    const getArtistCoverImage = useCallback(() => {
      // 1. Check fetched artist details image
      if (artistData?.image) {
        let img: any = artistData.image;
        let url = "";
        if (Array.isArray(img)) {
          url = img[2]?.url || img[1]?.url || img[0]?.url || "";
        } else if (typeof img === "string") {
          url = img;
        }
        if (
          url &&
          !url.includes("share-image-2.png") &&
          !url.includes("default-artist")
        ) {
          if (url.includes("150x150")) {
            url = url.replace("150x150", "500x500");
          } else if (url.includes("50x50")) {
            url = url.replace("50x50", "500x500");
          }
          return forceHighQualityImageUrl(url) || url;
        }
      }

      // 2. Check primary artist on song object
      const rawImage =
        primaryArtistObj?.image ||
        originalSong?.artists?.primary?.[0]?.image ||
        originalSong?.artists?.all?.[0]?.image;

      let url = "";
      if (Array.isArray(rawImage)) {
        url = rawImage[2]?.url || rawImage[1]?.url || rawImage[0]?.url || "";
      } else if (typeof rawImage === "string") {
        url = rawImage;
      }

      if (
        url &&
        !url.includes("share-image-2.png") &&
        !url.includes("default-artist")
      ) {
        if (url.includes("150x150")) {
          url = url.replace("150x150", "500x500");
        } else if (url.includes("50x50")) {
          url = url.replace("50x50", "500x500");
        }
        return forceHighQualityImageUrl(url) || url;
      }

      // 3. Fallback to song's high quality cover art so it never looks blank or broken
      if (trackImage) {
        return trackImage;
      }

      return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
    }, [artistData, primaryArtistObj, originalSong, trackImage]);

    if (!currentTrack) {
      return null;
    }
    const label = originalSong?.label;
    const copyright = originalSong?.copyright;
    const aboutArtist =
      artistData?.name ||
      primaryArtistObj?.name ||
      originalSong?.artists?.primary?.[0]?.name ||
      originalSong?.artist ||
      (currentTrack as any)?.primaryArtists ||
      "Artist";
    const bioDisplayText =
      (artistData as any)?.bio?.[0]?.text ||
      (artistData as any)?.description ||
      label ||
      copyright ||
      "Tap to view artist profile, top tracks, and albums.";
    return (
      <GestureHandlerRootView
        style={[
          {
            backgroundColor: accentColor?.average || accentColor?.average,
          },
          //   styles.container,
          { flex: 1 },
        ]}
      >
        <ScrollView
          style={[
            styles.container,
            {
              backgroundColor: accentColor?.average || accentColor?.vibrant,
            },
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
          <View
            style={[
              styles.artWrapper,
              {
                width: artworkSize,
                height: artworkSize,
                marginTop: isShortScreen ? 16 : Math.max(height * 0.05, 32),
                marginBottom: isShortScreen ? 14 : Math.max(height * 0.04, 28),
              },
            ]}
          >
            <SwipeArtwork
              currentImage={
                trackImage && !imageError ? trackImage : defaultCover
              }
              previousImage={previousTrackImage}
              nextImage={nextTrackImage}
              onNext={next}
              onPrevious={() => previous(true)}
            />
          </View>

          {/* --- Track Info --- */}
          <View style={styles.trackInfo}>
            {/* <View style={{ height: 18, justifyContent: "center" }}>
              <TextTicker
                style={styles.songTitle}
                duration={15000}
                animationType="scroll"
                loop
                bounce={false}
                repeatSpacer={50}
                scrollSpeed={100}
                marqueeDelay={1000}
                shouldAnimateTreshold={20}
                easing={Easing.linear}
              >
                {isLoaded ? currentTrack.name : "Nothing to play"}
              </TextTicker>
            </View> */}
            <View style={styles.titleContainer}>
              {/* <View style={{ height: 18, justifyContent: "center" }}> */}
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
                {isLoaded ? currentTrack.name : "Nothing to play"}
              </TextTicker>
              {/* </View> */}
              <Pressable onPress={handleArtistPress}>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {artistName}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                if (currentTrack) {
                  toggleLike(currentTrack);
                }
              }}
              hitSlop={20}
            >
              {isLiked ? (
                <LikeFill width={28} height={28} fill="#ffffffff" />
              ) : (
                <LikeUnfill width={28} height={28} fill="white" />
              )}
            </Pressable>
          </View>

          <ProgressSection />
          <PlayerControls />

          {/* <Pressable
            className="items-center mb-2"
            onPress={() => expandLyrics()}
          > */}
          <LyricsPreview
            // style={{width: "28%", marginLeft: "auto", marginRight: "auto"}}

            onPress={expandLyrics}
          />
          {/* </Pressable> */}
          {/* --- Artist Card --- */}
          <Pressable style={styles.artistCard} onPress={handleArtistPress}>
            <View
              style={[
                styles.artistHeader,
                { height: Math.min(height * 0.24, 220) },
              ]}
            >
              <Image
                source={{ uri: getArtistCoverImage() }}
                style={styles.artistPhoto}
                contentFit="cover"
                transition={300}
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.45)", "transparent", "rgba(24,24,27,0.95)"]}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.artistCardBadge}>
                <Text style={styles.artistCardLabel}>ABOUT THE ARTIST</Text>
              </View>
            </View>
            <View style={styles.artistDetailsBody}>
              <Text style={styles.artistNameText}>{aboutArtist}</Text>
              {artistData?.fanCount || artistData?.followerCount ? (
                <Text style={styles.artistListeners}>
                  {formatPlayCount(artistData.fanCount || artistData.followerCount || 0)}{" "}
                  monthly listeners
                </Text>
              ) : null}
              <Text style={styles.artistDescription} numberOfLines={3}>
                {bioDisplayText}
              </Text>
            </View>
          </Pressable>

          {/* --- Credits Section --- */}
          {/* <View style={styles.creditsCard}>
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
          </View> */}
          <ArtistCredits
            artists={[
              ...(originalSong?.artists?.primary ?? []),
              ...(originalSong?.artists?.featured ?? []),
            ]}
            onShowAll={() => console.log("Show all credits")}
            onFollow={(artist: any) => console.log("Follow artist:", artist)}
            onArtistPress={navigateToArtist}
          />
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    alignSelf: "center",
  },
  trackInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    alignItems: "center",
    minWidth: 0, // important for ellipsis in flex layouts
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
    marginTop: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(24, 24, 27, 0.85)",
  },
  artistHeader: {
    position: "relative",
    height: 200,
    width: "100%",
  },
  artistPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  artistCardBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  artistCardLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  artistDetailsBody: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(24, 24, 27, 0.95)",
  },
  artistNameText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  artistListeners: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  artistDescription: {
    color: "#D4D4D8",
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
