import { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame, Clock, Sun, Moon, Target, Award } from "lucide-react-native";
import { getData, getStats } from "../../lib/store";
import { StatCard } from "../../components/StatCard";
import { colors } from "../../constants/theme";

export default function StatsScreen() {
  const [, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((n) => n + 1), []));

  const data = getData();
  const stats = getStats();
  const milestones = data.milestones.filter((m) => m.achieved);

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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32, gap: 24 }}>
        <Text className="pt-6 text-xl font-semibold text-foreground">Stats</Text>

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
          <View className="flex-1 rounded-2xl bg-card p-4 items-center">
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.totalDaysMeditated}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">days meditated</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-card p-4 items-center">
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.averageSessionMinutes}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">avg. minutes</Text>
          </View>
        </View>

        {/* Weekly chart */}
        <View className="rounded-2xl bg-card p-5">
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

        {/* Milestones */}
        {milestones.length > 0 && (
          <View>
            <Text className="mb-3 text-sm text-muted-foreground">Milestones</Text>
            <View className="gap-2">
              {milestones.map((m) => (
                <View key={m.id} className="flex-row items-center gap-3 rounded-2xl bg-card px-4 py-3">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(204, 140, 40, 0.1)" }}
                  >
                    <Award color={colors.accent} size={16} />
                  </View>
                  <View>
                    <Text className="text-sm text-foreground">{m.title}</Text>
                    <Text className="text-xs text-muted-foreground">{m.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
