import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { usePlaylist } from "@/src/hooks/useQueries";
import { transformPlaylistToUI } from "@/src/utils/transform";

export default function PlayListDetailRoute() {
  const { playlistId } = useLocalSearchParams();
  const navigation = useNavigation();

  const { data, isLoading, error } = usePlaylist(playlistId as string);

  // Fallback UI for loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050505", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // Fallback UI for error or not found
  if (error || !data?.success) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>{error ? "Error loading playlist" : "Playlist not found"}</Text>
      </View>
    );
  }

  const playlist = transformPlaylistToUI(data.data);

  return (
    <AlbumDetailScreen
      route={{ params: { album: playlist } } as any}
      navigation={navigation}
    />
  );
}
