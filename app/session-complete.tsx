import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Flame, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { getData } from "../lib/store";
import { colors } from "../constants/theme";

export default function SessionCompleteScreen() {
  const params = useLocalSearchParams<{ minutes: string; seconds: string }>();
  const durationMinutes = parseInt(params.minutes || "0");

  const data = getData();
  const streak = data.streak.currentDailyStreak;
  const qualified = durationMinutes >= data.settings.minimumSitMinutes;

  useEffect(() => {
    if (qualified) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [qualified]);

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-8">
      {/* Check icon */}
      <Animated.View
        entering={ZoomIn.delay(200).springify().stiffness(200)}
        className="h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(54, 166, 110, 0.1)" }}
      >
        <Check color={colors.success} size={40} />
      </Animated.View>

      {/* Duration */}
      <Animated.View entering={FadeIn.delay(300)} className="items-center">
        <Text className="text-3xl font-semibold text-foreground">{durationMinutes} minutes</Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          {qualified ? "Day complete" : "Session recorded"}
        </Text>
      </Animated.View>

      {/* Streak */}
      {qualified && streak > 0 && (
        <Animated.View
          entering={FadeInDown.delay(400)}
          className="flex-row items-center gap-2 rounded-2xl bg-card px-6 py-4"
        >
          <Flame color={colors.accent} size={20} />
          <Text
            className="text-xl text-foreground"
            style={{ fontFamily: "JetBrainsMono_400Regular" }}
          >
            {streak}
          </Text>
          <Text className="text-sm text-muted-foreground">day streak</Text>
        </Animated.View>
      )}

      {/* Week progress dots */}
      <Animated.View entering={FadeIn.delay(600)} className="flex-row items-center gap-1.5">
        {Array.from({ length: data.streak.weeklyGoal }).map((_, i) => (
          <View
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < data.streak.currentWeekCount ? "bg-accent" : "bg-muted"
            }`}
          />
        ))}
        <Text className="ml-2 text-xs text-muted-foreground">
          {data.streak.currentWeekCount} of {data.streak.weeklyGoal} this week
        </Text>
      </Animated.View>

      {/* Motivational */}
      <Text className="text-sm text-muted-foreground">Back tomorrow morning</Text>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        className="w-full max-w-xs rounded-2xl bg-primary py-4 items-center active:opacity-90"
      >
        <Text className="font-semibold text-primary-foreground">Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}
