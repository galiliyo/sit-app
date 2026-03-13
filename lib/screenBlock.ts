import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export async function enableScreenBlock(): Promise<void> {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
  }
}

export async function disableScreenBlock(): Promise<void> {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("visible");
  }
}
