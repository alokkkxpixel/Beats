import { useOAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";

// Required: complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession();

interface GitHubSignInButtonProps {
  onSignInComplete?: () => void;
  showDivider?: boolean;
}

export function GitHubSignInButton({
  onSignInComplete,
  showDivider = false,
}: GitHubSignInButtonProps) {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_github" });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // Only render on iOS and Android
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return null;
  }

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true);
      // console.log("[GitHub Auth] Starting OAuth flow...");
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", { scheme: "beats" }),
      });
      // console.log(
      //   "[GitHub Auth] Flow result — createdSessionId:",
      //   createdSessionId,
      // );

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // console.log("[GitHub Auth] Session activated...");
        ToastAndroid.show("Signed in successfully!", ToastAndroid.SHORT);

        if (onSignInComplete) {
          onSignInComplete();
        }
      } else {
        console.warn("[GitHub Auth] No createdSessionId returned");
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === "SIGN_IN_CANCELLED" || err.code === "-5") {
        // console.log("[GitHub Auth] Cancelled by user");
        return;
      }

      console.error("[GitHub Auth] Error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err.message || "An error occurred during GitHub sign-in",
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.githubButton, isLoading && { opacity: 0.8 }]}
        onPress={handleGitHubSignIn}
        // className="rounded-md px-5 py-5"
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons
              name="logo-github"
              size={24}
              color="white"
              className="mr-3"
            />
            <Text style={styles.githubButtonText}>Continue with Github</Text>
          </>
        )}
      </TouchableOpacity>

      {showDivider && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  githubButton: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },
  githubButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "sans-bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
});
