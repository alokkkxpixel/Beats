import ForwardArrow from "@/assets/app-icons/chevron-forward.svg";
import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { getAudioQualityLabel } from "@/src/lib/audioQuality";
import {
  calculateStorageUsage,
  clearAllCache,
  clearRecentActivity,
  clearSearchHistory,
  formatBytes,
  getAudioQualityPreference,
  getMusicLanguages,
} from "@/src/lib/storage";
import { useAuth, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, ToastAndroid, View } from "react-native";
export default function SettingsScreen() {
  const router = useRouter();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [audioQuality, setAudioQuality] = useState<string>(getAudioQualityLabel(getAudioQualityPreference()));
  const [storageUsed, setStorageUsed] = useState<string>("0 B");
  const [musicLanguages, setMusicLanguages] = useState<string>("");
  const appVersion = Constants.expoConfig?.version || "2.0.0";
  const loadStorageData = async () => {
    const data = await calculateStorageUsage();
    setStorageUsed(formatBytes(data.total));
  };

  useEffect(() => {
    loadStorageData();
    const langs = getMusicLanguages();
    const formattedLangs = langs.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1)).join(", ");
    // Truncate if too long to avoid UI break
    setMusicLanguages(formattedLangs.length > 20 ? formattedLangs.substring(0, 20) + "..." : formattedLangs);
  }, []);

  const SettingItem = ({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-zinc-800"
    >
      <Text className="text-white text-base font-sans-medium">{label}</Text>
      <View className="flex-row items-center">
        {value && <Text className="text-zinc-400 text-base mr-2">{value}</Text>}
        <ForwardArrow width={20} height={20} fill="#fff" />
      </View>
    </Pressable>
  );

  const ToggleItem = ({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-zinc-800"
    >
      <Text className="text-white text-base font-sans-medium">{label}</Text>
      <Text className="text-zinc-400 text-base">{value}</Text>
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-zinc-400 text-xs font-sans-bold uppercase mt-6 mb-2">{title}</Text>
  );

  const CacheItem = ({ label, onPress }: { label: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3 border-b border-zinc-800 px-3"
    >
      <Text className="text-zinc-300 text-base font-sans-medium">{label}</Text>
      <Text className="text-red-500 text-sm px-2 py-1 rounded-xl border-zinc-600 border">Clear</Text>
    </Pressable>
  );

  return (
    <View className="flex-1 h-min-[100vh] bg-black">
      <ScrollView className="flex-1 px-4 pt-16">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <BackIcon width={22} height={22} fill="#fff" />
          </Pressable>

          <Text className="text-white text-xl font-sans-bold ml-4">Settings</Text>
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        {isSignedIn ? (
          <>
            <View className="border-b border-zinc-800 py-4">
              <Text className="text-white text-base font-sans-medium">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
              </Text>
              <Text className="text-zinc-400 text-sm mt-1">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>
            <Pressable
              onPress={() => signOut()}
              className="flex-row items-center justify-between py-4 border-b border-zinc-800"
            >
              <Text className="text-red-500 text-base font-sans-medium">Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => router.push("/sign-in")}
              className="flex-row items-center justify-between py-4 border-b border-zinc-800"
            >
              <Text className="text-white text-base font-sans-medium">Sign In</Text>
              <ForwardArrow width={20} height={20} fill="#fff" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/sign-up")}
              className="flex-row items-center justify-between py-4 border-b border-zinc-800"
            >
              <Text className="text-white text-base font-sans-medium">Sign Up</Text>
              <ForwardArrow width={20} height={20} fill="#fff" />
            </Pressable>
          </>
        )}


        {/* Playback Section */}
        <SectionHeader title="Playback" />
        <SettingItem label="Audio Quality" value={audioQuality} onPress={() => router.push("/audio-quality")} />
        <SettingItem label="Music Language" value={musicLanguages} onPress={() => router.push("/music-lang-change")} />
        {/* Downloads Section */}
        <SectionHeader title="Downloads" />

        <SettingItem label="Storage" value={storageUsed} onPress={() => router.push("/storage")} />
        <View className="border-b border-zinc-800">
          <Pressable className="flex-row items-center justify-between py-4">
            <Text className="text-white text-base font-sans-medium">Clear Cache</Text>
          </Pressable>
          <CacheItem label="Search cache" onPress={() => {
            clearSearchHistory();
            ToastAndroid.show("Search cache cleared", ToastAndroid.SHORT);
            loadStorageData();
          }} />
          <CacheItem label="History cache" onPress={() => {
            clearRecentActivity();
            ToastAndroid.show("History cache cleared", ToastAndroid.SHORT);
            loadStorageData();
          }} />
          <CacheItem label="All cache" onPress={() => {
            clearAllCache();
            ToastAndroid.show("All cache cleared", ToastAndroid.SHORT);
            loadStorageData();
          }} />
        </View>


        {/* About Section */}
        <SectionHeader title="About" />
        <View className="flex-row items-center justify-between py-4 border-b border-zinc-800">
          <Text className="text-white text-base font-sans-medium">Version</Text>
          <Text className="text-zinc-400 text-base">{appVersion}</Text>
        </View>
        <SettingItem label="Check for updates" onPress={() => Linking.openURL("https://github.com/alokkkxpixel/Beats")} />
        <SettingItem label="About" onPress={() => router.push("/about")} />

        {/* Logout Button */}
        {/* <View className="my-8 flex-row justify-center pb-20">
          <Pressable
            onPress={() => router.push("/logout")}
            className="bg-white py-3 px-1 w-1/2 justify-center rounded-full items-center"
          >
            <Text className="text-black text-sm font-sans-bold">LOG OUT</Text>
          </Pressable>
        </View> */}
      </ScrollView>
    </View>
  );
}
