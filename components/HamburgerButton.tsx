import { Pressable } from "react-native";
import { Menu } from "lucide-react-native";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { colors } from "../constants/theme";

export function HamburgerButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      hitSlop={12}
      style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}
    >
      <Menu color={colors.foreground} size={22} />
    </Pressable>
  );
}
