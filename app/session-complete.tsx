import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Flame, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { getData } from "../lib/store";
import { colors } from "../constants/theme";
import { NoiseBackground } from "../components/NoiseBackground";

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
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 32 }}
    >
      <NoiseBackground />
      {/* Check icon */}
      <Animated.View
        entering={ZoomIn.delay(200).springify().stiffness(200)}
        style={{
          height: 96,
          width: 96,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 48,
          backgroundColor: "rgba(54, 166, 110, 0.1)",
        }}
      >
        <Check color={colors.success} size={40} />
      </Animated.View>

      {/* Duration */}
      <Animated.View entering={FadeIn.delay(300)} style={{ alignItems: "center" }}>
        <Text className="text-3xl font-semibold text-foreground">{durationMinutes} minutes</Text>
      </Animated.View>

      {/* Streak */}
      {qualified && streak > 0 && (
        <Animated.View
          entering={FadeInDown.delay(400)}
          className="rounded-2xl bg-card"
          style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 16 }}
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
      <Animated.View entering={FadeIn.delay(600)} style={{ alignItems: "center", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {Array.from({ length: data.streak.weeklyGoal }).map((_, i) => (
            <View
              key={i}
              style={{
                height: 10,
                width: 10,
                borderRadius: 5,
                backgroundColor: i < data.streak.currentWeekCount ? colors.accent : colors.muted,
              }}
            />
          ))}
        </View>
        <Text className="text-xs text-muted-foreground">
          {data.streak.currentWeekCount} of {data.streak.weeklyGoal} this week
        </Text>
      </Animated.View>

      {/* Motivational */}
      <Text className="text-sm text-muted-foreground">Back tomorrow morning</Text>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        style={{
          width: "75%",
          borderWidth: 1,
          borderColor: "rgba(115,115,115,0.3)",
          borderRadius: 16,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text className="text-sm text-muted-foreground">Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}
