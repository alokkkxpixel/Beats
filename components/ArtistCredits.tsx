import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Artist {
  id: string;
  name: string;
  role: string;
}

interface CreditsProps {
  artists: Artist[];
  onShowAll?: () => void;
  onFollow?: (artist: Artist) => void;
  onArtistPress?: (artist: Artist) => void;
}

const ArtistCredits = ({
  artists,
  onShowAll,
  onArtistPress,
}: CreditsProps) => {
  const shouldScroll = artists.length > 4;
 const accentColor = usePlayerStore((state) => state.accentColor);

  return (
    <View style={[styles.container, { backgroundColor: accentColor.muted + "29" , borderColor: "#FFFFFF20" , borderWidth: 1}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Credits
        </Text>

        {artists.length > 4 && (
          <TouchableOpacity onPress={onShowAll}>
            {/* <Text style={styles.showAllText}>
              Show all
            </Text> */}
          </TouchableOpacity>
        )}
      </View>

      {/* Artists */}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{
          maxHeight: shouldScroll ? 280 : undefined,
        }}
      >
        {artists.map((artist, index) => (
          <View
            key={`${artist.id}-${artist.role}-${index}`}
            style={[
              styles.artistRow,
              index !== artists.length - 1 && styles.artistRowBorder
            ]}
          >
             <TouchableOpacity onPress={() => onArtistPress?.(artist)}>

            <Text
              style={styles.artistName}
              numberOfLines={1}
              >
              {artist.name}
            </Text>
              </TouchableOpacity>

            <Text
              style={styles.artistRole}
              numberOfLines={1}
            >
              {artist.role.split("_").join(" ")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#18181B",
   
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    // fontWeight: "700",
    fontFamily:"sans-semibold"
  },
  showAllText: {
    color: "#1DB954",
    fontSize: 14,
    // fontWeight: "600",
    fontFamily:"sans-semibold"
  },
  artistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  artistRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  artistName: {
    color: "#FFFFFF",
    fontSize: 15,
    // fontWeight: "500",
    fontFamily:"sans-medium",
    flex: 1,
    marginRight: 16,
  },
  artistRole: {
    color: "#A1A1AA",
    fontSize: 14,
    // fontWeight: "400",
    fontFamily:"sans-regular",
    textTransform: "capitalize",
  },
});

export default ArtistCredits;