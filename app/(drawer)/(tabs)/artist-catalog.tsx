import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowDownUp,
  ArrowLeft,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useArtistInfinite } from "@/src/hooks/useQueries";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { decodeHtmlEntities, formatPlayCount } from "@/src/utils/transform";
import { AlbumType, SongType } from "@/types/jiosaavn";

type CatalogTab = "songs" | "albums";
type SortCategory = "popularity" | "latest" | "alphabetical";
type SortOrder = "asc" | "desc";

const catalogTabs: { key: CatalogTab; label: string }[] = [
  { key: "songs", label: "Songs" },
  { key: "albums", label: "Albums" },
];

const categoryTabs: { key: SortCategory; label: string }[] = [
  { key: "popularity", label: "Popularity" },
  { key: "latest", label: "Latest" },
  { key: "alphabetical", label: "A-Z" },
];

const orderTabs: { key: SortOrder; label: string }[] = [
  { key: "desc", label: "Desc" },
  { key: "asc", label: "Asc" },
];

const AnimatedFlashList: any = Animated.createAnimatedComponent(
  FlashList as any,
);

const mergeUniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const merged: T[] = [];

  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
};

const getImageUri = (img: any): string => {
  let url = "";

  if (Array.isArray(img)) {
    url = img[2]?.url || img[1]?.url || img[0]?.url || "";
  } else if (typeof img === "string") {
    url = img;
  }

  if (url === "https://static.saavncdn.com/_i/share-image-2.png" || !url) {
    return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
  }

  return url;
};

const getArtistNames = (artists: any) => {
  const names =
    artists?.primary?.map((artist: any) => artist?.name).filter(Boolean) ||
    artists?.all?.map((artist: any) => artist?.name).filter(Boolean) ||
    [];

  return names.join(", ");
};

const FilterPill = React.memo(
  ({
    label,
    active,
    onPress,
    icon,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    icon?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.filterPill, active && styles.filterPillActive]}
    >
      {icon}
      <Text
        style={[styles.filterPillText, active && styles.filterPillTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  ),
);
FilterPill.displayName = "FilterPill";

const SectionTab = React.memo(
  ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} style={styles.sectionTab}>
      <Text
        style={[styles.sectionTabText, active && styles.sectionTabTextActive]}
      >
        {label}
      </Text>
      <View
        style={[styles.sectionTabLine, active && styles.sectionTabLineActive]}
      />
    </Pressable>
  ),
);
SectionTab.displayName = "SectionTab";

const SongRow = React.memo(
  ({
    item,
    isActive,
    onPress,
    onOptionsPress,
  }: {
    item: SongType;
    isActive: boolean;
    onPress: () => void;
    onOptionsPress: () => void;
  }) => {
    const artistNames = getArtistNames(item.artists);
    const subtitle = decodeHtmlEntities(
      item.album?.name || artistNames || item.subtitle || "Single",
    );
    const meta = [
      artistNames,
      item.playCount ? `${formatPlayCount(item.playCount)} plays` : "",
    ]
      .filter(Boolean)
      .join(" • ");

    return (
      <Pressable
        onPress={onPress}
        style={[styles.listRow, isActive && styles.activeRow]}
      >
        <Image
          source={{ uri: getImageUri(item.image) }}
          style={styles.rowArtwork}
        />

        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle]} numberOfLines={1}>
            {decodeHtmlEntities(item.name || item.title || "")}
          </Text>

          <View style={styles.rowSubline}>
            {Boolean(item.explicitContent && item.explicitContent !== "0") && (
              <View style={styles.explicitBadge}>
                <Text style={styles.explicitBadgeText}>E</Text>
              </View>
            )}
            <Text style={styles.rowSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          {!!meta && (
            <Text style={styles.rowMeta} numberOfLines={1}>
              {decodeHtmlEntities(meta)}
            </Text>
          )}
        </View>

        <Pressable
          hitSlop={10}
          style={styles.rowAction}
          onPress={onOptionsPress}
        >
          <MoreVertical size={20} color="#8b8f98" />
        </Pressable>
      </Pressable>
    );
  },
);
SongRow.displayName = "SongRow";

const AlbumRow = React.memo(
  ({ item, onPress }: { item: AlbumType; onPress: () => void }) => {
    const artistNames = getArtistNames(item.artists);
    const meta = [
      item.year || "",
      item.songCount ? `${item.songCount} songs` : "",
      item.playCount ? `${formatPlayCount(item.playCount)} plays` : "",
    ]
      .filter(Boolean)
      .join(" • ");

    return (
      <Pressable onPress={onPress} style={styles.listRow}>
        <Image
          source={{ uri: getImageUri(item.image) }}
          style={styles.rowArtwork}
        />

        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {decodeHtmlEntities(item.name || item.title || "")}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {decodeHtmlEntities(artistNames || item.subtitle || "Album")}
          </Text>
          {!!meta && (
            <Text style={styles.rowMeta} numberOfLines={1}>
              {meta}
            </Text>
          )}
        </View>

        <View style={styles.rowAction}>
          <MoreVertical size={20} color="#8b8f98" />
        </View>
      </Pressable>
    );
  },
);
AlbumRow.displayName = "AlbumRow";

export default function ArtistCatalogScreen() {
  const { id, url, tab } = useLocalSearchParams<{
    id: string;
    url: string;
    tab?: CatalogTab;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [selectedTab, setSelectedTab] = React.useState<CatalogTab>(
    tab === "albums" ? "albums" : "songs",
  );
  const [selectedCategory, setSelectedCategory] =
    React.useState<SortCategory>("popularity");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [, startTransition] = React.useTransition();

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setSelectedSongOption = usePlayerStore(
    (state) => state.setSelectedSongOption,
  );
  const expandMoreOption = usePlayerStore((state) => state.expandMoreOption);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useArtistInfinite(id, url, {
    tab: selectedTab,
    pageSize: 10,
    sortBy: selectedCategory,
    sortOrder,
  });

  const artist = data?.pages?.[0];
  const shouldShowResultsLoading = isFetching && !isFetchingNextPage;

  const songs = React.useMemo(() => {
    const merged = (data?.pages ?? []).flatMap(
      (page: any) => page?.topSongs ?? [],
    );
    return mergeUniqueById<SongType>(merged);
  }, [data]);

  const albums = React.useMemo(() => {
    const merged = (data?.pages ?? []).flatMap(
      (page: any) => page?.topAlbums ?? [],
    );
    return mergeUniqueById<AlbumType>(merged);
  }, [data]);

  const listData = React.useMemo(
    () => (selectedTab === "songs" ? songs : albums),
    [selectedTab, songs, albums],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [32, 96],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      backgroundColor: "rgba(5,5,5,0.96)",
      paddingTop: insets.top,
      height: insets.top + 54,
    };
  });

  const handleSongPress = React.useCallback(
    async (song: SongType) => {
      const response = await jioSaavnService.getSongByIdandLink(
        song.id,
        song.url || song.perma_url || undefined,
      );

      if (response.success && response.data[0]) {
        setCurrentTrack(response.data[0]);
      }
    },
    [setCurrentTrack],
  );

  const handleSongOptions = React.useCallback(
    async (song: SongType) => {
      const response = await jioSaavnService.getSongByIdandLink(
        song.id,
        song.url || song.perma_url || undefined,
      );

      if (response.success && response.data[0]) {
        setSelectedSongOption(response.data[0]);
      } else {
        setSelectedSongOption(song as any);
      }

      expandMoreOption();
    },
    [expandMoreOption, setSelectedSongOption],
  );

  const handleAlbumPress = React.useCallback(
    (album: AlbumType) => {
      router.push({
        pathname: "/album-detail",
        params: {
          albumId: album.id,
          albumUrl: album.url,
        },
      });
    },
    [router],
  );

  const renderSongItem = React.useCallback(
    (item: SongType) => {
      const isActive = currentTrack?.id === item.id;

      return (
        <SongRow
          item={item}
          isActive={isActive}
          onPress={() => handleSongPress(item)}
          onOptionsPress={() => handleSongOptions(item)}
        />
      );
    },
    [currentTrack?.id, handleSongOptions, handleSongPress],
  );

  const renderAlbumItem = React.useCallback(
    (item: AlbumType) => {
      return <AlbumRow item={item} onPress={() => handleAlbumPress(item)} />;
    },
    [handleAlbumPress],
  );

  const renderHeader = React.useMemo(
    () => (
      <View>
        <View style={styles.compactHeader}>
          <Text style={styles.artistName} numberOfLines={2}>
            {decodeHtmlEntities(artist?.name || "")}
          </Text>
        </View>

        <View style={styles.controlsBlock}>
          <View style={styles.sectionTabsRow}>
            {catalogTabs.map((catalogTab) => (
              <SectionTab
                key={catalogTab.key}
                label={catalogTab.label}
                active={selectedTab === catalogTab.key}
                onPress={() =>
                  startTransition(() => setSelectedTab(catalogTab.key))
                }
              />
            ))}
          </View>

          <View style={styles.filtersRow}>
            {categoryTabs.map((categoryTab) => (
              <FilterPill
                key={categoryTab.key}
                label={categoryTab.label}
                active={selectedCategory === categoryTab.key}
                onPress={() =>
                  startTransition(() => setSelectedCategory(categoryTab.key))
                }
              />
            ))}
          </View>

          <View style={styles.filtersRow}>
            {orderTabs.map((orderTab) => (
              <FilterPill
                key={orderTab.key}
                label={orderTab.label}
                active={sortOrder === orderTab.key}
                onPress={() =>
                  startTransition(() => setSortOrder(orderTab.key))
                }
                icon={
                  orderTab.key === sortOrder ? (
                    <ArrowDownUp
                      size={14}
                      color={sortOrder === orderTab.key ? "#050505" : "#c4c7d0"}
                    />
                  ) : undefined
                }
              />
            ))}
          </View>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Top {selectedTab === "songs" ? "Songs" : "Albums"}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {selectedCategory} • {sortOrder}
            </Text>
          </View>
        </View>
      </View>
    ),
    [artist?.name, selectedCategory, selectedTab, sortOrder, startTransition],
  );

  const handleEndReached = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const keyExtractor = React.useCallback(
    (item: SongType | AlbumType) => item.id,
    [],
  );

  const renderListItem = React.useCallback(
    ({ item }: { item: SongType | AlbumType }) =>
      selectedTab === "songs"
        ? renderSongItem(item as SongType)
        : renderAlbumItem(item as AlbumType),
    [renderAlbumItem, renderSongItem, selectedTab],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Artist details not available</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.topBarIcon, { backgroundColor: "#222" }]}
        >
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <View style={[styles.topBar, { top: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.topBarIcon}>
          <ArrowLeft size={22} color="#fff" />
        </Pressable>

        <View style={styles.topBarRight}>
          <Pressable
            style={styles.topBarIcon}
            onPress={() => router.push("/search")}
          >
            <Search size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
      <Animated.View style={[styles.stickyHeader, headerAnimatedStyle]}>
        <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
          {decodeHtmlEntities(artist.name)}
        </Text>
      </Animated.View>

      <AnimatedFlashList
        data={listData}
        estimatedItemSize={74}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        keyExtractor={keyExtractor}
        getItemType={() => (selectedTab === "songs" ? "song" : "album")}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            {renderHeader}
            {shouldShowResultsLoading && (
              <View style={styles.resultsLoadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.resultsLoadingText}>Updating list...</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isFetching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.emptyTitle}>
                  No {selectedTab} found for this filter
                </Text>
                <Text style={styles.emptySubtitle}>
                  Try switching category or sort order.
                </Text>
              </>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.paginationLoader}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.paginationLoaderText}>Loading more...</Text>
            </View>
          ) : (
            <View style={{ height: 24 }} />
          )
        }
        renderItem={renderListItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 50,
    alignItems: "center",
  },
  topBarRight: {
    flexDirection: "row",
    gap: 12,
  },
  topBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 110,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  stickyHeaderTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "sans-semibold",
    textAlign: "center",
  },
  compactHeader: {
    paddingTop: 92,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  artistName: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 36,
    fontFamily: "sans-bold",
    letterSpacing: -0.8,
  },
  controlsBlock: {
    paddingBottom: 18,
    backgroundColor: "#050505",
  },
  sectionTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.09)",
  },
  sectionTab: {
    marginRight: 26,
    paddingVertical: 12,
  },
  sectionTabText: {
    color: "#6f737c",
    fontSize: 15,
    fontFamily: "sans-semibold",
  },
  sectionTabTextActive: {
    color: "#fff",
  },
  sectionTabLine: {
    marginTop: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  sectionTabLineActive: {
    backgroundColor: "#f5f5f5",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  filterPill: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#15171c",
    borderWidth: 1,
    borderColor: "#1e222a",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: "#f1f1f1",
    borderColor: "#f1f1f1",
  },
  filterPillText: {
    color: "#c4c7d0",
    fontSize: 13,
    fontFamily: "sans-medium",
  },
  filterPillTextActive: {
    color: "#050505",
  },
  resultsHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 4,
  },
  resultsTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "sans-semibold",
  },
  resultsSubtitle: {
    color: "#7f8590",
    fontSize: 13,
    textTransform: "capitalize",
    fontFamily: "sans-regular",
  },
  listContent: {
    paddingBottom: 180,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 12,
  },
  activeRow: {
    backgroundColor: "#0f1014",
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowArtwork: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#111",
    objectFit: "contain",
  },
  rowTitle: {
    color: "#f8f9fb",
    fontSize: 16,
    fontFamily: "sans-semibold",
  },
  activeTitle: {
    color: "#fff",
  },
  rowSubline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowSubtitle: {
    color: "#c5c9d3",
    fontSize: 12,
    fontFamily: "sans-regular",
    flexShrink: 1,
  },
  rowMeta: {
    color: "#7d838f",
    fontSize: 12,
    fontFamily: "sans-regular",
  },
  explicitBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#d8d9dc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  explicitBadgeText: {
    color: "#050505",
    fontSize: 10,
    fontFamily: "sans-bold",
  },
  rowAction: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "sans-semibold",
  },
  emptySubtitle: {
    color: "#8c919a",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    fontFamily: "sans-regular",
  },
  resultsLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(18,18,20,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultsLoadingText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "sans-medium",
  },
  paginationLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  paginationLoaderText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "sans-medium",
  },
});
