import { usePlayerStore } from "@/src/store/usePlayerStore";
import { TopPlaylists } from "@/types/jiosaavn";
// FlatList is the right choice for small horizontal carousels (10-20 items).
// FlashList v2's cell recycling causes blank images and overlap for lists this small.
import defaultCover from "@/assets/app-icons/defualt-cover.png";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import PlayingIndicator from "../PlayingIndicator";

interface TrendingSectionProps {
  title?: string;
  data: TopPlaylists[];
  type: string;
  onMorePress?: () => void;
}

// ✅ Static constant outside component — not recalculated on every cell recycle
const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

// ✅ Pure module-level function — not recreated inside renderItem on every cell recycle
// Smart image picker: handles array (mapped), object array (raw), or plain string
const getImageUri = (img: any): string => {
  if (Array.isArray(img)) {
    const target = img[2] || img[1] || img[0] || "";
    if (typeof target === "string") return target;
    let url = target?.url || target?.uri || "";
    if (url.includes("150x150")) url = url.replace("150x150", "500x500");
    return url;
  }
  if (typeof img === "string" && img) {
    if (img.includes("50x50")) return img.replace("50x50", "500x500");
    if (img.includes("150x150")) return img.replace("150x150", "500x500");
    const base = img.split("?")[0].replace(/\.(jpg|jpeg|png)$/i, "");
    return `${base}-500x500.jpg`;
  }
  return "";
};

export default function TrendingSection({
  title,
  data,
  type,
  onMorePress,
}: TrendingSectionProps): React.JSX.Element {
  const navigation = useNavigation<any>();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  if (!data || data.length === 0) return <></>;
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set(),
  );

  const handleImageError = React.useCallback((imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  }, []);

  // ✅ Memoized — prevents recreation on every parent re-render (FlashList perf best practice)
  const renderItem = React.useCallback(
    ({ item }: { item: any }) => {
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
      const isCurrent = currentTrack?.id === item.id;
      const handlePress = () => {
        if (itemType === "song") {
          const partialTrack = {
            id: id,
            name: displayTitle,
            image: displayImage,
            primaryArtists: artists || displaySubtitle,
            url: url,
          };
          setCurrentTrack(partialTrack as any);
        } else {
          if (route === "artist/[id]") {
            navigation.navigate("artist/[id]", navParams);
          } else {
            navigation.navigate(route, navParams);
          }
        }
      };
      // getImageUri is now a module-level pure function (above component)

      return (
        <Pressable style={styles.card} onPress={handlePress}>
          <View style={styles.imageContainer}>
            <Image
              source={
                getImageUri(displayImage)
                  ? { uri: getImageUri(displayImage) }
                  : defaultCover
              }
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            {isCurrent && (
              <View style={styles.playingOverlay}>
                <PlayingIndicator />
              </View>
            )}
          </View>
          <Text
            style={styles.cardTitle}
            className="font-sans-semibold text-white"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayTitle}
          </Text>
          <Text
            style={styles.description}
            className="font-sans-light tracking-tight capitalize"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displaySubtitle}
          </Text>
        </Pressable>
      );
    },
    [type, navigation, setCurrentTrack, failedImages, handleImageError],
  );

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
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any, index: number) =>
          item.id || item.listid || item.albumid || index.toString()
        }
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        initialNumToRender={5}
        windowSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
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
  playingOverlay: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
  },
  cardTitle: {
    // color: "#FFFFFF",
    fontSize: 14,
    // fontWeight: "700",
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
