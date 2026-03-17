import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Shield, Smartphone } from "lucide-react-native";
import { getData, updateData } from "../lib/store";
import { NoiseBackground } from "../components/NoiseBackground";
import { GlassCard } from "../components/GlassCard";
import { Section } from "../components/Section";
import { Row } from "../components/Row";
import { Chip } from "../components/Chip";
import { ToggleRow } from "../components/ToggleRow";
import { TimePicker } from "../components/TimePicker";
import { colors } from "../constants/theme";
import { MorningBlockSettings } from "../lib/types";

export default function MorningBlockSettingsScreen() {
  const data = getData();
  const [settings, setSettings] = useState<MorningBlockSettings>(data.morningBlock);
  const [accessibilityOk, setAccessibilityOk] = useState(false);
  const [overlayOk, setOverlayOk] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    checkPermissions();
  }, []);

  // Auto-save on change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateData((d) => ({ ...d, morningBlock: settings }));
    syncNative(settings);
  }, [settings]);

  const checkPermissions = async () => {
    if (Platform.OS !== "android") return;
    try {
      const MorningBlockModule = require("../modules/morning-block").default;
      const acc = await MorningBlockModule.isAccessibilityEnabled();
      const ovl = await MorningBlockModule.isOverlayEnabled();
      setAccessibilityOk(acc);
      setOverlayOk(ovl);
    } catch {}
  };

  const openAccessibility = () => {
    try {
      const MorningBlockModule = require("../modules/morning-block").default;
      MorningBlockModule.openAccessibilitySettings();
    } catch {}
  };

  const requestOverlay = () => {
    try {
      const MorningBlockModule = require("../modules/morning-block").default;
      MorningBlockModule.requestOverlayPermission();
    } catch {}
  };

  const syncNative = (updated: MorningBlockSettings) => {
    if (Platform.OS !== "android") return;
    try {
      const MorningBlockModule = require("../modules/morning-block").default;
      MorningBlockModule.configure(
        JSON.stringify({
          ...updated,
          blockedApps: updated.blockedApps.map((a) => a.packageName),
        })
      );
    } catch {}
  };

  const needsSetup = settings.enabled && (!accessibilityOk || !overlayOk);

  if (Platform.OS !== "android") {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
        <NoiseBackground />
        <View className="flex-1 px-6" style={{ paddingTop: 16 }}>
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-6">
            <ArrowLeft color={colors.mutedForeground} size={16} />
            <Text className="text-sm text-muted-foreground">Back</Text>
          </Pressable>
          <Text
            className="text-foreground mb-6"
            style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 24 }}
          >
            Morning Block
          </Text>
          <Text className="text-sm text-muted-foreground">
            Morning Block is only available on Android
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <NoiseBackground />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80, gap: 20 }}
      >
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1">
          <ArrowLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text
          className="text-foreground"
          style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 24 }}
        >
          Morning Block
        </Text>

        <Text className="text-xs text-muted-foreground">
          Block distracting apps until you complete your morning sit
        </Text>

        {/* Enable toggle */}
        <Section title="General">
          <ToggleRow
            label="Enable morning block"
            value={settings.enabled}
            onChange={(v) => setSettings((s) => ({ ...s, enabled: v }))}
          />
        </Section>

        {settings.enabled && (
          <>
            {/* Permission cards */}
            {needsSetup && (
              <Section title="Setup required">
                <View className="gap-2">
                  {!accessibilityOk && (
                    <Pressable
                      onPress={openAccessibility}
                      className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4"
                    >
                      <Shield color={colors.accent} size={18} />
                      <View className="flex-1">
                        <Text className="text-sm text-foreground">Enable Accessibility Service</Text>
                        <Text className="text-xs text-muted-foreground">
                          Required to detect when blocked apps open
                        </Text>
                      </View>
                    </Pressable>
                  )}
                  {!overlayOk && (
                    <Pressable
                      onPress={requestOverlay}
                      className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4"
                    >
                      <Smartphone color={colors.accent} size={18} />
                      <View className="flex-1">
                        <Text className="text-sm text-foreground">Allow overlay permission</Text>
                        <Text className="text-xs text-muted-foreground">
                          Required to show the block screen over other apps
                        </Text>
                      </View>
                    </Pressable>
                  )}
                  <Pressable onPress={checkPermissions}>
                    <Text className="text-xs text-accent text-center mt-1">
                      Tap to re-check permissions
                    </Text>
                  </Pressable>
                </View>
              </Section>
            )}

            {/* Time window */}
            <Section title="Block window">
              <Row>
                <Text className="text-sm text-foreground">Start time</Text>
                <TimePicker
                  value={settings.startTime}
                  onChange={(v) => setSettings((s) => ({ ...s, startTime: v }))}
                />
              </Row>
              <Row>
                <Text className="text-sm text-foreground">End time</Text>
                <TimePicker
                  value={settings.endTime}
                  onChange={(v) => setSettings((s) => ({ ...s, endTime: v }))}
                />
              </Row>
            </Section>

            {/* Block severity */}
            <Section title="Block severity">
              <Row>
                <Text className="text-sm text-foreground">Mode</Text>
                <View className="flex-row items-center gap-2">
                  <Chip
                    active={settings.dismissMode === "gentle"}
                    onPress={() => setSettings((s) => ({ ...s, dismissMode: "gentle" }))}
                  >
                    Gentle
                  </Chip>
                  <Chip
                    active={settings.dismissMode === "firm"}
                    onPress={() => setSettings((s) => ({ ...s, dismissMode: "firm" }))}
                  >
                    Firm
                  </Chip>
                </View>
              </Row>
              <Text className="px-1 text-xs text-muted-foreground">
                {settings.dismissMode === "gentle"
                  ? "Tap anywhere to dismiss the block screen"
                  : "Must type a phrase to dismiss — harder to give in"}
              </Text>
            </Section>

            {/* Blocked apps */}
            <Section title="Blocked apps">
              {settings.blockedApps.map((app) => (
                <GlassCard
                  key={app.packageName}
                  className="flex-row items-center justify-between px-5 py-3"
                >
                  <Text className="text-sm text-foreground">{app.name}</Text>
                  <Pressable
                    onPress={() =>
                      setSettings((s) => ({
                        ...s,
                        blockedApps: s.blockedApps.filter(
                          (a) => a.packageName !== app.packageName
                        ),
                      }))
                    }
                  >
                    <Text className="text-xs text-destructive">Remove</Text>
                  </Pressable>
                </GlassCard>
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
