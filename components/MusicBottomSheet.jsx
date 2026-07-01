import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import {
  Alert,
  Easing,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from "react-native";

import { usePlayerStore } from "../src/store/usePlayerStore";

// Import SVGs
import AddQueueIcon from "@/assets/app-icons/add-to-queue.svg";
import AlbumIcon from "@/assets/app-icons/album.svg";
import ArtistIcon from "@/assets/app-icons/artist.svg";
import DownloadIcon from "@/assets/app-icons/download.svg";
import ShareIcon from "@/assets/app-icons/more.svg";
import SaveIcon from "@/assets/app-icons/playlist-add.svg";
import PlayNextIcon from "@/assets/app-icons/playlist-next.svg";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import { Trash2 } from "lucide-react-native";
import TextTicker from "react-native-text-ticker";
import Toast from "react-native-toast-message";

export default function MusicBottomSheet() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const selectedSongOption = usePlayerStore((s) => s.selectedSongOption);
  const minizeMoreOption = usePlayerStore((s) => s.minizeMoreOption);
  const minimizeFullPlayer = usePlayerStore((s) => s.minimizeFullPlayer);
  const activeSong =
    usePlayerStore((state) => state.activeSong) ||
    selectedSongOption ||
    currentTrack;
  const { downloadTrack, deleteDownload, getDownloadProgress } =
    useDownloadStore();

  const isDownloaded = useDownloadStore((s) =>
    activeSong?.id ? s.downloadedTracks.has(activeSong.id) : false,
  );
  const progress = getDownloadProgress(activeSong?.id);

  const router = useRouter();
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playNext = usePlayerStore((s) => s.playNext);

  const openPlaylistModal = usePlaylistStore((s) => s.openPlaylistModal);
  const playlists = usePlaylistStore((s) => s.playlists);
  const removeSongFromPlaylist = usePlaylistStore(
    (s) => s.removeSongFromPlaylist,
  );
  const isPlaylistModalOpen = usePlaylistStore((s) => s.isPlaylistModalOpen);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const addSongToPlaylist = usePlaylistStore((s) => s.addSongToPlaylist);
  const loadPlaylists = usePlaylistStore((s) => s.loadPlaylists);
  useEffect(() => {
    loadPlaylists();
  }, []);
  if (!activeSong) return null;

  const hasPlayableSong =
    !!activeSong && typeof activeSong === "object" && !!activeSong.id;

  // Determine if the current song already exists in any playlist (ignore null entries)
  const inPlaylist = playlists.some((p) =>
    p.songs?.some((s) => s && s.id === activeSong.id),
  );

  // Conditional rendering of removal option only when playlist modal is open
  const removalOption =
    inPlaylist && isPlaylistModalOpen
      ? [
          {
            icon: SaveIcon,
            label: "Remove from playlist",
            fnx: handleRemoveFromPlaylist,
          },
        ]
      : [];

  const getImageUri = (cover) => {
    if (Array.isArray(cover)) {
      const target = cover[1] || cover[0] || cover[2] || "";
      if (typeof target === "string") return target;
      return target?.url || "";
    }

    return "";
  };

  const handleArtistPress = () => {
    const artistId =
      activeSong?.artistId || activeSong?.artists?.primary?.[0]?.id;
    const artistUrl =
      activeSong?.artistUrl || activeSong?.artists?.primary?.[0]?.url;

    if (!artistId) return;

    minizeMoreOption();
    minimizeFullPlayer();

    router.push({
      pathname: "/artist/[id]",
      params: { id: artistId, url: artistUrl },
    });
  };

  const handleAlbumPress = () => {
    const albumId = activeSong?.album?.id || activeSong?.albumId;
    const albumUrl = activeSong?.album?.url || activeSong?.albumUrl;

    if (!albumId) return;

    minizeMoreOption();
    minimizeFullPlayer();

    router.push({
      pathname: "/album-detail",
      params: { albumId, albumUrl },
    });
  };

  const handlePlayNext = async () => {
    if (!hasPlayableSong) return;

    await playNext(activeSong);
    minizeMoreOption();
  };

  const handleAddToQueue = async () => {
    if (!hasPlayableSong) return;

    await addToQueue(activeSong);
    minizeMoreOption();
  };

  const handleSaveToPlaylist = () => {
    if (!hasPlayableSong) return;
    openPlaylistModal(activeSong);
    minizeMoreOption();
  };

  // Remove song from first playlist where it exists
  const handleRemoveFromPlaylist = () => {
    if (!hasPlayableSong) return;
    // Find playlist containing the song
    const containing = playlists.find((p) =>
      p.songs?.some((s) => s.id === activeSong.id),
    );
    if (containing) {
      removeSongFromPlaylist(containing.id, activeSong.id);
    }
    minizeMoreOption();
  };
  const handleCreateNewPlaylist = () => {
    if (!hasPlayableSong) return;
    Alert.prompt(
      "Create Playlist",
      "Enter playlist name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (name) => {
            if (!name) return;
            const newPl = createPlaylist(name);
            addSongToPlaylist(newPl.id, activeSong);
            minizeMoreOption();
          },
        },
      ],
      "plain-text",
    );
  };
  const menuItems = [
    { icon: PlayNextIcon, label: "Play next", fnx: handlePlayNext },
    { icon: AddQueueIcon, label: "Add to queue", fnx: handleAddToQueue },
    // Always allow adding to a (new) playlist
    { icon: SaveIcon, label: "Add to playlist", fnx: handleSaveToPlaylist },
    {
      icon: SaveIcon,
      label: "Create new playlist",
      fnx: handleCreateNewPlaylist,
    },
    // Conditional removal option when song already in a playlist and modal open
    ...(inPlaylist
      ? [
          {
            icon: SaveIcon,
            label: "Remove from playlist",
            fnx: handleRemoveFromPlaylist,
          },
        ]
      : []),
    ...(isDownloaded
      ? [
          {
            icon: (props) => (
              <Trash2 size={props.width || 24} color="#ef4444" />
            ),
            label: "Delete download",
            fnx: async () => {
              Alert.alert(
                "Delete Download",
                "Are you sure you want to delete this song from your downloads?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteDownload(activeSong.id);
                        ToastAndroid.show(
                          "Download deleted",
                          ToastAndroid.LONG,
                        );
                        minizeMoreOption();
                      } catch (error) {
                        ToastAndroid.show(
                          "Failed to delete download",
                          ToastAndroid.SHORT,
                        );
                      }
                    },
                  },
                ],
                {
                  cancelable: true,
                },
              );
            },
          },
        ]
      : progress?.state === "downloading"
        ? [
            {
              icon: DownloadIcon,
              label: `Downloading (${Math.round(progress.progress * 100)}%)`,
              fnx: () => {},
            },
          ]
        : [
            {
              icon: DownloadIcon,
              label: "Download",
              fnx: async () => {
                minizeMoreOption();
                Toast.show({
                  type: "success",
                  text1: "Downloading started !",
                  text2: "Check your downloads for more info",
                });
                ToastAndroid.show("Download started", ToastAndroid.LONG);
                await downloadTrack(activeSong);
              },
            },
          ]),
    {
      icon: AlbumIcon,
      label: "Go to album",
      fnx: handleAlbumPress,
    },
    {
      icon: ArtistIcon,
      label: "Go to artist",
      fnx: handleArtistPress,
    },
  ];

  const quickActions = [
    { icon: PlayNextIcon, label: "Play next", fnx: handlePlayNext },
    // Always allow adding to a (new) playlist
    { icon: SaveIcon, label: "Add to playlist", fnx: handleSaveToPlaylist },
    {
      icon: SaveIcon,
      label: "Create new playlist",
      fnx: handleCreateNewPlaylist,
    },
    // If already in a playlist, also provide removal option
    ...(inPlaylist
      ? [
          {
            icon: SaveIcon,
            label: "Remove from playlist",
            fnx: handleRemoveFromPlaylist,
          },
        ]
      : []),
    { icon: ShareIcon, label: "Share" },
  ];

  const primaryArtists = activeSong?.artists?.primary;
  const getArtistName = (song) => {
    return (
      song?.primaryArtists ||
      song?.artists?.primary
        ?.map((artist) => artist?.name)
        .filter(Boolean)
        .join(", ") ||
      song?.subtitle ||
      "Unknown Artist"
    );
  };
  // const artistName =
  //   activeSong?.primaryArtists ||
  //   activeSong?.artists?.primary
  //     ?.map((artist) => artist?.name)
  //     .filter(Boolean)
  //     .join(", ") ||
  //   activeSong?.subtitle ||
  //   "Unknown Artist";
  const artistName = getArtistName(activeSong);
  return (
    <View className="flex-1 px-5 pt-2">
      {/* Header */}
      <View className="flex-row items-center pb-4 border-b border-zinc-500">
        <View className="w-14 h-14 rounded-md overflow-hidden">
          <Image
            source={{
              uri: getImageUri(activeSong?.cover || activeSong?.image),
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>

        <View className="flex-1 ml-3">
          <Text
            numberOfLines={2}
            className="text-white text-base font-sans-semibold"
          >
            {activeSong?.title || activeSong?.name}
          </Text>

          <TextTicker
            className="text-zinc-400 text-sm font-sans-medium mt-1"
            // style={styles.miniTitle}
            duration={18000}
            animationType="scroll"
            loop
            bounce={false}
            repeatSpacer={40}
            marqueeDelay={1500}
            easing={Easing.linear}
          >
            {artistName}
          </TextTicker>
        </View>
      </View>

      {/* Menu Items */}
      <View className="mt-2">
        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (item.fnx) {
                item.fnx();
              } else {
                minizeMoreOption();
              }
            }}
            className="flex-row items-center py-4"
          >
            <item.icon width={24} height={24} fill="white" />

            <Text className="text-white font-sans-regular text-[15px] ml-5">
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
