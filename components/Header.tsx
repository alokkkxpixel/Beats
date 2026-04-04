import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Header(): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between px-[26px] py-2 bg-black">
      <Text className="text-white font-bold text-2xl">Beats</Text>

      <View className="flex-row items-center gap-8">
        <Pressable
          onPress={() => {
            console.log("press icon");
          }}
        >
          <Ionicons
            name="search"
            size={20}
            className="font-light"
            color="white"
          />
        </Pressable>
        <Pressable
          onPress={() => {
            console.log("press image");
          }}
        >
          <View className="w-[32px] h-[32px] rounded-full overflow-hidden border border-white/20 shadow-sm">
            <Image
              source={{
                uri: "https://avatars.githubusercontent.com/u/132479455?v=4",
              }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
