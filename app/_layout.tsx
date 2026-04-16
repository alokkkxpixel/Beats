import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "@expo-google-fonts/inter";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/Inter-Regular.ttf"),
    "sans-bold": require("../assets/fonts/Inter-Bold.ttf"),
    "sans-medium": require("../assets/fonts/Inter-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/Inter-Bold.ttf"),
    "sans-thin": require("../assets/fonts/Inter-Thin.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#050505",
      card: "#050505",
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050505" }}>
        <ThemeProvider
          value={colorScheme === "dark" ? customDarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: "#050505" },
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style="light" translucent={true} />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
