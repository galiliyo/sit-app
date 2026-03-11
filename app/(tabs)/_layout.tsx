import { Drawer } from "expo-router/drawer";
import { Home, Calendar, BarChart3, Settings } from "lucide-react-native";
import { colors } from "../../constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.background,
            width: 260,
          },
          drawerActiveTintColor: colors.accent,
          drawerInactiveTintColor: colors.mutedForeground,
          drawerActiveBackgroundColor: colors.secondary,
          drawerLabelStyle: {
            fontFamily: "DMSans_500Medium",
            fontSize: 15,
            marginLeft: -8,
          },
          drawerItemStyle: {
            borderRadius: 12,
            paddingHorizontal: 4,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: "Calendar",
            drawerIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="stats"
          options={{
            title: "Stats",
            drawerIcon: ({ color, size }) => (
              <BarChart3 color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerIcon: ({ color, size }) => (
              <Settings color={color} size={size} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
