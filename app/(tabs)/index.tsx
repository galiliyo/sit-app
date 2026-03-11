import { format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { Flame } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnsoButton } from "../../components/EnsoButton";
import { HamburgerButton } from "../../components/HamburgerButton";
import { colors } from "../../constants/theme";
import { getData, getTodayStr } from "../../lib/store";
import { Preset, TimerConfig } from "../../lib/types";

const CARD_BG = "#1a1a1a";

const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 4,
} as const;

function presetToConfig(preset: Preset): TimerConfig {
  return {
    duration: preset.duration,
    startBell: preset.startBell,
    endBell: preset.endBell,
    intervalBells: preset.intervalBells,
    intervalMinutes: preset.intervalMinutes,
    ambientSound: preset.ambientSound,
  };
}

export default function HomeScreen() {
  const [, setRefresh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefresh((n) => n + 1);
    }, [])
  );

  const data = getData();
  const todayStr = getTodayStr();
  const todayRecord = data.dayRecords[todayStr];
  const hasSatToday = !!todayRecord?.qualified;
  const todayMinutes = todayRecord?.totalMinutes || 0;
  const streak = data.streak.currentDailyStreak;
  const weekCount = data.streak.currentWeekCount;
  const weeklyGoal = data.streak.weeklyGoal;

  const quickPresets = (data.presets || []).filter((p) => p.quickStart).slice(0, 3);
  const defaultPreset = quickPresets[0];

  const lastSession = data.sessions.length > 0 ? data.sessions[data.sessions.length - 1] : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const startWithConfig = (config: TimerConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/active-session",
      params: { config: JSON.stringify(config) },
    });
  };

  const formatLastSessionTime = () => {
    if (!lastSession) return "";
    const sessionDate = parseISO(lastSession.startTime);
    const now = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    if (format(sessionDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) return "today";
    if (format(sessionDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "yesterday";
    return format(sessionDate, "MMM d");
  };

  const { height: screenHeight } = useWindowDimensions();
  const bottomMargin = screenHeight * 0.05;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* Hamburger — sticky 24px from top-left */}
      <HamburgerButton />

      <View className="flex-1 px-6">
        {/* Greeting — starts 20px below hamburger row */}
        <View style={{ marginTop: 64 }}>
          <Text
            className="text-muted-foreground"
            style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 20 }}
          >
            {greeting}
          </Text>
          <Text
            className="mt-1 tracking-tight text-foreground"
            style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 30 }}
          >
            {hasSatToday ? "You sat today" : "Today is still open"}
          </Text>
        </View>

        {/* Enso CTA */}
        <View className="items-center" style={{ marginTop: 56 }}>
          <EnsoButton
            onPress={() => defaultPreset && startWithConfig(presetToConfig(defaultPreset))}
            color={hasSatToday ? colors.success : colors.accent}
          />
        </View>

        {/* Duration presets */}
        <View className="flex-row justify-center" style={{ marginTop: 28, gap: 28 }}>
          {quickPresets.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => startWithConfig(presetToConfig(preset))}
              className="active:opacity-70"
            >
              <Text className="text-base text-foreground opacity-60">
                {preset.duration} min
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push("/timer-setup")}
            className="active:opacity-70"
          >
            <Text className="text-base text-foreground opacity-60">Custom</Text>
          </Pressable>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Bottom section: stats + last session */}
        <View style={{ gap: 12, paddingBottom: bottomMargin }}>
          {/* Stats row */}
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
            >
              <View className="flex-row items-center gap-1">
                <Flame color={colors.accent} size={16} />
                <Text
                  className="text-2xl text-foreground"
                  style={{ fontFamily: "JetBrainsMono_400Regular" }}
                >
                  {streak}
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-muted-foreground">day streak</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
            >
              <Text
                className="text-2xl text-foreground"
                style={{ fontFamily: "JetBrainsMono_400Regular" }}
              >
                {todayMinutes}
              </Text>
              <Text className="mt-1 text-[11px] text-muted-foreground">mins today</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
            >
              <Text style={{ fontFamily: "JetBrainsMono_400Regular" }}>
                <Text className="text-2xl text-foreground">{weekCount}</Text>
                <Text className="text-base text-muted-foreground">/{weeklyGoal}</Text>
              </Text>
              <Text className="mt-1 text-[11px] text-muted-foreground">this week</Text>
            </View>
          </View>

          {/* Last Session */}
          {lastSession && (
            <View
              className="flex-row items-center justify-between rounded-2xl px-5 py-3.5"
              style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
            >
              <Text className="text-sm text-muted-foreground">Last Session</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className={`h-2.5 w-2.5 rounded-full ${lastSession.qualifiedForDayCredit ? "bg-success" : "bg-destructive"}`}
                />
                <Text className="text-sm text-muted-foreground">
                  {lastSession.durationMinutes}min, {formatLastSessionTime()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
