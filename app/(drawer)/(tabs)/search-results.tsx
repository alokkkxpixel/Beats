import { useDetailedSearch, useSearchInfinite } from "@/src/hooks/useQueries";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useSearchStore } from "@/src/store/useSearchStore";
import { SongDetail } from "@/types/jiosaavn";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mic, PlayCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TypedFlashList = FlashList as any;

type Category = "all" | "songs" | "albums" | "artists" | "playlists";

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Songs", value: "songs" },
  { label: "Albums", value: "albums" },
  { label: "Artists", value: "artists" },
  { label: "Playlists", value: "playlists" },
];

const getArtistNames = (item: any) => {
  if (typeof item?.artists === "string") return item.artists;

  const names =
    item?.artists?.primary?.map((artist: any) => artist?.name).filter(Boolean) ||
    item?.artists?.all?.map((artist: any) => artist?.name).filter(Boolean) ||
    item?.artistMap?.primary_artists
      ?.map((artist: any) => artist?.name)
      .filter(Boolean) ||
    item?.artistMap?.artists?.map((artist: any) => artist?.name).filter(Boolean) ||
    [];

  return names.join(", ");
};

const getSubtitleForItem = (item: any, itemType: string) => {
  const artistNames = getArtistNames(item);

  if (itemType === "song") {
    return (
      item.subtitle ||
      item.primaryArtists ||
      item.primary_artists ||
      artistNames ||
      item.singers ||
      item.music ||
      item.artist ||
      item.album?.name ||
      item.description ||
      ""
    );
  }

  if (itemType === "album") {
    return (
      item.subtitle ||
      artistNames ||
      item.artist ||
      item.music ||
      item.description ||
      ""
    );
  }

  if (itemType === "artist") {
    return item.subtitle || item.role || item.description || "";
  }

  if (itemType === "playlist") {
    return (
      item.subtitle || item.description || artistNames || item.artist || ""
    );
  }

  return (
    item.subtitle ||
    item.description ||
    item.primaryArtists ||
    item.primary_artists ||
    artistNames ||
    item.singers ||
    item.music ||
    item.artist ||
    item.role ||
    ""
  );
};

export default function SearchResultsScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(q || "");
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  // Sync with URL param
  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
  }, [q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Use the new detailed search for the "All" tab
  const { data: detailedData, isLoading: isDetailedLoading } =
    useDetailedSearch(selectedCategory === "all" ? debouncedQuery : "");

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useSearchInfinite(
    selectedCategory !== "all" ? debouncedQuery : "",
    selectedCategory === "all" ? "songs" : (selectedCategory as any),
  );

  const handleResultPress = (item: any) => {
    const type = item.type || selectedCategory.slice(0, -1);
    if (type === "song") {
      setCurrentTrack(item);
    } else if (type === "album") {
      router.push({
        pathname: "/album-detail",
        params: { albumId: item.id, albumUrl: item.url },
      });
    } else if (type === "playlist") {
      router.push({
        pathname: "/playlist-detail",
        params: { playlistId: item.id, playlistUrl: item.url },
      });
    } else if (type === "artist") {
      router.push({
        pathname: "/artist/[id]",
        params: { id: item.id, url: item.url },
      });
    }
  };

  const renderResultItem = (item: any, type?: string) => {
    const itemType = type || item.type || "";
    const isArtist = itemType === "artist";
    const subtitle = getSubtitleForItem(item, itemType);

    return (
      <Pressable
        style={styles.resultItem}
        key={item.id}
        onPress={() => handleResultPress(item)}
      >
        <Image
          source={{
            uri:
              item.image?.[1]?.url ||
              item.image?.[0]?.url ||
              item.image_url?.[1]?.url ||
              item.image_url?.[0]?.url ||
              (typeof item.image === "string" ? item.image : "") ||
              (typeof item.image_url === "string" ? item.image_url : ""),
          }}
          style={[styles.resultImage, isArtist && styles.artistImage]}
        />
        <View style={styles.resultInfo}>
          <Text
            style={styles.resultTitle}
            numberOfLines={1}
            className="font-sans-medium"
          >
            {item.title || item.name}
          </Text>
          <Text
            style={styles.resultSubtitle}
            numberOfLines={1}
            className="font-sans-light"
          >
            {/* {itemType.charAt(0).toUpperCase() + itemType.slice(1)} •{" "} */}
            {subtitle || item.subtitle}
          </Text>
        </View>
        {itemType === "song" && (
          <PlayCircle size={22} color="#888" strokeWidth={1.5} />
        )}
      </Pressable>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText} className="font-sans-bold">
        {title}
      </Text>
    </View>
  );

  const renderAllResults = () => {
    if (!detailedData) return null;
    const { songs, albums, artists, playlists } = detailedData;
    return (
      <View>
        {songs?.length > 0 && (
          <View>
            {renderSectionHeader("Songs")}
            {songs.map((item: SongDetail) => renderResultItem(item, "song"))}
          </View>
        )}
        {albums?.length > 0 && (
          <View>
            {renderSectionHeader("Albums")}
            {albums.map((item: any) => renderResultItem(item, "album"))}
          </View>
        )}
        {artists?.length > 0 && (
          <View>
            {renderSectionHeader("Artists")}
            {artists.map((item: any) => renderResultItem(item, "artist"))}
          </View>
        )}
        {playlists?.length > 0 && (
          <View>
            {renderSectionHeader("Playlists")}
            {playlists.map((item: any) => renderResultItem(item, "playlist"))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Search Header */}
        <View className="flex-row items-center px-2 py-2 mb-2">
          <Pressable
            onPress={() => router.back()}
            className="p-2 active:opacity-60"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/search")}
            className="flex-1 flex-row items-center bg-[#1a1a1a] rounded-full px-4 h-11 mx-1"
          >
            <TextInput
              className="flex-1 text-white text-[16px] h-full font-sans-medium"
              placeholder="Songs, artists, or albums"
              placeholderTextColor="#888"
              value={searchQuery}
              editable={false}
              pointerEvents="none"
            />
            {searchQuery.length > 0 && (
              <Ionicons name="close-circle" size={20} color="#888" />
            )}
          </Pressable>
          <View className="flex-row items-center">
            <Pressable className="p-2.5 bg-[#1a1a1a] rounded-full mx-1 active:opacity-60">
              <Mic size={20} color="white" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TypedFlashList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: any) => item.value}
            estimatedItemSize={100}
            renderItem={({ item }: any) => (
              <Pressable
                onPress={() => setSelectedCategory(item.value)}
                style={[
                  styles.categoryPill,
                  selectedCategory === item.value && styles.activeCategoryPill,
                ]}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === item.value &&
                      styles.activeCategoryLabel,
                  ]}
                  className="font-sans-medium"
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.filterContent}
          />
        </View>

        <View style={{ flex: 1 }}>
          {selectedCategory === "all" ? (
            isDetailedLoading ? (
              <View style={styles.centerLoader}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <TypedFlashList
                data={[1]}
                renderItem={({ item }: any) => renderAllResults()}
                estimatedItemSize={500}
                contentContainerStyle={styles.listContent}
              />
            )
          ) : isInfiniteLoading ? (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <TypedFlashList
              data={
                infiniteData?.pages.flatMap((page) => page.data.results) || []
              }
              renderItem={({ item }: any) =>
                renderResultItem(item, selectedCategory.slice(0, -1))
              }
              estimatedItemSize={70}
              keyExtractor={(item: any, index: number) => `${item.id}-${index}`}
              onEndReached={() => hasNextPage && fetchNextPage()}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                isFetchingNextPage ? (
                  <View style={styles.loaderFooter}>
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : null
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  filterBar: {
    height: 50,
    marginTop: 8,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  activeCategoryPill: {
    backgroundColor: "white",
    borderColor: "white",
  },
  categoryLabel: {
    color: "#ccc",
    fontSize: 14,
  },
  activeCategoryLabel: {
    color: "black",
  },
  listContent: {
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  artistImage: {
    borderRadius: 26,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 14,
  },
  resultTitle: {
    color: "white",
    fontSize: 16,
  },
  resultSubtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    color: "white",
    fontSize: 18,
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
