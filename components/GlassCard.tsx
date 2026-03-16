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
      <View style={styles.bgLayers} pointerEvents="none">
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.tint} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bgLayers: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(40, 40, 40, 0.30)",
  },
});
