import { useGlobalSearch, useSearchSuggestions } from "@/src/hooks/useQueries";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useSearchStore } from "@/src/store/useSearchStore";
import {
  getSearchHistory,
  setSearchHistory,
  addToRecentActivity,
} from "@/src/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowUpRight, History, Mic, PlayCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchHistoryItem {
  id: string;
  term: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from MMKV on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      // Focus input when screen comes into focus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, []),
  );

  const { data: searchResults, isLoading: isGlobalLoading } =
    useGlobalSearch(debouncedQuery);
  const { data: suggestions, isLoading: isSuggestLoading } =
    useSearchSuggestions(debouncedQuery);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [
      { id: Date.now().toString(), term: term.trim() },
      ...history.filter((h) => h.term.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 7); // Max 7 items as requested
    setHistory(newHistory);
    setSearchHistory(newHistory);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    addToHistory(query);
    router.push({
      pathname: "/search-results",
      params: { q: query },
    });
  };

  const handleResultPress = async (item: any) => {
    Keyboard.dismiss();
    addToHistory(item.title || item.name);

    if (item.type === "song") {
      try {
        const response = await jioSaavnService.getSongByIdandLink(
          item.id,
          item.url,
        );
        if (response.success && response.data?.[0]) {
          setCurrentTrack(response.data[0]);
        } else {
          setCurrentTrack(item);
        }
      } catch (error) {
        console.error("Failed to fetch full song details:", error);
        setCurrentTrack(item);
      }
    } else {
      // For non-song items (albums, artists, playlists), track them here
      addToRecentActivity({
        id: item.id,
        title: item.title || item.name,
        image: item.image?.[1]?.url || item.image?.[0]?.url || item.image,
        type: item.type,
        subtitle: item.subtitle || item.description || item.type,
        timestamp: Date.now(),
      });

      if (item.type === "album") {
        router.push({
          pathname: "/album-detail",
          params: { albumId: item.id, albumUrl: item.url },
        });
      } else if (item.type === "playlist") {
        router.push({
          pathname: "/playlist-detail",
          params: { playlistId: item.id, playlistUrl: item.url },
        });
      } else if (item.type === "artist") {
        router.push({
          pathname: "/artist/[id]",
          params: { id: item.id, url: item.url },
        });
      }
    }
  };

  const renderHistoryItem = (item: SearchHistoryItem) => (
    <Pressable
      key={item.id}
      className="flex-row items-center justify-between px-5 py-3 active:bg-white/5"
      onPress={() => {
        setSearchQuery(item.term);
        Keyboard.dismiss();
      }}
    >
      <View className="flex-row items-center flex-1">
        <History size={18} color="#888" strokeWidth={1.5} />
        <Text
          className="text-[#e5e5e5] text-[15px] ml-6 flex-1 font-sans-medium"
          numberOfLines={1}
        >
          {item.term}
        </Text>
      </View>
      <ArrowUpRight size={18} color="#888" strokeWidth={1.5} />
    </Pressable>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText} className="font-sans-bold">
        {title}
      </Text>
    </View>
  );

  const renderResultItem = (item: any, isArtist: boolean = false) => (
    <Pressable
      key={item.id}
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <Image
        source={{ uri: item.image?.[1]?.url || item.image }}
        style={[styles.resultImage, isArtist && styles.artistImage]}
      />
      <View style={styles.resultInfo}>
        <Text
          style={styles.resultTitle}
          numberOfLines={1}
          className="font-sans-medium"
        >
          {item.title || item.name}
        </Text>
        <Text
          style={styles.resultSubtitle}
          numberOfLines={1}
          className="font-sans-light"
        >
          {item.subtitle || item.description || ""}
        </Text>
      </View>
      {item.type === "song" && (
        <PlayCircle size={22} color="#888" strokeWidth={1.5} />
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-[#050505]" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Search Header */}
        <View className="flex-row items-center px-2 py-2 mb-2">
          <Pressable
            onPress={() => (navigation.goBack(), setSearchQuery(""))}
            className="p-2 active:opacity-60"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <View className="flex-1 flex-row items-center bg-[#1a1a1a] rounded-full px-4 h-11 mx-1">
            <TextInput
              ref={inputRef}
              className="flex-1 text-white text-[16px] h-full font-sans-medium"
              placeholder="Songs, artists, or albums"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="gray"
              autoFocus
              cursorColor="white"
              returnKeyType="search"
              onSubmitEditing={() => handleSearchSubmit(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name="close-circle" size={20} color="#888" />
              </Pressable>
            )}
          </View>
          <View className="flex-row items-center">
            <Pressable className="p-2.5 bg-[#1a1a1a] rounded-full mx-1 active:opacity-60">
              <Mic size={20} color="white" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* History Section */}
          {!searchQuery && (
            <View>
              {history.map(renderHistoryItem)}
              <View style={styles.hr} />
            </View>
          )}

          {(isGlobalLoading || isSuggestLoading) &&
            debouncedQuery.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}

          {/* Suggestions and Global Results */}
          {searchQuery.length > 0 && (
            <View>
              {/* Autocomplete Suggestions (Text only) */}
              {searchResults?.data?.topQuery?.results
                ?.slice(0, 3)
                .map((item: any) => (
                  <Pressable
                    key={`suggest-${item.id}`}
                    className="flex-row items-center justify-between px-5 py-3 active:bg-white/5"
                    onPress={() => handleSearchSubmit(item.title || item.name)}
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="search-outline" size={18} color="#888" />
                      <Text
                        className="text-[#e5e5e5] text-[15px] ml-6 flex-1 font-sans-medium"
                        numberOfLines={1}
                      >
                        {item.title || item.name}
                      </Text>
                    </View>
                    <ArrowUpRight size={18} color="#888" strokeWidth={1.5} />
                  </Pressable>
                ))}

              <View style={styles.hr} />

              {/* Global Results below the line (No Top Results) */}
              {searchResults?.data?.topQuery?.results &&
                searchResults.data.topQuery.results.length > 0 && (
                  <>
                    {renderSectionHeader("Top Result")}
                    {searchResults.data.topQuery.results
                      .slice(0, 1)
                      .map((item: any) => renderResultItem(item))}
                  </>
                )}
              {searchResults?.data?.songs?.results &&
                searchResults.data.songs.results.length > 0 && (
                  <>
                    {renderSectionHeader("Songs")}
                    {searchResults.data.songs.results
                      .slice(0, 3)
                      .map((item: any) => renderResultItem(item))}
                  </>
                )}

              {searchResults?.data?.albums?.results &&
                searchResults.data.albums.results.length > 0 && (
                  <>
                    {renderSectionHeader("Albums")}
                    {searchResults.data.albums.results
                      .slice(0, 3)
                      .map((item: any) => renderResultItem(item))}
                  </>
                )}

              {searchResults?.data?.artists?.results &&
                searchResults.data.artists.results.length > 0 && (
                  <>
                    {renderSectionHeader("Artists")}
                    {searchResults.data.artists.results
                      .slice(0, 3)
                      .map((item: any) => renderResultItem(item, true))}
                  </>
                )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hr: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    color: "white",
    fontSize: 18,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  artistImage: {
    borderRadius: 24,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resultTitle: {
    color: "white",
    fontSize: 16,
  },
  resultSubtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
});
