import { View } from "react-native";

interface RowProps {
  children: React.ReactNode;
}

export function Row({ children }: RowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-4">
      {children}
    </View>
  );
}
