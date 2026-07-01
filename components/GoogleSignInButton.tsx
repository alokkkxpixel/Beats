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
    TouchableOpacity,
    View,
} from "react-native";

// Required: complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
  onSignInComplete?: () => void;
  showDivider?: boolean;
}

export function GoogleSignInButton({
  onSignInComplete,
  showDivider = true,
}: GoogleSignInButtonProps) {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // Only render on iOS and Android
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("[Google Auth] Starting OAuth flow...");
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", { scheme: "beats" }),
      });
      console.log(
        "[Google Auth] Flow result — createdSessionId:",
        createdSessionId,
      );

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        console.log("[Google Auth] Session activated...");

        if (onSignInComplete) {
          onSignInComplete();
        }
      } else {
        console.warn("[Google Auth] No createdSessionId returned");
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === "SIGN_IN_CANCELLED" || err.code === "-5") {
        console.log("[Google Auth] Cancelled by user");
        return;
      }

      console.error("[Google Auth] Error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err.message || "An error occurred during Google sign-in",
      );
    }
  };

  return (
    <>
      {showDivider && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.googleButton, isLoading && { opacity: 0.8 }]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons
              name="logo-google"
              size={28}
              color="white"
              className="mr-3"
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  googleButton: {
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
  googleButtonText: {
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
