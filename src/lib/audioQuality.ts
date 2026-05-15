import type { ImageQuality, SongDetail } from "@/types/jiosaavn";
import type { AudioQualityPreference } from "./storage";

export interface AudioQualityOption {
  id: AudioQualityPreference;
  label: string;
  targetQuality: string;
  description: string;
}

export const AUDIO_QUALITY_OPTIONS: AudioQualityOption[] = [
  {
    id: "very_low",
    label: "Very Low",
    targetQuality: "12kbps",
    description: "Lowest data usage",
  },
  {
    id: "low",
    label: "Low",
    targetQuality: "48kbps",
    description: "Good for slow networks",
  },
  {
    id: "medium",
    label: "Medium",
    targetQuality: "96kbps",
    description: "Balanced quality and data",
  },
  {
    id: "high",
    label: "High",
    targetQuality: "160kbps",
    description: "Clear everyday streaming",
  },
  {
    id: "very_high",
    label: "Very High",
    targetQuality: "320kbps",
    description: "Best available quality",
  },
];

const parseBitrate = (quality?: string): number => {
  const value = parseInt((quality || "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(value) ? value : 0;
};

export const getAudioQualityLabel = (quality: AudioQualityPreference) =>
  AUDIO_QUALITY_OPTIONS.find((option) => option.id === quality)?.label || "High";

export const getPreferredDownloadEntry = (
  downloadUrls: ImageQuality[] | undefined,
  preference: AudioQualityPreference,
): ImageQuality | null => {
  if (!downloadUrls?.length) return null;

  const sortedUrls = [...downloadUrls].sort(
    (a, b) => parseBitrate(a.quality) - parseBitrate(b.quality),
  );
  const targetBitrate = parseBitrate(
    AUDIO_QUALITY_OPTIONS.find((option) => option.id === preference)
      ?.targetQuality,
  );

  const exactMatch = sortedUrls.find(
    (entry) => parseBitrate(entry.quality) === targetBitrate,
  );
  if (exactMatch) return exactMatch;

  const closestBelow = [...sortedUrls]
    .reverse()
    .find((entry) => parseBitrate(entry.quality) <= targetBitrate);
  if (closestBelow) return closestBelow;

  return sortedUrls[sortedUrls.length - 1] || sortedUrls[0] || null;
};

export const getPreferredTrackUrl = (
  song: Pick<SongDetail, "downloadUrl" | "url">,
  preference: AudioQualityPreference,
) => getPreferredDownloadEntry(song.downloadUrl, preference)?.url || song.url;
