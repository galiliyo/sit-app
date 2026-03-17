import { NativeModule, requireNativeModule } from "expo-modules-core";

interface MorningBlockConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  dismissMode: "gentle" | "firm";
  blockedApps: string[]; // package names
  unlockedToday: boolean;
  streakCount: number;
}

interface MorningBlockModuleType extends NativeModule {
  configure(config: MorningBlockConfig): void;
  unlockForToday(): void;
  isAccessibilityEnabled(): Promise<boolean>;
  openAccessibilitySettings(): void;
  isOverlayEnabled(): Promise<boolean>;
  requestOverlayPermission(): void;
}

export default requireNativeModule<MorningBlockModuleType>("MorningBlock");
export type { MorningBlockConfig };
