import { FlashList as OriginalFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  if (!data || data.length === 0) return <></>;
  // console.log("new data", data.newReleases as any[]);

  const renderItem = ({ item }: { item: any }) => {
    let displayTitle = "";
    let displayImage = "";
    let displaySubtitle = "";
    let id = "";
    let route = "";
    let routeParamName = "";
    let isLoaded = null;
    let url = "";
    // console.log("item", item);
    // Normalize different API structures
    if (type === "trending") {
      id = item?.id;
      url = item?.url || item?.perma_url;
      displayTitle = item?.title;
      displayImage = item?.image;
      displaySubtitle = item?.subtitle;
    } else if (type === "playlists") {
      id = item.listid || item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.subtitle;
    } else if (type === "albums") {
      id = item.id || item.albumid;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.subtitle || item.text;
    } else if (type === "charts") {
      id = item.id;
      url = item?.url || item?.perma_url;
      displayTitle = item.title;
      displayImage = item.image;
      displaySubtitle = item.subtitle;
    }

    // Smart routing: detect album URLs vs playlist/featured URLs or explicit types
    const isAlbumUrl = url?.includes("/album/");
    const isSongType = (item.type || item.details?.type) === "song";

    if (isAlbumUrl) {
      route = "album-detail";
    } else {
      route = "playlist-detail";
    }

    // Pass BOTH id and url to be safe
    const navParams = route === "album-detail"
      ? { albumId: id, albumUrl: url }
      : { playlistId: id, playlistUrl: url };

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate(route, navParams)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {displaySubtitle}
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
    color: "#FFFFFF",
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
