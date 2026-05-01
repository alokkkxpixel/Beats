import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { usePlayerStore } from "../src/store/usePlayerStore";

const { height } = Dimensions.get("window");

export default function MusicBottomSheet() {
  const {
    isMoreOptionOpen,
    minizeMoreOption,
    currentTrack,
    selectedSongOption,
    minimizeFullPlayer
  } = usePlayerStore();

  const router = useRouter();

  // console.log("current track", JSON.stringify(currentTrack,null , 2))
  // ✅ MAIN FIX: decide which song to show
  const activeSong = selectedSongOption || currentTrack;

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isMoreOptionOpen) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isMoreOptionOpen]);

  if (!activeSong) return null;

  // ✅ Safe image helper
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

  // ✅ Navigate to artist
  const handleArtistPress = () => {
    const artistId =
      activeSong?.artistId || activeSong?.artists?.primary[0]?.id;
    const artistUrl =
      activeSong?.artistUrl || activeSong?.artists?.primary[0]?.url;

    if (!artistId) return;

    minizeMoreOption();
     minimizeFullPlayer();
    router.push({
      pathname: "/artist/[id]",
      params: { id: artistId, url: artistUrl },
    });
  };

  // ✅ Menu config
  const menuItems = [
    { icon: "radio-outline", label: "Start radio" },
    { icon: "list-outline", label: "Add to queue" },
    { icon: "download-outline", label: "Download" },
    {
      icon: "person-outline",
      label: "Go to artist",
      fnx: handleArtistPress,
    },
  ];

  return (
    <Modal transparent visible={isMoreOptionOpen} animationType="none">
      {/* BACKDROP */}
      <Pressable onPress={minizeMoreOption} className="flex-1 bg-black/50" />

      {/* SHEET */}
      <Animated.View
        style={{
          transform: [{ translateY }],
        }}
        className="absolute bottom-0 w-full bg-zinc-900 rounded-t-3xl p-4"
      >
        {/* HANDLE */}
        <View className="w-12 h-1.5 bg-zinc-600 rounded-full self-center mb-4" />

        {/* HEADER */}
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
              {activeSong?.artist || activeSong?.artists?.primary[0].name || ""}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View className="flex-row justify-between mb-4">
          {[
            { icon: "play-skip-forward", label: "Play next" },
            { icon: "add", label: "Save" },
            { icon: "share-social", label: "Share" },
          ].map((item, i) => (
            <View key={i} className="items-center flex-1">
              <View className="bg-zinc-800 p-4 rounded-xl mb-2">
                <Ionicons name={item.icon} size={20} color="white" />
              </View>
              <Text className="text-white text-xs">{item.label}</Text>
            </View>
          ))}
        </View>

        {/* MENU */}
        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              item.fnx?.();
              minizeMoreOption();
            }}
            className="flex-row items-center py-3"
          >
            <Ionicons name={item.icon} size={20} color="#ccc" />
            <Text className="text-white ml-4">{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </Modal>
  );
}
