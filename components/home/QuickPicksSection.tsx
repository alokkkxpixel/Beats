import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { SongDetail } from "@/types/jiosaavn";
import { Ionicons } from "@expo/vector-icons";
import QuickPickRow from "./QuickPickRow";

// export default function QuickPicksSection(): React.JSX.Element {
//   const { width: screenWidth } = useWindowDimensions();
//   const railWidth = screenWidth - 20;
//   const columnWidth = Math.round(railWidth * 0.95);
//   const columnGap = 12;
//   const snapInterval = columnWidth + columnGap;

//   const snapOffsets = useMemo(
//     () => quickPickColumns.map((_, index) => index * snapInterval),
//     [snapInterval],
//   );

//   return (
//     <View style={styles.section}>
//       <View style={styles.header}>
//         <Text style={styles.heading}>Quick picks</Text>
//         <Pressable style={styles.playAllButton}>
//           <Text style={styles.playAllText}>Play all</Text>
//         </Pressable>
//       </View>

//       <FlatList
//         data={quickPickColumns}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         bounces={false}
//         snapToOffsets={snapOffsets}
//         decelerationRate={0.992}
//         contentContainerStyle={styles.contentContainer}
//         keyExtractor={(_, index) => `quick-column-${index}`}
//         renderItem={({ item, index }) => (
//           <View
//             style={[
//               styles.column,
//               { width: columnWidth },
//               index === quickPickColumns.length - 1 && styles.lastColumn,
//             ]}
//           >
//             {item.map((song) => (
//               <QuickPickRow key={song.id} item={song} />
//             ))}
//           </View>
//         )}
//       />
//     </View>
//   );
// }
interface QuickPicksSectionProps {
  data?: SongDetail[];
  title?: string;
  subtitle?: string;
  onMorePress?: () => void;
}

export default function QuickPicksSection({
  data,
  title = "Quick picks",
  subtitle = "Start a queue full of your favorites",
  onMorePress,
}: QuickPicksSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  // console.log("quick picks", data);
  const padding = 16;
  const columnGap = 12;
  const columnWidth = screenWidth * 0.9;
  const snapInterval = columnWidth + columnGap;

  // 1. Group the flat list into columns of 4
  const columns = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Normalize and chunk
    const normalized = data.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      artist:
        item.artist ||
        item.subtitle ||
        item.artists?.primary?.[0]?.name ||
        item.artists?.all?.[0]?.name ||
        "Unknown Artist",
      artistId:
        item.artistId ||
        item.more_info?.artistMap?.primary_artists?.[0]?.id ||
        item.artists?.primary?.[0]?.id ||
        "",
      artistUrl:
        item.artistUrl ||
        item.more_info?.artistMap?.primary_artists?.[0]?.perma_url ||
        item.artists?.primary?.[0]?.url ||
        "",
      cover: item.image || item.cover,
      playCount: item.play_count || item.playCount,
      url: item.url || item.perma_url,
      album: item.album || item.more_info?.album,
      albumId: item.albumId || item.more_info?.album_id,
      albumUrl: item.albumUrl || item.more_info?.album_url,
    }));
    // console.log("normalized", normalized[2]?.title);
    const chunks = [];
    for (let i = 0; i < normalized.length; i += 4) {
      chunks.push(normalized.slice(i, i + 4));
    }
    return chunks;
  }, [data]);

  if (columns.length === 0) return <></>;

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.heading} className="text-2xl font-sans-medium ">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-sm font-sans-light text-gray-200">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable style={styles.headerActions} onPress={onMorePress}>
          <View style={styles.playAllButton}>
            <Text style={styles.playAllText}>
              {onMorePress ? "More" : "Play all"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
        </Pressable>
      </View>

      {/* Horizontal Rail */}
      <FlatList
        data={columns}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: padding }}
        keyExtractor={(_, index) => `quick-column-${index}`}
        renderItem={({ item }) => (
          <View
            style={[
              styles.column,
              { width: columnWidth, marginRight: columnGap },
            ]}
          >
            {item.map((song) => (
              <QuickPickRow key={song.id} item={song} />
            ))}
          </View>
        )}
      />
    </View>
  );
}

// const styles = StyleSheet.create({
//   section: {
//     marginTop: 24,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginBottom: 12,
//   },
//   heading: {
//     color: "#FAFAFA",
//     fontSize: 22,
//     lineHeight: 28,
//     fontFamily: "sans-semibold",
//   },
//   playAllButton: {
//     height: 32,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   playAllText: {
//     color: "#E4E4E7",
//     fontSize: 13,
//     lineHeight: 16,
//     fontFamily: "sans-medium",
//   },
//   contentContainer: {
//     paddingLeft: 20,
//     paddingRight: 20,
//     backgroundColor: "#18181B",
//     // transition: "all 0.3s ease",
//   },
//   column: {
//     marginRight: 0,
//   },
//   lastColumn: {
//     marginLeft: 0,
//   },
// });
const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  headerTitleContainer: {
    flex: 1,
    gap: 2,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heading: {
    color: "#FAFAFA",
  },

  playAllButton: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  playAllText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "600",
  },

  column: {},

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
    backgroundColor: "#333",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: "#FAFAFA",
    fontSize: 15,
    fontWeight: "600",
  },

  artist: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },

  menu: {
    color: "#A1A1AA",
    fontSize: 18,
    marginLeft: 12,
  },
});
