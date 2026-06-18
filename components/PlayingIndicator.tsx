import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export default function PlayingIndicator() {
  const h1 = useSharedValue(8);
  const h2 = useSharedValue(16);
  const h3 = useSharedValue(12);

  useEffect(() => {
    h1.value = withRepeat(
      withSequence(
        withTiming(16, { duration: 700 }),
        withTiming(5, { duration: 700 }),
      ),
      -1,
      true,
    );

    h2.value = withRepeat(
      withSequence(
        withTiming(22, { duration: 900 }),
        withTiming(8, { duration: 900 }),
      ),
      -1,
      true,
    );

    h3.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 800 }),
        withTiming(4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    height: h1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    height: h2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    height: h3.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, animatedStyle1]} />
      <Animated.View style={[styles.bar, animatedStyle2]} />
      <Animated.View style={[styles.bar, animatedStyle3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
});
