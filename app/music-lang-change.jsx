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
import {
  Pressable,
  Image as RNImage,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { height, width } = useWindowDimensions();
  const isShortScreen = height < 700;
  const insets = useSafeAreaInsets();

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
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: width > 400 ? 20 : 16,
          paddingTop: insets.top + 12,
        }}
      >
        {/* Header */}
        <LanguageHeader isShortScreen={isShortScreen} />

        {/* Grid Wrapper */}
        <View style={{ flex: 1 }}>
          <FlashList
            data={LANGUAGES}
            numColumns={2}
            estimatedItemSize={140}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 4,
              paddingBottom: 20,
            }}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            renderItem={({ item }) => {
              const active = isSelected(item.id);

              return (
                <Pressable
                  onPress={() => toggleLanguage(item.id)}
                  style={{
                    flex: 1,
                    margin: 6,
                    aspectRatio: isShortScreen ? 1.35 : 1.25,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      overflow: "hidden",
                      borderWidth: 2,
                      borderColor: active ? "#ffffff" : "transparent",
                      elevation: active ? 8 : 0,
                      shadowColor: "#ffffff",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: active ? 0.3 : 0,
                      shadowRadius: 6,
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

                    {/* Desaturation Overlay for Inactive */}
                    {!active && (
                      <View
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(10, 10, 10, 0.75)",
                        }}
                      />
                    )}

                    {/* Smooth Bottom Linear Gradient */}
                    <LinearGradient
                      colors={["transparent", "rgba(0, 0, 0, 0.9)"]}
                      locations={[0.5, 1.0]}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "100%",
                      }}
                    />

                    {/* Checkmark indicator */}
                    {active && (
                      <View
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: "#ffffff",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="checkmark" size={14} color="#000000" />
                      </View>
                    )}

                    {/* Text Labels */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 12,
                        right: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: isShortScreen ? 16 : 18,
                          fontWeight: "700",
                          fontFamily: "sans-semibold",
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={{
                          color: "rgba(255, 255, 255, 0.65)",
                          fontSize: isShortScreen ? 11 : 12,
                          fontFamily: "sans-regular",
                        }}
                        numberOfLines={1}
                      >
                        {item.native}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Done Button */}
        <Pressable
          disabled={selected.length === 0}
          onPress={handleDone}
          style={{
            marginTop: 10,
            marginBottom: Math.max(insets.bottom + 10, isShortScreen ? 20 : 32),
            paddingVertical: isShortScreen ? 12 : 15,
            borderRadius: 25,
            backgroundColor: selected.length === 0 ? "#1c1c1e" : "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              color: selected.length === 0 ? "#8e8e93" : "#000000",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function LanguageHeader({ isShortScreen }) {
  const router = useRouter();
  const navigation = useNavigation();
  const hasCompletedOnboarding =
    storage.getBoolean("has-completed-onboarding") ?? false;

  return (
    <View
      style={{
        backgroundColor: "#000000",
        paddingBottom: isShortScreen ? 10 : 20,
      }}
    >
      {/* Back Button */}
      {hasCompletedOnboarding && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 36,
            height: 36,
            position: "absolute",
            top: isShortScreen ? -5 : 0,
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18,
            backgroundColor: "#1c1c1e",
            zIndex: 10,
          }}
        >
          <BackIcon width={18} height={18} fill="#ffffff" />
        </Pressable>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Title */}
        <Text
          style={{
            color: "#ffffff",
            fontSize: isShortScreen ? 14 : 18,
            fontFamily: "sans-bold",
            textAlign: "center",
            marginTop: hasCompletedOnboarding ? 4 : 0,
          }}
        >
          Choose your music languages
        </Text>
      </View>

      {/* Subtitle */}
      <Text
        style={{
          color: "#8e8e93",
          textAlign: "center",
          marginTop: isShortScreen ? 4 : 6,
          paddingHorizontal: 24,
          fontSize: isShortScreen ? 13 : 14,
          fontFamily: "sans-regular",
        }}
      >
        Pick at least one language you enjoy
      </Text>
    </View>
  );
}
