import { useHomePreviews } from "@/src/hooks/useQueries";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Handles both array image format [50x50, 150x150, 500x500] and plain strings
const getImageUri = (img: any): string => {
  if (Array.isArray(img)) return img[2] || img[1] || img[0] || "";
  if (typeof img === "string" && img) return img;
  return "";
};

interface CategoriesDetailsPageProps {
  categoryType: string;
  title: string;
}

const CategoriesDetailsPage = ({
  categoryType,
  title,
}: CategoriesDetailsPageProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useHomePreviews();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const renderHorizontalGrid = (
    dataList: any[],
    sectionTitle: string,
    isSquare: boolean = true,
  ) => {
    if (!dataList || dataList.length === 0) return null;
    const chunkedData = Array.from(
      { length: Math.ceil(dataList.length / 2) },
      (_, i) => dataList.slice(i * 2, i * 2 + 2),
    );
    // console.log(JSON.stringify(chunkedData[0], null, 2));
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>{sectionTitle}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <View style={{ height: 420 }}>
          <FlashList
            data={chunkedData}
            horizontal
            showsHorizontalScrollIndicator={false}
            // estimatedItemSize={width * 0.45}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item: columnItems }) => (
              <View style={{ marginRight: 16 }}>
                {columnItems.map((item: any) => (
                  <Pressable
                    key={item.id}
                    style={styles.gridCard}
                    onPress={() => {
                      if (item.type === "song") {
                        jioSaavnService
                          .getSongByIdandLink(item.id, item.url)
                          .then((res) => {
                            if (res.success && res.data[0])
                              setCurrentTrack(res.data[0]);
                          });
                      } else {
                        router.push({
                          pathname:
                            item.type === "album"
                              ? "/album-detail"
                              : "/playlist-detail",
                          params: {
                            albumId: item.id,
                            playlistId: item.id,
                            albumUrl: item.url,
                            playlistUrl: item.url,
                          },
                        });
                      }
                    }}
                  >
                    <Image
                      source={{ uri: getImageUri(item.image) }}
                      style={styles.gridImage}
                    />
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.gridSubtitle} numberOfLines={1}>
                      {item.type +
                        " • " +
                        (item.more_info?.artistMap?.artists?.[0]?.name ||
                          item?.subtitle)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>
      </View>
    );
  };

  const renderSimpleSongsList = (dataList: any[], sectionTitle: string) => {
    if (!dataList || dataList.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>{sectionTitle}</Text>
        </View>
        <FlashList
          data={dataList.slice(0, 12)}
          horizontal
          showsHorizontalScrollIndicator={false}
          // estimatedItemSize={160}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.simpleCard}
              onPress={async () => {
                if (item.type === "song") {
                  const res = await jioSaavnService.getSongByIdandLink(
                    item.id,
                    item.url,
                  );
                  if (res.success && res.data[0]) setCurrentTrack(res.data[0]);
                } else {
                  router.push({
                    pathname:
                      item.type === "album"
                        ? "/album-detail"
                        : "/playlist-detail",
                    params: {
                      albumId: item.id,
                      playlistId: item.id,
                      albumUrl: item.url,
                      playlistUrl: item.url,
                    },
                  });
                }
              }}
            >
              <Image
                source={{ uri: getImageUri(item.image) }}
                style={styles.simpleImage}
              />
              <Text style={styles.simpleTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.simpleSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </Pressable>
          )}
        />
      </View>
    );
  };

  const getPageContent = () => {
    switch (categoryType) {
      case "1": // New Releases
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            {renderSimpleSongsList(data?.quick_picks || [], "New Singles")}
            {renderHorizontalGrid(data?.newreleases || [], "New Albums")}
          </ScrollView>
        );
      case "2": // Charts
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {renderSimpleSongsList(
              data?.charts?.slice(0, 8) || [],
              "Top Charts",
            )}
            {renderHorizontalGrid(data?.charts?.slice(8) || [], "More Charts")}
          </ScrollView>
        );
      case "3": // Moods and Genres
        const moodsData = data?.["promo:vx:data:76"] || [];
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {renderHorizontalGrid(moodsData as any[], "Moods & Genres")}
          </ScrollView>
        );
      case "4": // Cricket Fever
        const cricketData = data?.["promo:vx:data:209"] || [];
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {/* {renderSimpleSongsList(cricketData.slice(0, 8), "Featured")}
            {renderHorizontalGrid(
              // cricketData.slice(8) ,
              "All Cricket Playlists",
            )} */}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{getPageContent()}</View>
    </View>
  );
};

export default CategoriesDetailsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  simpleCard: {
    width: 150,
    marginRight: 16,
  },
  simpleImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  simpleTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  simpleSubtitle: {
    color: "#999",
    fontSize: 13,
  },
  gridCard: {
    width: width * 0.42,
    marginBottom: 20,
  },
  gridImage: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  gridSubtitle: {
    color: "#999",
    fontSize: 12,
  },
});
