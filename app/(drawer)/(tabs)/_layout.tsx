import ExploreFill from "@/assets/app-icons/explore-fill.svg";
import ExploreUnfill from "@/assets/app-icons/explore-unfill.svg";
import HomeFill from "@/assets/app-icons/home-fill.svg";
import HomeUnfill from "@/assets/app-icons/home-unfill.svg";
import LibraryFill from "@/assets/app-icons/library-fill.svg";
import LibraryUnfill from "@/assets/app-icons/library-unfill.svg";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { Download } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

interface TabIconProps {
  IconFill: React.FC<SvgProps>;
  IconUnfill: React.FC<SvgProps>;
  focused: boolean;
  color: string;
}

const TabIcon = ({ IconFill, IconUnfill, focused, color }: TabIconProps) => {
  const Icon = focused ? IconFill : IconUnfill;
  return <Icon width={30} height={30} fill={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconFill={HomeFill}
              IconUnfill={HomeUnfill}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconFill={ExploreFill}
              IconUnfill={ExploreUnfill}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconFill={LibraryFill}
              IconUnfill={LibraryUnfill}
              focused={focused}
              color={color}
            />
          ),
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
      <Tabs.Screen
        name="local-playlist-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
