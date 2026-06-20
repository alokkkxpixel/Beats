import ForwardArrow from "@/assets/app-icons/chevron-forward.svg";
import BackIcon from "@/assets/app-icons/chevron-left.svg";

import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const settingsItems = [
    {
      label: "Audio Quality",
      onPress: () => {
        router.push("/audio-quality");
      },
    },
    {
      label: "Music Language",
      onPress: () => {
        router.push("/music-lang-change");
      },
    },
    {
      label: "About",
      onPress: () => {
        router.push("/about");
      },
    },
  ];

  return (
    <View className="flex-1 bg-black pt-16 px-4">
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

      {/* Options */}
      <View className="mt-4">
        {settingsItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={item.onPress}
            className="flex-row items-center justify-between py-4 border-b border-zinc-800"
          >
            <Text className="text-white text-base font-sans-medium">
              {item.label}
            </Text>
            <ForwardArrow width={20} height={20} fill="#fff" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
