import * as Notifications from "expo-notifications";
import { Permission, PermissionsAndroid, Platform } from "react-native";

export const requestAppPermissions = async () => {
  try {
    // 1. Request Notification Permissions
    if (Platform.OS === "android" && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    // Always request iOS notifications
    await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });

    // 2. Request Location Permissions
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
    }

    // 3. Request Storage Permissions
    if (Platform.OS === "android") {
      const permissionsToRequest: Permission[] = [];

      if (Platform.Version < 33) {
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }

      if (permissionsToRequest.length > 0) {
        await PermissionsAndroid.requestMultiple(permissionsToRequest);
      }
    }
  } catch (error) {
    console.warn("Error requesting app permissions:", error);
  }
};
