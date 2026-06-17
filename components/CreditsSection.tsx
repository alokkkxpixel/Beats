import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Custom row component remains unchanged...
const CreditRow = ({ item, index, type, isLast, navigateToArtist }: any) => (
  <Pressable onPress={() => item?.id && navigateToArtist(item)}>
    <View
      className={`flex-row justify-between items-center py-3 ${isLast ? "" : "border-b border-white/10"}`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-white text-sm font-semibold">{item?.name}</Text>
        <Text className="text-gray-400 text-xs mt-1 capitalize">
          {item?.role ? item.role.split("_").join(" ") : "Artist"}
        </Text>
      </View>
      {item?.id && (
        <TouchableOpacity
          onPress={() => navigateToArtist(item)}
          className="border border-gray-500 px-3 py-1 rounded-full"
        >
          <Text className="text-white text-xs">View</Text>
        </TouchableOpacity>
      )}
    </View>
  </Pressable>
);

export default function CreditsSection({
  originalSong,
  navigateToArtist,
}: any) {
  const primaryArtists = originalSong?.artists?.primary ?? [];
  const featuredArtists = originalSong?.artists?.featured ?? [];

  const allArtists = useMemo(() => {
    return [
      ...primaryArtists.map((a: any) => ({ ...a, type: "primary" })),
      ...featuredArtists.map((a: any) => ({ ...a, type: "featured" })),
    ];
  }, [primaryArtists, featuredArtists]);

  const hasLongList = allArtists.length > 3;

  return (
    <View style={styles.creditsCard}>
      <Text style={styles.creditsTitle}>Credits</Text>

      {hasLongList ? (
        /* USING STANDARD SCROLLVIEW WITH DETACHED NESTED INHERITANCE */
        <ScrollView
          style={styles.scrollListContainer}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={false}
        >
          {allArtists.map((item, index) => (
            <CreditRow
              key={`${item.type}-${item.id ?? index}`}
              item={item}
              index={index}
              type={item.type}
              isLast={index === allArtists.length - 1}
              navigateToArtist={navigateToArtist}
            />
          ))}
        </ScrollView>
      ) : (
        <View>
          {allArtists.map((item, index) => (
            <CreditRow
              key={`${item.type}-${item.id ?? index}`}
              item={item}
              index={index}
              type={item.type}
              isLast={index === allArtists.length - 1}
              navigateToArtist={navigateToArtist}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  creditsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  creditsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollListContainer: {
    height: 205, // Locks frame structure viewport to roughly 3 elements
  },
});
