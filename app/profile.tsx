import ForwardArrow from "@/assets/app-icons/chevron-forward.svg";
import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useClerk } from "@clerk/expo";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, isSignedIn } = useAuthStore();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const displayName =
    isSignedIn && user?.fullName ? user.fullName : "Guest User";
  const displayEmail =
    isSignedIn && user?.emailAddress ? user.emailAddress : "guest@beats.app";
  const avatarUri = isSignedIn && user?.imageUrl ? user.imageUrl : null;

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
          <Text className="text-white text-xl font-sans-bold ml-4">
            Profile
          </Text>
        </View>

        {/* Avatar + Name */}
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center overflow-hidden">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 96, height: 96 }}
                contentFit="cover"
              />
            ) : (
              <Text className="text-4xl">👤</Text>
            )}
          </View>
          <Text className="text-white text-xl font-sans-bold mt-4">
            {displayName}
          </Text>
          <Text className="text-zinc-400 text-base mt-1">{displayEmail}</Text>
          {isSignedIn && user?.provider && (
            <View className="mt-2 px-3 py-1 rounded-full bg-zinc-800">
              <Text className="text-zinc-400 text-xs font-sans-medium capitalize">
                Signed in via {user.provider}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="mt-4">
          {isSignedIn && (
            <>
              <Pressable
                onPress={handleSignOut}
                className="flex-row items-center justify-between py-4 border-b border-zinc-800"
              >
                <Text className="text-red-500 text-base font-sans-medium">
                  Sign Out
                </Text>
                <ForwardArrow width={20} height={20} fill="#ef4444" />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
