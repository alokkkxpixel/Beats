import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Easing, Pressable, Text, View } from "react-native";

import { usePlayerStore } from "../src/store/usePlayerStore";

// Import SVGs
import AddQueueIcon from "@/assets/app-icons/add-to-queue.svg";
import AlbumIcon from "@/assets/app-icons/album.svg";
import ArtistIcon from "@/assets/app-icons/artist.svg";
import DownloadIcon from "@/assets/app-icons/download.svg";
import ShareIcon from "@/assets/app-icons/more.svg";
import SaveIcon from "@/assets/app-icons/playlist-add.svg";
import PlayNextIcon from "@/assets/app-icons/playlist-next.svg";
import RadioIcon from "@/assets/app-icons/radio.svg";
import TextTicker from "react-native-text-ticker";

export default function MusicBottomSheet() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const selectedSongOption = usePlayerStore((s) => s.selectedSongOption);
  const minizeMoreOption = usePlayerStore((s) => s.minizeMoreOption);
  const minimizeFullPlayer = usePlayerStore((s) => s.minimizeFullPlayer);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playNext = usePlayerStore((s) => s.playNext);

  const router = useRouter();
  const activeSong = selectedSongOption || currentTrack;
  const hasPlayableSong =
    !!activeSong && typeof activeSong === "object" && !!activeSong.id;

  if (!activeSong) return null;

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

  const menuItems = [
    { icon: RadioIcon, label: "Start radio" },
    { icon: PlayNextIcon, label: "Play next", fnx: handlePlayNext },
    { icon: AddQueueIcon, label: "Add to queue", fnx: handleAddToQueue },
    { icon: DownloadIcon, label: "Download" },
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
    { icon: SaveIcon, label: "Save" },
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
            className="text-white text-base font-semibold"
          >
            {activeSong?.title || activeSong?.name}
          </Text>

          <TextTicker
            className="text-zinc-400 text-sm mt-1"
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

            <Text className="text-white text-[15px] ml-5">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
