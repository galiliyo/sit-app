import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { GlassCard } from "./GlassCard";
import { colors } from "../constants/theme";

const TRACK_W = 44;
const TRACK_H = 24;
const THUMB_SIZE = 18;
const THUMB_TRAVEL = TRACK_W - THUMB_SIZE - 6; // 6 = 3px padding each side

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.border : colors.muted, { duration: 200 }),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? THUMB_TRAVEL : 0, { duration: 200 }) }],
    backgroundColor: withTiming(value ? colors.accent : colors.foreground, { duration: 200 }),
  }));

  return (
    <GlassCard className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-sm text-foreground">{label}</Text>
      <Pressable onPress={() => onChange(!value)}>
        <Animated.View
          style={[
            trackStyle,
            {
              width: TRACK_W,
              height: TRACK_H,
              borderRadius: TRACK_H / 2,
              justifyContent: "center",
              paddingHorizontal: 3,
            },
          ]}
        >
          <Animated.View
            style={[
              thumbStyle,
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    </GlassCard>
  );
}
