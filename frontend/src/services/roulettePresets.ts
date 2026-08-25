import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@boddy:roulette_presets';

export interface RoulettePreset {
  id: string;
  name: string;
  items: string[];
}

export async function getPresets(): Promise<RoulettePreset[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function savePreset(preset: RoulettePreset): Promise<void> {
  const presets = await getPresets();
  const idx = presets.findIndex(p => p.id === preset.id);
  if (idx >= 0) {
    presets[idx] = preset;
  } else {
    presets.unshift(preset);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export async function deletePreset(id: string): Promise<void> {
  const presets = await getPresets();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(presets.filter(p => p.id !== id)));
}

export function generatePresetId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
