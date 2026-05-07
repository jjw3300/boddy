import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayLog } from '../types/log';

const STORAGE_KEY = '@boddy:play_logs';

export async function getLogs(): Promise<PlayLog[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function getLog(id: string): Promise<PlayLog | null> {
  const logs = await getLogs();
  return logs.find(l => l.id === id) ?? null;
}

export async function saveLog(log: PlayLog): Promise<void> {
  const logs = await getLogs();
  const idx = logs.findIndex(l => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.unshift(log);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export async function deleteLog(id: string): Promise<void> {
  const logs = await getLogs();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(logs.filter(l => l.id !== id)),
  );
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
