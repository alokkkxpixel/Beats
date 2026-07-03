import AppLogo from "@/assets/icons/appLogo.svg";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Top 50% Background Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/OnBoarding.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(5, 5, 5, 0.4)", "#050505"]}
          style={styles.gradient}
        />
      </View>

      {/* Bottom 50% Content */}
      <View style={styles.contentContainer}>
        <AppLogo width={48} height={48} fill="#ffffff" />
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>Beats</Text>
          <Text style={styles.headline}>
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
    height: height * 0.52,
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
    paddingBottom: 80,
    paddingTop: 10,
    alignItems: "center",
    // marginBottom: 50,
  },
  headerContainer: {
    alignItems: "center",
    // marginTop: 10,
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
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "sans-extrabold",
    lineHeight: 36,
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 10,
  },
});
