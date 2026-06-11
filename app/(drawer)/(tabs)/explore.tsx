import ChevronIcon from "@/assets/app-icons/chevron-left.svg";
import Categories from "@/components/explore/Categories";
import Header from "@/components/Header";
import { useHomePreviews } from "@/src/hooks/useQueries";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { NewRelease } from "@/types/jiosaavn";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
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

const { width } = Dimensions.get("window");

// Handles both array image format [50x50, 150x150, 500x500] and plain strings
const getImageUri = (img: any): string => {
  if (Array.isArray(img)) return img[2] || img[1] || img[0] || "";
  if (typeof img === "string" && img) return img;
  return "";
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;

  const router = useRouter();
  const { data, isLoading } = useHomePreviews();
  const moodsAndGenres = data?.["promo:vx:data:76"] || [];

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

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const renderAlbumItem = ({ item }: { item: NewRelease }) => (
    // console.log(item),
    <Pressable
      onPress={async () => {
        if (item.type === "album") {
          router.push({
            pathname: "/album-detail",
            params: { albumId: item.id, albumUrl: item.url },
          });
        } else if (item.type === "playlist") {
          router.push({
            pathname: "/playlist-detail",
            params: { playlistId: item.id, playlistUrl: item.url },
          });
        } else if (item.type === "song") {
          const response = await jioSaavnService.getSongByIdandLink(
            item.id,
            item.url,
          );
          if (response.success && response.data[0]) {
            setCurrentTrack(response.data[0]);
          }
        }
      }}
      style={styles.albumCard}
    >
      <Image
        source={{ uri: getImageUri(item.image) }}
        style={styles.albumImage}
        contentFit="cover"
      />
      <Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text
        style={styles.albumSubtitle}
        className="capitalize font-sans-light"
        numberOfLines={2}
      >
        {item.subtitle ||
          `${item?.type || ""} • ${item.more_info?.artistMap?.artists?.[0]?.name || item.more_info?.artistMap?.primary?.[0]?.name || ""}`}
      </Text>
    </Pressable>
  );

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
          paddingBottom: 250,
        }}
      >
        {/* Category Grid */}
        <Categories />

        {/* New Albums Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New albums and singles</Text>
          <ChevronIcon
            width={20}
            height={20}
            fill="#999"
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </View>

        <View style={{ height: 280, marginBottom: 10 }}>
          <FlatList
            data={data?.raw_new_releases || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            keyExtractor={(item: any, index: number) =>
              item.id || item.listid || item.albumid || index.toString()
            }
            renderItem={renderAlbumItem}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={100}
            initialNumToRender={3}
            windowSize={3}
          />
        </View>

        {/* Moods and Genres Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {data?.modules?.["promo:vx:data:76"]?.title || "Moods and genres"}
            </Text>
            {data?.modules?.["promo:vx:data:76"]?.subtitle && (
              <Text style={styles.sectionSubtitle}>
                {data.modules["promo:vx:data:76"].subtitle}
              </Text>
            )}
          </View>
          <ChevronIcon
            width={20}
            height={20}
            fill="#999"
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </View>

        <View style={{ height: 280, marginBottom: 20 }}>
          <FlashList
            data={
              Array.from(
                {
                  length: Math.ceil(moodsAndGenres.length / 3),
                },
                (_, i) => moodsAndGenres.slice(i * 3, i * 3 + 3),
              ) || []
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item: columnItems }) => (
              <View style={{ marginRight: 12 }}>
                {columnItems?.map((mood: any) => (
                  <Pressable
                    key={mood.id}
                    style={styles.moodItemRow}
                    onPress={() => {
                      router.push({
                        pathname: "/playlist-detail",
                        params: { playlistId: mood.id, playlistUrl: mood.url },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: getImageUri(mood.image) }}
                      style={styles.moodRowImage}
                    />
                    <Text style={styles.moodRowTitle} numberOfLines={1}>
                      {mood.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>
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
  sectionSubtitle: {
    color: "#999",
    fontSize: 13,
    marginTop: 2,
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
  moodItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    width: width * 0.7,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  moodRowImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
  },
  moodRowTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
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
