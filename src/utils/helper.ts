import { useCallback } from "react";
import { usePlayerStore } from "../store/usePlayerStore";

export const handleCloseSheet = useCallback(() => {
  const minimizeFullPlayer = usePlayerStore(
    (state) => state.minimizeFullPlayer,
  );
  minimizeFullPlayer();
}, []);