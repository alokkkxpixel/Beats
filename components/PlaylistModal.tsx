import PlusIcon from "@/assets/app-icons/add-library.svg";
import CheckIcon from "@/assets/app-icons/check.svg";
import CloseIcon from "@/assets/app-icons/stat-minus.svg";
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import { SongDetail } from "@/types/jiosaavn";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  song: SongDetail | null;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  visible,
  onClose,
  song,
}) => {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylistStore();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = createPlaylist(newPlaylistName, newPlaylistDesc);
    if (song) {
      addSongToPlaylist(newPlaylist.id, song);
    }
    
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setIsCreatingNew(false);
    onClose();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (song) {
      addSongToPlaylist(playlistId, song);
      onClose();
    }
  };

  const isSongInPlaylist = (playlist: any) => {
    if (!song) return false;
    return playlist.songs?.some((s: any) => s.id === song.id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to playlist</Text>
            <Pressable onPress={onClose} hitSlop={20}>
              <CloseIcon width={24} height={24} fill="white" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Create New Playlist */}
            {!isCreatingNew ? (
              <TouchableOpacity
                style={styles.playlistItem}
                onPress={() => setIsCreatingNew(true)}
              >
                <View style={styles.playlistIcon}>
                  <PlusIcon width={24} height={24} fill="white" />
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>Create new playlist</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Playlist name"
                  placeholderTextColor="#666"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  placeholderTextColor="#666"
                  value={newPlaylistDesc}
                  onChangeText={setNewPlaylistDesc}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.createButtons}>
                  <TouchableOpacity
                    style={[styles.createButton, styles.cancelButton]}
                    onPress={() => {
                      setIsCreatingNew(false);
                      setNewPlaylistName("");
                      setNewPlaylistDesc("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, styles.confirmButton]}
                    onPress={handleCreatePlaylist}
                  >
                    <Text style={styles.confirmButtonText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Existing Playlists */}
            {!isCreatingNew && (
              <>
                <Text style={styles.sectionTitle}>Your playlists</Text>
                {playlists.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No playlists yet</Text>
                    <Text style={styles.emptySubtext}>
                      Create your first playlist to add songs
                    </Text>
                  </View>
                ) : (
                  playlists.map((playlist) => (
                    <TouchableOpacity
                      key={playlist.id}
                      style={styles.playlistItem}
                      onPress={() => handleAddToPlaylist(playlist.id)}
                    >
                      <View
                        style={[
                          styles.playlistIcon,
                          { backgroundColor: "#333" },
                        ]}
                      >
                        <Text style={styles.playlistInitial}>
                          {playlist.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.playlistInfo}>
                        <Text style={styles.playlistName}>{playlist.name}</Text>
                        <Text style={styles.playlistCount}>
                          {playlist.songs?.length || 0} songs
                        </Text>
                      </View>
                      {isSongInPlaylist(playlist) && (
                        <CheckIcon width={20} height={20} fill="#1DB954" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  playlistInitial: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  playlistCount: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  createForm: {
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  createButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  createButton: {
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#1DB954",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});

export default PlaylistModal;
