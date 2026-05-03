import FullPlayer from "@/components/FullPlayer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import MiniPlayer from "@/components/MiniPlayer";
import MusicBottomSheet from "@/components/MusicBottomSheet";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSegments } from "expo-router";
import React, { useCallback, useRef } from "react";
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
          <BottomSheetScrollView style={{ flex: 1 }}>
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
