import * as Notifications from "expo-notifications";
import { Permission, PermissionsAndroid, Platform } from "react-native";

export const requestAppPermissions = async () => {
  // 1. Request Notification Permissions (Android)
  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const postPerm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
      if (postPerm) {
        await PermissionsAndroid.request(postPerm);
      }
    }
  } catch (error) {
    console.warn("Error requesting Android notification permission:", error);
  }

  // 2. Request Notification Permissions (iOS / Expo Notifications)
  try {
    await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });
  } catch (error) {
    console.warn("Error requesting notification permissions via Expo:", error);
  }

  // 3. Request Location Permissions
  try {
    if (Platform.OS === "android") {
      const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
      const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
      if (fine && coarse) {
        await PermissionsAndroid.requestMultiple([fine, coarse]);
      }
    }
  } catch (error) {
    console.warn("Error requesting location permissions:", error);
  }

  // 4. Request Storage Permissions
  try {
    if (Platform.OS === "android") {
      const permissionsToRequest: Permission[] = [];

      if (Platform.Version < 33) {
        const read = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const write = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        if (read) permissionsToRequest.push(read);
        if (write) permissionsToRequest.push(write);
      }

      if (permissionsToRequest.length > 0) {
        await PermissionsAndroid.requestMultiple(permissionsToRequest);
      }
    }
  } catch (error) {
    console.warn("Error requesting storage permissions:", error);
  }
};

