import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Play, Pause } from "lucide-react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { getData, recordSession } from "../lib/store";
import { playBell } from "../lib/bells";
import { TimerConfig } from "../lib/types";
import { EnsoButton } from "../components/EnsoButton";
import { colors } from "../constants/theme";
import { NoiseBackground } from "../components/NoiseBackground";
import { enableScreenBlock, disableScreenBlock } from "../lib/screenBlock";
import { StatusBar } from "expo-status-bar";

export default function ActiveSessionScreen() {
  const params = useLocalSearchParams<{ config: string }>();
  const config: TimerConfig = params.config
    ? JSON.parse(params.config)
    : { duration: 5, startBell: "Root Chakra", endBell: "Root Chakra", intervalBells: false, intervalMinutes: 7, ambientSound: null };

  const data = getData();
  const warmUpEnabled = data.settings.warmUpEnabled ?? false;
  const warmUpDuration = data.settings.warmUpSeconds ?? 10;

  const [phase, setPhase] = useState<"warmup" | "session">(warmUpEnabled ? "warmup" : "session");
  const [warmUpRemaining, setWarmUpRemaining] = useState(warmUpDuration);

  const totalSeconds = config.duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startBellPlayed = useRef(false);
  const endBellPlayed = useRef(false);
  const lastIntervalBell = useRef(0);

  // Disable Android back button during session
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  // Screen lock: keep awake + immersive mode
  const screenLockEnabled = data.settings.screenLockEnabled ?? true;
  useEffect(() => {
    if (!screenLockEnabled) return;
    activateKeepAwakeAsync();
    enableScreenBlock();
    return () => {
      deactivateKeepAwake();
      disableScreenBlock();
    };
  }, [screenLockEnabled]);

  // Play start bell when session phase begins
  useEffect(() => {
    if (phase === "session" && !startBellPlayed.current) {
      startBellPlayed.current = true;
      playBell(config.startBell);
    }
  }, [phase, config.startBell]);

  // Warm-up countdown
  useEffect(() => {
    if (phase !== "warmup") return;
    const id = setInterval(() => {
      setWarmUpRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setPhase("session");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Session countdown
  useEffect(() => {
    if (phase !== "session") return;
    if (!paused && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, remaining, phase]);

  // Interval bells: every 10 minutes + 1 minute warning
  const oneMinWarningPlayed = useRef(false);
  useEffect(() => {
    if (phase !== "session" || !config.intervalBells || paused || remaining <= 0) return;
    const elapsed = totalSeconds - remaining;

    // 10-minute interval bells
    const INTERVAL_SECS = 10 * 60;
    const currentInterval = Math.floor(elapsed / INTERVAL_SECS);
    if (currentInterval > 0 && currentInterval !== lastIntervalBell.current) {
      lastIntervalBell.current = currentInterval;
      playBell(config.startBell);
    }

    // 1-minute warning bell (only if session is longer than 2 min to avoid overlap with end bell)
    if (remaining === 60 && totalSeconds > 120 && !oneMinWarningPlayed.current) {
      oneMinWarningPlayed.current = true;
      playBell(config.startBell);
    }
  }, [remaining, phase, paused, config, totalSeconds]);

  // End bell + auto-finish
  useEffect(() => {
    if (phase === "session" && remaining === 0 && !endBellPlayed.current) {
      endBellPlayed.current = true;
      playBell(config.endBell);
      const t = setTimeout(() => handleFinish(totalSeconds), 2500);
      return () => clearTimeout(t);
    }
  }, [remaining, phase]);

  const elapsed = totalSeconds - remaining;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const bellsRemaining = config.intervalBells
    ? Math.floor(remaining / (config.intervalMinutes * 60))
    : 0;

  const handleFinish = async (elapsedSecs: number) => {
    await disableScreenBlock();
    const elapsedMinutes = Math.floor(elapsedSecs / 60);
    await recordSession(elapsedMinutes, elapsedSecs, config);
    router.replace({
      pathname: "/session-complete",
      params: { minutes: String(elapsedMinutes), seconds: String(elapsedSecs) },
    });
  };

  const handleDiscard = async () => {
    await disableScreenBlock();
    router.replace("/(tabs)");
  };

  // Warm-up UI
  if (phase === "warmup") {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <StatusBar hidden />
        <NoiseBackground />
        <Text className="text-sm text-muted-foreground mb-4">Prepare yourself</Text>
        <Text
          className="text-8xl text-accent"
          style={{ fontFamily: "JetBrainsMono_300Light" }}
        >
          {warmUpRemaining}
        </Text>
        <Text className="mt-6 text-sm text-muted-foreground">Session begins shortly</Text>
        <Pressable onPress={() => setPhase("session")} className="mt-8">
          <Text className="text-sm text-muted-foreground underline">Skip warm-up</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-between px-6 py-8">
      <StatusBar hidden />
      <NoiseBackground />
      <Text className="text-sm text-muted-foreground">Meditation</Text>

      <View className="items-center gap-3">
        <EnsoButton
          onPress={() => remaining > 0 && setPaused(!paused)}
          label={`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
          progress={progress}
        />
        {config.intervalBells && remaining > 0 && (
          <Text className="text-sm text-muted-foreground">
            {bellsRemaining} bell{bellsRemaining !== 1 ? "s" : ""} remaining
          </Text>
        )}
        {remaining === 0 && <Text className="text-sm text-accent">Session complete</Text>}
      </View>

      <View className="w-full items-center gap-4">
        {remaining > 0 && (
          <Pressable
            onPress={() => setPaused(!paused)}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ borderWidth: 1, borderColor: "rgba(115,115,115,0.4)" }}
          >
            {paused ? (
              <Play color={colors.mutedForeground} size={20} style={{ marginLeft: 2 }} />
            ) : (
              <Pause color={colors.mutedForeground} size={20} />
            )}
          </Pressable>
        )}

        <Pressable
          onPress={() => handleFinish(elapsed)}
          className="w-full rounded-2xl py-3 items-center"
          style={{ borderWidth: 1, borderColor: "rgba(115,115,115,0.3)" }}
        >
          <Text className="text-sm text-muted-foreground">Finish</Text>
        </Pressable>
        <Pressable onPress={handleDiscard}>
          <Text className="text-sm text-muted-foreground">Discard session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
