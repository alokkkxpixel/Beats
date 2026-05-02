import { Drawer } from "expo-router/drawer";
import SidebarDrawer from "../SidebarDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <SidebarDrawer {...props} />}
      screenOptions={{
        drawerPosition: "right",
        headerShown: false,
        drawerType: "slide",
      }}
    >
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="music-lang-change" />
    </Drawer>
  );
}
