import { useState, useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Shield, Smartphone } from "lucide-react-native";
import { Section } from "./Section";
import { Row } from "./Row";
import { Chip } from "./Chip";
import { ToggleRow } from "./ToggleRow";
import { TimePicker } from "./TimePicker";
import { colors } from "../constants/theme";
import { MorningBlockSettings } from "../lib/types";

interface Props {
  settings: MorningBlockSettings;
  onChange: (settings: MorningBlockSettings) => void;
}

export function MorningBlockSetup({ settings, onChange }: Props) {
  const [accessibilityOk, setAccessibilityOk] = useState(false);
  const [overlayOk, setOverlayOk] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    checkPermissions();
  }, []);

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
    onChange(updated);
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

  if (Platform.OS !== "android") {
    return (
      <Section title="Morning Block">
        <Row>
          <Text className="text-sm text-muted-foreground">
            Morning Block is only available on Android
          </Text>
        </Row>
      </Section>
    );
  }

  const needsSetup = settings.enabled && (!accessibilityOk || !overlayOk);

  return (
    <Section title="Morning Block">
      <ToggleRow
        label="Enable morning block"
        value={settings.enabled}
        onChange={(v) => syncNative({ ...settings, enabled: v })}
      />

      {settings.enabled && (
        <>
          {/* Permission cards */}
          {needsSetup && (
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
          )}

          {/* Time window */}
          <Row>
            <Text className="text-sm text-foreground">Start time</Text>
            <TimePicker
              value={settings.startTime}
              onChange={(v) => syncNative({ ...settings, startTime: v })}
            />
          </Row>
          <Row>
            <Text className="text-sm text-foreground">End time</Text>
            <TimePicker
              value={settings.endTime}
              onChange={(v) => syncNative({ ...settings, endTime: v })}
            />
          </Row>

          {/* Dismiss mode */}
          <Row>
            <Text className="text-sm text-foreground">Dismiss mode</Text>
            <View className="flex-row items-center gap-2">
              <Chip
                active={settings.dismissMode === "gentle"}
                onPress={() => syncNative({ ...settings, dismissMode: "gentle" })}
              >
                Gentle
              </Chip>
              <Chip
                active={settings.dismissMode === "firm"}
                onPress={() => syncNative({ ...settings, dismissMode: "firm" })}
              >
                Firm
              </Chip>
            </View>
          </Row>

          {/* Blocked apps list */}
          <View>
            <Text className="mb-2 text-xs text-muted-foreground">Blocked apps</Text>
            {settings.blockedApps.map((app) => (
              <View
                key={app.packageName}
                className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-3 mb-1"
              >
                <Text className="text-sm text-foreground">{app.name}</Text>
                <Pressable
                  onPress={() =>
                    syncNative({
                      ...settings,
                      blockedApps: settings.blockedApps.filter(
                        (a) => a.packageName !== app.packageName
                      ),
                    })
                  }
                >
                  <Text className="text-xs text-destructive">Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
    </Section>
  );
}
