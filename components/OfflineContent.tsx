import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function OfflineContent() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#050505",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Ionicons
        name="cloud-offline-outline"
        size={isShortScreen ? 56 : 70}
        color="#a1a1aa"
        style={{ marginBottom: isShortScreen ? 12 : 20 }}
      />
      <Text
        style={{
          color: "#fff",
          fontSize: isShortScreen ? 14 : 16,
          textAlign: "center",
          marginBottom: isShortScreen ? 20 : 30,
          maxWidth: 280,
        }}
        className="font-sans-medium"
      >
        There is no network connection now
      </Text>

      <Pressable
        onPress={() => {
          router.push({
            pathname: "/album-detail",
            params: { albumId: "downloaded-songs" },
          });
        }}
        style={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: 300,
          paddingVertical: isShortScreen ? 11 : 14,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{ color: "#000", fontSize: isShortScreen ? 14 : 16 }}
          className="font-sans-bold"
        >
          Go to downloads
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Toast.show({
            type: "info",
            text1: "Checking connection...",
          });
        }}
        style={{
          backgroundColor: "#1c1c1e",
          width: "100%",
          maxWidth: 300,
          paddingVertical: isShortScreen ? 11 : 14,
          borderRadius: 25,
          alignItems: "center",
        }}
      >
        <Text
          style={{ color: "#fff", fontSize: isShortScreen ? 14 : 16 }}
          className="font-sans-bold"
        >
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
