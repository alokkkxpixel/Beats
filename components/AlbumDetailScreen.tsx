import { AlbumResponse, Song } from "@/types/jiosaavn";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowDownCircle,
  ChevronLeft,
  MoreVertical,
  Play,
  PlusSquare,
  Search,
  Share2,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlbumDetailProps {
  route: {
    params: {
      album: AlbumResponse;
    };
  };
  navigation: any;
}

const TypedFlashList = FlashList as any;

const AlbumDetailScreen = ({ route, navigation }: AlbumDetailProps) => {
  const { album } = route.params;

  // Calculate total duration
  const totalDurationSeconds = album.songs.reduce(
    (acc, song) => acc + (song.duration || 0),
    0,
  );
  const formatTotalTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} min ${secs} sec`;
  };

  // console.log("album:", JSON.stringify(album, null, 2));

  if (!album) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const artistName = album.artists?.primary?.[0]?.name || "Various Artists";
  const highResCover = album.image?.[album.image?.length - 1]?.url || "";

  const renderTrack = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.trackItem}>
      <Text style={styles.trackIndex}>{index + 1}</Text>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.trackSubRow}>
          {item.explicitContent && (
            <View style={styles.explicitBadge}>
              <Text style={styles.explicitText}>E</Text>
            </View>
          )}
          <Text style={styles.trackSub} numberOfLines={1}>
            {item.artists?.primary?.[0]?.name || artistName} •{" "}
            {(item.duration / 60).toFixed(2)} •{" "}
            {item.playCount ? (item.playCount / 1000000).toFixed(1) + "M" : "0"}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.trackMore}>
        <MoreVertical color="#9ca3af" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Background Mood Gradient */}
      <LinearGradient
        colors={["rgba(255, 0, 0, 0.15)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <View style={styles.headerArtistRow}>
              <Image
                source={{ uri: highResCover }}
                style={styles.headerAvatar}
              />
              <Text style={styles.headerArtist} numberOfLines={1}>
                {artistName}
              </Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {album.type} • {album.year}
            </Text>
          </View>

          <TouchableOpacity className="p-2">
            <Search color="white" size={24} />
          </TouchableOpacity>
        </View>

        <TypedFlashList
          data={album.songs}
          renderItem={renderTrack}
          estimatedItemSize={70}
          keyExtractor={(item: Song) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Image
                source={{ uri: highResCover }}
                style={styles.mainCover}
                contentFit="cover"
                transition={500}
              />

              <Text style={styles.mainTitle}>{album.name || album.title}</Text>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {album.description}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <ArrowDownCircle color="white" size={24} strokeWidth={1.2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <PlusSquare color="white" size={24} strokeWidth={1.2} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainPlayBtn}>
                  <Play color="black" size={25} fill="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Share2 color="white" size={24} strokeWidth={1.2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <MoreVertical color="white" size={24} strokeWidth={1.2} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {album.songs.length} songs •{" "}
                {formatTotalTime(totalDurationSeconds)}
              </Text>
              {album.playCount && (
                <Text style={styles.footerSubText}>
                  {Number(album.playCount).toLocaleString()} plays
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerArtistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  headerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  headerArtist: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 11,
  },
  listHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 30,
  },
  mainCover: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  mainTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  descriptionContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 40,
  },
  descriptionText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  moreLink: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "red",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
    paddingHorizontal: 32,
  },
  mainPlayBtn: {
    backgroundColor: "white",
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  actionCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  trackItem: {
    flexDirection: "row",
    // backgroundColor: "green",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  trackIndex: {
    color: "#9ca3af",
    fontSize: 15,
    width: 35,
    fontWeight: "500",
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackSub: {
    color: "#9ca3af",
    fontSize: 12,
  },
  explicitBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 14,
    height: 14,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  explicitText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  trackMore: {
    padding: 4,
  },
  footerContainer: {
    paddingTop: 30,
    paddingBottom: 60,
    alignItems: "center",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  footerSubText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AlbumDetailScreen;
