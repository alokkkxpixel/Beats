import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
const { width } = Dimensions.get("window");
const Categories = () => {
  const CATEGORIES = [
    {
      id: "1",
      title: "New releases",
      icon: "sparkles",
      color: "#2A2A2A",
      iconType: "Ionicons",
    },
    {
      id: "2",
      title: "Charts",
      icon: "trending-up",
      color: "#2A2A2A",
      iconType: "MaterialCommunityIcons",
    },
    {
      id: "3",
      title: "Moods and genres",
      icon: "emoticon-happy-outline",
      color: "#2A2A2A",
      iconType: "MaterialCommunityIcons",
    },
    {
      id: "4",
      title: "Cricket Fever",
      icon: "podcast",
      color: "#2A2A2A",
      iconType: "MaterialCommunityIcons",
    },
  ];
  const router = useRouter();

  return (
    <View style={styles.gridContainer}>
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat.id}
          style={styles.categoryCard}
          onPress={() => {
            router.push({
              pathname: "/category-details",
              params: { id: cat.id, title: cat.title },
            });
          }}
        >
          <View style={styles.iconContainer}>
            {cat.iconType === "Ionicons" ? (
              <Ionicons name={cat.icon as any} size={24} color="white" />
            ) : (
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={24}
                color="white"
              />
            )}
          </View>
          <Text style={styles.categoryTitle}>{cat.title}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 32,
  },
  categoryCard: {
    width: (width - 44) / 2,
    height: 100,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  iconContainer: {
    // opacity: 0.8,
  },
  categoryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
