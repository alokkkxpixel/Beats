import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowUpRight, AudioLines, History, Mic } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchHistoryItem {
  id: string;
  term: string;
}

const RECENT_SEARCHES: SearchHistoryItem[] = [
  { id: "1", term: "ruby" },
  { id: "2", term: "tum hi ho" },
  { id: "3", term: "om vashudhareyy namah" },
  { id: "4", term: "ajay atul devi" },
  { id: "5", term: "chunri chunri" },
  { id: "6", term: "addha seesha" },
  { id: "7", term: "ariana grande" },
  { id: "8", term: "keeji khesari ke lal dj" },
  { id: "9", term: "darule jeenie" },
  { id: "10", term: "chardiwar" },
  { id: "11", term: "future" },
  { id: "12", term: "vithal vithal vithala hari om vithala dj" },
  { id: "13", term: "banayenge mandir dj song" },
  { id: "14", term: "bhagwa rang dj" },
];

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <Pressable
      className="flex-row items-center justify-between px-5 py-4 active:bg-white/5"
      onPress={() => setSearchQuery(item.term)}
    >
      <View className="flex-row items-center flex-1">
        <History size={20} color="#888" strokeWidth={1.5} />
        <Text
          className="text-[#e5e5e5] text-[15px] ml-6 flex-1 font-medium"
          numberOfLines={1}
        >
          {item.term}
        </Text>
      </View>
      <ArrowUpRight size={18} color="#888" strokeWidth={1.5} />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Search Header */}
        <View className="flex-row items-center px-2 py-2 mb-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 active:opacity-60"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>

          <View className="flex-1 flex-row items-center bg-[#1a1a1a] rounded-full px-4 h-11 mx-1">
            <TextInput
              className="flex-1 text-white text-[16px] h-full"
              placeholder="Search songs, artists, p..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="#fff"
              autoFocus
            />
          </View>

          <View className="flex-row items-center">
            <Pressable className="p-2.5 bg-[#1a1a1a] rounded-full mx-1 active:opacity-60">
              <Mic size={20} color="white" strokeWidth={2} />
            </Pressable>

            <Pressable className="p-2 active:opacity-60">
              <AudioLines size={22} color="white" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* History List */}
        <FlatList
          data={RECENT_SEARCHES}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={{
            paddingBottom: 150, // Space for miniplayer and tabs
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </View>
  );
}
