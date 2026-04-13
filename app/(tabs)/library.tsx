import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  FastForward,
  LayoutGrid,
  List,
  MoreVertical,
  ThumbsUp,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TypedFlashList = FlashList as any;

interface LibraryItemData {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  image?: string;
  gradient?: string[];
  icon?: any;
}

const LIBRARY_DATA: LibraryItemData[] = [
  {
    id: "1",
    title: "Liked Songs",
    subtitle: "All your favourites in one place",
    type: "playlist",
    gradient: ["#4ade80", "#3b82f6"],
    icon: ThumbsUp,
  },
  {
    id: "2",
    title: "2Pac",
    subtitle: "Artist",
    type: "artist",
    image:
      "https://images.unsplash.com/photo-1514525253361-b83f60d6f5c1?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Supermix",
    subtitle: "Ed Sheeran, Rick Astley and more",
    type: "playlist",
    image:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    title: "Rewind '23",
    subtitle: "What you listened to in 2023",
    type: "playlist",
    gradient: ["#8b5cf6", "#ec4899"],
    icon: FastForward,
  },
  {
    id: "5",
    title: "Following My Intuition",
    subtitle: "Craig David",
    type: "album",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    title: "90's Hip Hop",
    subtitle: "Let's go back in time",
    type: "playlist",
    image:
      "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop",
  },
  {
    id: "7",
    title: "Imagine Dragons",
    subtitle: "Artist",
    type: "artist",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop",
  },
];

const LibraryItem = ({ item }: { item: LibraryItemData }) => {
  const Icon = item.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-2.5"
    >
      <View
        className="w-16 h-16 mr-3.5 overflow-hidden bg-white/5"
        style={{ borderRadius: item.type === "artist" ? 32 : 10 }}
      >
        {item.gradient ? (
          <LinearGradient
            colors={item.gradient as any}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {Icon && <Icon size={28} color="white" />}
          </LinearGradient>
        ) : (
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            contentFit="cover"
          />
        )}
      </View>

      <View className="flex-1 justify-center">
        <Text
          className="text-white text-[17px] font-semibold tracking-tight"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {item.subtitle && item.type !== "artist" && (
          <Text className="text-[#9ca3af] text-[13px] mt-0.5" numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>

      <TouchableOpacity className="p-2 ml-1">
        <MoreVertical size={20} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#050505]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-white text-[32px] font-bold tracking-tight">
          Library
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="p-2 mr-1">
            <List size={26} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <LayoutGrid size={24} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <TypedFlashList
        data={LIBRARY_DATA}
        renderItem={({ item }: any) => <LibraryItem item={item} />}
        estimatedItemSize={84}
        contentContainerStyle={{
          paddingBottom: 180, // Space for mini player and tab bar
          paddingTop: 8,
        }}
      />
    </SafeAreaView>
  );
}
