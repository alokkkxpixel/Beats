import BackIcon from "@/assets/app-icons/chevron-left.svg";
import ForwardArrow from "@/assets/app-icons/chevron-forward.svg";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4 pt-16">
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <BackIcon width={22} height={22} fill="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-sans-bold ml-4">Profile</Text>
        </View>

        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-xl font-sans-bold mt-4">User Name</Text>
          <Text className="text-zinc-400 text-base mt-1">user@email.com</Text>
        </View>

        <View className="mt-4">
          <Pressable className="flex-row items-center justify-between py-4 border-b border-zinc-800">
            <Text className="text-white text-base font-sans-medium">Edit Profile</Text>
            <ForwardArrow width={20} height={20} fill="#fff" />
          </Pressable>
          <Pressable className="flex-row items-center justify-between py-4 border-b border-zinc-800">
            <Text className="text-white text-base font-sans-medium">Change Email</Text>
            <ForwardArrow width={20} height={20} fill="#fff" />
          </Pressable>
          <Pressable className="flex-row items-center justify-between py-4 border-b border-zinc-800">
            <Text className="text-white text-base font-sans-medium">Change Password</Text>
            <ForwardArrow width={20} height={20} fill="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
