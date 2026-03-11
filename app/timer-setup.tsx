import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { getData } from "../lib/store";
import { BELL_OPTIONS } from "../lib/bells";
import { TimerConfig } from "../lib/types";
import { BellRow } from "../components/BellRow";
import { ToggleRow } from "../components/ToggleRow";
import { colors } from "../constants/theme";
import { NoiseBackground } from "../components/NoiseBackground";

const bellOptions = [...BELL_OPTIONS];

function migrateBellName(name: string): string {
  if (name === "Kangsê" || name === "Om" || name === "HanChi") return "Root Chakra";
  if (name === "Tingsha") return "Heart Chakra";
  if (BELL_OPTIONS.includes(name as any)) return name;
  return "Root Chakra";
}

export default function TimerSetupScreen() {
  const data = getData();
  const [duration, setDuration] = useState(
    String(data.settings.defaultQuickStartMinutes)
  );
  const [startBell, setStartBell] = useState(
    migrateBellName(data.settings.preferredStartBell)
  );
  const [endBell, setEndBell] = useState(
    migrateBellName(data.settings.preferredEndBell)
  );
  const [intervalBells, setIntervalBells] = useState(data.settings.intervalBellsEnabled);

  const parsedDuration = Math.min(60, Math.max(1, parseInt(duration) || 5));

  const handleStart = () => {
    const config: TimerConfig = {
      duration: parsedDuration,
      startBell,
      endBell,
      intervalBells,
      intervalMinutes: 7,
      ambientSound: null,
    };
    router.push({
      pathname: "/active-session",
      params: { config: JSON.stringify(config) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <NoiseBackground />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} className="mb-6 mt-4 flex-row items-center gap-1">
          <ArrowLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text className="mb-8 text-xl font-semibold text-foreground">Set up your sit</Text>

        {/* Duration */}
        <View className="mb-6">
          <Text className="mb-3 text-sm text-muted-foreground">Duration (minutes)</Text>
          <View className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4">
            <TextInput
              value={duration}
              onChangeText={setDuration}
              onBlur={() => setDuration(String(parsedDuration))}
              keyboardType="number-pad"
              className="w-20 rounded-lg bg-muted px-3 py-2 text-sm text-foreground text-center"
              maxLength={3}
            />
            <Text className="text-sm text-muted-foreground">min</Text>
          </View>
        </View>

        {/* Settings rows */}
        <View className="gap-1">
          <BellRow label="Starting bell" value={startBell} options={bellOptions} onChange={setStartBell} />
          <BellRow label="Ending bell" value={endBell} options={bellOptions} onChange={setEndBell} />
          <ToggleRow label="Interval bells" value={intervalBells} onChange={setIntervalBells} />
          <View className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-4">
            <Text className="text-sm text-foreground">Ambient sound</Text>
            <Text className="text-sm text-muted-foreground">None</Text>
          </View>
        </View>
      </ScrollView>

      {/* Start button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleStart}
          className="w-full rounded-2xl bg-primary py-4 items-center active:opacity-90"
        >
          <Text className="text-lg font-semibold text-primary-foreground">Start</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
