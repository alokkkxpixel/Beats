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
import React, { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QueueSheet from "./QueueSheet";

export default function PlayerWrapper({
  children,
  isPlayerReady = false,
}: {
  children: React.ReactNode;
  isPlayerReady?: boolean;
}) {
  const insets = useSafeAreaInsets();

  const isFullPlayerOpen = usePlayerStore((state) => state.isFullPlayerOpen);
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);
  const minimizeQueue = usePlayerStore((state) => state.minimizeQueue);
  const minimizeFullPlayer = usePlayerStore(
    (state) => state.minimizeFullPlayer,
  );
  const expandFullPlayer = usePlayerStore((state) => state.expandFullPlayer);
  const minizeMoreOption = usePlayerStore((state) => state.minizeMoreOption);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isDrawerOpen = usePlayerStore((state) => state.isDrawerOpen);
  const isMoreOptionOpen = usePlayerStore((state) => state.isMoreOptionOpen);

  const segments = useSegments();

  // Hide mini player on non-tab routes
  const shouldShowMiniPlayer =
    segments.length > 0 &&
    (segments as string[]).includes("(tabs)") &&
    !!currentTrack &&
    !isDrawerOpen;

  let TABBAR_HEIGHT = 55 + insets.bottom;
  const snapPoints = ["100%"];
  const snapPointQueue = ["50%", "100%"];
  const MoreSheetSnapPoint = ["50%"];

  const sheetRef = useRef<BottomSheet>(null);
  const moreSheetRef = useRef<BottomSheet>(null);
  const queueSheetRef = useRef<BottomSheet>(null);

  // Sync BottomSheet with Zustand state
  useEffect(() => {
    if (isFullPlayerOpen) {
      const frame = requestAnimationFrame(() => {
        sheetRef.current?.expand();
      });
      return () => cancelAnimationFrame(frame);
    } else {
      sheetRef.current?.close();
    }
  }, [isFullPlayerOpen]);

  useEffect(() => {
    if (isMoreOptionOpen) {
      const frame = requestAnimationFrame(() => {
        moreSheetRef.current?.snapToIndex(0);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      moreSheetRef.current?.close();
    }
  }, [isMoreOptionOpen]);

  useEffect(() => {
    if (isQueueOpen) {
      const frame = requestAnimationFrame(() => {
        queueSheetRef.current?.snapToIndex(0);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      queueSheetRef.current?.close();
    }
  }, [isQueueOpen]);

  const handleCloseSheet = useCallback(() => {
    minimizeFullPlayer();
  }, [minimizeFullPlayer]);

  const handleCloseMoreSheet = useCallback(() => {
    minizeMoreOption();
  }, [minizeMoreOption]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {isPlayerReady && <GlobalAudioPlayer />}
      {children}

      {/* Layer 2: Mini Player */}
      {shouldShowMiniPlayer && (
        <Pressable
          onPress={() => expandFullPlayer()}
          className={`absolute w-full z-50 h-20 `}
          style={[{ bottom: TABBAR_HEIGHT }]}
        >
          <MiniPlayer />
        </Pressable>
      )}

      {/* Layer 3: Main Player Sheet */}
      <View
        style={[
          styles.sheetContainer,
          { zIndex: isFullPlayerOpen ? 1000 : -1 },
        ]}
        pointerEvents={isFullPlayerOpen ? "auto" : "none"}
      >
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          animateOnMount={false}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.fullPlayerBackground}
          onClose={minimizeFullPlayer}
          handleComponent={null}
        >
          <BottomSheetScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {currentTrack ? (
              <FullPlayer
                handleCloseSheet={handleCloseSheet}
                handleCloseMoreSheet={handleCloseMoreSheet}
              />
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>

      {/* Layer 4: More Options Sheet */}
      <View
        style={[
          styles.sheetContainer,
          { zIndex: isMoreOptionOpen ? 2000 : -1 },
        ]}
        pointerEvents={isMoreOptionOpen ? "auto" : "none"}
      >
        <BottomSheet
          ref={moreSheetRef}
          index={-1}
          snapPoints={MoreSheetSnapPoint}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          animateOnMount={false}
          onClose={minizeMoreOption}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.moreSheetBackground}
          handleIndicatorStyle={{ backgroundColor: "#fff" }}
          handleComponent={null}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.moreSheetContent}
          >
            <MusicBottomSheet />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>

      {/* Layer 5: Queue Sheet */}
      <View
        style={[StyleSheet.absoluteFill, { zIndex: isQueueOpen ? 6000 : -1 }]}
        pointerEvents="box-none"
      >
        <BottomSheet
          ref={queueSheetRef}
          index={-1}
          snapPoints={snapPointQueue}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          animateOnMount={false}
          onClose={minimizeQueue}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.queueSheetBackground}
          handleIndicatorStyle={{ backgroundColor: "#555" }}
        >
          <QueueSheet />
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
  sheetContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  fullPlayerBackground: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  moreSheetBackground: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  queueSheetBackground: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  moreSheetContent: {
    flexGrow: 1,
    width: "100%",
    paddingVertical: 10,
  },
});
