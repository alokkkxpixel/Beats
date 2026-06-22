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

      if (isMounted) {
        setAccentColor(colorData);
      }
    }

    updateColor();

    return () => {
      isMounted = false;
    };
  }, [trackImage, setAccentColor]);
}
