import { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame, Clock, Sun, Moon, Target, Award, Calendar as CalendarIcon, TrendingUp } from "lucide-react-native";
import { getData, getStats } from "../../lib/store";
import { StatCard } from "../../components/StatCard";
import { HamburgerButton } from "../../components/HamburgerButton";
import { NoiseBackground } from "../../components/NoiseBackground";
import { colors } from "../../constants/theme";

const CARD_BG = "rgba(26, 26, 26, 0.50)";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.025,
  shadowRadius: 8,
  elevation: 2,
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
      <NoiseBackground />
      <HamburgerButton />

      <View className="flex-1 px-6" style={{ marginTop: 76, gap: 12, paddingBottom: 24 }}>
        {/* Main stats grid - flex 1 per row */}
        <View style={{ flex: 1, gap: 8 }}>
          <View className="flex-1 flex-row gap-3">
            <StatCard icon={<Clock color={colors.mutedForeground} size={16} />} value={stats.totalMinutes} label="total minutes" />
            <StatCard icon={<Target color={colors.mutedForeground} size={16} />} value={stats.totalSessions} label="total sessions" />
          </View>
          <View className="flex-1 flex-row gap-3">
            <StatCard icon={<Flame color={colors.accent} size={16} />} value={data.streak.currentDailyStreak} label="current streak" />
            <StatCard icon={<Award color={colors.mutedForeground} size={16} />} value={data.streak.longestDailyStreak} label="longest streak" />
          </View>
          <View className="flex-1 flex-row gap-3">
            <StatCard icon={<Sun color={colors.mutedForeground} size={16} />} value={stats.morningSessions} label="morning sits" />
            <StatCard icon={<Moon color={colors.mutedForeground} size={16} />} value={stats.eveningSessions} label="evening sits" />
          </View>
          <View className="flex-1 flex-row gap-3">
            <StatCard icon={<CalendarIcon color={colors.mutedForeground} size={16} />} value={stats.totalDaysMeditated} label="days meditated" />
            <StatCard icon={<TrendingUp color={colors.mutedForeground} size={16} />} value={stats.averageSessionMinutes} label="avg. minutes" />
          </View>
        </View>

        {/* Weekly chart - 1.5x the height of the cards section */}
        <View
          className="rounded-2xl p-5"
          style={{ flex: 1.5, backgroundColor: CARD_BG, ...CARD_SHADOW }}
        >
          <Text className="mb-2 text-sm text-muted-foreground">Last 7 days</Text>
          <View className="flex-1 flex-row items-end justify-between gap-2">
            {weekData.map((d, i) => (
              <View key={i} className="flex-1 items-center gap-1.5" style={{ height: "100%" }}>
                <View className="flex-1" />
                <View
                  className={`w-full rounded-md ${
                    d.qualified
                      ? "bg-accent"
                      : d.minutes > 0
                      ? "bg-muted-foreground/30"
                      : "bg-muted"
                  }`}
                  style={{ height: `${Math.max((d.minutes / maxMin) * 80, 4)}%` }}
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
