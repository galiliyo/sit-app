import { View, Text } from "react-native";

const CARD_BG = "#1a1a1a";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 4,
} as const;

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
    >
      <View className="mb-1">{icon}</View>
      <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
        {value}
      </Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}
