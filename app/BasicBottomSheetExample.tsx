import React from "react";
import { Pressable, Text, View } from "react-native";

const BasicBottomSheetExample = ({ sheetRef }: any) => {
  return (
    <>
      <View className="min-h-[100vh]">
        <Pressable onPress={() => sheetRef.current?.close()}>
          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
            Music Player
          </Text>
        </Pressable>
        <Text style={{ color: "#aaa", fontSize: 18, marginTop: 4 }}>
          Now Playing Content...
        </Text>
      </View>
      <View className="min-h-[90vh] bg-red-300">
        <Text>Hello</Text>
      </View>
    </>
  );
};

export default BasicBottomSheetExample;
