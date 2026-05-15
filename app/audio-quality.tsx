import BackIcon from "@/assets/app-icons/chevron-left.svg";
import {
  AUDIO_QUALITY_OPTIONS,
  getAudioQualityLabel,
} from "@/src/lib/audioQuality";
import { getAudioQualityPreference } from "@/src/lib/storage";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
export default function AudioQualityScreen() {
  const [selected, setSelected] = useState(getAudioQualityPreference());
  const router = useRouter();
  const navigation = useNavigation();
  const audioQuality = usePlayerStore((state) => state.audioQuality);
  const setAudioQuality = usePlayerStore((state) => state.setAudioQuality);

  useEffect(() => {
    setSelected(audioQuality);
  }, [audioQuality]);

  const handleDone = async () => {
    await setAudioQuality(selected);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/setting");
    }
  };

  return (
    <View className="flex-1 bg-black px-4 pt-20">
      <View className="bg-black px-4 pb-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <BackIcon width={22} height={22} fill="#fff" />
          </Pressable>

          <Text className="text-white text-xl font-bold ml-4">
            Audio quality
          </Text>
        </View>

        <Text className="text-zinc-400 text-center mt-4 px-6">
          Pick your preferred streaming quality.
        </Text>
      </View>

      <View className="mt-6 gap-3">
        {AUDIO_QUALITY_OPTIONS.map((option) => {
          const isSelected = selected === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => setSelected(option.id)}
              className={`rounded-2xl border px-4 py-4 ${
                isSelected
                  ? "border-green-500 bg-green-500/15"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className={`text-base font-semibold ${
                      isSelected ? "text-green-400" : "text-white"
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text className="mt-1 text-sm text-zinc-400">
                    {option.description}
                  </Text>
                </View>

                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-green-400" : "text-zinc-400"
                  }`}
                >
                  {option.targetQuality}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4">
        <Text className="text-sm text-zinc-400">Current selection</Text>
        <Text className="mt-1 text-lg font-semibold text-white">
          {getAudioQualityLabel(selected)}
        </Text>
      </View>

      <Pressable
        onPress={handleDone}
        className="absolute bottom-10 left-4 right-4 rounded-xl bg-green-500 py-4"
      >
        <Text className="text-center text-lg font-bold text-black">Done</Text>
      </Pressable>
    </View>
  );
}
