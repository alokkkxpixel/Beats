import Header from "@/components/Header";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <SafeAreaView>
      <View>
        <Header />
      </View>
    </SafeAreaView>
  );
};

export default index;
