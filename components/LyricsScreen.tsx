import PauseIcon from "@/assets/app-icons/pause.svg";
import PlayIcon from "@/assets/app-icons/play.svg";
import Statminus from "@/assets/app-icons/stat-minus.svg";
import { useLyrics } from "@/src/hooks/useQueries";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { parseLrc } from "react-native-lyric";
import {
  TrackPlayer,
  useNowPlaying,
  useOnPlaybackProgressChange,
} from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";
import ProgressSection from "./ProgressSection";
const LINE_HEIGHT = 70;

export default function LyricsScreen() {
  const nowPlaying = useNowPlaying();
  const progress = useOnPlaybackProgressChange();
  const { height: windowHeight } = useWindowDimensions();

  // Reference to the ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // Tracks if the user is currently scrolling manually
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { currentTrack, minimizeLyrics, isPlaying, isLoading, isLyricsOpen } =
    usePlayerStore(
      useShallow((s) => ({
        currentTrack: s.currentTrack,
        minimizeLyrics: s.minimizeLyrics,
        isPlaying: s.isPlaying,
        isLoading: s.isLoading,
        isLyricsOpen: s.isLyricsOpen,
      })),
    );

  const playerData = nowPlaying;
  const track = playerData?.currentTrack || currentTrack;
  const originalSong = (track as any)?.extraPayload?.song || track;

  const trackTitle =
    (track as any)?.title ||
    (originalSong as any)?.title ||
    (originalSong as any)?.name ||
    "";

  const artistCandidates = useMemo(() => {
    return [
      (track as any)?.artist,
      (originalSong as any)?.artist,
      (originalSong as any)?.primaryArtists,
      (originalSong as any)?.subtitle,
    ]
      .filter(Boolean)
      .flatMap((artist) =>
        String(artist)
          .split(",")
          .map((a) => a.trim()),
      )
      .filter((artist, index, arr) => artist && arr.indexOf(artist) === index);
  }, [track, originalSong]);

  const { data: lyrics, isLoading: loadingLyrics } = useLyrics(
    trackTitle,
    artistCandidates,
    isLyricsOpen,
  );
  const lyricsNotFound = !loadingLyrics && !lyrics;

  // Header (~120px) + Bottom controls (~160px) = ~280px of non-lyrics space
  const lyricsHeight = Math.max(windowHeight - 280, 200);

  // Parse lyrics into structural array
  const parsedLyrics = useMemo(() => {
    if (!lyrics) return [];
    const lines = parseLrc(lyrics as string);
    if (lines.length > 0) return lines;

    // Plain lyrics fallback (split by newlines, assign timestamp -1)
    return (lyrics as string)
      .split("\n")
      .map((line: string, index: number) => ({
        id: `plain-${index}`,
        millisecond: -1,
        content: line.trim(),
      }));
  }, [lyrics]);

  // Derive current position in ms directly from the hook to avoid state update cascades
  const currentPositionMs = useMemo(() => {
    return (
      ((progress as any)?.position ?? (progress as any)?.currentTime ?? 0) *
      1000
    );
  }, [progress]);

  // Compute active lyric index as a pure derivation
  const currentIndex = useMemo(() => {
    if (!parsedLyrics || parsedLyrics.length === 0) return -1;
    if (parsedLyrics[0].millisecond === -1) return -1; // Plain lyrics

    let activeIndex = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentPositionMs >= parsedLyrics[i].millisecond) {
        activeIndex = i;
      } else {
        break;
      }
    }
    return activeIndex;
  }, [parsedLyrics, currentPositionMs]);

  // Reference to prevent unnecessary scrolls to the same index
  const lastScrolledIndexRef = useRef(-1);

  // Auto scroll effect
  useEffect(() => {
    if (
      !isUserInteracting &&
      currentIndex >= 0 &&
      currentIndex !== lastScrolledIndexRef.current &&
      scrollViewRef.current
    ) {
      lastScrolledIndexRef.current = currentIndex;
      scrollViewRef.current.scrollTo({
        y: currentIndex * LINE_HEIGHT,
        animated: true,
      });
    }
  }, [currentIndex, isUserInteracting]);

  // Cleanup scroll timers on unmount
  useEffect(() => {
    return () => {
      if (userInteractionTimerRef.current) {
        clearTimeout(userInteractionTimerRef.current);
      }
    };
  }, []);

  // Handle manual interaction resumption
  const startResumeTimer = () => {
    if (userInteractionTimerRef.current) {
      clearTimeout(userInteractionTimerRef.current);
    }
    userInteractionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
      // Force scroll to current lyric position when resuming auto-scroll
      if (currentIndex >= 0 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: currentIndex * LINE_HEIGHT,
          animated: true,
        });
      }
    }, 3000); // 3 seconds timeout
  };

  const handleScrollBeginDrag = () => {
    setIsUserInteracting(true);
    if (userInteractionTimerRef.current) {
      clearTimeout(userInteractionTimerRef.current);
      userInteractionTimerRef.current = null;
    }
  };

  const handleScrollEndDrag = (e: any) => {
    const velocityY = e.nativeEvent.velocity?.y ?? 0;
    if (velocityY === 0) {
      startResumeTimer();
    }
  };

  const handleMomentumScrollEnd = () => {
    startResumeTimer();
  };

  const handleLyricLinePress = async (millisecond: number) => {
    if (millisecond >= 0) {
      // Seek to selected time (in seconds)
      await TrackPlayer.seek(millisecond / 1000);
      // Temporarily disable auto scroll block so we scroll to this line immediately
      setIsUserInteracting(false);
    }
  };

  // Centering spacers
  const spacerHeight = lyricsHeight / 2 - LINE_HEIGHT / 2;

  const togglePlay = useCallback(async () => {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }, [isPlaying]);
  return (
    <View className="flex-1 justify-between">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-5 pb-4">
        <TouchableOpacity onPress={() => minimizeLyrics()} className="p-1">
          <Statminus height={24} width={24} />
        </TouchableOpacity>
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-white text-xl font-sans-bold" numberOfLines={1}>
            {trackTitle || "Unknown Track"}
          </Text>
          <Text
            className="text-neutral-400 text-sm font-sans-regular mt-0.5"
            numberOfLines={1}
          >
            {artistCandidates[0] || "Unknown Artist"}
          </Text>
        </View>
      </View>

      {/* Lyrics */}
      <View className="flex-1 px-6 ">
        {loadingLyrics ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-neutral-400 font-sans-medium mt-4">
              Loading lyrics...
            </Text>
          </View>
        ) : lyricsNotFound ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-neutral-400 font-sans-medium text-lg">
              Lyrics not found
            </Text>
          </View>
        ) : parsedLyrics.length > 0 ? (
          <BottomSheetScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={{ height: lyricsHeight }}
          >
            {/* Top centering spacer only if lyrics are synced */}
            {parsedLyrics[0].millisecond >= 0 && (
              <View style={{ height: spacerHeight }} />
            )}

            {parsedLyrics.map((line: any, index: number) => {
              const isActive = index === currentIndex;
              const hasTimestamp = line.millisecond >= 0;

              return (
                <TouchableOpacity
                  key={line.id}
                  activeOpacity={hasTimestamp ? 0.7 : 1}
                  onPress={() => handleLyricLinePress(line.millisecond)}
                  style={{
                    height: LINE_HEIGHT,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: isActive ? 24 : 20,
                      fontFamily: isActive ? "sans-bold" : "sans-medium",
                      textAlign: "left",
                      lineHeight: isActive ? 34 : 28,
                      opacity: isActive ? 1.0 : 0.45,
                    }}
                  >
                    {line.content || "• • •"}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Bottom centering spacer only if lyrics are synced */}
            {parsedLyrics[0].millisecond >= 0 && (
              <View style={{ height: spacerHeight }} />
            )}
          </BottomSheetScrollView>
        ) : null}
      </View>

      {/* Bottom Controls Area */}
      <View className="h-40 px-6 pt-2 mb-5 border-t border-white/10">
        <ProgressSection />

        {/* <PlayerControls /> */}
        <Pressable
          style={styles.playButton}
          onPress={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="white"
              style={{ width: 70, height: 70 }}
            />
          ) : isPlaying ? (
            <PauseIcon width={70} height={70} fill="white" />
          ) : (
            <PlayIcon width={70} height={70} fill="white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginVertical: 20,
  },
  playButton: {
    // width: 75,
    // height: 75,
    // borderRadius: 38,
    // backgroundColor: "white",
    // borderWidth: 2,
    // borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
