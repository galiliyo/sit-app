import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { ChevronLeft, ChevronRight, Flame, Award } from "lucide-react-native";
import { getData } from "../../lib/store";
import { StatCard } from "../../components/StatCard";
import { HamburgerButton } from "../../components/HamburgerButton";
import { NoiseBackground } from "../../components/NoiseBackground";
import { colors } from "../../constants/theme";

const WEEK_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const CARD_BG = "rgba(26, 26, 26, 0.50)";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.025,
  shadowRadius: 8,
  elevation: 2,
} as const;

export default function CalendarScreen() {
  const [, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((n) => n + 1), []));

  const data = getData();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday start

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedRecord = selectedDay ? data.dayRecords[selectedDay] : null;

  function dayStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <NoiseBackground />
      <HamburgerButton />

      <View className="flex-1 px-6" style={{ marginTop: 76, gap: 24 }}>
        {/* Month nav */}
        <View className="flex-row items-center justify-between">
          <Pressable onPress={prev} className="p-2">
            <ChevronLeft color={colors.mutedForeground} size={20} />
          </Pressable>
          <Text className="text-sm font-medium text-foreground">{monthName}</Text>
          <Pressable onPress={next} className="p-2">
            <ChevronRight color={colors.mutedForeground} size={20} />
          </Pressable>
        </View>

        {/* Week headers */}
        <View className="flex-row">
          {WEEK_HEADERS.map((d) => (
            <View key={d} style={{ width: "14.28%" }} className="items-center">
              <Text className="text-[11px] text-muted-foreground">{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View className="flex-row flex-wrap">
          {days.map((day, i) => {
            if (!day) return <View key={i} style={{ width: "14.28%", height: 40 }} />;
            const ds = dayStr(day);
            const record = data.dayRecords[ds];
            const isToday = ds === todayStr;
            const isQualified = record?.qualified;
            const isSelected = ds === selectedDay;

            return (
              <View key={i} style={{ width: "14.28%" }} className="items-center py-0.5">
                <Pressable
                  onPress={() => setSelectedDay(ds === selectedDay ? null : ds)}
                  className={`h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-accent"
                      : isQualified
                      ? "bg-success/15"
                      : ""
                  }`}
                  style={
                    isToday && !isSelected
                      ? { borderWidth: 1, borderColor: "rgba(204, 140, 40, 0.3)" }
                      : undefined
                  }
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "text-accent-foreground"
                        : isQualified
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </Text>
                  {isQualified && !isSelected && (
                    <View className="absolute bottom-1 h-1 w-1 rounded-full bg-success" />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Selected day detail */}
        {selectedDay && (
          <View
            className="rounded-2xl px-5 py-4"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text className="text-sm font-medium text-foreground">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("default", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {selectedRecord ? (
              <View className="mt-2 gap-1">
                <Text className="text-sm text-muted-foreground">
                  {selectedRecord.totalSessions} session
                  {selectedRecord.totalSessions > 1 ? "s" : ""} · {selectedRecord.totalMinutes}{" "}
                  minutes
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {selectedRecord.qualified
                    ? "Counted toward streak"
                    : "Below minimum threshold"}
                </Text>
              </View>
            ) : (
              <Text className="mt-2 text-sm text-muted-foreground">No sessions</Text>
            )}
          </View>
        )}

        {/* Streak cards */}
        <View className="flex-row gap-3">
          <StatCard icon={<Flame color={colors.accent} size={16} />} value={data.streak.currentDailyStreak} label="current streak" />
          <StatCard icon={<Award color={colors.mutedForeground} size={16} />} value={data.streak.longestDailyStreak} label="longest streak" />
        </View>

      </View>
    </SafeAreaView>
  );
}
