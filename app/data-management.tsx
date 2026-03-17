import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Download, Upload, Trash2 } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { getData, updateData, resetData, initStore } from "../lib/store";
import { NoiseBackground } from "../components/NoiseBackground";
import { GlassCard } from "../components/GlassCard";
import { Section } from "../components/Section";
import { colors } from "../constants/theme";

function validateBackup(data: any): string | null {
  if (!data || typeof data !== "object") return "File is not a valid JSON object";
  if (!Array.isArray(data.sessions)) return "Missing or invalid 'sessions'";
  if (!data.dayRecords || typeof data.dayRecords !== "object") return "Missing or invalid 'dayRecords'";
  if (!data.settings || typeof data.settings !== "object") return "Missing or invalid 'settings'";
  if (!data.streak || typeof data.streak !== "object") return "Missing or invalid 'streak'";
  return null;
}

export default function DataManagementScreen() {
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  const handleExport = async () => {
    try {
      const data = getData();
      const json = JSON.stringify(data, null, 2);
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `sit-backup-${dateStr}.json`;

      // Try both directories
      const dirs = [FileSystem.documentDirectory, FileSystem.cacheDirectory].filter(Boolean) as string[];
      if (dirs.length === 0) {
        setStatus({ text: "Export failed — no writable directory available", error: true });
        return;
      }

      let fileUri = "";
      let written = false;
      for (const dir of dirs) {
        try {
          const sep = dir.endsWith("/") ? "" : "/";
          fileUri = dir + sep + fileName;
          await FileSystem.writeAsStringAsync(fileUri, json, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          // Verify the file was actually written
          const info = await FileSystem.getInfoAsync(fileUri);
          if (info.exists) {
            written = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!written) {
        setStatus({ text: "Export failed — could not write backup file", error: true });
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Sit App Backup",
        UTI: "public.json",
      });
      setStatus({ text: "Backup shared" });
    } catch (e: any) {
      if (e?.message?.includes("dismissed")) return;
      setStatus({ text: `Export failed — ${e?.message || "unknown error"}`, error: true });
    }
  };

  const handleImport = async () => {
    setStatus(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "*/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);

      let imported: any;
      try {
        imported = JSON.parse(content);
      } catch {
        setStatus({ text: "Import failed — file is not valid JSON", error: true });
        return;
      }

      const validationError = validateBackup(imported);
      if (validationError) {
        setStatus({ text: `Import failed — ${validationError}`, error: true });
        return;
      }

      const sessionCount = imported.sessions.length;
      const dayCount = Object.keys(imported.dayRecords).length;

      Alert.alert(
        "Import data",
        `This backup contains ${sessionCount} sessions across ${dayCount} days. Importing will replace all your current data. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              try {
                await updateData(() => imported);
                setStatus({ text: `Imported successfully — ${sessionCount} sessions, ${dayCount} days` });
              } catch (e: any) {
                setStatus({ text: `Import failed — ${e?.message || "unknown error"}`, error: true });
              }
            },
          },
        ]
      );
    } catch (e: any) {
      setStatus({ text: `Import failed — ${e?.message || "could not read file"}`, error: true });
    }
  };

  const handleErase = () => {
    Alert.alert(
      "Erase all data",
      "Are you sure? This will permanently delete all your meditation history, streaks, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase everything",
          style: "destructive",
          onPress: async () => {
            await resetData();
            await initStore();
            setStatus({ text: "All data erased" });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <NoiseBackground />
      <View className="flex-1 px-6" style={{ paddingTop: 16 }}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 mb-6"
        >
          <ArrowLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text
          className="text-foreground mb-6"
          style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 24 }}
        >
          Manage Data
        </Text>

        <View style={{ gap: 20 }}>
          <Section title="Backup">
            <Pressable onPress={handleExport}>
              <GlassCard className="flex-row items-center gap-3 px-5 py-4">
                <Download color={colors.accent} size={18} />
                <View>
                  <Text className="text-sm text-foreground">Export data</Text>
                  <Text className="text-xs text-muted-foreground">Share a backup via WhatsApp, email, etc.</Text>
                </View>
              </GlassCard>
            </Pressable>

            <Pressable onPress={handleImport}>
              <GlassCard className="flex-row items-center gap-3 px-5 py-4">
                <Upload color={colors.accent} size={18} />
                <View>
                  <Text className="text-sm text-foreground">Import data</Text>
                  <Text className="text-xs text-muted-foreground">Restore from a JSON backup file</Text>
                </View>
              </GlassCard>
            </Pressable>
          </Section>

          <Section title="Danger zone">
            <Pressable onPress={handleErase}>
              <GlassCard className="flex-row items-center gap-3 px-5 py-4">
                <Trash2 color={colors.destructive} size={18} />
                <View>
                  <Text className="text-sm text-destructive">Erase all data</Text>
                  <Text className="text-xs text-muted-foreground">Permanently delete everything</Text>
                </View>
              </GlassCard>
            </Pressable>
          </Section>
        </View>

        {status && (
          <Text
            className={`mt-4 text-center text-sm ${status.error ? "text-destructive" : "text-muted-foreground"}`}
          >
            {status.text}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
