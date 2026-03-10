import { Pressable, Text } from "react-native";

interface ChipProps {
  children: React.ReactNode;
  active: boolean;
  onPress: () => void;
}

export function Chip({ children, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-lg px-3 py-1.5 ${
        active ? "bg-accent" : "bg-muted"
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        {children}
      </Text>
    </Pressable>
  );
}
