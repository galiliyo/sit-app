import { View, Text } from "react-native";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <View>
      <Text className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </Text>
      <View className="gap-1">{children}</View>
    </View>
  );
}
