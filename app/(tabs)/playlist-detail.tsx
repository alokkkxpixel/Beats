import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { usePlaylist } from "@/src/hooks/useQueries";
import { transformPlaylistToUI } from "@/src/utils/transform";

export default function PlayListDetailRoute() {
  const { playlistId, playlistUrl } = useLocalSearchParams<{
    playlistId?: string;
    playlistUrl?: string;
  }>();
  const navigation = useNavigation();

  // usePlaylist handles both cases:
  // - playlistId  → fetch by id  (jioSaavnService.getPlaylistById)
  // - playlistUrl → fetch by url (SaavnService.getPlaylistDetails via Vercel)
  const { data, isLoading, error } = usePlaylist(
    playlistId ?? null,
    playlistUrl ?? null,
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050505", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>
          {error ? "Error loading playlist" : "Playlist not found"}
        </Text>
      </View>
    );
  }

  // getPlaylistById returns { success, data: {...} }
  // getPlaylistDetails (URL-based) returns the playlist object directly
  const rawPlaylist = data?.data ?? data;
  const playlist = transformPlaylistToUI(rawPlaylist);

  return (
    <AlbumDetailScreen
      route={{ params: { album: playlist } } as any}
      navigation={navigation}
    />
  );
}
