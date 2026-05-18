import { FlashList as OriginalFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { addToRecentActivity } from "@/src/lib/storage";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { TopPlaylists } from "@/types/jiosaavn";
interface TrendingSectionProps {
  title?: string;
  data: TopPlaylists[];
  type: string;
  onMorePress?: () => void;
}

export default function TrendingSection({
  title,
  data,
  type,
  onMorePress,
}: TrendingSectionProps): React.JSX.Element {
  const navigation = useNavigation<any>();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  if (!data || data.length === 0) return <></>;

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
      item.artists?.primary?.[0]?.name ||
      item.artists?.[0]?.name ||
      (typeof item.artists === "string" ? item.artists : "") ||
      item.subtitle ||
      "";

    // Normalize different API structures
    if (type === "trending") {
      id = item?.id;
      url = item?.url || item?.perma_url;
      displayTitle = item?.title || item?.name;
      displayImage = item?.image;
      displaySubtitle =
        item?.subtitle ||
        [item.type, extractedArtist].filter(Boolean).join(" • ");
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "playlists" || type === "playlist") {
      id = item.listid || item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item.image;
      displaySubtitle = item.subtitle || extractedArtist || "Playlist";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (
      type === "dedicated_artist_playlist" ||
      type === "featured_artist_playlist"
    ) {
      id = item.listid || item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item.image;
      displaySubtitle = item.subtitle || extractedArtist || "Playlist";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "albums") {
      id = item.id || item.albumid;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle =
        item.subtitle ||
        [
          item.type
            ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
            : "Album",

          extractedArtist,
        ]
          .filter(Boolean)
          .join(" • ");
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "charts") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle = item.subtitle || "Chart";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "single") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle =
        item.subtitle ||
        ["Single", extractedArtist].filter(Boolean).join(" • ");
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "promo:vx:data:68") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle = item?.subtitle || "Fresh Hits";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "promo:vx:data:185") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle = item?.subtitle || "Best of 90s";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    } else if (type === "promo:vx:data:69") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title || item.name;
      displayImage = item?.image;
      displaySubtitle = item?.subtitle || "Top K-pop ";
      artists = extractedArtist;
      itemType = item.type;
      year = item.year;
    }

    // Smart routing: detect album URLs vs playlist/featured URLs or explicit types
    const isAlbumUrl = url?.includes("/album/");
    const isArtistUrl =
      url?.includes("/artist/") ||
      (type as any) === "artist" ||
      itemType === "artist";

    if (isArtistUrl) {
      route = "artist/[id]";
    } else if (isAlbumUrl) {
      route = "album-detail";
    } else {
      route = "playlist-detail";
    }

    // Pass BOTH id and url to be safe
    let navParams: any = {};
    if (route === "artist/[id]") {
      navParams = { id: id, url: url };
    } else if (route === "album-detail") {
      navParams = { albumId: id, albumUrl: url };
    } else {
      navParams = { playlistId: id, playlistUrl: url };
    }

    const handlePress = async () => {
      if (itemType === "song") {
        const response = await jioSaavnService.getSongByIdandLink(id, url);
        if (response.success && response.data[0]) {
          const song = response.data[0];
          addToRecentActivity({
            id: song.id,
            title: song.name,
            image: song.image,
            type: "song",
            subtitle: displaySubtitle,
            timestamp: Date.now(),
          });
          setCurrentTrack(song);
        }
      } else {
        if (route === "artist/[id]") {
          navigation.navigate("artist/[id]", navParams);
        } else {
          navigation.navigate(route, navParams);
        }
      }
    };

    // Smart image picker: handles array (mapped), object array (raw), or plain string
    // Fix #7: Pure function — no mutations to source data
    const getImageUri = (img: any): string => {
      if (Array.isArray(img)) {
        const target = img[2] || img[1] || img[0] || "";
        if (typeof target === "string") return target;
        let url = target?.url || target?.uri || "";
        if (url.includes("150x150")) {
          url = url.replace("150x150", "500x500");
        }
        return url;
      }
      if (typeof img === "string" && img) {
        if (img.includes("50x50")) {
          return img.replace("50x50", "500x500");
        } else if (img.includes("150x150")) {
          return img.replace("150x150", "500x500");
        }
        const base = img.split("?")[0].replace(/\.(jpg|jpeg|png)$/i, "");
        return `${base}-500x500.jpg`;
      }
      return "";
    };
    // const getImageUri = (img: any): string => {
    //   let url = "";
    //   if (Array.isArray(img)) {
    //     url = img[2]?.url || img[1]?.url || img[0]?.url || "";
    //   } else if (typeof img === "string") {
    //     url = img;
    //   }

    //   if (url.includes("150x150")) {
    //     url = url.replace("150x150", "500x500");
    //   } else if (url.includes("50x50")) {
    //     url = url.replace("50x50", "500x500");
    //   }

    //   if (
    //     url === "https://static.saavncdn.com/_i/share-image-2.png" ||
    //     !url
    //   ) {
    //     return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
    //   }
    //   return url;
    // };

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
          ellipsizeMode="tail"
        >
          {displayTitle}
        </Text>
        <Text
          style={styles.description}
          className="font-sans-light"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {displaySubtitle}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={styles.title}
          className="font-sans-semibold text-white"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
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
    alignItems: "center",
    paddingHorizontal: 20, // Matches your Header padding
    marginBottom: 16,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    fontSize: 22,
    lineHeight: 28,
    marginRight: 12,
    includeFontPadding: false,
    // letterSpacing: -0.5,
  },
  moreBtn: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    includeFontPadding: false,
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
    lineHeight: 18,
    includeFontPadding: false,
    marginBottom: 2,
  },
  description: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },
});
