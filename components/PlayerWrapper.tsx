import MiniPlayer from "@/components/MiniPlayer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import FullPlayer from "@/components/FullPlayer";
import MusicBottomSheet from "@/components/MusicBottomSheet";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useSegments } from "expo-router";
import React, { useCallback, useRef, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlayerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const {
    isFullPlayerOpen,
    minimizeFullPlayer,
    expandFullPlayer,
    minizeMoreOption,
    isMoreOptionOpen,
    currentTrack,
    isDrawerOpen,
  } = usePlayerStore();

  const segments = useSegments();

  // Hide mini player on non-tab routes (like settings, language change, etc.)
  // and only show if a track is actually loaded and drawer is closed
  const shouldShowMiniPlayer =
    segments.length > 0 &&
    (segments as string[]).includes("(tabs)") &&
    !!currentTrack &&
    !isDrawerOpen;

  const tabBarHeight = 55 + insets.bottom;
  const snapPoints = ["100%"];
  const MoreSheetSnapPoint = ["50%"];

  const sheetRef = useRef<BottomSheet>(null);
  const moreSheetRed = useRef<BottomSheet>(null);

  // Sync BottomSheet with Zustand state
  useEffect(() => {
    if (isFullPlayerOpen) {
      // Small delay ensures layout is ready, preventing the "stuck" peek behavior
      const timer = setTimeout(() => {
        sheetRef.current?.snapToIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      sheetRef.current?.close();
    }
  }, [isFullPlayerOpen]);

  useEffect(() => {
    if (isMoreOptionOpen) {
      const timer = setTimeout(() => {
        moreSheetRed.current?.snapToIndex(0);
      }, 50);
      return () => clearTimeout(timer);
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
      <GlobalAudioPlayer />
      {children}

      {/* Layer 2: Mini Player */}
      {shouldShowMiniPlayer && (
        <Pressable
          onPress={() => expandFullPlayer()}
          className="absolute w-full z-50 h-20"
          style={{ bottom: tabBarHeight }}
        >
          <MiniPlayer />
        </Pressable>
      )}

      {/* Layer 3: Main Player/Sheet */}
      {!!currentTrack && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { zIndex: isFullPlayerOpen ? 1000 : -1 }, // Move to back when closed
          ]}
          pointerEvents={isFullPlayerOpen ? "auto" : "none"} // Completely ignore touches when closed
        >
          <BottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            enableDynamicSizing={false}
            animateOnMount={false}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
              />
            )}
            backgroundStyle={{
              backgroundColor: "#1e1e1e",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
            onClose={() => minimizeFullPlayer()}
            handleComponent={null}
          >
            <BottomSheetScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <FullPlayer
                handleCloseSheet={handleCloseSheet}
                handleCloseMoreSheet={handleCloseMoreSheet}
              />
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      )}

      {!!currentTrack && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { zIndex: isMoreOptionOpen ? 2000 : -1 }, // Move to back when closed
          ]}
          pointerEvents={isMoreOptionOpen ? "auto" : "none"} // Completely ignore touches when closed
        >
          <BottomSheet
            ref={moreSheetRed}
            index={-1}
            snapPoints={MoreSheetSnapPoint}
            enablePanDownToClose={true}
            enableDynamicSizing={false}
            animateOnMount={false}
            onClose={minizeMoreOption}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
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
              showsVerticalScrollIndicator={false}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
});
