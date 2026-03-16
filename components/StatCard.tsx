import { View, Text } from "react-native";

const CARD_BG = "rgba(26, 26, 26, 0.50)";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.025,
  shadowRadius: 8,
  elevation: 2,
} as const;

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-2xl p-3"
      style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
    >
      <View className="mb-1.5 pl-1">{icon}</View>
      <View className="items-center">
        <Text
          className="text-2xl text-foreground"
          style={{ fontFamily: "JetBrainsMono_400Regular" }}
        >
          {value}
        </Text>
        <Text className="mt-1 text-[11px] text-muted-foreground">{label}</Text>
      </View>
    </View>
  );
}
