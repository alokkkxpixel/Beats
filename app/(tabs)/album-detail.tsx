import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { ALBUMS } from "@/constants/album-data";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function AlbumDetailRoute() {
  const { albumId } = useLocalSearchParams();
  const navigation = useNavigation();

  // Find the album by ID from our constants
  const album = ALBUMS.find((a) => a.id === albumId);

  // Fallback UI if album not found
  if (!album) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Album not found</Text>
      </View>
    );
  }

  return <AlbumDetailScreen route={{ params: { album } } as any} navigation={navigation} />;
}
