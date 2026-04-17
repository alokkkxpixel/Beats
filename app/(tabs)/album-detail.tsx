import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAlbum } from "@/src/hooks/useQueries";
import { transformAlbumToUI } from "@/src/utils/transform";

export default function AlbumDetailRoute() {
  const { albumId, albumUrl } = useLocalSearchParams<{
    albumId?: string;
    albumUrl?: string;
  }>();
  const navigation = useNavigation();

  // useAlbum handles both:
  // - albumId  → fetch by id  (jioSaavnService.getAlbumById)
  // - albumUrl → fetch by url (SaavnService.getAlbumDetails via Vercel)
  const { data, isLoading, error } = useAlbum(
    albumId ?? null,
    albumUrl ?? null,
  );

  // Fallback UI for loading
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

  // Fallback UI for error or not found
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

  // getAlbumById returns { success, data: {...} }, getAlbumDetails returns the object directly
  const rawAlbum = data?.data ?? data;
  const album = transformAlbumToUI(rawAlbum);

  return (
    <AlbumDetailScreen
      route={{ params: { album } } as any}
      navigation={navigation}
    />
  );
}
