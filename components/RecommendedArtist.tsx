import { FlashList as OriginalFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RecommendedArtistProps {
  title?: string;
  subtitle?: string;
  data: any[];
}

export default function RecommendedArtist({
  title,
  subtitle,
  data,
}: RecommendedArtistProps): React.JSX.Element {
  const navigation = useNavigation<any>();

  if (!data || data.length === 0) return <></>;
  const renderItem = ({ item }: { item: any }) => {
    // console.log("item", JSON.stringify(item.image_url, null, 2));
    // Normalization logic for artist objects
    const displayTitle = item.name || item.title || "";
    // Description can be followers or role or just a generic label
    const displaySubtitle =
      item.subtitle || item.role || item.description || "Artist";

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
          return img.replace("50x50", "150x150");
        } else if (img.includes("150x150")) {
          return img;
        }
        const base = img.split("?")[0].replace(/\.(jpg|jpeg|png)$/i, "");
        return `${base}-150x150.jpg`;
      }
      return "";
    };

    const handlePress = () => {
      navigation.navigate("artist/[id]", {
        id: Number(item.id),
        url: item.url || item.perma_url,
      });
    };

    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUri(item.image_url || item.image) }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
        <View style={styles.textContainer}>
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
            numberOfLines={1}
          >
            {displaySubtitle}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={styles.title}
            className="font-sans-semibold tracking-tighter text-2xl text-white"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={styles.subtitle}
              className="font-sans-medium text-zinc-400"
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <OriginalFlashList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any, index: number) => item.id || index.toString()}
        renderItem={renderItem}
        // estimatedItemSize={120}
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
    // fontSize: 22,
  },
  subtitle: {
    fontSize: 13,
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
    width: 120,
    marginRight: 20,
    alignItems: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    marginBottom: 10,
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    flex: 1,
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  description: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
  },
});
