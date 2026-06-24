import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { decodeHtmlEntities, formatPlayCount } from "@/src/utils/transform";
import { QuickPick } from "./types";

import { addToRecentActivity } from "@/src/lib/storage";
import { useRouter } from "expo-router";
import PlayingIndicator from "../PlayingIndicator";

type QuickPickRowProps = {
  item: QuickPick;
};
function QuickPickRow({ item }: QuickPickRowProps): React.JSX.Element {
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const router = useRouter();
  const expandMoreOption = usePlayerStore((s) => s.expandMoreOption);
  // Fix #4: Only subscribe to whether THIS row is active, not the entire currentTrack object
  const isActive = usePlayerStore((s) => s.currentTrack?.id === item.id);
  const setSelectedSongOption = usePlayerStore((s) => s.setSelectedSongOption);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isCurrent = currentTrack?.id === item.id;
  const handlePlay = (id: string, link?: string) => {
    const partialTrack = {
      id: id,
      name: item.title,
      image: item.cover,
      primaryArtists: item.artist,
      url: link || item.url,
    };
    setCurrentTrack(partialTrack as any);
    addToRecentActivity({
      id: id,
      title: item.title,
      image: item.cover,
      type: "song",
      subtitle: decodeHtmlEntities(
        item.playCount && Number(item.playCount || "") > 0
          ? item.artist +
              " • " +
              formatPlayCount(Number(item.playCount || "")) +
              " plays"
          : item.artist,
      ),
      timestamp: Date.now(),
    });
  };

  const handleOption = async (item: any) => {
    const response = await jioSaavnService.getSongByIdandLink(
      item.id,
      item.url,
    );
    if (response.success && response.data[0]) {
      setSelectedSongOption(response.data[0]);
    } else {
      setSelectedSongOption(item);
    }
    expandMoreOption();
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
      return cover;
    }
    return "";
  };
  return (
    <Pressable
      style={[styles.row, isActive && styles.activerow]}
      //  className={clsx("base-styles", CurrentTrack?.id === item?.id && "bg-gray-600")}
      onPress={() => handlePlay(item.id, item.url)}
    >
      <View style={styles.cover}>
        <Image
          source={{ uri: getImageUri(item.cover) }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 5,
          }}
        />

        {isCurrent && (
          <View style={styles.playingOverlay}>
            <PlayingIndicator />
          </View>
        )}
      </View>
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
            {decodeHtmlEntities(
              item.playCount && Number(item.playCount || "") > 0
                ? item.artist +
                    " • " +
                    formatPlayCount(Number(item.playCount || "")) +
                    " plays"
                : item.artist,
            )}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={{
          justifyContent: "center",
          padding: 8,
          // backgroundColor: "red",
        }}
        onPress={() => handleOption(item)}
      >
        <View style={[styles.menu]}>
          <Ionicons name="ellipsis-vertical" size={20} color="#A3A3A3" />
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    marginBottom: 12,
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  activerow: {
    // borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // 0.6 = 60% opacity
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  meta: {
    flex: 1,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
  
    position: "relative",
  },
  // trackImage: {
  //   width: "100%",
  //   height: "100%",
  // },

  playingOverlay: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    marginHorizontal:"auto",
    // backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
    // marginLeft: 12,
  },
});

export default React.memo(QuickPickRow);
