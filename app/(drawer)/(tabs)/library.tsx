import Header from "@/components/Header";
import { clearRecentActivity, getRecentActivity } from "@/src/lib/storage";
import { jioSaavnService } from "@/src/services/jioSaavnService";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MoreVertical, Trash2 } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
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

const LibraryItem = memo(({ item }: { item: LibraryItemData }) => {
  const router = useRouter();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  const handlePress = async () => {
    if (item.type === "song") {
      try {
        const response = await jioSaavnService.getSongByIdandLink(item.id, "");
        if (response.success && response.data[0]) {
          setCurrentTrack(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching song details from library:", error);
      }
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

  const getImageUri = (img: any): string => {
    let url = "";
    if (Array.isArray(img)) {
      url = img[2]?.url || img[1]?.url || img[0]?.url || "";
    } else if (typeof img === "string") {
      url = img;
    }

    if (!url) return "";

    if (url.includes("150x150")) {
      url = url.replace("150x150", "500x500");
    } else if (url.includes("50x50")) {
      url = url.replace("50x50", "500x500");
    }
    return url;
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
          className="text-white text-[17px] font-bold tracking-tight"
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

      <TouchableOpacity className="p-2 opacity-60">
        <MoreVertical size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function LibraryScreen() {
  const [recentActivity, setRecentActivity] = useState<LibraryItemData[]>([]);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const activity = getRecentActivity();
      setRecentActivity(activity);
    }, []),
  );

  const handleClear = () => {
    clearRecentActivity();
    setRecentActivity([]);
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

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["transparent", "rgba(0,0,0,0.9)"],
    );

    return {
      transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
    };
  });

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Premium Glows */}
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
      </Animated.View>

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
        renderItem={({ item }: any) => <LibraryItem item={item} />}
        estimatedItemSize={88}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT + 10,
          paddingBottom: 150,
        }}
        ListHeaderComponent={
          <View className="px-4 pb-6 flex-row items-center justify-between mt-4">
            <View>
              <Text className="text-white text-3xl font-extrabold tracking-tighter">
                Recent Activity
              </Text>
              <Text className="text-gray-500 text-sm font-medium mt-1">
                Your history across sessions
              </Text>
            </View>
            {recentActivity.length > 0 && (
              <TouchableOpacity
                onPress={handleClear}
                className="flex-row items-center bg-red-500/10 px-4 py-2 rounded-full active:bg-red-500/20"
              >
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-[#ef4444] text-xs font-bold ml-2">
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-32 px-12">
            <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6"></View>
            <Text className="text-white text-xl font-bold mb-2">
              Nothing here yet
            </Text>
            <Text className="text-gray-500 text-center text-base leading-6">
              Songs, albums, and artists you interact with will appear here
              automatically.
            </Text>
          </View>
        }
      />
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
});
