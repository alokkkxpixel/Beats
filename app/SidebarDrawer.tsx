import { Image } from "expo-image";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import SVGs
import HistoryIcon from "@/assets/app-icons/history.svg";
import DownloadIcon from "@/assets/app-icons/download.svg";
import SettingsIcon from "@/assets/app-icons/settings.svg";
import AboutIcon from "@/assets/app-icons/about.svg";
import CloseIcon from "@/assets/app-icons/close.svg";
import UserIcon from "@/assets/app-icons/artist.svg";

export default function SidebarDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setDrawerOpen = usePlayerStore((s) => s.setDrawerOpen);
  const status = useDrawerStatus();

  useEffect(() => {
    setDrawerOpen(status === "open");
  }, [status, setDrawerOpen]);

  const menuItems = [
    {
      label: "History",
      icon: HistoryIcon,
      onPress: () => {
        props.navigation.closeDrawer();
        router.push("/library"); // Assuming history is part of library page !!!
      },
    },
    {
      label: "Downloads",
      icon: DownloadIcon,
      onPress: () => {
        props.navigation.closeDrawer();
        // router.push("/downloads");
      },
    },
    {
      label: "Settings",
      icon: SettingsIcon,
      onPress: () => {
        // props.navigation.closeDrawer();
        router.push("/setting");
      },
    },
    {
      label: "About",
      icon: AboutIcon,
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
        <View className="mb-10 px-2">
          <View className="flex flex-row items-center gap-5">
            <CloseIcon
              width={27}
              height={27}
              fill={"#fff"}
              onPress={() => props.navigation.closeDrawer()}
            />
            <View className="flex-row items-center gap-3">
              <Image
                source={require("../assets/icons/playstore.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
              />
              <Text className="text-white text-2xl font-bold tracking-tight">Beats</Text>
            </View>
          </View>
        </View>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <UserIcon width={30} height={30} fill="#fff" />
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
        <View style={[styles.menuSection, { minHeight: "60%" }]}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [pressed && styles.menuItemPressed]}
              className="flex flex-row mb-5 item-center"
              onPress={item.onPress}
            >
              <item.icon width={22} height={22} fill="#fff" style={styles.menuIcon} />
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
    zIndex: 1000,
  },
  profileSection: {
    paddingHorizontal: 10,
    marginBottom: 20,
    // backgroundColor: "red",
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
