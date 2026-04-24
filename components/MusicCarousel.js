import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 3;
const SPACING = 9;
const ITEM_SIZE = (width - SPACING * 7) / 3;

// 👉 Sample data (replace with real songs/albums)
const DATA = Array.from({ length: 30 }).map((_, i) => ({
  id: i.toString(),
  title: `Song ${i + 1}`,
  image: `https://picsum.photos/300/300?random=${i}`,
}));

// 👉 Split into pages (9 items per page)
const chunkData = (data, size) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};

const PAGES = chunkData(DATA, 9);

const Pagination = ({ data, scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => {
        const dotStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1.4, 0.8],
            Extrapolate.CLAMP,
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolate.CLAMP,
          );

          return {
            transform: [{ scale }],
            opacity,
          };
        });

        return <Animated.View key={i} style={[styles.dot, dotStyle]} />;
      })}
    </View>
  );
};

export default function SpeedDialGrid() {
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderItem = ({ item }) => (
    <Pressable style={styles.card}>
      <Image source={item.image} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <Text numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>
    </Pressable>
  );

  const renderPage = ({ item }) => (
    <View style={styles.page}>
      {item.map((gridItem) => (
        <View key={gridItem.id} style={{ margin: SPACING / 2 }}>
          {renderItem({ item: gridItem })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Speed dial</Text>

      <Animated.FlatList
        data={PAGES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate={0.85}
        showsHorizontalScrollIndicator={false}
        renderItem={renderPage}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <Pagination data={PAGES} scrollX={scrollX} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    paddingTop: 20,
  },
  header: {
    color: "white",
    fontSize: 26,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 10,
  },
  page: {
    width: width,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING,
  },
  card: {
    backgroundColor: "red",
    width: ITEM_SIZE + 2,
    height: ITEM_SIZE + 2,
    borderRadius: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  title: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
});
