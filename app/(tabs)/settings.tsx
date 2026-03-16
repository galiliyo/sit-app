import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { getData, updateData } from "../../lib/store";
import { HamburgerButton } from "../../components/HamburgerButton";
import { NoiseBackground } from "../../components/NoiseBackground";
import { Preset } from "../../lib/types";
import { Section } from "../../components/Section";
import { Row } from "../../components/Row";
import { GlassCard } from "../../components/GlassCard";
import { Chip } from "../../components/Chip";
import { ToggleRow } from "../../components/ToggleRow";
import { PresetEditor } from "../../components/PresetEditor";
import { TimePicker } from "../../components/TimePicker";
import { scheduleReminders } from "../../lib/notifications";
import { colors } from "../../constants/theme";

export default function SettingsScreen() {
  const [, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((n) => n + 1), []));

  const data = getData();
  const [settings, setSettings] = useState({
    ...data.settings,
    warmUpEnabled: data.settings.warmUpEnabled ?? false,
    warmUpSeconds: data.settings.warmUpSeconds ?? 10,
    screenLockEnabled: data.settings.screenLockEnabled ?? true,
  });
  const [presets, setPresets] = useState<Preset[]>(data.presets || []);
  const [reminders, setReminders] = useState(data.reminders);
  const [commitment, setCommitment] = useState(data.morningCommitmentTime || "07:30");
  const [minSitText, setMinSitText] = useState(String(settings.minimumSitMinutes));
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save all changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateData((d) => ({ ...d, settings, presets, reminders, morningCommitmentTime: commitment }));
    scheduleReminders(reminders);
  }, [settings, presets, reminders, commitment]);

const handleSavePreset = (preset: Preset) => {
    let updated = [...presets];
    const idx = updated.findIndex((p) => p.id === preset.id);
    if (idx >= 0) {
      updated[idx] = preset;
    } else {
      updated.push(preset);
    }
    if (preset.quickStart) {
      const qsPresets = updated.filter((p) => p.quickStart);
      if (qsPresets.length > 3) {
        const toDisable = qsPresets.find((p) => p.id !== preset.id);
        if (toDisable) {
          const di = updated.findIndex((p) => p.id === toDisable.id);
          updated[di] = { ...updated[di], quickStart: false };
        }
      }
    }
    setPresets(updated);
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
  };

  const handleNewPreset = () => {
    setEditingPreset({
      id: `p_${Date.now()}`,
      name: "",
      duration: 10,
      startBell: "Root Chakra",
      endBell: "Root Chakra",
      intervalBells: false,
      intervalMinutes: 7,
      ambientSound: null,
      quickStart: true,
    });
  };

  if (editingPreset) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
        <NoiseBackground />
        <PresetEditor
          preset={editingPreset}
          onSave={handleSavePreset}
          onCancel={() => setEditingPreset(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <NoiseBackground />
      <HamburgerButton />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 76, paddingBottom: 80, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Presets */}
          <Section title="Presets">
            <Text className="mb-2 text-xs text-muted-foreground">
              Up to 3 can appear on your home screen as quick-start buttons
            </Text>
            {presets.map((preset) => (
              <GlassCard
                key={preset.id}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center gap-3">
                  {preset.quickStart && <View className="h-2 w-2 rounded-full bg-accent" />}
                  <View>
                    <Text className="text-sm text-foreground">
                      {preset.name || `${preset.duration} min`}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {preset.duration}m · {preset.startBell}
                      {preset.intervalBells ? " · intervals" : ""}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable onPress={() => setEditingPreset(preset)} className="rounded-lg p-1.5">
                    <Pencil color={colors.mutedForeground} size={14} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeletePreset(preset.id)}
                    className="rounded-lg p-1.5"
                  >
                    <Trash2 color={colors.mutedForeground} size={14} />
                  </Pressable>
                </View>
              </GlassCard>
            ))}
            <Pressable onPress={handleNewPreset}>
              <GlassCard className="flex-row items-center justify-center gap-2 px-5 py-4">
              <Plus color={colors.mutedForeground} size={16} />
              <Text className="text-sm text-muted-foreground">Add preset</Text>
              </GlassCard>
            </Pressable>
          </Section>

          {/* Goals */}
          <Section title="Goals">
            <Row>
              <Text className="text-sm text-foreground">Weekly goal</Text>
              <View className="flex-row items-center gap-2">
                {[3, 5, 7].map((n) => (
                  <Chip
                    key={n}
                    active={settings.weeklyGoal === n}
                    onPress={() => setSettings((s) => ({ ...s, weeklyGoal: n }))}
                  >
                    {n}/wk
                  </Chip>
                ))}
              </View>
            </Row>
            <Row>
              <Text className="text-sm text-foreground">Minimum sit</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={minSitText}
                  onChangeText={setMinSitText}
                  onBlur={() => {
                    const val = Math.min(30, Math.max(1, parseInt(minSitText) || 5));
                    setMinSitText(String(val));
                    setSettings((s) => ({ ...s, minimumSitMinutes: val }));
                  }}
                  keyboardType="number-pad"
                  className="w-12 rounded-lg bg-muted px-2 py-1.5 text-sm text-foreground text-center"
                  maxLength={2}
                />
                <Text className="text-sm text-muted-foreground">min</Text>
              </View>
            </Row>
          </Section>

          {/* Warm-up */}
          <Section title="Warm-up countdown">
            <ToggleRow
              label="Enable warm-up"
              value={settings.warmUpEnabled}
              onChange={(v) => setSettings((s) => ({ ...s, warmUpEnabled: v }))}
            />
            {settings.warmUpEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Duration</Text>
                <View className="flex-row items-center gap-2">
                  {[5, 10, 15, 30].map((n) => (
                    <Chip
                      key={n}
                      active={settings.warmUpSeconds === n}
                      onPress={() => setSettings((s) => ({ ...s, warmUpSeconds: n }))}
                    >
                      {n}s
                    </Chip>
                  ))}
                </View>
              </Row>
            )}
          </Section>

          {/* Screen lock */}
          <Section title="During session">
            <ToggleRow
              label="Keep screen awake"
              value={settings.screenLockEnabled}
              onChange={(v) => setSettings((s) => ({ ...s, screenLockEnabled: v }))}
            />
            <Text className="px-1 text-xs text-muted-foreground">
              Prevents the screen from dimming or locking while meditating
            </Text>
          </Section>

          {/* Reminders */}
          <Section title="Reminders">
            <ToggleRow
              label="Morning reminder"
              value={reminders.morningEnabled}
              onChange={(v) => setReminders((r) => ({ ...r, morningEnabled: v }))}
            />
            {reminders.morningEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Time</Text>
                <TimePicker
                  value={reminders.morningTime}
                  onChange={(v) => setReminders((r) => ({ ...r, morningTime: v }))}
                />
              </Row>
            )}
            <ToggleRow
              label="Evening reminder"
              value={reminders.eveningEnabled}
              onChange={(v) => setReminders((r) => ({ ...r, eveningEnabled: v }))}
            />
            {reminders.eveningEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Time</Text>
                <TimePicker
                  value={reminders.eveningTime}
                  onChange={(v) => setReminders((r) => ({ ...r, eveningTime: v }))}
                />
              </Row>
            )}
          </Section>

          {/* Morning commitment */}
          <Section title="Morning commitment">
            <Row>
              <Text className="text-sm text-foreground">Tomorrow at</Text>
              <TimePicker
                value={commitment}
                onChange={setCommitment}
              />
            </Row>
          </Section>

          {/* Data */}
          {/* Data */}
          <Section title="Data">
            <Pressable onPress={() => router.push("/data-management")}>
              <GlassCard className="flex-row items-center justify-between px-5 py-4">
                <Text className="text-sm text-foreground">Manage data</Text>
                <ChevronRight color={colors.mutedForeground} size={16} />
              </GlassCard>
            </Pressable>
          </Section>

          <Text className="pb-4 text-center text-xs text-muted-foreground">Sit · v0.1</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
