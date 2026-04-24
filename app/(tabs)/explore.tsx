import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/Header";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  {
    id: "1",
    title: "New releases",
    icon: "sparkles",
    color: "#2A2A2A",
    iconType: "Ionicons",
  },
  {
    id: "2",
    title: "Charts",
    icon: "trending-up",
    color: "#2A2A2A",
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "3",
    title: "Moods and genres",
    icon: "emoticon-happy-outline",
    color: "#2A2A2A",
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "4",
    title: "Podcasts",
    icon: "podcast",
    color: "#2A2A2A",
    iconType: "MaterialCommunityIcons",
  },
];

const ALBUMS = [
  {
    id: "1",
    title: "SHE DID IT AGAIN (feat. Z...",
    subtitle: "Single • Tyla",
    image: "https://picsum.photos/400/400?10",
  },
  {
    id: "2",
    title: "PARIS",
    subtitle: "Single • Guru Randhawa, Gurjit Gill & Verse",
    image: "https://picsum.photos/400/400?11",
  },
  {
    id: "3",
    title: "Ballin",
    subtitle: "Single • G-S",
    image: "https://picsum.photos/400/400?12",
  },
];

const MOODS = [
  { id: "1", title: "Pop", color: "#E91E63" },
  { id: "2", title: "Focus", color: "#607D8B" },
  { id: "3", title: "Workout", color: "#FF9800" },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;

  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      scrollY.value = currentOffset;
      const diff = currentOffset - lastContentOffset.value;

      if (currentOffset <= 0) {
        translateY.value = withTiming(0);
      } else {
        translateY.value = Math.max(
          -TOTAL_HEADER_HEIGHT,
          Math.min(0, translateY.value - diff),
        );
      }
      lastContentOffset.value = currentOffset;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["transparent", "#000000"],
    );

    return {
      transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
      opacity: interpolate(
        translateY.value,
        [-TOTAL_HEADER_HEIGHT, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerWrapper,
          headerAnimatedStyle,
          { height: TOTAL_HEADER_HEIGHT, paddingTop: insets.top },
        ]}
      >
        <Header title="Explore" />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT + 20,
          paddingBottom: 100,
        }}
      >
        {/* Category Grid */}
        <View style={styles.gridContainer}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat.id} style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                {cat.iconType === "Ionicons" ? (
                  <Ionicons name={cat.icon as any} size={24} color="white" />
                ) : (
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color="white"
                  />
                )}
              </View>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* New Albums Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New albums and singles</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {ALBUMS.map((album) => (
            <View key={album.id} style={styles.albumCard}>
              <Image
                source={{ uri: album.image }}
                style={styles.albumImage}
                contentFit="cover"
              />
              <Text style={styles.albumTitle} numberOfLines={1}>
                {album.title}
              </Text>
              <Text style={styles.albumSubtitle} numberOfLines={2}>
                {album.subtitle}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Moods and Genres Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Moods and genres</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {MOODS.map((mood) => (
            <View key={mood.id} style={styles.moodCard}>
              <View
                style={[styles.moodAccent, { backgroundColor: mood.color }]}
              />
              <Text style={styles.moodTitle}>{mood.title}</Text>
            </View>
          ))}
        </ScrollView>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 32,
  },
  categoryCard: {
    width: (width - 44) / 2,
    height: 100,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  iconContainer: {
    // opacity: 0.8,
  },
  categoryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 32,
  },
  albumCard: {
    width: width * 0.45,
    marginRight: 16,
  },
  albumImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  albumSubtitle: {
    color: "#999",
    fontSize: 12,
  },
  moodCard: {
    width: width * 0.4,
    height: 60,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  moodAccent: {
    width: 6,
    height: "60%",
    borderRadius: 3,
    marginLeft: 12,
    marginRight: 12,
  },
  moodTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
