import { usePlayerStore } from "@/src/store/usePlayerStore";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Image } from "expo-image";
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
import UserIcon from "@/assets/app-icons/artist.svg";
import CloseIcon from "@/assets/app-icons/close.svg";
import HistoryIcon from "@/assets/app-icons/history.svg";
import SettingsIcon from "@/assets/app-icons/settings.svg";

export default function SidebarDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setDrawerOpen = usePlayerStore((s) => s.setDrawerOpen);
  const status = useDrawerStatus();

  useEffect(() => {
    setDrawerOpen(status === "open");
  }, [status, setDrawerOpen]);

  const navigateFromDrawer = (path: "/library" | "/setting" | "/about") => {
    props.navigation.closeDrawer();
    setTimeout(() => {
      router.push(path);
    }, 120);
  };

  const menuItems = [
    {
      label: "History",
      icon: HistoryIcon,
      onPress: () => {
        navigateFromDrawer("/library");
      },
    },
    {
      label: "Settings",
      icon: SettingsIcon,
      onPress: () => {
        navigateFromDrawer("/setting");
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
                source={require("../assets/icons/logo-group.png")}
                style={{ width: 32, height: 32, borderRadius: 0 }}
              />
              <Text
                className="text-white text-2xl font-sans-semibold tracking-tight"
                style={styles.brandText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Beats
              </Text>
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
              style={({ pressed }) => [
                styles.menuItemRow,
                pressed && styles.menuItemPressed,
              ]}
              className="flex flex-row my-2"
              onPress={item.onPress}
            >
              <item.icon
                width={22}
                height={22}
                fill="#fff"
                style={styles.menuIcon}
              />
              <Text
                style={styles.menuLabel}
                className="font-sans-medium"
                numberOfLines={1}
              >
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
    flexShrink: 1,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 24,
    includeFontPadding: false,
  },
  userEmail: {
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  manageAccountBtn: {
    marginTop: 5,
  },
  manageAccountText: {
    color: "#3ea6ff",
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
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
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingRight: 12,
    marginBottom: 20,
  },
  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuIcon: {
    marginRight: 20,
  },
  menuLabel: {
    flexShrink: 1,
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
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
    lineHeight: 16,
    includeFontPadding: false,
  },
  brandText: {
    lineHeight: 32,
    includeFontPadding: false,
  },
});
