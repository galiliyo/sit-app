import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { EnsoCircle } from "./EnsoCircle";
import { colors } from "../constants/theme";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ENSO_SIZE = 240;
const PROGRESS_RADIUS = 108;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

interface EnsoButtonProps {
  onPress: () => void;
  label?: string;
  progress?: number; // 0-1 for active session mode
  color?: string;
}

export function EnsoButton({ onPress, label, progress, color }: EnsoButtonProps) {
  const isActive = progress !== undefined;
  const showLabel = label !== undefined;
  const dashOffset = isActive ? PROGRESS_CIRCUMFERENCE * (1 - progress!) : 0;

  const breathScale = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (!isActive) {
      breathScale.value = withRepeat(
        withTiming(1.06, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      breathScale.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]);

  const ensoBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, { stiffness: 300, damping: 20 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { stiffness: 300, damping: 20 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        pressStyle,
        {
          width: ENSO_SIZE,
          height: ENSO_SIZE,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {isActive ? (
        <View style={{ position: "absolute", width: ENSO_SIZE, height: ENSO_SIZE }}>
          <Svg viewBox={`0 0 ${ENSO_SIZE} ${ENSO_SIZE}`} width={ENSO_SIZE} height={ENSO_SIZE}>
            <Circle
              cx={ENSO_SIZE / 2}
              cy={ENSO_SIZE / 2}
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="rgba(232, 228, 222, 0.08)"
              strokeWidth={3}
            />
            <Circle
              cx={ENSO_SIZE / 2}
              cy={ENSO_SIZE / 2}
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="rgba(232, 228, 222, 0.85)"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={`${PROGRESS_CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              rotation={-90}
              origin={`${ENSO_SIZE / 2}, ${ENSO_SIZE / 2}`}
            />
          </Svg>
        </View>
      ) : (
        <AnimatedView
          style={[
            ensoBreathStyle,
            { position: "absolute", width: ENSO_SIZE, height: ENSO_SIZE },
          ]}
        >
          <View
            style={{
              width: ENSO_SIZE,
              height: ENSO_SIZE,
              borderRadius: ENSO_SIZE / 2,
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <EnsoCircle size={ENSO_SIZE} color={color} />
          </View>
        </AnimatedView>
      )}

      {/* Label — only shown when explicitly passed (active session timer) */}
      {showLabel && (
        <Text
          style={{
            fontFamily: "JetBrainsMono_300Light",
            fontSize: 28,
            color: colors.foreground,
            letterSpacing: 2,
          }}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
