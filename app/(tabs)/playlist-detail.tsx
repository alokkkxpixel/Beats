import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { usePlaylistInfinite } from "@/src/hooks/useQueries";
import { transformPlaylistToUI } from "@/src/utils/transform";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function PlayListDetailRoute() {
  const { playlistId, playlistUrl } = useLocalSearchParams<{
    playlistId?: string;
    playlistUrl?: string;
  }>();

  const navigation = useNavigation();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaylistInfinite(playlistId ?? null, playlistUrl ?? null);

  // For DEbuging  ADD DEBUG HERE
  // if (data?.pages?.length) {
  //   console.log(
  //     "Page:",
  //     data.pages.length,
  //     "Last songs:",
  //     data.pages[data.pages.length - 1]?.songs?.length,
  //   );
  // }

  // ✅ Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // ✅ Error state
  if (error || !data || !data.pages?.length) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>
          {error ? "Error loading playlist" : "Playlist not found"}
        </Text>
      </View>
    );
  }
  // ✅ 🔥 Merge all songs from pages
  // const allSongs = data?.pages?.flatMap((page: any) => page?.songs || []) ?? [];
  const seen = new Set();

  const allSongs =
    data?.pages
      ?.flatMap((page: any) => page?.songs || [])
      .filter((song: any) => {
        if (!song?.id) return false;

        if (seen.has(song.id)) {
          // console.log("Duplicate song found:", song.id, song.name);
          return false; // ❌ duplicate
        }

        seen.add(song.id);
        return true; // ✅ keep
      }) ?? [];
  // ✅ 🔥 Stable playlist info (first page only)
  const playlistInfo = data?.pages[0];

  // ✅ 🔥 Memoized transform (prevents re-renders/flicker)
  const playlist = React.useMemo(() => {
    if (!playlistInfo) return null;

    return transformPlaylistToUI({
      ...playlistInfo,
      songs: allSongs,
    });
  }, [playlistInfo, allSongs]);
  // ✅ Load more handler
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!playlist) return null;

  return (
    <AlbumDetailScreen
      route={{ params: { album: playlist } } as any}
      navigation={navigation}
      onLoadMore={handleLoadMore} // 🔥 important
      isMoreLoading={isFetchingNextPage} // 🔥 important
    />
  );
}
