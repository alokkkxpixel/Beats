import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";
import { SongDetail } from "@/types/jiosaavn";
import { FlashList } from "@shopify/flash-list";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
          <Text
            style={[styles.trackTitle, isCurrent && styles.currentTrackTitle]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artistName} {views ? `• ${views}` : ""}
          </Text>
        </View>

        {isCurrent ? (
          <Pressable onPress={togglePlay} style={styles.playBtn}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={32}
              color="white"
            />
          </Pressable>
        ) : (
          <MaterialIcons name="drag-handle" size={24} color="#555" />
        )}
      </Pressable>
    );
  };

  const albumName =
    typeof currentTrack?.album === "string"
      ? currentTrack.album
      : currentTrack?.album?.name || "Playback Queue";

  return (
    <View style={styles.container}>
      <FlashList
        ref={flatListRef}
        data={queue}
        renderScrollComponent={renderScrollComponent}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderTrackItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.playingFrom}>Playing from</Text>
            <Text style={styles.title} numberOfLines={1}>
              {albumName.toUpperCase()}
            </Text>
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
                <Text style={{ color: "#888", fontSize: 13 }}>
                  Fetching suggestions...
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Pressable style={styles.footerBtn} onPress={toggleShuffle}>
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffleEnabled ? "#1DB954" : "white"}
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
    backgroundColor: "#121212",
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
    color: "#888",
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
