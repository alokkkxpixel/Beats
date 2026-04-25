import { FlashList as OriginalFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
interface TrendingSectionProps {
  title: string;
  data: any[];
  type: string;
}

export default function TrendingSection({
  title,
  data,
  type,
}: TrendingSectionProps): React.JSX.Element {
  const navigation = useNavigation<any>();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  if (!data || data.length === 0) return <></>;
  // console.log("new data", data.topPlaylists[0]?.image as Top[]);

  const renderItem = ({ item }: { item: any }) => {
    // console.log("top play", item);
    let displayTitle = "";
    let displayImage = [];
    let displaySubtitle = "";
    let id = "";
    let route = "";
    let routeParamName = "";
    let isLoaded = null;
    let url = "";
    let artists = "";
    let itemType = "";
    let year = "";

    // Extract artist name from various possible locations in JioSaavn API
    const extractedArtist =
      item.more_info?.artistMap?.primary_artists?.[0]?.name ||
      item.more_info?.artistMap?.artists?.[0]?.name ||
      item.artists?.[0]?.name ||
      item.artists ||
      item.subtitle || // Sometimes subtitle contains artist name
      "";

    // Normalize different API structures
    if (type === "trending") {
      id = item?.id;
      url = item?.url || item?.perma_url;
      displayTitle = item?.title;
      displayImage = item?.image;
      displaySubtitle = item?.subtitle;
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "playlists") {
      id = item.listid || item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.subtitle;
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "albums") {
      id = item.id || item.albumid;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.subtitle || item.text;
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "charts") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.title;
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    }

    // Smart routing: detect album URLs vs playlist/featured URLs or explicit types
    const isAlbumUrl = url?.includes("/album/");

    if (isAlbumUrl) {
      route = "album-detail";
    } else {
      route = "playlist-detail";
    }

    // Pass BOTH id and url to be safe
    const navParams =
      route === "album-detail"
        ? { albumId: id, albumUrl: url }
        : { playlistId: id, playlistUrl: url };

    const handlePress = async () => {
      if (itemType === "song") {
        const response = await jioSaavnService.getSongByIdandLink(id, url);
        if (response.success && response.data[0]) {
          setCurrentTrack(response.data[0]);
        }
      } else {
        navigation.navigate(route, navParams);
      }
    };

    // Smart image picker: handles array (mapped) or plain string (raw)
    const getImageUri = (img: any): string => {
      if (Array.isArray(img)) {
        return img[2] || img[1] || img[0] || "";
      }
      if (typeof img === "string" && img) {
        const base = img.split("?")[0].replace(/\.(jpg|jpeg|png)$/i, "");
        return `${base}-500x500.jpg`;
      }
      return "";
    };

    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUri(displayImage) }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
        <Text
          style={styles.cardTitle}
          className="font-sans-medium text-white"
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <Text
          style={styles.description}
          className="font-sans-light"
          numberOfLines={2}
        >
          {displaySubtitle ||
            (itemType && artists ? `${itemType} • ${artists}` : "") ||
            (year && artists ? `${year} • ${artists}` : "") ||
            itemType ||
            year ||
            ""}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} className="font-sans-light">
          {title}
        </Text>
        <Pressable hitSlop={10}>
          <Text style={styles.moreBtn}>More</Text>
        </Pressable>
      </View>

      <OriginalFlashList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any, index: number) =>
          item.id || item.listid || item.albumid || index.toString()
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20, // Matches your Header padding
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  moreBtn: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 20, // Makes the first item align with title
  },
  card: {
    width: 150, // Standard size for YT Music album cards
    marginRight: 16,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 8, // YT Music uses smaller radius for albums (around 4-8px)
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    marginBottom: 10,
    // Subtle elevation for the "card" feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    flex: 1,
  },
  cardTitle: {
    // color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  description: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 18,
  },
});
