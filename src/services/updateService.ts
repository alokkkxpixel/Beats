import { storage } from "@/src/lib/storage";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Configure foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Storage keys ────────────────────────────────────────────────────────────
const DISMISSED_UNTIL_KEY = "BEATS_OTA_DISMISSED_UNTIL";
const NOTIFIED_UPDATE_KEY = "BEATS_OTA_LAST_NOTIFIED_ID";
const FRESH_INSTALL_KEY = "BEATS_IS_FRESH_INSTALL";

// How many hours to snooze the banner after "Remind me later" (show again next day)
const DISMISS_HOURS = 24;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UpdateInfo {
  isAvailable: boolean;
  isDevMock?: boolean;
  /** Runtime/version label shown in UI e.g. "1.2.0" */
  version?: string;
  /** Unique EAS update ID */
  updateId?: string;
  /** Human-readable what's-new lines from the manifest or fallback */
  releaseNotes?: string[];
  /** ISO date string of when the update was published */
  createdAt?: string;
  /** If true this is a fresh-install → auto-apply silently */
  isFreshInstall?: boolean;
}

// ─── Dev mock (shown in __DEV__ so the UI is always previewable) ─────────────
const DEFAULT_DEV_UPDATE: UpdateInfo = {
  isAvailable: true,
  isDevMock: true,
  version: "1.1.6 (OTA)",
  createdAt: new Date().toISOString(),
  releaseNotes: [
    "Enhanced Nitro Audio Engine for faster playback",
    "Smoother screen transitions and UI polish",
    "Improved offline download resilience and caching",
    "Fixed background playback and battery usage issues",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Is the banner currently snoozed by the user? */
export const isUpdateDismissed = (): boolean => {
  const until = storage.getString(DISMISSED_UNTIL_KEY);
  if (!until) return false;
  const ts = parseInt(until, 10);
  return !isNaN(ts) && Date.now() < ts;
};

/** Snooze the banner for DISMISS_HOURS hours (default = 1 day). */
export const dismissUpdate = (hours: number = DISMISS_HOURS) => {
  const future = Date.now() + hours * 60 * 60 * 1000;
  storage.set(DISMISSED_UNTIL_KEY, String(future));
};

/** Clear snooze so the banner shows immediately on next check. */
export const clearUpdateDismissal = () => {
  storage.delete(DISMISSED_UNTIL_KEY);
};

/** Has the user been notified for this specific update ID already? */
const wasAlreadyNotified = (updateId: string): boolean => {
  return storage.getString(NOTIFIED_UPDATE_KEY) === updateId;
};

/** Mark this update ID as "notification sent". */
const markNotified = (updateId: string) => {
  storage.set(NOTIFIED_UPDATE_KEY, updateId);
};

/** Check if this is the very first launch after a native install. */
export const isFreshInstall = (): boolean => {
  return !storage.getBoolean(FRESH_INSTALL_KEY);
};

/** Mark the app as "not fresh anymore" after first launch logic runs. */
export const markNotFreshInstall = () => {
  storage.set(FRESH_INSTALL_KEY, true);
};

// ─── Notification helper ──────────────────────────────────────────────────────

/**
 * Ensure the app has the POST_NOTIFICATIONS runtime permission on Android 13+.
 * Returns true if granted (or if below API 33 / not Android).
 */
async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    // iOS: use expo-notifications API
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const { status: requested } = await Notifications.requestPermissionsAsync();
    return requested === "granted";
  }

  // Android < 13 — permission is granted at install time, no runtime ask needed
  if (Platform.Version < 33) return true;

  // Android 13+ — POST_NOTIFICATIONS is a runtime permission
  const { PermissionsAndroid } = require("react-native");
  const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (!perm) return false;

  // Check current status first to avoid showing dialog repeatedly
  const current = await PermissionsAndroid.check(perm);
  if (current) return true;

  const result = await PermissionsAndroid.request(perm, {
    title: "Allow notifications",
    message:
      "Beats would like to notify you when a new update is available.",
    buttonPositive: "Allow",
    buttonNegative: "Not now",
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Schedule a system notification for the update.
 * Silently skips if the user has denied the notification permission.
 */
async function sendUpdateNotification(title: string, body: string) {
  try {
    // ── 1. Ensure we have permission before doing anything ─────────────────
    const hasPermission = await ensureNotificationPermission();
    if (!hasPermission) {
      console.info(
        "[UpdateService] Notification permission not granted — skipping.",
      );
      return;
    }

    // ── 2. Create / update the notification channel (Android only) ─────────
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("app-updates", {
        name: "App Updates",
        description: "Notifications about new Beats OTA updates",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ffffff",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
    }

    // ── 3. Schedule the notification immediately ───────────────────────────
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        // "default" string on Android uses the channel's sound setting;
        // on iOS it plays the default system sound.
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        // Attach to our channel so Android respects the importance level
        ...(Platform.OS === "android" && { channelId: "app-updates" }),
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn("[UpdateService] Failed to send notification:", err);
  }
}

// ─── Parse real manifest into UpdateInfo ─────────────────────────────────────
function parseManifest(manifest: any, updateId?: string): UpdateInfo {
  // EAS manifests may carry metadata.releaseNotes (string[]) or message (string)
  const meta = manifest?.metadata || manifest?.extra?.metadata || {};
  let notes: string[] = [];

  if (Array.isArray(meta.releaseNotes) && meta.releaseNotes.length > 0) {
    notes = meta.releaseNotes as string[];
  } else if (typeof meta.message === "string" && meta.message.trim()) {
    // Single-line message → split on newlines/semicolons
    notes = meta.message
      .split(/[\n;]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (notes.length === 0) {
    notes = [
      "Bug fixes and performance improvements",
      "Audio engine responsiveness enhancements",
      "Updated offline content support",
    ];
  }

  const version =
    manifest?.runtimeVersion ||
    manifest?.version ||
    meta.version ||
    "Latest (OTA)";

  const createdAt =
    manifest?.createdAt || meta.createdAt || new Date().toISOString();

  return {
    isAvailable: true,
    isDevMock: false,
    version,
    updateId: updateId || manifest?.id,
    releaseNotes: notes,
    createdAt,
  };
}

// ─── Main exported functions ──────────────────────────────────────────────────

/**
 * Check for OTA updates.
 *
 * Behaviour matrix:
 *  • If updates not enabled (e.g. dev client without published update) → returns `{ isAvailable: false }`
 *  • Fresh install  → auto-apply silently (returns `isFreshInstall: true`)
 *  • Banner snoozed → returns `{ isAvailable: false }` (unless forceCheck)
 *  • New update     → returns full UpdateInfo, sends ONE push notification per updateId
 */
export const checkForAppUpdate = async (
  forceCheck: boolean = false,
): Promise<UpdateInfo> => {
  // If Expo Updates is not enabled or not supported in this runtime
  if (!Updates.isEnabled) {
    return { isAvailable: false };
  }

  // ── Production / Preview build with expo-updates active ────────────────────
  try {
    // 1. Fresh install check — auto-apply the latest OTA immediately
    const fresh = isFreshInstall();
    if (fresh) {
      markNotFreshInstall();
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        const manifest = (check.manifest || {}) as any;
        const info = parseManifest(manifest);
        info.isFreshInstall = true;
        // Auto-fetch silently (caller will handle reload)
        return info;
      }
      return { isAvailable: false };
    }

    // 2. Respect snooze unless force-checking from Settings
    if (!forceCheck && isUpdateDismissed()) {
      return { isAvailable: false };
    }

    // 3. Standard check
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return { isAvailable: false };

    const manifest = (check.manifest || {}) as any;
    const updateId = manifest?.id || "unknown";
    const info = parseManifest(manifest, updateId);

    // 4. Send push notification once per unique updateId
    if (!wasAlreadyNotified(updateId)) {
      markNotified(updateId);
      await sendUpdateNotification(
        "Beats update available",
        info.releaseNotes?.[0] ?? "A new update is ready to install.",
      );
    }

    return info;
  } catch (error) {
    console.warn("[UpdateService] OTA check failed:", error);
    return { isAvailable: false };
  }
};

/**
 * Download and apply the OTA update.
 * Calls `onProgress` with 0–100 during download.
 * In __DEV__: simulates progress so UI is previewable.
 * In production: fetches real bundle then reloads.
 */
export const downloadAndApplyUpdate = async (
  onProgress?: (progress: number) => void,
): Promise<void> => {
  if (!__DEV__ && Updates.isEnabled) {
    try {
      onProgress?.(20);
      await Updates.fetchUpdateAsync();
      onProgress?.(100);
    } catch (error) {
      console.error("[UpdateService] Fetch failed:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not download the update. Please try again later.",
      });
      throw error;
    }
  } else {
    // Dev: animate a fake progress bar
    for (let p = 15; p <= 100; p += 17) {
      onProgress?.(Math.min(p, 100));
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Notify that the update was downloaded & is being applied
  await sendUpdateNotification(
    "Beats updated ✓",
    "The update has been installed. Enjoy the latest version!",
  );

  Toast.show({
    type: "success",
    text1: "Update ready!",
    text2: "Restarting Beats...",
    visibilityTime: 2200,
  });

  await new Promise((r) => setTimeout(r, 1800));

  if (!__DEV__ && Updates.isEnabled) {
    await Updates.reloadAsync();
  }
};
