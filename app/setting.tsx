import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MoveLeft, ChevronRight, LogOut } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const settingsItems = [
    {
      label: "Audio Quality",
      onPress: () => {
        // router.push("/audio-quality");
      },
    },
    {
      label: "Music Language",
      onPress: () => {
        router.push("/music-lang-change");
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
          <MoveLeft size={22} color="#fff" />
        </Pressable>

        <Text className="text-white text-xl font-bold ml-4">
          Settings
        </Text>
      </View>

      {/* Options */}
      <View className="mt-4">
        {settingsItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={item.onPress}
            className="flex-row items-center justify-between py-4 border-b border-zinc-800"
          >
            <Text className="text-white text-base">{item.label}</Text>
            <ChevronRight size={20} color="#aaa" />
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <Pressable
        onPress={() => {
          console.log("Logout pressed");
        }}
        className="mt-10 flex-row items-center gap-3"
      >
        <LogOut size={20} color="red" />
        <Text className="text-red-500 text-base font-semibold">
          Log Out
        </Text>
      </Pressable>
    </View>
  );
}