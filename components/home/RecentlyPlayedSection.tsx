import { usePlayerStore } from "@/src/store/usePlayerStore";
import defaultCover from "@/assets/app-icons/defualt-cover.png";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import PlayingIndicator from "../PlayingIndicator";

interface RecentlyPlayedSectionProps {
  data: any[];
}

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

export default function RecentlyPlayedSection({
  data,
}: RecentlyPlayedSectionProps): React.JSX.Element {
  const router = useRouter();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  if (!data || data.length === 0) return <></>;

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => {
      const isArtist = item.type === "artist";
      const isSong = item.type === "song";
      const isCurrent = isSong && currentTrack?.id === item.id;

      const handlePress = () => {
        if (isSong) {
          setCurrentTrack(item);
        } else if (item.type === "album") {
          router.push({
            pathname: "/album-detail",
            params: { albumId: item.id },
          });
        } else if (item.type === "playlist") {
          router.push({
            pathname: "/playlist-detail",
            params: { playlistId: item.id },
          });
        } else if (item.type === "artist") {
          router.push({
            pathname: "/artist/[id]",
            params: { id: item.id },
          });
        }
      };

      const imageUri = getImageUri(item.image);

      return (
        <Pressable style={styles.card} onPress={handlePress}>
          <View
            style={[
              styles.imageContainer,
              { borderRadius: isArtist ? 52.5 : 6 },
            ]}
          >
            <Image
              source={imageUri ? { uri: imageUri } : defaultCover}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            {isCurrent && (
              <View
                style={[
                  styles.playingOverlay,
                  { borderRadius: isArtist ? 52.5 : 6 },
                ]}
              >
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
            {item.title}
          </Text>
          <Text
            style={styles.description}
            className="font-sans-light tracking-tight capitalize"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.subtitle || item.type}
          </Text>
        </Pressable>
      );
    },
    [currentTrack, setCurrentTrack, router],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={styles.title}
          className="font-sans-semibold text-white"
          numberOfLines={1}
        >
          Recently Played
        </Text>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any, index: number) =>
          `${item.id}-${item.type}-${index}`
        }
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={100}
        initialNumToRender={6}
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    width: 105,
    marginRight: 16,
  },
  imageContainer: {
    width: 105,
    height: 105,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    marginBottom: 8,
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
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 2,
  },
  description: {
    color: "#AAAAAA",
    fontSize: 11,
    lineHeight: 14,
  },
});
