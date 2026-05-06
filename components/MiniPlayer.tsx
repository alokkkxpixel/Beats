import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { usePlayerStore } from "@/src/store/usePlayerStore";
import { TrackPlayer, useNowPlaying, useOnPlaybackProgressChange, useOnPlaybackStateChange } from 'react-native-nitro-player';

export default function MiniPlayer() {
  const nowPlaying = useNowPlaying();
  const playbackState = useOnPlaybackStateChange();
  
  // Use specific selectors to minimize re-renders
  const storeTrack = usePlayerStore((s) => s.currentTrack);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  
  const currentTrack = nowPlaying.currentTrack || storeTrack;
  const originalSong = (currentTrack as any)?.extraPayload?.song || currentTrack;
  
  const isLoaded = !!currentTrack;
  const isPlaying = playbackState.state === 'playing';

  if (!isLoaded) return null;
  
  const trackImage = isLoaded
    ? (currentTrack as any).artwork || (originalSong as any)?.image?.[1]?.url || (originalSong as any)?.image?.[0]?.url
    : "";
    
  const artistName = isLoaded
    ? (currentTrack as any).artist || (originalSong as any)?.primaryArtists || (originalSong as any)?.subtitle || "Unknown Artist"
    : "";
  
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
        {trackImage ? (
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
            {isLoaded ? ((currentTrack as any).title || (originalSong as any).name) : "Nothing to play"}
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
      {/* isolated Progress bar at the very top of the mini player */}
      <MiniProgressBar 
        isLoaded={isLoaded} 
        duration={duration} 
        storePosition={position} 
      />
    </View>
  );
}

const MiniProgressBar = React.memo(({ isLoaded, duration, storePosition }: any) => {
  const progressData = useOnPlaybackProgressChange();
  const progressValue = useSharedValue(0);
  
  React.useEffect(() => {
    if (isLoaded && duration > 0) {
      // Use high-frequency progress if available, otherwise fallback to store
      const currentPos = progressData?.position ?? storePosition;
      progressValue.value = withTiming((currentPos / duration) * 100, { duration: 250 });
    } else {
      progressValue.value = 0;
    }
  }, [progressData.position, storePosition, duration, isLoaded]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
    backgroundColor: isLoaded ? "#d7d7d0ff" : "transparent",
  }));

  return (
    <View style={styles.miniProgressBarBackground}>
      <Animated.View style={[styles.miniProgressBarFill, animatedStyle]} />
    </View>
  );
});

const styles = StyleSheet.create({
  miniContainer: {
    height: 70,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
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
