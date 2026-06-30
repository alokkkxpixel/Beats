import { useAuthStore } from "@/src/store/useAuthStore";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Import SVGs
import SearchIcon from "@/assets/app-icons/search.svg";

const HEADER_HEIGHT = 40;

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { user, isSignedIn } = useAuthStore();
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
         <Image
            source={require("../assets/icons/Vector.png")}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
          />

          <View className="flex-row items-center gap-8">
            <Pressable onPress={() => router.push("/search")}>
              <SearchIcon width={28} height={28} fill="white" />
            </Pressable>
            <Pressable onPress={() => navigation.openDrawer()}>
              <View className="w-[32px] h-[32px] rounded-full overflow-hidden border border-white/20">
                {isSignedIn && user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Image
                    source={require("../assets/icons/appIcon.png")}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
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
