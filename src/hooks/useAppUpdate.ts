import { useEffect, useState, useCallback, useRef } from "react";
import {
  checkForAppUpdate,
  downloadAndApplyUpdate,
  dismissUpdate,
  clearUpdateDismissal,
  UpdateInfo,
} from "@/src/services/updateService";
import * as Updates from "expo-updates";
import Toast from "react-native-toast-message";

export const useAppUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Prevent duplicate mounts from triggering check twice (StrictMode, etc.)
  const didCheck = useRef(false);

  const checkUpdates = useCallback(async (force: boolean = false) => {
    try {
      setIsChecking(true);
      const info = await checkForAppUpdate(force);

      if (!info.isAvailable) {
        setUpdateInfo(null);
        setIsBannerVisible(false);
        return info;
      }

      setUpdateInfo(info);

      // ── Fresh install: auto-apply silently ──────────────────────────────
      if (info.isFreshInstall) {
        try {
          await downloadAndApplyUpdate((p) => setDownloadProgress(p));
        } catch {
          // If silent auto-update fails, fall through and show banner
          setIsBannerVisible(true);
        }
        return info;
      }

      // ── Existing install: show banner (and modal on force-check) ────────
      setIsBannerVisible(true);
      if (force) {
        setIsModalVisible(true);
      }

      return info;
    } catch (e) {
      console.warn("[useAppUpdate] check failed:", e);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Run once on mount
  useEffect(() => {
    if (didCheck.current) return;
    didCheck.current = true;
    checkUpdates(false);
  }, [checkUpdates]);

  const handleUpdate = useCallback(async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(5);
      await downloadAndApplyUpdate((p) => setDownloadProgress(p));
      setIsBannerVisible(false);
      setIsModalVisible(false);
    } catch (error) {
      console.error("[useAppUpdate] apply failed:", error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, []);

  /**
   * Dismiss the banner for 24 h (shows again the next day).
   * Pass days=0 to dismiss until next cold start only.
   */
  const handleDismiss = useCallback((hours: number = 24) => {
    dismissUpdate(hours);
    setIsBannerVisible(false);
    setIsModalVisible(false);
  }, []);

  const resetPreview = useCallback(async () => {
    clearUpdateDismissal();
    await checkUpdates(true);
  }, [checkUpdates]);

  return {
    updateInfo,
    isChecking,
    isDownloading,
    downloadProgress,
    isBannerVisible,
    isModalVisible,
    setIsModalVisible,
    setIsBannerVisible,
    handleUpdate,
    handleDismiss,
    checkUpdates,
    resetPreview,
  };
};
