import FullPlayer from "@/components/FullPlayer";
import { HapticTab } from "@/components/haptic-tab";
import MiniPlayer from "@/components/MiniPlayer";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import { Compass, Home, Library } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(true);
  const tabBarHeight = 55 + insets.bottom;
  const { height } = useWindowDimensions();
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  // const snapPoints = useMemo(() => [height], [height]);
  const snapPoints = ["100%"];

  const handleOpenSheet = useCallback((index: number) => {
    sheetRef.current?.expand();
    setIsOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    setIsOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <Tabs
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
      </Tabs>

      {/* Layer 2: Mini Player (only visible when BottomSheet is closed) */}

      <Pressable
        onPress={() => handleOpenSheet(0)}
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
          onClose={() => setIsOpen(false)}
          handleComponent={null}
        >
          <BottomSheetScrollView
            // contentContainerStyle={{ padding: 20 }}
            style={{ flex: 1 }}
          >
            <FullPlayer handleCloseSheet={handleCloseSheet} />
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
