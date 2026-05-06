import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { SongDetail } from "@/types/jiosaavn";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  TrackPlayer,
  useNowPlaying,
  useOnPlaybackProgressChange,
  useOnPlaybackStateChange,
} from "react-native-nitro-player";

const { width } = Dimensions.get("window");

const FullPlayer = ({
  handleCloseSheet,
  handleCloseMoreSheet,
}: {
  handleCloseSheet: () => void;
  handleCloseMoreSheet: () => void;
}) => {
  const { height, width: windowWidth } = useWindowDimensions();

  // Nitro Player hooks
  const nowPlaying = useNowPlaying();
  const currentTrack = nowPlaying.currentTrack;
  const playbackState = useOnPlaybackStateChange();
  
  const originalSong = (currentTrack as any)?.extraPayload?.song || currentTrack;
  const isPlaying = playbackState.state === "playing";
  const artistName = originalSong?.primaryArtists || currentTrack?.artist || originalSong?.subtitle || "Unknown Artist";


  // Control handlers
  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const next = async () => {
    await TrackPlayer.skipToNext();
  };

  const previous = async () => {
    await TrackPlayer.skipToPrevious();
  };



  const router = useRouter();
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const isDraggingState = usePlayerStore((s) => s.isDragging);
  const setIsDragging = usePlayerStore((s) => s.setIsDragging);
  
  const lastSeekTime = useRef(0);
  const [scrubProgress, setScrubProgress] = React.useState(0);

  // UI state from store (for menu controls)
  const expandMoreOption = usePlayerStore((s) => s.expandMoreOption);
  const setSelectedSongOption = usePlayerStore((s) => s.setSelectedSongOption);
  const expandQueue = usePlayerStore((s) => s.expandQueue);

  const seek = async (pos: number) => {
    await TrackPlayer.seek(pos);
    lastSeekTime.current = Date.now();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!currentTrack) {
    return null;
  }

  const trackImage =
    originalSong?.image?.[2]?.url ||
    currentTrack.artwork ||
    originalSong?.image?.[0]?.url;


  const navigateToArtist = (artist: any) => {
    if (artist?.id) {
      handleCloseSheet();
      router.push({
        pathname: "/artist/[id]",
        params: { id: artist.id, url: artist.url || artist.perma_url },
      });
    }
  };

  const handleArtistPress = () => {
    const artist = originalSong?.artists?.primary?.[0];
    navigateToArtist(artist);
  };

  const getArtistImage = () => {
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
  };

  const label = originalSong?.label;
  const copyright = originalSong?.copyright;
  const aboutArtist = originalSong?.artists?.primary?.[0]?.name || originalSong?.artist || currentTrack?.artist || "Artist";
  const bioDisplayText = label || copyright || "No artist biography available.";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Top Blurred Backdrop */}
      <View
        style={{
          height: height + 1500,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <RNImage
          source={{ uri: trackImage }}
          style={StyleSheet.absoluteFill}
          blurRadius={10}
        />
        <LinearGradient
          colors={[
            "rgba(5,5,5,0.2)",
            "rgba(5,5,5,0.8)",
            "rgba(5,5,5,0.9)",
            "#050505",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <ScrollView
        style={[styles.container, { backgroundColor: "transparent" }]} // Fallback or dynamic bg
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <Pressable
            onPress={() => handleCloseSheet()}
            style={styles.headerIconButton}
            hitSlop={20}
          >
            <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {typeof originalSong?.album === "string"
              ? originalSong.album
              : originalSong?.album?.name || currentTrack?.title}
          </Text>

          <Pressable
            style={styles.headerIconButton}
            onPress={() => {
              setSelectedSongOption(null); // ✅ clear old list selection
              expandMoreOption();
            }}
            hitSlop={20}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </Pressable>
        </View>
        {/* --- Album Artwork --- */}
        <View style={styles.artWrapper}>
          <RNImage source={{ uri: trackImage }} style={styles.mainArt} />
        </View>
        {/* --- Track Info --- */}
        <View style={styles.trackInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Pressable onPress={handleArtistPress}>
              <Text style={styles.songArtist} numberOfLines={1}>
                {artistName}
              </Text>
            </Pressable>
          </View>
          <Ionicons name="heart-outline" size={28} color="white" />
        </View>
        {/* --- Progress Bar --- */}
        <PlayerProgressBar
          duration={duration}
          position={position}
          isDraggingState={isDraggingState}
          setIsDragging={setIsDragging}
          setScrubProgress={setScrubProgress}
          seek={seek}
          windowWidth={windowWidth}
        />

        <View style={styles.progressArea}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatTime(
                isDraggingState
                  ? (scrubProgress / 100) * duration
                  : position,
              )}
            </Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
        {/* --- Main Controls --- */}
        <View style={styles.mainControls}>
          <Ionicons name="shuffle" size={24} color="#A3A3A3" />
          <Pressable onPress={() => previous()}>
            <Ionicons name="play-skip-back" size={38} color="white" />
          </Pressable>
          <Pressable style={styles.playButton} onPress={() => togglePlay()}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="black"
            />
          </Pressable>
          <Pressable onPress={() => next()}>
            <Ionicons name="play-skip-forward" size={38} color="white" />
          </Pressable>
          <Ionicons name="repeat" size={24} color="#A3A3A3" />
        </View>
        {/* --- Footer Controls --- */}
        <View style={styles.footerControls}>
          <View style={styles.deviceIndicator}>
            <MaterialIcons name="speaker" size={16} color="#1DB954" />
            <Text style={styles.deviceText}>SPEAKER</Text>
          </View>
          <View style={styles.footerRightIcons}>
            <Ionicons
              name="share-outline"
              size={22}
              color="white"
              style={{ marginRight: 25 }}
            />
            <Pressable
              onPress={() => {
                expandQueue();
                console.log("pressed");
              }}
            >
              <MaterialIcons name="playlist-play" size={28} color="white" />
            </Pressable>
          </View>
        </View>
        {/* Lyrics & Artist - (Kept for aesthetics, can be made dynamic later) */}
        <View style={styles.lyricsCard}>
          <Text style={styles.lyricsTitle}>Lyrics</Text>
          <Text style={styles.lyricsPreview}>Lyrics coming soon...</Text>
        </View>
        <Pressable style={styles.artistCard} onPress={handleArtistPress}>
          <View style={styles.artistHeader}>
            <RNImage
              source={{
                uri: getArtistImage(),
              }}
              style={styles.artistPhoto}
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
          {/* Header */}
          <View>
            <Text style={styles.creditsTitle}>Credits</Text>
          </View>

          {/* Credits List */}
          <View>
            {originalSong?.artists?.primary?.map((item: any, index: number) => (
              <Pressable
                key={index}
                onPress={() => {
                  item.id ? navigateToArtist(item) : () => {};
                }}
              >
                <View
                  key={index}
                  className="flex-row justify-between items-start py-3 border-b border-gray-700 last:border-b-0"
                >
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
                      item.id ? navigateToArtist(item) : () => {};
                    }}
                    className="border border-gray-500 px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs">View</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
            {originalSong?.artists?.featured?.map(
              (item: any, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    item?.id ? navigateToArtist(item) : () => {};
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
                        item.id ? navigateToArtist(item) : () => {};
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7a1b16",
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
  mainArt: {
    width: width * 0.88,
    height: width * 0.88,
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
  },
  progressArea: {
    paddingHorizontal: 25,
    marginTop: 25,
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
    marginTop: 20,
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
    marginTop: 30,
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
  lyricsCard: {
    backgroundColor: "#e06126",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 15,
    padding: 20,
    minHeight: 200,
  },
  lyricsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  lyricsPreview: {
    color: "white",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },
  artistCard: {
    marginHorizontal: 20,
    marginTop: 20,
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

const PlayerProgressBar = React.memo(({ 
  duration, 
  position, 
  isDraggingState, 
  setIsDragging, 
  setScrubProgress, 
  seek, 
  windowWidth 
}: any) => {
  const progress = useSharedValue(0);
  const isDraggingShared = useSharedValue(false);
  const progressData = useOnPlaybackProgressChange();
  
  // Sync progress value from high-frequency source or store
  useEffect(() => {
    if (!isDraggingState) {
      const currentPos = progressData?.position ?? position;
      const totalDur = duration || 1;
      progress.value = (currentPos / totalDur) * 100;
    }
  }, [progressData.position, position, duration, isDraggingState]);

  const onEnd = (finalProgress: number) => {
    const newPosition = (finalProgress / 100) * duration;
    seek(newPosition);
  };

  const gesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          isDraggingShared.value = true;
          runOnJS(setIsDragging)(true);
        })
        .onUpdate((event) => {
          const trackWidth = windowWidth - 50;
          const newProgress = Math.min(
            100,
            Math.max(0, (event.x / trackWidth) * 100),
          );
          progress.value = newProgress;
          runOnJS(setScrubProgress)(newProgress);
        })
        .onEnd(() => {
          isDraggingShared.value = false;
          runOnJS(setIsDragging)(false);
          runOnJS(onEnd)(progress.value);
        }),
    [windowWidth, duration],
  );

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const animatedKnobStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
    transform: [{ scale: withSpring(isDraggingShared.value ? 1.4 : 1) }],
  }));

  return (
    <View style={styles.progressArea}>
      <GestureDetector gesture={gesture}>
        <View style={styles.sliderContainer}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, animatedFillStyle]} />
            <Animated.View style={[styles.knob, animatedKnobStyle]} />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
});

export default FullPlayer;
