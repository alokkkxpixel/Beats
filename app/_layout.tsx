import SidebarDrawer from "@/app/SidebarDrawer";
import PlayerWrapper from "@/components/PlayerWrapper";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "@expo-google-fonts/inter";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    },
  },
});

// const asyncStoragePersister = createAsyncStoragePersister({
//   storage: AsyncStorage,
//   key: "BEATS_OFFLINE_CACHE",
// });

export const unstable_settings = {
  anchor: "(drawer)",
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
    "sans-light": require("../assets/fonts/Inter-Light.ttf"),
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

    <QueryClientProvider

      client={queryClient}
     
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050505" }}>
        <ThemeProvider
          value={colorScheme === "dark" ? customDarkTheme : DefaultTheme}
        >
          <PlayerWrapper>
            <Stack
              screenOptions={{ 
                contentStyle: { backgroundColor: "#050505" },
                headerShown: false,
              }}
            >
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen name="music-lang-change" />
              <Stack.Screen name="setting" />
            </Stack>
          </PlayerWrapper>

          <StatusBar style="light" translucent={true} />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
