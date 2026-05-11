import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { Compass, Home, Library } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 55 + insets.bottom;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,

        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom - 2, 2),
          backgroundColor: "#000000ff",
          borderTopColor: "rgba(255,255,255,0.06)",
          position: "absolute",
          zIndex: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <Library size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="album-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="playlist-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="category-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="artist/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="artist-catalog"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search-results"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
