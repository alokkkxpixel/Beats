import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { speedDialItems } from "./data";

export default function SpeedDialSection(): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>YOUR FAVORITES</Text>
      <View style={styles.header}>
        <Text style={styles.title}>Speed dial</Text>
        <Ionicons name="chevron-forward" size={24} color="#D4D4D8" />
      </View>

      <FlashList
        data={speedDialItems}
        horizontal
        estimatedItemSize={96}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  eyebrow: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "sans-bold",
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  title: {
    color: "#FAFAFA",
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "sans-bold",
  },
  list: {
    paddingHorizontal: 30,
  },
  item: {
    width: 96,
    marginRight: 20,
    alignItems: "center",
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    backgroundColor: "#18181B",
  },
  itemTitle: {
    color: "#F4F4F5",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "sans-medium",
    textAlign: "center",
  },
});
