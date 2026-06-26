import Header from "@/components/Header";
import { clearRecentActivity, getRecentActivity } from "@/src/lib/storage";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MoreVertical, Pencil, Trash2 } from "lucide-react-native";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DownloadManager } from "react-native-nitro-player";
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

interface LibraryItemData {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  image?: any;
}

const getImageUri = (img: any): string => {
  let imageUrl = "";

  if (Array.isArray(img)) {
    imageUrl = img[2]?.url || img[1]?.url || img[0]?.url || "";
  } else if (typeof img === "string") {
    imageUrl = img;
  }

  if (imageUrl.includes("50x50")) {
    imageUrl = imageUrl.replace("50x50", "50x50");
  }

  if (
    imageUrl === "https://static.saavncdn.com/_i/share-image-2.png" ||
    !imageUrl
  ) {
    return "https://staticweb6.jiosaavn.com/web6/jioindw/dist/1776919632/_i/default_images/default-artist-500x500.jpg";
  }

  return imageUrl;
};

const LibraryItem = memo(({ item }: { item: LibraryItemData }) => {
  const router = useRouter();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const expandMoreOption = usePlayerStore((s) => s.expandMoreOption);
  // Fix #4: Only subscribe to whether THIS row is active, not the entire currentTrack object
  const isActive = usePlayerStore((s) => s.currentTrack?.id === item.id);
  const setSelectedSongOption = usePlayerStore((s) => s.setSelectedSongOption);
  const handleOption = async (item: any) => {
    const response = await jioSaavnService.getSongByIdandLink(
      item.id,
      item.url,
    );
    if (response.success && response.data[0]) {
      setSelectedSongOption(response.data[0]);
    } else {
      setSelectedSongOption(item);
    }
    expandMoreOption();
  };
  const handlePress = () => {
    if (item.type === "song") {
      setCurrentTrack(item as any);
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
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3"
      onPress={handlePress}
    >
      <View
        className="w-16 h-16 mr-4 overflow-hidden bg-white/5 shadow-lg"
        style={{ borderRadius: item.type === "artist" ? 32 : 12 }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={400}
        />
      </View>

      <View className="flex-1 justify-center">
        <Text
          className="text-white text-[17px] font-sans-medium tracking-tight"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          className="text-gray-400 text-[13px] mt-1 capitalize"
          numberOfLines={1}
        >
          {item.subtitle || item.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
LibraryItem.displayName = "LibraryItem";

export default function LibraryScreen() {
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<LibraryItemData[]>([]);
  const insets = useSafeAreaInsets();
  const playlists = usePlaylistStore((s) => s.playlists);
  const liked = usePlayerStore((s) => s.likedSongs);
  const loadPlaylists = usePlaylistStore((s) => s.loadPlaylists);
  const savedAlbums = usePlaylistStore((s) => s.savedAlbums);
  const loadSavedAlbums = usePlaylistStore((s) => s.loadSavedAlbums);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPlaylistName, setEditPlaylistName] = useState("");

  const [downloadCount, setDownloadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const activity = getRecentActivity();
      setRecentActivity(activity);
      loadPlaylists();
      loadSavedAlbums();

      DownloadManager.getAllDownloadedTracks()
        .then((tracks) => {
          setDownloadCount(tracks?.length || 0);
        })
        .catch((err) =>
          console.error("Error fetching downloaded tracks count:", err),
        );
    }, [loadPlaylists, loadSavedAlbums]),
  );

  const combinedPlaylistsAndAlbums = useMemo(() => {
    const items: any[] = [];

    // 1. Liked music (always at the very top)
    items.push({
      id: "liked-songs",
      title: "Liked music",
      subtitle: "like by the user",
      type: "liked-songs",
      image:
        "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-songs-delhi-1200.png",
      updatedAt: Infinity,
    });

    // Sort playlists and albums by updatedAt desc
    const sortedRest: any[] = [];
    playlists.forEach((p) => {
      sortedRest.push({
        id: p.id,
        title: p.name,
        subtitle: `${p.songs?.length || 0} songs`,
        type: "local-playlist",
        image: p.image,
        updatedAt: p.updatedAt || p.createdAt || 0,
      });
    });

    savedAlbums.forEach((a) => {
      sortedRest.push({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle || "Album",
        type: "album",
        image: a.image,
        updatedAt: a.createdAt || 0,
      });
    });

    sortedRest.sort((a, b) => b.updatedAt - a.updatedAt);

    // Downloads item
    const downloadsItem = {
      id: "downloaded-songs",
      title: "Downloads",
      subtitle: `${downloadCount} songs`,
      type: "downloaded-songs",
      image:
        "@/assets/app-icons/download-cover.png",
      updatedAt: Infinity - 1,
    };

    return [items[0], downloadsItem, ...sortedRest];
  }, [liked, playlists, savedAlbums, downloadCount]);

  const handleClear = () => {
    clearRecentActivity();
    setRecentActivity([]);
  };

  const handleMenuPress = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setMenuVisible(true);
  };

  const handleEditPlaylist = () => {
    setMenuVisible(false);
    setEditPlaylistName(selectedPlaylist?.title || "");
    setEditModalVisible(true);
  };

  const handleDeletePlaylist = () => {
    if (selectedPlaylist) {
      deletePlaylist(selectedPlaylist.id);
      setMenuVisible(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedPlaylist && editPlaylistName.trim()) {
      updatePlaylist(selectedPlaylist.id, { name: editPlaylistName.trim() });
      setEditModalVisible(false);
      setEditPlaylistName("");
    }
  };

  const HEADER_HEIGHT = 54;
  const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + insets.top;

  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      scrollY.value = currentOffset;

      const diff = currentOffset - lastContentOffset.value;

      if (currentOffset <= 0) {
        translateY.value = withTiming(0);
      } else {
        translateY.value = Math.max(
          -TOTAL_HEADER_HEIGHT,
          Math.min(0, translateY.value - diff),
        );
      }
      lastContentOffset.value = currentOffset;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["transparent", "rgba(0,0,0,0.9)"],
    );

    return {
      // transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
    };
  });

  return (
    <View className="flex-1 ">
      <StatusBar barStyle="light-content" backgroundColor={"#000"} />

      {/* Premium Glows
      <Animated.View style={[StyleSheet.absoluteFill, glowAnimatedStyle]}>
        <LinearGradient
          colors={["rgba(59, 130, 246, 0.15)", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 400,
          }}
        />
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowCenter} />
      </Animated.View> */}

      <Animated.View
        style={[
          styles.headerWrapper,
          headerAnimatedStyle,
          { height: TOTAL_HEADER_HEIGHT, paddingTop: insets.top },
        ]}
      >
        <Header title="Library" />
      </Animated.View>

      <AnimatedFlashList
        data={recentActivity}
        renderItem={({ item }: any) => (
          <>
            <LibraryItem item={item} />
          </>
        )}
        estimatedItemSize={88}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT + 10,
          paddingBottom: 150,
        }}
        ListHeaderComponent={
          <>
            {/* User Playlists Section */}
            {combinedPlaylistsAndAlbums.length > 0 && (
              <View className="px-4 pb-6 mt-4">
                <Text className="text-white text-3xl font-sans-medium tracking-tighter mb-4">
                  Your Playlists
                </Text>
                {combinedPlaylistsAndAlbums.map((item, idx) => {
                  const imageUri = getImageUri(item.image);
                  const isLiked = item.id === "liked-songs";
                  const isLocalPlaylist = item.type === "local-playlist";
                  const isAlbum = item.type === "album";

                  const handleItemPress = () => {
                    if (isLiked) {
                      router.push({
                        pathname: "/album-detail",
                        params: { albumId: "liked-songs" },
                      });
                    } else if (item.id === "downloaded-songs") {
                      router.push({
                        pathname: "/album-detail",
                        params: { albumId: "downloaded-songs" },
                      });
                    } else if (isLocalPlaylist) {
                      router.push({
                        pathname: "/local-playlist-detail",
                        params: { playlistId: item.id },
                      });
                    } else if (isAlbum) {
                      router.push({
                        pathname: "/album-detail",
                        params: { albumId: item.id },
                      });
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={item.id || idx}
                      activeOpacity={0.7}
                      className="flex-row items-center py-3"
                      onPress={handleItemPress}
                    >
                      <View
                        className="w-16 h-16 mr-4 overflow-hidden bg-white/5 shadow-lg"
                        style={{ borderRadius: 12 }}
                      >
                        {item.image ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            transition={400}
                          />
                        ) : (
                          <View className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center">
                            <Text className="text-white text-2xl font-sans-bold">
                              {item.title.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-1 justify-center">
                        <Text
                          className="text-white text-[17px] font-sans-medium tracking-tight"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="text-gray-400 text-[13px] mt-1 capitalize"
                          numberOfLines={1}
                        >
                          {item.subtitle}
                        </Text>
                      </View>
                      {isLocalPlaylist && (
                        <TouchableOpacity
                          onPress={() => handleMenuPress(item)}
                          hitSlop={10}
                        >
                          <MoreVertical size={20} color="#888" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        }
        // ListEmptyComponent={
        //   <View className="flex-1 items-center justify-center pt-32 px-12">
        //     <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6"></View>
        //     <Text className="text-white text-xl font-sans-bold mb-2">
        //       Nothing here yet
        //     </Text>
        //     <Text className="text-gray-500 text-center text-base leading-6">
        //       Songs, albums, and artists you interact with will appear here
        //       automatically.
        //     </Text>
        //   </View>
        // }
      />

      {/* Playlist Options Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditPlaylist}
            >
              <Pencil size={20} color="#fff" />
              <Text style={styles.menuItemText}>Rename</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePlaylist}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Playlist Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.editModalContainer}>
            <Text style={styles.editModalTitle}>Rename Playlist</Text>
            <TextInput
              style={styles.editInput}
              value={editPlaylistName}
              onChangeText={setEditPlaylistName}
              placeholder="Playlist name"
              placeholderTextColor="#666"
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    filter: "blur(80px)",
  } as any,
  backgroundGlowCenter: {
    position: "absolute",
    top: 200,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    filter: "blur(60px)",
  } as any,
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#282828",
    borderRadius: 12,
    width: 200,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteText: {
    color: "#ef4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#333",
  },
  editModalContainer: {
    backgroundColor: "#282828",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  editModalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#1DB954",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

{
  /* <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M11.485 2.143 3.913 6.687A6 6 0 001 11.832v.338a6 6 0 002.913 5.144l7.572 4.543A1 1 0 0013 21V3a1.001 1.001 0 00-1.515-.857Zm6.88 2.079a1 1 0 00-.001 1.414 9 9 0 010 12.728 1 1 0 001.414 1.414 11 11 0 000-15.556 1 1 0 00-1.413 0ZM4.941 8.402l.001-.002L11 4.767v14.466l-6.058-3.635A4 4 0 013 12.168v-.337a4 4 0 011.941-3.429ZM15.535 7.05a1 1 0 000 1.415 5 5 0 010 7.07 1 1 0 001.415 1.415 6.999 6.999 0 000-9.9 1 1 0 00-1.415 0Z"></path></svg> */
}
