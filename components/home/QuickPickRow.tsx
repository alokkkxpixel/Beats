import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { QuickPick } from "./types";

type QuickPickRowProps = {
  item: QuickPick;
};

export default function QuickPickRow({
  item,
}: QuickPickRowProps): React.JSX.Element {
  return (
    <Pressable style={styles.row}>
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
      <View style={styles.menu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#A3A3A3" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    marginBottom: 12,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#18181B",
  },
  meta: {
    flex: 1,
  },
  title: {
    color: "#FAFAFA",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "sans-semibold",
    marginBottom: 2,
  },
  artist: {
    color: "#A3A3A3",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "sans-regular",
  },
  menu: {
    marginLeft: 12,
  },
});
