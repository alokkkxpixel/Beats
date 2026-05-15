import { useRouter } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

// Import SVGs
import MoodsIcon from "@/assets/app-icons/album.svg"; // Fallback
import PodcastIcon from "@/assets/app-icons/artist.svg"; // Fallback
import ExploreIcon from "@/assets/app-icons/explore-fill.svg";
import ChartsIcon from "@/assets/app-icons/history.svg"; // Fallback

const { width } = Dimensions.get("window");
const Categories = () => {
  const CATEGORIES = [
    {
      id: "1",
      title: "New releases",
      icon: ExploreIcon,
      color: "#2A2A2A",
    },
    {
      id: "2",
      title: "Charts",
      icon: ChartsIcon,
      color: "#2A2A2A",
    },
    {
      id: "3",
      title: "Moods and genres",
      icon: MoodsIcon,
      color: "#2A2A2A",
    },
    {
      id: "4",
      title: "Podcasts",
      icon: PodcastIcon,
      color: "#2A2A2A",
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
            <cat.icon width={24} height={24} fill="white" />
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
