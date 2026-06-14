// hooks/useTrackAccentColor.ts
import { useEffect } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { extractAccentColor } from "../utils/extractAccentColor";

export default function useTrackAccentColor(trackImage?: string) {
  const setAccentColor = usePlayerStore((state) => state.setAccentColor);

  useEffect(() => {
    if (!trackImage) return;

    let isMounted = true;

    async function updateColor() {
      const colorData = await extractAccentColor({
        trackImage,
        checkMounted: () => isMounted,
      });

      let finalColor = "#1d1c1cff";

      if (colorData && typeof colorData === "object") {
        finalColor = colorData.average || colorData.darkMuted || "#1d1c1cff";
      } else if (typeof colorData === "string") {
        finalColor = colorData;
      }

      if (isMounted) {
        setAccentColor(finalColor);
      }
    }

    updateColor();

    return () => {
      isMounted = false;
    };
  }, [trackImage, setAccentColor]);
}
