import FullPlayer from "@/components/FullPlayer";
import MiniPlayer from "@/components/MiniPlayer";
// import MusicBottomSheet from "./";
import MusicBottomSheet from "@/components/MusicBottomSheet";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";
import QueueSheet from "./QueueSheet";
// --- Sub-components for better isolation ---
import { usePlaylistStore } from "@/src/store/usePlaylistStore";
import AudioDeviceBottomSheet from "./AudioDeviceBottomSheet";
import LyricsScreen from "./LyricsScreen";
import PlaylistModal from "./PlaylistModal";
const MiniPlayerLayer = React.memo(({ tabHeight }: { tabHeight: number }) => {
  const { hasTrack, isDrawerOpen, expandFullPlayer } = usePlayerStore(
    useShallow((s) => ({
      hasTrack: !!s.currentTrack,
      isDrawerOpen: s.isDrawerOpen,
      expandFullPlayer: s.expandFullPlayer,
    })),
  );
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;
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
      style={{
        position: "absolute",
        width: "100%",
        zIndex: 50,
        bottom: tabHeight,
        height: isShortScreen ? 58 : 70,
      }}
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
  const moreSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["70%", "100%"], []);

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

const AudioDeviceSheetLayer = React.memo(() => {
  const { isAudioDeviceOpen, minizeAudioDevice } = usePlayerStore(
    useShallow((s) => ({
      isAudioDeviceOpen: s.isAudioDeviceOpen,
      minizeAudioDevice: s.minizeAudioDevice,
    })),
  );

  const audioSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["65%"], []);

  useEffect(() => {
    if (isAudioDeviceOpen) audioSheetRef.current?.snapToIndex(0);
    else audioSheetRef.current?.close();
  }, [isAudioDeviceOpen]);

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
      style={[styles.sheetContainer, { zIndex: isAudioDeviceOpen ? 2100 : -1 }]}
      pointerEvents={isAudioDeviceOpen ? "auto" : "none"}
    >
      <BottomSheet
        ref={audioSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        onClose={minizeAudioDevice}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.audioSheetBackground}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moreSheetContent}
        >
          <AudioDeviceBottomSheet />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
});
AudioDeviceSheetLayer.displayName = "AudioDeviceSheetLayer";

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
          { backgroundColor: accentColor.average },
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

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: isLyricsOpen ? 6000 : -1 }]}
      pointerEvents="box-none"
    >
      <BottomSheet
        ref={lyricsSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        onClose={minimizeLyrics}
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.queueSheetBackground,
          { backgroundColor: accentColor.average },
        ]}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <LyricsScreen />
      </BottomSheet>
    </View>
  );
});
LyricsSheetLayer.displayName = "LyricsSheetLayer";

const PlaylistModalLayer = React.memo(() => {
  const { isPlaylistModalOpen, closePlaylistModal, selectedSongForPlaylist } = (
    usePlaylistStore as any
  )();

  return (
    <PlaylistModal
      visible={isPlaylistModalOpen}
      onClose={closePlaylistModal}
      song={selectedSongForPlaylist}
    />
  );
});
PlaylistModalLayer.displayName = "PlaylistModalLayer";

export function PlayerWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const TABBAR_HEIGHT = 55 + insets.bottom;
  const netInfo = useNetInfo();
  const isOffline =
    netInfo.isConnected === false ||
    (netInfo.isConnected !== null && netInfo.isInternetReachable === false);

  const {
    hasTrack,
    isDrawerOpen,
    isFullPlayerOpen,
    isQueueOpen,
    isMoreOptionOpen,
    isAudioDeviceOpen,
    isLyricsOpen,
  } = usePlayerStore(
    useShallow((s) => ({
      hasTrack: !!s.currentTrack,
      isDrawerOpen: s.isDrawerOpen,
      isFullPlayerOpen: s.isFullPlayerOpen,
      isQueueOpen: s.isQueueOpen,
      isMoreOptionOpen: s.isMoreOptionOpen,
      isAudioDeviceOpen: s.isAudioDeviceOpen,
      isLyricsOpen: s.isLyricsOpen,
    })),
  );

  const isPlaylistModalOpen = usePlaylistStore((s) => s.isPlaylistModalOpen);

  const isAnySheetOpen =
    isFullPlayerOpen ||
    isQueueOpen ||
    isMoreOptionOpen ||
    isAudioDeviceOpen ||
    isLyricsOpen ||
    isPlaylistModalOpen;

  const [showOfflineBanner, setShowOfflineBanner] = React.useState(false);

  React.useEffect(() => {
    if (isOffline) {
      setShowOfflineBanner(true);
      const timer = setTimeout(() => {
        setShowOfflineBanner(false);
      }, 15000);
      return () => clearTimeout(timer);
    } else {
      setShowOfflineBanner(false);
    }
  }, [isOffline]);

  const segments = useSegments();
  const isMiniPlayerShowing =
    segments.length > 0 &&
    (segments as string[]).includes("(tabs)") &&
    hasTrack &&
    !isDrawerOpen;

  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;
  const MINIPLAYER_HEIGHT = isShortScreen ? 58 : 70;

  const bannerBottom = isMiniPlayerShowing
    ? TABBAR_HEIGHT + MINIPLAYER_HEIGHT
    : TABBAR_HEIGHT;

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
      if (state.isAudioDeviceOpen) {
        state.minizeAudioDevice();
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
      {showOfflineBanner && !isAnySheetOpen && (
        <View style={[styles.offlineBanner, { bottom: bannerBottom }]}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}
      <FullPlayerSheetLayer />
      <MoreOptionsSheetLayer />
      <AudioDeviceSheetLayer />
      <QueueSheetLayer />
      <LyricsSheetLayer />
      <PlaylistModalLayer />
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
  audioSheetBackground: {
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
  offlineBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#2e77d0",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  offlineText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "sans-semibold",
  },
});
