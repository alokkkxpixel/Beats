import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Download, Trash2, HardDrive } from "lucide-react-native";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { DownloadManager } from "react-native-nitro-player";
import { useDownloadStorage } from "react-native-nitro-player";
import { clearDownloadedTrackMetadata } from "@/src/lib/storage";

export default function DownloadsScreen() {
  const {
    downloadedTracks,
    deleteDownload,
    refreshDownloadedTracks,
    isDownloading,
  } = useDownloadStore();
  const { formattedSize, formattedAvailable, usagePercentage } =
    useDownloadStorage();

  const [downloadedSongs, setDownloadedSongs] = React.useState<any[]>([]);

  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  const loadDownloadedSongs = async () => {
    try {
      const songs = await DownloadManager.getAllDownloadedTracks();
      setDownloadedSongs(songs);
      refreshDownloadedTracks();
    } catch (error) {
      console.error("Error loading downloaded songs:", error);
    }
  };

  const handleDelete = async (trackId: string, trackName: string) => {
    Alert.alert(
      "Delete Download",
      `Are you sure you want to delete "${trackName}" from your device?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDownload(trackId);
            await loadDownloadedSongs();
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete All Downloads",
      "Are you sure you want to delete all downloaded songs? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await DownloadManager.deleteAllDownloads();
            clearDownloadedTrackMetadata();
            await loadDownloadedSongs();
          },
        },
      ]
    );
  };

  const renderSong = ({ item }: { item: any }) => (
    <View style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.originalTrack.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.originalTrack.artist}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          handleDelete(item.originalTrack.id, item.originalTrack.title)
        }
        style={styles.deleteButton}
      >
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Download size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Downloads</Text>
        </View>
        {downloadedSongs.length > 0 && (
          <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllButton}>
            <Text style={styles.deleteAllText}>Delete All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.storageInfo}>
        <HardDrive size={20} color="#a1a1aa" />
        <Text style={styles.storageText}>
          {formattedSize} used ({usagePercentage.toFixed(1)}%) • {formattedAvailable} available
        </Text>
      </View>

      {downloadedSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <Download size={64} color="#3f3f46" />
          <Text style={styles.emptyTitle}>No Downloads</Text>
          <Text style={styles.emptyText}>
            Download songs to listen offline
          </Text>
        </View>
      ) : (
        <FlatList
          data={downloadedSongs}
          renderItem={renderSong}
          keyExtractor={(item) => item.originalTrack.id}
          contentContainerStyle={styles.listContent}
          refreshing={isDownloading}
          onRefresh={loadDownloadedSongs}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  deleteAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#27272a",
    borderRadius: 8,
  },
  deleteAllText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  storageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  storageText: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  listContent: {
    padding: 20,
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  songInfo: {
    flex: 1,
    marginRight: 16,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  emptyText: {
    fontSize: 14,
    color: "#a1a1aa",
  },
});
