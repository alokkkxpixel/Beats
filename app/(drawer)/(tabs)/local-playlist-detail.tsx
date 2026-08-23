import defaultCover from "@/assets/app-icons/defualt-cover.png";
import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { Image as RNImage, Text, View } from "react-native";

export default function LocalPlaylistDetailRoute() {
  const { playlistId } = useLocalSearchParams<{ playlistId?: string }>();
  const navigation = useNavigation();
  const loadPlaylists  = usePlaylistStore(s=> s.loadPlaylists);
  const playlists = usePlaylistStore(s=> s.playlists);

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

  // Resolve image in expected format for AlbumDetailScreen
  let playlistImage: any = null;
  if (playlist.image) {
    playlistImage = typeof playlist.image === "string"
      ? [{ quality: "500x500", url: playlist.image }]
      : playlist.image;
  } else if (playlist.songs && playlist.songs.length > 0) {
    playlistImage = playlist.songs[0].image;
  } else {
    playlistImage = [
      {
        quality: "500x500",
        url: RNImage.resolveAssetSource(defaultCover).uri,
      },
    ];
  }

  // Transform local playlist to match the expected format for AlbumDetailScreen
  const transformedPlaylist = {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || "",
    image: playlistImage,
    songs: playlist.songs || [],
    type: "playlist",
    subtitle: `${playlist.songs?.length || 0} songs`,
    year: new Date(playlist.createdAt).getFullYear(),
  };
  // console.log("transformedPlaylist", transformedPlaylist);

  return (
    <AlbumDetailScreen
      route={{ params: { album: transformedPlaylist } } as any}
      navigation={navigation}
      onLoadMore={() => {}}
      isMoreLoading={false}
    />
  );
}
