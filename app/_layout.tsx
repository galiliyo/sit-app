import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  JetBrainsMono_300Light,
  JetBrainsMono_400Regular,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { initStore } from "../lib/store";
import { configureAudio } from "../lib/bells";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [storeReady, setStoreReady] = useState(false);
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    JetBrainsMono_300Light,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    (async () => {
      await initStore();
      await configureAudio();
      setStoreReady(true);
    })();
  }, []);

  const ready = storeReady && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#cc8c28" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="timer-setup" options={{ presentation: "modal" }} />
        <Stack.Screen name="active-session" options={{ gestureEnabled: false }} />
        <Stack.Screen name="session-complete" options={{ gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
