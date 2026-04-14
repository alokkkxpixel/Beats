import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const HEADER_HEIGHT = 40;

export default function App({ title }: { title: string }) {
  const router = useRouter();
  const translateY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      const diff = currentOffset - lastContentOffset.value;

      // Logic: If scrolling down (diff > 0), move header up.
      // If scrolling up (diff < 0), move header down.
      // Clamp the value between -HEADER_HEIGHT and 0.
      if (currentOffset <= 0) {
        translateY.value = withTiming(0);
      } else {
        translateY.value = Math.max(
          -HEADER_HEIGHT,
          Math.min(0, translateY.value - diff),
        );
      }

      lastContentOffset.value = currentOffset;
    },
    onBeginDrag: () => {
      isScrolling.value = true;
    },
    onEndDrag: () => {
      isScrolling.value = false;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(
        translateY.value,
        [-HEADER_HEIGHT + 30, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <View className="flex-row items-center justify-between px-[20px] py-5 w-full">
          <Text className="text-white font-bold text-3xl">{title}</Text>

          <View className="flex-row items-center gap-8">
            <Pressable onPress={() => router.push("/search")}>
              <Ionicons name="search" size={20} color="white" />
            </Pressable>
            <Pressable onPress={() => console.log("profile")}>
              <View className="w-[32px] h-[32px] rounded-full overflow-hidden border border-white/20">
                <Image
                  source={{
                    uri: "https://avatars.githubusercontent.com/u/132479455?v=4",
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    // backgroundColor: "#000",
    zIndex: 1000,
    justifyContent: "center",
    elevation: 4, // for android shadow
  },
});
