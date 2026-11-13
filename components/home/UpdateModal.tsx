import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UpdateInfo } from "@/src/services/updateService";

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateInfo | null;
  isDownloading: boolean;
  downloadProgress: number;
  onUpdate: () => void;
  onDismiss: () => void;
  onClose: () => void;
}

/** Fallback notes shown when the OTA manifest has no metadata */
const FALLBACK_NOTES = [
  "Faster audio loading & smoother playback",
  "Better background service stability",
  "UI polish and animation improvements",
  "Reduced memory & battery usage",
];

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  isDownloading,
  downloadProgress,
  onUpdate,
  onDismiss,
  onClose,
}) => {
  if (!updateInfo) return null;

  const notes =
    updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0
      ? updateInfo.releaseNotes
      : FALLBACK_NOTES;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* App icon + heading */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/icons/appIcon.png")}
              style={styles.appIcon}
            />
            <View style={styles.headerText}>
              <Text style={styles.appName}>Beats</Text>
              <Text style={styles.versionLine}>
                {updateInfo.version
                  ? `Version ${updateInfo.version} available`
                  : "New version available"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* What's new */}
          <Text style={styles.sectionLabel}>What's new</Text>
          {notes.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletChar}>–</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}

          {/* Progress bar (only while downloading) */}
          {isDownloading && (
            <View style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(downloadProgress, 10)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                Downloading{downloadProgress > 0 ? ` · ${downloadProgress}%` : "…"}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <Pressable
            style={[styles.primaryBtn, isDownloading && styles.primaryBtnDisabled]}
            onPress={onUpdate}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#050505" />
                <Text style={styles.primaryBtnText}>Installing…</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Update</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={onDismiss}
            disabled={isDownloading}
          >
            <Text style={styles.secondaryBtnText}>Remind me later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3f3f46",
    alignSelf: "center",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  versionLine: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#27272a",
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  bulletChar: {
    color: "#52525b",
    fontSize: 14,
    lineHeight: 20,
    width: 10,
  },
  bulletText: {
    color: "#d4d4d8",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  progressWrapper: {
    marginTop: 18,
    marginBottom: 4,
    gap: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#27272a",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  progressLabel: {
    color: "#71717a",
    fontSize: 11.5,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryBtnDisabled: {
    opacity: 0.75,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#050505",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#52525b",
    fontSize: 14,
  },
});
