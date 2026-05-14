import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

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

  return (
    <View className="flex-1 px-4  w-full  ">
      <View className="flex-row items-center gap-3 mb-4 ">
        <View className="w-12 h-12 bg-zinc-700 rounded-md overflow-hidden">
          <Image
            source={{
              uri: getImageUri(activeSong?.cover || activeSong?.image),
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>

        <View className="flex-1">
          <Text className="text-white font-semibold">
            {activeSong?.title || activeSong?.name}
          </Text>

          <Text className="text-zinc-400 text-xs">
            {activeSong?.artist ||
              activeSong?.artists?.primary?.[0]?.name ||
              ""}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-4">
        {quickActions.map((item, i) => (
          <View key={i} className="items-center flex-1">
            <Pressable
              className="bg-zinc-800 p-4 rounded-xl mb-2"
              onPress={item.fnx}
            >
              <item.icon width={20} height={20} color="white" />
            </Pressable>
            <Text className="text-white text-xs">{item.label}</Text>
          </View>
        ))}
      </View>

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
          className="flex-row items-center py-3"
        >
          <item.icon fill="white" width={22} height={22} />
          <Text className="text-white ml-4">{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
