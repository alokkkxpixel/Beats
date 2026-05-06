import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { TrackPlayer, useNowPlaying, useOnPlaybackProgressChange, useOnPlaybackStateChange } from 'react-native-nitro-player';
import { SongDetail } from "@/types/jiosaavn";

export default function MiniPlayer() {
  const nowPlaying = useNowPlaying();
  const playbackState = useOnPlaybackStateChange();
  const currentTrack = nowPlaying.currentTrack;
  const originalSong = currentTrack?.extraPayload?.song as unknown as SongDetail;
  
  const isLoaded = !!currentTrack;
  const isPlaying = playbackState.state === 'playing';
  
  // Use store for position/duration to ensure immediate reset on track change
  const { position, duration } = usePlayerStore();
  
  const trackImage = isLoaded
    ? currentTrack.artwork || originalSong?.image?.[1]?.url || originalSong?.image?.[0]?.url
    : "https://via.placeholder.com/150?text=...";
    
  const artistName = isLoaded
    ? currentTrack.artist || originalSong?.primaryArtists || originalSong?.subtitle || "Unknown Artist"
    : "";
    
  const progressPercent = isLoaded && duration > 0 ? (position / duration) * 100 : 0;
  
  const togglePlay = async () => {
    if (!isLoaded) return;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };
  
  return (
    <View style={styles.miniContainer}>
      <View style={styles.miniContent}>
        {isLoaded ? (
          <Image source={{ uri: trackImage }} style={styles.miniArt} />
        ) : (
          <View
            style={[
              styles.miniArt,
              {
                backgroundColor: "#333",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Ionicons name="musical-note" size={24} color="#666" />
          </View>
        )}
        <View style={styles.miniTextContainer}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {isLoaded ? (currentTrack.title) : "Nothing to play"}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {artistName}
          </Text>
        </View>
        <View style={styles.miniControls}>
          <Pressable
            style={styles.iconSpacing}
            onPress={togglePlay}
            disabled={!isLoaded}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={30}
              color={isLoaded ? "white" : "#444"}
            />
          </Pressable>
        </View>
      </View>
      {/* Progress bar at the very top of the mini player */}
      <View style={styles.miniProgressBarBackground}>
        <View
          style={[
            styles.miniProgressBarFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isLoaded ? "#d7d7d0ff" : "transparent",
            },
          ]}
        />
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
