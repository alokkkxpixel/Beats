import AppLogo from "@/assets/icons/appLogo.svg";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function OnboardingScreen() {
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Top 50% Background Image */}
      <View
        style={[
          styles.imageContainer,
          { height: height * (isShortScreen ? 0.45 : 0.52) },
        ]}
      >
        <Image
          // src="https://www.genspark.ai/api/files/s/y6vTheuZ?cache_control=3600"
          source={require("../assets/images/musc.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(5, 5, 5, 0.4)", "#050505"]}
          style={styles.gradient}
        />
      </View>

      {/* Bottom 50% Content */}
      <View
        style={[
          styles.contentContainer,
          { paddingBottom: isShortScreen ? 35 : 80 },
        ]}
      >
        <AppLogo
          width={isShortScreen ? 36 : 48}
          height={isShortScreen ? 36 : 48}
          fill="#ffffff"
        />
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.logoText,
              isShortScreen && { fontSize: 26, marginBottom: 8 },
            ]}
          >
            Beats
          </Text>
          <Text
            style={[
              styles.headline,
              isShortScreen && { fontSize: 22, lineHeight: 28 },
            ]}
          >
            Millions of Songs.{"\n"}Free for Everyone.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GoogleSignInButton showDivider={false} />
          <View style={{ height: 10 }} />
          <GitHubSignInButton showDivider={false} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 10,
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffff",
    fontFamily: "sans-bold",
    letterSpacing: -1,
    marginBottom: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "sans-semibold",
    lineHeight: 36,
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 10,
  },
});
