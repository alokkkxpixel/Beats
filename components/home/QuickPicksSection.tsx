import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { quickPickColumns } from "./data";
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
  data?: any[];
}

export default function QuickPicksSection({ data }: QuickPicksSectionProps) {
  const { width: screenWidth } = useWindowDimensions();

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
      title: item.title,
      artist: item.subtitle || item.artist || "Unknown Artist",
      cover: item.image || item.cover,
      playCount: item.play_count || item.playCount,
      url: item.url || item.perma_url,
    }));

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
        <Text style={styles.heading}>Quick picks</Text>
        <Pressable style={styles.playAllButton}>
          <Text style={styles.playAllText}>Play all</Text>
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
    marginBottom: 12,
  },

  heading: {
    color: "#FAFAFA",
    fontSize: 22,
    fontWeight: "700",
  },

  playAllButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  playAllText: {
    color: "#E4E4E7",
    fontSize: 13,
    fontWeight: "500",
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
