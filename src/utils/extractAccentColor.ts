import { getColors } from "react-native-image-colors";

// 1. Define a strict structure for what this function returns
interface ExtractedColors {
  dominant: string;
  average: string;
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  darkMuted: string;
  lightMuted: string;
  muted: string;
  fallbackAccentColor: string;
}

interface ExtractColorOptions {
  trackImage: string | null | undefined;
  /** Optional reference object to cancel state updates if the component unmounts */
  checkMounted?: () => boolean;
}

export async function extractAccentColor({
  trackImage,
  checkMounted,
}: ExtractColorOptions): Promise<ExtractedColors> {
  const fallbackAccentColor = "#111111";

  // A helper function to generate the default fallback object
  const createFallbackObject = (
    overrideColor = fallbackAccentColor,
  ): ExtractedColors => ({
    dominant: overrideColor,
    average: overrideColor,
    vibrant: overrideColor,
    darkVibrant: overrideColor,
    lightVibrant: overrideColor,
    darkMuted: overrideColor,
    lightMuted: overrideColor,
    muted: overrideColor,
    fallbackAccentColor: fallbackAccentColor,
  });

  if (!trackImage) {
    return createFallbackObject();
  }

  try {
    const result = await getColors(trackImage, {
      fallback: fallbackAccentColor,
      cache: true,
      key: trackImage,
    });

    // If the component has already unmounted, stop immediately
    if (checkMounted && !checkMounted()) {
      return createFallbackObject();
    }

    // console.log("🎨 Image Colors Result:", JSON.stringify(result, null, 2));

    if (result.platform === "android") {
      // console.log("🎨 Dominant:", result.dominant);
      // console.log("🎨 Average:", result.average);
      // console.log("🎨 Vibrant:", result.vibrant);
      // console.log("🎨 Dark Vibrant:", result.darkVibrant);
      // console.log("🎨 Light Vibrant:", result.lightVibrant);
      // console.log("🎨 Dark Muted:", result.darkMuted);
      // console.log("🎨 Light Muted:", result.lightMuted);
      // console.log("🎨 Muted:", result.muted);

      // FIXED: Directly returning the object without illegal const reassignment & fixed typos
      return {
        dominant: result.dominant || fallbackAccentColor,
        average: result.average || fallbackAccentColor,
        vibrant: result.vibrant || fallbackAccentColor,
        darkVibrant: result.darkVibrant || fallbackAccentColor,
        lightVibrant: result.lightVibrant || fallbackAccentColor,
        darkMuted: result.darkMuted || fallbackAccentColor,
        lightMuted: result.lightMuted || fallbackAccentColor,
        muted: result.muted || fallbackAccentColor,
        fallbackAccentColor: fallbackAccentColor,
      };
    } else if (result.platform === "ios") {
      console.log("🎨 Background:", result.background);
      console.log("🎨 Primary:", result.primary);
      console.log("🎨 Secondary:", result.secondary);
      console.log("🎨 Detail:", result.detail);

      // FIXED: Maps iOS platform colors cleanly to the same object format
      const iosPrimaryColor =
        result.background || result.primary || fallbackAccentColor;
      return {
        dominant: iosPrimaryColor,
        average: result.primary || fallbackAccentColor,
        vibrant: result.secondary || fallbackAccentColor,
        darkVibrant: result.detail || fallbackAccentColor,
        lightVibrant: iosPrimaryColor,
        darkMuted: result.detail || fallbackAccentColor,
        lightMuted: result.secondary || fallbackAccentColor,
        muted: result.primary || fallbackAccentColor,
        fallbackAccentColor: fallbackAccentColor,
      };
    }

    return createFallbackObject();
  } catch (error) {
    console.log("❌ Image Colors Error:", error);
    return createFallbackObject();
  }
}
