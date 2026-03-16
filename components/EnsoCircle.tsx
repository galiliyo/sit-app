import { View } from "react-native";
import EnsoSvg from "../assets/images/enso-0.svg";
import { colors } from "../constants/theme";

interface EnsoCircleProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export function EnsoCircle({ size = 240, color = colors.accent, opacity = 0.7 }: EnsoCircleProps) {
  return (
    <View style={{ width: size, height: size, opacity }}>
      <EnsoSvg width={size} height={size} color={color} />
    </View>
  );
}
