import { Pressable, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EnsoButtonProps {
  onPress: () => void;
  label?: string;
  progress?: number; // 0-1 for active session mode
}

const ENSO_PATH =
  "M 75 8 C 110 6, 142 28, 148 65 C 154 102, 132 140, 95 148 C 58 156, 20 134, 10 97 C 0 60, 18 22, 55 12";
const TOTAL_LENGTH = 440;

export function EnsoButton({ onPress, label = "Sit now", progress }: EnsoButtonProps) {
  const isActive = progress !== undefined;
  const dashOffset = isActive ? TOTAL_LENGTH * (1 - progress!) : 0;

  // Breathing animation
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (!isActive) {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      breathScale.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [isActive]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
    opacity: glowOpacity.value,
  }));

  const svgBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isActive ? 1 : (breathScale.value - 1) * 0.4 + 1 }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, { stiffness: 300, damping: 20 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { stiffness: 300, damping: 20 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[pressStyle, { width: 144, height: 144, alignItems: "center", justifyContent: "center" }]}
    >
      {/* Soft glow */}
      <AnimatedView
        style={[
          glowStyle,
          {
            position: "absolute",
            width: 144,
            height: 144,
            borderRadius: 72,
            backgroundColor: "rgba(232, 228, 222, 0.06)",
          },
        ]}
      />

      {/* Enso SVG */}
      <AnimatedView
        style={[
          svgBreathStyle,
          { position: "absolute", width: 144, height: 144 },
        ]}
      >
        <Svg viewBox="0 0 160 160" width={144} height={144}>
          {isActive ? (
            <>
              {/* Background track */}
              <Circle
                cx={80}
                cy={80}
                r={68}
                fill="none"
                stroke="rgba(232, 228, 222, 0.08)"
                strokeWidth={3}
              />
              {/* Progress arc */}
              <Circle
                cx={80}
                cy={80}
                r={68}
                fill="none"
                stroke="rgba(232, 228, 222, 0.85)"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeDasharray={`${TOTAL_LENGTH}`}
                strokeDashoffset={dashOffset}
                rotation={-90}
                origin="80, 80"
              />
            </>
          ) : (
            <Path
              d={ENSO_PATH}
              fill="none"
              stroke="rgba(232, 228, 222, 0.8)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </AnimatedView>

      {/* Label */}
      <Text className="text-lg font-medium tracking-tight text-foreground/90">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
