import BackIcon from "@/assets/app-icons/chevron-left.svg";
import {
  getMusicLanguages,
  setMusicLanguages,
  storage,
} from "@/src/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Image as RNImage, Text, View } from "react-native";
const LANGUAGES = [
  {
    id: "hindi",
    name: "Hindi",
    native: "हिंदी",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/hindi.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "english",
    name: "English",
    native: "English",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/english.jpg"))
      .uri,
    color: "#3C3B6E",
  },
  {
    id: "marathi",
    name: "Marathi",
    native: "मराठी",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/marathi.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/punjabi.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "tamil",
    name: "Tamil",
    native: "தமிழ்",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/tamil.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "telugu",
    name: "Telugu",
    native: "తెలుగు",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/telugu.png"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "haryanvi",
    name: "Haryanvi",
    native: "हरयाणवी",
    image: RNImage.resolveAssetSource(
      require("@/assets/musicLang/haryanvi.jpg"),
    ).uri,
    color: "#FF9933",
  },
  {
    id: "kannada",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/kannada.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "malayalam",
    name: "Malayalam",
    native: "മലയാളം",
    image: RNImage.resolveAssetSource(
      require("@/assets/musicLang/malayalam.jpg"),
    ).uri,
    color: "#FF9933",
  },
  {
    id: "bengali",
    name: "Bengali",
    native: "বাংলা",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/bengali.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "rajasthani",
    name: "Rajasthani",
    native: "રાજસ્થાની / राजस्थानी",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/bengali.jpg"))
      .uri,
    color: "#FF4500",
  },
  {
    id: "bhojpuri",
    name: "Bhojpuri",
    native: "भोजपुरी",
    image: RNImage.resolveAssetSource(
      require("@/assets/musicLang/bhojpuri.jpg"),
    ).uri,
    color: "#E60000",
  },
  {
    id: "odia",
    name: "Odia",
    native: "ଓଡ଼ିଆ",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/odia.jpg"))
      .uri,
    color: "#008080",
  },
  {
    id: "gujarati",
    name: "Gujarati",
    native: "ગુજરાતી",
    image: RNImage.resolveAssetSource(require("@/assets/musicLang/guju.jpg"))
      .uri,
    color: "#FF9933",
  },
  {
    id: "assamese",
    name: "Assamese",
    native: "অসমীয়া",
    image: RNImage.resolveAssetSource(
      require("@/assets/musicLang/assamese.jpg"),
    ).uri,
    color: "#FF9933",
  },
  {
    id: "sanskrit",
    name: "Sanskrit",
    native: "संस्कृत",
    image: RNImage.resolveAssetSource(
      require("@/assets/musicLang/sanskrit.png"),
    ).uri,
    color: "#FF9933",
  },
];

export default function LanguageSelectionScreen() {
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Load initial selection from MMKV
  useEffect(() => {
    const savedLangs = getMusicLanguages();
    const initial = savedLangs.map((l) => l.toLowerCase());
    setSelected(initial);
  }, []);

  const toggleLanguage = (langId) => {
    setSelected((prev) => {
      if (prev.includes(langId)) {
        return prev.filter((l) => l !== langId);
      } else {
        return [...prev, langId];
      }
    });
  };

  const handleDone = () => {
    setMusicLanguages(selected);

    // Invalidate queries to trigger a fresh fetch on the home screen
    queryClient.invalidateQueries({ queryKey: ["home-previews"] });
    queryClient.invalidateQueries({ queryKey: ["special-for-you"] });

    // Mark onboarding as completed
    storage.set("has-completed-onboarding", true);

    // Navigate back to home
    router.replace("/");
  };

  const isSelected = (langId) => selected.includes(langId);

  return (
    <View className="flex-1 bg-black px-4 pt-20">
      {/* Header */}
      <LanguageHeader />
      {/* Grid */}
      <FlashList
        data={LANGUAGES}
        numColumns={2}
        estimatedItemSize={170}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 8, // Adds a nice breathing room on the outer edges
          paddingBottom: 100,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between", // Pushes the items to the sides perfectly
        }}
        renderItem={({ item }) => {
          const active = isSelected(item.id);

          return (
            <Pressable
              onPress={() => toggleLanguage(item.id)}
              style={{
                flex: 1, // Makes the card fill 50% of the screen width evenly
                margin: 6, // Controls the gap size between cards cleanly
                aspectRatio: 1.2, // Keeps your desired card proportion perfectly scaled
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {/* Background */}
                <Image
                  source={{ uri: item.image }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="cover"
                />
                {/* Grayscale/Desaturation Overlay (Visible ONLY when NOT active) */}
                {!active && (
                  <View
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(31, 31, 31, 0.94)", // Adjust opacity here to make it more or less gray
                      mixBlendMode: "color", // If supported by your environment, otherwise the fallback tint works perfectly
                    }}
                  />
                )}
                {/* Smooth Bottom Linear Gradient (Replaced the full dark overlay) */}
                <LinearGradient
                  colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
                  locations={[0.6, 1.0]} // Starts fading in at 50% height, full dark at 100%
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "100%",
                  }}
                />

                {/* Check */}
                {active && (
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#fff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={18} color="#000" />
                  </View>
                )}

                {/* Text */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 15,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: "700",
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 14,
                    }}
                  >
                    {item.native}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
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
  const hasCompletedOnboarding =
    storage.getBoolean("has-completed-onboarding") ?? false;

  return (
    <View className="bg-black px-4  pb-4">
      {/* Header Row */}
      {/* Back Button */}
      {hasCompletedOnboarding && (
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 absolute top-5 left-5 items-center justify-center rounded-full bg-zinc-800"
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </Pressable>
      )}
      <View className="flex-row items-center justify-center  ">
        {/* Title */}
        <Text
          className={`text-white text-xl self-center font-sans-bold ${hasCompletedOnboarding ? "ml-4" : ""}`}
        >
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
