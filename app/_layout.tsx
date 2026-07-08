import { AuthSync } from "@/components/AuthSync";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { PlayerWrapper } from "@/components/PlayerWrapper";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSetupPlayer } from "@/hooks/useSetupPlayer";
import { configureDownloadManager } from "@/src/lib/downloadManager";
import { persister, queryClient } from "@/src/lib/query-client";
import { storage } from "@/src/lib/storage";
import { requestAppPermissions } from "@/src/lib/permissions";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "@expo-google-fonts/inter";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: "(drawer)",
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const netInfo = useNetInfo();
  const [hasRenderedChildren, setHasRenderedChildren] = React.useState(false);

  const isOffline =
    netInfo.isConnected === false ||
    (netInfo.isConnected !== null && netInfo.isInternetReachable === false);

  React.useEffect(() => {
    if (!isLoaded && !isOffline) return;

    const inAuthGroup = segments[0] === "onboarding";
    const inLangGroup = segments[0] === "music-lang-change";
    const hasCompletedOnboarding =
      storage.getBoolean("has-completed-onboarding") ?? false;
    const isUserSignedInCached =
      storage.getBoolean("is-user-signed-in") ?? false;

    // Treat user as signed in if they are offline (to bypass auth check and load the offline UI),
    // or if they are signed in via Clerk.
    const effectivelySignedIn = isSignedIn || isOffline;

    if (!effectivelySignedIn && !inAuthGroup) {
      router.replace("/onboarding");
    } else if (effectivelySignedIn) {
      if (!hasCompletedOnboarding && !inLangGroup) {
        router.replace("/music-lang-change");
      } else if (hasCompletedOnboarding && inAuthGroup) {
        router.replace("/(drawer)/(tabs)");
      }
    }
  }, [isSignedIn, isLoaded, segments, isOffline]);

  React.useEffect(() => {
    if (isLoaded || isOffline) {
      setHasRenderedChildren(true);
    }
  }, [isLoaded, isOffline]);

  React.useEffect(() => {
    const hasCompletedOnboarding =
      storage.getBoolean("has-completed-onboarding") ?? false;
    const hasPromptedPermissions =
      storage.getBoolean("has-prompted-permissions") ?? false;

    if (hasCompletedOnboarding && !hasPromptedPermissions) {
      requestAppPermissions()
        .then(() => {
          storage.set("has-prompted-permissions", true);
        })
        .catch((err) => {
          console.warn("Error triggering requestAppPermissions:", err);
        });
    }
  }, [segments]);

  if (hasRenderedChildren) {
    return <>{children}</>;
  }

  if (isOffline) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isPlayerReady = useSetupPlayer();

  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/Inter-Regular.ttf"),
    "sans-bold": require("../assets/fonts/Inter-Bold.ttf"),
    "sans-medium": require("../assets/fonts/Inter-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/Inter-Bold.ttf"),
    "sans-thin": require("../assets/fonts/Inter-Thin.ttf"),
    "sans-light": require("../assets/fonts/Inter-Light.ttf"),
  });

  console.log("Fonts loaded status:", fontsLoaded);

  React.useEffect(() => {
    if (fontsLoaded) {
      console.log("Hiding Splash Screen...");
      SplashScreen.hideAsync().catch((err) =>
        console.log("Splash Screen Error:", err),
      );
    }
  }, [fontsLoaded]);

  React.useEffect(() => {
    if (fontsLoaded) {
      configureDownloadManager();
    }
  }, [fontsLoaded]);

  // Ensure fonts are loaded before rendering to prevent broken layout/text
  if (!fontsLoaded) return null;

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#050505",
      card: "#050505",
    },
  };

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_ZXBpYy1zdHVyZ2Vvbi01Mi5jbGVyay5hY2NvdW50cy5kZXYk";

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthSync />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050505" }}>
          <ThemeProvider
            value={colorScheme === "dark" ? customDarkTheme : DefaultTheme}
          >
            <PlayerWrapper>
              <AuthGuard>
                {isPlayerReady && <GlobalAudioPlayer />}
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: "#050505" },
                    headerShown: false,
                  }}
                >
                  <Stack.Screen
                    name="(drawer)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="audio-quality" />
                  <Stack.Screen name="about" />
                  <Stack.Screen name="music-lang-change" />
                  <Stack.Screen name="setting" />
                  <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </AuthGuard>
            </PlayerWrapper>

            <StatusBar style="light" translucent={true} />
            <Toast />
          </ThemeProvider>
        </GestureHandlerRootView>
      </PersistQueryClientProvider>
    </ClerkProvider>
  );
}
