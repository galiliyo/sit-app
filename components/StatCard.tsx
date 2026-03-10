import { View, Text } from "react-native";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl bg-card p-4">
      <View className="mb-1">{icon}</View>
      <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
        {value}
      </Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}
