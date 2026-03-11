import { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame, Clock, Sun, Moon, Target, Award } from "lucide-react-native";
import { getData, getStats } from "../../lib/store";
import { StatCard } from "../../components/StatCard";
import { HamburgerButton } from "../../components/HamburgerButton";
import { colors } from "../../constants/theme";

const CARD_BG = "#1a1a1a";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 4,
} as const;

export default function StatsScreen() {
  const [, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((n) => n + 1), []));

  const data = getData();
  const stats = getStats();

  // Weekly bar chart - last 7 days
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    const record = data.dayRecords[ds];
    return {
      label: d.toLocaleDateString("default", { weekday: "short" }).slice(0, 2),
      minutes: record?.totalMinutes || 0,
      qualified: record?.qualified || false,
    };
  });
  const maxMin = Math.max(...weekData.map((d) => d.minutes), 1);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <HamburgerButton />

      <View className="flex-1 px-6" style={{ marginTop: 64, gap: 20 }}>
        {/* Main stats grid - 2 columns */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard icon={<Clock color={colors.mutedForeground} size={16} />} value={stats.totalMinutes} label="total minutes" />
            <StatCard icon={<Target color={colors.mutedForeground} size={16} />} value={stats.totalSessions} label="total sessions" />
          </View>
          <View className="flex-row gap-3">
            <StatCard icon={<Flame color={colors.accent} size={16} />} value={data.streak.currentDailyStreak} label="current streak" />
            <StatCard icon={<Award color={colors.mutedForeground} size={16} />} value={data.streak.longestDailyStreak} label="longest streak" />
          </View>
          <View className="flex-row gap-3">
            <StatCard icon={<Sun color={colors.mutedForeground} size={16} />} value={stats.morningSessions} label="morning sits" />
            <StatCard icon={<Moon color={colors.mutedForeground} size={16} />} value={stats.eveningSessions} label="evening sits" />
          </View>
        </View>

        {/* Extra stats */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.totalDaysMeditated}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">days meditated</Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.averageSessionMinutes}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">avg. minutes</Text>
          </View>
        </View>

        {/* Weekly chart */}
        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
        >
          <Text className="mb-4 text-sm text-muted-foreground">Last 7 days</Text>
          <View className="flex-row items-end justify-between gap-2" style={{ height: 100 }}>
            {weekData.map((d, i) => (
              <View key={i} className="flex-1 items-center gap-1.5">
                <View
                  className={`w-full rounded-md ${
                    d.qualified
                      ? "bg-accent"
                      : d.minutes > 0
                      ? "bg-muted-foreground/30"
                      : "bg-muted"
                  }`}
                  style={{ height: Math.max((d.minutes / maxMin) * 80, 4) }}
                />
                <Text className="text-[10px] text-muted-foreground">{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Identity line */}
        <Text className="text-center text-sm text-muted-foreground">
          You are becoming someone who sits
        </Text>
      </View>
    </SafeAreaView>
  );
}
