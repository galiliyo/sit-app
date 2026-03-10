import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Switch } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Preset } from "../lib/types";
import { BELL_OPTIONS } from "../lib/bells";
import { BellRow } from "./BellRow";
import { ToggleRow } from "./ToggleRow";
import { colors } from "../constants/theme";

interface PresetEditorProps {
  preset: Preset;
  onSave: (preset: Preset) => void;
  onCancel: () => void;
}

export function PresetEditor({ preset, onSave, onCancel }: PresetEditorProps) {
  const [draft, setDraft] = useState<Preset>({ ...preset });
  const [durationText, setDurationText] = useState(String(draft.duration));

  const bellOptions = [...BELL_OPTIONS];

  return (
    <ScrollView
      className="flex-1 bg-background px-6"
      contentContainerStyle={{ paddingBottom: 32, gap: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onCancel} className="flex-row items-center gap-1 pt-4">
        <ArrowLeft color={colors.mutedForeground} size={16} />
        <Text className="text-sm text-muted-foreground">Back</Text>
      </Pressable>

      <Text className="text-lg font-semibold text-foreground">
        {preset.name ? "Edit preset" : "New preset"}
      </Text>

      {/* Name */}
      <View>
        <Text className="mb-2 text-xs text-muted-foreground">Name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
          className="w-full rounded-2xl bg-card px-5 py-4 text-sm text-foreground"
          placeholder="e.g. Morning sit"
          placeholderTextColor={colors.mutedForeground}
          maxLength={20}
        />
      </View>

      {/* Duration */}
      <View>
        <Text className="mb-2 text-xs text-muted-foreground">Duration (minutes)</Text>
        <View className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4">
          <TextInput
            value={durationText}
            onChangeText={setDurationText}
            onBlur={() => {
              const val = Math.min(60, Math.max(1, parseInt(durationText) || 5));
              setDraft((d) => ({ ...d, duration: val }));
              setDurationText(String(val));
            }}
            keyboardType="number-pad"
            className="w-20 rounded-lg bg-muted px-3 py-2 text-sm text-foreground text-center"
            maxLength={3}
          />
          <Text className="text-sm text-muted-foreground">min</Text>
        </View>
      </View>

      {/* Bells */}
      <View className="gap-1">
        <BellRow
          label="Starting bell"
          value={draft.startBell}
          options={bellOptions}
          onChange={(v) => setDraft((d) => ({ ...d, startBell: v }))}
        />
        <BellRow
          label="Ending bell"
          value={draft.endBell}
          options={bellOptions}
          onChange={(v) => setDraft((d) => ({ ...d, endBell: v }))}
        />
      </View>

      {/* Interval bells */}
      <ToggleRow
        label="Interval bells"
        value={draft.intervalBells}
        onChange={(v) => setDraft((d) => ({ ...d, intervalBells: v }))}
      />

      {/* Quick start toggle */}
      <View className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4">
        <Switch
          value={draft.quickStart}
          onValueChange={(v) => setDraft((d) => ({ ...d, quickStart: v }))}
          trackColor={{ false: colors.muted, true: colors.accent }}
          thumbColor={colors.foreground}
        />
        <View>
          <Text className="text-sm text-foreground">Show in quick start</Text>
          <Text className="text-xs text-muted-foreground">Replaces oldest if 3 already set</Text>
        </View>
      </View>

      {/* Save */}
      <Pressable
        onPress={() => onSave(draft)}
        className="w-full rounded-2xl bg-accent py-3.5 items-center active:opacity-90"
      >
        <Text className="font-semibold text-accent-foreground">Save preset</Text>
      </Pressable>
    </ScrollView>
  );
}
