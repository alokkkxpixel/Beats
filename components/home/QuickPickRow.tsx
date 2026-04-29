import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { decodeHtmlEntities, formatPlayCount } from "@/src/utils/transform";
import { QuickPick } from "./types";

import { useRouter } from "expo-router";

type QuickPickRowProps = {
  item: QuickPick;
};

export default function QuickPickRow({
  item,
}: QuickPickRowProps): React.JSX.Element {
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const router = useRouter();

  // console.log("quick pick", item);
  const handlePlay = async (id: string, link?: string) => {
    const response = await jioSaavnService.getSongByIdandLink(id, link);
    if (response.success && response.data[0]) {
      setCurrentTrack(response.data[0]);
    }
  };

  const handleArtistPress = () => {
    if (item.artistId || item.artistUrl) {
      router.push({
        pathname: "/artist/[id]",
        params: { id: Number(item.artistId), url: item.artistUrl },
      });
    }
  };

  const getImageUri = (cover: any): string => {
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

  return (
    <Pressable style={styles.row} onPress={() => handlePlay(item.id, item.url)}>
      <Image source={{ uri: getImageUri(item.cover) }} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {decodeHtmlEntities(item.title)}
        </Text>
        <Pressable
          onPress={handleArtistPress}
          style={{ alignSelf: "flex-start" }}
        >
          <Text
            style={styles.artist}
            className="tracking-tighter "
            numberOfLines={1}
          >
            {item.playCount && Number(item.playCount || "") > 0
              ? item.artist +
                " • " +
                formatPlayCount(Number(item.playCount || "")) +
                " plays"
              : item.artist}
          </Text>
        </Pressable>
      </View>
      <View style={styles.menu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#A3A3A3" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    marginBottom: 12,
  },
  cover: {
    width: 53,
    height: 53,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#18181B",
  },
  meta: {
    flex: 1,
  },
  title: {
    color: "#FAFAFA",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "sans-semibold",
    marginBottom: 2,
  },
  artist: {
    color: "#c7c7c7ff",
    fontSize: 12.3,
    lineHeight: 16,
    fontFamily: "sans-medium",
  },
  menu: {
    marginLeft: 12,
  },
});
