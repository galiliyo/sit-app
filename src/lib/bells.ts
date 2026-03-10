// Bell audio playback using uploaded sound files

export const BELL_OPTIONS = ['Root Chakra', 'Heart Chakra', 'None'] as const;
export type BellName = (typeof BELL_OPTIONS)[number];

const BELL_FILES: Record<string, string> = {
  'Root Chakra': '/sounds/bell-root.mp3',
  'Heart Chakra': '/sounds/bell-heart.mp3',
};

// Cache Audio objects to avoid re-loading
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(name: string): HTMLAudioElement | null {
  const src = BELL_FILES[name];
  if (!src) return null;
  if (!audioCache[name]) {
    audioCache[name] = new Audio(src);
  }
  return audioCache[name];
}

export function playBell(name: string): void {
  if (name === 'None') return;
  // Map legacy bell names to new ones
  const mapped = mapLegacyName(name);
  const audio = getAudio(mapped);
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function previewBell(name: string): void {
  playBell(name);
}

function mapLegacyName(name: string): string {
  // Handle old bell names from existing settings
  if (name === 'Kangsê' || name === 'Om' || name === 'HanChi') return 'Root Chakra';
  if (name === 'Tingsha') return 'Heart Chakra';
  return name;
}
