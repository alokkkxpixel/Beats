import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UpdateInfo } from "@/src/services/updateService";

interface UpdateBannerProps {
  updateInfo: UpdateInfo | null;
  isDownloading: boolean;
  downloadProgress: number;
  onUpdate: () => void;
  onDismiss: () => void;
  onOpenDetails: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  updateInfo,
  isDownloading,
  downloadProgress,
  onUpdate,
  onDismiss,
  onOpenDetails,
}) => {
  if (!updateInfo || !updateInfo.isAvailable) return null;

  return (
    <Pressable onPress={onOpenDetails} style={styles.container}>
      {/* Left side */}
      <View style={styles.left}>
        <View style={styles.dot} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            Update available
            {updateInfo.version ? (
              <Text style={styles.version}>{"  ·  "}{updateInfo.version}</Text>
            ) : null}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {updateInfo.releaseNotes?.[0] ?? "Improvements to audio & performance"}
          </Text>
        </View>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {isDownloading ? (
          <View style={styles.downloadingRow}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.downloadingText}>
              {downloadProgress > 0 ? `${downloadProgress}%` : "…"}
            </Text>
          </View>
        ) : (
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            onPress={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
            style={styles.updateBtn}
          >
            <Text style={styles.updateBtnText}>Update</Text>
          </Pressable>
        )}
        <Pressable
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={styles.closeBtn}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
    overflow: "hidden",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    overflow: "hidden",
  },
  title: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0,
  },
  version: {
    color: "#71717a",
    fontSize: 13,
    fontWeight: "400",
  },
  subtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  downloadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downloadingText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "600",
  },
  updateBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
  },
  updateBtnText: {
    color: "#050505",
    fontSize: 12.5,
    fontWeight: "700",
  },
  closeBtn: {
    paddingLeft: 2,
  },
  closeBtnText: {
    color: "#52525b",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
});

