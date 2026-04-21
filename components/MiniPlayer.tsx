import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, position, duration } = usePlayerStore();

  if (!currentTrack) return null;

  const trackImage = currentTrack.image[1]?.url || currentTrack.image[0]?.url;
  const artistName = currentTrack.artists.primary[0]?.name || "Unknown Artist";
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.miniContainer}>
      <View style={styles.miniContent}>
        <Image source={{ uri: trackImage }} style={styles.miniArt} />
        <View style={styles.miniTextContainer}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {artistName}
          </Text>
        </View>

        <View style={styles.miniControls}>
          <Pressable style={styles.iconSpacing} onPress={() => togglePlay()}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" />
          </Pressable>
        </View>
      </View>
      {/* Progress bar at the very top of the mini player */}
      <View style={styles.miniProgressBarBackground}>
        <View style={[styles.miniProgressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniContainer: {
    height: 70,
    backgroundColor: "#000000ff",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    // paddingHorizontal: 10,
  },
  miniProgressBarBackground: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  miniProgressBarFill: {
    height: 2,
    backgroundColor: "#FF6F61",
  },
  miniContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    flex: 1,
  },
  miniArt: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  miniTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  miniArtist: {
    color: "#AAA",
    fontSize: 12,
  },
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 15,
  },
});
