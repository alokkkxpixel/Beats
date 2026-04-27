import { FlashList as OriginalFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";

interface CityHotSectionProps {
  title: string;
  subtitle?: string;
  data: any[];
}

export default function CityHotSection({
  title,
  subtitle,
  data,
}: CityHotSectionProps): React.JSX.Element {
  const navigation = useNavigation<any>();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  if (!data || data.length === 0) return <></>;
  const renderItem = ({ item }: { item: any }) => {
    const isArtist = item.type === "artist";
    const displayTitle = item.title || item.name;
    const displaySubtitle = item.subtitle || item.description;
    const displayImage = item.image;
    const itemType = item.type;
    const id = item.id;
    const url = item.url || item.perma_url;

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

    const handlePress = async () => {
      if (itemType === "song") {
        const response = await jioSaavnService.getSongByIdandLink(id, url);
        if (response.success && response.data[0]) {
          setCurrentTrack(response.data[0]);
        }
      } else if (itemType === "artist" || url?.includes("/artist/")) {
        navigation.navigate("artist/[id]", { id: Number(id), url: url });
      } else {
        const isAlbumUrl = url?.includes("/album/");
        const route = isAlbumUrl ? "album-detail" : "playlist-detail";
        const navParams =
          route === "album-detail"
            ? { albumId: id, albumUrl: url }
            : { playlistId: id, playlistUrl: url };
        navigation.navigate(route, navParams);
      }
    };

    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={[styles.imageContainer, isArtist && styles.artistCircle]}>
          <Image
            source={{ uri: getImageUri(displayImage) }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
        <Text
          style={[styles.cardTitle, isArtist && styles.artistTitle]}
          className="font-sans-medium text-white"
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <Text
          style={styles.description}
          className="font-sans-light"
          numberOfLines={1}
        >
          {(() => {
            if (!displaySubtitle) return "";

            // If it's an artist and contains "Listeners" or a large number
            if (isArtist) {
              const match = displaySubtitle.match(/([\d,]+)/);
              if (match) {
                const count = match[0];
                return `Artist • ${formatPlayCount(count)} Listeners`;
              }
            }

            return isNaN(Number(displaySubtitle))
              ? displaySubtitle
              : formatPlayCount(Number(displaySubtitle));
          })()}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title} className="font-sans-light">
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} className="font-sans-light">
              {subtitle}
            </Text>
          )}
        </View>
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
        // estimatedItemSize={150}
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 2,
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
    paddingHorizontal: 20,
  },
  card: {
    width: 150,
    marginRight: 16,
    alignItems: "center",
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  artistCircle: {
    borderRadius: 75,
  },
  image: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "center",
    width: "100%",
  },
  artistTitle: {
    fontWeight: "600",
  },
  description: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
    width: "100%",
  },
});
