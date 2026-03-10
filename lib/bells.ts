import { Audio } from "expo-av";

export const BELL_OPTIONS = ["Root Chakra", "Heart Chakra", "None"] as const;
export type BellName = (typeof BELL_OPTIONS)[number];

const BELL_FILES: Record<string, any> = {
  "Root Chakra": require("../assets/sounds/bell-root.mp3"),
  "Heart Chakra": require("../assets/sounds/bell-heart.mp3"),
};

const soundCache: Record<string, Audio.Sound> = {};

async function getSound(name: string): Promise<Audio.Sound | null> {
  const source = BELL_FILES[name];
  if (!source) return null;
  if (!soundCache[name]) {
    const { sound } = await Audio.Sound.createAsync(source);
    soundCache[name] = sound;
  }
  return soundCache[name];
}

export async function playBell(name: string): Promise<void> {
  if (name === "None") return;
  const mapped = mapLegacyName(name);
  const sound = await getSound(mapped);
  if (!sound) return;
  await sound.setPositionAsync(0);
  await sound.playAsync();
}

export async function previewBell(name: string): Promise<void> {
  await playBell(name);
}

function mapLegacyName(name: string): string {
  if (name === "Kangsê" || name === "Om" || name === "HanChi") return "Root Chakra";
  if (name === "Tingsha") return "Heart Chakra";
  return name;
}

export async function configureAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
}
