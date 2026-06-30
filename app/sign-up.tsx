import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useClerk, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!signUp) return;
    setLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      }) as { error: { message?: string } | null; createdSessionId?: string };

      if (result.error) {
        setError(result.error.message || "Sign up failed. Please try again.");
      } else if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(drawer)/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-sans-bold ml-4">Sign Up</Text>
      </View>

      {/* Form */}
      <View className="space-y-4">
        <View>
          <Text className="text-zinc-400 text-sm mb-2">Email</Text>
          <TextInput
            className="bg-zinc-900 text-white rounded-lg px-4 py-3 border border-zinc-800"
            placeholder="Enter your email"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-zinc-400 text-sm mb-2">Password</Text>
          <TextInput
            className="bg-zinc-900 text-white rounded-lg px-4 py-3 border border-zinc-800"
            placeholder="Create a password"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text className="text-red-500 text-sm">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSignUp}
          disabled={loading}
          className="bg-white py-3 rounded-full items-center mt-4"
        >
          <Text className="text-black font-sans-bold">{loading ? "Signing up..." : "Sign Up"}</Text>
        </Pressable>

        <GoogleSignInButton />
        <GitHubSignInButton />

        <Pressable
          onPress={() => router.push("/sign-in")}
          className="items-center mt-4"
        >
          <Text className="text-zinc-400">
            Already have an account?{" "}
            <Text className="text-white font-sans-medium">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
