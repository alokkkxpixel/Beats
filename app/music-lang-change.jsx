import { getMusicLanguages, setMusicLanguages } from "@/src/lib/storage";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MoveLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const LANGUAGES = [
  "Hindi",
  "English",
  "Marathi",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
];

export default function LanguageSelectionScreen() {
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Load initial selection from MMKV
  useEffect(() => {
    const savedLangs = getMusicLanguages();
    const initial = savedLangs.map(
      (l) => l.charAt(0).toUpperCase() + l.slice(1),
    );
    setSelected(initial);
  }, []);

  const toggleLanguage = (lang) => {
    setSelected((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const handleDone = () => {
    const langsToSave = selected.map((l) => l.toLowerCase());
    setMusicLanguages(langsToSave);

    // Invalidate queries to trigger a fresh fetch on the home screen
    queryClient.invalidateQueries({ queryKey: ["home-previews"] });
    queryClient.invalidateQueries({ queryKey: ["special-for-you"] });

    // Navigate back to home
    router.replace("/");
  };

  const isSelected = (lang) => selected.includes(lang);

  return (
    <View className="flex-1 bg-black px-4 pt-20">
      {/* Header */}
      <LanguageHeader />
      {/* Grid */}
      <FlashList
        data={LANGUAGES}
        numColumns={2}
        keyExtractor={(item) => item}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleLanguage(item)}
            className={`flex-1 m-1 p-4 rounded-xl border ${
              isSelected(item)
                ? "bg-green-500 border-green-500"
                : "bg-zinc-900 border-zinc-700"
            }`}
          >
            <Text
              className={`text-center font-sans-semibold ${
                isSelected(item) ? "text-black" : "text-white"
              }`}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Done Button */}
      <Pressable
        disabled={selected.length === 0}
        onPress={handleDone}
        className={`absolute bottom-10 left-4 right-4 py-4 rounded-xl ${
          selected.length === 0 ? "bg-zinc-700" : "bg-green-500"
        }`}
      >
        <Text className="text-center font-sans-bold text-black text-lg">
          Done
        </Text>
      </Pressable>
    </View>
  );
}

export function LanguageHeader() {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <View className="bg-black px-4  pb-4">
      {/* Header Row */}
      <View className="flex-row items-center">
        {/* Back Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800"
        >
          <MoveLeft size={22} color="#fff" />
        </Pressable>

        {/* Title */}
        <Text className="text-white text-xl font-sans-bold ml-4">
          Choose your music languages
        </Text>
      </View>

      {/* Subtitle (centered) */}
      <Text className="text-zinc-400 text-center mt-4 px-6">
        Pick at least one language you enjoy
      </Text>
    </View>
  );
}
