import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight, Volume2 } from "lucide-react-native";
import { previewBell } from "../lib/bells";
import { colors } from "../constants/theme";

interface BellRowProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}

export function BellRow({ label, value, options, onChange }: BellRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between rounded-2xl bg-card px-5 py-4"
      >
        <Text className="text-sm text-foreground">{label}</Text>
        <View className="flex-row items-center gap-2">
          {value !== "None" && (
            <Pressable
              onPress={() => previewBell(value)}
              className="rounded-lg p-1"
            >
              <Volume2 color={colors.mutedForeground} size={16} />
            </Pressable>
          )}
          <Text className="text-sm text-accent">{value}</Text>
          <ChevronRight
            color={colors.mutedForeground}
            size={16}
            style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}
          />
        </View>
      </Pressable>
      {open && (
        <View className="mt-1 flex-row flex-wrap gap-2 px-2 py-2">
          {options.map((o) => (
            <Pressable
              key={o}
              onPress={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`rounded-lg px-3 py-2 ${
                o === value ? "bg-accent" : "bg-muted"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  o === value ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {o}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
