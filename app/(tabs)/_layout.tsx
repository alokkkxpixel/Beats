import AudioEngine from "@/components/AudioEngine";
import FullPlayer from "@/components/FullPlayer";
import { HapticTab } from "@/components/haptic-tab";
import MiniPlayer from "@/components/MiniPlayer";
import MusicBottomSheet from "@/components/MusicBottomSheet";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import { Compass, Home, Library } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const {
    isFullPlayerOpen,
    minimizeFullPlayer,
    expandFullPlayer,
    minizeMoreOption,
    isMoreOptionOpen,
  } = usePlayerStore();
  const tabBarHeight = 55 + insets.bottom;
  const snapPoints = ["100%"];
  const MoreSheetSnapPoint = ["50%"];

  const sheetRef = useRef<BottomSheet>(null);
  const moreSheetRed = useRef<BottomSheet>(null);
  // Sync BottomSheet with Zustand state
  React.useEffect(() => {
    if (isFullPlayerOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isFullPlayerOpen]);
  React.useEffect(() => {
    if (isMoreOptionOpen) {
      moreSheetRed.current?.expand();
    } else {
      moreSheetRed.current?.close();
    }
  }, [isMoreOptionOpen]);
  const handleCloseSheet = useCallback(() => {
    minimizeFullPlayer();
  }, [minimizeFullPlayer]);
  const handleCloseMoreSheet = useCallback(() => {
    minizeMoreOption();
  }, [minizeMoreOption]);

  return (
    <View style={styles.container}>
      <AudioEngine />
      <Tabs
        backBehavior="history"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: tabBarHeight,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom - 2, 2),
            backgroundColor: "#000000ff",
            borderTopColor: "rgba(255,255,255,0.06)",
            position: "absolute",
            zIndex: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",

            tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color }) => <Library size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="album-detail"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="playlist-detail"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="category-details"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="artist/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="search-results"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Layer 2: Mini Player (only visible when BottomSheet is closed) */}

      <Pressable
        onPress={() => expandFullPlayer()}
        className="absolute w-full bg-red-500 z-50 h-20"
        style={{ bottom: tabBarHeight }}
      >
        <MiniPlayer />
      </Pressable>

      {/* Layer 3: Main Player/Sheet (stays closed at index -1 until opened) */}
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
        pointerEvents="box-none"
      >
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={{
            backgroundColor: "#1e1e1e",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          onClose={() => minimizeFullPlayer()}
          handleComponent={null}
        >
          <BottomSheetScrollView
            // contentContainerStyle={{ padding: 20 }}
            style={{ flex: 1 }}
          >
            <FullPlayer
              handleCloseSheet={handleCloseSheet}
              handleCloseMoreSheet={handleCloseMoreSheet}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>

      <View
        style={[StyleSheet.absoluteFill, { zIndex: 200 }]}
        pointerEvents="box-none"
      >
        <BottomSheet
          ref={moreSheetRed}
          index={-1}
          snapPoints={MoreSheetSnapPoint}
          enablePanDownToClose={true}
          onClose={minizeMoreOption}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              pressBehavior="close" // 👈 THIS enables tap outside to close
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          )}
          backgroundStyle={{
            backgroundColor: "#18181b",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleIndicatorStyle={{ backgroundColor: "#fff" }}
          handleComponent={null}
        >
          <BottomSheetScrollView
            // contentContainerStyle={{ padding }}

            contentContainerStyle={{
              flexGrow: 1,
              width: "100%",

              paddingVertical: 10,
            }}
          >
            <MusicBottomSheet />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
});
