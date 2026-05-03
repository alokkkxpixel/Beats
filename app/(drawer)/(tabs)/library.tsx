import Header from "@/components/Header";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { FastForward, MoreVertical, ThumbsUp } from "lucide-react-native";
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

// ... your other imports
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;
// const TypedFlashList = FlashList as any;

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
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmC-bgMEYLL5bqDyQ4LYqI3eVLaearVecZo3Ngzej7nF9nmLcAa3TDS09J3uy4-2kXrUrS9zZYhhD0NSF7HTkmoGMOhdxZfYBXbd-j6_M&s=10",
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
  {
    id: "8",
    title: "Imagine Dragons",
    subtitle: "Artist",
    type: "artist",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop",
  },
  {
    id: "9",
    title: "Rewind '23",
    subtitle: "What you listened to in 2023",
    type: "playlist",
    gradient: ["#8b5cf6", "#ec4899"],
    icon: FastForward,
  },
  {
    id: "10",
    title: "Supermix",
    subtitle: "Ed Sheeran, Rick Astley and more",
    type: "playlist",
    image:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
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
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
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
  const insets = useSafeAreaInsets();
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
      ["transparent", "#000000"],
    );

    return {
      transform: [{ translateY: translateY.value }],
      backgroundColor: backgroundColor,
      opacity: interpolate(
        translateY.value,
        [-TOTAL_HEADER_HEIGHT, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <StatusBar barStyle="light-content" />
      {/* Wrap glows in Animated.View to fade them out */}
      <Animated.View style={[StyleSheet.absoluteFill, glowAnimatedStyle]}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowCenter} />
      </Animated.View>

      <Animated.View
        style={[
          styles.headerWrapper,
          headerAnimatedStyle,
          { height: HEADER_HEIGHT, paddingTop: insets.top },
        ]}
      >
        <Header title="Library" />
      </Animated.View>
      <AnimatedFlashList
        data={LIBRARY_DATA}
        renderItem={({ item }: any) => <LibraryItem item={item} />}
        estimatedItemSize={84}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: TOTAL_HEADER_HEIGHT + 20,
          paddingBottom: 180,
        }}
        // ListHeaderComponent={
        //   <View className="px-4 pt-0 pb-2">
        //     <View className="flex-row items-center justify-between mt-2">
        //       <View className="flex-row items-center">
        //         <TouchableOpacity className="p-2 mr-1">
        //           <List size={26} color="white" strokeWidth={2.5} />
        //         </TouchableOpacity>
        //         <TouchableOpacity className="p-2">
        //           <LayoutGrid size={24} color="white" strokeWidth={2.5} />
        //         </TouchableOpacity>
        //       </View>
        //     </View>
        //   </View>
        // }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "center",
  },
  // ... your existing glow styles remain the same
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    // backgroundColor: "rgba(165, 42, 42, 0.45)",
  },
  backgroundGlowCenter: {
    position: "absolute",
    top: 120,
    left: 140,
    width: 140,
    height: 320,
    borderRadius: 80,
    // backgroundColor: "rgba(255, 166, 77, 0.12)",
  },
});
