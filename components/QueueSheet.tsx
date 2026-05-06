import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";
import { SongDetail } from "@/types/jiosaavn";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const QueueSheet = () => {
  const queue = usePlayerStore((state) => state.queue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const flatListRef = useRef<any>(null);

  // Auto-scroll to current track when opened
  useEffect(() => {
    if (currentTrack && queue.length > 0) {
      const index = queue.findIndex((t) => t.id === currentTrack.id);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.3,
          });
        }, 300);
      }
    }
  }, [currentTrack?.id]);

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
      <BottomSheetFlatList
        ref={flatListRef}
        data={queue}
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
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: 76,
          offset: 76 * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <Pressable style={styles.footerBtn}>
          <Ionicons name="shuffle" size={24} color="#1DB954" />
          <Text style={[styles.footerBtnText, { color: "#1DB954" }]}>
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
