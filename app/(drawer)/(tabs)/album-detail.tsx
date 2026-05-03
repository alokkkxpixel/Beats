import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useAlbum } from "@/src/hooks/useQueries";
import { transformAlbumToUI } from "@/src/utils/transform";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AlbumDetailRoute() {
  const { albumId, albumUrl } = useLocalSearchParams<{
    albumId?: string;
    albumUrl?: string;
  }>();

  const navigation = useNavigation();

  const { data, isLoading, error } = useAlbum(
    albumId ?? null,
    albumUrl ?? null,
  );

  // ✅ Loading
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

  // ✅ Error
  if (error || !data) {
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
          {error ? "Error loading album" : "Album not found"}
        </Text>
      </View>
    );
  }

  // ✅ IMPORTANT: no pages here
  const rawAlbum = data?.data ?? data;

  const album = transformAlbumToUI(rawAlbum);

  if (!album) return null;

  return (
    <AlbumDetailScreen
      route={{ params: { album } } as any}
      navigation={navigation}
      // ❌ REMOVE THESE (not needed anymore)
      // onLoadMore
      // isMoreLoading
    />
  );
}
