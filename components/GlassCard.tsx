import { StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
};

export function GlassCard({ children, style, className }: Props) {
  return (
    <View style={[styles.outer, style]} className={className}>
      <BlurView intensity={40} tint="dark" style={styles.blur} />
      <View style={styles.tint} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40, 40, 40, 0.20)",
  },
});
