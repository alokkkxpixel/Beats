import { usePlayerStore } from "@/src/store/usePlayerStore";
import { formatPlayCount } from "@/src/utils/transform";
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
  onLoadMore?: () => void; // ✅ add
  isMoreLoading?: boolean; // ✅ add
}

const TypedFlashList = FlashList as any;

const TrackItem = React.memo(
  ({
    item,
    index,
    artistName,
    isCurrent,
    onPress,
  }: {
    item: Song;
    index: number;
    artistName: string;
    isCurrent: boolean;
    onPress: () => void;
  }) => {
    const imageUri = item.image?.[1]?.url || item.image?.[0]?.url;
    const artist = item.artists?.primary?.[0]?.name || artistName;
    const duration = item.duration ? (item.duration / 60).toFixed(2) : "0.00";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.trackItem, isCurrent && styles.activeTrackItem]}
        onPress={onPress}
      >
        <Image source={{ uri: imageUri }} style={styles.trackImage} />

        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, isCurrent && styles.activeTrackTitle]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View style={styles.trackSubRow}>
            {!!item.explicitContent && (
              <View style={styles.explicitBadge}>
                <Text style={styles.explicitText}>E</Text>
              </View>
            )}

            <Text style={styles.trackSub} numberOfLines={1}>
              {artist} • {duration} • {formatPlayCount(item.playCount)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.trackMore}>
          <MoreVertical color="#9ca3af" size={20} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);

const AlbumDetailScreen = ({
  route,
  navigation,
  onLoadMore,
  isMoreLoading,
}: AlbumDetailProps) => {
  const { album } = route.params;

  // Calculate total duration
  const totalDurationSeconds = React.useMemo(() => {
    return album.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  }, [album.songs]);

  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

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

  const setQueue = usePlayerStore((state) => state.setQueue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const artistName = album.artists?.primary?.[0]?.name || "Various Artists";
  const highResCover = album.image?.[album.image?.length - 1]?.url || "";

  const renderHeader = React.useMemo(
    () => (
      <View style={styles.listHeader}>
        <Image
          source={{ uri: highResCover }}
          style={styles.mainCover}
          contentFit="cover"
          transition={500}
        />

        <Text style={styles.mainTitle}>{album.name || album.title}</Text>

        <View style={styles.descriptionContainer}>
          <Text
            style={styles.descriptionText}
            className=" text-center"
            numberOfLines={2}
          >
            {album.description
              ? album.description.replace(/\s*\n\s*/g, "\n").trim()
              : ""}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCircleBtn}>
            <ArrowDownCircle color="white" size={24} strokeWidth={1.2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircleBtn}>
            <PlusSquare color="white" size={24} strokeWidth={1.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainPlayBtn}
            onPress={() => setQueue(album.songs)}
          >
            <Play color="black" size={28} fill="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCircleBtn}>
            <Share2 color="white" size={24} strokeWidth={1.2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircleBtn}>
            <MoreVertical color="white" size={24} strokeWidth={1.2} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [highResCover, album.name, album.title, album.description, album.songs, setQueue],
  );

  const renderFooter = React.useMemo(
    () => (
      <>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {album.songs.length} songs • {formatTotalTime(totalDurationSeconds)}
          </Text>
          {!!album.playCount && (
            <Text style={styles.footerSubText}>
              {formatPlayCount(album.playCount)} plays
            </Text>
          )}
        </View>

        {isMoreLoading && (
          <ActivityIndicator style={{ marginVertical: 20 }} color="white" />
        )}
      </>
    ),
    [album.songs.length, totalDurationSeconds, album.playCount, isMoreLoading],
  );

  return (
    <View style={styles.container}>
      {/* Background Mood Gradient */}
      {/* Top Blurred Backdrop */}
      <View
        style={{ height: 450, position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <Image
          source={{ uri: highResCover }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={30}
        />
        <LinearGradient
          colors={[
            "rgba(5,5,5,0.2)",
            "rgba(5,5,5,0.5)",
            "rgba(5,5,5,0.8)",
            "#050505",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

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
          renderItem={({ item, index }: any) => {
            const isCurrent = currentTrack?.id === item.id;
            return (
              <TrackItem
                item={item}
                index={index}
                artistName={artistName}
                isCurrent={isCurrent}
                onPress={() => setQueue(album.songs, index)}
              />
            );
          }}
          estimatedItemSize={76}
          drawDistance={300}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: Song) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
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
    fontSize: 14,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listHeader: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 20,
  },
  mainCover: {
    width: 240,
    height: 240,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  mainTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 12,
    paddingHorizontal: 10,
  },
  descriptionText: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    paddingHorizontal: 10,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeTrackItem: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trackTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTrackTitle: {
    color: "#1DB954",
  },
  trackSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  explicitBadge: {
    backgroundColor: "#4b5563",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 6,
  },
  explicitText: {
    color: "#050505",
    fontSize: 8,
    fontWeight: "bold",
  },
  trackSub: {
    color: "#9ca3af",
    fontSize: 13,
  },
  trackMore: {
    padding: 8,
  },
  footerContainer: {
    padding: 24,
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
