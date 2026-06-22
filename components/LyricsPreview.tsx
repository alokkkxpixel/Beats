import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  Pressable,
  StyleSheet,
  Text, View
} from "react-native";

interface LyricsPreviewProps {
  lyrics: string[];
  currentLineIndex: number;
  onPress?: () => void;
}

const LyricsPreview = ({
  lyrics,
  currentLineIndex,
  onPress,
}: LyricsPreviewProps) => {
  const visibleLyrics = lyrics.slice(
    currentLineIndex,
    currentLineIndex + 4
  );
const accentColor = usePlayerStore((state) => state.accentColor);
  return (
    <Pressable
      style={[styles.container, { backgroundColor: accentColor.muted + "79" }]}
      onPress={onPress}
      android_ripple={{ color: "#ffffff15" }}
    >
      <Text style={[styles.header, { color:  "#FFFFFF" }]}>
        Lyrics preview
      </Text>

      <View style={styles.centerContent}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>
            Show Lyrics
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default LyricsPreview;

const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#ffffff15",
//     borderRadius: 24,
//     width: 320,
//     marginLeft: "auto",
//     marginRight: "auto",
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#ffffff08",
//   },

  title: {
    // color: accentColor.muted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  lyricsContainer: {
    padding:20,
    gap: 4,
  },

  lyricLine: {
    color: "#7A7A7A",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },

  activeLine: {
    color: "#FFFFFF",
  },
    container: {
    height: 220,
    width: 360,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ffffff08",
    // backgroundColor: "#ffffff15",
    // backgroundColor: "#4A90E2", // use album accent color
    overflow: "hidden",
    padding: 16,
    marginTop:15,
  },

  header: {
    color: "#FFFFFFCC",
    fontSize: 14,
    fontWeight: "600",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

});