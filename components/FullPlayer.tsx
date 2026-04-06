import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const FullPlayer = () => {
  return (
    <ScrollView
      style={styles.container}
      bounces={true}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chevron-down" size={28} color="white" />
        <Text style={styles.headerTitle}>Now Playing</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="white" />
      </View>

      {/* Main Artwork */}
      <View style={styles.artWrapper}>
        <Image
          source={{ uri: "https://placeholder.com/artwork_large.jpg" }}
          style={styles.mainArt}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View>
          <Text style={styles.songTitle}>Neon Shadows</Text>
          <Text style={styles.songArtist}>Midnight Pulse</Text>
        </View>
        <Ionicons name="heart" size={28} color="#FF6F61" />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressArea}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: "45%" }]} />
          <View style={[styles.knob, { left: "45%" }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>1:42</Text>
          <Text style={styles.timeText}>3:58</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.mainControls}>
        <Ionicons name="play-skip-back" size={35} color="white" />
        <Pressable style={styles.playButton}>
          <Ionicons name="play" size={45} color="black" />
        </Pressable>
        <Ionicons name="play-skip-forward" size={35} color="white" />
      </View>

      {/* --- NEW ARTIST DETAILS CARD (Spotify Style) --- */}
      <View style={styles.artistCard}>
        {/* The Card's Top Rounded Image and Title */}
        <View style={styles.artistHeader}>
          <Image
            source={{ uri: "https://placeholder.com/artist_photo.jpg" }} // Use a photo of the actual artist
            style={styles.artistPhoto}
          />
          <Text style={styles.artistCardLabel}>ABOUT THE ARTIST</Text>
        </View>

        {/* The Artist Details Content */}
        <View style={styles.artistDetailsBody}>
          <View style={styles.artistNameRow}>
            <Text style={styles.artistNameText}>Midnight Pulse</Text>
            {/* Optional Verified Badge */}
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#1DB954"
              style={styles.verifiedBadge}
            />
          </View>

          <Text style={styles.artistDescription} numberOfLines={4}>
            Midnight Pulse is an experimental electronic duo based in Berlin.
            Known for blending glitch-pop elements with deep, atmospheric house,
            they create immersive auditory landscapes that explore themes of
            urban isolation and nocturnal introspection. "Neon Shadows" is their
            latest acclaimed release.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    backgroundColor: "#000000ff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  artWrapper: {
    alignItems: "center",
    marginVertical: 40,
  },
  mainArt: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 20,
    backgroundColor: "#222", // Placeholder color
  },
  scrollContent: {
    paddingBottom: 40, // Ensure card doesn't get cut off
  },
  trackInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  songTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  songArtist: {
    color: "#AAA",
    fontSize: 18,
    marginTop: 5,
  },
  progressArea: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  track: {
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
    position: "relative",
  },
  fill: {
    height: 3,
    backgroundColor: "#FF6F61",
    borderRadius: 2,
  },
  knob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6F61",
    position: "absolute",
    top: -4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeText: {
    color: "#777",
    fontSize: 12,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 40,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    color: "#000000ff",
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#0e0101ff",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  /* --- ARTIST DETAILS CARD STYLES --- */
  artistCard: {
    backgroundColor: "#1E2126", // Sightly lighter than main background
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden", // Required for upper rounded image to work correctly
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  artistHeader: {
    position: "relative",
    height: 140, // Standard header image height
    width: "100%",
  },
  artistPhoto: {
    ...StyleSheet.absoluteFillObject,
    // The top-left/top-right rounding applies here because of the card's overflow:'hidden'
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  artistCardLabel: {
    position: "absolute",
    bottom: 12,
    left: 16,
    color: "white",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent overlay for text readability
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  artistDetailsBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  artistNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  artistNameText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  verifiedBadge: {
    marginLeft: 8,
    marginTop: 2, // Fine-tuning vertical alignment
  },
  artistDescription: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 22,
  },
});

export default FullPlayer;
