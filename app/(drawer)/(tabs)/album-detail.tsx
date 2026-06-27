import AlbumDetailScreen from "@/components/AlbumDetailScreen";
import { useAlbum } from "@/src/hooks/useQueries";
import { getDownloadedTrackMetadata } from "@/src/lib/storage";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { transformAlbumToUI } from "@/src/utils/transform";
import { SongDetail } from "@/types/jiosaavn";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Image as RNImage, Text, View } from "react-native";
import { DownloadManager } from "react-native-nitro-player";

export default function AlbumDetailRoute() {
  const { albumId, albumUrl } = useLocalSearchParams<{
    albumId?: string;
    albumUrl?: string;
  }>();

  const navigation = useNavigation();
  const likedSongs = usePlayerStore((state) => state.likedSongs);
  const downloadedTracksSize = useDownloadStore(
    (state) => state.downloadedTracks.size,
  );

  const isLikedPlaylist = albumId === "liked-songs";
  const isDownloadedPlaylist = albumId === "downloaded-songs";

  const [downloadedSongs, setDownloadedSongs] = useState<SongDetail[]>([]);
  const [isDownloadsLoading, setIsDownloadsLoading] = useState(false);

  useEffect(() => {
    if (isDownloadedPlaylist) {
      console.log("📥 Loading downloaded playlist...");
      setIsDownloadsLoading(true);
      DownloadManager.getAllDownloadedTracks()
        .then((tracks) => {
          console.log("📥 Fetched downloaded tracks count:", tracks?.length);
          const songsList = tracks.map((t) => {
            console.log("📥 Track item:", t.originalTrack);
            const savedMetadata = getDownloadedTrackMetadata(
              t.originalTrack.id,
            );
            if (savedMetadata) {
              return savedMetadata;
            }
            if (t.originalTrack?.extraPayload?.song) {
              return t.originalTrack.extraPayload.song;
            }
            return {
              id: t.originalTrack.id,
              name: t.originalTrack.title,
              title: t.originalTrack.title,
              duration: t.originalTrack.duration,
              album: t.originalTrack.album,
              image: t.originalTrack.artwork
                ? [{ quality: "500x500", url: t.originalTrack.artwork }]
                : [],
              primaryArtists: t.originalTrack.artist,
              url: t.originalTrack.url,
            } as any;
          });
          setDownloadedSongs(songsList);
        })
        .catch((err) =>
          console.error("📥 Error fetching downloaded tracks:", err),
        )
        .finally(() => {
          console.log("📥 Finished loading downloaded playlist");
          setIsDownloadsLoading(false);
        });
    }
  }, [isDownloadedPlaylist, downloadedTracksSize]);

  const { data, isLoading, error } = useAlbum(
    isLikedPlaylist || isDownloadedPlaylist ? null : (albumId ?? null),
    albumUrl ?? null,
  );

  // ✅ Downloads Playlist Conditional Branch
  if (isDownloadedPlaylist) {
    const playlist = {
      id: "downloaded-songs",
      name: "Downloads",
      title: "Downloads",
      artistName: "Device Storage",
      description: "Offline playback of downloaded tracks on your device.",
      type: "Offline Playlist",
      year: "",
      playCount: null,
      language: "",
      explicitContent: false,
      url: "",
      songCount: downloadedSongs.length,
      artists: {
        primary: [],
        featured: [],
        all: [],
      },
      image: [
        {
          quality: "500x500",
          url: RNImage.resolveAssetSource(
            require("@/assets/images/downloadedCover.jpg"),
          ).uri,
        },
      ],
      songs: downloadedSongs,
    };

    return (
      <AlbumDetailScreen
        route={{ params: { album: playlist } } as any}
        navigation={navigation}
        isLoading={isDownloadsLoading}
      />
    );
  }

  // ✅ Liked Songs Conditional Branch
  if (isLikedPlaylist) {
    const playlist = {
      id: "liked-songs",
      name: "Liked music",
      title: "Liked music",
      artistName: "Various Artists",
      description: "Music that you like will be shown here.",
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
          url: RNImage.resolveAssetSource(
            require("@/assets/images/liked-songs.png"),
          ).uri,
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
