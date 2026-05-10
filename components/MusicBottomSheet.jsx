import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import { usePlayerStore } from "../src/store/usePlayerStore";

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
    if (typeof cover === "string" && cover) {
      if (cover.includes("50x50")) {
        return cover.replace("50x50", "150x150");
      }
      return cover;
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
    { icon: "radio-outline", label: "Start radio" },
    { icon: "list-outline", label: "Add to queue", fnx: handleAddToQueue },
    { icon: "download-outline", label: "Download" },
    {
      icon: "disc-outline",
      label: "Go to album",
      fnx: handleAlbumPress,
    },
    {
      icon: "person-outline",
      label: "Go to artist",
      fnx: handleArtistPress,
    },
  ];

  const quickActions = [
    { icon: "play-skip-forward", label: "Play next", fnx: handlePlayNext },
    { icon: "add", label: "Save" },
    { icon: "share-social", label: "Share" },
  ];

  return (
    <View className="flex-1 px-4 w-full">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-12 h-12 bg-zinc-700 rounded-md overflow-hidden">
          <Image
            source={{
              uri: getImageUri(activeSong?.cover || activeSong?.image),
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
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
              <Ionicons name={item.icon} size={20} color="white" />
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
          <Ionicons name={item.icon} size={20} color="#ccc" />
          <Text className="text-white ml-4">{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
