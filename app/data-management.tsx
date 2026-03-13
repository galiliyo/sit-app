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
import { Section } from "../components/Section";
import { colors } from "../constants/theme";

export default function DataManagementScreen() {
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const data = getData();
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + "sit-backup.json";
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Sit data",
      });
      setStatus("Data exported successfully");
    } catch (e) {
      setStatus("Export failed");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const imported = JSON.parse(content);

      // Basic validation
      if (!imported.sessions || !imported.dayRecords || !imported.settings) {
        Alert.alert("Invalid file", "This doesn't look like a Sit backup file.");
        return;
      }

      Alert.alert(
        "Import data",
        "This will replace all your current data. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              await updateData(() => imported);
              setStatus("Data imported successfully");
            },
          },
        ]
      );
    } catch (e) {
      setStatus("Import failed — invalid file");
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
            setStatus("All data erased");
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
          style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 24 }}
        >
          Manage Data
        </Text>

        <Section title="Backup">
          <Pressable
            onPress={handleExport}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Download color={colors.accent} size={18} />
            <View>
              <Text className="text-sm text-foreground">Export data</Text>
              <Text className="text-xs text-muted-foreground">Save a JSON backup of all your data</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleImport}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Upload color={colors.accent} size={18} />
            <View>
              <Text className="text-sm text-foreground">Import data</Text>
              <Text className="text-xs text-muted-foreground">Restore from a backup file</Text>
            </View>
          </Pressable>
        </Section>

        <Section title="Danger zone">
          <Pressable
            onPress={handleErase}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Trash2 color={colors.destructive} size={18} />
            <View>
              <Text className="text-sm text-destructive">Erase all data</Text>
              <Text className="text-xs text-muted-foreground">Permanently delete everything</Text>
            </View>
          </Pressable>
        </Section>

        {status && (
          <Text className="mt-4 text-center text-sm text-muted-foreground">{status}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
