import { View } from "react-native";
import { GlassCard } from "./GlassCard";

interface RowProps {
  children: React.ReactNode;
}

export function Row({ children }: RowProps) {
  return (
    <GlassCard className="flex-row items-center justify-between px-5 py-4">
      {children}
    </GlassCard>
  );
}
