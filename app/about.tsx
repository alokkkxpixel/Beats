import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
export default function AboutScreen() {
  const navigation = useNavigation();
  const appName = Constants.expoConfig?.name || "Beats";
  const appVersion = Constants.expoConfig?.version || "2.0.0";
  const packageName = Constants.expoConfig?.android?.package || "com.beats.app";
  const { height, width } = useWindowDimensions();
  const isShortScreen = height < 700;

  const SocialIcon = ({
    icon,
    title,
    url,
  }: {
    icon: string;
    title: string;
    url: string;
  }) => (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className={`flex-row items-center justify-between px-4 rounded-xl bg-zinc-800/50 ${
        isShortScreen ? "py-2 mb-1.5" : "py-3 mb-2"
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={icon as any}
          size={isShortScreen ? 20 : 22}
          color="white"
          className="mr-3"
        />
        <Text
          className={`text-white font-sans-medium ${isShortScreen ? "text-sm" : "text-base"}`}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name="link"
        size={isShortScreen ? 18 : 22}
        color="#6b7280"
        className="mr-3"
      />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-black">
      <View className={`flex-1 px-4 ${isShortScreen ? "pt-10" : "pt-16"}`}>
        <View
          className={`flex-row items-center ${isShortScreen ? "mb-4" : "mb-8"}`}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <BackIcon width={22} height={22} fill="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-sans-bold ml-4">About</Text>
        </View>

        <FlatList
          className="flex-1 px-4 "
          contentContainerStyle={{ paddingBottom: 40 }}
          data={[{ id: "about" }]}
          style={{ marginBottom: 0 }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <>
              <View
                className={`items-center ${isShortScreen ? "py-5" : "py-10"}`}
              >
                <View
                  className={`rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 items-center justify-center ${
                    isShortScreen ? "w-16 h-16 mb-4" : "w-20 h-20 mb-6"
                  }`}
                >
                  <Image
                    source={require("@/assets/icons/appIcon.png")}
                    style={{
                      width: isShortScreen ? 40 : 50,
                      height: isShortScreen ? 40 : 50,
                    }}
                  />
                </View>
                <Text
                  className={`text-white font-sans-bold tracking-tight ${
                    isShortScreen ? "text-2xl" : "text-3xl"
                  }`}
                >
                  Beats
                </Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Free music for everyone.
                </Text>
              </View>

              <View
                className={`space-y-4 px-4 ${isShortScreen ? "mt-2" : "mt-4"}`}
              >
                <View
                  className={`flex-row items-center justify-between border-b border-zinc-800/50 ${
                    isShortScreen ? "py-2" : "py-3"
                  }`}
                >
                  <Text className="text-white text-sm">Version</Text>
                  <Text className="text-zinc-300 text-base font-sans-medium">
                    {appVersion}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center justify-between border-b border-zinc-800/50 ${
                    isShortScreen ? "py-2" : "py-3"
                  }`}
                >
                  <Text className="text-white text-sm">Package</Text>
                  <Text className="text-zinc-300 text-sm font-sans-medium">
                    {packageName}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  Linking.openURL("https://github.com/alokkkxpixel/Beats")
                }
                className={`rounded-2xl w-1/2 self-center border border-zinc-800 bg-zinc-900/50 px-2 ${
                  isShortScreen ? "mt-4 py-2" : "mt-8 py-3"
                }`}
              >
                <Text className="text-white text-base font-sans-medium text-center">
                  Like this project?
                </Text>
                <Text className="text-zinc-400 text-sm text-center ">
                  Star it on GitHub ⭐
                </Text>
              </Pressable>

              <View
                className={`pt-6 ${isShortScreen ? "mt-3 mb-10" : "mt-5 mb-20"}`}
              >
                <Text className="text-zinc-200 text-sm font-sans-bold uppercase mb-1">
                  Credits
                </Text>
                <Text className="text-zinc-400 text-xs font-sans-regular uppercase mb-4">
                  Connect with me
                </Text>
                <SocialIcon
                  icon={"logo-x"}
                  title="Follow me on X (Twitter)"
                  url="https://x.com/AlokkxPithale_"
                />
                <SocialIcon
                  icon="logo-linkedin"
                  title="Connect on LinkedIn"
                  url="https://www.linkedin.com/in/alokk-pithale/"
                />
                <SocialIcon
                  icon="logo-instagram"
                  title="Follow me on Instagram"
                  url="https://instagram.com/alokkxx__"
                />
                <SocialIcon
                  icon="logo-github"
                  title="Follow me on GitHub"
                  url="https://github.com/alokkkxpixel/Beats"
                />
                <SocialIcon
                  icon="mail"
                  title="Email me"
                  url="mailto:alokpithale386@gmail.com"
                />
              </View>
            </>
          )}
        />
      </View>
    </View>
  );
}
