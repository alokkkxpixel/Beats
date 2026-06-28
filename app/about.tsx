import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
export default function AboutScreen() {
  const navigation = useNavigation();
  const appName = Constants.expoConfig?.name || "Beats";
  const appVersion = Constants.expoConfig?.version || "2.0.0";
  const packageName = Constants.expoConfig?.android?.package || "com.beats.app";

  const SocialIcon = ({ icon, title, url }: { icon: string; title: string; url: string }) => (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className="flex-row items-center justify-between py-3 px-4 mb-2 rounded-xl bg-zinc-800/50"
    >
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={22} color="white" className="mr-3" />
        <Text className="text-white text-base font-sans-medium">{title}</Text>
      </View>
      <Ionicons name="link" size={22} color="#6b7280" className="mr-3" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4 pt-16" contentContainerStyle={{ paddingBottom: 50 }}>
        <View className="flex-row items-center mb-8">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <BackIcon width={22} height={22} fill="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-sans-bold ml-4">About</Text>
        </View>

        <View className="items-center py-10">
          <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 items-center justify-center mb-6">
            <Image source={require("@/assets/logo-1024.png")} style={{ width: 50, height: 50 }} />
          </View>
          <Text className="text-white text-3xl font-sans-bold tracking-tight">Beats</Text>
          <Text className="text-gray-400 text-sm mt-2">Free music for everyone</Text>
        </View>

        <View className="space-y-4 mt-4 px-4">
          <View className="flex-row items-center justify-between py-3 border-b border-zinc-800/50">
            <Text className="text-white text-sm">Version</Text>
            <Text className="text-zinc-300 text-base font-sans-medium">{appVersion}</Text>
          </View>
          <View className="flex-row items-center justify-between py-3 border-b border-zinc-800/50">
            <Text className="text-white text-sm">Package</Text>
            <Text className="text-zinc-300 text-sm font-sans-medium">{packageName}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => Linking.openURL("https://github.com/alokkkxpixel/Beats")}
          className="mt-8 rounded-2xl w-1/2 self-center border border-zinc-800 bg-zinc-900/50 px-2 py-3"
        >
          <Text className="text-white text-base font-sans-medium text-center">
            Like this project?
          </Text>
          <Text className="text-zinc-400 text-sm text-center ">
            Star it on GitHub ⭐
          </Text>
        </Pressable>

        <View className="mt-5 mb-20  pt-6">
          <Text className="text-zinc-200 text-sm font-sans-bold uppercase mb-1">Credits</Text>
          <Text className="text-zinc-400 text-xs font-sans-regular uppercase mb-4">Connect with me</Text>
          <SocialIcon icon={"logo-x"} title="X (Twitter)" url="https://x.com/AlokkxPithale_" />
          <SocialIcon icon="logo-linkedin" title="LinkedIn" url="https://www.linkedin.com/in/alokk-pithale/" />
          <SocialIcon icon="logo-instagram" title="Instagram" url="https://instagram.com/alokkxx__" />
          <SocialIcon icon="logo-github" title="GitHub" url="https://github.com/alokkkxpixel/Beats" />
          <SocialIcon icon="mail" title="Email" url="mailto:alokpithale386@gmail.com" />
        </View>
      </ScrollView>
    </View>
  );
}
