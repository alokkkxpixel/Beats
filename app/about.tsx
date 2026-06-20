import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Linking, Pressable, Text, View } from "react-native";

export default function AboutScreen() {
  const navigation = useNavigation();
  const appName = Constants.expoConfig?.name || "Beats";
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <View className="flex-1 bg-black pt-16 px-4">
      <View className="flex-row items-center mb-10">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-sans-bold ml-4">About</Text>
      </View>

      <View className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-6">
        <Text className="text-zinc-400 text-sm">App</Text>
        <Text className="text-white text-2xl font-sans-bold mt-1">
          {appName}
        </Text>

        <Text className="text-zinc-400 text-sm mt-6">Version</Text>
        <Text className="text-white text-base mt-1">
          {"beta " + appVersion}
        </Text>

        <Text className="text-zinc-400 text-sm mt-6">Developer</Text>
        <Pressable
          onPress={() => Linking.openURL("https://github.com/alokkkxpixel")}
        >
          <Text className="text-white text-base mt-1 underline">
            alokkkxpixel
          </Text>
        </Pressable>

        <Text className="text-zinc-400 text-sm mt-6">More updates</Text>
        <Pressable
          onPress={() =>
            Linking.openURL("https://github.com/alokkkxpixel/Beats/")
          }
        >
          <Text className="text-white text-base mt-1 underline">
            Check on Github
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
