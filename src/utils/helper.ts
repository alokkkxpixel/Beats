import { usePlayerStore } from "../store/usePlayerStore";

export const handleCloseSheet = () => {
  usePlayerStore.getState().minimizeFullPlayer();
};
