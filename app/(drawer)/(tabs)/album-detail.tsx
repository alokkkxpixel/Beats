import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useAlbum } from "@/src/hooks/useQueries";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { transformAlbumToUI } from "@/src/utils/transform";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Text, View } from "react-native";

export default function AlbumDetailRoute() {
  const { albumId, albumUrl } = useLocalSearchParams<{
    albumId?: string;
    albumUrl?: string;
  }>();

  const navigation = useNavigation();
  const likedSongs = usePlayerStore((state) => state.likedSongs);

  const isLikedPlaylist = albumId === "liked-songs";

  const { data, isLoading, error } = useAlbum(
    isLikedPlaylist ? null : (albumId ?? null),
    albumUrl ?? null,
  );
  // ✅ Liked Songs Conditional Branch
  if (isLikedPlaylist) {
    const playlist = {
      id: "liked-songs",
      name: "Liked music",
      title: "Liked music",
      artistName: "Various Artists",
      description:
        "Music that you like in any YouTube app will be shown here. You can change this in Settings.",
      type: "Auto playlist",
      year: "2026",
      playCount: null,
      language: "",
      explicitContent: false,
      url: "",
      songCount: likedSongs.length,
      artists: {
        primary: [],
        featured: [],
        all: [],
      },
      image: [
        {
          quality: "500x500",
          url: "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-songs-delhi-1200.png",
        },
      ],
      songs: likedSongs,
    };

    return (
      <AlbumDetailScreen
        route={{ params: { album: playlist } } as any}
        navigation={navigation}
      />
    );
  }

  // ✅ Loading
  // if (isLoading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         backgroundColor: "#050505",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       {/* <ActivityIndicator size="large" color="white" /> */}
  //     </View>
  //   );
  // }

  // ✅ Error
  if (!isLoading && (error || !data)) {
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
  //  // ✅ Error (only when not loading)
  //   if (!isLoading && (error || !data || !data.pages?.length)) {
  //     return (
  //       <View
  //         style={{
  //           flex: 1,
  //           backgroundColor: "#000",
  //           justifyContent: "center",
  //           alignItems: "center",
  //         }}
  //       >
  //         <Text style={{ color: "white" }}>
  //           {error ? "Error loading playlist" : "Playlist not found"}
  //         </Text>
  //       </View>
  //     );
  //   }

  // ✅ IMPORTANT: no pages here
  const rawAlbum = data?.data ?? data;

  const album = transformAlbumToUI(rawAlbum);

  if (!album) return null;

  return (
    <>
      <AlbumDetailScreen
        route={{ params: { album } } as any}
        navigation={navigation}
        isLoading={isLoading}
        // ❌ REMOVE THESE (not needed anymore)
        // onLoadMore
        // isMoreLoading
      />
    </>
  );
}
