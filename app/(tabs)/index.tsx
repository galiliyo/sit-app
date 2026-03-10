import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Flame, Clock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { format, parseISO } from "date-fns";
import { getData, getTodayStr } from "../../lib/store";
import { EnsoButton } from "../../components/EnsoButton";
import { TimerConfig, Preset } from "../../lib/types";
import { colors } from "../../constants/theme";

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

  // Re-read store data every time this screen comes into focus
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32, gap: 32 }}>
        {/* Greeting */}
        <View className="pt-4">
          <Text className="text-sm text-muted-foreground">{greeting}</Text>
          <Text className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {hasSatToday ? "You sat today" : "Today is still open"}
          </Text>
        </View>

        {/* Last session */}
        {lastSession && (
          <View className="rounded-2xl bg-card px-5 py-4">
            <Text className="text-xs text-muted-foreground mb-1">Last session</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`h-2 w-2 rounded-full ${
                    lastSession.qualifiedForDayCredit ? "bg-success" : "bg-destructive"
                  }`}
                />
                <Text className="text-sm text-foreground">
                  {lastSession.durationMinutes} min · {lastSession.sessionType}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground">
                {format(parseISO(lastSession.startTime), "MMM d, h:mm a")}
              </Text>
            </View>
            {!lastSession.qualifiedForDayCredit && (
              <Text className="mt-1 text-xs text-destructive">
                Below {data.settings.minimumSitMinutes}-min minimum — didn't count
              </Text>
            )}
          </View>
        )}

        {/* Sit Now CTA */}
        <View className="items-center gap-5">
          <EnsoButton
            onPress={() => defaultPreset && startWithConfig(presetToConfig(defaultPreset))}
          />
          <Text className="text-xs text-muted-foreground">
            Just {data.settings.minimumSitMinutes} minutes counts
          </Text>
        </View>

        {/* Quick presets */}
        <View className="flex-row justify-center gap-3">
          {quickPresets.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => startWithConfig(presetToConfig(preset))}
              className="rounded-xl bg-secondary px-5 py-2.5 active:bg-muted"
            >
              <Text className="text-sm font-medium text-secondary-foreground">
                {preset.name && !preset.name.match(/^\d+\s*min$/i)
                  ? `${preset.name} · ${preset.duration}m`
                  : `${preset.duration} min`}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push("/timer-setup")}
            className="rounded-xl bg-secondary px-4 py-2.5 active:bg-muted"
          >
            <Text className="text-sm font-medium text-secondary-foreground">Custom</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-card p-4 items-center">
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
          <View className="flex-1 rounded-2xl bg-card p-4 items-center">
            <Text
              className="text-2xl text-foreground"
              style={{ fontFamily: "JetBrainsMono_400Regular" }}
            >
              {todayMinutes}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">mins today</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-card p-4 items-center">
            <Text style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              <Text className="text-2xl text-foreground">{weekCount}</Text>
              <Text className="text-base text-muted-foreground">/{weeklyGoal}</Text>
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">this week</Text>
          </View>
        </View>

        {/* Morning commitment */}
        {data.morningCommitmentTime && (
          <Pressable
            onPress={() => router.push("/timer-setup")}
            className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <Clock color={colors.mutedForeground} size={16} />
              <View>
                <Text className="text-sm text-foreground">Tomorrow morning</Text>
                <Text className="text-xs text-muted-foreground">
                  {data.morningCommitmentTime} AM · {defaultPreset?.duration || 5} min
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Today status */}
        {hasSatToday && (
          <View className="rounded-2xl bg-card px-5 py-4">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-success" />
              <Text className="text-sm text-foreground">
                {todayRecord?.totalSessions} session
                {(todayRecord?.totalSessions || 0) > 1 ? "s" : ""} · {todayMinutes} minutes
              </Text>
            </View>
            <Text className="mt-1 text-xs text-muted-foreground">Streak preserved</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
