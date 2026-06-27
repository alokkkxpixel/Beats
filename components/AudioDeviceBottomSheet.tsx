import { Check, Headphones } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  AudioDevices,
  TAudioDevice,
  TrackPlayer,
} from "react-native-nitro-player";
import { useShallow } from "zustand/shallow";

import SpeakerIcon from "@/assets/app-icons/speaker.svg";
import { usePlayerStore } from "@/src/store/usePlayerStore";

const getDeviceLabel = (device: TAudioDevice) => {
  if (!device.name?.trim()) {
    return `Device ${device.id}`;
  }

  return device.name;
};

export default function AudioDeviceBottomSheet() {
  const { isAudioDeviceOpen, minizeAudioDevice } = usePlayerStore(
    useShallow((state) => ({
      isAudioDeviceOpen: state.isAudioDeviceOpen,
      minizeAudioDevice: state.minizeAudioDevice,
    })),
  );
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const [devices, setDevices] = useState<TAudioDevice[]>([]);
  const [isApplying, setIsApplying] = useState<number | null>(null);

  const refreshDevices = useCallback(() => {
    const availableDevices = AudioDevices?.getAudioDevices() ?? [];
    const uniqueDevices = Array.from(
      new Map(availableDevices.map((device) => [device.id, device])).values(),
    );
    setDevices(uniqueDevices);
  }, []);

  useEffect(() => {
    if (!isAudioDeviceOpen) return;

    refreshDevices();
    const interval = setInterval(refreshDevices, 1200);

    return () => clearInterval(interval);
  }, [isAudioDeviceOpen, refreshDevices]);

  const handleSelectDevice = useCallback(
    async (device: TAudioDevice) => {
      if (device.isActive) {
        minizeAudioDevice();
        return;
      }

      try {
        setIsApplying(device.id);
        await AudioDevices?.setAudioDevice(device.id);
        if (isPlaying) {
          await TrackPlayer.pause();
          await TrackPlayer.play();
        }
        refreshDevices();
        minizeAudioDevice();
      } finally {
        setIsApplying(null);
      }
    },
    [isPlaying, minizeAudioDevice, refreshDevices],
  );

  const activeDevice = devices.find((device) => device.isActive);

  if (!isAudioDeviceOpen) return null;

  return (
    <View className="flex-1 px-5 pt-2">
      <View className="flex-row items-center justify-between pb-4 border-b border-zinc-500">
        <View>
          <Text className="text-white text-lg font-sans-semibold">
            Audio output
          </Text>
          <Text className="text-zinc-400 text-sm font-sans-medium mt-1">
            {activeDevice?.name || "Speaker"}
          </Text>
        </View>
      </View>

      <View className="mt-2">
        {devices.length === 0 ? (
          <Text className="text-zinc-400 text-sm font-sans-medium py-4">
            No audio devices found
          </Text>
        ) : (
          devices.map((device) => {
            const isActive = device.isActive;
            const isLoading = isApplying === device.id;

            return (
              <Pressable
                key={device.id}
                onPress={() => handleSelectDevice(device)}
                className="flex-row items-center justify-between py-4"
              >
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
                    {device.type === 3 ? (
                      <Headphones
                        size={18}
                        color={isActive ? "#fff" : "#a3a3a3"}
                      />
                    ) : (
                      <SpeakerIcon
                        width={18}
                        height={18}
                        fill={isActive ? "#fff" : "#a3a3a3"}
                      />
                    )}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white font-sans-medium text-[15px]">
                      {getDeviceLabel(device)}
                    </Text>
                    <Text className="text-zinc-400 font-sans-regular text-xs mt-1">
                      {isActive ? "Currently active" : "Tap to switch"}
                    </Text>
                  </View>
                </View>

                <View className="w-8 items-end justify-center">
                  {isLoading ? (
                    <Text className="text-zinc-400 text-xs font-sans-medium">
                      ...
                    </Text>
                  ) : isActive ? (
                    <Check size={18} color="#fff" />
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}
