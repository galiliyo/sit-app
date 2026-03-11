import EnsoSvg from "../assets/images/enso-0.svg";
import { colors } from "../constants/theme";

interface EnsoCircleProps {
  size?: number;
  color?: string;
}

export function EnsoCircle({ size = 240, color = colors.accent }: EnsoCircleProps) {
  return <EnsoSvg width={size} height={size} color={color} />;
}
