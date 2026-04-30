import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Download, History, Info, Settings, User } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SidebarDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      label: "History",
      icon: History,
      onPress: () => {
        props.navigation.closeDrawer();
        router.push("/search"); // Assuming history is part of search or a dedicated page
      },
    },
    {
      label: "Downloads",
      icon: Download,
      onPress: () => {
        props.navigation.closeDrawer();
        // router.push("/downloads");
      },
    },
    {
      label: "Settings",
      icon: Settings,
      onPress: () => {
        props.navigation.closeDrawer();
        // router.push("/settings");
      },
    },
    {
      label: "About",
      icon: Info,
      onPress: () => {
        props.navigation.closeDrawer();
        // router.push("/about");
      },
    },
  ];

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: insets.top + 20 }}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={30} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName} className="font-sans-bold">
                Guest User
              </Text>
              <Text style={styles.userEmail} className="font-sans-regular">
                guest@beats.app
              </Text>
            </View>
          </View>
          <Pressable style={styles.manageAccountBtn}>
            <Text style={styles.manageAccountText} className="font-sans-medium">
              Manage your Google Account
            </Text>
          </Pressable>
        </View>

        {/* HR Line */}
        <View style={styles.separator} />

        {/* Menu Items */}
        <View style={[styles.menuSection, { minHeight: "70%" }]}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [pressed && styles.menuItemPressed]}
              className="flex flex-row my-2 item-center"
              onPress={item.onPress}
            >
              <item.icon size={22} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuLabel} className="font-sans-medium">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Footer info similar to YT Music */}
        <View style={styles.footer}>
          <Text style={styles.footerText} className="font-sans-regular">
            Privacy Policy • Terms of Service
          </Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 15,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
  },
  userEmail: {
    color: "#888",
    fontSize: 14,
  },
  manageAccountBtn: {
    marginTop: 5,
  },
  manageAccountText: {
    color: "#3ea6ff",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
  },
  menuSection: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    // backgroundColor: "red",
    // minHeight: USABLEHEIGHT + 75,
  },
  menuItem: {
    // flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuIcon: {
    marginRight: 20,
  },
  menuLabel: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    marginTop: "auto",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  footerText: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
  },
});
