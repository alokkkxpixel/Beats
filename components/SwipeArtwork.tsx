import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPACING = 60;

interface SwipeArtworkProps {
  currentImage: string | number;
  previousImage?: string | number;
  nextImage?: string | number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function SwipeArtwork({
  currentImage,
  previousImage,
  nextImage,
  onNext,
  onPrevious,
}: SwipeArtworkProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const isShortScreen = SCREEN_HEIGHT < 700;
  const artworkSize = Math.min(SCREEN_WIDTH * 0.82, isShortScreen ? SCREEN_HEIGHT * 0.32 : SCREEN_HEIGHT * 0.42);

  const translateX = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isAnimating.value) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (isAnimating.value) return;

      const THRESHOLD = 150;

      if (e.translationX < -THRESHOLD && nextImage) {
        // Swipe left - go to next
        isAnimating.value = true;
        currentIndex.value = 1;
        
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: 300, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(onNext)();
              translateX.value = SCREEN_WIDTH;
              currentIndex.value = -1;
              
              translateX.value = withTiming(
                0,
                { duration: 300, easing: Easing.out(Easing.cubic) },
                () => {
                  isAnimating.value = false;
                  currentIndex.value = 0;
                }
              );
            }
          }
        );
      } else if (e.translationX > THRESHOLD && previousImage) {
        // Swipe right - go to previous
        isAnimating.value = true;
        currentIndex.value = -1;
        
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: 300, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(onPrevious)();
              translateX.value = -SCREEN_WIDTH;
              currentIndex.value = 1;
              
              translateX.value = withTiming(
                0,
                { duration: 300, easing: Easing.out(Easing.cubic) },
                () => {
                  isAnimating.value = false;
                  currentIndex.value = 0;
                }
              );
            }
          }
        );
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const previousStyle = useAnimatedStyle(() => {
    const baseOffset = -artworkSize - SPACING;
    return {
      transform: [
        {
          translateX: baseOffset + translateX.value,
        },
      ],
      opacity: withTiming(currentIndex.value === 0 ? 0.3 : 1, { duration: 200 }),
      scale: withTiming(currentIndex.value === 0 ? 0.85 : 1, { duration: 200 }),
    };
  });

  const currentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
      opacity: withTiming(currentIndex.value === 0 ? 1 : 0, { duration: 200 }),
      scale: withTiming(currentIndex.value === 0 ? 1 : 0.85, { duration: 200 }),
    };
  });

  const nextStyle = useAnimatedStyle(() => {
    const baseOffset = artworkSize + SPACING;
    return {
      transform: [
        {
          translateX: baseOffset + translateX.value,
        },
      ],
      opacity: withTiming(currentIndex.value === 0 ? 0.3 : 1, { duration: 200 }),
      scale: withTiming(currentIndex.value === 0 ? 0.85 : 1, { duration: 200 }),
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { width: artworkSize, height: artworkSize }]}>
        {/* <Animated.View style={[styles.artwork, previousStyle]}>
          {previousImage && (
            <Image
              source={typeof previousImage === 'number' ? previousImage : { uri: previousImage }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </Animated.View> */}

        <Animated.View style={[styles.artwork, { width: artworkSize, height: artworkSize }, currentStyle]}>
          <Image
            source={typeof currentImage === 'number' ? currentImage : { uri: currentImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.artwork, { width: artworkSize, height: artworkSize }, nextStyle]}>
          {nextImage && (
            <Image
              source={typeof nextImage === 'number' ? nextImage : { uri: nextImage }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  artwork: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
