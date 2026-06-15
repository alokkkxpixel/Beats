import FullPlayer from "@/components/FullPlayer";
import MiniPlayer from "@/components/MiniPlayer";
// import MusicBottomSheet from "./";
import MusicBottomSheet from "@/components/MusicBottomSheet";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";
import QueueSheet from "./QueueSheet";
// --- Sub-components for better isolation ---
import LyricsScreen from "./LyricsScreen";
const MiniPlayerLayer = React.memo(({ tabHeight }: { tabHeight: number }) => {
  const { hasTrack, isDrawerOpen, expandFullPlayer } = usePlayerStore(
    useShallow((s) => ({
      hasTrack: !!s.currentTrack,
      isDrawerOpen: s.isDrawerOpen,
      expandFullPlayer: s.expandFullPlayer,
    })),
  );
  const segments = useSegments();
  const shouldShow =
    segments.length > 0 &&
    (segments as string[]).includes("(tabs)") &&
    hasTrack &&
    !isDrawerOpen;

  if (!shouldShow) return null;

  return (
    <Pressable
      onPress={() => expandFullPlayer()}
      className="absolute w-full z-50 h-20"
      style={{ bottom: tabHeight }}
    >
      <MiniPlayer />
    </Pressable>
  );
});
MiniPlayerLayer.displayName = "MiniPlayerLayer";

const FullPlayerSheetLayer = React.memo(() => {
  const { isFullPlayerOpen, minimizeFullPlayer, hasTrack } = usePlayerStore(
    useShallow((s) => ({
      isFullPlayerOpen: s.isFullPlayerOpen,
      minimizeFullPlayer: s.minimizeFullPlayer,
      hasTrack: !!s.currentTrack,
    })),
  );

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["100%"], []);

  useEffect(() => {
    if (isFullPlayerOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isFullPlayerOpen]);

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
    <View
      style={[styles.sheetContainer, { zIndex: isFullPlayerOpen ? 1000 : -1 }]}
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
          {hasTrack ? (
            <FullPlayer
              handleCloseSheet={minimizeFullPlayer}
              handleCloseMoreSheet={() => {}}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
});
FullPlayerSheetLayer.displayName = "FullPlayerSheetLayer";

const MoreOptionsSheetLayer = React.memo(() => {
  const { isMoreOptionOpen, minizeMoreOption } = usePlayerStore(
    useShallow((s) => ({
      isMoreOptionOpen: s.isMoreOptionOpen,
      minizeMoreOption: s.minizeMoreOption,
    })),
  );
  const accentColor = usePlayerStore((state) => state.accentColor);
  const moreSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["50%"], []);

  useEffect(() => {
    if (isMoreOptionOpen) moreSheetRef.current?.snapToIndex(0);
    else moreSheetRef.current?.close();
  }, [isMoreOptionOpen]);

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
    <View
      style={[styles.sheetContainer, { zIndex: isMoreOptionOpen ? 2000 : -1 }]}
      pointerEvents={isMoreOptionOpen ? "auto" : "none"}
    >
      <BottomSheet
        ref={moreSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        onClose={minizeMoreOption}
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.moreSheetBackground,
          // { backgroundColor: accentColor },
        ]}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        // handleComponent={null}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moreSheetContent}
        >
          <MusicBottomSheet />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
});
MoreOptionsSheetLayer.displayName = "MoreOptionsSheetLayer";

const QueueSheetLayer = React.memo(() => {
  const { isQueueOpen, minimizeQueue } = usePlayerStore(
    useShallow((s) => ({
      isQueueOpen: s.isQueueOpen,
      minimizeQueue: s.minimizeQueue,
    })),
  );

  const queueSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["50%", "100%"], []);

  useEffect(() => {
    if (isQueueOpen) queueSheetRef.current?.snapToIndex(0);
    else queueSheetRef.current?.close();
  }, [isQueueOpen]);
  const accentColor = usePlayerStore((state) => state.accentColor);

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
    <View
      style={[StyleSheet.absoluteFill, { zIndex: isQueueOpen ? 6000 : -1 }]}
      pointerEvents="box-none"
    >
      <BottomSheet
        ref={queueSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        onClose={minimizeQueue}
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.queueSheetBackground,
          { backgroundColor: accentColor },
        ]}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <QueueSheet />
      </BottomSheet>
    </View>
  );
});
QueueSheetLayer.displayName = "QueueSheetLayer";
const LyricsSheetLayer = React.memo(() => {
  const { isLyricsOpen, minimizeLyrics } = usePlayerStore(
    useShallow((s) => ({
      isLyricsOpen: s.isLyricsOpen,
      minimizeLyrics: s.minimizeLyrics,
    })),
  );

  const lyricsSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["100%"], []);

  useEffect(() => {
    if (isLyricsOpen) lyricsSheetRef.current?.snapToIndex(0);
    else lyricsSheetRef.current?.close();
  }, [isLyricsOpen]);
  const accentColor = usePlayerStore((state) => state.accentColor);

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
  const lrc = `
[00:00.00]Dreamers 
[00:04.43]Jungkook BTS
[00:09.11]
[00:09.61] ....
[00:16.96]Look who we are, we are the dreamers
[00:20.94]We’ll make it happen ’cause we believe it
[00:24.68]Look who we are, we are the dreamers
[00:29.18]We’ll make it happen ’cause we can see it
[00:34.23]Here’s to the ones, that keep the passion
[00:37.69]Respect, oh yeah
[00:41.67]Here’s to the ones, that can imagine
[00:46.20]Respect, oh yeah
[01:07.19]Gather ’round now, look at me
[01:11.71]Respect the love the only way
[01:15.68]If you wanna come, come with me
[01:20.21]The door is open now every day
[01:23.67]This one plus two, rendezvous all at my day
[01:28.19]This what we do, how we do
[01:31.63]Look who we are, we are the dreamers
[01:35.89]We’ll make it happen ’cause we believe it
[01:39.62]Look who we are, we are the dreamers
[01:43.87]We’ll make it happen ’cause we can see it
[01:48.95]Here’s to the ones, that keep the passion
[01:52.44]Respect, oh yeah
[01:56.42]Here’s to the ones, that can imagine
[02:00.67]Respect, oh yeah
[02:22.26]Look who we are, we are the dreamers
[02:25.98]We’ll make it happen ’cause we believe it
[02:30.23]Look who we are, we are the dreamers
[02:33.95]We’ll make it happen ’cause we can see it
[02:38.99]Cause to the one that keep the passion
[02:42.45]Respect, oh yeah
[02:47.22]‘Cause to the one that got the magic
[02:51.21]Respect, oh yeah

`;
  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: isLyricsOpen ? 6000 : -1 }]}
      pointerEvents="box-none"
    >
      <BottomSheet
        ref={lyricsSheetRef}
        index={-1}
        snapPoints={snapPoints}
        // enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        // onClose={minimizeLyrics}
        // backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.queueSheetBackground,
          { backgroundColor: accentColor },
        ]}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <LyricsScreen />
      </BottomSheet>
    </View>
  );
});
LyricsSheetLayer.displayName = "LyricsSheetLayer";

export function PlayerWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const TABBAR_HEIGHT = 55 + insets.bottom;

  useEffect(() => {
    const backAction = () => {
      const state = usePlayerStore.getState();

      // Close in reverse order of z-index/priority
      if (state.isQueueOpen) {
        state.minimizeQueue();
        return true;
      }
      if (state.isMoreOptionOpen) {
        state.minizeMoreOption();
        return true;
      }
      if (state.isLyricsOpen) {
        state.minimizeLyrics();
        return true;
      }
      if (state.isFullPlayerOpen) {
        state.minimizeFullPlayer();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      {children}
      <MiniPlayerLayer tabHeight={TABBAR_HEIGHT} />
      <FullPlayerSheetLayer />
      <MoreOptionsSheetLayer />
      <QueueSheetLayer />
      <LyricsSheetLayer />
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
    backgroundColor: "#1d1d1dff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  queueSheetBackground: {
    // backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  moreSheetContent: {
    flexGrow: 1,
    width: "100%",
    paddingVertical: 10,
  },
});
