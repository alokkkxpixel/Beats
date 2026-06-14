import PauseIcon from "@/assets/app-icons/pause.svg";
import PlayIcon from "@/assets/app-icons/play.svg";
import ShuffleIcon from "@/assets/app-icons/shuffle.svg";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";
import { SongDetail } from "@/types/jiosaavn";
import { MaterialIcons } from "@expo/vector-icons";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TextTicker from "react-native-text-ticker";

// Helper function to calculate color brightness for text protection
function getLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return 0;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const QueueSheet = () => {
  const queue = usePlayerStore((state) => state.queue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);
  const isFetchingSuggestions = usePlayerStore(
    (state) => state.isFetchingSuggestions,
  );
  const isShuffleEnabled = usePlayerStore((state) => state.isShuffleEnabled);
  const fetchAndAppendSuggestions = usePlayerStore(
    (state) => state.fetchAndAppendSuggestions,
  );
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const flatListRef = useRef<any>(null);
  const renderScrollComponent = useBottomSheetScrollableCreator();

  // const [accentColor, setAccentColor] = useState("#dbdbdbff");
  const accentColor = usePlayerStore((state) => state.accentColor);
  // FIX 1: Safely read the current active song image directly from currentTrack metadata
  // This eliminates the need for the broken 'queueimage' state variable completely.
  const originalSong =
    (currentTrack as any)?.extraPayload?.song || currentTrack;
  const currentTrackImage = currentTrack
    ? (currentTrack as any).image?.[1]?.url ||
      (originalSong as any)?.image?.[1]?.url ||
      (originalSong as any)?.image?.[0]?.url
    : "";

  // Auto-scroll to current track when opened
  useEffect(() => {
    if (isQueueOpen && currentTrack && queue.length > 0) {
      const index = queue.findIndex((t) => t.id === currentTrack.id);
      if (index !== -1) {
        const timeout = setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.3,
            });
          } catch (e) {
            // Silently fail if list is not ready
          }
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [isQueueOpen, currentTrack?.id]);

  // FIX 2: Corrected color extraction using the active track image logic
  // useEffect(() => {
  //   let isMounted = true;

  //   async function updateColor() {
  //     if (!currentTrackImage) {
  //       setAccentColor("#dadada");
  //       return;
  //     }

  //     const colorData = await extractAccentColor({
  //       trackImage: currentTrackImage,
  //       checkMounted: () => isMounted,
  //     });

  //     if (isMounted) {
  //       let finalColor = "#dadada";

  //       if (colorData && typeof colorData === "object") {
  //         // Fall back from dominant to average exactly like the mini player setup
  //         finalColor = colorData.dominant || colorData.average || "#dadada";
  //       } else if (typeof colorData === "string") {
  //         finalColor = colorData;
  //       }

  //       setAccentColor(finalColor);
  //     }
  //   }

  //   updateColor();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [currentTrackImage]);

  // FIX 3: Safety shield overlay calculation for white/light album covers
  const overlayColor = useMemo(() => {
    const brightness = getLuminance(accentColor);
    if (brightness > 0.8) return "rgba(0, 0, 0, 0.65)"; // Protects text on pure white covers
    if (brightness > 0.5) return "rgba(0, 0, 0, 0.35)"; // Protects text on medium bright covers
    return "transparent";
  }, [accentColor]);

  // Fetch suggestions when queue is small and sheet is opened
  useEffect(() => {
    if (isQueueOpen && queue.length === 1 && currentTrack) {
      fetchAndAppendSuggestions(currentTrack.id);
    }
  }, [isQueueOpen, queue.length, currentTrack, fetchAndAppendSuggestions]);

  const renderTrackItem = ({
    item,
    index,
  }: {
    item: SongDetail;
    index: number;
  }) => {
    const isCurrent = item.id === currentTrack?.id;
    const artistName =
      item.primaryArtists ||
      item.artists?.primary?.[0]?.name ||
      "Unknown Artist";

    const views = formatPlayCount(item.playCount);

    // REMOVED: setQueueImage(item.image?.[1]?.url) state mutation is completely gone!

    return (
      <Pressable
        style={[styles.trackItem, isCurrent && styles.currentTrackItem]}
        onPress={() => !isCurrent && setCurrentTrack(item)}
      >
        <Image
          source={{ uri: item.image?.[1]?.url || item.image?.[0]?.url }}
          style={styles.trackArt}
        />
        <View style={styles.trackInfo}>
          {isCurrent ? (
            <TextTicker
              style={[styles.trackTitle, isCurrent && styles.currentTrackTitle]}
              duration={15000}
              animationType="scroll"
              loop
              bounce={false}
              repeatSpacer={50}
              marqueeDelay={1000}
              easing={Easing.linear}
            >
              {item.name}
            </TextTicker>
          ) : (
            <Text
              style={[styles.trackTitle, isCurrent && styles.currentTrackTitle]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          )}
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artistName} {views ? `• ${views}` : ""}
          </Text>
        </View>

        {isCurrent ? (
          <Pressable onPress={togglePlay} style={styles.playBtn}>
            {isPlaying ? (
              <PauseIcon width={24} height={24} fill="white" />
            ) : (
              <PlayIcon width={24} height={24} fill="white" />
            )}
          </Pressable>
        ) : (
          <MaterialIcons name="drag-handle" size={24} color="#888" />
        )}
      </Pressable>
    );
  };

  const albumName =
    typeof currentTrack?.album === "string"
      ? currentTrack.album
      : currentTrack?.album?.name || "Playback Queue";

  return (
    <View style={[styles.container, { backgroundColor: accentColor }]}>
      {/* Universal protection overlay for bright backgrounds */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: overlayColor, pointerEvents: "none" },
        ]}
      />

      <FlashList
        ref={flatListRef}
        data={queue}
        renderScrollComponent={renderScrollComponent}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderTrackItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.playingFrom}>Playing from</Text>
            <TextTicker
              style={[styles.title]}
              duration={15000}
              animationType="scroll"
              loop
              bounce={false}
              repeatSpacer={50}
              marqueeDelay={1000}
              easing={Easing.linear}
            >
              {albumName.toUpperCase()}
            </TextTicker>
          </View>
        }
        ListFooterComponent={
          <View style={styles.ListFooterComponent}>
            {isFetchingSuggestions && (
              <View style={styles.ListFooterComponentFetching}>
                <ActivityIndicator
                  size="small"
                  color="#1DB954"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: "#eee", fontSize: 13 }}>
                  Fetching suggestions...
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Styled the bottom controller bar background to blend properly with the dynamic layout */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: accentColor,
            borderTopColor: "rgba(255, 255, 255, 0.49)",
          },
        ]}
      >
        <Pressable style={styles.footerBtn} onPress={toggleShuffle}>
          <ShuffleIcon
            width={24}
            height={24}
            fill={isShuffleEnabled ? "#1DB954" : "white"}
            stroke={isShuffleEnabled ? "#1DB954" : "white"}
          />
          <Text
            style={[
              styles.footerBtnText,
              { color: isShuffleEnabled ? "#1DB954" : "white" },
            ]}
          >
            Shuffle
          </Text>
        </Pressable>
        <View style={styles.footerDivider} />
        <Pressable style={styles.footerBtn}>
          <MaterialIcons name="timer" size={24} color="white" />
          <Text style={styles.footerBtnText}>Timer</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#121212",
  },
  ListFooterComponent: {
    height: 120,
    alignItems: "center",
    paddingTop: 20,
  },
  ListFooterComponentFetching: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  playingFrom: {
    color: "#888",
    fontSize: 12,
    textTransform: "capitalize",
    fontFamily: "sans-regular",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "sans-bold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    height: 76,
  },
  currentTrackItem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  trackArt: {
    width: 52,
    height: 52,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trackTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "sans-semibold",
  },
  currentTrackTitle: {
    color: "#1DB954",
  },
  trackArtist: {
    color: "#fdfdfdff",
    fontSize: 12,
    marginTop: 3,
    fontFamily: "sans-regular",
  },
  playBtn: {
    marginLeft: 10,
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e1e1e",
    paddingTop: 12,
    paddingBottom: 35,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#252525",
  },
  footerBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  footerDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#333",
    alignSelf: "center",
  },
  footerBtnText: {
    color: "white",
    fontSize: 11,
    marginTop: 6,
    fontFamily: "sans-medium",
  },
});

export default QueueSheet;
