import BackIcon from "@/assets/app-icons/chevron-left.svg";
import {
  AUDIO_QUALITY_OPTIONS,
} from "@/src/lib/audioQuality";
import { getAudioQualityPreference } from "@/src/lib/storage";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AudioQualityScreen() {
  const [selected, setSelected] = useState(getAudioQualityPreference());
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;

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
    <View
      className="flex-1 bg-black px-5"
      style={{ paddingTop: isShortScreen ? 45 : insets.top + 20 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800"
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </Pressable>

        <Text className="text-white text-xl font-sans-bold ml-4">
          Audio quality
        </Text>
      </View>

      <Text className="text-zinc-500 text-sm mb-6">
        Select your preferred streaming audio quality. Higher quality uses more mobile data.
      </Text>

      {/* Quality Options List */}
      <View className="gap-1">
        {AUDIO_QUALITY_OPTIONS.map((option) => {
          const isSelected = selected === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => setSelected(option.id)}
              className={`flex-row items-center justify-between rounded-xl px-4 py-3.5 mb-2 bg-zinc-900/40 border ${
                isSelected ? "border-zinc-700 bg-zinc-900/80" : "border-transparent"
              }`}
            >
              <View className="flex-row items-center flex-1 mr-4">
                {/* Radio Button */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? "#fff" : "#52525b",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#fff",
                      }}
                    />
                  )}
                </View>

                {/* Text Info */}
                <View className="flex-1">
                  <Text className="text-white text-base font-sans-medium">
                    {option.label}
                  </Text>
                  <Text className="text-zinc-500 text-xs mt-0.5 font-sans-light">
                    {option.description}
                  </Text>
                </View>
              </View>

              {/* Bitrate info on right */}
              <Text className="text-zinc-400 text-sm font-sans-medium">
                {option.targetQuality}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Done Button */}
      <View
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 20),
          left: 20,
          right: 20,
        }}
      >
        <Pressable
          onPress={handleDone}
          className="w-full bg-white rounded-full py-3.5 items-center justify-center active:bg-zinc-200"
        >
          <Text className="text-black text-base font-sans-bold">
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
