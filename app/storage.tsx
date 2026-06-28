import BackIcon from "@/assets/app-icons/chevron-left.svg";
import { calculateStorageUsage, formatBytes } from "@/src/lib/storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface StorageData {
  downloads: number;
  cache: number;
  other: number;
  total: number;
}

export default function StorageScreen() {
  const navigation = useNavigation();
  const [storageData, setStorageData] = useState<StorageData>({
    downloads: 0,
    cache: 0,
    other: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStorageData = async () => {
    setLoading(true);
    const data = await calculateStorageUsage();
    setStorageData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const TOTAL_STORAGE = 10 * 1024 * 1024 * 1024; // 10 GB
  const usedPercentage = Math.min((storageData.total / TOTAL_STORAGE) * 100, 100);

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
          <Text className="text-white text-xl font-sans-bold ml-4">Storage</Text>
        </View>

        <View className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-6 mb-6">
          <Text className="text-zinc-400 text-sm">Used Storage</Text>
          <Text className="text-white text-3xl font-sans-bold mt-2">
            {loading ? "..." : formatBytes(storageData.total)}
          </Text>
          <View className="w-full h-2 bg-zinc-700 rounded-full mt-4">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${usedPercentage}%` }}
            />
          </View>
          <Text className="text-zinc-400 text-sm mt-2">
            {usedPercentage.toFixed(1)}% of 10 GB used
          </Text>
        </View>

        <Text className="text-zinc-400 text-xs font-sans-bold uppercase mb-2">Breakdown</Text>
        <View className="border-b border-zinc-800 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base font-sans-medium">Downloaded Music</Text>
            <Text className="text-zinc-400 text-base">
              {loading ? "..." : formatBytes(storageData.downloads)}
            </Text>
          </View>
        </View>
        <View className="border-b border-zinc-800 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base font-sans-medium">Cache</Text>
            <Text className="text-zinc-400 text-base">
              {loading ? "..." : formatBytes(storageData.cache)}
            </Text>
          </View>
        </View>
        <View className="border-b border-zinc-800 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base font-sans-medium">Other</Text>
            <Text className="text-zinc-400 text-base">
              {loading ? "..." : formatBytes(storageData.other)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={loadStorageData}
          className="mt-6 rounded-xl border border-zinc-500 py-4"
        >
          <Text className="text-center text-lg font-sans-bold text-white">Refresh</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
