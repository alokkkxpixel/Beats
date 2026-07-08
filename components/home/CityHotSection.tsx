import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import defaultCover from "@/assets/app-icons/defualt-cover.png";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";
import { FlatList } from "react-native";

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
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;
  const cardSize = isShortScreen ? 110 : 135;
  const navigation = useNavigation<any>();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  if (!data || data.length === 0) return <></>;
  const getImageUri = (img: any): string => {
    let url = "";
    if (Array.isArray(img)) {
      const target = img[2] || img[1] || img[0] || "";
      url =
        typeof target === "string" ? target : target?.url || target?.uri || "";
    } else if (typeof img === "string") {
      url = img;
    }

    if (url) {
      if (url.startsWith("http://")) {
        url = url.replace("http://", "https://");
      }
      if (url.includes("150x150")) {
        return url.replace("150x150", "500x500");
      }
      if (url.includes("50x50")) {
        return url.replace("50x50", "500x500");
      }
      if (url.includes("150-150")) {
        return url.replace("150-150", "500-500");
      }
      return url;
    }
    return "";
  };
  const renderItem = ({ item }: { item: any }) => {
    const isArtist = item.type === "artist";
    const displayTitle = item.title || item.name;
    const displaySubtitle = item.subtitle || item.description;
    const displayImage = item.image;
    const itemType = item.type;
    const id = item.id;
    const url = item.url || item.perma_url;

    const handlePress = () => {
      if (itemType === "song") {
        const partialTrack = {
          id: id,
          name: displayTitle,
          image: displayImage,
          primaryArtists: displaySubtitle || "",
          url: url,
        };
        setCurrentTrack(partialTrack as any);
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
      <Pressable
        style={[styles.card, { width: cardSize }]}
        onPress={handlePress}
      >
        <View
          style={[
            styles.imageContainer,
            {
              width: cardSize,
              height: cardSize,
              marginBottom: isShortScreen ? 6 : 10,
            },
            isArtist
              ? { borderRadius: cardSize / 2 }
              : { borderRadius: isShortScreen ? 6 : 8 },
          ]}
        >
          <Image
            source={
              getImageUri(displayImage)
                ? { uri: getImageUri(displayImage) }
                : defaultCover
            }
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        </View>
        <Text
          style={[
            styles.cardTitle,
            isArtist && styles.artistTitle,
            isShortScreen && { fontSize: 12, lineHeight: 15 },
          ]}
          className="font-sans-medium text-white"
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <Text
          style={[
            styles.description,
            isShortScreen && { fontSize: 10, lineHeight: 13 },
          ]}
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
    <View style={[styles.container, isShortScreen && { marginTop: 15 }]}>
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              isShortScreen && { fontSize: 18, lineHeight: 22 },
            ]}
            className="font-sans-semibold"
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} className="font-sans-light">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any, index: number) =>
          `cityhot-${item.id || item.listid || item.albumid || index}-${index}`
        }
        renderItem={renderItem}
        // removeClippedSubviews={true}
        // maxToRenderPerBatch={5}
        // updateCellsBatchingPeriod={100}
        // initialNumToRender={5}
        // windowSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingVertical: 10,
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
    // fontWeight: "800",
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
    width: "100%",
    height: "100%",
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
