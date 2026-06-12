import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { decodeHtmlEntities } from "@/src/utils/transform";
import { Lists } from "@/types/jiosaavn";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: PAGE_WIDTH } = Dimensions.get("window");
const width = PAGE_WIDTH;

const NUM_COLUMNS = 3;
const SPACING = 6;
const ITEM_SIZE = (width - SPACING * 7) / 3;

// 👉 Sample data (replace with real songs/albums)
const chunkData = (data: Lists[] | null, size: number) => {
  if (!data || !Array.isArray(data)) return [];
  const chunks = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};

// Fix #10: Separate component so hooks aren't called inside map()
const PaginationDot = ({ index, scrollX }: { index: number; scrollX: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value / PAGE_WIDTH,
      [index - 1, index, index + 1],
      [8, 20, 8],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value / PAGE_WIDTH,
      [index - 1, index, index + 1],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );
    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.paginationDot, animatedStyle]} />;
};

const Pagination = ({ data, scrollX }: { data: any[]; scrollX: any }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => (
        <PaginationDot key={i} index={i} scrollX={scrollX} />
      ))}
    </View>
  );
};

interface SpeedDialGridProps {
  data: Lists[] | null;
}

export default function SpeedDialGrid({ data }: SpeedDialGridProps) {
  const scrollX = useSharedValue(0);
  const router = useRouter();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setLoading = usePlayerStore((state) => state.setLoading);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  //  Chunk the real data prop instead of dummy data
  const PAGES = React.useMemo(() => chunkData(data, 9), [data]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleItemPress = (item: Lists) => {
    if (item.type === "song") {
      const partialTrack = {
        id: item.id,
        name: item.title,
        image: item.image,
        primaryArtists: item.subtitle || "",
        url: item.perma_url || item.url || "",
      };
      setCurrentTrack(partialTrack as any);
    } else if (item.type === "playlist") {
      router.push({
        pathname: "/playlist-detail",
        params: {
          playlistId: item.id,
          playlistUrl: item.perma_url || item.url,
        },
      });
    } else if (item.type === "album") {
      router.push({
        pathname: "/album-detail",
        params: { albumId: item.id, albumUrl: item.perma_url || item.url },
      });
    } else if (item.type === "artist") {
      router.push({
        pathname: "/artist/[id]",
        params: { id: item.id, url: item.perma_url || item.url },
      });
    }
  };

  if (!PAGES.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header} className="font-sans-semibold text-white">
            For You
          </Text>
          <Text style={styles.subtitle} className="font-sans-light">
            Curated based on your taste
          </Text>
        </View>
        <Pagination data={PAGES} scrollX={scrollX} />
      </View>

      <Animated.ScrollView
        horizontal
        removeClippedSubviews={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {PAGES.map((page, pageIndex) => (
          <View key={pageIndex} style={styles.page}>
            <View style={styles.grid}>
              {page.map((item: Lists) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemContainer}
                  activeOpacity={0.7}
                  onPress={() => handleItemPress(item)}
                >
                  <View
                    style={[
                      styles.card,
                      currentTrack?.id === item.id && styles.activeCard,
                    ]}
                  >
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={styles.image}
                    />
                    {/* Fix #6: Lightweight overlay instead of LinearGradient */}
                    <View
                      style={[StyleSheet.absoluteFill, styles.tileOverlay]}
                    />
                    <Text
                      style={styles.itemTitle}
                      className="text-sm font-sans-semibold text-white"
                      numberOfLines={1}
                    >
                      {decodeHtmlEntities(item.title)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  header: {
    color: "white",
    fontSize: 22,
    // fontWeight: "700",
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 5,
  },
  page: {
    width: PAGE_WIDTH,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemContainer: {
    width: ITEM_SIZE,
    marginBottom: 5,
    alignItems: "center",
  },

  card: {
    width: ITEM_SIZE - 2,
    height: ITEM_SIZE - 2,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeCard: {
    borderColor: "#ffffffff", // Or use your primary app color here
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  itemTitle: {
    position: "absolute",
    bottom: 2,
    left: 4,
    right: 4,
    color: "white",
    // fontSize: 11,
    // fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
  tileOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});
