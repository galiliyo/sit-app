import { View, Text, Switch } from "react-native";
import { colors } from "../constants/theme";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-4">
      <Text className="text-sm text-foreground">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.muted, true: colors.accent }}
        thumbColor={colors.foreground}
      />
    </View>
  );
}
