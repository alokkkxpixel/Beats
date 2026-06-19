import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function LocalPlaylistDetailRoute() {
  const { playlistId } = useLocalSearchParams<{ playlistId?: string }>();
  const navigation = useNavigation();
  const { playlists, loadPlaylists } = usePlaylistStore();

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const playlist = React.useMemo(() => {
    if (!playlistId) return null;
    return playlists.find((p) => p.id === playlistId);
  }, [playlistId, playlists]);

  if (!playlistId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Playlist ID not provided</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Playlist not found</Text>
      </View>
    );
  }

  // Transform local playlist to match the expected format for AlbumDetailScreen
  const transformedPlaylist = {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || "",
    image: playlist.image || null,
    songs: playlist.songs || [],
    type: "playlist",
    subtitle: `${playlist.songs?.length || 0} songs`,
    year: new Date(playlist.createdAt).getFullYear(),
  };

  return (
    <AlbumDetailScreen
      route={{ params: { album: transformedPlaylist } } as any}
      navigation={navigation}
      onLoadMore={() => {}}
      isMoreLoading={false}
    />
  );
}
