import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
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

const { width, height } = Dimensions.get("window");

const FullPlayer = ({ handleCloseSheet }: { handleCloseSheet: () => void }) => {
  const [position, setPosition] = React.useState(38); // Percentage state for time labels
  const duration = 240; // Example: 4 minutes total

  const progress = useSharedValue(38);
  const isDragging = useSharedValue(false);

  // Function to sync animated value back to React state when drag ends
  const onEnd = () => {
    setPosition(progress.value);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      // Calculate progress based on touch position relative to the track width
      const trackWidth = width - 50; // paddingHorizontal is 25 on each side
      const newProgress = Math.min(
        100,
        Math.max(0, (event.x / trackWidth) * 100),
      );
      progress.value = newProgress;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(onEnd)();
    });

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const animatedKnobStyle = useAnimatedStyle(() => ({
    left: `${progress.value}%`,
    transform: [{ scale: withSpring(isDragging.value ? 1.4 : 1) }],
  }));

  // Time calculations based on current position state
  const currentSeconds = Math.floor((position / 100) * duration);
  const remainingSeconds = duration - currentSeconds;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <Ionicons
            name="chevron-down"
            size={28}
            color="white"
            onPress={() => handleCloseSheet()}
          />
          <Text style={styles.headerTitle}></Text>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </View>

        {/* --- Album Artwork --- */}
        <View style={styles.artWrapper}>
          <Image
            source={{
              uri: "https://images.genius.com/c92ea26f198481e5bd6baec27e97448c.1000x1000x1.jpg",
            }}
            style={styles.mainArt}
          />
        </View>

        {/* --- Track Info --- */}
        <View style={styles.trackInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>
              From Me to You - Mono / Remast
            </Text>
            <Text style={styles.songArtist}>The Beatles</Text>
          </View>
          <Ionicons name="heart-outline" size={28} color="white" />
        </View>

        {/* --- Progress Bar --- */}
        <View style={styles.progressArea}>
          <GestureDetector gesture={gesture}>
            <View style={styles.sliderContainer}>
              <View style={styles.track}>
                <Animated.View style={[styles.fill, animatedFillStyle]} />
                <Animated.View style={[styles.knob, animatedKnobStyle]} />
              </View>
            </View>
          </GestureDetector>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
            <Text style={styles.timeText}>-{formatTime(remainingSeconds)}</Text>
          </View>
        </View>

        {/* --- Main Controls --- */}
        <View style={styles.mainControls}>
          <Ionicons name="shuffle" size={24} color="#1DB954" />
          <Ionicons name="play-skip-back" size={38} color="white" />
          <Pressable style={styles.playButton}>
            <Ionicons name="pause" size={40} color="black" />
          </Pressable>
          <Ionicons name="play-skip-forward" size={38} color="white" />
          <View style={styles.repeatContainer}>
            <Ionicons name="repeat" size={24} color="#1DB954" />
            <View style={styles.repeatDot} />
          </View>
        </View>

        {/* --- Footer Controls --- */}
        <View style={styles.footerControls}>
          <View style={styles.deviceIndicator}>
            <MaterialIcons name="bluetooth" size={16} color="#1DB954" />
            <Text style={styles.deviceText}>BEATSPILL+</Text>
          </View>
          <View style={styles.footerRightIcons}>
            <Ionicons
              name="share-outline"
              size={22}
              color="white"
              style={{ marginRight: 25 }}
            />
            <MaterialIcons name="playlist-play" size={28} color="white" />
          </View>
        </View>

        {/* --- Lyrics Card --- */}
        <View style={styles.lyricsCard}>
          <View style={styles.lyricsHeader}>
            <Text style={styles.lyricsTitle}>Lyrics</Text>
            <Pressable style={styles.moreButton}>
              <Text style={styles.moreText}>MORE</Text>
              <MaterialCommunityIcons
                name="arrow-expand"
                size={14}
                color="white"
              />
            </Pressable>
          </View>
          <Text style={styles.lyricsPreview}>
            Da-da-da, da-da-dun-dun-da {"\n"}
            If there's anything that you want {"\n"}
            If there's anything I can do {"\n"}
            Just call on me and I'll send it along {"\n"}
            With love from me to you
          </Text>
        </View>

        {/* --- Artist Details Card --- */}
        <View style={styles.artistCard}>
          <View style={styles.artistHeader}>
            <Image
              source={{
                uri: "https://images.genius.com/c92ea26f198481e5bd6baec27e97448c.1000x1000x1.jpg",
              }}
              style={styles.artistPhoto}
            />
            <Text style={styles.artistCardLabel}>ABOUT THE ARTIST</Text>
          </View>

          <View style={styles.artistDetailsBody}>
            <View style={styles.artistNameRow}>
              <Text style={styles.artistNameText}>The Beatles</Text>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#1DB954"
                style={styles.verifiedBadge}
              />
            </View>
            <Text style={styles.artistDescription} numberOfLines={4}>
              The Beatles were an English rock band formed in Liverpool in 1960.
              With a line-up comprising John Lennon, Paul McCartney, George
              Harrison and Ringo Starr, they are regarded as the most
              influential band of all time.
            </Text>
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
  },
  headerTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
  repeatContainer: {
    alignItems: "center",
  },
  repeatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1DB954",
    marginTop: 2,
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
  lyricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  lyricsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  moreText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 5,
  },
  lyricsPreview: {
    color: "white",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },
  artistCard: {
    backgroundColor: "#1E2126",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  artistHeader: {
    position: "relative",
    height: 160,
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
  artistNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  artistNameText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  artistDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FullPlayer;
